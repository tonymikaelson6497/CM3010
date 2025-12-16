const express = require("express");
const { ObjectId } = require("mongodb");
const { getDb } = require("../db");

const router = express.Router();

function normalizeTags(tags) {
  if (Array.isArray(tags)) return tags.map(t => String(t).trim()).filter(Boolean);
  if (typeof tags === "string") return tags.split(",").map(t => t.trim()).filter(Boolean);
  return [];
}

// CREATE story
router.post("/stories", async (req, res) => {
  try {
    const { title, author, text, language = "en", tags = [] } = req.body;
    if (!title || !author || !text) return res.status(400).json({ error: "title, author, text required" });

    const db = await getDb();
    const doc = {
      title: String(title).trim(),
      author: String(author).trim(),
      text: String(text).trim(),
      language: String(language).trim(),
      tags: normalizeTags(tags),
      comments: [],
      ratings: [],
      created_at: new Date(),
      updated_at: new Date(),
    };

    const r = await db.collection("stories").insertOne(doc);
    res.status(201).json({ _id: r.insertedId, ...doc });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// READ all
router.get("/stories", async (req, res) => {
  try {
    const db = await getDb();
    const stories = await db.collection("stories").find().sort({ created_at: -1 }).toArray();
    res.json(stories);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// READ one
router.get("/stories/:id", async (req, res) => {
  try {
    const db = await getDb();
    const story = await db.collection("stories").findOne({ _id: new ObjectId(req.params.id) });
    if (!story) return res.status(404).json({ error: "not found" });
    res.json(story);
  } catch (e) {
    res.status(400).json({ error: "invalid id" });
  }
});

// UPDATE
router.put("/stories/:id", async (req, res) => {
  try {
    const { title, author, text, language = "en", tags = [] } = req.body;
    if (!title || !author || !text) return res.status(400).json({ error: "title, author, text required" });

    const db = await getDb();
    const update = {
      title: String(title).trim(),
      author: String(author).trim(),
      text: String(text).trim(),
      language: String(language).trim(),
      tags: normalizeTags(tags),
      updated_at: new Date(),
    };

    const r = await db.collection("stories").updateOne(
      { _id: new ObjectId(req.params.id) },
      { $set: update }
    );
    if (!r.matchedCount) return res.status(404).json({ error: "not found" });
    res.json({ ok: true });
  } catch (e) {
    res.status(400).json({ error: "invalid id" });
  }
});

// DELETE
router.delete("/stories/:id", async (req, res) => {
  try {
    const db = await getDb();
    const r = await db.collection("stories").deleteOne({ _id: new ObjectId(req.params.id) });
    if (!r.deletedCount) return res.status(404).json({ error: "not found" });
    res.json({ ok: true });
  } catch (e) {
    res.status(400).json({ error: "invalid id" });
  }
});

module.exports = router;

