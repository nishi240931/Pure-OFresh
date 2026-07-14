export interface Category {
  id: string;
  name: string;
  slug: string;
  image: string;
  description: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  discount: number; // percentage
  discountPrice?: number | null;
  image: string;
  images: string[];
  unit: string;
  stock: number;
  nutrition: string; // facts
  rating: number;
  isFeatured: boolean;
  categoryId: string;
}

export interface Review {
  id: string;
  userId: string;
  userName: string;
  productId: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface Coupon {
  code: string;
  discount: number;
  discountType: 'PERCENTAGE' | 'ABSOLUTE';
  minPurchase: number;
  description: string;
}

export const mockCategories: Category[] = [
  {
    id: 'cat-1',
    name: 'Fresh Fruits',
    slug: 'fruits',
    image: 'https://images.unsplash.com/photo-1619546813926-a78fa6372cd2?w=500&auto=format&fit=crop&q=80',
    description: 'Sweet, juicy, and packed with vitamins direct from organic farms.'
  },
  {
    id: 'cat-2',
    name: 'Fresh Vegetables',
    slug: 'vegetables',
    image: 'https://images.unsplash.com/photo-1597362925123-77861d3fbac7?w=500&auto=format&fit=crop&q=80',
    description: 'Crisp green leaves, crunchy roots, and nutrient-dense vegetables.'
  },
  {
    id: 'cat-3',
    name: 'Dairy & Eggs',
    slug: 'dairy-eggs',
    image: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=500&auto=format&fit=crop&q=80',
    description: 'Fresh milk, dairy products, butter, paneer, and eggs.'
  },
  {
    id: 'cat-4',
    name: 'Daily Essentials',
    slug: 'essentials',
    image: 'https://images.unsplash.com/photo-1607344645866-009c320c5ab8?w=500&auto=format&fit=crop&q=80',
    description: 'Freshly baked breads, pantry staples, and everyday items.'
  },
  {
    id: 'cat-5',
    name: 'Organic Specials',
    slug: 'organic',
    image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=500&auto=format&fit=crop&q=80',
    description: 'Certified 100% organic products free from chemicals.'
  },
  {
    id: 'cat-6',
    name: 'Beverages',
    slug: 'beverages',
    image: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=500&auto=format&fit=crop&q=80',
    description: 'Fresh pressed juices, coconut water, and organic herbal teas.'
  },
  {
    id: 'cat-7',
    name: 'Snacks & Nuts',
    slug: 'snacks',
    image: 'https://images.unsplash.com/photo-1599490659213-e2b9527bb087?w=500&auto=format&fit=crop&q=80',
    description: 'Healthy dried fruits, roasted nuts, and organic seed mixes.'
  },
  {
    id: 'cat-8',
    name: 'Pantry & Groceries',
    slug: 'groceries',
    image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=500&auto=format&fit=crop&q=80',
    description: 'Cold pressed oils, raw honey, organic spices, and grains.'
  }
];

export const mockProducts: Product[] = [
  {
    id: 'prod-1',
    name: 'Organic Gala Apples',
    slug: 'organic-gala-apples',
    description: 'Crisp, sweet, and locally harvested Organic Gala Apples. Perfect for healthy snacking, baking, or adding to fresh salads. Rich in dietary fiber, Vitamin C, and essential antioxidants.',
    price: 199,
    discount: 15,
    image: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=500&auto=format&fit=crop&q=80',
    images: [
      'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=500&auto=format&fit=crop&q=80'
    ],
    unit: '1 kg',
    stock: 45,
    nutrition: 'Energy: 52 kcal, Carbs: 14g, Fiber: 2.4g, Vitamin C: 7%',
    rating: 4.8,
    isFeatured: true,
    categoryId: 'cat-1'
  },
  {
    id: 'prod-2',
    name: 'Fresh Baby Spinach',
    slug: 'fresh-baby-spinach',
    description: 'Tender, pre-washed organic baby spinach leaves. Ideal for vibrant green salads, smoothies, or sautéing with garlic. Packed with iron, calcium, folate, and Vitamins A, C, and K.',
    price: 49,
    discount: 0,
    image: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=500&auto=format&fit=crop&q=80',
    images: [
      'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=500&auto=format&fit=crop&q=80'
    ],
    unit: '250g pack',
    stock: 30,
    nutrition: 'Energy: 23 kcal, Iron: 15%, Calcium: 10%, Vitamin A: 188%',
    rating: 4.6,
    isFeatured: true,
    categoryId: 'cat-2'
  },
  {
    id: 'prod-3',
    name: 'Organic Whole Milk',
    slug: 'organic-whole-milk',
    description: 'Fresh pasteurized cream-top whole milk from grass-fed cows. High in calcium, healthy fats, and Vitamin D. Delivered in standard eco-friendly glass bottles to preserve freshness.',
    price: 89,
    discount: 10,
    image: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=500&auto=format&fit=crop&q=80',
    images: [
      'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=500&auto=format&fit=crop&q=80'
    ],
    unit: '1 Litre',
    stock: 25,
    nutrition: 'Calories: 150, Protein: 8g, Calcium: 30%, Vitamin D: 25%',
    rating: 4.9,
    isFeatured: true,
    categoryId: 'cat-3'
  },
  {
    id: 'prod-4',
    name: 'Pasture-Raised Brown Eggs',
    slug: 'pasture-raised-brown-eggs',
    description: 'Farm-fresh, pasture-raised large brown eggs. Hens roam freely on open grass pastures, feeding on a natural diet, which results in rich dark-orange yolks and superior taste.',
    price: 149,
    discount: 0,
    image: 'https://images.unsplash.com/photo-1506976785307-8732e854ad03?w=500&auto=format&fit=crop&q=80',
    images: [
      'https://images.unsplash.com/photo-1506976785307-8732e854ad03?w=500&auto=format&fit=crop&q=80'
    ],
    unit: '12 pcs',
    stock: 18,
    nutrition: 'Protein: 6g, Fat: 5g, Vitamin D: 10%, Choline: 25%',
    rating: 4.9,
    isFeatured: true,
    categoryId: 'cat-3'
  },
  {
    id: 'prod-5',
    name: 'Organic Hass Avocados',
    slug: 'organic-hass-avocados',
    description: 'Perfectly ripe, creamy Hass avocados. Loaded with heart-healthy monounsaturated fats, potassium, and vitamins. Ideal for guacamole, slicing on toast, or blending into smoothies.',
    price: 349,
    discount: 20,
    image: 'https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?w=500&auto=format&fit=crop&q=80',
    images: [
      'https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?w=500&auto=format&fit=crop&q=80'
    ],
    unit: '4 pcs pack',
    stock: 15,
    nutrition: 'Energy: 160 kcal, Fiber: 7g, Healthy Fats: 15g, Potassium: 10%',
    rating: 4.7,
    isFeatured: true,
    categoryId: 'cat-1'
  },
  {
    id: 'prod-6',
    name: 'Probiotic Greek Yogurt',
    slug: 'probiotic-greek-yogurt',
    description: 'Thick, creamy, strained Greek yogurt. Packed with live active probiotic cultures that support digestive health. High-protein dairy essential, ideal for breakfast bowls or low-fat dips.',
    price: 129,
    discount: 5,
    image: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=500&auto=format&fit=crop&q=80',
    images: [
      'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=500&auto=format&fit=crop&q=80'
    ],
    unit: '500g tub',
    stock: 35,
    nutrition: 'Calories: 130, Protein: 15g, Calcium: 20%, Sugar: 4g',
    rating: 4.5,
    isFeatured: false,
    categoryId: 'cat-3'
  },
  {
    id: 'prod-7',
    name: 'Fresh Red Strawberries',
    slug: 'fresh-red-strawberries',
    description: 'Vibrant, sweet, hand-picked fresh red strawberries. Extremely fresh, sweet, and perfect for snacking, smoothies, cereal toppings, or delicious homemade jams.',
    price: 249,
    discount: 8,
    image: 'https://images.unsplash.com/photo-1464965911861-746a04b4bca6?w=500&auto=format&fit=crop&q=80',
    images: [
      'https://images.unsplash.com/photo-1464965911861-746a04b4bca6?w=500&auto=format&fit=crop&q=80'
    ],
    unit: '400g box',
    stock: 22,
    nutrition: 'Energy: 32 kcal, Carbs: 7.7g, Vitamin C: 97%, Potassium: 4%',
    rating: 4.8,
    isFeatured: true,
    categoryId: 'cat-1'
  },
  {
    id: 'prod-8',
    name: 'Organic Broccoli Florets',
    slug: 'organic-broccoli-florets',
    description: 'Fresh organic broccoli florets cut and ready to cook. Rich in Vitamin C, fiber, and iron. Steams beautifully and adds crisp, healthy greens to your lunch or dinner.',
    price: 119,
    discount: 0,
    image: 'https://images.unsplash.com/photo-1584270354949-c26b0d5b4a0c?w=500&auto=format&fit=crop&q=80',
    images: [
      'https://images.unsplash.com/photo-1584270354949-c26b0d5b4a0c?w=500&auto=format&fit=crop&q=80'
    ],
    unit: '500g bag',
    stock: 50,
    nutrition: 'Energy: 34 kcal, Carbs: 6.6g, Vitamin C: 135%, Iron: 4%',
    rating: 4.4,
    isFeatured: false,
    categoryId: 'cat-2'
  },
  {
    id: 'prod-9',
    name: 'Cold Pressed Orange Juice',
    slug: 'cold-pressed-orange-juice',
    description: '100% natural cold pressed orange juice. Zero added sugars, zero preservatives. Squeezed fresh daily to bring you pure citrus refreshment loaded with Vitamin C.',
    price: 179,
    discount: 12,
    image: 'https://images.unsplash.com/photo-1613478223719-2ab802602423?w=500&auto=format&fit=crop&q=80',
    images: [
      'https://images.unsplash.com/photo-1613478223719-2ab802602423?w=500&auto=format&fit=crop&q=80'
    ],
    unit: '500 ml bottle',
    stock: 14,
    nutrition: 'Calories: 110, Vitamin C: 120%, Folate: 15%, Sugar: 20g (Natural)',
    rating: 4.7,
    isFeatured: true,
    categoryId: 'cat-6'
  },
  {
    id: 'prod-10',
    name: 'Country Sourdough Bread',
    slug: 'country-sourdough-bread',
    description: 'Artisanal country sourdough bread baked fresh daily by our local bakery partners. Classic tangy flavor, chewy interior, and crisp golden crust. Vegan and naturally fermented.',
    price: 129,
    discount: 0,
    image: 'https://images.unsplash.com/photo-1549931319-a545dcf3bc73?w=500&auto=format&fit=crop&q=80',
    images: [
      'https://images.unsplash.com/photo-1549931319-a545dcf3bc73?w=500&auto=format&fit=crop&q=80'
    ],
    unit: '600g loaf',
    stock: 20,
    nutrition: 'Calories: 180, Carbs: 38g, Protein: 6g, Sodium: 360mg',
    rating: 4.8,
    isFeatured: false,
    categoryId: 'cat-4'
  },
  {
    id: 'prod-11',
    name: 'Roasted Almonds (Salted)',
    slug: 'roasted-almonds-salted',
    description: 'Premium whole almonds lightly roasted and seasoned with sea salt. Super crunchy, packed with healthy fats, proteins, and essential minerals. Excellent snack choice.',
    price: 399,
    discount: 10,
    image: 'https://images.unsplash.com/photo-1508061253366-f7da158b6cd9?w=500&auto=format&fit=crop&q=80',
    images: [
      'https://images.unsplash.com/photo-1508061253366-f7da158b6cd9?w=500&auto=format&fit=crop&q=80'
    ],
    unit: '250g pack',
    stock: 60,
    nutrition: 'Calories: 160, Protein: 6g, Fiber: 3.5g, Vitamin E: 37%',
    rating: 4.6,
    isFeatured: false,
    categoryId: 'cat-7'
  },
  {
    id: 'prod-12',
    name: 'Raw Organic Wildflower Honey',
    slug: 'raw-organic-wildflower-honey',
    description: '100% pure raw wildflower honey. Unpasteurized and unfiltered to keep natural enzymes, pollen, and health benefits intact. Golden color with a delicate floral flavor profile.',
    price: 349,
    discount: 18,
    image: 'https://images.unsplash.com/photo-1587049352851-8d4e89134292?w=500&auto=format&fit=crop&q=80',
    images: [
      'https://images.unsplash.com/photo-1587049352851-8d4e89134292?w=500&auto=format&fit=crop&q=80'
    ],
    unit: '350g jar',
    stock: 28,
    nutrition: 'Energy: 64 kcal, Sugar: 17g (Fructose/Glucose), Fat: 0g',
    rating: 4.9,
    isFeatured: true,
    categoryId: 'cat-8'
  },
  {
    id: 'prod-13',
    name: 'Fresh Country Tomatoes',
    slug: 'fresh-country-tomatoes',
    description: 'Vibrant red, juicy country tomatoes harvested fresh from local organic farms. Perfect for gravies, curries, fresh salads, and everyday Indian cooking. Rich in lycopene and essential vitamins.',
    price: 60,
    discount: 0,
    image: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=500&auto=format&fit=crop&q=80',
    images: [
      'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=500&auto=format&fit=crop&q=80'
    ],
    unit: '1 kg',
    stock: 80,
    nutrition: 'Energy: 18 kcal, Vitamin C: 22%, Lycopene: 3 mg, Water: 95%',
    rating: 4.5,
    isFeatured: false,
    categoryId: 'cat-2'
  },
  {
    id: 'prod-14',
    name: 'Organic Russet Potatoes',
    slug: 'organic-russet-potatoes',
    description: 'Firm, premium organic potatoes sourced from fertile fields. Ideal for boiling, mashing, roasting, or making delicious aloo parathas. High in carbohydrates and potassium.',
    price: 40,
    discount: 0,
    image: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=500&auto=format&fit=crop&q=80',
    images: [
      'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=500&auto=format&fit=crop&q=80'
    ],
    unit: '1 kg',
    stock: 120,
    nutrition: 'Energy: 77 kcal, Carbs: 17g, Protein: 2g, Potassium: 12%',
    rating: 4.6,
    isFeatured: false,
    categoryId: 'cat-2'
  },
  {
    id: 'prod-15',
    name: 'Fresh Red Onions',
    slug: 'fresh-red-onions',
    description: 'Crisp and flavorful fresh red onions, an essential aromatic base for almost all Indian culinary dishes. Sourced from native organic farms. Rich in dietary fiber and essential minerals.',
    price: 45,
    discount: 5,
    image: 'https://images.unsplash.com/photo-1508747703725-719ae2c9800a?w=500&auto=format&fit=crop&q=80',
    images: [
      'https://images.unsplash.com/photo-1508747703725-719ae2c9800a?w=500&auto=format&fit=crop&q=80'
    ],
    unit: '1 kg',
    stock: 95,
    nutrition: 'Energy: 40 kcal, Carbs: 9.3g, Protein: 1.1g, Fiber: 1.7g',
    rating: 4.7,
    isFeatured: false,
    categoryId: 'cat-2'
  },
  {
    id: 'prod-16',
    name: 'Sweet Cavendish Bananas',
    slug: 'sweet-cavendish-bananas',
    description: 'Perfectly ripe, sweet, energy-rich Cavendish bananas. Plucked fresh from organic banana groves. Pack of 12 pieces, a perfect healthy snack for all ages.',
    price: 69,
    discount: 0,
    image: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=500&auto=format&fit=crop&q=80',
    images: [
      'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=500&auto=format&fit=crop&q=80'
    ],
    unit: '12 pcs',
    stock: 40,
    nutrition: 'Energy: 89 kcal, Carbs: 23g, Potassium: 358mg, Vitamin B6: 20%',
    rating: 4.8,
    isFeatured: false,
    categoryId: 'cat-1'
  },
  {
    id: 'prod-17',
    name: 'Fresh Organic Paneer',
    slug: 'fresh-organic-paneer',
    description: 'Soft, crumbly, fresh paneer made from pure organic cow milk. Packed with calcium and proteins. Ideal for paneer butter masala, palak paneer, or tandoori tikka starters.',
    price: 120,
    discount: 8,
    image: 'https://images.unsplash.com/photo-1631451095765-2c91616fc9e6?w=500&auto=format&fit=crop&q=80',
    images: [
      'https://images.unsplash.com/photo-1631451095765-2c91616fc9e6?w=500&auto=format&fit=crop&q=80'
    ],
    unit: '200g pack',
    stock: 35,
    nutrition: 'Energy: 265 kcal, Protein: 18g, Fat: 20g, Calcium: 40%',
    rating: 4.8,
    isFeatured: false,
    categoryId: 'cat-3'
  },
  {
    id: 'prod-18',
    name: 'Salted Table Butter',
    slug: 'salted-table-butter',
    description: 'Rich, creamy salted butter churned from fresh organic milk cream. Adds unmatched flavor to parathas, toast, and baking. No artificial preservatives or flavorings.',
    price: 105,
    discount: 0,
    image: 'https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?w=500&auto=format&fit=crop&q=80',
    images: [
      'https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?w=500&auto=format&fit=crop&q=80'
    ],
    unit: '100g pack',
    stock: 55,
    nutrition: 'Energy: 717 kcal, Fat: 81g, Sodium: 643mg, Protein: 0.9g',
    rating: 4.7,
    isFeatured: false,
    categoryId: 'cat-3'
  },
  {
    id: 'prod-19',
    name: 'Cold Pressed Sunflower Oil',
    slug: 'cold-pressed-sunflower-oil',
    description: '100% pure cold pressed sunflower oil. Retains natural antioxidants, light aroma, and essential healthy fats. Ideal for everyday deep frying and Indian sautéing.',
    price: 189,
    discount: 5,
    image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=500&auto=format&fit=crop&q=80',
    images: [
      'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=500&auto=format&fit=crop&q=80'
    ],
    unit: '1 Litre',
    stock: 25,
    nutrition: 'Energy: 884 kcal, Healthy Fats: 100g, Vitamin E: 200%',
    rating: 4.5,
    isFeatured: false,
    categoryId: 'cat-8'
  },
  {
    id: 'prod-20',
    name: 'Premium Basmati Rice',
    slug: 'premium-basmati-rice',
    description: 'Long-grain, aromatic premium Basmati rice. Aged to perfection to provide fluffy, non-sticky grains with a rich fragrance. Excellent for biryani, pulao, or plain steamed rice.',
    price: 129,
    discount: 10,
    image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=500&auto=format&fit=crop&q=80',
    images: [
      'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=500&auto=format&fit=crop&q=80'
    ],
    unit: '1 kg',
    stock: 110,
    nutrition: 'Energy: 349 kcal, Carbs: 78g, Protein: 8.1g, Fat: 0.6g',
    rating: 4.8,
    isFeatured: false,
    categoryId: 'cat-8'
  },
  {
    id: 'prod-21',
    name: 'Roasted Cashews (W320)',
    slug: 'roasted-cashews-w320',
    description: 'Crunchy premium cashews, lightly dry roasted to bring out their buttery sweetness. Excellent source of healthy monounsaturated fats, proteins, and minerals.',
    price: 350,
    discount: 15,
    image: 'https://images.unsplash.com/photo-1536558490330-8a4a0c8e2ee2?w=500&auto=format&fit=crop&q=80',
    images: [
      'https://images.unsplash.com/photo-1536558490330-8a4a0c8e2ee2?w=500&auto=format&fit=crop&q=80'
    ],
    unit: '250g pack',
    stock: 50,
    nutrition: 'Energy: 553 kcal, Protein: 18g, Fiber: 3.3g, Iron: 37%',
    rating: 4.7,
    isFeatured: false,
    categoryId: 'cat-7'
  },
  {
    id: 'prod-22',
    name: 'Natural Medjool Dates',
    slug: 'natural-medjool-dates',
    description: 'Soft, sweet, high-fiber natural premium Medjool dates. Sourced from organic groves. Excellent natural sweetener, energy booster, and midday snack.',
    price: 280,
    discount: 12,
    image: 'https://images.unsplash.com/photo-1628135898863-7186105f2c41?w=500&auto=format&fit=crop&q=80',
    images: [
      'https://images.unsplash.com/photo-1628135898863-7186105f2c41?w=500&auto=format&fit=crop&q=80'
    ],
    unit: '500g pack',
    stock: 30,
    nutrition: 'Energy: 277 kcal, Fiber: 6.7g, Sugar: 66g (Natural), Potassium: 20%',
    rating: 4.8,
    isFeatured: false,
    categoryId: 'cat-7'
  },
  {
    id: 'prod-23',
    name: 'Fresh Tender Coconut',
    slug: 'fresh-tender-coconut',
    description: 'Naturally sweet and cooling tender coconut water. Harvested at the peak stage for maximum water volume and minerals. Rich in electrolytes and potassium.',
    price: 50,
    discount: 0,
    image: 'https://images.unsplash.com/photo-1525385133333-254200c029b9?w=500&auto=format&fit=crop&q=80',
    images: [
      'https://images.unsplash.com/photo-1525385133333-254200c029b9?w=500&auto=format&fit=crop&q=80'
    ],
    unit: '1 pc',
    stock: 60,
    nutrition: 'Energy: 19 kcal, Potassium: 250mg, Vitamin C: 4%, Fat: 0.2g',
    rating: 4.9,
    isFeatured: false,
    categoryId: 'cat-6'
  },
  {
    id: 'prod-24',
    name: 'Organic Himalayan Green Tea',
    slug: 'organic-himalayan-green-tea',
    description: 'High-quality, pure organic green tea leaves harvested from Himalayan gardens. Delivers a refreshing, antioxidant-rich wellness brew to support health.',
    price: 240,
    discount: 10,
    image: 'https://images.unsplash.com/photo-1564890369478-c90ae83ab28b?w=500&auto=format&fit=crop&q=80',
    images: [
      'https://images.unsplash.com/photo-1564890369478-c90ae83ab28b?w=500&auto=format&fit=crop&q=80'
    ],
    unit: '25 tea bags',
    stock: 45,
    nutrition: 'Energy: 2 kcal, Antioxidants: High, Caffeine: Low, Fat: 0g',
    rating: 4.6,
    isFeatured: false,
    categoryId: 'cat-6'
  }
];

export const mockReviews: Review[] = [
  {
    id: 'rev-1',
    userId: 'user-1',
    userName: 'Aarav Sharma',
    productId: 'prod-1',
    rating: 5,
    comment: 'Super crisp and fresh! Truly premium quality, reminded me of apples plucked right from the orchard. Ordered twice already.',
    createdAt: '2026-07-01'
  },
  {
    id: 'rev-2',
    userId: 'user-2',
    userName: 'Priya Patel',
    productId: 'prod-1',
    rating: 4,
    comment: 'Tastes excellent and has a good texture. Slightly expensive compared to local markets, but the organic quality makes it worth it.',
    createdAt: '2026-07-05'
  },
  {
    id: 'rev-3',
    userId: 'user-3',
    userName: 'Karan Malhotra',
    productId: 'prod-3',
    rating: 5,
    comment: 'Amazing grass-fed milk! The cream layer on top is lovely. Beautiful eco-friendly glass bottle packaging.',
    createdAt: '2026-07-10'
  }
];

export const mockCoupons: Coupon[] = [
  {
    code: 'FRESH20',
    discount: 20,
    discountType: 'PERCENTAGE',
    minPurchase: 499,
    description: '20% Off on orders above ₹499'
  },
  {
    code: 'PURE10',
    discount: 10,
    discountType: 'PERCENTAGE',
    minPurchase: 299,
    description: '10% Off on your purchase, min order ₹299'
  },
  {
    code: 'FREE100',
    discount: 100,
    discountType: 'ABSOLUTE',
    minPurchase: 999,
    description: 'Flat ₹100 Off on orders above ₹999'
  }
];
