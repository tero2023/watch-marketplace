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
                    brand: "Rolex",
                    model: "Cosmograph Daytona",
                    price: "$45,000",
                    priceValue: 45000,
                    image: "https://images.unsplash.com/photo-1523170335258-f5ed11844a49?q=80&w=800&auto=format&fit=crop",
                    tag: "Icónico",
                    stock: 1
                }
            ];

            await prisma.watch.createMany({
                data: initialWatches
            });

            watches = await prisma.watch.findMany();
        }

        return NextResponse.json(watches);
    } catch (error) {
        console.error("Failed to fetch watches:", error);
        return NextResponse.json({ error: "No se pudieron obtener los relojes" }, { status: 500 });
    }
}
