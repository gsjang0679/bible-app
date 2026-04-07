
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
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

# 모든 API와 페이지 접속 시 인증을 거치도록 설정 (authenticate 종속성 추가)
@app.get("/", dependencies=[Depends(authenticate)])
def read_root():
    index_path = os.path.join(STATIC_DIR, "index.html")
    if os.path.exists(index_path):
        with open(index_path, "r", encoding="utf-8") as f:
            return HTMLResponse(content=f.read())
    return "Please create index.html in static/"

@app.get("/manifest.json")
def get_manifest():
    return FileResponse(os.path.join(STATIC_DIR, "manifest.json"))

@app.get("/sw.js")
def get_sw():
    return FileResponse(os.path.join(STATIC_DIR, "sw.js"))

@app.get("/api/books", dependencies=[Depends(authenticate)])
def get_books():
    conn = get_db()
    books = conn.execute("SELECT * FROM books ORDER BY display_order").fetchall()
    conn.close()
    return [dict(b) for b in books]

@app.get("/api/verses/{book_id}/{chapter}", dependencies=[Depends(authenticate)])
def get_verses(book_id: int, chapter: int):
    conn = get_db()
    verses = conn.execute("SELECT * FROM verses WHERE book_id = ? AND chapter = ? ORDER BY verse", (book_id, chapter)).fetchall()
    conn.close()
    return [dict(v) for v in verses]

@app.get("/api/chapters/{book_id}", dependencies=[Depends(authenticate)])
def get_chapters(book_id: int):
    conn = get_db()
    chapters = conn.execute("SELECT DISTINCT chapter FROM verses WHERE book_id = ? ORDER BY chapter", (book_id,)).fetchall()
    conn.close()
    return [r["chapter"] for r in chapters]

@app.get("/api/search", dependencies=[Depends(authenticate)])
def search(q: str):
    conn = get_db()
    query = "SELECT v.*, b.kor_full FROM verses v JOIN books b ON v.book_id = b.id WHERE v.content LIKE ? LIMIT 100"
    results = conn.execute(query, (f"%{q}%",)).fetchall()
    conn.close()
    return [dict(r) for r in results]

@app.post("/api/bookmarks", dependencies=[Depends(authenticate)])
async def add_bookmark(request: Request):
    data = await request.json()
    verse_id = data.get("verse_id")
    conn = get_db()
    conn.execute("INSERT INTO bookmarks (verse_id) VALUES (?)", (verse_id,))
    conn.commit()
    conn.close()
    return {"status": "success"}

@app.get("/api/bookmarks", dependencies=[Depends(authenticate)])
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

# Serve static files - 정적 파일도 보안이 필요하면 추가 설정 가능하나, 
# 기본적으로 API에서 인증을 하므로 메인 페이지 진입 시 차단됩니다.
app.mount("/static", StaticFiles(directory=STATIC_DIR), name="static")

if __name__ == "__main__":
    import uvicorn
    # 외부 클라우드 배포 시 포트 번호를 환경 변수에서 가져오도록 유연하게 설정 권장
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)
