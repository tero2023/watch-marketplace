import { NextResponse } from 'next/server';
import { MercadoPagoConfig, Preference } from 'mercadopago';

// Initialize the client with the access token
const client = new MercadoPagoConfig({
    accessToken: process.env.MP_ACCESS_TOKEN || 'APP_USR-7530514088998188-022817-299f1faeebdbdec366ee98363aae1f01-2292323386' // Using a test token as fallback for demonstration
});

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { items } = body;

        if (!items || items.length === 0) {
            return NextResponse.json({ error: 'Cart is empty' }, { status: 400 });
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
            currency_id: 'USD',
            unit_price: item.price,
        }));

        const preference = new Preference(client);

        const result = await preference.create({
            body: {
                items: preferenceItems,
                back_urls: {
                    success: 'http://localhost:3000?status=success',
                    failure: 'http://localhost:3000?status=failure',
                    pending: 'http://localhost:3000?status=pending',
                },
                auto_return: 'approved',
                // External reference can be an internal order ID
                external_reference: `ORDER-${Date.now()}`,
            }
        });

        // Provide the generated checkout URL to the frontend
        return NextResponse.json({
            id: result.id,
            url: result.sandbox_init_point || result.init_point
        });

    } catch (error) {
        console.error('Error creating Mercado Pago preference:', error);
        return NextResponse.json({ error: 'Failed to create checkout session' }, { status: 500 });
    }
}
