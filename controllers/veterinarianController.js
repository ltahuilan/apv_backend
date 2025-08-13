import Veterinarian from "../models/Veterinarian.js";
import generateJWT from "../helpers/generateJWT.js";
import generateToken from "../helpers/generateToken.js";
import emailConfirmation from "../helpers/emailConfirmation.js";
import emailResetPassword from "../helpers/emailResetPassword.js";

/**
 * Registrar nuevo usuario veterinario
 */
const registerUser = async (req, res) => {
    const { name, email, password } = req.body;

    //validación básica
    if(!name || !email || !password) {
        return res.status(400).json({ "message" : "Todos los campos son requeridos" });
    }
    
    try {
        //verificar si un usuario ya existe
        const veterinarianExists = await Veterinarian.findOne({ email });
    
        if(veterinarianExists) {
            const error = new Error(`El usuario <${email}> ya esta en uso`);
            return res.status(400).json({"message" : error.message});
        }

        //crear una instancia del modelo
        const newVeterinarian = new Veterinarian(req.body);

        //guardar un nuevo usuario
        const veterinarian = await newVeterinarian.save();

        //enviar email de confirmación
        emailConfirmation({
            name,
            email,
            token: veterinarian.token
        });

        if(veterinarian) {
            return res.status(200).json({"message" : "Usuario creado correctamente"});
        }
    } catch (error) {
        console.log(`Error al intentar registrar un nuevo veterinario: ${error}`);
        res.status(500).json({
            "message" : "Error del servidor al intentar registrar el usuario",
            "Error" : error.message
        });
    }
}


const confirmUser = async (req, res) => {
    const {token} = req.params;
    const veterinarian = await Veterinarian.findOne({ token });

    //si no se encuentra un usuario con el token
    if(!veterinarian) {
        const error = new Error("Usuario no encontrado o token no valido");
        return res.status(401).json({"message" : error.message});
    }

    try {
        //borrar el token
        veterinarian.token = null;
        //cambiar confirm a true
        veterinarian.confirm = true
        const response = await veterinarian.save();
        return res.status(200).json({"message" : "Usuario confirmado correctamente"});
    } catch (error) {
        console.log(error);
    }
}

const loginUser = async (req, res) => {

    const { email, password } = req.body;

    //validación básica
    if(!email || !password) {
        return res.status(400).json({ "message" : "Todos los campos son requeridos" });
    }
    
    try {
    
        const user = await Veterinarian.findOne({ email });
        
        //verificar si el usuario existe
        if( !user) {
            const error = new Error("El usuario no existe");         
            return res.status(401).json({"message" : error.message});
        }

        //valida si esta confirmado
        if(!user.confirm ) {
            const error = new Error("El usuario no esta confirmado, hemos enviado nuevamente un correo para confirmar la cuenta");
            //enviar email de confirmación
            emailConfirmation({
                name: user.name,
                email,
                token: user.token
            });         
            return res.status(401).json({"message" : error.message});
        }

        //verificar si el password es correcto
        if( !(await user.matchPassword(password) ) ) {
            const error = new Error("Las credenciales son incorrectas");
            return res.status(401).json({"message" : error.message});
        }

        return res.status(200).json({
            "_id" : user._id,
            "name" : user.name,
            "email" : user.email,
            "token" : generateJWT(user.id)
        });

    } catch (error) {
        // console.error("Ocurrió un error durante la autenticación.. ", error);
        return res.status(500).json({"message" : error.message, error: true});
    }
}

const forgotPassword = async (req, res) => {
    
    const {email} = req.body;
    const veterinarian = await Veterinarian.findOne({ email });

    if(!email) {
        const error = new Error("El email es requerido [desde backend]");
        return res.status(400).json({"message" : error.message});
    }

    if(!veterinarian || !veterinarian.confirm ) {
        const error = new Error("Usuario no existe o no ha sido confirmado... [desde backend]");
        return res.status(401).json({ "message" : error.message });
    }

    //si el usuario existe: generar nuevo token
    try {
        veterinarian.token = generateToken();
        await veterinarian.save();
        emailResetPassword({
            email,
            name: veterinarian.name,
            token: veterinarian.token
        });
        return res.status(200).json({"message" : "Se han enviado instrucciones a tu correo... [desde backend]"});
        
    } catch (error) {
        console.log(error);
    }   
}

const verifyToken = async (req, res) => {
    const { token } = req.params;

    const veterinarian = await Veterinarian.findOne({ token });
    
    //verificar si el token pertenece a un usuario y esta confirmado
    if(!veterinarian || !veterinarian.confirm) {
        const error = new Error("Token no valido o usuario no confirmado");
        return res.status(401).json({ "message" : error.message });
    }
    return res.json({ "message" : "Ingresa tu nuevo password"});
}

const resetPassword = async (req, res) => {
    const { password } = req.body;
    const { token } = req.params;

    //verificar si el token pertenece a un usuario y esta confirmado
    const veterinarian = await Veterinarian.findOne({ token });
    if(!veterinarian || !(veterinarian.confirm) ) {
        const error = new Error("Ha ocurrido un error");
        return res.status(401).json({ "message" : error.message });
    }

    try {
        //reset al token
        veterinarian.token = null;
        //sobreescribir el password
        veterinarian.password = password //el pre("save) del modelo hashea el password
        //guardar cambios 
        veterinarian.save();
        return res.status(200).json({"message" : "Password actualizado exitosamente..."});
    }catch (error) {
        return res.status(500).json({"message" : error.message});
    }
}

const getProfile = (req, res) => {
    const {veterinarian} = req;
    return res.json(veterinarian)
}

const updateProfile = async (req, res) => {
    const {id} = req.params
    const veterinarian = await Veterinarian.findById(id);
    
    if (!veterinarian) {
        const error = new Error("Ha ocurrido un error");
        return res.estatus(404).json({"message": error.message});
    }

    //validar si el email existe en la base de datos
    if(veterinarian.email !== req.body.email) {
        const {email} = req.body;
        const emailExists = await Veterinarian.findOne({email});
        
        if (emailExists) {
            const error = new Error("El email ya existe");
            return res.status(409).json({"message": error.message});
        }
    }

    try {
        veterinarian.name = req.body.name;
        veterinarian.email = req.body.email;
        veterinarian.phone = req.body.phone;
        veterinarian.web = req.body.web;
        const updatedVeterinarian = await veterinarian.save();
        res.json(updatedVeterinarian);
    } catch (error) {
        console.log(error);
        return {message: error.response.data.message}
    }
}


export {
    registerUser,
    confirmUser,
    loginUser,
    forgotPassword,
    verifyToken,
    resetPassword,
    getProfile,
    updateProfile
}

/**
 * ERRORES HTTP
 * 401 - las credenciales no son válidas
 * 403 - similar a 401, cliente autenticado pero sin permisos para un recurso específico
 * 409 - solicitud no completada debido a un conflicto en el estado actual (usuario ya existe)
*/