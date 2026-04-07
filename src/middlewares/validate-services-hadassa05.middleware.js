const { Types } = require("mongoose");

const validateServicesHadassa05 = {

    create: (req, res, next) => {

        const data = req.body;

        const camposObligatorios = [
            'title',
            'niche',
            'category',
            'description',
            'images',
            'details',
        ];

        for (const campo of camposObligatorios) {
            if (!data[campo]) {
                return res.status(400).json({
                    ok: false,
                    type: 'ValidationError',
                    message: `The field '${campo}' is required.`
                });
            }
        }

        // 2. Validación específica de 'details' como objeto
        if (typeof data.details !== 'object' || Array.isArray(data.details)) {
            return res.status(400).json({
                ok: false,
                type: 'ValidationError',
                message: "The field 'details' must be a valid object."
            });
        }

        // 3. Validación de sub-campos requeridos dentro de 'details'
        if (!data.details.items || !Array.isArray(data.details.items) || data.details.items.length === 0) {
            return res.status(400).json({
                ok: false,
                type: 'ValidationError',
                message: "The field 'details.items' is required and must be a non-empty array."
            });
        }

        // 4. (Opcional) Validar la 'variant' si viene en el body
        const validVariants = ['gold', 'primary', 'accent', 'default'];
        if (data.details.variant && !validVariants.includes(data.details.variant)) {
            return res.status(400).json({
                ok: false,
                type: 'ValidationError',
                message: `Invalid variant. Must be one of: ${validVariants.join(', ')}`
            });
        }


        next();
    },


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
    },

    update: (req, res, next) => {
        const updates = req.body;
        const camposRecibidos = Object.keys(updates);
        const camposProhibidos = ['_id', 'slug', 'createdAt', 'updatedAt'];

        if (camposRecibidos.length === 0) {
            return res.status(400).json({
                ok: false,
                type: 'ValidationError',
                message: 'No fields provided for update'

            });
        }

        for (const campo of camposRecibidos) {

            if (camposProhibidos.includes(campo)) {
                return res.status(400).json({
                    ok: false,
                    type: 'FieldProtected',
                    message: `Field '${campo}' is protected and cannot be updated`
                });
            }

            // 2. Si intentan actualizar 'details', validar que sea un objeto
            if (campo === 'details') {
                if (typeof updates.details !== 'object' || Array.isArray(updates.details)) {
                    return res.status(400).json({
                        ok: false,
                        type: 'ValidationError',
                        message: "The field 'details' must be an object"
                    });
                }

                // Opcional: Si envían 'details', podrías validar que al menos traiga 'items' 
                // si es que quieres que sea obligatorio siempre.
            }

            // 3. Validar que el Niche sea válido si se intenta cambiar
            if (campo === 'niche' && !['event', 'legal'].includes(updates.niche)) {
                return res.status(400).json({
                    ok: false,
                    type: 'ValidationError',
                    message: "Invalid niche. Must be 'event' or 'legal'"
                });
            }
        }
        
        next();
    }
};

module.exports = validateServicesHadassa05;
