#!/usr/bin/env python3
"""Notion 数据同步脚本"""
import json, os, sys, re
from urllib.request import Request, urlopen
from urllib.error import HTTPError

TOKEN = os.environ.get("NOTION_TOKEN", "").strip()
BLOG_DB = os.environ.get("BLOG_DB_ID", "").strip()
TOOLS_DB = os.environ.get("TOOLS_DB_ID", "").strip()

if not TOKEN:
    print("ERROR: NOTION_TOKEN not set"); sys.exit(1)

def query(db, body=None):
    if not db: return []
    req = Request(f"https://api.notion.com/v1/databases/{db}/query",
                  data=json.dumps(body or {}).encode(), method="POST")
    for h, v in [("Authorization", f"Bearer {TOKEN}"),
                 ("Notion-Version", "2022-06-28"),
                 ("Content-Type", "application/json")]:
        req.add_header(h, v)
    try:
        with urlopen(req) as r:
            res = json.loads(r.read().decode())
            if "results" not in res:
                print(f"API response error: {res}")
                return []
            return res["results"]
    except HTTPError as e:
        print(f"HTTP Error {e.code}: {e.read().decode()}")
        return []

def get_title(props):
    t = props.get("\u540d\u79f0", {}).get("title", [])
    return t[0].get("text", {}).get("content", "") if t else ""

def get_rt(props, key):
    text = "".join(t.get("text", {}).get("content", "")
                   for t in props.get(key, {}).get("rich_text", []))
    return text.replace("\n", " ").replace("\r", " ").strip()

def clean_tags(tags):
    out = []
    for t in tags:
        t = t.replace("\u3010", "").replace("\u3011", "").strip()
        for part in t.split():
            if part and part not in out:
                out.append(part)
    return out

def update_inline(json_path, html_path, var_name, data):
    """Update inline JS array in HTML file"""
    try:
        with open(html_path, "r", encoding="utf-8") as f:
            content = f.read()
    except FileNotFoundError:
        print(f"  {html_path} not found, skipping inline update")
        return
    new_json = json.dumps(data, ensure_ascii=False)
    pattern = rf'(const\s+{re.escape(var_name)}\s*=\s*)\[.*?\];'
    repl = r'\g<1>' + new_json + ';'
    new_content, n = re.subn(pattern, repl, content, flags=re.DOTALL, count=1)
    if n:
        with open(html_path, "w", encoding="utf-8") as f:
            f.write(new_content)
        print(f"  Updated {html_path} inline data")
    else:
        print(f"  Warning: could not find {var_name} in {html_path}")

os.makedirs("data", exist_ok=True)

# --- Blog ---
print("Syncing blog...")
blog = query(BLOG_DB, {
    "filter": {"property": "Status", "select": {"equals": "\u5df2\u53d1\u5e03"}},
    "sorts": [{"property": "date", "direction": "descending"}],
    "page_size": 20
})
blog_posts = []
for p in blog:
    props = p["properties"]
    blog_posts.append({
        "id": p["id"],
        "title": get_title(props),
        "date": props.get("date", {}).get("date", {}).get("start", ""),
        "category": props.get("Category", {}).get("select", {}).get("name", ""),
        "excerpt": get_rt(props, "Excerpt").replace("\u2022", "").strip()
        "url": p.get("url", "")
    })
with open("data/blog.json", "w", encoding="utf-8") as f:
    json.dump(blog_posts, f, ensure_ascii=False, indent=2)
print(f"  Blog: {len(blog_posts)} posts")
update_inline("data/blog.json", "index.html", "BLOG_POSTS", blog_posts)

# --- Tools ---
print("Syncing tools...")
tools = query(TOOLS_DB, {"sorts": [{"property": "Rating", "direction": "descending"}], "page_size": 100})
ai_tools = []
for p in tools:
    props = p["properties"]
    raw_tags = [t.get("name", "") for t in props.get("Tags", {}).get("multi_select", [])]
    ai_tools.append({
        "id": p["id"],
        "name": get_title(props),
        "url": props.get("URL", {}).get("url", ""),
        "category": props.get("Category", {}).get("select", {}).get("name", "").split()[0] if props.get("Category", {}).get("select", {}).get("name", "") else "",
        "description": get_rt(props, "Description"),
        "tags": clean_tags(raw_tags),
        "rating": props.get("Rating", {}).get("select", {}).get("name", "")
    })
with open("data/tools.json", "w", encoding="utf-8") as f:
    json.dump(ai_tools, f, ensure_ascii=False, indent=2)
print(f"  Tools: {len(ai_tools)} items")
update_inline("data/tools.json", "ai-tools.html", "AI_TOOLS", ai_tools)

print("Done!")
