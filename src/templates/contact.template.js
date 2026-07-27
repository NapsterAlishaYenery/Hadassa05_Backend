// templates/contact.template.js
const { COMPANY_INFO } = require('../constants/constants');

const makeHtmlForContactPage = (data, isAdmin = false) => {
  const { fullName, email, phone, eventType, details } = data;

  const titleHeader = isAdmin 
    ? "Nueva Solicitud de Cotización" 
    : `¡Hola, ${fullName}!`;

  const subTitleHeader = isAdmin
    ? "Se ha recibido una nueva consulta desde el sitio web"
    : "Gracias por pensar en nosotros para tu próximo evento";

  const mainGreeting = isAdmin
    ? `Has recibido un nuevo mensaje de cotización con los siguientes detalles:`
    : `En <strong>${COMPANY_INFO.name}</strong> estamos emocionados de ser parte de tus momentos especiales. Hemos recibido tu solicitud con éxito y nuestro equipo la está revisando para ofrecerte una propuesta a la medida.`;

  const actionButtonText = isAdmin
    ? "Contactar al Cliente vía WhatsApp"
    : "Hablar con un Asesor Directamente";

  const actionButtonLink = isAdmin
    ? `https://wa.me/${phone.replace(/[^0-9]/g, '')}`
    : `https://wa.me/${COMPANY_INFO.whatsapp}`;

  return `
  <!DOCTYPE html>
  <html lang="es">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${COMPANY_INFO.name}</title>
    <style>
      body {
        margin: 0;
        padding: 0;
        background-color: #f3f4f1;
        font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
        color: #2c3e50;
        -webkit-font-smoothing: antialiased;
      }
      .wrapper {
        width: 100%;
        background-color: #f3f4f1;
        padding: 40px 0;
      }
      .main-card {
        max-width: 600px;
        margin: 0 auto;
        background-color: #ffffff;
        border-radius: 12px;
        overflow: hidden;
        box-shadow: 0 10px 25px rgba(0,0,0,0.06);
        border: 1px solid #e2e8f0;
      }
      /* Header con verde oliva del logo */
      .header {
        background-color: #4B6B32;
        padding: 35px 25px 25px 25px;
        text-align: center;
        color: #ffffff;
      }
      .logo {
        width: 100px;
        height: 100px;
        border-radius: 50%;
        object-fit: cover;
        border: 3px solid #C5A059;
        margin-bottom: 12px;
      }
      .brand-title {
        margin: 0;
        font-size: 26px;
        font-weight: 700;
        letter-spacing: 1px;
        color: #ffffff;
      }
      .brand-slogan {
        margin: 6px 0 0 0;
        font-size: 12px;
        font-style: italic;
        color: #e2e8f0;
        letter-spacing: 0.5px;
      }
      /* Contenido */
      .content {
        padding: 35px 30px;
      }
      .headline {
        font-size: 20px;
        font-weight: 600;
        color: #4B6B32;
        margin-top: 0;
        margin-bottom: 4px;
      }
      .subheadline {
        font-size: 14px;
        color: #718096;
        margin-top: 0;
        margin-bottom: 20px;
      }
      .paragraph {
        font-size: 15px;
        line-height: 1.6;
        color: #4a5568;
        margin-bottom: 25px;
      }
      /* Event Badge */
      .event-badge {
        display: inline-block;
        background-color: #f0f4ec;
        color: #4B6B32;
        border: 1px solid #c5d6b8;
        padding: 6px 16px;
        border-radius: 20px;
        font-size: 13px;
        font-weight: 600;
        margin-bottom: 20px;
      }
      /* Detalle del Pedido / Tarjeta */
      .details-box {
        background-color: #fafbf9;
        border-left: 4px solid #C5A059;
        border-radius: 6px;
        padding: 20px;
        margin-bottom: 30px;
      }
      .detail-row {
        margin-bottom: 12px;
        font-size: 14px;
        color: #2d3748;
      }
      .detail-row:last-child {
        margin-bottom: 0;
      }
      .detail-label {
        font-weight: 700;
        color: #4B6B32;
        display: inline-block;
        width: 130px;
      }
      .detail-value {
        color: #4a5568;
      }
      /* Botón Dorado */
      .btn-container {
        text-align: center;
        margin: 30px 0 15px 0;
      }
      .btn {
        background-color: #C5A059;
        color: #ffffff !important;
        text-decoration: none;
        padding: 14px 28px;
        border-radius: 30px;
        font-weight: 700;
        font-size: 14px;
        display: inline-block;
        box-shadow: 0 4px 12px rgba(197, 160, 89, 0.35);
        transition: background-color 0.3s ease;
      }
      /* Footer */
      .footer {
        background-color: #1c2418;
        padding: 25px 20px;
        text-align: center;
        color: #a0aec0;
        font-size: 12px;
        line-height: 1.6;
      }
      .footer strong {
        color: #ffffff;
      }
      .footer-divider {
        height: 1px;
        background-color: #2d3748;
        margin: 15px auto;
        width: 60%;
      }
    </style>
  </head>
  <body>
    <div class="wrapper">
      <div class="main-card">
        
        <!-- Header con el Logo en Círculo Verde Oliva -->
        <div class="header">
          <img src="${COMPANY_INFO.logoUrl}" alt="${COMPANY_INFO.name}" class="logo">
          <h1 class="brand-title">${COMPANY_INFO.name}</h1>
          <p class="brand-slogan">"${COMPANY_INFO.slogan}"</p>
        </div>

        <!-- Cuerpo del mensaje -->
        <div class="content">
          <h2 class="headline">${titleHeader}</h2>
          <p class="subheadline">${subTitleHeader}</p>

          <p class="paragraph">${mainGreeting}</p>

          <div style="text-align: center;">
            <span class="event-badge">✨ Evento: ${eventType}</span>
          </div>

          <div class="details-box">
            <div class="detail-row">
              <span class="detail-label">👤 Nombre:</span>
              <span class="detail-value">${fullName}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">✉️ Correo:</span>
              <span class="detail-value">${email}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">📞 Teléfono:</span>
              <span class="detail-value">${phone}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">📝 Detalles:</span>
              <span class="detail-value">${details}</span>
            </div>
          </div>

          <div class="btn-container">
            <a href="${actionButtonLink}" class="btn" target="_blank">${actionButtonText}</a>
          </div>
        </div>

        <!-- Footer Institucional -->
        <div class="footer">
          <p style="margin: 0;"><strong>${COMPANY_INFO.name}</strong> - Eventos & Maestría de Ceremonias</p>
          <p style="margin: 4px 0 0 0;">RNC: ${COMPANY_INFO.rnc} | ${COMPANY_INFO.address}</p>
          
          <div class="footer-divider"></div>
          
          <p style="margin: 0; font-size: 11px;">
            Teléfono: ${COMPANY_INFO.phone} | Correo: ${COMPANY_INFO.email}
          </p>
          <p style="margin: 8px 0 0 0; font-size: 11px; color: #718096;">
            &copy; ${new Date().getFullYear()} ${COMPANY_INFO.name}. Todos los derechos reservados.
          </p>
        </div>

      </div>
    </div>
  </body>
  </html>
  `;
};

module.exports = { makeHtmlForContactPage };