import { NextResponse } from 'next/server';
import { MercadoPagoConfig, Preference } from 'mercadopago';
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";
import { prisma } from "../../../lib/prisma";
import { sendOrderConfirmation } from "../../../lib/mail";

// Initialize the client with the access token
const client = new MercadoPagoConfig({
    accessToken: process.env.MP_ACCESS_TOKEN || ''
});

export async function POST(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized. You must be signed in to purchase.' }, { status: 401 });
        }

        const body = await request.json();
        const { items, shipping } = body;

        if (!items || items.length === 0) {
            return NextResponse.json({ error: 'Cart is empty' }, { status: 400 });
        }

        if (!shipping || !shipping.name || !shipping.address || !shipping.city || !shipping.state || !shipping.phone) {
            return NextResponse.json({ error: 'Shipping information is incomplete' }, { status: 400 });
        }

        // Generate a unique and purely random order number (e.g. ORD-A8B9C1E2)
        const orderNumber = `ORD-${crypto.randomUUID().split('-')[0].toUpperCase()}`;

        // Optimistically deduct stock from database and build secure preference items
        const preferenceItems = [];
        let totalUsd = 0;
        let totalUy = 0;

        // Dynamically fetch live exchange rate from a public API
        let exchangeRateUsdToUyu = 40; // Fallback rate
        try {
            const rateRes = await fetch('https://open.er-api.com/v6/latest/USD', {
                next: { revalidate: 3600 } // Cache dynamically for 1 hour to prevent API rate limits
            });
            if (rateRes.ok) {
                const rateData = await rateRes.json();
                if (rateData?.rates?.UYU) {
                    exchangeRateUsdToUyu = rateData.rates.UYU;
                }
            }
        } catch (error) {
            console.error("Failed to fetch live exchange rate, using fallback", error);
        }

        for (const item of items) {
            try {
                const watchId = String(item.id);
                // Validate quantity to prevent negative stock injection
                const requestedQuantity = Math.max(1, parseInt(item.quantity) || 1);

                // Fetch real watch data from secure DB backend (Prevent Price Tampering)
                const dbWatch = await prisma.watch.findUnique({
                    where: { id: watchId }
                });

                if (!dbWatch) {
                    throw new Error(`Watch with id ${watchId} not found in database`);
                }

                if (dbWatch.stock < requestedQuantity) {
                    throw new Error(`Not enough stock for ${dbWatch.model}`);
                }

                // Deduct stock safely
                await prisma.watch.update({
                    where: { id: watchId },
                    data: {
                        stock: {
                            decrement: requestedQuantity
                        }
                    }
                });

                const EXCHANGE_RATE_USD_TO_UYU = exchangeRateUsdToUyu;
                const unitUsd = Number(dbWatch.priceValue) || 0;
                const unitUy = unitUsd * EXCHANGE_RATE_USD_TO_UYU;

                totalUsd += unitUsd * requestedQuantity;
                totalUy += unitUy * requestedQuantity;

                // Build MP item with 100% server-side authoritative pricing
                preferenceItems.push({
                    id: dbWatch.id,
                    title: `${dbWatch.brand} ${dbWatch.model}`,
                    description: `Luxury Timepiece - ${dbWatch.model}`,
                    picture_url: dbWatch.image,
                    category_id: 'watches',
                    quantity: requestedQuantity,
                    currency_id: 'UYU',
                    unit_price: unitUy, // SECURE: Uses DB price, converted USD to UYU
                });
            } catch (err) {
                console.warn(`Error processing item ${item.id} for checkout:`, err);
            }
        }

        if (preferenceItems.length === 0) {
            return NextResponse.json({ error: 'All requested items are out of stock or invalid' }, { status: 400 });
        }

        // Save order to the database
        const anyUser = session.user as any;
        const dbOrder = await prisma.order.create({
            data: {
                orderNumber,
                userId: anyUser?.id as string,
                shippingName: shipping.name,
                shippingAddress: shipping.address,
                shippingPhone: shipping.phone,
                shippingCity: shipping.city,
                shippingState: shipping.state,
                shippingZip: shipping.zip,
                totalAmount: totalUsd,
                items: preferenceItems,
                status: 'PENDING'
            }
        });

        // Send confirmation emails
        if (session.user?.email) {
            try {
                await sendOrderConfirmation(
                    session.user.email,
                    orderNumber,
                    shipping,
                    preferenceItems,
                    totalUy,
                    totalUsd
                );
            } catch (emailErr) {
                console.error("Failed to send order email:", emailErr);
            }
        }

        const preference = new Preference(client);

        const result = await preference.create({
            body: {
                items: preferenceItems,
                back_urls: {
                    success: `${new URL(request.url).origin}?status=success&order=${orderNumber}`,
                    failure: `${new URL(request.url).origin}?status=failure&order=${orderNumber}`,
                    pending: `${new URL(request.url).origin}?status=pending&order=${orderNumber}`,
                },
                auto_return: 'approved',
                external_reference: orderNumber,
            }
        });

        // Provide the generated checkout URL to the frontend
        return NextResponse.json({
            id: result.id,
            url: result.init_point
        });

    } catch (error) {
        console.error('Error creating Mercado Pago preference:', error);
        return NextResponse.json({ error: 'Failed to create checkout session' }, { status: 500 });
    }
}
