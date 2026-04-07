const express = require('express');
const router = express.Router();

const authMiddleware = require('../middlewares/auth.middleware');
const isAdminMiddleware = require('../middlewares/isAdmin.middleware')
const writeLimiter = require('../middlewares/rateLimiter.middleware')
const validateUsers = require('../middlewares/validate-users.middleware')


const usersController = require('../controllers/user.controller');

//RUTAS GET
router.get('/all', authMiddleware, isAdminMiddleware, usersController.getAllUsers);
router.get('/profile', authMiddleware, usersController.getUserProfile);

//RUTAS POST
router.post('/register', writeLimiter, validateUsers.register, usersController.register);
router.post('/login', writeLimiter, validateUsers.login, usersController.login);

//RUTA PATCH
router.patch('/update', authMiddleware, writeLimiter, validateUsers.update,  usersController.update);

module.exports = router