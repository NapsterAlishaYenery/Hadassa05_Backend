const express = require('express');
const router = express.Router();

const authMiddleware = require('../middlewares/auth.middleware');
const isAdminMiddleware = require('../middlewares/isAdmin.middleware')
const writeLimiter = require('../middlewares/rateLimiter.middleware')
const validateServicesHadassa05 = require('../middlewares/validate-services-hadassa05.middleware')


const ServicesHadassa05Controller = require('../controllers/services-hadassa05.controller');

//RUTAS POST
router.post('/create', writeLimiter, authMiddleware, isAdminMiddleware,validateServicesHadassa05.create, ServicesHadassa05Controller.createServiceHadassa05);

//RUTA PATCH
router.patch('/update/:id', writeLimiter, authMiddleware, isAdminMiddleware,validateServicesHadassa05.id, validateServicesHadassa05.update, ServicesHadassa05Controller.upDateServiceHadassa05);

//RUTAS GET
router.get('/detail/:id', writeLimiter, validateServicesHadassa05.id,  ServicesHadassa05Controller.getServiceHadassa05ById);
router.get('/all', writeLimiter,  ServicesHadassa05Controller.getAllServiceHadassa05);

//RUTA DELETE
router.delete('/delete/:id', writeLimiter, authMiddleware, isAdminMiddleware,validateServicesHadassa05.id,  ServicesHadassa05Controller.deleteServiceHadassa05);


module.exports = router