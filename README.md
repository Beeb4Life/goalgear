# &#9917; GoalGear — Dynamic Football Store

GoalGear is a dynamic, cloud-ready e-commerce platform dedicated exclusively to **authentic footballs and soccer balls**. Originally transformed from a static AWS Academy Café website, GoalGear features a dynamic product catalogue, multi-attribute filtering, live search, customer authentication, persistent shopping cart, simulated demo checkout, customer order tracking, and a protected administrative dashboard with real-time inventory management.

---

## &#128736; Technology Stack

- **Frontend**: Responsive semantic HTML5, clean classic CSS3, and vanilla ES6+ JavaScript (no heavy frontend framework dependencies).
- **Backend**: Node.js and Express.js REST API.
- **Database**: Supabase Cloud PostgreSQL with parameterized queries, relational constraints, foreign keys, and indexes.
- **Authentication & Security**: Server-side password hashing with `bcryptjs`, JSON Web Tokens (JWT), role-based access control (`customer` vs `admin`), zero exposure of service-role keys.
- **Deployment**: Configured for Vercel Serverless Architecture via `vercel.json`.
- **Testing**: Automated unit and integration testing suite with `Jest` and `Supertest`.

---

## &#128193; Project Directory Structure

```text
ccl_proj/
├── .env.example              # Documented environment variables template
├── .gitignore                # Git ignore rules (node_modules, .env, logs)
├── admin.html                # Protected Administrator Dashboard & Inventory Portal
├── api/
│   └── index.js              # Vercel serverless function entrypoint
├── css/
│   └── styles.css            # Classic, clean, and responsive stylesheet
├── database/
│   ├── schema.sql            # PostgreSQL schema (users, products, orders, order_items)
│   └── seed.sql              # Curated football product seed catalogue & demo accounts
├── images/                   # Preserved original assets & site graphics
│   ├── products/             # Football images and fallback vector graphic
│   │   └── placeholder-ball.svg
│   ├── Cafe-Owners.png       # (Preserved original asset)
│   ├── Cake-Vitrine.png      # (Preserved original asset)
│   └── ...
├── index.html                # Main Customer Storefront (Catalogue, Cart, Modals)
├── js/
│   ├── admin.js              # Admin portal frontend logic (CRUD, inventory, order status)
│   └── app.js                # Customer storefront logic (filters, cart, checkout, auth)
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
│   ├── api.test.js           # 21 unit & integration tests for API & auth
│   └── static.test.js        # 5 tests for static file serving
└── vercel.json               # Vercel deployment configuration
```

---

## &#128248; Image Dimensions & Replacement Guide

The application comes with built-in SVG vector fallbacks (`placeholder-ball.svg`), meaning **the website runs completely and cleanly even before you download any images**.

When you want to download and add your own football pictures, use the following specifications:

| Asset Type | Recommended Size | Aspect Ratio | Format | File Destination |
| :--- | :--- | :--- | :--- | :--- |
| **Product Footballs** | **`500 × 500 px`** (or `400 × 400 px`) | 1:1 Square | JPG or PNG | `images/products/` |
| **Hero / Header Banner** | **`960 × 300 px`** (up to `1200 × 400 px`) | Wide | JPG or PNG | `images/` |
| **Logo / Icon** | **`200 × 60 px`** | Rectangular | PNG or SVG | `images/` |

### Recommended File Names for Downloaded Footballs:
Match these filenames in `images/products/` to align automatically with the catalogue:
- `adidas-ucl-pro.jpg` — Adidas UCL Pro Match Ball
- `nike-flight-match.jpg` — Nike Flight Match Ball
- `puma-orbita-pro.jpg` — Puma Orbita Serie A Ball
- `select-numero-10.jpg` — Select Numero 10 Training Ball
- `adidas-tiro-training.jpg` — Adidas Tiro League Training Ball
- `nike-club-elite-sz4.jpg` — Nike Club Elite Youth Ball (Size 4)
- `select-futsal-super.jpg` — Select Futsal Super FIFA Pro
- `puma-attacanto-futsal.jpg` — Puma Attacanto Futsal Trainer
- `adidas-tango-rosario.jpg` — Adidas Tango 1982 Rosario Heritage Ball
- `nike-skills-mini-sz1.jpg` — Nike Skills Mini Ball (Size 1)

*(If any image file is absent, the frontend automatically falls back to `placeholder-ball.svg` with zero broken image errors).*

---

## &#128640; Step-by-Step Setup Guide

### Step 1: Install Dependencies
Open your terminal in the project directory:
```bash
npm install
```

### Step 2: Supabase Cloud Database Setup (Free & Fast)
1. Go to [https://supabase.com](https://supabase.com) and create a free account.
2. Click **New Project**, choose a project name (e.g., `goalgear-db`), set a strong database password, and select your preferred region.
3. In the left sidebar of your Supabase dashboard, click on **SQL Editor**.
4. Click **New Query**, open the file [`database/schema.sql`](file:///home/ebavain/Desktop/projects/ccl_proj/database/schema.sql) from this project, copy its full content, paste it into the SQL Editor, and click **Run**.
   - *This creates the `users`, `products`, `orders`, and `order_items` tables, indexes, and triggers.*
5. In the SQL Editor, create another new query, copy the content of [`database/seed.sql`](file:///home/ebavain/Desktop/projects/ccl_proj/database/seed.sql), paste it, and click **Run**.
   - *This populates the initial catalogue of footballs and demo customer account.*

### Step 3: Configure Environment Variables
1. Copy the example configuration file:
   ```bash
   cp .env.example .env
   ```
2. Open `.env` in your text editor.
3. In your Supabase Dashboard, go to **Project Settings** &rarr; **API**:
   - Copy **Project URL** and paste it as `SUPABASE_URL`.
   - Copy **anon / public** key and paste it as `SUPABASE_ANON_KEY`.
   - Copy **service_role / secret** key and paste it as `SUPABASE_SERVICE_ROLE_KEY`.
4. Keep or change `JWT_SECRET` to a random string.

### Step 4: Create the Initial Admin Account Securely
Run the built-in admin generator script:
```bash
node scripts/create-admin.js admin@goalgear.demo GoalGearAdmin2026! "GoalGear Store Admin"
```
- If your `.env` contains Supabase credentials, the script will insert the admin user directly into your database.
- It will also print a copy-pasteable SQL snippet that you can run in your Supabase SQL Editor if you prefer direct dashboard execution.

### Step 5: Run the Server Locally
To run the server:
```bash
npm start
```
Or for auto-reloading during development:
```bash
npm run dev
```
Open your browser and visit:
- **Main Customer Storefront**: [http://localhost:3000](http://localhost:3000)
- **Admin Management Portal**: [http://localhost:3000/admin.html](http://localhost:3000/admin.html)

### Step 6: Run Automated Tests
Execute the full automated test suite (all 26 tests):
```bash
npm test
```

---

## &#9729;&#65039; Vercel Deployment Guide

1. Push your repository to **GitHub**:
   ```bash
   git add .
   git commit -m "feat: complete GoalGear store"
   git push origin main
   ```
2. Go to [https://vercel.com](https://vercel.com) and sign in.
3. Click **Add New...** &rarr; **Project** and import your `ccl_proj` repository.
4. In the **Environment Variables** section on Vercel, add:
   - `SUPABASE_URL` = your Supabase project URL
   - `SUPABASE_SERVICE_ROLE_KEY` = your Supabase service_role secret key
   - `SUPABASE_ANON_KEY` = your Supabase anon key
   - `JWT_SECRET` = your secret JWT key
5. Click **Deploy**.
6. Vercel will build and deploy your site to a public URL (e.g. `https://goalgear-xxx.vercel.app`), fully functional and live worldwide.

---

## &#128274; Security Features

1. **Password Hashing**: Passwords are never stored in plain text. They are hashed using `bcryptjs` with 10 salt rounds.
2. **Server-Side Authorization**: Administrative routes under `/api/admin/*` strictly enforce `requireAdmin` middleware, verifying the JWT signature and checking `req.user.role === 'admin'`.
3. **No Secret Leakage**: The Supabase service-role secret key and JWT secrets are kept exclusively on the server in environment variables and never sent to or referenced in client-side HTML/JS files.
4. **SQL Injection Prevention**: Database interactions use parameterized queries via the Supabase client and PostgreSQL prepared statements.
5. **Inventory Validation**: The server validates available product stock during order placement and atomically decrements inventory to prevent overselling.

---

## &#128179; Demo Checkout Explanation

- GoalGear is a realistic simulation e-commerce store.
- **No real money, credit cards, or bank details are requested or charged.**
- Placing an order updates the live database, decrements inventory stock, and tracks the order in customer history and the admin portal.
