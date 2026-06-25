// src/routes/gallery.routes.js
const express = require('express');
const router = express.Router();

// Middlewares
const authMiddleware = require('../middlewares/auth.middleware');
const isAdminMiddleware = require('../middlewares/isAdmin.middleware');
const writeLimiter = require('../middlewares/rateLimiter.middleware');
const validateGallery = require('../middlewares/gallery-validator.middleware');
const upload = require('../middlewares/upload.middleware');

// Controlador
const galleryController = require('../controllers/gallery.controller');


// ======================================================
// RUTAS PÚBLICAS (GET)
// ======================================================

// GET - Obtener todos los eventos (públicos)
router.get(
    '/all',
    galleryController.getAllGalleries
);

// GET - Obtener evento por slug
router.get(
    '/detail/:slug',
    galleryController.getGalleryBySlug
);


// ======================================================
// RUTAS ADMIN (CREAR, ACTUALIZAR, ELIMINAR)
// ======================================================

// POST - Crear evento en galería (con autenticación y validación)
router.post(
    '/create',
    writeLimiter,
    authMiddleware,
    isAdminMiddleware,
    upload.array('media', 10), // Hasta 10 archivos (imágenes o videos)
    validateGallery.create,
    galleryController.createGallery
);

// PATCH - Actualizar campos básicos
router.patch(
    '/:id',
    authMiddleware,
    isAdminMiddleware,
    validateGallery.validateId,
    validateGallery.update,
    galleryController.updateGallery
);

// POST - Agregar nuevas imágenes
router.post(
    '/:id/media',
    authMiddleware,
    isAdminMiddleware,
    upload.array('media', 10),
    validateGallery.validateId,
    galleryController.addMedia
);

// PATCH - Cambiar imagen de portada
router.patch(
    '/:id/cover',
    authMiddleware,
    isAdminMiddleware,
    validateGallery.validateId,
    validateGallery.coverImage,
    galleryController.updateCoverImage
);

// DELETE - Eliminar una imagen específica
router.delete(
    '/:id/media/:mediaIndex',
    authMiddleware,
    isAdminMiddleware,
    validateGallery.validateId,
    validateGallery.validateMediaIndex,
    galleryController.deleteMediaImage
);

// DELETE - Eliminar todas las imágenes de una galería
router.delete(
    '/:id/media',
    authMiddleware,
    isAdminMiddleware,
    validateGallery.validateId,
    galleryController.deleteAllMedia
);

// DELETE - Eliminar galería completa
router.delete(
    '/:id',
    authMiddleware,
    isAdminMiddleware,
    validateGallery.validateId,
    galleryController.deleteEventGallery
);

// PATCH - Reordenar imágenes
router.patch(
    '/:id/reorder',
    authMiddleware,
    isAdminMiddleware,
    validateGallery.validateId,
    validateGallery.reorder,
    galleryController.reorderMedia
);


module.exports = router;
