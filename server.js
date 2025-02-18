const express = require("express");
const path = require("path");
const cors = require("cors");
require("dotenv").config();
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

const app = express();

// 🛠 Middleware
app.use(express.static(path.join(__dirname, "public")));
app.use(cors());
app.use(express.json());

// 🌍 Serwowanie pliku HTML
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "shop.html"));
});

// 🚀 API do płatności
app.post("/create-checkout-session", async (req, res) => {
    try {
        console.log("➡ Otrzymano żądanie do Stripe");
        const { cart } = req.body;

        if (!cart || cart.length === 0) {
            console.error("❌ Koszyk jest pusty!");
            return res.status(400).json({ error: "Koszyk jest pusty!" });
        }

        console.log("✅ Koszyk zawiera:", cart);

        const lineItems = cart.map(item => ({
            price_data: {
                currency: "pln",
                product_data: { name: item.name },
                unit_amount: Math.round(item.price * 100),
            },
            quantity: 1,
        }));

        console.log("🛒 Przetworzone produkty dla Stripe:", lineItems);

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ["card"],
            line_items: lineItems,
            mode: "payment",
            success_url: "https://shop-13e1.onrender.com/thank-you.html",
            cancel_url: "https://shop-13e1.onrender.com/shop.html",
        });

        console.log("✅ Sesja Stripe utworzona:", session.id);
        res.json({ id: session.id });

    } catch (error) {
        console.error("❌ Błąd Stripe:", error.message);
        res.status(500).json({ error: error.message });
    }
});

// 🚀 Uruchomienie serwera
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ Serwer działa na porcie ${PORT}`));
