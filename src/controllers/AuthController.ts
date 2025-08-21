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
            AuthEmail.senConfirmationEmail({
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
                AuthEmail.senConfirmationEmail({
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
            res.status(500).json({ error: 'Ocurrio un Error al Crear la Cuenta' });
        }
    }
}