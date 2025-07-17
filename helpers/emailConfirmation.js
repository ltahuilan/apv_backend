import nodemailer from 'nodemailer';

const emailConfirmation = async (data) => {

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
        subject: "Confirma tu cuenta en APV",
        text: `Confirma tu cuenta en APV con el siguiente enlace: ${process.env.FRONTEND_URL}/confirm/${token}`,
        html:
        `<p>Hola <strong>${name}</strong>:</p>          
         <p>Hemos registrado correctamente tu cuenta, para finalizar confirma tu email con el siguiente enlace:</p>
         <a href="${process.env.FRONTEND_URL}/confirm/${token}">Confirmar cuenta</a>
         <br>
         <p>Si tu no solicitaste este registro, puedes ignorar este correo</p>
         <br>
         <p>Regards...</p>
         <strong>APV team</strong>
        `
    });

    console.log('Enviando email %s', info.messageId);
}

export default emailConfirmation;