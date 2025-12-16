# CM3010 Practical 6 – Distributed Databases and Other Database Models (LitVerse)

## Summary
This practical models "LitVerse", a global literature platform with high traffic spikes, frequent schema evolution, and the need for global availability. I justified using MongoDB (document NoSQL) using the CAP theorem and implemented a working prototype with:
- MongoDB (Docker) as the document store
- Node.js + Express + Mustache UI for CRUD on stories
- Python (pymongo) MapReduce-style word frequency analysis

## CAP Theorem Decision (Why AP)
LitVerse is geographically distributed, so **Partition Tolerance (P)** is unavoidable.
To meet “always-on” requirements during regional outages/partitions, LitVerse prioritizes **Availability (A)**.
Consistency can be relaxed because a few seconds of staleness (e.g., a comment appearing slightly later) is acceptable for literary/social content.
Therefore, LitVerse aligns with an **AP** design (eventual consistency).

## Why MongoDB
MongoDB supports:
- Flexible schema (stories can optionally include new fields like `audio_url`, extra metadata, annotations)
- Denormalised documents (story + tags + comments arrays in one document → avoids joins)
- Horizontal scaling patterns (replication/sharding) suitable for high read/write workloads

## Document Model
A story is stored as a single document in `stories`, e.g.
- title, author, language, text
- tags: [ ... ]
- comments: [ ... ]
- ratings: [ ... ]
- created_at, updated_at

This reduces cross-document joins and supports distributed partitioning.

## Features Implemented
### 1) CRUD Web App (Mustache)
- List stories: `GET /`
- Add story: `GET /new`, `POST /create`
- Edit story: `GET /edit/:id`, `POST /update/:id`
- Delete story: `GET /delete/:id`

### 2) JSON API
- `POST /api/stories`
- `GET /api/stories`
- `GET /api/stories/:id`
- `PUT /api/stories/:id`
- `DELETE /api/stories/:id`

### 3) MapReduce-style Word Count (Python)
- `python/wordcount_mapreduce.py` reads all story texts, maps tokens to (word,1), reduces into counts, prints top words, and writes results to `word_counts`.

## How to Run
### Start MongoDB
```bash
docker start cm3010-mongoDB

