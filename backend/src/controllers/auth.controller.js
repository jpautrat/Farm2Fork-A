const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const supabase = require('../config/supabase');
const { AppError } = require('../middleware/errorHandler');
const logger = require('../utils/logger');

/**
 * Register a new user
 * @route POST /api/auth/register
 * @access Public
 */
const register = async (req, res, next) => {
  try {
    const { email, password, first_name, last_name, role, phone } = req.body;

    // Check if user already exists
    const { data: existingUser, error: checkError } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (existingUser) {
      return next(new AppError('User already exists with that email', 400));
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const { data: user, error: createError } = await supabase
      .from('users')
      .insert([
        {
          email,
          password: hashedPassword,
          first_name,
          last_name,
          role,
          phone,
        },
      ])
      .select()
      .single();

    if (createError) {
      logger.error('Error creating user:', createError);
      return next(new AppError('Error creating user', 500));
    }

    // Create profile based on role
    if (role === 'farmer') {
      const { error: farmerProfileError } = await supabase
        .from('farmer_profiles')
        .insert([
          {
            user_id: user.id,
            farm_name: `${first_name}'s Farm`, // Default farm name
            location: 'Please update your location',
            description: 'Please update your farm description',
          },
        ]);

      if (farmerProfileError) {
        logger.error('Error creating farmer profile:', farmerProfileError);
        return next(new AppError('Error creating farmer profile', 500));
      }
    } else if (role === 'consumer') {
      const { error: consumerProfileError } = await supabase
        .from('consumer_profiles')
        .insert([
          {
            user_id: user.id,
            preferences: {},
          },
        ]);

      if (consumerProfileError) {
        logger.error('Error creating consumer profile:', consumerProfileError);
        return next(new AppError('Error creating consumer profile', 500));
      }
    }

    // Generate JWT token
    const token = generateToken(user.id);

    // Remove password from response
    delete user.password;

    res.status(201).json({
      success: true,
      token,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Login user
 * @route POST /api/auth/login
 * @access Public
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Check if user exists
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (error || !user) {
      return next(new AppError('Invalid credentials', 401));
    }

    // Check if password matches
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return next(new AppError('Invalid credentials', 401));
    }

    // Generate JWT token
    const token = generateToken(user.id);

    // Remove password from response
    delete user.password;

    res.status(200).json({
      success: true,
      token,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get current logged in user
 * @route GET /api/auth/me
 * @access Private
 */
const getMe = async (req, res, next) => {
  try {
    // User is already available in req.user from the protect middleware
    const user = req.user;

    // Remove password from response
    delete user.password;

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update password
 * @route PUT /api/auth/update-password
 * @access Private
 */
const updatePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    // Get user with password
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', req.user.id)
      .single();

    if (error || !user) {
      return next(new AppError('User not found', 404));
    }

    // Check if current password matches
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return next(new AppError('Current password is incorrect', 401));
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    const { error: updateError } = await supabase
      .from('users')
      .update({ password: hashedPassword, updated_at: new Date() })
      .eq('id', req.user.id);

    if (updateError) {
      return next(new AppError('Error updating password', 500));
    }

    res.status(200).json({
      success: true,
      message: 'Password updated successfully',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Forgot password
 * @route POST /api/auth/forgot-password
 * @access Public
 */
const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    // Check if user exists
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (error || !user) {
      return next(new AppError('There is no user with that email', 404));
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(20).toString('hex');
    const resetPasswordToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');
    const resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 minutes

    // Update user with reset token
    const { error: updateError } = await supabase
      .from('users')
      .update({
        reset_password_token: resetPasswordToken,
        reset_password_expire: resetPasswordExpire,
      })
      .eq('id', user.id);

    if (updateError) {
      return next(new AppError('Error generating reset token', 500));
    }

    // In a real application, you would send an email with the reset token
    // For this demo, we'll just return the token in the response
    res.status(200).json({
      success: true,
      message: 'Password reset token generated',
      resetToken, // In production, this would be sent via email, not in the response
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Reset password
 * @route PUT /api/auth/reset-password/:resetToken
 * @access Public
 */
const resetPassword = async (req, res, next) => {
  try {
    const { resetToken } = req.params;
    const { password } = req.body;

    // Hash the reset token from params
    const resetPasswordToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');

    // Find user with the reset token and check if token is expired
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('reset_password_token', resetPasswordToken)
      .gt('reset_password_expire', Date.now())
      .single();

    if (error || !user) {
      return next(new AppError('Invalid or expired reset token', 400));
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Update user password and clear reset token fields
    const { error: updateError } = await supabase
      .from('users')
      .update({
        password: hashedPassword,
        reset_password_token: null,
        reset_password_expire: null,
        updated_at: new Date(),
      })
      .eq('id', user.id);

    if (updateError) {
      return next(new AppError('Error resetting password', 500));
    }

    res.status(200).json({
      success: true,
      message: 'Password reset successful',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Generate JWT token
 */
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

module.exports = {
  register,
  login,
  getMe,
  updatePassword,
  forgotPassword,
  resetPassword,
};
