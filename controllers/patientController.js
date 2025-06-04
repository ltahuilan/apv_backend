import Patient from "../models/Patient.js";

const createPatient = async (req, res) => {
    const patient = new Patient(req.body);
    patient.veterinarian_id = req.veterinarian._id

    try {
        const patientSaved = await patient.save();
        return res.status(200).json(patientSaved);
    } catch (error) {
        console.log(error);
    }
}

const getPatients = async (req, res) => {

    const patients = await Patient.find().where('veterinarian_id').equals(req.veterinarian);
    res.json(patients);
}

const getAPatient = async (req, res) => {
    const {id} = req.params;
    const patient = await Patient.findById(id);
    
    if (!patient) {
        const error = new Error("Paciente no encontrado");
        return res.status(401).json({"message" : error});
    }

    //verificar si el paciente pertenece al veterinario autenticado, objectId a string toString()
    if (patient.veterinarian_id.toString() !== req.veterinarian._id.toString()) {
        const error = new Error("ocurrió un error no esperado");
        return res.status(401).json({"message" : error.message});
    }

    res.json(patient);
}
const updatePatient = async (req, res) => {}

const deletePatient = async (req, res) => {}

export {
    createPatient,
    getPatients,
    getAPatient,
    updatePatient,
    deletePatient
}

