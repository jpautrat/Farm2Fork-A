'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { FaLeaf, FaShoppingCart } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import { useCartStore } from '@/store/cartStore';

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  unit: string;
  image: string;
  is_organic: boolean;
  stock_quantity: number;
  farmer: {
    id: string;
    farm_name: string;
  };
  category: {
    id: string;
    name: string;
  };
}

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useCartStore();

  const handleAddToCart = () => {
    if (product.stock_quantity < quantity) {
      toast.error('Not enough stock available');
      return;
    }

    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      quantity,
      unit: product.unit,
      farmer_id: product.farmer.id,
      farmer_name: product.farmer.farm_name,
    });

    toast.success(`Added ${quantity} ${product.unit} of ${product.name} to cart`);
  };

  const incrementQuantity = () => {
    if (quantity < product.stock_quantity) {
      setQuantity(quantity + 1);
    }
  };

  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  return (
    <div className="card h-full flex flex-col" role="article" aria-labelledby={`product-${product.id}-title`}>
      <div className="relative h-48 bg-gray-200">
        {product.image ? (
          <Image
            src={product.image}
            alt={product.name}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            priority={false}
          />
        ) : (
          <div className="flex items-center justify-center h-full" aria-label="No product image available">
            <p className="text-gray-500">No image available</p>
          </div>
        )}
        {product.is_organic && (
          <div
            className="absolute top-2 left-2 bg-green-500 text-white p-1 rounded-full"
            aria-label="Organic product"
            title="Organic product"
          >
            <FaLeaf className="text-sm" aria-hidden="true" />
          </div>
        )}
      </div>

      <div className="p-4 flex-grow flex flex-col">
        <div className="mb-2">
          <Link
            href={`/shop/product/${product.id}`}
            className="hover:text-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-600 focus:ring-offset-2 rounded-sm"
            aria-describedby={`product-${product.id}-description`}
          >
            <h3 id={`product-${product.id}-title`} className="font-semibold text-lg">{product.name}</h3>
          </Link>
          <Link
            href={`/farmers/${product.farmer.id}`}
            className="text-gray-600 text-sm hover:text-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-600 focus:ring-offset-2 rounded-sm"
            aria-label={`From ${product.farmer.farm_name}`}
          >
            {product.farmer.farm_name}
          </Link>
        </div>

        <p
          id={`product-${product.id}-description`}
          className="text-gray-700 text-sm mb-4 line-clamp-2 flex-grow"
        >
          {product.description}
        </p>

        <div className="mt-auto">
          <div className="flex justify-between items-center mb-2">
            <span className="font-bold text-lg" aria-label={`Price: $${product.price.toFixed(2)}`}>
              ${product.price.toFixed(2)}
            </span>
            <span className="text-gray-600 text-sm">per {product.unit}</span>
          </div>

          <div className="flex items-center justify-between">
            <div
              className="flex items-center border border-gray-300 rounded-md"
              role="group"
              aria-label="Quantity selector"
            >
              <button
                onClick={decrementQuantity}
                className="px-2 py-1 text-gray-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-600 focus:ring-offset-2"
                aria-label="Decrease quantity"
                disabled={quantity <= 1}
              >
                -
              </button>
              <span
                className="px-2 py-1 text-center w-10"
                aria-live="polite"
                aria-label={`Quantity: ${quantity}`}
              >
                {quantity}
              </span>
              <button
                onClick={incrementQuantity}
                className="px-2 py-1 text-gray-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-600 focus:ring-offset-2"
                aria-label="Increase quantity"
                disabled={quantity >= product.stock_quantity}
              >
                +
              </button>
            </div>

            <button
              onClick={handleAddToCart}
              className="btn-primary py-1 px-3 flex items-center focus:outline-none focus:ring-2 focus:ring-primary-600 focus:ring-offset-2"
              disabled={product.stock_quantity === 0}
              aria-label={`Add ${quantity} ${product.unit} of ${product.name} to cart`}
            >
              <FaShoppingCart className="mr-1" aria-hidden="true" />
              <span>Add</span>
            </button>
          </div>

          {product.stock_quantity === 0 && (
            <p className="text-red-500 text-sm mt-2" aria-live="polite">Out of stock</p>
          )}
          {product.stock_quantity > 0 && product.stock_quantity < 5 && (
            <p className="text-orange-500 text-sm mt-2" aria-live="polite">Only {product.stock_quantity} left</p>
          )}
        </div>
      </div>
    </div>
  );
}
