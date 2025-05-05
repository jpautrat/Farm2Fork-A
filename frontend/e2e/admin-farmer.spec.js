/**
 * E2E Test Specifications for Farmer and Admin Journeys
 * 
 * This file covers the end-to-end testing of the farmer and admin flows:
 * - Farmer login
 * - Managing farmer products
 * - Processing orders
 * - Admin dashboard
 * - Admin user management
 */

import { test, expect } from '@playwright/test';

test.describe('Farmer Journey', () => {
  test.beforeEach(async ({ page }) => {
    // Go to login page before each test
    await page.goto('/auth/login');
    
    // Login as farmer
    await page.fill('[name="email"]', 'farmer@example.com');
    await page.fill('[name="password"]', 'farmer123'); // Use test credentials
    await page.click('button:has-text("Login")');
    
    // Verify redirect to farmer dashboard
    await expect(page).toHaveURL(/\/farmer\/dashboard/);
  });

  test('should display farmer dashboard with key metrics', async ({ page }) => {
    // Check that key dashboard elements are visible
    await expect(page.locator('text=Recent Orders')).toBeVisible();
    await expect(page.locator('text=Product Inventory')).toBeVisible();
    await expect(page.locator('[data-testid="sales-chart"]')).toBeVisible();
  });

  test('should allow farmer to manage products', async ({ page }) => {
    // Navigate to products page
    await page.click('text=Products');
    
    // Verify on products page
    await expect(page).toHaveURL(/\/farmer\/products/);
    
    // Check existing products
    await expect(page.locator('[data-testid="product-list"]')).toBeVisible();
    
    // Click add new product
    await page.click('button:has-text("Add Product")');
    
    // Fill product form
    await page.fill('[name="name"]', 'Organic Apples');
    await page.fill('[name="description"]', 'Fresh organic apples');
    await page.fill('[name="price"]', '3.99');
    await page.fill('[name="unit"]', 'lb');
    await page.fill('[name="stock_quantity"]', '50');
    await page.selectOption('[name="category_id"]', { label: 'Fruits' });
    await page.check('[name="is_organic"]');
    
    // Submit form
    await page.click('button:has-text("Save Product")');
    
    // Verify success message
    await expect(page.locator('text=Product added successfully')).toBeVisible();
  });

  test('should allow farmer to process orders', async ({ page }) => {
    // Navigate to orders page
    await page.click('text=Orders');
    
    // Verify on orders page
    await expect(page).toHaveURL(/\/farmer\/orders/);
    
    // Find a pending order and open it
    await page.click('[data-status="pending"]');
    
    // Update order status to processing
    await page.selectOption('[name="status"]', 'processing');
    await page.click('button:has-text("Update Status")');
    
    // Verify success message
    await expect(page.locator('text=Order status updated')).toBeVisible();
  });
});

test.describe('Admin Journey', () => {
  test.beforeEach(async ({ page }) => {
    // Go to login page before each test
    await page.goto('/auth/login');
    
    // Login as admin
    await page.fill('[name="email"]', 'admin@farm2fork.com');
    await page.fill('[name="password"]', 'admin123'); // Use test credentials
    await page.click('button:has-text("Login")');
    
    // Verify redirect to admin dashboard
    await expect(page).toHaveURL(/\/admin\/dashboard/);
  });

  test('should display admin dashboard with system metrics', async ({ page }) => {
    // Check that key dashboard elements are visible
    await expect(page.locator('text=System Overview')).toBeVisible();
    await expect(page.locator('text=User Statistics')).toBeVisible();
    await expect(page.locator('[data-testid="orders-chart"]')).toBeVisible();
  });

  test('should allow admin to manage users', async ({ page }) => {
    // Navigate to users page
    await page.click('text=Users');
    
    // Verify on users page
    await expect(page).toHaveURL(/\/admin\/users/);
    
    // Check user list
    await expect(page.locator('[data-testid="user-list"]')).toBeVisible();
    
    // Edit a user
    await page.click('text=Edit', { nth: 0 });
    
    // Change user role
    await page.selectOption('[name="role"]', 'farmer');
    
    // Save changes
    await page.click('button:has-text("Save Changes")');
    
    // Verify success message
    await expect(page.locator('text=User updated successfully')).toBeVisible();
  });

  test('should allow admin to view system logs', async ({ page }) => {
    // Navigate to logs page
    await page.click('text=Logs');
    
    // Verify on logs page
    await expect(page).toHaveURL(/\/admin\/logs/);
    
    // Check logs are displayed
    await expect(page.locator('[data-testid="log-entries"]')).toBeVisible();
    
    // Filter logs
    await page.selectOption('[name="level"]', 'error');
    
    // Verify filter applied
    await expect(page.locator('[data-testid="log-entries"]')).toContainText('ERROR');
  });
});