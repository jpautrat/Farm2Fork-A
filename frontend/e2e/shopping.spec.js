/**
 * E2E Test Specifications for Shopping Journey
 * 
 * This file covers the end-to-end testing of the main shopping flows:
 * - Browse products
 * - Filter products
 * - View product details
 * - Add to cart
 * - Checkout process
 */

import { test, expect } from '@playwright/test';

test.describe('Shopping Journey', () => {
  test.beforeEach(async ({ page }) => {
    // Go to the homepage before each test
    await page.goto('/');
  });

  test('should navigate to shop page and display products', async ({ page }) => {
    // Navigate to shop page
    await page.click('text=Shop');
    
    // Verify we're on the shop page
    await expect(page).toHaveURL(/shop/);
    
    // Check that product cards are displayed
    await expect(page.locator('[role="article"]')).toBeVisible();
    await expect(page.locator('[role="article"]')).toHaveCount({ min: 1 });
  });

  test('should filter products by category', async ({ page }) => {
    // Navigate to shop page
    await page.goto('/shop');
    
    // Select a category filter (adjust based on available categories)
    await page.click('text=Vegetables');
    
    // Verify products are filtered
    await expect(page.locator('[role="article"]')).toBeVisible();
    await expect(page.locator('text=No products found')).not.toBeVisible();
  });

  test('should view product details', async ({ page }) => {
    // Navigate to shop page
    await page.goto('/shop');
    
    // Click on a product card
    await page.click('[role="article"] a', { force: true });
    
    // Verify we're on a product details page
    await expect(page).toHaveURL(/\/shop\/product\//);
    
    // Check that product details are displayed
    await expect(page.locator('h1')).toBeVisible(); // Product title
    await expect(page.locator('button:has-text("Add to Cart")')).toBeVisible();
  });

  test('should add product to cart and view cart', async ({ page }) => {
    // Navigate to shop page
    await page.goto('/shop');
    
    // Add a product to cart
    await page.click('[aria-label^="Add"][aria-label$="to cart"]');
    
    // Wait for toast notification
    await expect(page.locator('text=Added')).toBeVisible();
    
    // Navigate to cart
    await page.click('[aria-label="View cart"]');
    
    // Verify we're on the cart page
    await expect(page).toHaveURL(/\/cart/);
    
    // Check that product is in cart
    await expect(page.locator('[data-testid="cart-item"]')).toBeVisible();
  });

  test('should proceed through checkout process', async ({ page }) => {
    // Start with item in cart
    await page.goto('/shop');
    await page.click('[aria-label^="Add"][aria-label$="to cart"]');
    await page.click('[aria-label="View cart"]');
    
    // Begin checkout
    await page.click('button:has-text("Checkout")');
    
    // Verify we're on checkout page
    await expect(page).toHaveURL(/\/checkout/);
    
    // Fill in shipping information (adjust based on your form fields)
    await page.fill('[name="name"]', 'Test User');
    await page.fill('[name="email"]', 'test@example.com');
    await page.fill('[name="address"]', '123 Test St');
    await page.fill('[name="city"]', 'Test City');
    await page.fill('[name="state"]', 'TS');
    await page.fill('[name="postalCode"]', '12345');
    await page.fill('[name="phone"]', '555-123-4567');
    
    // Proceed to payment (implementation will depend on how you've integrated Stripe)
    await page.click('button:has-text("Continue to Payment")');
    
    // Fill in payment information (this is a mock since we can't easily test Stripe in E2E)
    // This step would need to be customized based on your Stripe Elements integration
    
    // Complete order
    await page.click('button:has-text("Complete Order")');
    
    // Verify order success
    await expect(page).toHaveURL(/\/checkout\/success/);
    await expect(page.locator('text=Thank you for your order')).toBeVisible();
  });
});