const cloudinary = require('../config/cloudinary');
const fs = require('fs'); // Para eliminar archivos temporales si usas Multer

/**
 * Sube una imagen a Cloudinary
 * @param {string} filePath - Ruta temporal del archivo
 * @param {string} subFolder - 'projects', 'blogs', 'tutorials', etc.
 */

exports.uploadFile = async (filePath, folder) => {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      folder: `hadassa05-imges/${folder}`,
      use_filename: true,
      unique_filename: true,
      overwrite: true,
    });


    return {
      public_id: result.public_id,
      url: result.secure_url
    };

  } catch (error) {
    console.error('Error en Cloudinary Service:', error);
    throw new Error('Error al subir la imagen a la nube');
  }
};

/**
 * Elimina una imagen de Cloudinary
 * @param {string} public_id - El ID público de la imagen
 */
exports.deleteFile = async (public_id) => {
  try {
    await cloudinary.uploader.destroy(public_id);
  } catch (error) {
    console.error('Error al eliminar en Cloudinary:', error);
  }
};