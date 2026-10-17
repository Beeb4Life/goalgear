/**
 * GoalGear - Authentication Controller
 *
 * Handles customer registration, login, and profile retrieval.
 */

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { getDb } = require('../config/supabase');
const { JWT_SECRET } = require('../middleware/auth');

const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

/**
 * Register a new customer
 */
async function register(req, res) {
    try {
        const { email, password, fullName } = req.body;

        if (!email || !password || !fullName) {
            return res.status(400).json({ error: 'Email, password, and full name are required.' });
        }

        const emailTrimmed = email.trim().toLowerCase();
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(emailTrimmed)) {
            return res.status(400).json({ error: 'Please provide a valid email address.' });
        }

        if (password.length < 6) {
            return res.status(400).json({ error: 'Password must be at least 6 characters long.' });
        }

        const db = getDb();

        // Check if email already registered
        const { data: existingUser } = await db
            .from('users')
            .select('id, email')
            .eq('email', emailTrimmed);

        if (existingUser && existingUser.length > 0) {
            return res.status(409).json({ error: 'An account with this email address already exists.' });
        }

        // Hash password with bcrypt
        const passwordHash = await bcrypt.hash(password, 10);

        // Insert new customer
        const { data: insertedUser, error } = await db
            .from('users')
            .insert({
                email: emailTrimmed,
                password_hash: passwordHash,
                full_name: fullName.trim(),
                role: 'customer'
            })
            .select('id, email, full_name, role, created_at')
            .single();

        if (error || !insertedUser) {
            return res.status(500).json({ error: 'Failed to create user account. Please try again.' });
        }

        // Generate JWT token
        const token = jwt.sign(
            {
                id: insertedUser.id,
                email: insertedUser.email,
                role: insertedUser.role,
                fullName: insertedUser.full_name
            },
            JWT_SECRET,
            { expiresIn: JWT_EXPIRES_IN }
        );

        return res.status(201).json({
            message: 'Account created successfully!',
            token,
            user: {
                id: insertedUser.id,
                email: insertedUser.email,
                fullName: insertedUser.full_name,
                role: insertedUser.role
            }
        });
    } catch (err) {
        console.error('Registration error:', err);
        return res.status(500).json({ error: 'An unexpected server error occurred during registration.' });
    }
}

/**
 * Log in an existing user (customer or admin)
 */
async function login(req, res) {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required.' });
        }

        const emailTrimmed = email.trim().toLowerCase();
        const db = getDb();

        const { data: users, error } = await db
            .from('users')
            .select('*')
            .eq('email', emailTrimmed);

        if (error || !users || users.length === 0) {
            return res.status(401).json({ error: 'Invalid email or password.' });
        }

        const user = users[0];

        // Compare bcrypt hash
        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid email or password.' });
        }

        // Generate JWT token
        const token = jwt.sign(
            {
                id: user.id,
                email: user.email,
                role: user.role,
                fullName: user.full_name
            },
            JWT_SECRET,
            { expiresIn: JWT_EXPIRES_IN }
        );

        return res.status(200).json({
            message: 'Login successful!',
            token,
            user: {
                id: user.id,
                email: user.email,
                fullName: user.full_name,
                role: user.role
            }
        });
    } catch (err) {
        console.error('Login error:', err);
        return res.status(500).json({ error: 'An unexpected server error occurred during login.' });
    }
}

/**
 * Get current authenticated user profile
 */
async function getMe(req, res) {
    try {
        const db = getDb();
        const { data: users, error } = await db
            .from('users')
            .select('id, email, full_name, role, created_at')
            .eq('id', req.user.id);

        if (error || !users || users.length === 0) {
            return res.status(404).json({ error: 'User profile not found.' });
        }

        return res.status(200).json({ user: users[0] });
    } catch (err) {
        console.error('Profile fetch error:', err);
        return res.status(500).json({ error: 'Failed to retrieve user profile.' });
    }
}

module.exports = {
    register,
    login,
    getMe
};
