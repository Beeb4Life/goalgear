/**
 * GoalGear - Admin Management Controller
 *
 * Handles admin dashboard metrics, product CRUD operations,
 * inventory management, and order status updates.
 */

const { getDb } = require('../config/supabase');

/**
 * Get dashboard statistics (revenue, orders, low-stock alerts)
 */
async function getDashboardStats(req, res) {
    try {
        const db = getDb();

        const [productsRes, ordersRes] = await Promise.all([
            db.from('products').select('*'),
            db.from('orders').select('*').order('created_at', { ascending: false })
        ]);

        const products = productsRes.data || [];
        const orders = ordersRes.data || [];

        const totalRevenue = orders
            .filter((o) => o.status !== 'cancelled')
            .reduce((sum, o) => sum + parseFloat(o.total_amount || 0), 0);

        const lowStockProducts = products.filter((p) => p.stock_quantity <= 10);
        const outOfStockProducts = products.filter((p) => p.stock_quantity === 0);

        const statusCounts = orders.reduce((acc, o) => {
            acc[o.status] = (acc[o.status] || 0) + 1;
            return acc;
        }, {});

        return res.status(200).json({
            stats: {
                totalRevenue: Math.round(totalRevenue * 100) / 100,
                totalOrders: orders.length,
                totalProducts: products.length,
                lowStockCount: lowStockProducts.length,
                outOfStockCount: outOfStockProducts.length,
                statusCounts
            },
            recentOrders: orders.slice(0, 5),
            lowStockItems: lowStockProducts.map((p) => ({
                id: p.id,
                name: p.name,
                brand: p.brand,
                stock_quantity: p.stock_quantity
            }))
        });
    } catch (err) {
        console.error('Admin stats error:', err);
        return res.status(500).json({ error: 'Internal server error calculating admin statistics.' });
    }
}

/**
 * Admin CRUD: Create a new football product
 */
async function createProduct(req, res) {
    try {
        const {
            name,
            brand,
            category,
            ball_size,
            surface = 'Grass',
            fifa_rating = 'Standard',
            price,
            stock_quantity,
            description,
            image_url,
            is_featured = false
        } = req.body;

        if (!name || !brand || !category || ball_size === undefined || price === undefined || stock_quantity === undefined) {
            return res.status(400).json({
                error: 'Please specify name, brand, category, ball_size, price, and stock_quantity.'
            });
        }

        const validCategories = ['Match Ball', 'Training Ball', 'Futsal Ball', 'Retro/Heritage', 'Mini Ball'];
        if (!validCategories.includes(category)) {
            return res.status(400).json({
                error: `Invalid category. Must be one of: ${validCategories.join(', ')}`
            });
        }

        const parsedSize = parseInt(ball_size, 10);
        if (![1, 3, 4, 5].includes(parsedSize)) {
            return res.status(400).json({ error: 'Ball size must be 1, 3, 4, or 5.' });
        }

        const parsedPrice = parseFloat(price);
        const parsedStock = parseInt(stock_quantity, 10);

        if (isNaN(parsedPrice) || parsedPrice < 0 || isNaN(parsedStock) || parsedStock < 0) {
            return res.status(400).json({ error: 'Price and stock quantity must be positive numbers.' });
        }

        const db = getDb();
        const payload = {
            name: name.trim(),
            brand: brand.trim(),
            category,
            ball_size: parsedSize,
            surface,
            fifa_rating,
            price: parsedPrice,
            stock_quantity: parsedStock,
            description: (description || '').trim(),
            image_url: (image_url || 'images/products/placeholder-ball.jpg').trim(),
            is_featured: Boolean(is_featured)
        };

        const { data: newProduct, error } = await db
            .from('products')
            .insert(payload)
            .select('*')
            .single();

        if (error || !newProduct) {
            return res.status(500).json({ error: 'Failed to create football product in database.' });
        }

        return res.status(201).json({
            message: 'Football ball added to catalogue successfully!',
            product: newProduct
        });
    } catch (err) {
        console.error('Create product error:', err);
        return res.status(500).json({ error: 'Internal server error creating football.' });
    }
}

/**
 * Admin CRUD: Update an existing football product
 */
async function updateProduct(req, res) {
    try {
        const { id } = req.params;
        const db = getDb();

        const { data: existing, error: checkError } = await db
            .from('products')
            .select('*')
            .eq('id', id);

        if (checkError || !existing || existing.length === 0) {
            return res.status(404).json({ error: 'Product not found.' });
        }

        const updates = {};
        const fields = [
            'name',
            'brand',
            'category',
            'ball_size',
            'surface',
            'fifa_rating',
            'price',
            'stock_quantity',
            'description',
            'image_url',
            'is_featured'
        ];

        for (const field of fields) {
            if (req.body[field] !== undefined) {
                if (field === 'price') {
                    updates[field] = parseFloat(req.body[field]);
                } else if (field === 'stock_quantity' || field === 'ball_size') {
                    updates[field] = parseInt(req.body[field], 10);
                } else if (field === 'is_featured') {
                    updates[field] = Boolean(req.body[field]);
                } else {
                    updates[field] = req.body[field];
                }
            }
        }

        const { data: updated, error } = await db
            .from('products')
            .update(updates)
            .eq('id', id)
            .select('*')
            .single();

        if (error) {
            return res.status(500).json({ error: 'Failed to update football product.' });
        }

        return res.status(200).json({
            message: 'Product updated successfully!',
            product: updated
        });
    } catch (err) {
        console.error('Update product error:', err);
        return res.status(500).json({ error: 'Internal server error updating product.' });
    }
}

/**
 * Admin CRUD: Delete a product
 */
async function deleteProduct(req, res) {
    try {
        const { id } = req.params;
        const db = getDb();

        const { error } = await db
            .from('products')
            .delete()
            .eq('id', id);

        if (error) {
            return res.status(500).json({ error: 'Failed to delete football product.' });
        }

        return res.status(200).json({ message: 'Football ball deleted from catalogue.' });
    } catch (err) {
        console.error('Delete product error:', err);
        return res.status(500).json({ error: 'Internal server error deleting product.' });
    }
}

/**
 * Admin Order Management: List all orders
 */
async function getAllOrders(req, res) {
    try {
        const { status } = req.query;
        const db = getDb();

        let query = db.from('orders').select('*').order('created_at', { ascending: false });
        if (status) {
            query = query.eq('status', status);
        }

        const { data: orders, error } = await query;

        if (error) {
            return res.status(500).json({ error: 'Failed to fetch customer orders.' });
        }

        // Attach items to each order
        const ordersWithItems = await Promise.all(
            (orders || []).map(async (order) => {
                const { data: items } = await db
                    .from('order_items')
                    .select('*')
                    .eq('order_id', order.id);
                return {
                    ...order,
                    items: items || []
                };
            })
        );

        return res.status(200).json({
            count: ordersWithItems.length,
            orders: ordersWithItems
        });
    } catch (err) {
        console.error('Admin all orders error:', err);
        return res.status(500).json({ error: 'Internal server error retrieving orders.' });
    }
}

/**
 * Admin Order Management: Update order status
 */
async function updateOrderStatus(req, res) {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
        if (!status || !validStatuses.includes(status)) {
            return res.status(400).json({
                error: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
            });
        }

        const db = getDb();
        const { data: updated, error } = await db
            .from('orders')
            .update({ status })
            .eq('id', id)
            .select('*')
            .single();

        if (error || !updated) {
            return res.status(500).json({ error: 'Failed to update order status.' });
        }

        return res.status(200).json({
            message: `Order status updated to "${status}".`,
            order: updated
        });
    } catch (err) {
        console.error('Update order status error:', err);
        return res.status(500).json({ error: 'Internal server error updating order status.' });
    }
}

/**
 * Admin Inventory: Update stock quantity
 */
async function updateStock(req, res) {
    try {
        const { id } = req.params;
        const { stock_quantity } = req.body;

        const quantity = parseInt(stock_quantity, 10);
        if (isNaN(quantity) || quantity < 0) {
            return res.status(400).json({ error: 'Stock quantity must be a non-negative integer.' });
        }

        const db = getDb();
        const { data: updated, error } = await db
            .from('products')
            .update({ stock_quantity: quantity })
            .eq('id', id)
            .select('*')
            .single();

        if (error) {
            return res.status(500).json({ error: 'Failed to update stock quantity.' });
        }

        return res.status(200).json({
            message: 'Stock updated successfully!',
            product: updated
        });
    } catch (err) {
        console.error('Update stock error:', err);
        return res.status(500).json({ error: 'Internal server error updating stock.' });
    }
}

module.exports = {
    getDashboardStats,
    createProduct,
    updateProduct,
    deleteProduct,
    getAllOrders,
    updateOrderStatus,
    updateStock
};
