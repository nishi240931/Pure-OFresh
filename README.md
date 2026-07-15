# Pure O Fresh – Organic Delivery E-Commerce

Pure O Fresh is a high-performance, responsive e-commerce web application specialized in delivering fresh organic fruits, vegetables, dairy, and grocery essentials.

## 🚀 Key Features

### Storefront & Cart Experience
- **Catalog Navigation**: Filter by category, organic status, pricing ranges, and search keywords.
- **Shopping Cart**: Real-time item additions, quantity management, checkout calculations, and coupon codes.
- **Payment Gateways**: Fully integrated **Razorpay** popup gateway and **Cash on Delivery (COD)** options.

### Administrative Control Panel
- **Dashboard & KPIs**: Real-time sales metrics, order counts, customer bases, and repeat-cohort indicators.
- **Catalog Management**: Creation, visibility toggle, and pagination of products and categories.
- **Order Lifecycle**: Full workflow tracking (`Pending -> Confirmed -> Packed -> Shipped -> Delivered`), stock updates, and cancellations.
- **Analytics Dashboard**: Multi-timeline charts (Recharts) mapping revenue, registration volumes, top items, and native CSV/Excel export options.

---

## 🛠️ Architecture and Stack

- **Framework**: [Next.js 16 (Turbopack)](https://nextjs.org) (App Router, Server Components).
- **ORM & Database**: [Prisma Client](https://prisma.io) with PostgreSQL.
- **Authentication**: [Clerk](https://clerk.com) authentication and user metadata-based role check.
- **Validation**: Strict schema verification via [Zod](https://zod.dev).
- **Styling**: Vanilla CSS alongside TailwindCSS variables.
- **Visual Charts**: [Recharts](https://recharts.org) SVG panels.

---

## ⚙️ Environment Variables Setup

Create a `.env` file in the root directory based on `.env.example`:

```env
# Database connection
DATABASE_URL="postgresql://username:password@localhost:5432/pure_ofresh?schema=public"

# Clerk credentials
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_publishable_key
CLERK_SECRET_KEY=your_secret_key

# Razorpay credentials
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_key_id
RAZORPAY_KEY_ID=rzp_test_key_id
RAZORPAY_KEY_SECRET=rzp_test_key_secret
```

---

## 🚀 Getting Started Locally

1. Install dependencies:
   ```bash
   npm install
   ```

2. Run Prisma migrations and seed the database:
   ```bash
   npx prisma migrate dev
   npx prisma db seed
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```

4. Compile and verify code qualities:
   ```bash
   npm run build
   npm run lint
   ```
