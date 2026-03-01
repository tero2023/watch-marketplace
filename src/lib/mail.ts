import nodemailer from "nodemailer";

export async function sendVerificationEmail(email: string, token: string, baseUrlUrl?: string) {
    let transporter;

    if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
        // Usa credenciales reales de correo (Gmail, SendGrid, etc.)
        transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: Number(process.env.SMTP_PORT) || 587,
            secure: Number(process.env.SMTP_PORT) === 465, // true para port 465, false para otros (587)
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
        });
    } else {
        // Para entornos de desarrollo sin credenciales reales (cuenta de prueba en Ethereal)
        const testAccount = await nodemailer.createTestAccount();
        transporter = nodemailer.createTransport({
            host: "smtp.ethereal.email",
            port: 587,
            secure: false,
            auth: {
                user: testAccount.user,
                pass: testAccount.pass,
            },
        });
    }

    const finalBaseUrl = baseUrlUrl || process.env.NEXTAUTH_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");
    const verifyUrl = `${finalBaseUrl}/api/verify?token=${token}`;

    const info = await transporter.sendMail({
        from: '"MICRON Timepieces" <noreply@micron-watches.com>', // dirección del remitente
        to: email, // lista de receptores
        subject: "Verifique su correo electrónico - MICRON", // Asunto
        text: `Por favor verifique su cuenta haciendo clic en el siguiente enlace: ${verifyUrl}`, // cuerpo en texto plano
        html: `
            <div style="font-family: sans-serif; background-color: #f4f4f4; padding: 40px; text-align: center;">
                <div style="max-width: 600px; margin: 0 auto; background: white; padding: 40px; border-radius: 8px; box-shadow: 0 4px 10px rgba(0,0,0,0.05);">
                    <h1 style="color: #C80000; letter-spacing: 0.1em; font-family: serif;">MICRON</h1>
                    <h2 style="color: #333; margin-bottom: 20px;">Verificación de Portafolio</h2>
                    <p style="color: #555; line-height: 1.6; margin-bottom: 30px;">
                        Gracias por solicitar acceso a nuestra exclusiva red de coleccionistas. Para completar la creación de su portafolio y verificar su identidad, por favor haga clic en el botón de abajo.
                    </p>
                    <a href="${verifyUrl}" style="background-color: #111; color: white; padding: 12px 30px; text-decoration: none; font-weight: bold; letter-spacing: 0.05em; text-transform: uppercase; font-size: 0.9rem; display: inline-block;">Verificar Correo</a>
                    <p style="color: #888; font-size: 0.8rem; margin-top: 30px;">
                        Si usted no solicitó esta cuenta, puede ignorar este correo pacíficamente.
                    </p>
                </div>
            </div>
        `,
    });

    console.log("Mensaje enviado: %s", info.messageId);

    // Solo muestra la URL de prueba de ethereal si se usó ethereal
    if (!process.env.SMTP_HOST) {
        console.log("Enlace de vista previa de correo (Ethereal): %s", nodemailer.getTestMessageUrl(info));
    }
}
