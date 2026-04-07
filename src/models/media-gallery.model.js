
const { Schema, model } = require('mongoose');

const slugify = require('slugify');

const gallerySchema = new Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: [true, 'Description of gallery is required'],
        trim: true
    },
    niche: {
        type: String,
        lowercase: true,
        enum: ['event', 'legal'],
        required: [true, 'Niche must be specified']
    },
    // Esto vincula la galería a un servicio (ej: "Bodas", "Migración")
    serviceType: {
        type: String,
        required: true
    },
    // Array de objetos para manejar fotos y videos mezclados
    media: [{
        filename: {
            type: String,
            required: [true, 'El nombre del archivo es obligatorio']
        },
        extension: {
            type: String,
            required: [true, 'La extensión es obligatoria']
        },
        mediaType: {
            type: String,
            enum: ['image', 'video'],
            default: 'image'
        },
        caption: {
            type: String,
            required: [true, 'El caption (texto ALT) es vital para el SEO'],
            trim: true
        },
    }],
    isPublic: {
        type: Boolean,
        default: true
    },
    slug: {
        type: String,
        unique: true
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