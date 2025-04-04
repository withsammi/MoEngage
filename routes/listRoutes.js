import express from "express";
import db from "../config/db.js";  // Make sure to import your DB connection

const router = express.Router();

// Route to save filtered list
router.post("/save-list", async (req, res) => {
  const { listName, filteredCodes } = req.body;

  if (!listName || !filteredCodes.length) {
      return res.status(400).json({ message: "List name or codes are missing!" });
  }

  try {
      // Save the list to the lists table
      const createdAt = new Date();
      const result = await db.query(
          "INSERT INTO lists (name, created_at) VALUES ($1, $2) RETURNING id", 
          [listName, createdAt]
      );

      const listId = result.rows[0].id;

      // Save each filtered item to the list_items table
      const items = filteredCodes.map(code => {
          return {
              listId,
              responseCode: code.response_code,
              imageUrl: code.image_url,
          };
      });

      for (let item of items) {
          await db.query(
              "INSERT INTO list_items (list_id, response_code, image_url) VALUES ($1, $2, $3)", 
              [item.listId, item.responseCode, item.imageUrl]
          );
      }

      res.json({ message: "List saved successfully!" });

  } catch (err) {
      console.error("Error saving list:", err);
      res.status(500).json({ message: "Failed to save the list!" });
  }
});

// In listRoutes.js


router.get("/lists/view", async (req, res) => {
  try {
      // Fetch the lists from the database
      const listsResult = await db.query("SELECT * FROM lists ORDER BY created_at DESC");
      const lists = listsResult.rows;

      // Fetch the items for each list
      const listsWithItems = await Promise.all(
          lists.map(async (list) => {
              const itemsResult = await db.query(
                  "SELECT response_code, image_url FROM list_items WHERE list_id = $1", 
                  [list.id]
              );
              return {
                  ...list,
                  items: itemsResult.rows
              };
          })
      );

      // Return the lists as JSON response
      res.json({ lists: listsWithItems });
  } catch (error) {
      console.error("Error occurred:", error);
      res.status(500).json({ message: "Something went wrong while fetching lists" });
  }
});

export default router;
