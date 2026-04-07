
import sqlite3
import json
import os

def export_to_json(db_path, json_path):
    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()

    # 1. Export Books
    books = cursor.execute("SELECT * FROM books ORDER BY display_order").fetchall()
    books_list = [dict(b) for b in books]

    # 2. Export Verses
    verses = cursor.execute("SELECT * FROM verses ORDER BY book_id, chapter, verse").fetchall()
    verses_list = [dict(v) for v in verses]

    data = {
        "books": books_list,
        "verses": verses_list
    }

    with open(json_path, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False)

    conn.close()
    print(f"Exported data to {json_path}")

if __name__ == "__main__":
    db_file = os.path.join(os.getcwd(), "bible.db")
    static_folder = os.path.join(os.getcwd(), "static")
    if not os.path.exists(static_folder):
        os.makedirs(static_folder)
    
    json_file = os.path.join(static_folder, "bible_data.json")
    export_to_json(db_file, json_file)
