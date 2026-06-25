// src/controllers/gallery.controller.js
const Gallery = require('../models/media-gallery.model');
const { uploadFile, deleteFile } = require('../services/cloudinary.service');
const deleteLocalFiles = require('../utils/fileCleanup.util');

/**
 * CREATE - Crear un nuevo evento en la galería
 */
exports.createGallery = async (req, res) => {
    try {
        // 1. Extraer los datos del body (ya validados por Joi)
        const galleryData = req.body;

        // 2. Validar que se hayan subido archivos
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({
                ok: false,
                type: 'BadRequest',
                message: 'At least one image or video is required'
            });
        }

        // 3. Subir archivos a Cloudinary usando uploadFile
        const uploadPromises = req.files.map(file =>
            uploadFile(file.path, 'gallery')  // 👈 Cambiado a 'gallery' y uploadFile
        );
        const uploadResults = await Promise.all(uploadPromises);

        // 4. Construir el array de media con la respuesta de Cloudinary
        const mediaItems = uploadResults.map((result, index) => {
            const originalFile = req.files[index];
            return {
                public_id: result.public_id,
                url: result.url,
                thumbnailUrl: result.url,
                alt: galleryData.title || `Gallery image ${index + 1}`,
                mediaType: originalFile.mimetype?.startsWith('video') ? 'video' : 'image',
                width: result.width || 0,
                height: result.height || 0,
                format: result.format || 'jpg',
                order: index
            };
        });

        // 5. Usar la primera imagen como coverImage
        const coverImage = mediaItems.length > 0 ? mediaItems[0] : null;

        // 6. Construir el objeto final para guardar en DB
        const galleryDocument = {
            ...galleryData,
            media: mediaItems,
            coverImage: coverImage
        };

        // 7. Crear en la base de datos
        const newGallery = await Gallery.create(galleryDocument);

        // 8. Respuesta exitosa
        res.status(201).json({
            ok: true,
            data: newGallery,
            message: 'Gallery event created successfully'
        });

    } catch (error) {
        console.error('--- CREATE GALLERY ERROR ---', error);

        // Error de duplicado (slug duplicado)
        if (error.code === 11000) {
            return res.status(400).json({
                ok: false,
                type: 'DuplicateError',
                message: 'An event with this title already exists. Please use another title.'
            });
        }

        // Error de validación de Mongoose
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({
                ok: false,
                type: 'ValidationError',
                messages: messages
            });
        }

        // Error genérico del servidor
        res.status(500).json({
            ok: false,
            type: 'ServerError',
            message: 'Internal Server Error'
        });

    } finally {
        // 9. Limpiar archivos temporales (Multer)
        if (req.files && req.files.length > 0) {
            const filesObject = { gallery: req.files };
            await deleteLocalFiles(filesObject);
        }
    }
};

/**
 * UPDATE - Actualizar campos básicos de la galería
 * PATCH /api/gallery/:id
 * Body: { description, client, eventDate, location, eventType, isFeatured, isPublic }
 */
exports.updateGallery = async (req, res) => {
    try {
        const { id } = req.params;
        const {
            description,
            client,
            eventDate,
            location,
            eventType,
            isFeatured,
            isPublic
        } = req.body;

        // Buscar la galería
        const gallery = await Gallery.findById(id);
        if (!gallery) {
            return res.status(404).json({
                ok: false,
                message: 'Galería no encontrada'
            });
        }

        // Actualizar solo los campos permitidos
        if (description !== undefined) gallery.description = description;
        if (client !== undefined) gallery.client = client;
        if (eventDate !== undefined) gallery.eventDate = eventDate;
        if (location !== undefined) gallery.location = location;
        if (eventType !== undefined) gallery.eventType = eventType;
        if (isFeatured !== undefined) gallery.isFeatured = isFeatured;
        if (isPublic !== undefined) gallery.isPublic = isPublic;

        await gallery.save();

        res.json({
            ok: true,
            data: gallery,
            message: 'Galería actualizada exitosamente'
        });

    } catch (error) {
        console.error('--- UPDATE GALLERY ERROR ---', error);
        res.status(500).json({
            ok: false,
            message: 'Error al actualizar la galería'
        });
    }
};

/**
 * ADD MEDIA - Agregar nuevas imágenes/videos a la galería
 * POST /api/gallery/:id/media
 * Body: FormData con archivos
 */
exports.addMedia = async (req, res) => {
    try {
        const { id } = req.params;

        // Verificar que exista la galería
        const gallery = await Gallery.findById(id);
        if (!gallery) {
            return res.status(404).json({
                ok: false,
                message: 'Galería no encontrada'
            });
        }

        // Validar que se hayan subido archivos
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({
                ok: false,
                message: 'Al menos una imagen o video es requerido'
            });
        }

        // Subir nuevas imágenes a Cloudinary
        const uploadPromises = req.files.map(file =>
            uploadFile(file.path, 'gallery')
        );
        const uploadResults = await Promise.all(uploadPromises);

        // Crear nuevos items de media
        const newMediaItems = uploadResults.map((result, index) => {
            const originalFile = req.files[index];
            const currentOrder = gallery.media.length + index;

            return {
                public_id: result.public_id,
                url: result.url,
                thumbnailUrl: result.url,
                alt: gallery.title || `Imagen ${currentOrder + 1}`,
                mediaType: originalFile.mimetype?.startsWith('video') ? 'video' : 'image',
                width: result.width || 0,
                height: result.height || 0,
                format: result.format || 'jpg',
                order: currentOrder
            };
        });

        // Agregar al array existente
        gallery.media.push(...newMediaItems);

        // Si no hay coverImage, usar la primera nueva
        if (!gallery.coverImage && newMediaItems.length > 0) {
            gallery.coverImage = newMediaItems[0];
        }

        await gallery.save();

        res.json({
            ok: true,
            data: gallery,
            message: `${newMediaItems.length} imagen(es) agregada(s) exitosamente`
        });

    } catch (error) {
        console.error('--- ADD MEDIA ERROR ---', error);
        res.status(500).json({
            ok: false,
            message: 'Error al agregar imágenes'
        });
    } finally {
        if (req.files && req.files.length > 0) {
            const filesObject = { gallery: req.files };
            await deleteLocalFiles(filesObject);
        }
    }
};

/**
 * UPDATE COVER - Cambiar la imagen de portada
 * PATCH /api/gallery/:id/cover
 * Body: { mediaIndex: number } 
 *       (índice de la imagen en el array media que será la portada)
 */
exports.updateCoverImage = async (req, res) => {
    try {
        const { id } = req.params;
        const { mediaIndex } = req.body;

        // Validar que el índice existe
        if (mediaIndex === undefined || mediaIndex === null) {
            return res.status(400).json({
                ok: false,
                message: 'El índice de la imagen es requerido (mediaIndex)'
            });
        }

        // Buscar la galería
        const gallery = await Gallery.findById(id);
        if (!gallery) {
            return res.status(404).json({
                ok: false,
                message: 'Galería no encontrada'
            });
        }

        // Validar que el índice existe en el array
        if (mediaIndex < 0 || mediaIndex >= gallery.media.length) {
            return res.status(400).json({
                ok: false,
                message: `El índice ${mediaIndex} no existe. Hay ${gallery.media.length} imágenes disponibles`
            });
        }

        // Actualizar coverImage con la imagen seleccionada
        const selectedMedia = gallery.media[mediaIndex];
        gallery.coverImage = {
            public_id: selectedMedia.public_id,
            url: selectedMedia.url,
            thumbnailUrl: selectedMedia.thumbnailUrl,
            alt: selectedMedia.alt || gallery.title,
            mediaType: selectedMedia.mediaType,
            width: selectedMedia.width || 0,
            height: selectedMedia.height || 0,
            format: selectedMedia.format || 'jpg',
            order: 0
        };

        await gallery.save();

        res.json({
            ok: true,
            data: gallery,
            message: `Imagen de portada actualizada (índice: ${mediaIndex})`
        });

    } catch (error) {
        console.error('--- UPDATE COVER ERROR ---', error);
        res.status(500).json({
            ok: false,
            message: 'Error al actualizar la portada'
        });
    }
};

/**
 * DELETE MEDIA - Eliminar una imagen/video de la galería
 * DELETE /api/gallery/:id/media/:mediaIndex
 */
exports.deleteMediaImage = async (req, res) => {
    try {
        const { id, mediaIndex } = req.params;
        const index = parseInt(mediaIndex);

        const gallery = await Gallery.findById(id);
        if (!gallery) {
            return res.status(404).json({
                ok: false,
                message: 'Galería no encontrada'
            });
        }

        if (index < 0 || index >= gallery.media.length) {
            return res.status(400).json({
                ok: false,
                message: `El índice ${index} no existe. Hay ${gallery.media.length} imágenes disponibles`
            });
        }

        // Obtener la imagen a eliminar
        const mediaToDelete = gallery.media[index];

        // Eliminar de Cloudinary
        await deleteFile(mediaToDelete.public_id);

        // Eliminar del array
        gallery.media.splice(index, 1);

        // Reordenar
        gallery.media.forEach((item, idx) => {
            item.order = idx;
        });

        // Si la coverImage era la eliminada, actualizar
        if (gallery.coverImage && gallery.coverImage.public_id === mediaToDelete.public_id) {
            gallery.coverImage = gallery.media.length > 0 ? gallery.media[0] : null;
        }

        await gallery.save();

        res.json({
            ok: true,
            data: gallery,
            message: 'Imagen eliminada exitosamente'
        });

    } catch (error) {
        console.error('--- DELETE MEDIA ERROR ---', error);
        res.status(500).json({
            ok: false,
            message: 'Error al eliminar la imagen'
        });
    }
};

/**
 * DELETE ALL MEDIA - Eliminar todas las imágenes de una galería
 * DELETE /api/gallery/:id/media
 */
exports.deleteAllMedia = async (req, res) => {
    try {
        const { id } = req.params;

        const gallery = await Gallery.findById(id);
        if (!gallery) {
            return res.status(404).json({
                ok: false,
                message: 'Galería no encontrada'
            });
        }

        // Eliminar todas las imágenes de Cloudinary
        const deletePromises = gallery.media.map(media =>
            deleteFile(media.public_id)
        );
        await Promise.all(deletePromises);

        // Vaciar el array de media
        gallery.media = [];
        gallery.coverImage = null;

        await gallery.save({ validateBeforeSave: false });

        res.json({
            ok: true,
            data: gallery,
            message: 'Todas las imágenes eliminadas exitosamente'
        });

    } catch (error) {
        console.error('--- DELETE ALL MEDIA ERROR ---', error);
        res.status(500).json({
            ok: false,
            message: 'Error al eliminar todas las imágenes'
        });
    }
};

/**
 * DELETE GALLERY - Eliminar galería completa con todas sus imágenes
 * DELETE /api/gallery/:id
 */
exports.deleteEventGallery = async (req, res) => {
    try {
        const { id } = req.params;

        const gallery = await Gallery.findById(id);
        if (!gallery) {
            return res.status(404).json({
                ok: false,
                message: 'Galería no encontrada'
            });
        }

        // Eliminar TODAS las imágenes de Cloudinary
        const deletePromises = gallery.media.map(media =>
            deleteFile(media.public_id)
        );
        await Promise.all(deletePromises);

        // Eliminar de la base de datos
        await gallery.deleteOne();

        res.json({
            ok: true,
            message: 'Galería eliminada exitosamente'
        });

    } catch (error) {
        console.error('--- DELETE GALLERY ERROR ---', error);
        res.status(500).json({
            ok: false,
            message: `Evento "${gallery.title}" eliminado exitosamente`
        });
    }
};


/**
 * REORDER MEDIA - Cambiar el orden de las imágenes
 * PATCH /api/gallery/:id/reorder
 * Body: { order: [0, 2, 1, 3] }  // Nuevo orden de índices
 */
exports.reorderMedia = async (req, res) => {
    try {
        const { id } = req.params;
        const { order } = req.body;

        if (!order || !Array.isArray(order)) {
            return res.status(400).json({
                ok: false,
                message: 'Se requiere un array de índices (order)'
            });
        }

        // Buscar la galería
        const gallery = await Gallery.findById(id);
        if (!gallery) {
            return res.status(404).json({
                ok: false,
                message: 'Galería no encontrada'
            });
        }

        // Validar que el array tenga el mismo largo que media
        if (order.length !== gallery.media.length) {
            return res.status(400).json({
                ok: false,
                message: `El array debe tener ${gallery.media.length} elementos`
            });
        }

        // Reordenar el array
        const reorderedMedia = order.map(index => gallery.media[index]);

        // Actualizar el orden
        reorderedMedia.forEach((item, idx) => {
            item.order = idx;
        });

        gallery.media = reorderedMedia;

        await gallery.save();

        res.json({
            ok: true,
            data: gallery,
            message: 'Orden actualizado exitosamente'
        });

    } catch (error) {
        console.error('--- REORDER MEDIA ERROR ---', error);
        res.status(500).json({
            ok: false,
            message: 'Error al reordenar imágenes'
        });
    }
};



/**
 * GET ALL - Obtener todos los eventos con filtros y paginación
 */
exports.getAllGalleries = async (req, res) => {
    try {
        // 1. EXTRAER LAS VARIABLES DE req.query
        const { title, eventType, client, location, niche } = req.query;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 12;

        // 2. CONSTRUIR EL QUERY DINÁMICO
        let query = {};

        // Filtrar por título (búsqueda parcial, case-insensitive)
        if (title) {
            query.title = { $regex: title, $options: 'i' };
        }

        // Filtrar por tipo de evento (búsqueda parcial, case-insensitive)
        if (eventType) {
            query.eventType = { $regex: eventType, $options: 'i' };
        }

        // Filtrar por cliente (búsqueda parcial, case-insensitive)
        if (client) {
            query.client = { $regex: client, $options: 'i' };
        }

        // Filtrar por ubicación (búsqueda parcial, case-insensitive)
        if (location) {
            query.location = { $regex: location, $options: 'i' };
        }

        // Filtrar por nicho (exacto, case-insensitive)
        if (niche) {
            query.niche = niche.toLowerCase();
        }

        // Solo mostrar eventos públicos (a menos que sea admin)
        // Si quieres mostrar todos (incluyendo no públicos), comenta esta línea
        query.isPublic = true;

        // 3. CALCULAR SKIP PARA PAGINACIÓN
        const skip = (page - 1) * limit;

        // 4. EJECUTAR CONSULTA EN PARALELO
        const [allGalleries, totalItems] = await Promise.all([
            Gallery.find(query)
                .sort({ createdAt: -1 }) // Ordenar por fecha de creación (más reciente primero)
                .skip(skip)
                .limit(limit),
            Gallery.countDocuments(query)
        ]);

        // 5. CALCULAR METADATOS DE PAGINACIÓN
        const totalPages = Math.ceil(totalItems / limit);
        const hasNextPage = page < totalPages;
        const hasPrevPage = page > 1;

        // 6. RESPONDER CON LA MISMA ESTRUCTURA
        return res.status(200).json({
            ok: true,
            data: allGalleries,
            message: totalItems > 0 ? 'Gallery events retrieved successfully.' : 'No gallery events found.',
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
        console.error("GET ALL GALLERY ERROR:", error);

        res.status(500).json({
            ok: false,
            type: 'ServerError',
            message: 'A critical error occurred on the server while fetching gallery events.',
        });
    }
};

/**
 * GET BY SLUG - Obtener un evento por slug
 */
exports.getGalleryBySlug = async (req, res) => {
    try {
        const { slug } = req.params;

        const gallery = await Gallery.findOne({ slug });

        if (!gallery) {
            return res.status(404).json({
                ok: false,
                type: 'NotFoundError',
                message: 'Gallery event not found'
            });
        }

        res.status(200).json({
            ok: true,
            data: gallery,
            message: 'Gallery event retrieved successfully'
        });

    } catch (error) {
        console.error('--- GET GALLERY BY SLUG ERROR ---', error);
        res.status(500).json({
            ok: false,
            type: 'ServerError',
            message: 'Error retrieving gallery event'
        });
    }
};
