import { Router } from "express";
import { AuthController } from "../controllers/AuthController";
import { body } from "express-validator";
import { handleInputErrors } from "../middleware/validation";


const router = Router();

router.post('/create-account', 
    body('name').notEmpty().withMessage('El nombre es Requerido'),
    body('password').isLength({ min: 8 }).withMessage('La contraseña debe tener al menos 8 caracteres'),
    body('email').isEmail().withMessage('Correo no valido'),
    body('password_confirmation').custom((value, { req }) => {
        if(value !== req.body.password)
        {
            throw new Error('La contraseña no coincide');
        }
        return true;
    }),
    handleInputErrors,
    AuthController.createAccount
);

router.post('/confirm-account',
    body('token').notEmpty().withMessage('El Token es Requerido'),
    handleInputErrors,
    AuthController.confirmAccount
);

router.post('/login',
    body('email').isEmail().withMessage('Correo no valido'),
    body('password').notEmpty().withMessage('Contraseña Requerida'),
    handleInputErrors,
    AuthController.login
);

export default router;