import re
from collections import Counter
from pymongo import MongoClient

MONGO_URI = "mongodb://admin:secret123@localhost:27017/?authSource=admin"
DB_NAME = "litverse"

WORD_RE = re.compile(r"[A-Za-z']+")

def map_words(text: str):
    # map: emit (word, 1)
    for w in WORD_RE.findall(text.lower()):
        yield w

def main():
    client = MongoClient(MONGO_URI)
    db = client[DB_NAME]
    stories = db["stories"].find({}, {"text": 1})

    # reduce: aggregate counts
    counts = Counter()
    for s in stories:
        for w in map_words(s.get("text", "")):
            counts[w] += 1

    top = counts.most_common(20)
    print("Top 20 words:")
    for w, c in top:
        print(f"{w:15} {c}")

    # store results back to MongoDB (like an output collection)
    out = db["word_counts"]
    out.delete_many({})
    out.insert_many([{"word": w, "count": c} for w, c in counts.items()])
    print(f"\nSaved {len(counts)} word counts into collection: word_counts")

if __name__ == "__main__":
    main()

