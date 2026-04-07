
import sqlite3
import csv
import os
import re

def convert_to_sqlite(txt_path, book_names_csv, db_path):
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()

    # Clear tables for a fresh start
    cursor.execute('DROP TABLE IF EXISTS bookmarks')
    cursor.execute('DROP TABLE IF EXISTS verses')
    cursor.execute('DROP TABLE IF EXISTS books')

    # Create tables
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS books (
            id INTEGER PRIMARY KEY,
            kor_short TEXT,
            kor_full TEXT,
            eng_full TEXT,
            testament TEXT,
            display_order INTEGER
        )
    ''')

    cursor.execute('''
        CREATE TABLE IF NOT EXISTS verses (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            book_id INTEGER,
            chapter INTEGER,
            verse INTEGER,
            content TEXT,
            FOREIGN KEY (book_id) REFERENCES books (id)
        )
    ''')

    cursor.execute('''
        CREATE TABLE IF NOT EXISTS bookmarks (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            verse_id INTEGER,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (verse_id) REFERENCES verses (id)
        )
    ''')

    # Load book names
    short_to_id = {}
    with open(book_names_csv, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for i, row in enumerate(reader):
            # i is index, row['code'] has 'O' for Old, 'N' for New
            testament = 'Old' if 'O' in row['code'] else 'New'
            cursor.execute('INSERT INTO books (id, kor_short, kor_full, eng_full, testament, display_order) VALUES (?, ?, ?, ?, ?, ?)',
                           (i+1, row['kor_short'], row['kor'], row['eng'], testament, i))
            short_to_id[row['kor_short']] = i + 1

    # Load verses
    # Format: 창1:1 태초에 하나님이 천지를 창조하시니라
    with open(txt_path, 'r', encoding='utf-8') as f:
        current_book_short = ""
        for line in f:
            line = line.strip()
            if not line: continue
            
            # Use regex to match abbreviation, chapter, verse
            match = re.match(r'^([ㄱ-ㅎ가-힣]+)(\d+):(\d+)\s+(.*)$', line)
            if match:
                abbr, chapter, verse, content = match.groups()
                book_id = short_to_id.get(abbr)
                if book_id:
                    cursor.execute('INSERT INTO verses (book_id, chapter, verse, content) VALUES (?, ?, ?, ?)',
                                   (book_id, int(chapter), int(verse), content))
                else:
                    print(f"Warning: Unknown book abbr '{abbr}'")

    conn.commit()
    conn.close()
    print(f"Database created at {db_path}")

if __name__ == "__main__":
    base_path = r"C:\Users\best0\python\성경\py_kbible-master\py_kbible\data"
    txt_file = os.path.join(base_path, "개역개정판성경.txt")
    csv_file = os.path.join(base_path, "book_names.csv")
    db_file = os.path.join(os.getcwd(), "bible.db")
    
    convert_to_sqlite(txt_file, csv_file, db_file)
