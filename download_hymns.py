import sqlite3
import os
import requests
from concurrent.futures import ThreadPoolExecutor

BASE_URL = "https://raw.githubusercontent.com/ccmhymn/sheet/master/asset/hymn/img/"
STATIC_DIR = r"c:\Users\best0\.gemini\antigravity\scratch\성경\static"

if not os.path.exists(STATIC_DIR):
    os.makedirs(STATIC_DIR)

con = sqlite3.connect(r"c:\Users\best0\.gemini\antigravity\scratch\성경\bible.db")
cur = con.cursor()
cur.execute("SELECT images FROM hymns WHERE images IS NOT NULL")
files = [row[0] for row in cur.fetchall()]
con.close()

def download_image(filename):
    url = BASE_URL + filename
    dest = os.path.join(STATIC_DIR, filename)
    if os.path.exists(dest):
        return True 
    try:
        resp = requests.get(url, timeout=10)
        if resp.status_code == 200:
            with open(dest, "wb") as f:
                f.write(resp.content)
            return True
        else:
            return False
    except Exception as e:
        return False

print(f"Starting download of {len(files)} images...")
success_count = 0
with ThreadPoolExecutor(max_workers=30) as executor:
    results = executor.map(download_image, files)
    for r in results:
        if r:
            success_count += 1

print(f"Successfully downloaded {success_count} out of {len(files)} images.")

app_js_path = os.path.join(STATIC_DIR, "app.js")
try:
    with open(app_js_path, "r", encoding="utf-8") as f:
        content = f.read()
    
    target = "`https://raw.githubusercontent.com/ccmhymn/sheet/master/asset/hymn/img/${hymn.images}`"
    replacement = "`/static/${hymn.images}`"
    
    if target in content:
        content = content.replace(target, replacement)
        with open(app_js_path, "w", encoding="utf-8") as f:
            f.write(content)
        print("Successfully updated app.js to use local images.")
except Exception as e:
    print(f"Error updating app.js: {e}")
