// src/middlewares/validate-services-hadassa05.middleware.js
const Joi = require('joi');
const { Types } = require('mongoose');

// ======================================================
// ESQUEMA DE VALIDACIÓN PARA CREAR (solo texto, sin imágenes)
// ======================================================
const createServiceSchema = Joi.object({
    title: Joi.string()
        .min(3)
        .max(100)
        .required()
        .messages({
            'string.min': 'Title must be at least 3 characters long',
            'string.max': 'Title must be at most 100 characters long',
            'any.required': 'Title is required'
        }),
    niche: Joi.string()
        .valid('event', 'legal')
        .required()
        .messages({
            'any.only': 'Niche must be "event" or "legal"',
            'any.required': 'Niche is required'
        }),
    category: Joi.array()
        .items(Joi.string())
        .min(1)
        .required()
        .messages({
            'array.min': 'At least one category is required',
            'any.required': 'Category is required'
        }),
    description: Joi.string()
        .min(10)
        .required()
        .messages({
            'string.min': 'Description must be at least 10 characters long',
            'any.required': 'Description is required'
        }),
    // ⭐ images se valida en el controlador (req.files)
    // ⭐ coverImage se valida en el controlador (req.files)
    details: Joi.object({
        items: Joi.array()
            .items(Joi.string())
            .min(1)
            .required()
            .messages({
                'array.min': 'At least one detail item is required',
                'any.required': 'Details items are required'
            }),
        badge: Joi.string()
            .allow('')
            .optional()
            .messages({
                'string.base': 'Badge must be a string'
            }),
        extraInfo: Joi.string()
            .allow('')
            .optional()
            .messages({
                'string.base': 'Extra info must be a string'
            }),
        variant: Joi.string()
            .valid('gold', 'primary', 'accent', 'default')
            .default('default')
            .messages({
                'any.only': 'Variant must be one of: gold, primary, accent, default'
            })
    }).required()
        .messages({
            'any.required': 'Details are required'
        }),
    isFeatured: Joi.boolean()
        .default(false)
        .optional()
        .messages({
            'boolean.base': 'isFeatured must be a boolean'
        })
});

// ======================================================
// ESQUEMA PARA ACTUALIZAR (todos opcionales)
// ======================================================
const updateServiceSchema = createServiceSchema.fork(
    Object.keys(createServiceSchema.describe().keys),
    (schema) => schema.optional()
).append({
    // ⭐ Prohibir campos que no se pueden actualizar
    _id: Joi.any().forbidden().messages({
        'any.unknown': 'You cannot modify the _id field manually'
    }),
    slug: Joi.any().forbidden().messages({
        'any.unknown': 'Slug is auto-generated, you cannot send it'
    }),
    createdAt: Joi.any().forbidden(),
    updatedAt: Joi.any().forbidden()
});

// ======================================================
// MIDDLEWARES DE VALIDACIÓN
// ======================================================
const validateServicesHadassa05 = {
    /**
     * Middleware para CREAR un servicio.
     * Valida solo los campos de texto. Las imágenes se validan en el controlador.
     */
    create: (req, res, next) => {
        const { error } = createServiceSchema.validate(req.body, { abortEarly: false });

        if (error) {
            const errors = error.details.map(detail => detail.message);
            return res.status(400).json({
                ok: false,
                type: 'ValidationError',
                messages: errors
            });
        }

        next();
    },

    /**
     * Middleware para ACTUALIZAR un servicio.
     * Todos los campos son opcionales. Prohíbe campos protegidos.
     */
    update: (req, res, next) => {
        // Si no hay body, error
        if (!req.body || Object.keys(req.body).length === 0) {
            return res.status(400).json({
                ok: false,
                type: 'ValidationError',
                message: 'No fields provided for update'
            });
        }

        const { error } = updateServiceSchema.validate(req.body, { abortEarly: false });

        if (error) {
            const errors = error.details.map(detail => detail.message);
            return res.status(400).json({
                ok: false,
                type: 'ValidationError',
                messages: errors
            });
        }

        next();
    },

    /**
     * Middleware para validar ID en parámetros.
     */
    id: (req, res, next) => {
        const { id } = req.params;

        if (!Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                ok: false,
                type: 'ValidationError',
                message: 'Invalid Hadassa05 Service ID format'
            });
        }

        next();
    }
};

module.exports = validateServicesHadassa05;