import { transporter } from "../config/nodemailer";

interface IEmail 
{
    email: string;
    name: string;
    token: string;
}

export class AuthEmail 
{
    static sendConfirmationEmail = async (user: IEmail) => {
        const info = await transporter.sendMail({
            from: 'UpTask <admin@uptask.com>',
            to: user.email,
            subject: 'Confirma tu Cuenta',
            text: 'confirma tu cuenta',
            html: `<p>Hola: ${user.name}, has creado tu cuenta en UpTask, ya casi esta todo listo, solo debes verificar tu cuenta</p>
            <p>Haz Click en el siguiente enlace para verificar tu cuenta</p>
            <a href="${process.env.FRONTEND_URL}/auth/confirm-account">Confirmar Cuenta</a>
            <p>E ingresa el el Código: <b>${user.token}</b></p>
            <p>Este Código Expira en: <b>10 Minutos</b>.</p>`
        });

        console.log('Mensaje enviado', info.messageId);
        
    }

    static sendResetPwdEmail = async (user: IEmail) => {
        const info = await transporter.sendMail({
            from: 'UpTask <admin@uptask.com>',
            to: user.email,
            subject: 'Reestablece tu Contraseña',
            text: 'Reestablece tu Contraseña',
            html: `<p>Hola: ${user.name}, has solicitado reestablecer tu contraseña</p>
            <p>Haz Click en el siguiente enlace para para reestablecer tu contraseña</p>
            <a href="${process.env.FRONTEND_URL}/auth/new-password">Restablecer Contraseña</a>
            <p>E ingresa el el Código: <b>${user.token}</b></p>
            <p>Este Código Expira en: <b>10 Minutos</b>.</p>`
        });

        console.log('Mensaje enviado', info.messageId);
        
    }

    
}