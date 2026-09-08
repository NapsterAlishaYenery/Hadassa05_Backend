
const { Schema, model } = require('mongoose');
const MediaSchema = require('./schemas/media.schema')

const slugify = require('slugify');

const gallerySchema = new Schema({
    title: {
        type: String,
        required: [true, 'El título del evento es requerido'],
        trim: true
    },
    slug: {
        type: String,
        unique: true,
        lowercase: true,
        trim: true
    },
    description: {
        type: String,
        required: [true, 'La descripción del evento es requerida'],
        trim: true
    },
    niche: {
        type: String,
        lowercase: true,
        enum: ['event'],
        default: 'event',
        required: [true, 'El nicho es requerido']
    },
    eventType: {
        type: String,
        required: [true, 'El tipo de evento es requerido'],
        trim: true
    },
    client: {
        type: String,
        required: [true, 'El nombre del cliente es requerido'],
        trim: true
    },
    eventDate: {
        type: Date,
        required: [true, 'La fecha del evento es requerida']
    },
    location: {
        type: String,
        trim: true,
        default: ''
    },
    // Usamos el sub-schema para el array de media
    media: {
        type: [MediaSchema],
        default: [],
        validate: {
            validator: function (v) {
                return v.length > 0;
            },
            message: 'Al menos una imagen o video es requerido'
        }
    },
    // Imagen destacada (portada)
    coverImage: {
        type: MediaSchema,
        required: false
    },
    isFeatured: {
        type: Boolean,
        default: false
    },
    isPublic: {
        type: Boolean,
        default: true
    }

}, {
    versionKey: false,
    timestamps: true
});


gallerySchema.pre('validate', function () {

    if (this.isNew && this.title && !this.slug) {
        let baseSlug = slugify(this.title, { lower: true, strict: true });


        const date = new Date();
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');

        const dateString = `${year}-${month}-${day}`;

        this.slug = `${baseSlug}-${dateString}`;
    }

});

module.exports = model("media-gallery", gallerySchema);