import express from "express";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.js";   // Authentication routes
import listRoutes from "./routes/listRoutes.js";   // Import your new list routes
import path from 'path';
import cors from 'cors';
const __dirname = path.dirname(new URL(import.meta.url).pathname);

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, 'public')));
app.use((err, req, res, next) => {
    console.error('Error rendering view:', err.message);
    res.status(500).send('Something went wrong!');
  });
  

// Routes
app.get("/", (req, res) => res.render("home.ejs"));
app.use("/", authRoutes);  // Authentication routes
app.use("/", listRoutes);  // Use the new list routes for saving and viewing lists

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
