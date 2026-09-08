const express = require('express');
const router = express.Router();

const authMiddleware = require('../middlewares/auth.middleware');
const isAdminMiddleware = require('../middlewares/isAdmin.middleware')
const writeLimiter = require('../middlewares/rateLimiter.middleware')
const validateServicesHadassa05 = require('../middlewares/validate-services-hadassa05.middleware')
const upload = require('../middlewares/upload.middleware');

const ServicesHadassa05Controller = require('../controllers/services-hadassa05.controller');

//RUTAS POST
router.post('/create',
    writeLimiter,
    authMiddleware,
    isAdminMiddleware,
    upload.array('media', 10), // Hasta 10 archivos (imágenes o videos)
    validateServicesHadassa05.create,
    ServicesHadassa05Controller.createServiceHadassa05);

//  ADD IMAGES - Agregar imágenes a un servicio
router.post(
    '/:id/images',
    writeLimiter,
    authMiddleware,
    isAdminMiddleware,
    upload.array('media', 10),
    validateServicesHadassa05.id,
    ServicesHadassa05Controller.addServiceImages
);

//RUTA PATCH
router.patch('/update/:id', writeLimiter, authMiddleware, isAdminMiddleware, validateServicesHadassa05.id, validateServicesHadassa05.update, ServicesHadassa05Controller.upDateServiceHadassa05);

//  UPDATE COVER - Cambiar imagen de portada
router.patch(
    '/:id/cover',
    writeLimiter,
    authMiddleware,
    isAdminMiddleware,
    validateServicesHadassa05.id,
    ServicesHadassa05Controller.updateServiceCoverImage
);

//RUTAS GET
router.get('/detail/:id', writeLimiter, validateServicesHadassa05.id, ServicesHadassa05Controller.getServiceHadassa05ById);
router.get('/all', writeLimiter, ServicesHadassa05Controller.getAllServiceHadassa05);

//RUTA DELETE
router.delete('/delete/:id', writeLimiter, authMiddleware, isAdminMiddleware, validateServicesHadassa05.id, ServicesHadassa05Controller.deleteServiceHadassa05);
// ⭐ DELETE IMAGE - Eliminar una imagen específica
router.delete(
    '/:id/images/:imageIndex',
    writeLimiter,
    authMiddleware,
    isAdminMiddleware,
    validateServicesHadassa05.id,
    ServicesHadassa05Controller.deleteServiceImage
);

module.exports = router