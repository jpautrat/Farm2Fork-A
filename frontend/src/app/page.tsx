import Link from 'next/link';
import Image from 'next/image';

export default function Home() {
  return (
    <div role="region" aria-label="Home page main content" className="min-h-screen">
      {/* Hero Section */}
      <section aria-labelledby="hero-heading" className="relative bg-gradient-to-b from-primary-50 to-white py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center">
            <div className="md:w-1/2 mb-10 md:mb-0">
              <h1 id="hero-heading" className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                Fresh from the Farm to Your Fork
              </h1>
              <p className="text-xl text-gray-700 mb-8">
                Connect directly with local farmers and enjoy fresh, sustainably grown food delivered to your door.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/shop" className="btn-primary text-center">
                  Shop Now
                </Link>
                <Link href="/farmers" className="btn-outline text-center">
                  Meet Our Farmers
                </Link>
              </div>
            </div>
            <div className="md:w-1/2 relative h-64 md:h-96 w-full">
              <div className="absolute inset-0 bg-gray-200 rounded-lg">
                {/* Placeholder for hero image */}
                <div className="flex items-center justify-center h-full">
                  <p className="text-gray-500">Hero Image Placeholder</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section aria-labelledby="featured-heading" className="py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <h2 id="featured-heading" className="text-3xl font-bold text-center mb-12">Featured Products</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Product cards would go here */}
            {[1, 2, 3, 4].map((item) => (
              <div key={item} className="card">
                <div className="h-48 bg-gray-200 relative">
                  <div className="flex items-center justify-center h-full">
                    <p className="text-gray-500">Product Image</p>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-lg">Product Name</h3>
                  <p className="text-gray-600 text-sm mb-2">Farmer Name</p>
                  <div className="flex justify-between items-center">
                    <span className="font-bold">$9.99</span>
                    <button className="btn-primary py-1 px-3 text-sm">Add to Cart</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="text-center mt-10">
            <Link href="/shop" className="btn-outline">
              View All Products
            </Link>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section aria-labelledby="howitworks-heading" className="py-16 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <h2 id="howitworks-heading" className="text-3xl font-bold text-center mb-12">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-primary-600 text-2xl font-bold">1</span>
              </div>
              <h3 className="font-bold text-xl mb-2">Browse Products</h3>
              <p className="text-gray-600">Explore fresh, locally-grown products from farmers in your area.</p>
            </div>
            <div className="text-center">
              <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-primary-600 text-2xl font-bold">2</span>
              </div>
              <h3 className="font-bold text-xl mb-2">Place Your Order</h3>
              <p className="text-gray-600">Select your items, choose delivery options, and complete your purchase.</p>
            </div>
            <div className="text-center">
              <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-primary-600 text-2xl font-bold">3</span>
              </div>
              <h3 className="font-bold text-xl mb-2">Receive Fresh Delivery</h3>
              <p className="text-gray-600">Get your order delivered directly to your door, fresh from the farm.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
