import { NextResponse } from 'next/server';
import { MercadoPagoConfig, Preference } from 'mercadopago';
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";
import { prisma } from "../../../lib/prisma";

// Initialize the client with the access token
const client = new MercadoPagoConfig({
    accessToken: process.env.MP_ACCESS_TOKEN || 'APP_USR-4561814615999544-030110-4941f9fc70e554ad9ced83ea79b6ac17-3233058996'
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

        // Optimistically deduct stock from database
        for (const item of items) {
            // Find watch by ID
            // Depending on how items are stored, we assume item.id corresponds to database ID
            try {
                // Determine if item matches string ID (cuid). We seeded with numeric IDs initially? Wait, 1, 2, 3 as strings
                const watchId = String(item.id);

                await prisma.watch.update({
                    where: { id: watchId },
                    data: {
                        stock: {
                            decrement: item.quantity || 1
                        }
                    }
                });
            } catch (err) {
                console.warn(`Could not decrease stock for item ${item.id}`, err);
            }
        }

        // Format items for Mercado Pago Preference
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const preferenceItems = items.map((item: any) => ({
            id: item.id.toString(),
            title: `${item.brand} ${item.model}`,
            description: `Luxury Timepiece - ${item.model}`,
            picture_url: item.image,
            category_id: 'watches',
            quantity: item.quantity,
            currency_id: 'UYU',
            unit_price: item.price,
        }));

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
            url: result.sandbox_init_point
        });

    } catch (error) {
        console.error('Error creating Mercado Pago preference:', error);
        return NextResponse.json({ error: 'Failed to create checkout session' }, { status: 500 });
    }
}
