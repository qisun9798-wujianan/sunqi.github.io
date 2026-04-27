#!/usr/bin/env python3
"""
Notion 数据同步脚本
从 Notion 数据库拉取博客文章和 AI 工具数据，生成 JSON 文件
"""

import json
import os
import sys
from urllib.request import Request, urlopen
from urllib.error import HTTPError

NOTION_TOKEN = os.environ.get("NOTION_TOKEN", "")
BLOG_DB_ID = os.environ.get("BLOG_DB_ID", "")
TOOLS_DB_ID = os.environ.get("TOOLS_DB_ID", "")

if not NOTION_TOKEN:
    print("错误：请设置 NOTION_TOKEN 环境变量")
    sys.exit(1)


def notion_query(database_id, body=None):
    if not database_id:
        return []
    url = f"https://api.notion.com/v1/databases/{database_id}/query"
    data = json.dumps(body or {}).encode()
    req = Request(url, data=data, method="POST")
    req.add_header("Authorization", f"Bearer {NOTION_TOKEN}")
    req.add_header("Notion-Version", "2022-06-28")
    req.add_header("Content-Type", "application/json")
    try:
        with urlopen(req) as resp:
            result = json.loads(resp.read().decode())
            return result.get("results", [])
    except HTTPError as e:
        print(f"API 错误: {e.code} {e.reason}")
        print(e.read().decode())
        return []


def get_title(props):
    t = props.get("名称", {}).get("title", [{}])
    return t[0].get("text", {}).get("content", "") if t else ""


def get_rich_text(props, key):
    rt = props.get(key, {}).get("rich_text", [])
    return "".join(t.get("text", {}).get("content", "") for t in rt)


def sync_blog():
    if not BLOG_DB_ID:
        return
    results = notion_query(BLOG_DB_ID, {
        "filter": {"property": "Status", "select": {"equals": "已发布"}},
        "sorts": [{"property": "date", "direction": "descending"}],
        "page_size": 20
    })
    posts = []
    for p in results:
        props = p["properties"]
        posts.append({
            "id": p["id"],
            "title": get_title(props),
            "date": props.get("date", {}).get("date", {}).get("start", ""),
            "category": props.get("Category", {}).get("select", {}).get("name", ""),
            "excerpt": get_rich_text(props, "Excerpt"),
            "url": p.get("url", "")
        })
    with open("data/blog.json", "w", encoding="utf-8") as f:
        json.dump(posts, f, ensure_ascii=False, indent=2)
    print(f"博客文章: {len(posts)} 篇")


def sync_tools():
    if not TOOLS_DB_ID:
        return
    results = notion_query(TOOLS_DB_ID, {
        "sorts": [{"property": "Rating", "direction": "descending"}],
        "page_size": 100
    })
    tools = []
    for p in results:
        props = p["properties"]
        tags = [t.get("name", "") for t in props.get("Tags", {}).get("multi_select", [])]
        # 简化标签格式：去掉【】括号
        tags = [t.replace("【", "").replace("】", "").replace("付费", "付费").replace("免费", "免费").replace("中文", "中文").replace("英文", "英文") for t in tags]
        # 拆分合并标签
        simplified_tags = []
        for t in tags:
            for part in t.split():
                if part and part not in simplified_tags:
                    simplified_tags.append(part)
        tools.append({
            "id": p["id"],
            "name": get_title(props),
            "url": props.get("URL", {}).get("url", ""),
            "category": props.get("Category", {}).get("select", {}).get("name", ""),
            "description": get_rich_text(props, "Description"),
            "tags": simplified_tags,
            "rating": props.get("Rating", {}).get("select", {}).get("name", "")
        })
    with open("data/tools.json", "w", encoding="utf-8") as f:
        json.dump(tools, f, ensure_ascii=False, indent=2)
    print(f"AI 工具: {len(tools)} 个")


def update_html_inline():
    """更新 index.html 中内联的博客数据"""
    try:
        with open("data/blog.json", "r", encoding="utf-8") as f:
            posts = json.load(f)
    except:
        return

    with open("index.html", "r", encoding="utf-8") as f:
        content = f.read()

    # 替换 BLOG_POSTS 数组
    import re
    new_data = json.dumps(posts, ensure_ascii=False)
    pattern = r'(const BLOG_POSTS = )\[.*?\];'
    replacement = r'\g<1>' + new_data + ';'
    new_content = re.sub(pattern, replacement, content, flags=re.DOTALL)

    if new_content != content:
        with open("index.html", "w", encoding="utf-8") as f:
            f.write(new_content)
        print("index.html 已更新")

    # 更新 ai-tools.html 中内联的 AI_TOOLS 数组
    try:
        with open("data/tools.json", "r", encoding="utf-8") as f:
            tools = json.load(f)
    except:
        return

    with open("ai-tools.html", "r", encoding="utf-8") as f:
        content = f.read()

    new_tools_data = json.dumps(tools, ensure_ascii=False)
    pattern = r'(const AI_TOOLS = )\[.*?\];'
    replacement = r'\g<1>' + new_tools_data + ';'
    new_content = re.sub(pattern, replacement, content, flags=re.DOTALL)

    if new_content != content:
        with open("ai-tools.html", "w", encoding="utf-8") as f:
            f.write(new_content)
        print("ai-tools.html 已更新")


if __name__ == "__main__":
    os.makedirs("data", exist_ok=True)
    sync_blog()
    sync_tools()
    update_html_inline()
    print("同步完成！")
