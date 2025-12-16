const express = require("express");
const { ObjectId } = require("mongodb");
const { getDb } = require("../db");

const router = express.Router();

function tagsToString(tags) {
  if (!Array.isArray(tags)) return "";
  return tags.join(", ");
}

router.get("/", async (req, res) => {
  const db = await getDb();
  const stories = await db.collection("stories").find().sort({ created_at: -1 }).toArray();
  res.render("index", { stories });
});

router.get("/new", (req, res) => {
  res.render("form", {
    pageTitle: "Add Story",
    action: "/create",
    story: { title: "", author: "", language: "en", text: "", tagsText: "" },
    isEdit: false,
  });
});

router.post("/create", async (req, res) => {
  const db = await getDb();
  const { title, author, language = "en", text, tags = "" } = req.body;
  await db.collection("stories").insertOne({
    title: String(title).trim(),
    author: String(author).trim(),
    language: String(language).trim(),
    text: String(text).trim(),
    tags: tags.split(",").map(t => t.trim()).filter(Boolean),
    comments: [],
    ratings: [],
    created_at: new Date(),
    updated_at: new Date(),
  });
  res.redirect("/");
});

router.get("/edit/:id", async (req, res) => {
  const db = await getDb();
  let story;
  try {
    story = await db.collection("stories").findOne({ _id: new ObjectId(req.params.id) });
  } catch {
    return res.status(400).send("Invalid ID");
  }
  if (!story) return res.status(404).send("Not found");

  res.render("form", {
    pageTitle: "Edit Story",
    action: `/update/${story._id}`,
    story: { ...story, tagsText: tagsToString(story.tags) },
    isEdit: true,
  });
});

router.post("/update/:id", async (req, res) => {
  const db = await getDb();
  const { title, author, language = "en", text, tags = "" } = req.body;
  await db.collection("stories").updateOne(
    { _id: new ObjectId(req.params.id) },
    {
      $set: {
        title: String(title).trim(),
        author: String(author).trim(),
        language: String(language).trim(),
        text: String(text).trim(),
        tags: tags.split(",").map(t => t.trim()).filter(Boolean),
        updated_at: new Date(),
      },
    }
  );
  res.redirect("/");
});

router.get("/delete/:id", async (req, res) => {
  const db = await getDb();
  await db.collection("stories").deleteOne({ _id: new ObjectId(req.params.id) });
  res.redirect("/");
});

module.exports = router;

