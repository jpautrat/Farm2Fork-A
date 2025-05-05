'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSupabaseClient, useUser } from '@supabase/auth-helpers-react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { FaLock, FaCreditCard, FaMapMarkerAlt, FaPlus } from 'react-icons/fa';
import { useCartStore } from '@/store/cartStore';
import axios from 'axios';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';

// Initialize Stripe
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

interface Address {
  id: string;
  name: string;
  street_address: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  is_default: boolean;
}

interface CheckoutFormProps {
  addresses: Address[];
  subtotal: number;
  shippingFee: number;
  taxAmount: number;
  total: number;
}

function CheckoutForm({ addresses, subtotal, shippingFee, taxAmount, total }: CheckoutFormProps) {
  const router = useRouter();
  const stripe = useStripe();
  const elements = useElements();
  const user = useUser();
  const { items, clearCart } = useCartStore();
  const [isProcessing, setIsProcessing] = useState(false);
  const [cardError, setCardError] = useState<string | null>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [showAddressForm, setShowAddressForm] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm({
    defaultValues: {
      shipping_address_id: '',
      notes: '',
    },
  });

  // Set default address if available
  useEffect(() => {
    const defaultAddress = addresses.find((addr) => addr.is_default);
    if (defaultAddress) {
      setValue('shipping_address_id', defaultAddress.id);
    } else if (addresses.length > 0) {
      setValue('shipping_address_id', addresses[0].id);
    }
  }, [addresses, setValue]);

  // Create payment intent when form is submitted
  const onSubmit = async (data: any) => {
    try {
      if (!stripe || !elements) {
        return;
      }

      const cardElement = elements.getElement(CardElement);
      if (!cardElement) {
        return;
      }

      setIsProcessing(true);

      // Create order
      const orderResponse = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/orders`,
        {
          items: items.map((item) => ({
            product_id: item.id,
            quantity: item.quantity,
          })),
          shipping_address_id: data.shipping_address_id,
          notes: data.notes,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('access_token')}`,
          },
        }
      );

      const orderId = orderResponse.data.data.id;

      // Create payment intent
      const paymentResponse = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/payments/create-payment-intent`,
        {
          order_id: orderId,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('access_token')}`,
          },
        }
      );

      const { clientSecret, paymentIntentId } = paymentResponse.data;

      // Confirm card payment
      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
          billing_details: {
            name: user?.user_metadata?.first_name + ' ' + user?.user_metadata?.last_name,
            email: user?.email,
          },
        },
      });

      if (error) {
        setCardError(error.message || 'An error occurred with your payment');
        setIsProcessing(false);
        return;
      }

      if (paymentIntent.status === 'succeeded') {
        // Process payment on backend
        await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL}/payments/process`,
          {
            order_id: orderId,
            payment_method: 'card',
            payment_intent_id: paymentIntentId,
          },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('access_token')}`,
            },
          }
        );

        // Clear cart and redirect to success page
        clearCart();
        toast.success('Payment successful!');
        router.push(`/checkout/success?order_id=${orderId}`);
      } else {
        setCardError('Payment processing error. Please try again.');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.error?.message || 'An error occurred during checkout');
      setCardError('Payment processing error. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} role="form" aria-labelledby="checkout-form-heading" className="space-y-8">
      <h2 id="checkout-form-heading" className="sr-only">Checkout Form</h2>

      {/* Shipping Address */}
      <div role="region" aria-labelledby="shipping-heading" className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-4 bg-gray-50 border-b flex items-center">
          <FaMapMarkerAlt className="text-primary-600 mr-2" />
          <h2 id="shipping-heading" className="text-lg font-semibold">Shipping Address</h2>
        </div>

        <div className="p-6">
          {addresses.length === 0 ? (
            <div className="text-center py-4">
              <p className="text-gray-600 mb-4">You don't have any saved addresses.</p>
              <button
                type="button"
                onClick={() => setShowAddressForm(true)}
                className="btn-primary py-2 px-4"
              >
                <FaPlus className="inline mr-2" /> Add New Address
              </button>
            </div>
          ) : (
            <fieldset aria-labelledby="shipping-heading" className="space-y-4">
              {addresses.map((address) => (
                <label
                  key={address.id}
                  className="flex items-start p-4 border rounded-md cursor-pointer hover:border-primary-500"
                >
                  <input
                    type="radio"
                    value={address.id}
                    {...register('shipping_address_id', { required: 'Please select an address' })}
                    className="mt-1 h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                  />
                  <div className="ml-3">
                    <p className="font-medium">{address.name}</p>
                    <p className="text-gray-600">
                      {address.street_address}, {address.city}, {address.state} {address.postal_code}
                    </p>
                    <p className="text-gray-600">{address.country}</p>
                    {address.is_default && (
                      <span className="inline-block mt-1 text-xs bg-primary-100 text-primary-800 px-2 py-1 rounded">
                        Default Address
                      </span>
                    )}
                  </div>
                </label>
              ))}

              {errors.shipping_address_id && (
                <p className="text-red-600 text-sm">{errors.shipping_address_id.message}</p>
              )}

              <button
                type="button"
                onClick={() => setShowAddressForm(true)}
                className="text-primary-600 hover:text-primary-800 flex items-center"
              >
                <FaPlus className="mr-1" /> Add New Address
              </button>
            </fieldset>
          )}
        </div>
      </div>

      {/* Payment Information */}
      <div role="region" aria-labelledby="payment-heading" className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-4 bg-gray-50 border-b flex items-center">
          <FaCreditCard className="text-primary-600 mr-2" />
          <h2 id="payment-heading" className="text-lg font-semibold">Payment Information</h2>
        </div>

        <div className="p-6">
          <div className="mb-4">
            <div role="group" aria-labelledby="card-info-label">
              <label id="card-info-label" className="block text-sm font-medium text-gray-700 mb-2">Card Information</label>
              <div className="border rounded-md p-3 focus-within:ring-2 focus-within:ring-primary-500 focus-within:border-primary-500">
                <CardElement
                  options={{
                    style: {
                      base: {
                        fontSize: '16px',
                        color: '#424770',
                        '::placeholder': {
                          color: '#aab7c4',
                        },
                      },
                      invalid: {
                        color: '#9e2146',
                      },
                    },
                  }}
                />
              </div>
            </div>
            {cardError && <p className="mt-2 text-sm text-red-600">{cardError}</p>}
          </div>

          <div className="mt-6">
            <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
              Order Notes (Optional)
            </label>
            <textarea
              id="notes"
              {...register('notes')}
              rows={3}
              className="input-field"
              placeholder="Special instructions for delivery or order"
            ></textarea>
          </div>
        </div>
      </div>

      {/* Order Summary */}
      <div role="region" aria-labelledby="order-summary-heading" className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-4 bg-gray-50 border-b">
          <h2 id="order-summary-heading" className="text-lg font-semibold">Order Summary</h2>
        </div>

        <div className="p-6">
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Subtotal</span>
              <span className="font-medium">${subtotal.toFixed(2)}</span>
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
                <span>${total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={isProcessing || !stripe}
            className="w-full btn-primary py-3 mt-6 flex items-center justify-center"
          >
            {isProcessing ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                Processing...
              </>
            ) : (
              <>
                <FaLock className="mr-2" /> Complete Order
              </>
            )}
          </button>

          <div className="mt-4 text-center text-sm text-gray-600">
            <p>
              By completing your purchase, you agree to our{' '}
              <a href="/terms" className="text-primary-600 hover:underline">
                Terms of Service
              </a>{' '}
              and{' '}
              <a href="/privacy" className="text-primary-600 hover:underline">
                Privacy Policy
              </a>
              .
            </p>
          </div>
        </div>
      </div>
    </form>
  );
}

export default function CheckoutPage() {
  const router = useRouter();
  const user = useUser();
  const supabaseClient = useSupabaseClient();
  const { items, getTotalPrice } = useCartStore();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const subtotal = getTotalPrice();
  const shippingFee = 5.99;
  const taxRate = 0.08; // 8% tax
  const taxAmount = subtotal * taxRate;
  const total = subtotal + shippingFee + taxAmount;

  useEffect(() => {
    // Redirect if cart is empty
    if (items.length === 0) {
      router.push('/cart');
      return;
    }

    // Redirect if not logged in
    if (!user) {
      toast.error('Please sign in to checkout');
      router.push('/auth/login');
      return;
    }

    // Fetch user addresses
    const fetchAddresses = async () => {
      try {
        setIsLoading(true);
        const { data, error } = await supabaseClient
          .from('addresses')
          .select('*')
          .eq('user_id', user.id)
          .order('is_default', { ascending: false });

        if (error) throw error;
        setAddresses(data || []);
      } catch (error: any) {
        toast.error('Failed to load addresses');
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };

    if (user) {
      fetchAddresses();
    }
  }, [user, items, router, supabaseClient]);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-12 flex justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <main role="main" aria-labelledby="checkout-heading" className="container mx-auto px-4 py-8">
      <h1 id="checkout-heading" className="text-3xl font-bold mb-8">Checkout</h1>

      <Elements stripe={stripePromise}>
        <CheckoutForm
          addresses={addresses}
          subtotal={subtotal}
          shippingFee={shippingFee}
          taxAmount={taxAmount}
          total={total}
        />
      </Elements>
    </main>
  );
}
