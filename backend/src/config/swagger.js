const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Farm2Fork API Documentation',
      version: '1.0.0',
      description: 'API documentation for the Farm2Fork platform',
      contact: {
        name: 'Farm2Fork Support',
        email: 'support@farm2fork.com',
      },
    },
    servers: [
      {
        url: process.env.API_URL || 'http://localhost:5000',
        description: 'Development server',
      },
      {
        url: 'https://api.farm2fork.com',
        description: 'Production server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        User: {
          type: 'object',
          required: ['email', 'password', 'first_name', 'last_name', 'role'],
          properties: {
            id: {
              type: 'string',
              description: 'User ID',
              example: '123e4567-e89b-12d3-a456-426614174000',
            },
            email: {
              type: 'string',
              description: 'User email',
              example: 'user@example.com',
            },
            first_name: {
              type: 'string',
              description: 'User first name',
              example: 'John',
            },
            last_name: {
              type: 'string',
              description: 'User last name',
              example: 'Doe',
            },
            role: {
              type: 'string',
              description: 'User role',
              enum: ['admin', 'farmer', 'consumer'],
              example: 'consumer',
            },
            created_at: {
              type: 'string',
              format: 'date-time',
              description: 'User creation date',
            },
            updated_at: {
              type: 'string',
              format: 'date-time',
              description: 'User last update date',
            },
          },
        },
        Product: {
          type: 'object',
          required: ['name', 'description', 'price', 'unit', 'stock_quantity', 'farmer_id', 'category_id'],
          properties: {
            id: {
              type: 'string',
              description: 'Product ID',
              example: '123e4567-e89b-12d3-a456-426614174000',
            },
            name: {
              type: 'string',
              description: 'Product name',
              example: 'Organic Apples',
            },
            description: {
              type: 'string',
              description: 'Product description',
              example: 'Fresh organic apples from our farm',
            },
            price: {
              type: 'number',
              description: 'Product price',
              example: 2.99,
            },
            unit: {
              type: 'string',
              description: 'Product unit',
              example: 'lb',
            },
            stock_quantity: {
              type: 'integer',
              description: 'Product stock quantity',
              example: 100,
            },
            image: {
              type: 'string',
              description: 'Product image URL',
              example: 'https://example.com/images/apple.jpg',
            },
            is_organic: {
              type: 'boolean',
              description: 'Whether the product is organic',
              example: true,
            },
            is_featured: {
              type: 'boolean',
              description: 'Whether the product is featured',
              example: false,
            },
            farmer_id: {
              type: 'string',
              description: 'Farmer ID',
              example: '123e4567-e89b-12d3-a456-426614174000',
            },
            category_id: {
              type: 'string',
              description: 'Category ID',
              example: '123e4567-e89b-12d3-a456-426614174000',
            },
            created_at: {
              type: 'string',
              format: 'date-time',
              description: 'Product creation date',
            },
            updated_at: {
              type: 'string',
              format: 'date-time',
              description: 'Product last update date',
            },
          },
        },
        Order: {
          type: 'object',
          required: ['user_id', 'total_amount', 'shipping_address_id', 'payment_intent_id'],
          properties: {
            id: {
              type: 'string',
              description: 'Order ID',
              example: '123e4567-e89b-12d3-a456-426614174000',
            },
            user_id: {
              type: 'string',
              description: 'User ID',
              example: '123e4567-e89b-12d3-a456-426614174000',
            },
            total_amount: {
              type: 'number',
              description: 'Order total amount',
              example: 29.99,
            },
            status: {
              type: 'string',
              description: 'Order status',
              enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
              example: 'pending',
            },
            shipping_address_id: {
              type: 'string',
              description: 'Shipping address ID',
              example: '123e4567-e89b-12d3-a456-426614174000',
            },
            payment_intent_id: {
              type: 'string',
              description: 'Stripe payment intent ID',
              example: 'pi_1234567890',
            },
            created_at: {
              type: 'string',
              format: 'date-time',
              description: 'Order creation date',
            },
            updated_at: {
              type: 'string',
              format: 'date-time',
              description: 'Order last update date',
            },
          },
        },
      },
      responses: {
        UnauthorizedError: {
          description: 'Access token is missing or invalid',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: {
                    type: 'boolean',
                    example: false,
                  },
                  message: {
                    type: 'string',
                    example: 'Unauthorized',
                  },
                },
              },
            },
          },
        },
        NotFoundError: {
          description: 'Resource not found',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: {
                    type: 'boolean',
                    example: false,
                  },
                  message: {
                    type: 'string',
                    example: 'Resource not found',
                  },
                },
              },
            },
          },
        },
        BadRequestError: {
          description: 'Bad request',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: {
                    type: 'boolean',
                    example: false,
                  },
                  message: {
                    type: 'string',
                    example: 'Bad request',
                  },
                  errors: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        field: {
                          type: 'string',
                          example: 'email',
                        },
                        message: {
                          type: 'string',
                          example: 'Invalid email format',
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ['./src/routes/*.js', './src/controllers/*.js'],
};

const specs = swaggerJsdoc(options);

module.exports = specs;
