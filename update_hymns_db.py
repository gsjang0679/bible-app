import sqlite3
import json
import os

db_path = 'bible.db'
json_path = '../hymn-data.json'

if not os.path.exists(json_path):
    print("JSON file not found!")
    exit(1)

with open(json_path, 'r', encoding='utf-8') as f:
    hymns_data = json.load(f)

conn = sqlite3.connect(db_path)
cursor = conn.cursor()

# Check if images column exists, if not add it or rename
cursor.execute("PRAGMA table_info(hymns)")
columns = [c[1] for c in cursor.fetchall()]
if 'images' not in columns:
    cursor.execute("ALTER TABLE hymns ADD COLUMN images TEXT")

for hymn in hymns_data:
    number = hymn.get('no')
    image_name = hymn.get('img')
    if number and image_name:
        cursor.execute("UPDATE hymns SET images = ? WHERE number = ?", (image_name, number))

conn.commit()
conn.close()
print("Database updated with correct hymn image names.")
