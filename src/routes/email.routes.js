// src/routes/gallery.routes.js
const express = require('express');
const router = express.Router();


const writeLimiter = require('../middlewares/rateLimiter.middleware');

const { sendContactEmail } = require('../controllers/email.controller');

router.post('/send-contact', writeLimiter, sendContactEmail);

module.exports = router;