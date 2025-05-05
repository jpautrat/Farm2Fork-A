const express = require('express');
const { body } = require('express-validator');
const productController = require('../controllers/product.controller');
const { protect, authorize } = require('../middleware/auth');
const validateRequest = require('../middleware/validateRequest');
const { publicApi, noCache } = require('../middleware/cache');
const { relaxedLimiter } = require('../middleware/rateLimit');

/**
 * @swagger
 * tags:
 *   name: Products
 *   description: Product management
 */

const router = express.Router();

/**
 * @swagger
 * /api/products:
 *   get:
 *     summary: Get all products
 *     tags: [Products]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of items per page
 *       - in: query
 *         name: sort_by
 *         schema:
 *           type: string
 *           default: created_at
 *         description: Field to sort by
 *       - in: query
 *         name: order
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *         description: Sort order
 *     responses:
 *       200:
 *         description: List of products
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 count:
 *                   type: integer
 *                   example: 10
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     page:
 *                       type: integer
 *                       example: 1
 *                     limit:
 *                       type: integer
 *                       example: 10
 *                     total:
 *                       type: integer
 *                       example: 100
 *                     pages:
 *                       type: integer
 *                       example: 10
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Product'
 *       500:
 *         description: Server error
 */
router.get('/', relaxedLimiter, publicApi, productController.getAllProducts);

/**
 * @swagger
 * /api/products/{id}:
 *   get:
 *     summary: Get a product by ID
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Product ID
 *     responses:
 *       200:
 *         description: Product details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Product'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       500:
 *         description: Server error
 */
router.get('/:id', relaxedLimiter, publicApi, productController.getProduct);

/**
 * @swagger
 * /api/products:
 *   post:
 *     summary: Create a new product
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - description
 *               - price
 *               - unit
 *               - stock_quantity
 *               - category_id
 *             properties:
 *               name:
 *                 type: string
 *                 example: Organic Apples
 *               description:
 *                 type: string
 *                 example: Fresh organic apples from our farm
 *               price:
 *                 type: number
 *                 example: 2.99
 *               unit:
 *                 type: string
 *                 example: lb
 *               stock_quantity:
 *                 type: integer
 *                 example: 100
 *               image:
 *                 type: string
 *                 example: https://example.com/images/apple.jpg
 *               is_organic:
 *                 type: boolean
 *                 example: true
 *               is_featured:
 *                 type: boolean
 *                 example: false
 *               category_id:
 *                 type: string
 *                 example: 123e4567-e89b-12d3-a456-426614174000
 *     responses:
 *       201:
 *         description: Product created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Product'
 *       400:
 *         $ref: '#/components/responses/BadRequestError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         description: Server error
 */
router.post(
  '/',
  protect,
  authorize('farmer'),
  noCache,
  [
    body('name').notEmpty().withMessage('Product name is required'),
    body('description').notEmpty().withMessage('Description is required'),
    body('price').isNumeric().withMessage('Price must be a number'),
    body('unit').notEmpty().withMessage('Unit is required'),
    body('stock_quantity').isInt({ min: 0 }).withMessage('Stock quantity must be a positive integer'),
    body('category_id').notEmpty().withMessage('Category ID is required'),
  ],
  validateRequest,
  productController.createProduct
);

/**
 * @swagger
 * /api/products/{id}:
 *   put:
 *     summary: Update a product
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Product ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: Organic Apples
 *               description:
 *                 type: string
 *                 example: Fresh organic apples from our farm
 *               price:
 *                 type: number
 *                 example: 2.99
 *               unit:
 *                 type: string
 *                 example: lb
 *               stock_quantity:
 *                 type: integer
 *                 example: 100
 *               image:
 *                 type: string
 *                 example: https://example.com/images/apple.jpg
 *               is_organic:
 *                 type: boolean
 *                 example: true
 *               is_featured:
 *                 type: boolean
 *                 example: false
 *               category_id:
 *                 type: string
 *                 example: 123e4567-e89b-12d3-a456-426614174000
 *     responses:
 *       200:
 *         description: Product updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Product'
 *       400:
 *         $ref: '#/components/responses/BadRequestError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         description: Forbidden - User is not the owner of this product
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       500:
 *         description: Server error
 */
router.put(
  '/:id',
  protect,
  authorize('farmer'),
  noCache,
  [
    body('name').optional().notEmpty().withMessage('Product name cannot be empty'),
    body('description').optional().notEmpty().withMessage('Description cannot be empty'),
    body('price').optional().isNumeric().withMessage('Price must be a number'),
    body('unit').optional().notEmpty().withMessage('Unit cannot be empty'),
    body('stock_quantity').optional().isInt({ min: 0 }).withMessage('Stock quantity must be a positive integer'),
    body('category_id').optional().notEmpty().withMessage('Category ID cannot be empty'),
  ],
  validateRequest,
  productController.updateProduct
);

// Delete product - only farmers who own the product can delete it
router.delete('/:id', protect, authorize('farmer'), noCache, productController.deleteProduct);

// Get products by category
router.get('/category/:categoryId', relaxedLimiter, publicApi, productController.getProductsByCategory);

// Get products by farmer
router.get('/farmer/:farmerId', relaxedLimiter, publicApi, productController.getProductsByFarmer);

// Get featured products
router.get('/featured/list', relaxedLimiter, publicApi, productController.getFeaturedProducts);

// Search products
router.get('/search/:query', relaxedLimiter, publicApi, productController.searchProducts);

module.exports = router;
