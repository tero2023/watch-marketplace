import { NextResponse } from 'next/server';
import { MercadoPagoConfig, Preference } from 'mercadopago';
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";
import { prisma } from "../../../lib/prisma";

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
        const { items } = body;

        if (!items || items.length === 0) {
            return NextResponse.json({ error: 'Cart is empty' }, { status: 400 });
        }

        // Optimistically deduct stock from database and build secure preference items
        const preferenceItems = [];

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

                // Fixed Exchange Rate (You can connect this to a live API or DB variable later)
                const EXCHANGE_RATE_USD_TO_UYU = 40;

                // Build MP item with 100% server-side authoritative pricing
                preferenceItems.push({
                    id: dbWatch.id,
                    title: `${dbWatch.brand} ${dbWatch.model}`,
                    description: `Luxury Timepiece - ${dbWatch.model}`,
                    picture_url: dbWatch.image,
                    category_id: 'watches',
                    quantity: requestedQuantity,
                    currency_id: 'UYU',
                    unit_price: (Number(dbWatch.priceValue) || 0) * EXCHANGE_RATE_USD_TO_UYU, // SECURE: Uses DB price, converted USD to UYU
                });
            } catch (err) {
                console.warn(`Error processing item ${item.id} for checkout:`, err);
            }
        }

        if (preferenceItems.length === 0) {
            return NextResponse.json({ error: 'All requested items are out of stock or invalid' }, { status: 400 });
        }

        const preference = new Preference(client);

        const result = await preference.create({
            body: {
                items: preferenceItems,
                back_urls: {
                    success: `${new URL(request.url).origin}?status=success`,
                    failure: `${new URL(request.url).origin}?status=failure`,
                    pending: `${new URL(request.url).origin}?status=pending`,
                },
                auto_return: 'approved',
                // External reference can be an internal order ID
                external_reference: `ORDER-${Date.now()}`,
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
