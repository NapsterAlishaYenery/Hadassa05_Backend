// controllers/email.controller.js
const { sendMailService } = require('../services/email.service');
const { makeHtmlForContactPage } = require('../templates/contact.template');

exports.sendContactEmail = async (req, res) => {
  try {
    const { fullName, email, phone, eventType, details } = req.body;

    if (!fullName || !email || !phone || !eventType || !details) {
      return res.status(400).json({ 
        ok: false, 
        message: 'Todos los campos son obligatorios.' 
      });
    }

    const payload = { fullName, email, phone, eventType, details };

    const userHtml = makeHtmlForContactPage(payload, false);
    const adminHtml = makeHtmlForContactPage(payload, true);

   await Promise.all([
      // 1. Correo para el cliente (Diverso y personalizado)
      sendMailService({
        to: email,
        subject: `¡Hemos recibido tu solicitud para ${eventType}! - Hadassa05`,
        html: userHtml,
      }),
      // 2. Correo para el administrador
      sendMailService({
        to: process.env.CONTACT_EMAIL_RECEIVER,
        subject: `Nueva Cotización: ${eventType} - ${fullName}`,
        html: adminHtml,
      })
    ]);

    return res.status(200).json({
      ok: true,
      message: 'Solicitud enviada con éxito.',
      data: null
    });

  } catch (error) {
    console.error('Error al enviar emails:', error);
    return res.status(500).json({
      ok: false,
      message: 'Ocurrió un error al procesar tu solicitud.',
      type: 'ServerError',
    });
  }
};