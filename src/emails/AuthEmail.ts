import { transporter } from "../config/nodemailer";

interface IEmail 
{
    email: string;
    name: string;
    token: string;
}

export class AuthEmail 
{
    static senConfirmationEmail = async (user: IEmail) => {
        const info = await transporter.sendMail({
            from: 'UpTask <admin@uptask.com>',
            to: user.email,
            subject: 'Confirma tu Cuenta',
            text: 'confirma tu cuenta',
            html: `<p>Hola: ${user.name}, has creado tu cuenta en UpTask, ya casi esta todo listo, solo debes verificar tu cuenta</p>
            <p>Haz Click en el siguiente enlace para verificar tu cuenta</p>
            <a href="">Confirmar Cuenta</a>
            <p>E ingresa el el Código: <b>${user.token}</b></p>
            <p>Este Códibo Expira en: <b>10 Minutos</b>.</p>`
        });

        console.log('Mensaje enviado', info.messageId);
        
    }
}