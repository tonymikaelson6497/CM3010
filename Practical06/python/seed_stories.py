from pymongo import MongoClient
from datetime import datetime

MONGO_URI = "mongodb://admin:secret123@localhost:27017/?authSource=admin"
DB_NAME = "litverse"

client = MongoClient(MONGO_URI)
db = client[DB_NAME]
col = db["stories"]

seed = [
    {
        "title": "Distributed Mind",
        "author": "CM3010 Student",
        "language": "en",
        "text": "In a world of shards and replicas, availability often beats consistency.",
        "tags": ["cap", "mongodb", "distributed"],
        "comments": [],
        "ratings": [5, 4],
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow(),
    },
    {
        "title": "Echoes in the Cloud",
        "author": "T. Dev",
        "language": "en",
        "text": "Data flowed like rivers across continents. Memory was the rarest commodity.",
        "tags": ["sci-fi", "cap"],
        "comments": [],
        "ratings": [5, 5, 4],
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow(),
    },
]

r = col.insert_many(seed)
print("Inserted:", len(r.inserted_ids))

