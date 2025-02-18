const express = require("express");
const path = require("path");
const app = express();
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

const app = express();
app.use(express.json());
app.use(cors());

app.post("/create-checkout-session", async (req, res) => {
    try {
        const { cart } = req.body;
        
        if (!cart || cart.length === 0) {
            return res.status(400).json({ error: "Koszyk jest pusty!" });
        }

        const lineItems = cart.map(item => ({
            price_data: {
                currency: "pln",
                product_data: { name: item.name },
                unit_amount: Math.round(item.price * 100), // Stripe używa groszy
            },
            quantity: 1,
        }));

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ["card"],
            line_items: lineItems,
            mode: "payment",
            success_url: "http://localhost:3000/thank-you.html", // 🔹 Poprawione przekierowanie!
            cancel_url: "http://localhost:3000/shop.html",
        });

        res.json({ id: session.id });
    } catch (error) {
        console.error("❌ Błąd Stripe:", error);
        res.status(500).json({ error: error.message });
    }
});

// Uruchomienie serwera
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ Serwer działa na porcie ${PORT}`));
