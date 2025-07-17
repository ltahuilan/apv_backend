import nodemailer from 'nodemailer';

const emailResetPassword = async (data) => {

    const {name, email, token} = data;

    const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });

    const info = await transporter.sendMail({
        from: "APV notifications <notifications@apv.com>",
        to: email,
        subject: "Recupera tu password en APV",
        text: `Recupera tu password en APV con el siguiente enlace: ${process.env.FRONTEND_URL}forgot-password/${token}`,
        html:
        `<p>Hola <strong>${name}</strong>:</p>          
         <p>Puedes recuperar tu password con el siguiente enlace:</p>
         <a href="${process.env.FRONTEND_URL}/forgot-password/${token}">Recuperar password</a>
         <br>
         <p>Si tu no solicitaste este cambio, puedes ignorar este correo</p>
         <br>
         <p>Regards...</p>
         <strong>APV team</strong>
        `
    });

    console.log('Enviando email %s', info.messageId);
}

export default emailResetPassword;