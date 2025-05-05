const bcrypt = require('bcrypt');
const supabase = require('./supabase');
const logger = require('../utils/logger');

/**
 * Seed the database with initial data
 */
const seedDatabase = async () => {
  try {
    logger.info('Starting database seeding...');

    // Hash passwords for demo users
    const adminPassword = await bcrypt.hash('admin123', 10);
    const farmerPassword = await bcrypt.hash('farmer123', 10);
    const consumerPassword = await bcrypt.hash('consumer123', 10);

    // Create demo users
    const { data: users, error: usersError } = await supabase.from('users').upsert([
      {
        email: 'admin@farm2fork.com',
        password: adminPassword,
        first_name: 'Admin',
        last_name: 'User',
        role: 'admin',
        phone: '555-123-4567',
      },
      {
        email: 'farmer@farm2fork.com',
        password: farmerPassword,
        first_name: 'John',
        last_name: 'Farmer',
        role: 'farmer',
        phone: '555-234-5678',
      },
      {
        email: 'consumer@farm2fork.com',
        password: consumerPassword,
        first_name: 'Sarah',
        last_name: 'Consumer',
        role: 'consumer',
        phone: '555-345-6789',
      },
    ], { onConflict: 'email' });

    if (usersError) {
      throw new Error(`Error seeding users: ${usersError.message}`);
    }

    logger.info('Users seeded successfully');

    // Get user IDs
    const { data: seededUsers, error: fetchUsersError } = await supabase
      .from('users')
      .select('id, email, role')
      .in('email', ['admin@farm2fork.com', 'farmer@farm2fork.com', 'consumer@farm2fork.com']);

    if (fetchUsersError) {
      throw new Error(`Error fetching seeded users: ${fetchUsersError.message}`);
    }

    const adminUser = seededUsers.find(user => user.email === 'admin@farm2fork.com');
    const farmerUser = seededUsers.find(user => user.email === 'farmer@farm2fork.com');
    const consumerUser = seededUsers.find(user => user.email === 'consumer@farm2fork.com');

    // Create farmer profile
    const { data: farmerProfile, error: farmerProfileError } = await supabase
      .from('farmer_profiles')
      .upsert([
        {
          user_id: farmerUser.id,
          farm_name: 'Green Valley Farm',
          description: 'Family-owned farm specializing in organic vegetables and free-range eggs.',
          location: 'Greenfield, CA',
          profile_image: 'https://example.com/farmer.jpg',
          website: 'https://greenvalleyfarm.example.com',
        },
      ], { onConflict: 'user_id' });

    if (farmerProfileError) {
      throw new Error(`Error seeding farmer profile: ${farmerProfileError.message}`);
    }

    logger.info('Farmer profile seeded successfully');

    // Create consumer address
    const { data: address, error: addressError } = await supabase
      .from('addresses')
      .upsert([
        {
          user_id: consumerUser.id,
          name: 'Home',
          street_address: '123 Main St',
          city: 'Anytown',
          state: 'CA',
          postal_code: '12345',
          country: 'USA',
          is_default: true,
        },
      ], { onConflict: 'user_id, name' });

    if (addressError) {
      throw new Error(`Error seeding address: ${addressError.message}`);
    }

    // Get address ID
    const { data: seededAddresses, error: fetchAddressesError } = await supabase
      .from('addresses')
      .select('id')
      .eq('user_id', consumerUser.id)
      .eq('is_default', true)
      .single();

    if (fetchAddressesError) {
      throw new Error(`Error fetching seeded address: ${fetchAddressesError.message}`);
    }

    // Create consumer profile
    const { data: consumerProfile, error: consumerProfileError } = await supabase
      .from('consumer_profiles')
      .upsert([
        {
          user_id: consumerUser.id,
          default_address_id: seededAddresses.id,
          preferences: { dietary: ['vegetarian'], allergies: ['nuts'] },
        },
      ], { onConflict: 'user_id' });

    if (consumerProfileError) {
      throw new Error(`Error seeding consumer profile: ${consumerProfileError.message}`);
    }

    logger.info('Consumer profile seeded successfully');

    // Create product categories
    const { data: categories, error: categoriesError } = await supabase
      .from('categories')
      .upsert([
        {
          name: 'Vegetables',
          description: 'Fresh, locally grown vegetables',
          image: 'https://example.com/vegetables.jpg',
        },
        {
          name: 'Fruits',
          description: 'Seasonal fruits from local orchards',
          image: 'https://example.com/fruits.jpg',
        },
        {
          name: 'Dairy',
          description: 'Farm-fresh dairy products',
          image: 'https://example.com/dairy.jpg',
        },
        {
          name: 'Eggs',
          description: 'Free-range, organic eggs',
          image: 'https://example.com/eggs.jpg',
        },
        {
          name: 'Meat',
          description: 'Ethically raised, grass-fed meats',
          image: 'https://example.com/meat.jpg',
        },
      ], { onConflict: 'name' });

    if (categoriesError) {
      throw new Error(`Error seeding categories: ${categoriesError.message}`);
    }

    logger.info('Categories seeded successfully');

    // Get category IDs
    const { data: seededCategories, error: fetchCategoriesError } = await supabase
      .from('categories')
      .select('id, name');

    if (fetchCategoriesError) {
      throw new Error(`Error fetching seeded categories: ${fetchCategoriesError.message}`);
    }

    // Get farmer profile ID
    const { data: farmerProfiles, error: fetchFarmerProfilesError } = await supabase
      .from('farmer_profiles')
      .select('id')
      .eq('user_id', farmerUser.id)
      .single();

    if (fetchFarmerProfilesError) {
      throw new Error(`Error fetching farmer profile: ${fetchFarmerProfilesError.message}`);
    }

    const vegetablesCategory = seededCategories.find(category => category.name === 'Vegetables');
    const fruitsCategory = seededCategories.find(category => category.name === 'Fruits');
    const dairyCategory = seededCategories.find(category => category.name === 'Dairy');
    const eggsCategory = seededCategories.find(category => category.name === 'Eggs');

    // Create sample products
    const { data: products, error: productsError } = await supabase
      .from('products')
      .upsert([
        {
          farmer_id: farmerProfiles.id,
          category_id: vegetablesCategory.id,
          name: 'Organic Carrots',
          description: 'Fresh, organic carrots harvested daily.',
          price: 3.99,
          unit: 'bunch',
          stock_quantity: 50,
          image: 'https://example.com/carrots.jpg',
          is_organic: true,
          is_featured: true,
        },
        {
          farmer_id: farmerProfiles.id,
          category_id: vegetablesCategory.id,
          name: 'Kale',
          description: 'Nutrient-rich kale, perfect for salads and smoothies.',
          price: 2.99,
          unit: 'bunch',
          stock_quantity: 30,
          image: 'https://example.com/kale.jpg',
          is_organic: true,
          is_featured: false,
        },
        {
          farmer_id: farmerProfiles.id,
          category_id: fruitsCategory.id,
          name: 'Strawberries',
          description: 'Sweet, juicy strawberries picked at peak ripeness.',
          price: 4.99,
          unit: 'pint',
          stock_quantity: 20,
          image: 'https://example.com/strawberries.jpg',
          is_organic: true,
          is_featured: true,
        },
        {
          farmer_id: farmerProfiles.id,
          category_id: eggsCategory.id,
          name: 'Free-Range Eggs',
          description: 'Farm-fresh eggs from free-range chickens.',
          price: 5.99,
          unit: 'dozen',
          stock_quantity: 40,
          image: 'https://example.com/eggs.jpg',
          is_organic: true,
          is_featured: true,
        },
      ], { onConflict: 'farmer_id, name' });

    if (productsError) {
      throw new Error(`Error seeding products: ${productsError.message}`);
    }

    logger.info('Products seeded successfully');
    logger.info('Database seeding completed successfully');

    return { success: true };
  } catch (error) {
    logger.error('Error seeding database:', error);
    return { success: false, error: error.message };
  }
};

module.exports = seedDatabase;
