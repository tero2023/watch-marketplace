const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
    const email = process.argv[2];

    if (!email) {
        console.error("Por favor ingresa un email: node makeAdmin.js <email>");
        process.exit(1);
    }

    try {
        const user = await prisma.user.update({
            where: { email },
            data: { role: 'ADMIN' },
        });

        console.log(`¡Éxito! El usuario ${user.email} ahora tiene rol ADMIN.`);
    } catch (error) {
        console.error("Error al actualizar el usuario (asegúrate de que el email existe):", error.message);
    } finally {
        await prisma.$disconnect();
    }
}

main();
