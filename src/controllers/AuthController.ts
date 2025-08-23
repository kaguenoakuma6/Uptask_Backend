import type { Request, Response} from 'express';

import User from '../models/User';
import { checkPassword, hashPassword } from '../utils/auth';
import Token from '../models/Token';
import { generateToken } from '../utils/token';
import { transporter } from '../config/nodemailer';
import { AuthEmail } from '../emails/AuthEmail';

export class AuthController 
{
    static createAccount = async (req: Request, res: Response) => {
        try {

            const { password, email } = req.body;
            const exist = await User.findOne({email});

            if(exist)
            {
                const error = new Error('El Usuario ya Existe');
                return res.status(409).json({error: error.message});
            }

            const user = new User(req.body);

            // Generar el Hash del password
            user.password = await hashPassword(password);

            // Generar token
            const token = new Token();
            token.token = generateToken();
            token.user = user.id;

            // Eviar Email
            AuthEmail.sendConfirmationEmail({
                email: user.email,
                name: user.name,
                token: token.token
            });

            await Promise.allSettled([user.save(), token.save()]);
            
            res.send('Cuenta Creada Correctamente!');

        } 
        catch (error) 
        {
            res.status(500).json({ error: 'Ocurrio un Error al Crear la Cuenta' });
        }
    }

    static confirmAccount = async (req: Request, res: Response) => {
        try 
        {
            const { token } = req.body;

            const tokenBD = await Token.findOne({token});

            if(!tokenBD)
            {
                const error = new Error('Token No Valido');
                return res.status(404).json({error: error.message});
            }

            const userBD = await User.findById(tokenBD.user);
            userBD.confirmed = true;

            await Promise.allSettled([userBD.save(), tokenBD.deleteOne()]);
            res.send('Cuenta Confirmada!');

        } 
        catch (error) 
        {
            res.status(500).json({ error: 'Ocurrio un Error al Confirmar la Cuenta' });
        }
    }

    static login = async (req: Request, res: Response) => {
        try 
        {
            const {email, password } = req.body;
            const userBD = await User.findOne({email});

            if(!userBD)
            {
                const error = new Error('Cuenta No Existe');
                return res.status(404).json({error: error.message});
            }

            if(!userBD.confirmed)
            {
                const token = new Token();
                token.user = userBD.id;
                token.token = generateToken();

                await token.save();

                // Eviar Email
                AuthEmail.sendConfirmationEmail({
                    email: userBD.email,
                    name: userBD.name,
                    token: token.token
                });

                const error = new Error('Cuenta No Confirmada, se ha enviado un código de confirmación por correo!!');
                return res.status(401).json({error: error.message});
            }

            const confirmPass = await checkPassword(password, userBD.password);

            if(!confirmPass)
            {
                const error = new Error('Contraseña Incorrecta');
                return res.status(401).json({error: error.message});
            }

            res.send('Autenticacion correcta');
            
        } 
        catch (error) 
        {
            res.status(500).json({ error: 'Ocurrio un Error al Autenticar' });
        }
    }

    static resendCode = async (req: Request, res: Response) => {
        try {

            const { email } = req.body;
            const userBD = await User.findOne({email});

            if(!userBD)
            {
                const error = new Error('El Usuario No Existe');
                return res.status(404).json({error: error.message});
            }

            if(userBD.confirmed)
            {
                const error = new Error('El Usuario Ya ha Sido Confirmado!!');
                return res.status(403).json({error: error.message});
            }

            // Generar token
            const token = new Token();
            token.token = generateToken();
            token.user = userBD.id;

            await token.save();

            // Eviar Email
            AuthEmail.sendConfirmationEmail({
                email: userBD.email,
                name: userBD.name,
                token: token.token
            });

            res.send('Token Enviado Correctamente!');

        } 
        catch (error) 
        {
            res.status(500).json({ error: 'Ocurrio un Error al Reenviar el Token' });
        }
    }

    static forgotPassword = async (req: Request, res: Response) => {
        try {

            const { email } = req.body;
            const userBD = await User.findOne({email});

            if(!userBD)
            {
                const error = new Error('El Usuario No Existe');
                return res.status(404).json({error: error.message});
            }

            // Generar token
            const token = new Token();
            token.token = generateToken();
            token.user = userBD.id;

            await token.save();

            // Eviar Email
            AuthEmail.sendResetPwdEmail({
                email: userBD.email,
                name: userBD.name,
                token: token.token
            });

            res.send('Revisa tu Email y sigue las instrucciones');

        } 
        catch (error) 
        {
            res.status(500).json({ error: 'Ocurrio un Error al Enviar el token Para Reestablecer la Contraseña' });
        }
    }

    static validateToken = async (req: Request, res: Response) => {
        try 
        {
            const { token } = req.body;

            const tokenBD = await Token.findOne({token});

            if(!tokenBD)
            {
                const error = new Error('Token No Valido');
                return res.status(404).json({error: error.message});
            }

            res.send('Token Válido, Captura tu Nueva Contraseña!');
        } 
        catch (error) 
        {
            res.status(500).json({ error: 'Ocurrio un Error al Validar el Token!!' });
        }
    }

    static updatePassword = async (req: Request, res: Response) => {
        try 
        {
            const { token } = req.params;

            const tokenBD = await Token.findOne({token});

            if(!tokenBD)
            {
                const error = new Error('Token No Valido');
                return res.status(404).json({error: error.message});
            }

            const userBD = await User.findById(tokenBD.user);
            userBD.password = await hashPassword(req.body.password);

            await Promise.allSettled([userBD.save(), tokenBD.deleteOne()]);

            res.send('Contraseña Actualizada Correctamente!');
        } 
        catch (error) 
        {
            res.status(500).json({ error: 'Ocurrio un Error al Validar el Token!!' });
        }
    }
}