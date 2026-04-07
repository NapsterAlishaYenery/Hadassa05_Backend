

const ServicesHadassa05 = require('../models/services-hadassa.model');

exports.createServiceHadassa05 = async (req, res) => {

    const {
        title,
        niche,
        category,
        description,
        images,
        details
    } = req.body;

    try {

        const newServicesHadassa05 = await ServicesHadassa05.create({
            title,
            niche,
            category,
            description,
            images,
            details
        });

        res.status(201).json({
            ok: true,
            data: newServicesHadassa05,
            message: 'New Hadassa05 Service Added sussesfully'
        });

    } catch (error) {

        console.error("CREATE SERVICE ERROR:", error);

        if (error.name === 'ValidationError') {
            return res.status(400).json({
                ok: false,
                type: 'ValidationError',
                message: 'One or more fields are invalid',
            });
        }

        if (error.code === 11000) {
            const field = Object.keys(error.keyValue)[0]; // Te dice si fue el title o el slug
            return res.status(400).json({
                ok: false,
                type: 'DuplicateError',
                message: `The ${field} already exists. Please use another one.`
            });
        }

        res.status(500).json({
            ok: false,
            type: 'ServerError',
            message: 'A critical error occurred on the server'
        });
    }
}

exports.upDateServiceHadassa05 = async (req, res) => {

    const { id } = req.params;
    const upDate = req.body;

    try {
        const updateServiceHadassa05 = await ServicesHadassa05.findByIdAndUpdate(
            id,
            { $set: upDate },
            { new: true, runValidators: true }
        );


        if (!updateServiceHadassa05) {
            return res.status(404).json({
                ok: false,
                type: 'NotFoundError',
                message: 'Error: The Hadassa Service does not exist.',
            });
        }

        res.status(200).json({
            ok: true,
            data: updateServiceHadassa05,
            message: 'Hadassa05 Service updated correctly'
        });


    } catch (error) {
        console.error("UPDATE SERVICE ERROR:", error);

        if (error.name === 'ValidationError') {
            return res.status(400).json({
                ok: false,
                type: 'ValidationError',
                message: 'One or more fields are invalid',
            });
        }

        if (error.code === 11000) {
            const field = Object.keys(error.keyValue)[0]; // Te dice si fue el title o el slug
            return res.status(400).json({
                ok: false,
                type: 'DuplicateError',
                message: `The ${field} already exists. Please use another one.`
            });
        }

        res.status(500).json({
            ok: false,
            type: 'ServerError',
            message: 'A critical error occurred on the server'
        });
    }
}

exports.getServiceHadassa05ById = async (req, res) => {

    const { id } = req.params;

    try {

        const ServiceHadassa05 = await ServicesHadassa05.findById(id);

        if (!ServiceHadassa05) {
            return res.status(404).json({
                ok: false,
                type: 'NotFoundError',
                message: 'The requested Hadassa05 Service does not exist.'
            });
        }

        return res.status(200).json({
            ok: true,
            data: ServiceHadassa05,
            message: 'Hadassa05 Service retrieved successfully.'
        });

    } catch (error) {

        console.error("GET BY ID SERVICE ERROR:", error);

        res.status(500).json({
            ok: false,
            type: 'ServerError',
            message: 'A critical error occurred on the server.',
        });
    }
}

exports.getAllServiceHadassa05 = async (req, res) => {
    try {
        // 1. EXTRAER LAS VARIABLES DE req.query
        const { title, category, niche } = req.query;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 12;

        let query = {};

        if (title) {
            query.title = { $regex: title, $options: 'i' };
        }

        if (category) {
            query.category = { $regex: category, $options: 'i' };
        }

        if (niche) {
            query.niche = niche.toLowerCase();
        }


        const skip = (page - 1) * limit;

        const [allHadassa05Services, totalItems] = await Promise.all([
            ServicesHadassa05.find(query)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit),
            ServicesHadassa05.countDocuments(query)
        ]);

        const totalPages = Math.ceil(totalItems / limit);
        const hasNextPage = page < totalPages;
        const hasPrevPage = page > 1;

        return res.status(200).json({
            ok: true,
            data: allHadassa05Services,
            message: totalItems > 0 ? 'Hadassa05 Services retrieved successfully.' : 'No Hadassa05 Services found.',
            pagination: {
                page,
                limit,
                totalItems,
                totalPages,
                hasNextPage,
                hasPrevPage
            }
        });

    } catch (error) {

        console.error("GET ALL SERVICE ERROR:", error);

        res.status(500).json({
            ok: false,
            type: 'ServerError',
            message: 'A critical error occurred on the server while fetching Hadassa05 Services.',
        });
    }
};

exports.deleteServiceHadassa05 = async (req, res) => {

    const { id } = req.params;

    try {
        const deleteServiceHadassa05 = await ServicesHadassa05.findByIdAndDelete(id);

        if (!deleteServiceHadassa05) {
            return res.status(404).json({
                ok: false,
                type: 'NotFoundError',
                message: 'Error: The Hadassa05 Service you are trying to delete does not exist.',
            });
        }

        res.status(200).json({
            ok: true,
            message: 'Hadassa05 Service deleted successfully',
            data: deleteServiceHadassa05
        });

    } catch (error) {

        console.error("DELETE SERVICE ERROR:", error);

        res.status(500).json({
            ok: false,
            type: 'ServerError',
            message: 'A critical error occurred while deleting.',
        });
    }
};
