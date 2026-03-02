import { NextResponse } from 'next/server';
import { prisma } from "../../../../lib/prisma";
import { sendOrderConfirmation } from "../../../../lib/mail";

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const origin = new URL(request.url).origin;

    // Mercado Pago forwards several params on success. The most important ones are:
    // status: should be "approved"
    // external_reference: the orderNumber we sent initially
    const status = searchParams.get('status');
    const orderNumber = searchParams.get('external_reference') || searchParams.get('order');

    if (!orderNumber || status !== 'approved') {
        return NextResponse.redirect(`${origin}/?status=failure`);
    }

    try {
        // Find the order along with its user
        const order = await prisma.order.findUnique({
            where: { orderNumber },
            include: { user: true }
        });

        if (!order) {
            return NextResponse.redirect(`${origin}/?status=failure`);
        }

        // Only process if the order hasn't been paid yet to avoid duplicate emails
        if (order.status === 'PENDING') {

            // 1. Reconstruct shipping object that the mail sender expects
            const shipping = {
                name: order.shippingName,
                address: order.shippingAddress,
                city: order.shippingCity,
                state: order.shippingState,
                zip: order.shippingZip,
                phone: order.shippingPhone,
            };

            const items: any = order.items;

            // Calculate totalUy since we don't store it explicitly (we store total USD)
            let totalUy = 0;
            if (Array.isArray(items)) {
                items.forEach(item => {
                    totalUy += (item.unit_price || 0) * (item.quantity || 1);
                });
            }

            // 2. Send confirmation emails before marking paid to ensure the buyer knows
            if (order.user?.email) {
                try {
                    await sendOrderConfirmation(
                        order.user.email,
                        order.orderNumber,
                        shipping,
                        items,
                        totalUy,
                        order.totalAmount
                    );
                } catch (emailErr) {
                    console.error("Failed to send order confirmation email inside success endpoint:", emailErr);
                }
            }

            // 3. Mark the order as PAID
            await prisma.order.update({
                where: { id: order.id },
                data: { status: 'PAID' }
            });
        }

        // 4. Redirect the user back to the homepage to see the success banner
        return NextResponse.redirect(`${origin}/?status=success&order=${orderNumber}`);
    } catch (error) {
        console.error("Error confirming payment on success callback:", error);
        return NextResponse.redirect(`${origin}/?status=failure`);
    }
}
