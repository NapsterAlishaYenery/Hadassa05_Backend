const { Schema, model } = require('mongoose');

const slugify = require('slugify');
const stringArrayValidator = require('../utils/string-array.validator');

const ServiciosHadassa05 = new Schema({
    title: {
        type: String,
        required: [true, 'Name of the service is required'],
        trim: true,
        unique: true
    },
    slug: {
        type: String,
        required: [true, 'Slug is required for SEO URLs'],
        unique: true,
        lowercase: true,
        trim: true
    },
    niche: {
        type: String,
        lowercase: true,
        enum: ['event', 'legal'],
        required: [true, 'Niche must be specified']
    },
    category: {
        type: [String],
        lowercase: true,
        required: [true, 'At least one category is required'],
        validate: stringArrayValidator()
    },
    description: {
        type: String,
        required: [true, 'Description of hadassa05 service is required'],
        trim: true
    },
    images: {
        type: [String],
        lowercase: true,
        required: [true, 'At least one image is required'],
        validate: stringArrayValidator()

    },
    details: {
        items: {
            type: [String], // Array de strings para las viñetas (bullets)
            required: [true, 'At least one item is required'],
            validate: stringArrayValidator()
        },
        badge: {
            type: String,
            trim: true,
            default: '' // Ej: "Popular"
        },
        extraInfo: {
            type: String,
            trim: true,
            default: '' // Ej: "Incluye revisión inicial gratis"
        },
        variant: {
            type: String,
            enum: ['gold', 'primary', 'accent', 'default'],
            lowercase: true,
            default: 'default'
        }
    },
    isFeatured: {
        type: Boolean,
        default: false
    }


}, {
    versionKey: false,
    timestamps: true
});



ServiciosHadassa05.pre('validate', function () {

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



module.exports = model("servicios-hadassa05", ServiciosHadassa05);
