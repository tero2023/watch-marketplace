import nodemailer from "nodemailer";

export async function sendVerificationEmail(email: string, token: string) {
    // Para entornos de desarrollo (crea una cuenta de prueba gratuita en Ethereal Email)
    const testAccount = await nodemailer.createTestAccount();

    const transporter = nodemailer.createTransport({
        host: "smtp.ethereal.email",
        port: 587,
        secure: false, // true para 465, false para otros puertos
        auth: {
            user: testAccount.user, // usuario generado por ethereal
            pass: testAccount.pass, // contraseña generada por ethereal
        },
    });

    const verifyUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/verify?token=${token}`;

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
    console.log("Enlace de vista previa de correo (Ethereal): %s", nodemailer.getTestMessageUrl(info));
}
