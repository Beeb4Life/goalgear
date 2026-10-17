/**
 * GoalGear - Orders Controller
 *
 * Handles order placement, inventory validation/decrement,
 * and customer order history.
 */

const { getDb } = require('../config/supabase');

/**
 * Generate a clean, readable order reference number
 */
function generateOrderNumber() {
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    return `GG-${dateStr}-${randomSuffix}`;
}

/**
 * Create a new demo order and automatically update inventory stock
 */
async function createOrder(req, res) {
    try {
        const {
            items,
            customerName,
            customerEmail,
            shippingAddress,
            city,
            postalCode,
            country = 'United Kingdom',
            paymentMethod = 'Demo Checkout',
            notes = ''
        } = req.body;

        if (!items || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ error: 'Order must contain at least one football.' });
        }

        if (!customerName || !customerEmail || !shippingAddress || !city || !postalCode) {
            return res.status(400).json({ error: 'Please provide full name, email, shipping address, city, and postal code.' });
        }

        const db = getDb();
        const lineItems = [];
        let totalAmount = 0;

        // Verify each product and validate stock availability
        for (const item of items) {
            const quantity = parseInt(item.quantity, 10);
            if (isNaN(quantity) || quantity <= 0) {
                return res.status(400).json({ error: 'Item quantities must be positive integers.' });
            }

            const { data: products, error: pError } = await db
                .from('products')
                .select('*')
                .eq('id', item.productId);

            if (pError || !products || products.length === 0) {
                return res.status(404).json({ error: `Football product ${item.productId} was not found.` });
            }

            const product = products[0];

            if (product.stock_quantity < quantity) {
                return res.status(400).json({
                    error: `Insufficient stock for "${product.name}". Only ${product.stock_quantity} left in stock.`
                });
            }

            const unitPrice = parseFloat(product.price);
            const subtotal = Math.round(unitPrice * quantity * 100) / 100;
            totalAmount += subtotal;

            lineItems.push({
                product,
                quantity,
                unitPrice,
                subtotal
            });
        }

        totalAmount = Math.round(totalAmount * 100) / 100;

        const orderNumber = generateOrderNumber();
        const userId = req.user ? req.user.id : null;

        // Insert into orders table
        const orderPayload = {
            order_number: orderNumber,
            user_id: userId,
            customer_name: customerName.trim(),
            customer_email: customerEmail.trim().toLowerCase(),
            shipping_address: shippingAddress.trim(),
            city: city.trim(),
            postal_code: postalCode.trim(),
            country: country.trim(),
            payment_method: paymentMethod,
            total_amount: totalAmount,
            status: 'processing',
            notes: notes ? notes.trim() : null
        };

        const { data: insertedOrder, error: orderError } = await db
            .from('orders')
            .insert(orderPayload)
            .select('*')
            .single();

        if (orderError || !insertedOrder) {
            return res.status(500).json({ error: 'Failed to record order. Please try again.' });
        }

        // Insert order items and deduct stock
        const createdItems = [];
        for (const line of lineItems) {
            const itemPayload = {
                order_id: insertedOrder.id,
                product_id: line.product.id,
                product_name: line.product.name,
                product_brand: line.product.brand,
                ball_size: line.product.ball_size,
                quantity: line.quantity,
                unit_price: line.unitPrice,
                subtotal: line.subtotal
            };

            const { data: itemRecord } = await db
                .from('order_items')
                .insert(itemPayload)
                .select('*')
                .single();

            createdItems.push(itemRecord || itemPayload);

            // Deduct stock quantity
            const newStock = Math.max(0, line.product.stock_quantity - line.quantity);
            await db
                .from('products')
                .update({ stock_quantity: newStock })
                .eq('id', line.product.id);
        }

        return res.status(201).json({
            message: 'Order placed successfully! This is a demo order and no real money was charged.',
            order: {
                ...insertedOrder,
                items: createdItems
            }
        });
    } catch (err) {
        console.error('Order creation error:', err);
        return res.status(500).json({ error: 'Internal server error processing your order.' });
    }
}

/**
 * Get orders belonging to the logged-in customer
 */
async function getMyOrders(req, res) {
    try {
        const db = getDb();
        const userEmail = req.user.email.toLowerCase();
        const userId = req.user.id;

        // Retrieve orders matching user_id or customer_email
        const { data: allOrders, error } = await db
            .from('orders')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            return res.status(500).json({ error: 'Failed to retrieve order history.' });
        }

        const userOrders = (allOrders || []).filter(
            (o) => o.user_id === userId || (o.customer_email && o.customer_email.toLowerCase() === userEmail)
        );

        // Fetch line items for each order
        const ordersWithItems = await Promise.all(
            userOrders.map(async (order) => {
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
        console.error('Fetch customer orders error:', err);
        return res.status(500).json({ error: 'Internal server error fetching order history.' });
    }
}

/**
 * Get single order details
 */
async function getOrderById(req, res) {
    try {
        const { id } = req.params;
        const db = getDb();

        const { data: orders, error } = await db
            .from('orders')
            .select('*')
            .eq('id', id);

        if (error || !orders || orders.length === 0) {
            return res.status(404).json({ error: 'Order not found.' });
        }

        const order = orders[0];

        // Security check: Only owner or admin can view
        const isOwner = req.user && (
            req.user.id === order.user_id ||
            req.user.email.toLowerCase() === order.customer_email.toLowerCase()
        );
        const isAdmin = req.user && req.user.role === 'admin';

        if (!isOwner && !isAdmin) {
            return res.status(403).json({ error: 'Unauthorized to view this order.' });
        }

        const { data: items } = await db
            .from('order_items')
            .select('*')
            .eq('order_id', order.id);

        return res.status(200).json({
            order: {
                ...order,
                items: items || []
            }
        });
    } catch (err) {
        console.error('Order detail fetch error:', err);
        return res.status(500).json({ error: 'Internal server error retrieving order.' });
    }
}

module.exports = {
    createOrder,
    getMyOrders,
    getOrderById
};
