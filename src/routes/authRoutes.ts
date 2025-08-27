import { Router } from "express";
import { AuthController } from "../controllers/AuthController";
import { body, param } from "express-validator";
import { handleInputErrors } from "../middleware/validation";
import { authenticate } from "../middleware/auth";


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

router.post('/request-code',
    body('email').isEmail().withMessage('Correo no valido'),
    handleInputErrors,
    AuthController.resendCode
);

router.post('/forgot-password',
    body('email').isEmail().withMessage('Correo no valido'),
    handleInputErrors,
    AuthController.forgotPassword
);

router.post('/validate-token',
    body('token').notEmpty().withMessage('El Token es Requerido'),
    handleInputErrors,
    AuthController.validateToken
);

router.post('/update-password/:token',
    param('token').isNumeric().withMessage('Token No Válido'),
    body('password').isLength({ min: 8 }).withMessage('La contraseña debe tener al menos 8 caracteres'),
    body('password_confirmation').custom((value, { req }) => {
        if(value !== req.body.password)
        {
            throw new Error('La contraseña no coincide');
        }
        return true;
    }),
    handleInputErrors,
    AuthController.updatePassword
);

router.get('/user', authenticate, AuthController.user);

export default router;