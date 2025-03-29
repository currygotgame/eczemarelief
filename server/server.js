const path = require('path'); // Require path before using it
require('dotenv').config({ path: path.join(__dirname, '.env') }); // Load .env from the server folder

const express = require('express');
const cors = require('cors');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY); // Use env variable

console.log('Loaded Stripe Public Key:', process.env.STRIPE_PUBLIC_KEY); // Debugging log


const app = express();

// Use the port that Render assigns or default to 3000 for local development
const port = process.env.PORT || 10000;


app.use(cors());
app.use(express.json());

// Serve static files from the root directory (index.html is in root)
app.use(express.static(path.join(__dirname, '../')));

// Route to serve the index.html
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../index.html'));
});

// Serve Stripe public key from the server
// Serve Stripe public key from the server
app.get('/get-stripe-public-key', (req, res) => {
    console.log('Debugging, remove before pushing', process.env.STRIPE_PUBLIC_KEY);
    res.json({ publicKey: process.env.STRIPE_PUBLIC_KEY });
});
// Serve success and cancel pages from the 'brand' folder
app.get('/success.html', (req, res) => {
    console.log('Success page requested');
    res.sendFile(path.join(__dirname, '../brand/success.html'));
});

app.get('/cancel.html', (req, res) => {
    console.log('Cancel page requested');
    res.sendFile(path.join(__dirname, '../brand/cancel.html'));
});

app.post('/create-checkout-session', async (req, res) => {
    console.log("Checkout session route hit"); // Debugging log
    try {
        if (!req.body.items || !Array.isArray(req.body.items)) {
            return res.status(400).json({ error: "Invalid items array" });
        }

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: req.body.items.map(item => ({
                price_data: {
                    currency: item.currency,
                    product_data: { name: item.name },
                    unit_amount: item.price, 
                },
                quantity: item.quantity,
            })),
            mode: 'payment',
            success_url: `${req.protocol}://${req.get('host')}/success.html`,
            cancel_url: `${req.protocol}://${req.get('host')}/cancel.html`,
        });

        console.log("Session created:", session.id);
        res.json({ id: session.id });
    } catch (error) {
        console.error('Error creating checkout session:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Start the server and bind it to the appropriate network interface and port
app.listen(port, '0.0.0.0', () => {
    console.log(`Server is running on http://localhost:${port}`);
});
