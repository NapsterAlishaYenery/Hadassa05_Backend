// src/middleware/gallery-validator.middleware.js
const Joi = require('joi');

// ======================================================
// ESQUEMA DE VALIDACIÓN PARA EL BODY (SOLO TEXTOS)
// ======================================================

const createGallerySchema = Joi.object({
    title: Joi.string()
        .min(3)
        .max(100)
        .required()
        .messages({
            'string.min': 'Title must be at least 3 characters long',
            'string.max': 'Title must be at most 100 characters long',
            'any.required': 'Title is required'
        }),
    description: Joi.string()
        .min(10)
        .required()
        .messages({
            'string.min': 'Description must be at least 10 characters long',
            'any.required': 'Description is required'
        }),
    niche: Joi.string()
        .valid('event')
        .default('event')
        .messages({
            'any.only': 'Niche must be "event"'
        }),
    eventType: Joi.string()
        .required()
        .messages({
            'any.required': 'Event type is required'
        }),
    client: Joi.string()
        .required()
        .messages({
            'any.required': 'Client name is required'
        }),
    eventDate: Joi.date()
        .required()
        .messages({
            'any.required': 'Event date is required',
            'date.base': 'Event date must be a valid date'
        }),
    location: Joi.string()
        .allow('')
        .default('')
        .messages({
            'string.base': 'Location must be a string'
        }),
    isFeatured: Joi.boolean().default(false),
    isPublic: Joi.boolean().default(true)
});

// ======================================================
// NUEVOS ESQUEMAS DE VALIDACIÓN (Agregar después de lo que ya tienes)
// ======================================================

// Para reordenar imágenes
const reorderSchema = Joi.object({
    order: Joi.array()
        .items(Joi.number().integer().min(0))
        .required()
        .messages({
            'array.base': 'Order must be an array of numbers',
            'any.required': 'Order array is required'
        })
});

// Para cambiar la imagen de portada
const coverImageSchema = Joi.object({
    mediaIndex: Joi.number()
        .integer()
        .min(0)
        .required()
        .messages({
            'number.base': 'mediaIndex must be a number',
            'number.min': 'mediaIndex must be 0 or greater',
            'any.required': 'mediaIndex is required'
        })
});

// ======================================================
// ESQUEMA PARA ACTUALIZAR (todos opcionales)
// ======================================================

const updateGallerySchema = createGallerySchema.fork(
    Object.keys(createGallerySchema.describe().keys),
    (schema) => schema.optional()
);

// ======================================================
// MIDDLEWARES DE VALIDACIÓN
// ======================================================

const validateGallery = {
    /**
     * Middleware para CREAR un evento en la galería.
     * Exige todos los campos obligatorios.
     */
    create: (req, res, next) => {
        const { error } = createGallerySchema.validate(req.body, { abortEarly: false });

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
     * Middleware para ACTUALIZAR un evento en la galería.
     * Todos los campos son opcionales.
     */
    update: (req, res, next) => {
        const finalUpdateSchema = updateGallerySchema.append({
            _id: Joi.any().forbidden().messages({
                'any.unknown': 'You cannot modify the _id field manually'
            }),
            slug: Joi.any().forbidden().messages({
                'any.unknown': 'Slug is auto-generated, you cannot send it'
            }),
            createdAt: Joi.any().forbidden(),
            updatedAt: Joi.any().forbidden()
        });

        const { error } = finalUpdateSchema.validate(req.body, { abortEarly: false });

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
     * Middleware para validar que el ID existe (para rutas con parámetros)
     */
    validateId: (req, res, next) => {
        const { id } = req.params;

        if (!id || !id.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).json({
                ok: false,
                type: 'ValidationError',
                message: 'Invalid ID format. Must be a 24-character hex string.'
            });
        }

        next();
    },
    /**
     * Middleware para REORDENAR imágenes.
     * Valida que el body tenga un array 'order' con números.
     */
    reorder: (req, res, next) => {
        const { error } = reorderSchema.validate(req.body, { abortEarly: false });

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
     * Middleware para ACTUALIZAR COVER IMAGE.
     * Valida que el body tenga 'mediaIndex' como número.
     */
    coverImage: (req, res, next) => {
        const { error } = coverImageSchema.validate(req.body, { abortEarly: false });

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
     * Middleware para validar que mediaIndex en la URL es un número válido.
     */
    validateMediaIndex: (req, res, next) => {
        const { mediaIndex } = req.params;
        const index = parseInt(mediaIndex);

        if (isNaN(index) || index < 0) {
            return res.status(400).json({
                ok: false,
                type: 'ValidationError',
                message: 'mediaIndex must be a valid non-negative number'
            });
        }

        req.params.mediaIndex = index; // Convertir a número
        next();
    }
};

module.exports = validateGallery;