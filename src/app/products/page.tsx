'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useStore } from '@/store/useStore';
import { useHydrated } from '@/hooks/useHydrated';
import { useDebounce } from '@/hooks/useDebounce';
import { 
  Search, 
  Heart, 
  Star, 
  ShoppingBag, 
  SlidersHorizontal, 
  ArrowUpDown,
  X,
  Plus,
  Minus
} from 'lucide-react';
import { mockCategories, mockReviews, mockProducts } from '@/lib/mockData';
import { motion, AnimatePresence } from 'framer-motion';

// Premium Product Card Skeleton Loader
const ProductCardSkeleton = () => {
  return (
    <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm flex flex-col h-full animate-pulse">
      {/* Image area */}
      <div className="h-44 bg-slate-100 w-full" />
      {/* Details */}
      <div className="p-4 flex-grow flex flex-col justify-between space-y-4">
        <div className="space-y-2">
          <div className="h-3.5 bg-slate-150 rounded w-1/3" />
          <div className="h-4 bg-slate-150 rounded w-3/4" />
          <div className="h-3 bg-slate-100 rounded w-1/4" />
        </div>
        <div className="flex items-center justify-between pt-3 border-t border-slate-100 w-full">
          <div className="h-5 bg-slate-150 rounded w-1/4" />
          <div className="h-8 bg-slate-150 rounded-full w-1/3" />
        </div>
      </div>
    </div>
  );
};

// Separate core component to isolate useSearchParams inside Suspense
const ProductsContent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isHydrated = useHydrated();

  // Zustand State
  const adminProducts = useStore((state) => state.adminProducts);
  const addToCart = useStore((state) => state.addToCart);
  const toggleWishlist = useStore((state) => state.toggleWishlist);
  const inWishlist = useStore((state) => state.inWishlist);

  // States initialized from search parameters
  const [selectedCategory, setSelectedCategory] = useState<string>(() => searchParams.get('category') || 'all');
  const [searchQuery, setSearchQuery] = useState<string>(() => searchParams.get('search') || '');
  const [sortBy, setSortBy] = useState<string>(() => searchParams.get('sort') || 'default');
  const [maxPrice, setMaxPrice] = useState<number>(() => {
    const p = searchParams.get('maxPrice');
    return p ? parseFloat(p) : 1000;
  });
  const [isOrganicOnly, setIsOrganicOnly] = useState<boolean>(() => searchParams.get('organic') === 'true');
  const [isFeaturedOnly, setIsFeaturedOnly] = useState<boolean>(() => searchParams.get('featured') === 'true');
  const [isInStockOnly, setIsInStockOnly] = useState<boolean>(() => searchParams.get('inStock') === 'true');
  const [currentPage, setCurrentPage] = useState<number>(() => {
    const p = searchParams.get('page');
    return p ? parseInt(p, 10) : 1;
  });
  const [totalPages, setTotalPages] = useState<number>(1);

  const [quickViewProduct, setQuickViewProduct] = useState<any>(null);
  const [quickViewQty, setQuickViewQty] = useState(1);

  // Reusable debouncing hooks
  const debouncedSearchQuery = useDebounce(searchQuery, 300);
  const debouncedMaxPrice = useDebounce(maxPrice, 300);

  // API dynamic states
  const [productsList, setProductsList] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // URL Synchronization: push local filter changes to query string
  useEffect(() => {
    const params = new URLSearchParams();
    if (selectedCategory && selectedCategory !== 'all') params.set('category', selectedCategory);
    if (searchQuery) params.set('search', searchQuery);
    if (maxPrice !== 1000) params.set('maxPrice', maxPrice.toString());
    if (isOrganicOnly) params.set('organic', 'true');
    if (isFeaturedOnly) params.set('featured', 'true');
    if (isInStockOnly) params.set('inStock', 'true');
    if (sortBy && sortBy !== 'default') params.set('sort', sortBy);
    if (currentPage > 1) params.set('page', currentPage.toString());

    const queryString = params.toString();
    const newUrl = queryString ? `/products?${queryString}` : '/products';
    router.replace(newUrl, { scroll: false });
  }, [
    selectedCategory,
    searchQuery,
    maxPrice,
    isOrganicOnly,
    isFeaturedOnly,
    isInStockOnly,
    sortBy,
    currentPage,
    router,
  ]);

  // URL query parameter synchronization on popstate/navigation changes
  useEffect(() => {
    const categoryParam = searchParams.get('category') || 'all';
    const searchParam = searchParams.get('search') || '';
    const maxPriceParam = searchParams.get('maxPrice') || '1000';
    const organicParam = searchParams.get('organic') === 'true';
    const featuredParam = searchParams.get('featured') === 'true';
    const inStockParam = searchParams.get('inStock') === 'true';
    const sortParam = searchParams.get('sort') || 'default';
    const pageParam = searchParams.get('page') || '1';

    setSelectedCategory(categoryParam);
    setSearchQuery(searchParam);
    setMaxPrice(parseFloat(maxPriceParam));
    setIsOrganicOnly(organicParam);
    setIsFeaturedOnly(featuredParam);
    setIsInStockOnly(inStockParam);
    setSortBy(sortParam);
    setCurrentPage(parseInt(pageParam, 10));
  }, [searchParams]);

  // Unified fetch effect querying the database
  useEffect(() => {
    const fetchFilteredProducts = async () => {
      setIsLoading(true);
      try {
        const queryCleaned = debouncedSearchQuery.trim();
        let url = '';

        if (queryCleaned.length >= 2) {
          url = `/api/products/search?q=${encodeURIComponent(queryCleaned)}`;
        } else {
          const params = new URLSearchParams();
          if (selectedCategory && selectedCategory !== 'all') params.set('category', selectedCategory);
          if (debouncedMaxPrice !== 1000) {
            params.set('maxPrice', debouncedMaxPrice.toString());
          }
          if (isOrganicOnly) params.set('organic', 'true');
          if (isFeaturedOnly) params.set('featured', 'true');
          if (isInStockOnly) params.set('inStock', 'true');

          let apiSort = 'featured';
          if (sortBy === 'price-low') apiSort = 'price_asc';
          else if (sortBy === 'price-high') apiSort = 'price_desc';
          else if (sortBy === 'rating') apiSort = 'rating_desc';
          else if (sortBy === 'discount') apiSort = 'discount_desc';
          else if (sortBy === 'newest') apiSort = 'newest';
          params.set('sort', apiSort);

          // Add pagination search params
          params.set('page', currentPage.toString());
          params.set('limit', '8');

          url = `/api/products?${params.toString()}`;
        }

        const res = await fetch(url).then((r) => r.json());
        if (res.success) {
          const mapped = (res.data || res.products || []).map((p: any) => {
            const discount = p.discountPrice
              ? Math.round(((p.price - p.discountPrice) / p.price) * 100)
              : 0;
            return { ...p, discount };
          });
          setProductsList(mapped);

          // Map totalPages from server response or fallback to local count
          if (res.pagination) {
            setTotalPages(res.pagination.totalPages || 1);
          } else {
            setTotalPages(Math.ceil(mapped.length / 8) || 1);
          }
        } else {
          console.error('Failed to load products:', res.message || res.error);
          setProductsList([]);
          setTotalPages(1);
        }
      } catch (err) {
        console.error('Error fetching products:', err);
        setProductsList([]);
        setTotalPages(1);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFilteredProducts();
  }, [
    debouncedSearchQuery,
    selectedCategory,
    debouncedMaxPrice,
    isOrganicOnly,
    isFeaturedOnly,
    isInStockOnly,
    sortBy,
    currentPage,
  ]);

  // Pagination
  const itemsPerPage = 8;

  const resetCatalog = useStore((state) => state.resetCatalog);

  // Auto-replenish catalog
  useEffect(() => {
    if (isHydrated) {
      const tomato = adminProducts.find((p) => p.id === 'prod-13');
      const correctTomatoImg = mockProducts.find((p) => p.id === 'prod-13')?.image;
      if (!tomato || tomato.image !== correctTomatoImg || adminProducts.length < 24) {
        resetCatalog();
      }
    }
  }, [isHydrated, adminProducts, resetCatalog]);

  const getProductCount = (categorySlug: string) => {
    if (categorySlug === 'all') return adminProducts.length;
    const cat = mockCategories.find((c) => c.slug === categorySlug);
    if (!cat) return 0;
    return adminProducts.filter((p) => p.categoryId === cat.id).length;
  };

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory, searchQuery, sortBy, maxPrice, isOrganicOnly, isFeaturedOnly, isInStockOnly]);

  // Client-side filtering as a fallback for search results and for instant visual feedback on slider drag
  const filteredProducts = productsList.filter((product) => {
    // 1. Price match: use the actual discount price from database if present
    const activePrice = product.discountPrice !== null && product.discountPrice !== undefined
      ? product.discountPrice
      : product.price;
    const priceMatch = activePrice <= maxPrice;

    // 2. Category match
    const categoryMatch = selectedCategory === 'all' || 
      mockCategories.find(c => c.id === product.categoryId)?.slug === selectedCategory;

    // 3. Organic match
    const organicMatch = !isOrganicOnly || product.isOrganic;

    // 4. Featured match
    const featuredMatch = !isFeaturedOnly || product.isFeatured;

    // 5. In Stock match
    const inStockMatch = !isInStockOnly || product.stock > 0;

    return priceMatch && categoryMatch && organicMatch && featuredMatch && inStockMatch;
  });

  const sortedProducts = filteredProducts;

  // Pagination Slice:
  // - If search query is active, we slice locally.
  // - If search query is not active, the API response is already paginated.
  const isSearchActive = searchQuery.trim().length >= 2;
  const currentProducts = isSearchActive
    ? sortedProducts.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
    : sortedProducts;

  const handleQuickViewAdd = () => {
    if (quickViewProduct) {
      addToCart(quickViewProduct, quickViewQty);
      setQuickViewProduct(null);
      setQuickViewQty(1);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 min-h-[80vh] font-sans">
      
      {/* Search and Title Row */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="font-display text-3xl font-extrabold text-slate-800">Fresh Produce Shop</h1>
          <p className="text-xs text-slate-400 font-semibold mt-1">
            Showing {filteredProducts.length} fresh organic products
          </p>
        </div>
        
        {/* Search input in page */}
        <div className="relative w-full md:max-w-xs">
          <input
            type="text"
            placeholder="Search in store..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full py-2.5 pl-10 pr-4 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 bg-slate-50 text-slate-800 font-medium"
          />
          <Search className="absolute left-3 top-3 h-4.5 w-4.5 text-slate-400" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* SIDEBAR FILTERS - Desktop */}
        <div className="lg:col-span-1 space-y-6">
          
          {/* Categories Filter list */}
          <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-850 text-sm flex items-center gap-2 pb-3 border-b border-slate-150">
              <SlidersHorizontal className="h-4 w-4 text-primary" />
              Categories
            </h3>
            <div className="flex flex-col gap-1.5 text-xs font-semibold text-slate-600">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`text-left px-3 py-2 rounded-xl transition-all flex justify-between items-center ${
                  selectedCategory === 'all' 
                    ? 'bg-primary text-white' 
                    : 'hover:bg-slate-50 text-slate-700'
                }`}
              >
                <span>All Products</span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${selectedCategory === 'all' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-450'}`}>{getProductCount('all')}</span>
              </button>
              {mockCategories.map((cat) => {
                const count = getProductCount(cat.slug);
                return (
                  <button
                    key={cat.slug}
                    onClick={() => setSelectedCategory(cat.slug)}
                    className={`text-left px-3 py-2 rounded-xl transition-all flex justify-between items-center ${
                      selectedCategory === cat.slug 
                        ? 'bg-primary text-white' 
                        : 'hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <span>{cat.name}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${selectedCategory === cat.slug ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-450'}`}>{count}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Price Filter */}
          <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-855 text-sm pb-3 border-b border-slate-150 flex justify-between items-center">
              <span>Price</span>
              <span className="text-primary font-extrabold text-xs">Up to ₹{maxPrice}</span>
            </h3>
            <div className="space-y-4">
              <input
                type="range"
                min="100"
                max="1000"
                step="50"
                value={maxPrice}
                onChange={(e) => setMaxPrice(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-primary"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-bold">
                <span>₹100</span>
                <span>₹500</span>
                <span>₹1,000</span>
              </div>
            </div>
          </div>

          {/* Attributes Filter */}
          <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-855 text-sm pb-3 border-b border-slate-150">
              Attributes
            </h3>
            <div className="flex flex-col gap-3 text-xs font-semibold text-slate-600">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={isOrganicOnly}
                  onChange={(e) => setIsOrganicOnly(e.target.checked)}
                  className="rounded border-slate-200 text-primary focus:ring-primary h-4 w-4 cursor-pointer accent-primary"
                />
                <span>Organic Specials</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={isFeaturedOnly}
                  onChange={(e) => setIsFeaturedOnly(e.target.checked)}
                  className="rounded border-slate-200 text-primary focus:ring-primary h-4 w-4 cursor-pointer accent-primary"
                />
                <span>Featured Items</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={isInStockOnly}
                  onChange={(e) => setIsInStockOnly(e.target.checked)}
                  className="rounded border-slate-200 text-primary focus:ring-primary h-4 w-4 cursor-pointer accent-primary"
                />
                <span>In Stock Only</span>
              </label>
            </div>
          </div>

      </div>

        {/* PRODUCTS GRID AREA */}
        <div className="lg:col-span-3 space-y-8">
          
          {/* Sorting Row */}
          <div className="bg-white rounded-xl p-4 border border-slate-100 shadow-sm flex flex-col sm:flex-row justify-between items-center gap-3">
            <span className="text-xs text-slate-400 font-bold">Sort & Order options</span>
            
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-600">
              <ArrowUpDown className="h-4 w-4 text-slate-400" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-primary text-slate-700 outline-none"
              >
                <option value="default">Featured First</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="rating">Top Rated</option>
                <option value="discount">Biggest Discount</option>
                <option value="newest">Newest Arrivals</option>
              </select>
            </div>
          </div>

          {/* Grid */}
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6 w-full col-span-full">
              {Array.from({ length: 8 }).map((_, idx) => (
                <ProductCardSkeleton key={idx} />
              ))}
            </div>
          ) : currentProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
              {currentProducts.map((product) => {
                const discountPrice = product.discountPrice !== null && product.discountPrice !== undefined
                  ? product.discountPrice
                  : product.price;
                const isWish = isHydrated && inWishlist(product.id);

                // Dynamic category badge
                const catObj = mockCategories.find(c => c.id === product.categoryId);
                const categoryBadgeName = catObj ? catObj.name.replace('Fresh ', '') : 'Pantry';

                // Dynamic reviews count
                const countReviews = mockReviews.filter(r => r.productId === product.id).length;
                const totalReviewCount = countReviews > 0 ? countReviews : Math.floor(product.rating * 5) + 3;

                return (
                  <motion.div
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    key={product.id}
                    className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col group relative h-full"
                  >
                    {/* Image Cover */}
                    <div className="h-44 relative bg-white overflow-hidden shrink-0 flex items-center justify-center p-4 border-b border-slate-100/50">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="h-full w-full object-contain transform group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                        onError={(e) => { e.currentTarget.src = 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=500&auto=format&fit=crop&q=80'; }}
                      />
                      {/* Discount Label */}
                      {product.discount > 0 && (
                        <span className="absolute top-3 left-3 bg-accent text-white text-[9px] font-extrabold px-2 py-0.5 rounded-full z-20">
                          {product.discount}% OFF
                        </span>
                      )}
                      
                      {/* Wishlist toggle */}
                      <button
                        onClick={() => toggleWishlist(product.id)}
                        className={`absolute top-3 right-3 p-1.5 rounded-full shadow-md transition transform active:scale-95 z-20 ${
                          isWish 
                            ? 'bg-rose-50 text-rose-500' 
                            : 'bg-white/80 hover:bg-white text-slate-500 hover:text-rose-500'
                        }`}
                        aria-label="Add to Wishlist"
                      >
                        <Heart className={`h-4 w-4 ${isWish ? 'fill-current' : ''}`} />
                      </button>

                      {/* Quick view hover-overlay - Only appears on hover, does not cover image by default */}
                      <div className="absolute inset-0 bg-slate-900/30 opacity-0 group-hover:opacity-100 transition duration-300 flex items-center justify-center z-10">
                        <button
                          onClick={() => setQuickViewProduct(product)}
                          className="bg-white hover:bg-primary text-slate-700 hover:text-white px-4 py-2 rounded-full text-xs font-bold shadow-md transform translate-y-2 group-hover:translate-y-0 transition duration-300 cursor-pointer"
                        >
                          Quick View
                        </button>
                      </div>
                    </div>

                    {/* Details */}
                    <div className="p-4 flex-grow flex flex-col justify-between">
                      <div className="space-y-2 flex-grow flex flex-col justify-between">
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between">
                            {/* Category Badge */}
                            <span className="bg-emerald-50 text-emerald-800 text-[9px] font-extrabold px-2 py-0.5 rounded-md shrink-0">
                              {categoryBadgeName}
                            </span>
                            
                            {/* Rating and review count */}
                            <div className="flex items-center gap-0.5 text-amber-500 text-[10px] font-bold shrink-0">
                              <Star className="h-3 w-3 fill-current" />
                              <span>{product.rating}</span>
                              <span className="text-slate-400 font-semibold">({totalReviewCount})</span>
                            </div>
                          </div>

                          <Link 
                            href={`/products/${product.id}`} 
                            className="block font-bold text-slate-800 text-sm hover:text-primary transition line-clamp-2 h-10 leading-snug"
                          >
                            {product.name}
                          </Link>
                          <p className="text-[10px] text-slate-400 font-bold leading-none">{product.unit}</p>
                        </div>

                        <div className="flex items-center justify-between pt-3 mt-auto border-t border-slate-100 w-full shrink-0">
                          {/* Price */}
                          <div className="flex flex-col">
                            {product.discount > 0 && (
                              <span className="text-[9px] text-slate-400 line-through leading-none mb-0.5">₹{Math.round(product.price)}</span>
                            )}
                            <span className="text-sm font-extrabold text-slate-855">₹{Math.round(discountPrice)}</span>
                          </div>

                          {/* Add button */}
                          <button
                            onClick={() => addToCart(product, 1)}
                            className="flex items-center gap-1 bg-primary hover:bg-primary-dark text-white px-3.5 py-1.5 rounded-full text-xs font-bold shadow-md transition active:scale-95 shrink-0"
                          >
                            <ShoppingBag className="h-3.5 w-3.5" />
                            Add
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          ) : (
            <div className="bg-white rounded-2xl p-12 text-center border border-slate-100 shadow-sm flex flex-col items-center gap-4 text-slate-400">
              <span className="text-4xl">🌾</span>
              <div>
                <p className="font-bold text-slate-700 text-sm">No products found matching filters</p>
                <p className="text-xs text-slate-400 mt-1">Try resetting search or adjusting your filters.</p>
              </div>
              <button
                onClick={() => {
                  setSelectedCategory('all');
                  setSearchQuery('');
                  setSortBy('default');
                  setMaxPrice(1000);
                }}
                className="px-6 py-2.5 bg-primary hover:bg-primary-dark text-white text-xs font-bold rounded-full transition shadow-md"
              >
                Clear All Filters
              </button>
            </div>
          )}

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-2 pt-6" aria-label="Catalog pagination">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1 || isLoading}
                className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-semibold hover:bg-slate-50 transition disabled:opacity-50 disabled:pointer-events-none text-slate-650"
                aria-label="Go to previous page"
              >
                Prev
              </button>
              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPage(i + 1)}
                  disabled={isLoading}
                  className={`h-9 w-9 flex items-center justify-center rounded-xl text-xs font-bold transition disabled:opacity-50 disabled:pointer-events-none ${
                    currentPage === i + 1
                      ? 'bg-primary text-white'
                      : 'border border-slate-200 hover:bg-slate-50 text-slate-700'
                  }`}
                  aria-label={`Go to page ${i + 1}`}
                  aria-current={currentPage === i + 1 ? 'page' : undefined}
                >
                  {i + 1}
                </button>
              ))}
              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages || isLoading}
                className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-semibold hover:bg-slate-50 transition disabled:opacity-50 disabled:pointer-events-none text-slate-650"
                aria-label="Go to next page"
              >
                Next
              </button>
            </div>
          )}

        </div>

      </div>

      {/* QUICK VIEW MODAL DOCK */}
      <AnimatePresence>
        {quickViewProduct && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-hidden">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => { setQuickViewProduct(null); setQuickViewQty(1); }}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl overflow-hidden shadow-2xl max-w-2xl w-full border border-slate-100 z-10 flex flex-col md:flex-row relative text-slate-800"
            >
              
              <button
                onClick={() => { setQuickViewProduct(null); setQuickViewQty(1); }}
                className="absolute top-4 right-4 p-2 bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-full transition z-20"
                aria-label="Close modal"
              >
                <X className="h-4.5 w-4.5" />
              </button>

              {/* Product Gallery (Main Image) */}
              <div className="w-full md:w-1/2 h-64 md:h-auto bg-white relative shrink-0 flex items-center justify-center p-6 border-r border-slate-100">
                <img
                  src={quickViewProduct.image}
                  alt={quickViewProduct.name}
                  className="h-full w-full object-contain"
                  onError={(e) => { e.currentTarget.src = 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=500&auto=format&fit=crop&q=80'; }}
                />
                {quickViewProduct.discount > 0 && (
                  <span className="absolute top-4 left-4 bg-accent text-white text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider">
                    {quickViewProduct.discount}% Off
                  </span>
                )}
              </div>

              {/* Product Description */}
              <div className="p-6 md:p-8 flex-1 flex flex-col justify-between">
                <div>
                  <span className="text-primary font-bold text-[10px] uppercase tracking-wider block mb-1">Organic Produce</span>
                  <h2 className="font-display text-xl font-bold text-slate-800 leading-tight">{quickViewProduct.name}</h2>
                  <p className="text-xs text-slate-450 font-bold block mt-0.5 mb-4">{quickViewProduct.unit}</p>

                  <p className="text-slate-550 text-xs leading-relaxed font-medium mb-4">
                    {quickViewProduct.description}
                  </p>

                  {/* Nutrition details */}
                  {quickViewProduct.nutrition && (
                    <div className="bg-emerald-50/50 rounded-xl p-3 border border-emerald-100/50 text-[10px] text-slate-655 font-semibold mb-6">
                      <h4 className="text-emerald-800 font-extrabold mb-1">Nutritional Values (Estimated):</h4>
                      <p>{quickViewProduct.nutrition}</p>
                    </div>
                  )}
                </div>

                <div className="border-t border-slate-150 pt-4 space-y-4">
                  {/* Prices & Quantity selection */}
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[10px] text-slate-400 font-bold">Total price</p>
                      <div className="flex items-baseline gap-2 mt-0.5">
                        <span className="text-lg font-extrabold text-slate-800">
                          ₹{Math.round(
                            (quickViewProduct.discountPrice !== null && quickViewProduct.discountPrice !== undefined
                              ? quickViewProduct.discountPrice
                              : quickViewProduct.price) * quickViewQty
                          ).toLocaleString('en-IN')}
                        </span>
                        {quickViewProduct.discountPrice !== null && quickViewProduct.discountPrice !== undefined && (
                          <span className="text-xs text-slate-400 line-through">
                            ₹{Math.round(quickViewProduct.price * quickViewQty).toLocaleString('en-IN')}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Quantity selectors */}
                    <div className="flex items-center gap-2 border border-slate-200 rounded-full p-1 shadow-sm bg-white">
                      <button
                        onClick={() => setQuickViewQty(prev => Math.max(1, prev - 1))}
                        className="p-1 rounded-full hover:bg-slate-100 transition text-slate-600"
                        aria-label="Decrease quantity"
                      >
                        <Minus className="h-3.5 w-3.5" />
                      </button>
                      <span className="text-xs font-bold w-6 text-center">{quickViewQty}</span>
                      <button
                        onClick={() => setQuickViewQty(prev => prev + 1)}
                        className="p-1 rounded-full hover:bg-slate-100 transition text-slate-600"
                        aria-label="Increase quantity"
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <button
                      onClick={handleQuickViewAdd}
                      className="flex-1 py-2.5 bg-primary hover:bg-primary-dark text-white rounded-full text-xs font-bold shadow-md transition"
                    >
                      Add to Cart
                    </button>
                  </div>
                </div>

              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

export const ProductsPage = () => {
  return (
    <Suspense fallback={
      <div className="max-w-7xl mx-auto px-4 py-24 min-h-[85vh] flex flex-col items-center justify-center gap-4 text-slate-400">
        <div className="animate-spin h-10 w-10 border-4 border-primary border-t-transparent rounded-full" />
        <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Loading organic catalog...</span>
      </div>
    }>
      <ProductsContent />
    </Suspense>
  );
};

export default ProductsPage;
