import mongoose from "mongoose";

const patientSchema = mongoose.Schema({
    petName: {
        type: String,
        required: true,
        trim: true
    },
    namePetOwner: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        trim: true
    },
    phone: {
        type: String,
        required: true,
        trim: true
    },
    date: {
        type: Date,
        required: true,
        default: Date.now()
    },
    symptoms: {
        type: String,
        required: true,
        trim: true
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
