import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const token = searchParams.get("token");

        if (!token) {
            return NextResponse.json(
                { message: "Falta el token de verificación" },
                { status: 400 }
            );
        }

        const user = await prisma.user.findFirst({
            where: { verifyToken: token }
        });

        if (!user) {
            return NextResponse.json(
                { message: "El token es inválido o ya fue utilizado" },
                { status: 404 }
            );
        }

        await prisma.user.update({
            where: { id: user.id },
            data: {
                emailVerified: new Date(),
                verifyToken: null
            }
        });

        // Redirigir al usuario al inicio de sesión con un mensaje de éxito
        return NextResponse.redirect(new URL("/signin?verified=true", req.url));

    } catch (error) {
        console.error("Verification error:", error);
        return NextResponse.json(
            { message: "Un error ocurrió durante la verificación" },
            { status: 500 }
        );
    }
}
