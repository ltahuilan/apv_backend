import Patient from "../models/Patient.js";

const createPatient = async (req, res) => {

    if (req.body._id === null) {
        delete req.body._id
    }

    const patient = new Patient(req.body);
    patient.veterinarian_id = req.veterinarian._id

    try {
        const patientSaved = await patient.save();

        console.log(patientSaved)
        const patienSavedToObject = patientSaved.toObject();
        console.log(patienSavedToObject);

        return res.status(200).json(patientSaved);
    } catch (error) {
        console.log(error);
    }
}

const getPatients = async (req, res) => {
    const patients = await Patient.find().where('veterinarian_id').equals(req.veterinarian);
    return res.json(patients);
}

const getAPatient = async (req, res) => {
    const {id} = req.params;
    const patient = await Patient.findById(id);
    
    if (!patient) {
        const error = new Error("No se ha localizado el recurso solicitado");
        return res.status(403).json({"message" : error});
    }

    //verificar si el paciente pertenece al veterinario autenticado, objectId a string toString()
    if (patient.veterinarian_id.toString() !== req.veterinarian._id.toString()) {
        const error = new Error("Sin autorización para acceder al recurso solicitado");
        return res.status(401).json({"message" : error.message});
    }

    res.json(patient);
}
const updatePatient = async (req, res) => {

    //leer el id desde el request
    const {id} = req.params;
    console.log(req.params);

    //buscar el paciente
    const patient = await Patient.findById(id);

    //si no existe el paciente mostrar mensaje de error
    if(!patient) {
        const error = new Error("No se ha localizado el recurso solicitado");
        return res.status(403).json({"message" : error.message});
    }

    //verificar si el paciente pertenece al vetarinario autenticado
    if(patient.veterinarian_id.toString() !== req.veterinarian._id.toString()) {
        const error = new Error("Sin autorización para acceder al recurso solicitado");
        return res.status(401).json({"message" : error.message});
    }

    //editar paciente
    patient.petName = req.body.petName || patient.petName;
    patient.petOwner = req.body.petOwner || patient.petOwner;
    patient.email = req.body.email || patient.email;
    patient.phone = req.body.phone || patient.phone;
    patient.symptoms = req.body.symptoms || patient.symptoms;

    try {
        const patientUpdated = await patient.save();
        return res.status(200).json(patientUpdated);

    }catch(error) {
        console.log(error);
    }
}

const deletePatient = async (req, res) => {
    const {id} = req.params;
    const patient = await Patient.findById(id);

    if(!patient) {
        const error = new Error("No se ha localizado el recurso solicitado");
        return res.status(403).json({"message" : error.message});
    }

    //verificar si el paciente pertenece al vetarinario autenticado
    if(patient.veterinarian_id.toString() !== req.veterinarian._id.toString()) {
        const error = new Error("Sin autorización para acceder al recurso solicitado");
        return res.status(401).json({"message" : error.message});
    }

    try {
        await patient.deleteOne();
        return res.status(200).json({"message" : "Paciente eliminado exitosamente"});
    } catch (error) {
        return res.status(500).json({"message" :  "Ha ocurrido un error: " + error.message});
    }

}

export {
    createPatient,
    getPatients,
    getAPatient,
    updatePatient,
    deletePatient
}

