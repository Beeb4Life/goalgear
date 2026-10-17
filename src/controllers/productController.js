/**
 * GoalGear - Product Catalogue Controller
 *
 * Provides dynamic queries, multi-faceted filtering, searching,
 * and retrieval for football/soccer balls.
 */

const { getDb } = require('../config/supabase');

/**
 * Get all products with dynamic search, filters, and sorting
 */
async function getAllProducts(req, res) {
    try {
        const {
            search,
            category,
            brand,
            ball_size,
            surface,
            min_price,
            max_price,
            sort,
            in_stock
        } = req.query;

        const db = getDb();
        let query = db.from('products').select('*');

        if (category) {
            query = query.eq('category', category);
        }

        if (brand) {
            query = query.eq('brand', brand);
        }

        if (ball_size) {
            query = query.eq('ball_size', parseInt(ball_size, 10));
        }

        if (surface) {
            query = query.eq('surface', surface);
        }

        if (min_price) {
            query = query.gte('price', parseFloat(min_price));
        }

        if (max_price) {
            query = query.lte('price', parseFloat(max_price));
        }

        if (in_stock === 'true') {
            query = query.gte('stock_quantity', 1);
        }

        // Sorting
        if (sort === 'price-asc') {
            query = query.order('price', { ascending: true });
        } else if (sort === 'price-desc') {
            query = query.order('price', { ascending: false });
        } else if (sort === 'name-asc') {
            query = query.order('name', { ascending: true });
        } else {
            query = query.order('created_at', { ascending: false });
        }

        const { data: products, error } = await query;

        if (error) {
            return res.status(500).json({ error: 'Failed to fetch football catalogue.' });
        }

        // Apply client search across name, brand, description
        let filtered = products || [];
        if (search && search.trim()) {
            const term = search.trim().toLowerCase();
            filtered = filtered.filter((p) =>
                p.name.toLowerCase().includes(term) ||
                p.brand.toLowerCase().includes(term) ||
                p.category.toLowerCase().includes(term) ||
                (p.description && p.description.toLowerCase().includes(term))
            );
        }

        return res.status(200).json({
            count: filtered.length,
            products: filtered
        });
    } catch (err) {
        console.error('Fetch products error:', err);
        return res.status(500).json({ error: 'Internal server error fetching products.' });
    }
}

/**
 * Get featured footballs for the homepage showcase
 */
async function getFeaturedProducts(req, res) {
    try {
        const db = getDb();
        const { data: products, error } = await db
            .from('products')
            .select('*')
            .eq('is_featured', true)
            .order('price', { ascending: false });

        if (error) {
            return res.status(500).json({ error: 'Failed to fetch featured footballs.' });
        }

        return res.status(200).json({
            count: products ? products.length : 0,
            products: products || []
        });
    } catch (err) {
        console.error('Featured products error:', err);
        return res.status(500).json({ error: 'Internal server error fetching featured footballs.' });
    }
}

/**
 * Get single product by ID
 */
async function getProductById(req, res) {
    try {
        const { id } = req.params;
        const db = getDb();

        const { data: products, error } = await db
            .from('products')
            .select('*')
            .eq('id', id);

        if (error || !products || products.length === 0) {
            return res.status(404).json({ error: 'Football ball not found.' });
        }

        return res.status(200).json({ product: products[0] });
    } catch (err) {
        console.error('Product detail error:', err);
        return res.status(500).json({ error: 'Internal server error fetching product details.' });
    }
}

/**
 * Get available filter options (categories, brands, sizes, surfaces)
 */
async function getFilterOptions(req, res) {
    try {
        const db = getDb();
        const { data: products, error } = await db.from('products').select('*');

        if (error || !products) {
            return res.status(500).json({ error: 'Failed to load filter options.' });
        }

        const categories = [...new Set(products.map((p) => p.category))].sort();
        const brands = [...new Set(products.map((p) => p.brand))].sort();
        const sizes = [...new Set(products.map((p) => p.ball_size))].sort((a, b) => a - b);
        const surfaces = [...new Set(products.map((p) => p.surface))].sort();

        return res.status(200).json({
            categories,
            brands,
            sizes,
            surfaces
        });
    } catch (err) {
        console.error('Filter options error:', err);
        return res.status(500).json({ error: 'Internal server error loading filter options.' });
    }
}

module.exports = {
    getAllProducts,
    getFeaturedProducts,
    getProductById,
    getFilterOptions
};
