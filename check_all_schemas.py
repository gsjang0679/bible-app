import sqlite3
import os

db_path = "bible.db"
conn = sqlite3.connect(db_path)
cursor = conn.cursor()

cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
tables = [t[0] for t in cursor.fetchall()]

for table in tables:
    print(f"\n--- {table} ---")
    cursor.execute(f"PRAGMA table_info({table});")
    for col in cursor.fetchall():
        print(col)

conn.close()
