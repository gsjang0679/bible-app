import sqlite3
import os

DB_PATH = "bible.db"

def check_db():
    if not os.path.exists(DB_PATH):
        print(f"DB not found: {DB_PATH}")
        return
    
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    print("--- Books ---")
    cursor.execute("SELECT * FROM books LIMIT 5;")
    for row in cursor.fetchall():
        print(row)
        
    print("\n--- Verses ---")
    cursor.execute("SELECT * FROM verses LIMIT 5;")
    for row in cursor.fetchall():
        print(row)
        
    conn.close()

if __name__ == "__main__":
    check_db()
