// middleware/auth.middleware.js - Hadassa (versión MRN)
const jwt = require("jsonwebtoken");
const Users = require("../models/users.model"); // ⭐ Importar el modelo de Hadassa

const authMiddleware = async (req, res, next) => {
    // ⭐ Obtener el token desde la cookie (como en MRN)
    const token = req.cookies.token;

    // Verificar que exista la cookie
    if (!token) {
        return res.status(401).json({
            ok: false,
            type: 'NoTokenProvided',
            data: null,
            message: 'No autorizado: Token no proporcionado'
        });
    }

    try {
        // Verificar el JWT
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // ⭐ Buscar el usuario en la base de datos (como en MRN)
        const user = await Users.findById(decoded.id);

        // Verificar que exista y esté activo
        if (!user || user.active === false) {
            return res.status(401).json({
                ok: false,
                type: 'UserStatusError',
                data: null,
                message: 'El usuario no existe o está deshabilitado'
            });
        }

        // Guardar los datos del token para los siguientes middlewares
        req.user = decoded;

        next();

    } catch (error) {
        console.error('❌ Error en AUTH:', error.message);
        return res.status(401).json({
            ok: false,
            type: 'InvalidToken',
            data: null,
            message: 'Token no válido o Token caducado'
        });
    }
};

module.exports = authMiddleware;