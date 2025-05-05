const supabase = require('../config/supabase');
const { AppError } = require('../middleware/errorHandler');
const logger = require('../utils/logger');

/**
 * Get all users - admin only
 * @route GET /api/users
 * @access Private (Admin only)
 */
const getAllUsers = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, role, sort_by = 'created_at', order = 'desc' } = req.query;
    
    // Calculate pagination
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    // Build query
    let query = supabase
      .from('users')
      .select('id, email, first_name, last_name, role, phone, created_at', { count: 'exact' });

    // Add role filter if provided
    if (role) {
      query = query.eq('role', role);
    }

    // Add sorting and pagination
    query = query
      .order(sort_by, { ascending: order === 'asc' })
      .range(from, to);

    // Execute query
    const { data: users, error, count } = await query;

    if (error) {
      logger.error('Error fetching users:', error);
      return next(new AppError('Error fetching users', 500));
    }

    res.status(200).json({
      success: true,
      count,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count,
        pages: Math.ceil(count / limit),
      },
      data: users,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get user by ID - admin only
 * @route GET /api/users/:id
 * @access Private (Admin only)
 */
const getUserById = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Get user
    const { data: user, error } = await supabase
      .from('users')
      .select('id, email, first_name, last_name, role, phone, created_at')
      .eq('id', id)
      .single();

    if (error || !user) {
      return next(new AppError('User not found', 404));
    }

    // Get profile based on role
    let profile = null;
    if (user.role === 'farmer') {
      const { data: farmerProfile, error: profileError } = await supabase
        .from('farmer_profiles')
        .select('*')
        .eq('user_id', id)
        .single();

      if (!profileError) {
        profile = farmerProfile;
      }
    } else if (user.role === 'consumer') {
      const { data: consumerProfile, error: profileError } = await supabase
        .from('consumer_profiles')
        .select('*')
        .eq('user_id', id)
        .single();

      if (!profileError) {
        profile = consumerProfile;
      }
    }

    res.status(200).json({
      success: true,
      data: {
        ...user,
        profile,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update user profile
 * @route PUT /api/users/profile
 * @access Private
 */
const updateProfile = async (req, res, next) => {
  try {
    const { first_name, last_name, phone } = req.body;

    // Update user
    const { data: user, error } = await supabase
      .from('users')
      .update({
        first_name: first_name || req.user.first_name,
        last_name: last_name || req.user.last_name,
        phone: phone !== undefined ? phone : req.user.phone,
        updated_at: new Date(),
      })
      .eq('id', req.user.id)
      .select('id, email, first_name, last_name, role, phone, created_at, updated_at')
      .single();

    if (error) {
      logger.error('Error updating user profile:', error);
      return next(new AppError('Error updating profile', 500));
    }

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get farmer profile
 * @route GET /api/users/farmer/:id
 * @access Public
 */
const getFarmerProfile = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Get farmer profile
    const { data: farmerProfile, error } = await supabase
      .from('farmer_profiles')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !farmerProfile) {
      return next(new AppError('Farmer profile not found', 404));
    }

    // Get farmer user information
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('first_name, last_name, email')
      .eq('id', farmerProfile.user_id)
      .single();

    if (userError) {
      return next(new AppError('Error fetching farmer information', 500));
    }

    // Get farmer products
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select(`
        *,
        category:category_id(id, name)
      `)
      .eq('farmer_id', id)
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    res.status(200).json({
      success: true,
      data: {
        ...farmerProfile,
        user: {
          first_name: user.first_name,
          last_name: user.last_name,
          email: user.email,
        },
        products: productsError ? [] : products,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update farmer profile
 * @route PUT /api/users/farmer/profile
 * @access Private (Farmers only)
 */
const updateFarmerProfile = async (req, res, next) => {
  try {
    const { farm_name, description, location, profile_image, website } = req.body;

    // Get farmer profile
    const { data: farmerProfile, error: profileError } = await supabase
      .from('farmer_profiles')
      .select('id')
      .eq('user_id', req.user.id)
      .single();

    if (profileError || !farmerProfile) {
      return next(new AppError('Farmer profile not found', 404));
    }

    // Update farmer profile
    const { data: updatedProfile, error } = await supabase
      .from('farmer_profiles')
      .update({
        farm_name: farm_name || undefined,
        description: description !== undefined ? description : undefined,
        location: location || undefined,
        profile_image: profile_image !== undefined ? profile_image : undefined,
        website: website !== undefined ? website : undefined,
        updated_at: new Date(),
      })
      .eq('id', farmerProfile.id)
      .select()
      .single();

    if (error) {
      logger.error('Error updating farmer profile:', error);
      return next(new AppError('Error updating profile', 500));
    }

    res.status(200).json({
      success: true,
      data: updatedProfile,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get consumer profile
 * @route GET /api/users/consumer/profile
 * @access Private (Consumers only)
 */
const getConsumerProfile = async (req, res, next) => {
  try {
    // Get consumer profile
    const { data: consumerProfile, error } = await supabase
      .from('consumer_profiles')
      .select('*')
      .eq('user_id', req.user.id)
      .single();

    if (error || !consumerProfile) {
      return next(new AppError('Consumer profile not found', 404));
    }

    // Get default address if exists
    let defaultAddress = null;
    if (consumerProfile.default_address_id) {
      const { data: address, error: addressError } = await supabase
        .from('addresses')
        .select('*')
        .eq('id', consumerProfile.default_address_id)
        .single();

      if (!addressError) {
        defaultAddress = address;
      }
    }

    res.status(200).json({
      success: true,
      data: {
        ...consumerProfile,
        default_address: defaultAddress,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update consumer profile
 * @route PUT /api/users/consumer/profile
 * @access Private (Consumers only)
 */
const updateConsumerProfile = async (req, res, next) => {
  try {
    const { preferences } = req.body;

    // Get consumer profile
    const { data: consumerProfile, error: profileError } = await supabase
      .from('consumer_profiles')
      .select('id')
      .eq('user_id', req.user.id)
      .single();

    if (profileError || !consumerProfile) {
      return next(new AppError('Consumer profile not found', 404));
    }

    // Update consumer profile
    const { data: updatedProfile, error } = await supabase
      .from('consumer_profiles')
      .update({
        preferences: preferences || undefined,
        updated_at: new Date(),
      })
      .eq('id', consumerProfile.id)
      .select()
      .single();

    if (error) {
      logger.error('Error updating consumer profile:', error);
      return next(new AppError('Error updating profile', 500));
    }

    res.status(200).json({
      success: true,
      data: updatedProfile,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get user addresses
 * @route GET /api/users/addresses
 * @access Private
 */
const getUserAddresses = async (req, res, next) => {
  try {
    // Get addresses
    const { data: addresses, error } = await supabase
      .from('addresses')
      .select('*')
      .eq('user_id', req.user.id)
      .order('is_default', { ascending: false })
      .order('created_at', { ascending: false });

    if (error) {
      logger.error('Error fetching addresses:', error);
      return next(new AppError('Error fetching addresses', 500));
    }

    res.status(200).json({
      success: true,
      data: addresses,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Add address
 * @route POST /api/users/addresses
 * @access Private
 */
const addAddress = async (req, res, next) => {
  try {
    const { name, street_address, city, state, postal_code, country, is_default } = req.body;

    // Create address
    const { data: address, error } = await supabase
      .from('addresses')
      .insert([
        {
          user_id: req.user.id,
          name,
          street_address,
          city,
          state,
          postal_code,
          country,
          is_default: is_default || false,
        },
      ])
      .select()
      .single();

    if (error) {
      logger.error('Error adding address:', error);
      return next(new AppError('Error adding address', 500));
    }

    // If this is the default address, update other addresses
    if (is_default) {
      const { error: updateError } = await supabase
        .from('addresses')
        .update({ is_default: false })
        .eq('user_id', req.user.id)
        .neq('id', address.id);

      if (updateError) {
        logger.error('Error updating other addresses:', updateError);
      }

      // Update consumer profile if user is a consumer
      if (req.user.role === 'consumer') {
        const { data: consumerProfile, error: profileError } = await supabase
          .from('consumer_profiles')
          .select('id')
          .eq('user_id', req.user.id)
          .single();

        if (!profileError && consumerProfile) {
          const { error: updateProfileError } = await supabase
            .from('consumer_profiles')
            .update({ default_address_id: address.id })
            .eq('id', consumerProfile.id);

          if (updateProfileError) {
            logger.error('Error updating consumer profile:', updateProfileError);
          }
        }
      }
    }

    res.status(201).json({
      success: true,
      data: address,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update address
 * @route PUT /api/users/addresses/:id
 * @access Private
 */
const updateAddress = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, street_address, city, state, postal_code, country, is_default } = req.body;

    // Check if address exists and belongs to user
    const { data: existingAddress, error: checkError } = await supabase
      .from('addresses')
      .select('*')
      .eq('id', id)
      .eq('user_id', req.user.id)
      .single();

    if (checkError || !existingAddress) {
      return next(new AppError('Address not found', 404));
    }

    // Update address
    const { data: address, error } = await supabase
      .from('addresses')
      .update({
        name: name || undefined,
        street_address: street_address || undefined,
        city: city || undefined,
        state: state || undefined,
        postal_code: postal_code || undefined,
        country: country || undefined,
        is_default: is_default !== undefined ? is_default : undefined,
        updated_at: new Date(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      logger.error('Error updating address:', error);
      return next(new AppError('Error updating address', 500));
    }

    // If this is the default address, update other addresses
    if (is_default) {
      const { error: updateError } = await supabase
        .from('addresses')
        .update({ is_default: false })
        .eq('user_id', req.user.id)
        .neq('id', id);

      if (updateError) {
        logger.error('Error updating other addresses:', updateError);
      }

      // Update consumer profile if user is a consumer
      if (req.user.role === 'consumer') {
        const { data: consumerProfile, error: profileError } = await supabase
          .from('consumer_profiles')
          .select('id')
          .eq('user_id', req.user.id)
          .single();

        if (!profileError && consumerProfile) {
          const { error: updateProfileError } = await supabase
            .from('consumer_profiles')
            .update({ default_address_id: id })
            .eq('id', consumerProfile.id);

          if (updateProfileError) {
            logger.error('Error updating consumer profile:', updateProfileError);
          }
        }
      }
    }

    res.status(200).json({
      success: true,
      data: address,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete address
 * @route DELETE /api/users/addresses/:id
 * @access Private
 */
const deleteAddress = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Check if address exists and belongs to user
    const { data: existingAddress, error: checkError } = await supabase
      .from('addresses')
      .select('*')
      .eq('id', id)
      .eq('user_id', req.user.id)
      .single();

    if (checkError || !existingAddress) {
      return next(new AppError('Address not found', 404));
    }

    // If this is the default address, update consumer profile
    if (existingAddress.is_default && req.user.role === 'consumer') {
      const { data: consumerProfile, error: profileError } = await supabase
        .from('consumer_profiles')
        .select('id')
        .eq('user_id', req.user.id)
        .single();

      if (!profileError && consumerProfile) {
        const { error: updateProfileError } = await supabase
          .from('consumer_profiles')
          .update({ default_address_id: null })
          .eq('id', consumerProfile.id);

        if (updateProfileError) {
          logger.error('Error updating consumer profile:', updateProfileError);
        }
      }
    }

    // Delete address
    const { error } = await supabase
      .from('addresses')
      .delete()
      .eq('id', id);

    if (error) {
      logger.error('Error deleting address:', error);
      return next(new AppError('Error deleting address', 500));
    }

    res.status(200).json({
      success: true,
      message: 'Address deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Set default address
 * @route PUT /api/users/addresses/:id/default
 * @access Private
 */
const setDefaultAddress = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Check if address exists and belongs to user
    const { data: existingAddress, error: checkError } = await supabase
      .from('addresses')
      .select('*')
      .eq('id', id)
      .eq('user_id', req.user.id)
      .single();

    if (checkError || !existingAddress) {
      return next(new AppError('Address not found', 404));
    }

    // Update all addresses to not be default
    const { error: updateAllError } = await supabase
      .from('addresses')
      .update({ is_default: false })
      .eq('user_id', req.user.id);

    if (updateAllError) {
      logger.error('Error updating addresses:', updateAllError);
      return next(new AppError('Error setting default address', 500));
    }

    // Set this address as default
    const { data: address, error } = await supabase
      .from('addresses')
      .update({
        is_default: true,
        updated_at: new Date(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      logger.error('Error setting default address:', error);
      return next(new AppError('Error setting default address', 500));
    }

    // Update consumer profile if user is a consumer
    if (req.user.role === 'consumer') {
      const { data: consumerProfile, error: profileError } = await supabase
        .from('consumer_profiles')
        .select('id')
        .eq('user_id', req.user.id)
        .single();

      if (!profileError && consumerProfile) {
        const { error: updateProfileError } = await supabase
          .from('consumer_profiles')
          .update({ default_address_id: id })
          .eq('id', consumerProfile.id);

        if (updateProfileError) {
          logger.error('Error updating consumer profile:', updateProfileError);
        }
      }
    }

    res.status(200).json({
      success: true,
      data: address,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  updateProfile,
  getFarmerProfile,
  updateFarmerProfile,
  getConsumerProfile,
  updateConsumerProfile,
  getUserAddresses,
  addAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
};
