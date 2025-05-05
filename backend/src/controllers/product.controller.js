const supabase = require('../config/supabase');
const { AppError } = require('../middleware/errorHandler');
const logger = require('../utils/logger');
const cache = require('../utils/cache');

/**
 * Get all products
 * @route GET /api/products
 * @access Public
 */
const getAllProducts = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, sort_by = 'created_at', order = 'desc' } = req.query;

    // Calculate pagination
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    // Create cache key based on query parameters
    const cacheKey = `products_${page}_${limit}_${sort_by}_${order}`;

    // Use getOrSet to get from cache or compute if not found
    const result = await cache.getOrSet(
      cacheKey,
      async () => {
        // Get products with farmer and category information
        const { data: products, error, count } = await supabase
          .from('products')
          .select(`
            *,
            farmer:farmer_id(id, farm_name, location, profile_image),
            category:category_id(id, name)
          `, { count: 'exact' })
          .order(sort_by, { ascending: order === 'asc' })
          .range(from, to);

        if (error) {
          logger.error('Error fetching products:', error);
          throw new AppError('Error fetching products', 500);
        }

        return {
          success: true,
          count,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total: count,
            pages: Math.ceil(count / limit),
          },
          data: products,
        };
      },
      300 // Cache for 5 minutes (300 seconds)
    );

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

/**
 * Get single product
 * @route GET /api/products/:id
 * @access Public
 */
const getProduct = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Create cache key
    const cacheKey = `product_${id}`;

    // Use getOrSet to get from cache or compute if not found
    const result = await cache.getOrSet(
      cacheKey,
      async () => {
        // Get product with farmer and category information
        const { data: product, error } = await supabase
          .from('products')
          .select(`
            *,
            farmer:farmer_id(id, farm_name, location, profile_image, user_id, description, website),
            category:category_id(id, name, description)
          `)
          .eq('id', id)
          .single();

        if (error || !product) {
          throw new AppError('Product not found', 404);
        }

        // Get farmer user information
        if (product.farmer && product.farmer.user_id) {
          const { data: farmerUser, error: farmerError } = await supabase
            .from('users')
            .select('first_name, last_name, email')
            .eq('id', product.farmer.user_id)
            .single();

          if (!farmerError && farmerUser) {
            product.farmer.user = {
              first_name: farmerUser.first_name,
              last_name: farmerUser.last_name,
              email: farmerUser.email,
            };
          }
        }

        // Get product reviews
        const { data: reviews, error: reviewsError } = await supabase
          .from('reviews')
          .select(`
            *,
            user:user_id(first_name, last_name)
          `)
          .eq('product_id', id)
          .order('created_at', { ascending: false });

        if (!reviewsError) {
          product.reviews = reviews;
        }

        return {
          success: true,
          data: product,
        };
      },
      300 // Cache for 5 minutes (300 seconds)
    );

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

/**
 * Create product
 * @route POST /api/products
 * @access Private (Farmers only)
 */
const createProduct = async (req, res, next) => {
  try {
    const {
      name,
      description,
      price,
      unit,
      stock_quantity,
      category_id,
      image,
      is_organic,
      is_featured,
    } = req.body;

    // Get farmer profile for the current user
    const { data: farmerProfile, error: farmerError } = await supabase
      .from('farmer_profiles')
      .select('id')
      .eq('user_id', req.user.id)
      .single();

    if (farmerError || !farmerProfile) {
      return next(new AppError('Farmer profile not found', 404));
    }

    // Create product
    const { data: product, error } = await supabase
      .from('products')
      .insert([
        {
          farmer_id: farmerProfile.id,
          category_id,
          name,
          description,
          price,
          unit,
          stock_quantity,
          image,
          is_organic: is_organic || false,
          is_featured: is_featured || false,
        },
      ])
      .select()
      .single();

    if (error) {
      logger.error('Error creating product:', error);
      return next(new AppError('Error creating product', 500));
    }

    // Invalidate relevant caches
    // Since we can't directly access the cache keys with Redis,
    // we'll clear the entire cache for simplicity
    // In a production environment, you might want a more targeted approach
    await cache.clear();

    res.status(201).json({
      success: true,
      data: product,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update product
 * @route PUT /api/products/:id
 * @access Private (Farmers only)
 */
const updateProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Get farmer profile for the current user
    const { data: farmerProfile, error: farmerError } = await supabase
      .from('farmer_profiles')
      .select('id')
      .eq('user_id', req.user.id)
      .single();

    if (farmerError || !farmerProfile) {
      return next(new AppError('Farmer profile not found', 404));
    }

    // Check if product exists and belongs to the farmer
    const { data: existingProduct, error: productError } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .eq('farmer_id', farmerProfile.id)
      .single();

    if (productError || !existingProduct) {
      return next(new AppError('Product not found or you are not authorized to update it', 404));
    }

    // Update product
    const { data: product, error } = await supabase
      .from('products')
      .update({
        ...updateData,
        updated_at: new Date(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      logger.error('Error updating product:', error);
      return next(new AppError('Error updating product', 500));
    }

    // Invalidate relevant caches
    // Since we can't directly access the cache keys with Redis,
    // we'll clear the entire cache for simplicity
    // In a production environment, you might want a more targeted approach
    await cache.clear();

    res.status(200).json({
      success: true,
      data: product,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete product
 * @route DELETE /api/products/:id
 * @access Private (Farmers only)
 */
const deleteProduct = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Get farmer profile for the current user
    const { data: farmerProfile, error: farmerError } = await supabase
      .from('farmer_profiles')
      .select('id')
      .eq('user_id', req.user.id)
      .single();

    if (farmerError || !farmerProfile) {
      return next(new AppError('Farmer profile not found', 404));
    }

    // Check if product exists and belongs to the farmer
    const { data: existingProduct, error: productError } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .eq('farmer_id', farmerProfile.id)
      .single();

    if (productError || !existingProduct) {
      return next(new AppError('Product not found or you are not authorized to delete it', 404));
    }

    // Delete product
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);

    if (error) {
      logger.error('Error deleting product:', error);
      return next(new AppError('Error deleting product', 500));
    }

    // Invalidate relevant caches
    // Since we can't directly access the cache keys with Redis,
    // we'll clear the entire cache for simplicity
    // In a production environment, you might want a more targeted approach
    await cache.clear();

    res.status(200).json({
      success: true,
      message: 'Product deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get products by category
 * @route GET /api/products/category/:categoryId
 * @access Public
 */
const getProductsByCategory = async (req, res, next) => {
  try {
    const { categoryId } = req.params;
    const { page = 1, limit = 10, sort_by = 'created_at', order = 'desc' } = req.query;

    // Calculate pagination
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    // Get products with farmer information
    const { data: products, error, count } = await supabase
      .from('products')
      .select(`
        *,
        farmer:farmer_id(id, farm_name, location, profile_image),
        category:category_id(id, name)
      `, { count: 'exact' })
      .eq('category_id', categoryId)
      .order(sort_by, { ascending: order === 'asc' })
      .range(from, to);

    if (error) {
      logger.error('Error fetching products by category:', error);
      return next(new AppError('Error fetching products', 500));
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
      data: products,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get products by farmer
 * @route GET /api/products/farmer/:farmerId
 * @access Public
 */
const getProductsByFarmer = async (req, res, next) => {
  try {
    const { farmerId } = req.params;
    const { page = 1, limit = 10, sort_by = 'created_at', order = 'desc' } = req.query;

    // Calculate pagination
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    // Get products with category information
    const { data: products, error, count } = await supabase
      .from('products')
      .select(`
        *,
        category:category_id(id, name)
      `, { count: 'exact' })
      .eq('farmer_id', farmerId)
      .order(sort_by, { ascending: order === 'asc' })
      .range(from, to);

    if (error) {
      logger.error('Error fetching products by farmer:', error);
      return next(new AppError('Error fetching products', 500));
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
      data: products,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get featured products
 * @route GET /api/products/featured/list
 * @access Public
 */
const getFeaturedProducts = async (req, res, next) => {
  try {
    const { limit = 8 } = req.query;

    // Create cache key
    const cacheKey = `featured_products_${limit}`;

    // Use getOrSet to get from cache or compute if not found
    const result = await cache.getOrSet(
      cacheKey,
      async () => {
        // Get featured products with farmer and category information
        const { data: products, error } = await supabase
          .from('products')
          .select(`
            *,
            farmer:farmer_id(id, farm_name, location, profile_image),
            category:category_id(id, name)
          `)
          .eq('is_featured', true)
          .eq('is_active', true)
          .order('created_at', { ascending: false })
          .limit(limit);

        if (error) {
          logger.error('Error fetching featured products:', error);
          throw new AppError('Error fetching featured products', 500);
        }

        return {
          success: true,
          count: products.length,
          data: products,
        };
      },
      600 // Cache for 10 minutes (600 seconds) since featured products change less frequently
    );

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

/**
 * Search products
 * @route GET /api/products/search/:query
 * @access Public
 */
const searchProducts = async (req, res, next) => {
  try {
    const { query } = req.params;
    const { page = 1, limit = 10 } = req.query;

    // Calculate pagination
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    // Search products with farmer and category information
    const { data: products, error, count } = await supabase
      .from('products')
      .select(`
        *,
        farmer:farmer_id(id, farm_name, location, profile_image),
        category:category_id(id, name)
      `, { count: 'exact' })
      .or(`name.ilike.%${query}%, description.ilike.%${query}%`)
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .range(from, to);

    if (error) {
      logger.error('Error searching products:', error);
      return next(new AppError('Error searching products', 500));
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
      data: products,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  getProductsByCategory,
  getProductsByFarmer,
  getFeaturedProducts,
  searchProducts,
};
