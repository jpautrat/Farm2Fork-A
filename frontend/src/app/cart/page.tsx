'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useUser } from '@supabase/auth-helpers-react';
import { FaTrash, FaArrowLeft, FaShoppingCart, FaLock } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import { useCartStore, CartItem } from '@/store/cartStore';

export default function CartPage() {
  const router = useRouter();
  const user = useUser();
  const { items, removeFromCart, updateQuantity, clearCart, getTotalPrice, getItemsByFarmer } = useCartStore();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleQuantityChange = (item: CartItem, newQuantity: number) => {
    if (newQuantity < 1) return;
    updateQuantity(item.id, newQuantity);
  };

  const handleRemoveItem = (itemId: string) => {
    removeFromCart(itemId);
    toast.success('Item removed from cart');
  };

  const handleClearCart = () => {
    clearCart();
    toast.success('Cart cleared');
  };

  const handleCheckout = () => {
    if (!user) {
      toast.error('Please sign in to checkout');
      router.push('/auth/login');
      return;
    }

    setIsProcessing(true);
    // Simulate processing
    setTimeout(() => {
      setIsProcessing(false);
      router.push('/checkout');
    }, 1000);
  };

  const itemsByFarmer = getItemsByFarmer();
  const totalPrice = getTotalPrice();
  const shippingFee = 5.99;
  const taxRate = 0.08; // 8% tax
  const taxAmount = totalPrice * taxRate;
  const orderTotal = totalPrice + shippingFee + taxAmount;

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto text-center">
          <FaShoppingCart className="mx-auto text-5xl text-gray-400 mb-4" />
          <h1 className="text-3xl font-bold mb-4">Your Cart is Empty</h1>
          <p className="text-gray-600 mb-8">
            Looks like you haven't added any products to your cart yet.
          </p>
          <Link href="/shop" className="btn-primary py-2 px-6">
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Your Shopping Cart</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-md overflow-hidden mb-4">
            <div className="p-4 border-b flex justify-between items-center">
              <h2 className="text-xl font-semibold">Cart Items</h2>
              <button
                onClick={handleClearCart}
                className="text-red-600 hover:text-red-800 text-sm flex items-center"
              >
                <FaTrash className="mr-1" /> Clear Cart
              </button>
            </div>

            {/* Group items by farmer */}
            {Object.entries(itemsByFarmer).map(([farmerId, farmerItems]) => (
              <div key={farmerId} className="border-b last:border-b-0">
                <div className="bg-gray-50 p-3">
                  <Link
                    href={`/farmers/${farmerId}`}
                    className="font-medium text-primary-600 hover:underline"
                  >
                    {farmerItems[0].farmer_name}
                  </Link>
                </div>

                {farmerItems.map((item) => (
                  <div key={item.id} className="p-4 border-t first:border-t-0 flex flex-col sm:flex-row">
                    <div className="sm:w-24 h-24 bg-gray-200 rounded-md overflow-hidden mb-4 sm:mb-0 sm:mr-4 flex-shrink-0">
                      {item.image ? (
                        <Image
                          src={item.image}
                          alt={item.name}
                          width={96}
                          height={96}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full">
                          <p className="text-gray-500 text-sm">No image</p>
                        </div>
                      )}
                    </div>

                    <div className="flex-grow">
                      <div className="flex flex-col sm:flex-row sm:justify-between">
                        <div>
                          <Link
                            href={`/shop/product/${item.id}`}
                            className="font-medium hover:text-primary-600"
                          >
                            {item.name}
                          </Link>
                          <p className="text-gray-600 text-sm">
                            ${item.price.toFixed(2)} per {item.unit}
                          </p>
                        </div>

                        <div className="mt-2 sm:mt-0 text-right">
                          <p className="font-bold">${(item.price * item.quantity).toFixed(2)}</p>
                        </div>
                      </div>

                      <div className="flex justify-between items-center mt-4">
                        <div className="flex items-center border border-gray-300 rounded-md">
                          <button
                            onClick={() => handleQuantityChange(item, item.quantity - 1)}
                            className="px-3 py-1 text-gray-600 hover:bg-gray-100"
                            aria-label="Decrease quantity"
                          >
                            -
                          </button>
                          <span className="px-3 py-1 text-center w-12">{item.quantity}</span>
                          <button
                            onClick={() => handleQuantityChange(item, item.quantity + 1)}
                            className="px-3 py-1 text-gray-600 hover:bg-gray-100"
                            aria-label="Increase quantity"
                          >
                            +
                          </button>
                        </div>

                        <button
                          onClick={() => handleRemoveItem(item.id)}
                          className="text-red-600 hover:text-red-800"
                          aria-label="Remove item"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>

          <Link
            href="/shop"
            className="inline-flex items-center text-primary-600 hover:text-primary-700"
          >
            <FaArrowLeft className="mr-2" /> Continue Shopping
          </Link>
        </div>

        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md overflow-hidden sticky top-4">
            <div className="p-4 border-b">
              <h2 className="text-xl font-semibold">Order Summary</h2>
            </div>
            <div className="p-4">
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">${totalPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Shipping</span>
                  <span className="font-medium">${shippingFee.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tax (8%)</span>
                  <span className="font-medium">${taxAmount.toFixed(2)}</span>
                </div>
                <div className="border-t pt-3 mt-3">
                  <div className="flex justify-between font-bold">
                    <span>Total</span>
                    <span>${orderTotal.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <button
                onClick={handleCheckout}
                disabled={isProcessing}
                className="w-full btn-primary py-3 mt-6 flex items-center justify-center"
              >
                {isProcessing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                    Processing...
                  </>
                ) : (
                  <>
                    <FaLock className="mr-2" /> Proceed to Checkout
                  </>
                )}
              </button>

              <div className="mt-4 text-center text-sm text-gray-600">
                <p>Secure checkout powered by Stripe</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
