import express from "express";
import isAutenticated from "../middlewares/isAuthenticated.js";
import {
    registerUser,
    confirmUser,
    loginUser,
    forgotPassword,
    verifyToken,
    resetPassword,
    getProfile,
    updateProfile
} from "../controllers/veterinarianController.js";


const router = express.Router();

//public routes
router.post('/', registerUser);
router.get('/confirm/:token', confirmUser);
router.post('/auth', loginUser);
router.post('/forgot-password', forgotPassword); //validar email del usuario y enviar token
router.get('/forgot-password/:token', verifyToken); //verificar el token
router.post('/forgot-password/:token', resetPassword); //obtener nuevo password

// router.route('/forgot-password/:token').get(verifyToken).post(resetPassword);

//private routes
router.get('/profile', isAutenticated, getProfile);
router.put('/profile/update/:id', isAutenticated, updateProfile);

export default router;