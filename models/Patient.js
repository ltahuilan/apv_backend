import mongoose from "mongoose";

const patientSchema = mongoose.Schema({
    petName: {
        type: String,
        require: true
    },
    petOwner: {
        type: String,
        require: true
    },
    email: {
        type: String,
        require: true
    },
    phone: {
        type: String,
        require: true
    },
    date: {
        type: Date,
        require: true,
        default: Date.now()
    },
    symptoms: {
        type: String,
        require: true
    },
    veterinarian_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Veterinarian"
    }
}, {
    timestamps: true
});


const Patient = mongoose.model('Patient', patientSchema);

export default Patient;
