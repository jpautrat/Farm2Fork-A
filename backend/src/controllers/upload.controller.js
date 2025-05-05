const supabase = require('../config/supabase');
const { AppError } = require('../middleware/errorHandler');
const logger = require('../utils/logger');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

/**
 * Upload image to Supabase Storage
 * @route POST /api/upload/image
 * @access Private
 */
const uploadImage = async (req, res, next) => {
  try {
    if (!req.file) {
      return next(new AppError('No image file provided', 400));
    }

    const file = req.file;
    const fileExt = path.extname(file.originalname).toLowerCase();
    const fileName = `${uuidv4()}${fileExt}`;
    
    // Determine the folder based on user role
    let folder = 'public';
    if (req.user.role === 'farmer') {
      folder = 'farmers';
    } else if (req.user.role === 'consumer') {
      folder = 'consumers';
    }
    
    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from('farm2fork')
      .upload(`${folder}/${fileName}`, file.buffer, {
        contentType: file.mimetype,
        upsert: false,
      });

    if (error) {
      logger.error('Error uploading image to Supabase Storage:', error);
      return next(new AppError('Error uploading image', 500));
    }

    // Get public URL
    const { data: publicUrlData } = supabase.storage
      .from('farm2fork')
      .getPublicUrl(`${folder}/${fileName}`);

    res.status(200).json({
      success: true,
      url: publicUrlData.publicUrl,
      key: `${folder}/${fileName}`,
    });
  } catch (error) {
    logger.error('Error in uploadImage controller:', error);
    next(error);
  }
};

module.exports = {
  uploadImage,
};
