# GoalGear

Dynamic e-commerce web application for footballs, football boots, and performance socks. Built with HTML, CSS, Vanilla JavaScript, Node.js, Express, Supabase PostgreSQL, and configured for Vercel deployment.

---

## Accounts & Access Control

### Customer Account
- Storefront URL: `/index.html` (or click "Register" / "Sign In")
- Customers can self-register or sign in with their own email and password to track orders.
- Demo Customer: `customer@goalgear.demo` / `customer123`

### Administrator Account
- Portal URL: `/admin.html`
- Permissions: View metrics, add/edit/delete products, update stock, manage order statuses.
- Secure Private Setup: To prevent unauthorized public access, admin credentials are not hardcoded in this public repository. To access the admin portal:
  1. Register an account with your private email and password on the website.
  2. In your private Supabase database (`users` table), set that user's `role` to `'admin'`:
     ```sql
     UPDATE users SET role = 'admin' WHERE email = 'your-email@example.com';
     ```
  3. Sign in at `/admin.html` with your private credentials.

---

## Quick Start (Run Locally)

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the application:
   ```bash
   npm start
   ```

3. Open in your browser:
   - Storefront: `http://localhost:3000`
   - Catalogue: `http://localhost:3000/catalogue.html`
   - About Us: `http://localhost:3000/about.html`
   - Contact & Hours: `http://localhost:3000/contact.html`
   - Admin Portal: `http://localhost:3000/admin.html`

---

## Tester Guide (Feature Verification)

1. **Browse & Filter Catalogue (`catalogue.html`)**:
   - Filter by department: Footballs, Boots & Shoes, Socks & Grip Gear.
   - Use live search and filter by brand, size, surface, or sort order.
   - Click "Details" on any product to inspect specifications and stock levels.

2. **Cart & Simulated Checkout**:
   - Click "Add to Cart" on any product.
   - Open the Cart modal and adjust quantities or remove items.
   - Click "Proceed to Demo Checkout", enter test delivery details, and confirm.
   - Notice: No real payment details or money required. Stock count decreases automatically in the database.

3. **Customer Order History**:
   - Sign in using the customer credentials above.
   - Click "My Orders" to inspect the placed order, ordered items, and current fulfillment status.

4. **Admin Dashboard (`admin.html`)**:
   - Sign in using the administrator credentials.
   - Review top stat cards: Total Revenue, Total Orders, Product Count, Low Stock Alerts.
   - Test Product CRUD: Add a new product, edit existing gear, or adjust stock counts inline.
   - Test Order Fulfillment: Change order status (e.g. Processing -> Shipped -> Delivered).

---

## Database Setup (Supabase Cloud PostgreSQL)

1. Create a free project at [supabase.com](https://supabase.com).
2. Go to **SQL Editor** in the Supabase dashboard:
   - Run `database/schema.sql` (creates tables, indexes, and triggers).
   - Run `database/seed.sql` (inserts products, demo accounts, and sample orders).
3. Under **Project Settings -> API**, copy:
   - Project URL
   - anon key
   - service_role key
4. Copy `.env.example` to `.env` and fill in the values:
   ```bash
   cp .env.example .env
   ```

---

## Deployment (Vercel)

1. Push this repository to GitHub.
2. In [vercel.com](https://vercel.com), import the repository.
3. In **Environment Variables**, add:
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `SUPABASE_ANON_KEY`
   - `JWT_SECRET`
4. Click **Deploy**. Vercel will build the serverless functions and host the static pages.

---

## Security Features

- Password Encryption: Salted one-way hashing with bcryptjs (10 rounds).
- Access Control: Role-based authorization (`customer` vs `admin`) enforced by server middleware.
- Session Security: Signed JSON Web Tokens (JWT) for stateless authentication.
- Injection Defense: Parameterized database queries via the Supabase client.
- Secret Isolation: Database service-role keys and JWT secrets kept exclusively in environment variables.
