import jwt from "jsonwebtoken";

const generateJWT = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: "30 days",
        algorithm: 'HS512'
    });
}

export default generateJWT;