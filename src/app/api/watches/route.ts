import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        let watches = await prisma.watch.findMany();

        if (watches.length === 0) {
            // Seed the database if it's empty
            const initialWatches = [
                {
                    id: "1",
                    brand: "Seiko",
                    model: 'Presage "Cocktail Time"',
                    price: "$595",
                    priceValue: 595,
                    image: "/images/seiko.png",
                    tag: "Artesanal",
                    stock: 1
                },
                {
                    id: "2",
                    brand: "Seiko",
                    model: "Prospex PADI Diver",
                    price: "$650",
                    priceValue: 650,
                    image: "/images/seiko_prospex_original.jpg",
                    tag: "Edición Especial",
                    stock: 1
                },
                {
                    id: "3",
                    brand: "Seiko Mod",
                    model: "Stealth Diver Custom",
                    price: "$750",
                    priceValue: 750,
                    image: "/images/seiko_stealth.jpg",
                    tag: "Único",
                    stock: 1
                }
            ];

            await prisma.watch.createMany({
                data: initialWatches
            });

            watches = await prisma.watch.findMany();
        }

        // Migrate live production DB from Rolex to Seiko Stealth if necessary
        const thirdWatch = watches.find((w: any) => w.id === "3");
        if (thirdWatch && thirdWatch.brand === "Rolex") {
            await prisma.watch.update({
                where: { id: "3" },
                data: {
                    brand: "Seiko Mod",
                    model: "Stealth Diver Custom",
                    price: "$750",
                    priceValue: 750,
                    image: "/images/seiko_stealth.jpg",
                    tag: "Único",
                    stock: 1
                }
            });
            watches = await prisma.watch.findMany();
        }

        return NextResponse.json(watches);
    } catch (error) {
        console.error("Failed to fetch watches:", error);
        return NextResponse.json({ error: "No se pudieron obtener los relojes" }, { status: 500 });
    }
}
