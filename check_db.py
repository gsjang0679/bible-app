import sqlite3
import os

db_path = "bible.db"
if os.path.exists(db_path):
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
    tables = cursor.fetchall()
    print("Tables:", [t[0] for t in tables])
    
    # Check if hymns table exists and its schema
    if ("hymns",) in tables:
        cursor.execute("PRAGMA table_info(hymns);")
        print("Hymns schema:", cursor.fetchall())
    
    conn.close()
else:
    print("DB not found")
