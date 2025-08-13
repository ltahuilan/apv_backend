import express from 'express';
import isAutenticated from '../middlewares/isAuthenticated.js';
import {
    createPatient,
    getPatients,
    getAPatient,
    updatePatient,
    deletePatient
} from '../controllers/patientController.js';

const router = express.Router();

router.post('/create', isAutenticated, createPatient);
router.get('/get-patients', isAutenticated, getPatients);

router.get('/get-patient/:id', isAutenticated, getAPatient);
router.put('/update/:id', isAutenticated, updatePatient);
router.delete('/delete/:id', isAutenticated, deletePatient);

export default router;