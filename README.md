# &#9917; GoalGear — Dynamic Football, Boots &amp; Grip Gear Store

GoalGear is a dynamic, cloud-ready e-commerce platform dedicated to **authentic footballs, football boots, and performance grip socks**. Originally transformed from a static AWS Academy Café website, GoalGear features a dedicated multi-page layout, dynamic catalogue, multi-attribute filtering by department and brand, live search, customer authentication, persistent shopping cart, simulated demo checkout, customer order tracking, and a protected administrative dashboard with real-time inventory management.

---

## &#128736; Technology Stack

- **Frontend**: Responsive semantic HTML5, clean classic CSS3, and modular vanilla ES6+ JavaScript across dedicated pages.
- **Backend**: Node.js and Express.js REST API.
- **Database**: Supabase Cloud PostgreSQL with parameterized queries, relational constraints, foreign keys, and indexes.
- **Authentication & Security**: Server-side password hashing with `bcryptjs`, JSON Web Tokens (JWT), role-based access control (`customer` vs `admin`), zero exposure of service-role keys.
- **Deployment**: Configured for Vercel Serverless Architecture via `vercel.json`.
- **Testing**: Automated unit and integration testing suite with `Jest` and `Supertest` (31 passing tests).

---

## &#128193; Project Directory & Page Structure

```text
ccl_proj/
├── .env.example              # Documented environment variables template
├── .gitignore                # Git ignore rules (node_modules, .env, logs)
├── about.html                # Dedicated About Us & Heritage Page (classic table layout)
├── admin.html                # Protected Administrator Dashboard & Inventory Portal
├── api/
│   └── index.js              # Vercel serverless function entrypoint
├── catalogue.html            # Dedicated Shopping Catalogue Page (Filters, Grid, Search)
├── contact.html              # Dedicated Contact & Hours Page (Showroom & Inquiry Form)
├── css/
│   └── styles.css            # Classic, clean, and responsive stylesheet
├── database/
│   ├── schema.sql            # PostgreSQL schema (users, products, orders, order_items)
│   └── seed.sql              # Curated seed catalogue (Footballs, Boots, Socks)
├── images/                   # Preserved original assets & site graphics
│   ├── products/             # Authentic product PNG assets (Footballs, Boots, Socks)
│   │   ├── adidas-ucl-pro.png
│   │   ├── nike-flight-match.png
│   │   ├── puma-orbita-pro.png
│   │   ├── nike-mercurial-vapor.png
│   │   ├── adidas-predator-elite.png
│   │   ├── goalgear-grip-socks.png
│   │   └── ...
│   ├── Cafe-Owners.png       # (Preserved original asset)
│   ├── Cake-Vitrine.png      # (Preserved original asset)
│   └── ...
├── index.html                # Main Home Page (Hero, Departments, Featured Picks)
├── js/
│   ├── admin.js              # Admin portal frontend logic (CRUD, inventory, order status)
│   └── app.js                # Customer storefront logic across separate pages
├── package.json              # Project dependencies and npm scripts
├── scripts/
│   └── create-admin.js       # Secure admin account generation & seeding utility
├── server.js                 # Express server local entrypoint
├── src/
│   ├── app.js                # Express application configuration & routing
│   ├── config/
│   │   └── supabase.js       # Supabase client with offline demo/test fallback
│   ├── controllers/
│   │   ├── adminController.js   # Admin metrics, CRUD, and order updates
│   │   ├── authController.js    # Registration, login, and JWT issuance
│   │   ├── orderController.js   # Checkout, stock deduction, and order history
│   │   └── productController.js # Dynamic catalogue queries and search
│   ├── middleware/
│   │   └── auth.js           # JWT authentication and admin role verification
│   └── routes/
│       ├── adminRoutes.js    # Protected /api/admin routes
│       ├── authRoutes.js     # /api/auth routes
│       ├── orderRoutes.js    # /api/orders routes
│       └── productRoutes.js  # /api/products routes
├── tests/
│   ├── api.test.js           # Unit & integration tests for API & auth
│   └── static.test.js        # Multi-page & static asset serving tests
└── vercel.json               # Vercel deployment configuration
```

---

## &#128248; Image Dimensions & Replacement Guide

The application includes authentic PNG product images across all three departments (Footballs, Boots & Shoes, Socks & Grip Gear). All images are stored in [`images/products/`](file:///home/ebavain/Desktop/projects/goalgear/images/products):

| Gear Department | Recommended Size | Aspect Ratio | Destination |
| :--- | :--- | :--- | :--- |
| **Footballs** | **`500 × 500 px`** (or `400 × 400 px`) | 1:1 Square | `images/products/` |
| **Boots & Shoes** | **`500 × 500 px`** | 1:1 Square | `images/products/` |
| **Socks & Grip Gear** | **`500 × 500 px`** | 1:1 Square | `images/products/` |
| **Hero / Header Banner** | **`960 × 300 px`** | Wide Banner | `images/` |

---

## &#128640; Step-by-Step Setup Guide

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Supabase Cloud Database Setup (Free)
1. Go to [https://supabase.com](https://supabase.com) and create a free project (e.g., `goalgear-db`).
2. Open the **SQL Editor** in the left sidebar of your Supabase dashboard.
3. Click **New Query**, copy the full content of [`database/schema.sql`](file:///home/ebavain/Desktop/projects/ccl_proj/database/schema.sql), paste it, and click **Run**.
4. Click **New Query** again, copy [`database/seed.sql`](file:///home/ebavain/Desktop/projects/ccl_proj/database/seed.sql), paste it, and click **Run**.

### Step 3: Configure Environment Variables
1. Copy the example configuration:
   ```bash
   cp .env.example .env
   ```
2. In your Supabase Dashboard under **Project Settings &rarr; API**, copy:
   - `SUPABASE_URL` = Project URL
   - `SUPABASE_ANON_KEY` = anon public key
   - `SUPABASE_SERVICE_ROLE_KEY` = service_role secret key

### Step 4: Create the Initial Admin Account
Run the secure admin bootstrap script:
```bash
node scripts/create-admin.js admin@goalgear.demo GoalGearAdmin2026! "GoalGear Administrator"
```

### Step 5: Run Locally
Start the server:
```bash
npm start
```
Open your browser and navigate between the separate pages:
- **Home**: [http://localhost:3000](http://localhost:3000)
- **Product Catalogue**: [http://localhost:3000/catalogue.html](http://localhost:3000/catalogue.html)
- **About GoalGear**: [http://localhost:3000/about.html](http://localhost:3000/about.html)
- **Contact & Hours**: [http://localhost:3000/contact.html](http://localhost:3000/contact.html)
- **Admin Management Portal**: [http://localhost:3000/admin.html](http://localhost:3000/admin.html)

### Step 6: Run Automated Tests
```bash
npm test
```
All 31 tests will execute and pass.

---

## &#9729;&#65039; Vercel Online Deployment

1. Commit and push your code to **GitHub**:
   ```bash
   git add .
   git commit -m "feat: complete GoalGear store"
   git push origin main
   ```
2. Go to [https://vercel.com](https://vercel.com) and import your GitHub repository.
3. In **Environment Variables**, add:
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `SUPABASE_ANON_KEY`
   - `JWT_SECRET`
4. Click **Deploy**. Vercel will build and assign you a live, public URL.
