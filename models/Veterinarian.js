import mongoose from "mongoose";
import bcrypt from "bcrypt";
import generateToken from "../helpers/generateToken.js";

const veterinarianSchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    password: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    phone: {
        type: String,
        default: null,
        trim: true
    },
    web: {
        type: String,
        default: null,
        trim: true
    },
    token: {
        type: String,
        default: generateToken
    },
    confirm: {
        type: Boolean,
        default: false
    }
},{
    timestamps: true
});

//Antes de guardar hashear sustituir el password
veterinarianSchema.pre('save', async function (next) {
    // console.log('Ejecutando .pre("save")');
    if(!this.isModified('password')) {
        return next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

veterinarianSchema.methods.matchPassword = async function(passwordToVerify) {
    return await bcrypt.compare(passwordToVerify, this.password);
}

const Veterinarian = mongoose.model('Veterinarian', veterinarianSchema);

export default Veterinarian;