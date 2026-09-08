const { uploadFile, deleteFile } = require('../services/cloudinary.service');
const deleteLocalFiles = require('../utils/fileCleanup.util');
const ServicesHadassa05 = require('../models/services-hadassa.model');

/**
 * CREATE - Crear un nuevo servicio de Hadassa05
 * POST /api/hadassa05-services/create
 * Body: FormData con campos de texto + archivos (images)
 */
/**
 * CREATE - Crear un nuevo servicio de Hadassa05
 */
exports.createServiceHadassa05 = async (req, res) => {
    try {
        const {
            title,
            niche,
            category,
            description,
            details,
            isFeatured
        } = req.body;

        // Validar que se hayan subido archivos
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({
                ok: false,
                type: 'BadRequest',
                message: 'At least one image is required'
            });
        }

        // Subir archivos a Cloudinary
        const uploadPromises = req.files.map(file =>
            uploadFile(file.path, 'services')
        );
        const uploadResults = await Promise.all(uploadPromises);

        // Construir media items (images)
        const images = uploadResults.map((result, index) => ({
            public_id: result.public_id,
            url: result.url,
            thumbnailUrl: result.url,
            alt: title || `Service image ${index + 1}`,
            mediaType: result.resource_type || 'image',
            width: result.width || 0,
            height: result.height || 0,
            format: result.format || 'jpg',
            order: index,
            duration: result.duration || null
        }));

        // Cover image (la primera imagen)
        const coverImage = images.length > 0 ? images[0] : null;

        // Crear en la base de datos
        const newService = await ServicesHadassa05.create({
            title,
            niche,
            category,
            description,
            images,
            coverImage,
            details,
            isFeatured: isFeatured === 'true' || isFeatured === true || false
        });

        res.status(201).json({
            ok: true,
            data: newService,
            message: 'New Hadassa05 Service Added successfully'
        });

    } catch (error) {
        console.error("CREATE SERVICE ERROR:", error);

        if (error.code === 11000) {
            const field = Object.keys(error.keyValue)[0];
            return res.status(400).json({
                ok: false,
                type: 'DuplicateError',
                message: `The ${field} already exists. Please use another one.`
            });
        }

        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({
                ok: false,
                type: 'ValidationError',
                messages: messages
            });
        }

        res.status(500).json({
            ok: false,
            type: 'ServerError',
            message: 'A critical error occurred on the server'
        });

    } finally {
        if (req.files && req.files.length > 0) {
            const filesObject = { services: req.files };
            await deleteLocalFiles(filesObject);
        }
    }
};

/**
 * UPDATE - Actualizar un servicio de Hadassa05
 * PATCH /api/hadassa05-services/update/:id
 * Body: Campos de texto (todos opcionales)
 */
exports.upDateServiceHadassa05 = async (req, res) => {
    const { id } = req.params;
    const updateData = req.body;

    try {
        // ⭐ Buscar y actualizar en una sola operación
        const updatedService = await ServicesHadassa05.findByIdAndUpdate(
            id,
            { $set: updateData },
            {
                new: true,           // Devuelve el documento actualizado
                runValidators: true  // Ejecuta validaciones del modelo
            }
        );

        if (!updatedService) {
            return res.status(404).json({
                ok: false,
                type: 'NotFoundError',
                message: 'Error: The Hadassa05 Service does not exist.'
            });
        }

        res.status(200).json({
            ok: true,
            data: updatedService,
            message: 'Hadassa05 Service updated correctly'
        });

    } catch (error) {
        console.error("UPDATE SERVICE ERROR:", error);

        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({
                ok: false,
                type: 'ValidationError',
                messages: messages
            });
        }

        if (error.code === 11000) {
            const field = Object.keys(error.keyValue)[0];
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
};

/**
 * GET BY ID - Actualizar un servicio de Hadassa05
 * GET /api/hadassa05-services/detail/:id
 */
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

/**
 * GET ALL - Obtener todos los servicios de Hadassa05 con filtros y paginación
 * GET /api/hadassa05-services/all
 * Query params: { title, category, niche, page, limit }
 */
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

/**
 * DELETE - Eliminar un servicio de Hadassa05 y sus imágenes de Cloudinary
 * DELETE /api/hadassa05-services/delete/:id
 */
exports.deleteServiceHadassa05 = async (req, res) => {
    const { id } = req.params;

    try {
        // 1. Buscar el servicio
        const service = await ServicesHadassa05.findById(id);

        if (!service) {
            return res.status(404).json({
                ok: false,
                type: 'NotFoundError',
                message: 'Error: The Hadassa05 Service you are trying to delete does not exist.'
            });
        }

        // 2. Eliminar TODAS las imágenes de Cloudinary
        if (service.images && service.images.length > 0) {
            const deletePromises = service.images.map(image => {
                return deleteFile(image.public_id, image.mediaType || 'image');
            });
            await Promise.all(deletePromises);
        }

        // 3. Eliminar de la base de datos
        await service.deleteOne();

        res.status(200).json({
            ok: true,
            message: 'Hadassa05 Service deleted successfully',
            data: service
        });

    } catch (error) {
        console.error("DELETE SERVICE ERROR:", error);

        res.status(500).json({
            ok: false,
            type: 'ServerError',
            message: 'A critical error occurred while deleting.'
        });
    }
};


/**
 * ADD IMAGES - Agregar nuevas imágenes a un servicio
 * POST /api/hadassa05-services/:id/images
 * Body: FormData con archivos (media)
 */
exports.addServiceImages = async (req, res) => {
    try {
        const { id } = req.params;

        // Buscar el servicio
        const service = await ServicesHadassa05.findById(id);
        if (!service) {
            return res.status(404).json({
                ok: false,
                type: 'NotFoundError',
                message: 'The Hadassa05 Service does not exist.'
            });
        }

        // Validar que se hayan subido archivos
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({
                ok: false,
                type: 'BadRequest',
                message: 'At least one image is required'
            });
        }

        // Subir archivos a Cloudinary
        const uploadPromises = req.files.map(file =>
            uploadFile(file.path, 'services')
        );
        const uploadResults = await Promise.all(uploadPromises);

        // Construir nuevos items de imagen
        const newImages = uploadResults.map((result, index) => {
            const currentOrder = service.images.length + index;
            return {
                public_id: result.public_id,
                url: result.url,
                thumbnailUrl: result.url,
                alt: service.title || `Service image ${currentOrder + 1}`,
                mediaType: result.resource_type || 'image',
                width: result.width || 0,
                height: result.height || 0,
                format: result.format || 'jpg',
                order: currentOrder,
                duration: result.duration || null
            };
        });

        // Agregar al array existente
        service.images.push(...newImages);

        // Si no hay coverImage, usar la primera imagen
        if (!service.coverImage && newImages.length > 0) {
            const firstImage = newImages.find(item => item.mediaType === 'image');
            service.coverImage = firstImage || newImages[0];
        }

        await service.save();

        res.json({
            ok: true,
            data: service,
            message: `${newImages.length} image(s) added successfully`
        });

    } catch (error) {
        console.error("ADD IMAGES ERROR:", error);
        res.status(500).json({
            ok: false,
            type: 'ServerError',
            message: 'A critical error occurred while adding images'
        });
    } finally {
        if (req.files && req.files.length > 0) {
            const filesObject = { services: req.files };
            await deleteLocalFiles(filesObject);
        }
    }
};

/**
 * UPDATE COVER IMAGE - Cambiar la imagen de portada de un servicio
 * PATCH /api/hadassa05-services/:id/cover
 * Body: { imageIndex: number }
 */
exports.updateServiceCoverImage = async (req, res) => {
    try {
        const { id } = req.params;
        const { imageIndex } = req.body;

        // Validar que el índice existe
        if (imageIndex === undefined || imageIndex === null) {
            return res.status(400).json({
                ok: false,
                type: 'ValidationError',
                message: 'imageIndex is required'
            });
        }

        // Buscar el servicio
        const service = await ServicesHadassa05.findById(id);
        if (!service) {
            return res.status(404).json({
                ok: false,
                type: 'NotFoundError',
                message: 'The Hadassa05 Service does not exist.'
            });
        }

        // Validar que el índice existe en el array
        if (imageIndex < 0 || imageIndex >= service.images.length) {
            return res.status(400).json({
                ok: false,
                type: 'ValidationError',
                message: `Index ${imageIndex} does not exist. There are ${service.images.length} images available.`
            });
        }

        // Actualizar coverImage con la imagen seleccionada
        const selectedImage = service.images[imageIndex];
        service.coverImage = {
            public_id: selectedImage.public_id,
            url: selectedImage.url,
            thumbnailUrl: selectedImage.thumbnailUrl,
            alt: selectedImage.alt || service.title,
            mediaType: selectedImage.mediaType,
            width: selectedImage.width || 0,
            height: selectedImage.height || 0,
            format: selectedImage.format || 'jpg',
            order: 0,
            duration: selectedImage.duration || null
        };

        await service.save();

        res.json({
            ok: true,
            data: service,
            message: `Cover image updated successfully (index: ${imageIndex})`
        });

    } catch (error) {
        console.error("UPDATE COVER ERROR:", error);
        res.status(500).json({
            ok: false,
            type: 'ServerError',
            message: 'A critical error occurred while updating cover image'
        });
    }
};

// controllers/services-hadassa05.controller.js

/**
 * DELETE IMAGE - Eliminar una imagen específica de un servicio
 * DELETE /api/hadassa05-services/:id/images/:imageIndex
 */
exports.deleteServiceImage = async (req, res) => {
    try {
        const { id, imageIndex } = req.params;
        const index = parseInt(imageIndex);

        // Buscar el servicio
        const service = await ServicesHadassa05.findById(id);
        if (!service) {
            return res.status(404).json({
                ok: false,
                type: 'NotFoundError',
                message: 'The Hadassa05 Service does not exist.'
            });
        }

        // Validar que el índice existe
        if (index < 0 || index >= service.images.length) {
            return res.status(400).json({
                ok: false,
                type: 'ValidationError',
                message: `Index ${index} does not exist. There are ${service.images.length} images available.`
            });
        }

        // Obtener la imagen a eliminar
        const imageToDelete = service.images[index];

        // Eliminar de Cloudinary
        if (imageToDelete) {
            await deleteFile(imageToDelete.public_id, imageToDelete.mediaType || 'image');
        }

        // Eliminar del array
        service.images.splice(index, 1);

        // Reordenar
        service.images.forEach((item, idx) => {
            item.order = idx;
        });

        // Si la coverImage era la eliminada, actualizar
        if (service.coverImage && service.coverImage.public_id === imageToDelete.public_id) {
            service.coverImage = service.images.length > 0 ? service.images[0] : null;
        }

        await service.save();

        res.json({
            ok: true,
            data: service,
            message: 'Image deleted successfully'
        });

    } catch (error) {
        console.error("DELETE IMAGE ERROR:", error);
        res.status(500).json({
            ok: false,
            type: 'ServerError',
            message: 'A critical error occurred while deleting the image'
        });
    }
};