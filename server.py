from fastapi import FastAPI, Request, HTTPException, File, UploadFile, Form
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, JSONResponse
from pydantic import BaseModel
from typing import Optional
import sqlite3
import os

app = FastAPI()

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DB_PATH = os.path.join(BASE_DIR, "bible.db")
STATIC_DIR = os.path.join(BASE_DIR, "static")

def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

STORY_DB_PATH = os.path.join(BASE_DIR, "story.db")

def init_story_db():
    conn = sqlite3.connect(STORY_DB_PATH)
    cursor = conn.cursor()
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS stories (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            type TEXT NOT NULL, 
            author TEXT NOT NULL, 
            content TEXT NOT NULL,
            reference TEXT, 
            media_url TEXT, 
            is_answered BOOLEAN DEFAULT 0, 
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)
    conn.commit()
    conn.close()

init_story_db()

def get_story_db():
    conn = sqlite3.connect(STORY_DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

@app.get("/api/books")
async def get_books():
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT id, kor_short, kor_full, testament, display_order FROM books ORDER BY display_order")
    books = [dict(row) for row in cursor.fetchall()]
    conn.close()
    return books

@app.get("/api/chapters/{book_id}")
async def get_chapters(book_id: int):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT DISTINCT chapter FROM verses WHERE book_id = ? ORDER BY chapter", (book_id,))
    chapters = [row["chapter"] for row in cursor.fetchall()]
    conn.close()
    return chapters

@app.get("/api/verses/{book_id}/{chapter}")
async def get_verses(book_id: int, chapter: int):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT id, book_id, chapter, verse, content FROM verses WHERE book_id = ? AND chapter = ? ORDER BY verse", (book_id, chapter))
    verses = [dict(row) for row in cursor.fetchall()]
    conn.close()
    return verses

@app.get("/api/search")
async def search_bible(q: str):
    if not q or len(q) < 2:
        return []
    conn = get_db()
    cursor = conn.cursor()
    # Search in verses and join with books for full name
    cursor.execute("""
        SELECT v.id, v.book_id, v.chapter, v.verse, v.content, b.kor_full 
        FROM verses v
        JOIN books b ON v.book_id = b.id
        WHERE v.content LIKE ? 
        LIMIT 100
    """, (f"%{q}%",))
    results = [dict(row) for row in cursor.fetchall()]
    conn.close()
    return results

@app.get("/api/hymns/{number}")
async def get_hymn(number: int):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT id, number, title, lyrics, images FROM hymns WHERE number = ?", (number,))
    hymn = cursor.fetchone()
    conn.close()
    if hymn:
        return dict(hymn)
    raise HTTPException(status_code=404, detail="Hymn not found")

@app.get("/api/hymns")
async def search_hymns(q: str = None):
    conn = get_db()
    cursor = conn.cursor()
    if q:
        cursor.execute("SELECT id, number, title, lyrics, images FROM hymns WHERE title LIKE ? OR lyrics LIKE ? ORDER BY number", (f"%{q}%", f"%{q}%"))
    else:
        cursor.execute("SELECT id, number, title, lyrics, images FROM hymns ORDER BY number")
    hymns = [dict(row) for row in cursor.fetchall()]
    conn.close()
    return hymns

class StoryCreate(BaseModel):
    type: str # 'word', 'gratitude', 'prayer', 'song'
    author: str # '남편', '아내'
    content: str
    reference: Optional[str] = None
    media_url: Optional[str] = None

@app.post("/api/stories")
async def create_story(story: StoryCreate):
    conn = get_story_db()
    cursor = conn.cursor()
    cursor.execute("""
        INSERT INTO stories (type, author, content, reference, media_url)
        VALUES (?, ?, ?, ?, ?)
    """, (story.type, story.author, story.content, story.reference, story.media_url))
    conn.commit()
    story_id = cursor.lastrowid
    conn.close()
    return {"id": story_id, "message": "Story created."}

@app.get("/api/stories")
async def get_stories():
    conn = get_story_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM stories ORDER BY created_at DESC")
    stories = [dict(row) for row in cursor.fetchall()]
    conn.close()
    return stories

@app.put("/api/stories/{story_id}/answer")
async def answer_prayer(story_id: int):
    conn = get_story_db()
    cursor = conn.cursor()
    cursor.execute("UPDATE stories SET is_answered = 1 WHERE id = ? AND type = 'prayer'", (story_id,))
    conn.commit()
    conn.close()
    return {"message": "Prayer answered."}

@app.delete("/api/stories/{story_id}")
async def delete_story(story_id: int):
    conn = get_story_db()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM stories WHERE id = ?", (story_id,))
    conn.commit()
    conn.close()
    return {"message": "Story deleted."}

@app.post("/api/upload")
async def upload_file(file: UploadFile = File(...)):
    import time
    uploads_dir = os.path.join(STATIC_DIR, "uploads")
    os.makedirs(uploads_dir, exist_ok=True)
    ext = os.path.splitext(file.filename)[1]
    safe_filename = f"img_{int(time.time())}{ext}"
    file_path = os.path.join(uploads_dir, safe_filename)
    with open(file_path, "wb") as f:
        f.write(await file.read())
    return {"url": f"/static/uploads/{safe_filename}"}

# Serve static files
# app.mount("/static", StaticFiles(directory=STATIC_DIR), name="static")

@app.get("/")
async def read_index():
    return FileResponse(os.path.join(STATIC_DIR, "index.html"))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
