import jwt from "jsonwebtoken";

const generateJWT = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        algorithm: 'HS512', // Especifica el algoritmo HS512
        expiresIn: '24h',   // El token expirará en 24 horas
    });
}

export default generateJWT;