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

router.post('/', isAutenticated, createPatient);
router.get('/', isAutenticated, getPatients);

router.get('/:id', isAutenticated, getAPatient);
router.put('/:id', isAutenticated, updatePatient);
router.delete('/:id', isAutenticated, deletePatient);

export default router;