// models/sub-schemas/media.schema.js
const { Schema } = require('mongoose');

const MediaSchema = new Schema({
    public_id: {
        type: String,
        required: [true, 'El public_id de Cloudinary es requerido'],
        trim: true
    },
    url: {
        type: String,
        required: [true, 'La URL de Cloudinary es requerida'],
        trim: true
    },
    thumbnailUrl: {
        type: String,
        required: [true, 'La URL del thumbnail es requerida'],
        trim: true
    },
    alt: {
        type: String,
        required: [true, 'El texto alternativo (alt) es requerido para SEO'],
        trim: true,
        default: 'Evento Hadassa05'
    },
    mediaType: {
        type: String,
        enum: ['image', 'video'],
        default: 'image'
    },
    width: {
        type: Number,
        default: 0
    },
    height: {
        type: Number,
        default: 0
    },
    format: {
        type: String,
        default: 'jpg'
    },
    // Para ordenar manualmente las imágenes
    order: {
        type: Number,
        default: 0
    },
    duration: {
        type: Number,
        default: null
    }
}, { _id: false }); // No generar _id para cada subdocumento

module.exports = MediaSchema;