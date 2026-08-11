const isAdminMiddleware = (req, res, next) => {
    // Verificar que el usuario esté autenticado
    if (!req.user) {
        return res.status(401).json({
            ok: false,
            type: 'UnauthorizedError',
            data: null,
            message: 'No autenticado: Se requiere iniciar sesión'
        });
    }

    // ⭐ PERMITIR TANTO 'admin' COMO 'super-admin' (si existe en Hadassa)
    // Si Hadassa solo tiene 'admin', puedes dejar solo esa validación
    if (req.user.role !== 'admin' && req.user.role !== 'super-admin') {
        return res.status(403).json({
            ok: false,
            type: 'ForbiddenError',
            data: null,
            message: 'Acceso denegado: Se requieren permisos de administrador'
        });
    }

    next();
};

module.exports = isAdminMiddleware;