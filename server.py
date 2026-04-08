from fastapi import FastAPI, HTTPException
from fastapi.staticfiles import StaticFiles
from fastapi.responses import HTMLResponse
import sqlite3
import json
import os

app = FastAPI()

DB_PATH = "bible.db"
HYMN_DATA_PATH = "hymn-data.json"

# Load Hymn Data
with open(HYMN_DATA_PATH, "r", encoding="utf-8") as f:
    hymn_data = json.load(f)

def get_db_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

@app.get("/api/bible/books")
def get_books():
    conn = get_db_connection()
    # Get all books with their max chapter count
    books = conn.execute("""
        SELECT b.*, MAX(v.chapter) as max_chapter 
        FROM books b 
        JOIN verses v ON b.id = v.book_id 
        GROUP BY b.id 
        ORDER BY b.display_order
    """).fetchall()
    conn.close()
    return [dict(book) for book in books]

@app.get("/api/bible/verses/{book_id}/{chapter}")
def get_verses(book_id: int, chapter: int):
    conn = get_db_connection()
    verses = conn.execute(
        "SELECT * FROM verses WHERE book_id = ? AND chapter = ? ORDER BY verse",
        (book_id, chapter)
    ).fetchall()
    conn.close()
    return [dict(verse) for verse in verses]

@app.get("/api/hymnal")
def get_hymnal_list(q: str = ""):
    if q:
        filtered = [h for h in hymn_data if q in h['title'] or str(h['no']) == q]
        return filtered
    return hymn_data

@app.get("/api/hymnal/{no}")
def get_hymn(no: int):
    for h in hymn_data:
        if h['no'] == no:
            return h
    raise HTTPException(status_code=404, detail="Hymn not found")

# Serve static files
app.mount("/static", StaticFiles(directory="static"), name="static")

@app.get("/", response_class=HTMLResponse)
async def read_index():
    with open(os.path.join("static", "index.html"), "r", encoding="utf-8") as f:
        return f.read()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
