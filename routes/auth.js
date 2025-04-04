import express from "express";
import db from "../config/db.js"; 

const router = express.Router();

router.get("/login", (req, res) => {
    res.render("login.ejs");
});

router.get("/register", (req, res) => {
    res.render("register.ejs");
});

router.post("/register", async (req, res) => {
    const email = req.body.username;
    const password = req.body.password;

    try {
        const checkResult = await db.query("SELECT * FROM users WHERE email = $1", [email]);
        
        if (checkResult.rows.length > 0) {
            return res.send("Email already exists. Try logging in.");
        }

        await db.query("INSERT INTO users (email, password) VALUES ($1, $2)", [email, password]);

        res.redirect("/login");

    } catch (error) {
        console.error("Error during registration:", error);
        res.status(500).send("Internal Server Error");
    }
});

router.post("/login", async (req, res) => {
    const email = req.body.username;
    const password = req.body.password;

    try {
        const result = await db.query("SELECT * FROM users WHERE email = $1", [email]);

        if (result.rows.length > 0) {
            const user = result.rows[0];
            if (password === user.password) {
                res.render("main.ejs");
            } else {
                res.send("Incorrect password");
            }
        } else {
            res.send("User not found");
        }
    } catch (error) {
        console.error("Login error:", error);
        res.status(500).send("Internal Server Error");
    }
});

export default router;
