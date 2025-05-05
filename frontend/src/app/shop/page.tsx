'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useQuery } from 'react-query';
import axios from 'axios';
import ProductCard, { Product } from '@/components/products/ProductCard';
import { ProductCardSkeleton } from '@/components/ui/Skeleton';
import { FaFilter, FaSearch, FaLeaf, FaSortAmountDown, FaSortAmountUp, FaExclamationTriangle, FaRedo } from 'react-icons/fa';

interface Category {
  id: string;
  name: string;
}

export default function ShopPage() {
  const searchParams = useSearchParams();
  const categoryParam = searchParams.get('category');
  const searchParam = searchParams.get('search');

  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(categoryParam);
  const [searchTerm, setSearchTerm] = useState<string>(searchParam || '');
  const [isOrganic, setIsOrganic] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<string>('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState<number>(1);

  // Fetch categories
  const { data: categoriesData } = useQuery('categories', async () => {
    const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/categories`);
    return response.data.data;
  });

  // Fetch products with filters
  const {
    data: productsData,
    isLoading,
    isError,
    refetch,
  } = useQuery(
    ['products', selectedCategory, searchTerm, isOrganic, sortBy, sortOrder, currentPage],
    async () => {
      let url = `${process.env.NEXT_PUBLIC_API_URL}/products?page=${currentPage}&sort_by=${sortBy}&order=${sortOrder}`;

      if (selectedCategory) {
        url = `${process.env.NEXT_PUBLIC_API_URL}/products/category/${selectedCategory}?page=${currentPage}&sort_by=${sortBy}&order=${sortOrder}`;
      }

      if (searchTerm) {
        url = `${process.env.NEXT_PUBLIC_API_URL}/products/search/${searchTerm}?page=${currentPage}&sort_by=${sortBy}&order=${sortOrder}`;
      }

      if (isOrganic) {
        url += `&is_organic=true`;
      }

      const response = await axios.get(url);
      return response.data;
    },
    {
      keepPreviousData: true,
    }
  );

  useEffect(() => {
    if (categoriesData) {
      setCategories(categoriesData);
    }
  }, [categoriesData]);

  useEffect(() => {
    setSelectedCategory(categoryParam);
  }, [categoryParam]);

  useEffect(() => {
    setSearchTerm(searchParam || '');
  }, [searchParam]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    refetch();
  };

  const handleCategoryChange = (categoryId: string | null) => {
    setSelectedCategory(categoryId);
    setCurrentPage(1);
  };

  const handleSortChange = (value: string) => {
    setSortBy(value);
    setCurrentPage(1);
  };

  const handleSortOrderToggle = () => {
    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    setCurrentPage(1);
  };

  const handleOrganicToggle = () => {
    setIsOrganic(!isOrganic);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Shop Fresh Local Products</h1>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Filters Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-4 mb-4">
            <h2 className="text-lg font-semibold mb-4 flex items-center">
              <FaFilter className="mr-2" /> Filters
            </h2>

            {/* Search */}
            <div className="mb-6">
              <h3 className="text-md font-medium mb-2" id="search-label">Search</h3>
              <form onSubmit={handleSearch} className="flex" role="search">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search products..."
                  className="input-field flex-grow"
                  aria-labelledby="search-label"
                />
                <button
                  type="submit"
                  className="btn-primary ml-2 focus:outline-none focus:ring-2 focus:ring-primary-600 focus:ring-offset-2"
                  aria-label="Search products"
                >
                  <FaSearch aria-hidden="true" />
                </button>
              </form>
            </div>

            {/* Categories */}
            <div className="mb-6">
              <h3 className="text-md font-medium mb-2" id="categories-label">Categories</h3>
              <ul className="space-y-1" role="radiogroup" aria-labelledby="categories-label">
                <li>
                  <button
                    onClick={() => handleCategoryChange(null)}
                    className={`w-full text-left px-2 py-1 rounded hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-600 focus:ring-offset-2 ${
                      !selectedCategory ? 'bg-primary-50 text-primary-600 font-medium' : ''
                    }`}
                    role="radio"
                    aria-checked={!selectedCategory}
                  >
                    All Products
                  </button>
                </li>
                {categories.map((category) => (
                  <li key={category.id}>
                    <button
                      onClick={() => handleCategoryChange(category.id)}
                      className={`w-full text-left px-2 py-1 rounded hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-600 focus:ring-offset-2 ${
                        selectedCategory === category.id
                          ? 'bg-primary-50 text-primary-600 font-medium'
                          : ''
                      }`}
                      role="radio"
                      aria-checked={selectedCategory === category.id}
                    >
                      {category.name}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Organic Filter */}
            <div className="mb-6">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isOrganic}
                  onChange={handleOrganicToggle}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  id="organic-filter"
                  aria-label="Show only organic products"
                />
                <span className="flex items-center" id="organic-label">
                  <FaLeaf className="text-green-500 mr-1" aria-hidden="true" /> Organic Only
                </span>
              </label>
            </div>

            {/* Sort Options */}
            <div>
              <h3 className="text-md font-medium mb-2" id="sort-label">Sort By</h3>
              <div className="flex flex-col space-y-2">
                <select
                  value={sortBy}
                  onChange={(e) => handleSortChange(e.target.value)}
                  className="input-field"
                  aria-labelledby="sort-label"
                  id="sort-select"
                >
                  <option value="created_at">Newest</option>
                  <option value="price">Price</option>
                  <option value="name">Name</option>
                </select>
                <button
                  onClick={handleSortOrderToggle}
                  className="flex items-center justify-center btn-outline py-1 focus:outline-none focus:ring-2 focus:ring-primary-600 focus:ring-offset-2"
                  aria-pressed={sortOrder === 'asc'}
                  aria-label={`Sort ${sortOrder === 'asc' ? 'ascending' : 'descending'}`}
                >
                  {sortOrder === 'asc' ? (
                    <>
                      <FaSortAmountUp className="mr-1" aria-hidden="true" /> Ascending
                    </>
                  ) : (
                    <>
                      <FaSortAmountDown className="mr-1" aria-hidden="true" /> Descending
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Products Grid */}
        <div className="lg:col-span-3">
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6" aria-live="polite" aria-busy="true">
              {[...Array(6)].map((_, index) => (
                <ProductCardSkeleton key={index} />
              ))}
            </div>
          ) : isError ? (
            <div className="bg-red-50 text-red-600 p-6 rounded-md flex flex-col items-center" role="alert">
              <FaExclamationTriangle className="text-3xl mb-4" />
              <h3 className="text-xl font-medium mb-2">Error loading products</h3>
              <p className="text-center mb-4">
                We encountered a problem while loading the products. Please try again.
              </p>
              <button
                onClick={() => refetch()}
                className="btn-primary flex items-center"
                aria-label="Retry loading products"
              >
                <FaRedo className="mr-2" /> Retry
              </button>
            </div>
          ) : productsData?.data?.length === 0 ? (
            <div className="bg-gray-50 p-8 rounded-md text-center" role="status">
              <h3 className="text-xl font-medium mb-2">No products found</h3>
              <p className="text-gray-600">
                Try adjusting your filters or search terms to find what you're looking for.
              </p>
            </div>
          ) : (
            <>
              <div
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
                aria-live="polite"
              >
                {productsData?.data?.map((product: Product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>

              {/* Pagination */}
              {productsData?.pagination && productsData.pagination.pages > 1 && (
                <nav className="mt-8 flex justify-center" aria-label="Pagination">
                  <div className="flex space-x-1">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="px-4 py-2 border rounded-md hover:bg-gray-50 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-primary-600 focus:ring-offset-2"
                      aria-label="Go to previous page"
                    >
                      Previous
                    </button>
                    {Array.from({ length: productsData.pagination.pages }, (_, i) => i + 1).map(
                      (page) => (
                        <button
                          key={page}
                          onClick={() => handlePageChange(page)}
                          className={`px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-600 focus:ring-offset-2 ${
                            currentPage === page
                              ? 'bg-primary-600 text-white'
                              : 'hover:bg-gray-50'
                          }`}
                          aria-label={`Go to page ${page}`}
                          aria-current={currentPage === page ? 'page' : undefined}
                        >
                          {page}
                        </button>
                      )
                    )}
                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === productsData.pagination.pages}
                      className="px-4 py-2 border rounded-md hover:bg-gray-50 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-primary-600 focus:ring-offset-2"
                      aria-label="Go to next page"
                    >
                      Next
                    </button>
                  </div>
                </nav>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
