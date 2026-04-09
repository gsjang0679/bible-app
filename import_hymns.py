import sqlite3
import json
import os

db_path = 'bible.db'
json_path = 'hymn-data.json'

if not os.path.exists(json_path):
    print("JSON file not found!")
    exit(1)

with open(json_path, 'r', encoding='utf-8') as f:
    hymns_data = json.load(f)

conn = sqlite3.connect(db_path)
cursor = conn.cursor()

# Clear existing rows to avoid duplicates or incomplete data
cursor.execute("DELETE FROM hymns")

for hymn in hymns_data:
    number = hymn.get('no')
    title = hymn.get('title')
    lyrics = hymn.get('full_lyrics') or hymn.get('lyrics')
    images = hymn.get('img')
    
    if number and title:
        cursor.execute(
            "INSERT INTO hymns (number, title, lyrics, images) VALUES (?, ?, ?, ?)",
            (number, title, lyrics, images)
        )

conn.commit()
count = cursor.execute("SELECT COUNT(*) FROM hymns").fetchone()[0]
conn.close()
print(f"Successfully imported {count} hymns into the database.")
