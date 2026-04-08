
from fastapi import FastAPI, Request, Depends, HTTPException, status
from fastapi.responses import HTMLResponse, JSONResponse, FileResponse
from fastapi.staticfiles import StaticFiles
from fastapi.security import HTTPBasic, HTTPBasicCredentials
import sqlite3
import os
import secrets

app = FastAPI()
security = HTTPBasic()

# --- 보안 설정 (나와 아내만 사용 가능) ---
# 접속 시 입력할 아이디와 비밀번호입니다. 나중에 원하시는 값으로 자유롭게 수정하세요.
USER_ID = "bible"
USER_PW = "7777" 

def authenticate(credentials: HTTPBasicCredentials = Depends(security)):
    is_user_ok = secrets.compare_digest(credentials.username, USER_ID)
    is_pw_ok = secrets.compare_digest(credentials.password, USER_PW)
    if not (is_user_ok and is_pw_ok):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="아이디 또는 비밀번호가 틀렸습니다.",
            headers={"WWW-Authenticate": "Basic"},
        )
    return credentials.username

# Absolute path to the directory where this script is located
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DB_PATH = os.path.join(BASE_DIR, "bible.db")
STATIC_DIR = os.path.join(BASE_DIR, "static")

def get_db():
    # Ensure the database path is absolutely correct
    current_dir = os.path.dirname(os.path.abspath(__file__))
    db_file = os.path.join(current_dir, "bible.db")
    if not os.path.exists(db_file):
        print(f"CRITICAL: Database not found at {db_file}")
    conn = sqlite3.connect(db_file)
    conn.row_factory = sqlite3.Row
    return conn

# [진단용] 서버 상태 확인용 (로그인 인증 없음)
@app.get("/test")
def health_check():
    try:
        files = os.listdir(BASE_DIR)
        static_files = os.listdir(STATIC_DIR) if os.path.exists(STATIC_DIR) else "not found"
    except Exception as e:
        files = str(e)
        static_files = str(e)
        
    return {
        "status": "ok", 
        "message": "서버가 정상적으로 살아있습니다!",
        "current_dir": BASE_DIR,
        "files_in_root": files,
        "static_dir": STATIC_DIR,
        "files_in_static": static_files,
        "db_path": DB_PATH
    }

# 메인 페이지 접속 (로그인 없이 바로 접속)
@app.get("/")
async def read_root():
    index_path = os.path.join(STATIC_DIR, "index.html")
    if os.path.exists(index_path):
        return FileResponse(index_path)
    
    # 디버깅 메시지
    root_files = os.listdir(BASE_DIR) if os.path.exists(BASE_DIR) else []
    return HTMLResponse(
        content=f"<h3>성경 앱 파일을 찾을 수 없습니다.</h3>경로: {index_path}<br>파일목록: {root_files}", 
        status_code=404
    )

# API Endpoints
@app.get("/api/books")
def get_books():
    conn = get_db()
    books = conn.execute("SELECT * FROM books ORDER BY display_order").fetchall()
    conn.close()
    return [dict(b) for b in books]

@app.get("/api/verses/{book_id}/{chapter}")
def get_verses(book_id: int, chapter: int):
    conn = get_db()
    verses = conn.execute("SELECT * FROM verses WHERE book_id = ? AND chapter = ? ORDER BY verse", (book_id, chapter)).fetchall()
    conn.close()
    return [dict(v) for v in verses]

@app.get("/api/chapters/{book_id}")
def get_chapters(book_id: int):
    conn = get_db()
    chapters = conn.execute("SELECT DISTINCT chapter FROM verses WHERE book_id = ? ORDER BY chapter", (book_id,)).fetchall()
    conn.close()
    return [r["chapter"] for r in chapters]

@app.get("/api/search")
def search(q: str):
    conn = get_db()
    query = "SELECT v.*, b.kor_full FROM verses v JOIN books b ON v.book_id = b.id WHERE v.content LIKE ? LIMIT 100"
    results = conn.execute(query, (f"%{q}%",)).fetchall()
    conn.close()
    return [dict(r) for r in results]

@app.post("/api/bookmarks")
async def add_bookmark(request: Request):
    data = await request.json()
    verse_id = data.get("verse_id")
    conn = get_db()
    conn.execute("INSERT INTO bookmarks (verse_id) VALUES (?)", (verse_id,))
    conn.commit()
    conn.close()
    return {"status": "success"}

@app.get("/api/bookmarks")
def get_bookmarks():
    conn = get_db()
    results = conn.execute('''
        SELECT b.id as bookmark_id, v.*, bk.kor_full 
        FROM bookmarks b 
        JOIN verses v ON b.verse_id = v.id 
        JOIN books bk ON v.book_id = bk.id
        ORDER BY b.created_at DESC
    ''').fetchall()
    conn.close()
    return [dict(r) for r in results]

@app.get("/api/hymns/{number}")
def get_hymn(number: int):
    conn = get_db()
    hymn = conn.execute("SELECT * FROM hymns WHERE number = ?", (number,)).fetchone()
    conn.close()
    if hymn:
        return dict(hymn)
    raise HTTPException(status_code=404, detail="Hymn not found")

@app.get("/api/hymns")
def search_hymns(q: str = None):
    conn = get_db()
    if q:
        query = "SELECT * FROM hymns WHERE title LIKE ? OR lyrics LIKE ? LIMIT 50"
        results = conn.execute(query, (f"%{q}%", f"%{q}%")).fetchall()
    else:
        results = conn.execute("SELECT * FROM hymns ORDER BY number LIMIT 100").fetchall()
    conn.close()
    return [dict(r) for r in results]

# --- 데이터베이스 초기화 (공동 묵상 테이블 추가) ---
def init_db():
    conn = get_db()
    conn.execute('''
        CREATE TABLE IF NOT EXISTS meditation_notes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            author TEXT NOT NULL,
            content TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    conn.execute('''
        CREATE TABLE IF NOT EXISTS prayers (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            author TEXT NOT NULL,
            content TEXT NOT NULL,
            is_answered INTEGER DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    conn.commit()
    conn.close()

init_db()

@app.get("/api/meditations")
def get_meditations():
    conn = get_db()
    results = conn.execute("SELECT * FROM meditation_notes ORDER BY created_at DESC LIMIT 50").fetchall()
    conn.close()
    return [dict(r) for r in results]

@app.post("/api/meditations")
async def add_meditation(request: Request):
    data = await request.json()
    author = data.get("author")
    content = data.get("content")
    if not author or not content:
        raise HTTPException(status_code=400, detail="Author and content are required")
    
    conn = get_db()
    conn.execute("INSERT INTO meditation_notes (author, content) VALUES (?, ?)", (author, content))
    conn.commit()
    conn.close()
    return {"status": "success"}

@app.get("/api/prayers")
def get_prayers():
    conn = get_db()
    results = conn.execute("SELECT * FROM prayers ORDER BY created_at DESC LIMIT 50").fetchall()
    conn.close()
    return [dict(r) for r in results]

@app.post("/api/prayers")
async def add_prayer(request: Request):
    data = await request.json()
    author = data.get("author")
    content = data.get("content")
    if not author or not content:
        raise HTTPException(status_code=400, detail="Author and content are required")
    
    conn = get_db()
    conn.execute("INSERT INTO prayers (author, content) VALUES (?, ?)", (author, content))
    conn.commit()
    conn.close()
    return {"status": "success"}

@app.post("/api/prayers/{prayer_id}/answer")
async def toggle_prayer_answer(prayer_id: int):
    conn = get_db()
    conn.execute("UPDATE prayers SET is_answered = 1 - is_answered WHERE id = ?", (prayer_id,))
    conn.commit()
    conn.close()
    return {"status": "success"}

# Serve static files
# 빌드된 React 앱의 자산들(JS, CSS 등)을 서빙합니다.
app.mount("/assets", StaticFiles(directory=os.path.join(STATIC_DIR, "assets")), name="assets")

# 루트 및 기타 모든 경로에 대해 index.html을 반환하여 React Router가 처리하게 합니다.
# API 경로(/api)는 이 위에서 정의되었으므로 FastAPI가 먼저 가로챕니다.
@app.get("/{full_path:path}")
async def serve_spa(full_path: str):
    # static 폴더 내에 실제로 파일이 존재하는지 확인 (manifest.json, sw.js 등)
    file_path = os.path.join(STATIC_DIR, full_path)
    if os.path.isfile(file_path):
        return FileResponse(file_path)
    
    # 그 외의 경우(SPA 라우팅) index.html 반환
    index_path = os.path.join(STATIC_DIR, "index.html")
    if os.path.exists(index_path):
        return FileResponse(index_path)
    
    raise HTTPException(status_code=404, detail="Not Found")

if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)
