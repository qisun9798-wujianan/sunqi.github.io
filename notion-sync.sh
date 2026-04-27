#!/bin/bash
# Notion 数据同步脚本
# 用法: bash notion-sync.sh

# 请设置环境变量：export NOTION_TOKEN=你的Token
TOKEN="${NOTION_TOKEN:-}" 

if [ -z "$TOKEN" ]; then
  echo "错误：请设置 NOTION_TOKEN 环境变量"
  echo "用法: NOTION_TOKEN=xxx bash notion-sync.sh"
  exit 1
fi
BLOG_DB="34f9d0de-ba05-801d-acb3-f29f386bf0cc"
TOOLS_DB="34f9d0de-ba05-80a3-9969-fdaf3f665b35"

echo "正在同步博客文章..."
curl -s -X POST "https://api.notion.com/v1/databases/${BLOG_DB}/query" \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Notion-Version: 2022-06-28" \
  -H "Content-Type: application/json" \
  -d '{"filter":{"property":"Status","select":{"equals":"已发布"}},"sorts":[{"property":"date","direction":"descending"}]}' \
  | python3 -c "
import json,sys
data=json.load(sys.stdin)
posts=[]
for p in data.get('results',[]):
    props=p['properties']
    title=props.get('名称',{}).get('title',[{}])[0].get('text',{}).get('content','')
    date=props.get('date',{}).get('date',{}).get('start','')
    cat=props.get('Category',{}).get('select',{}).get('name','')
    excerpt=''.join([t.get('text',{}).get('content','') for t in props.get('Excerpt',{}).get('rich_text',[])])
    posts.append({'id':p['id'],'title':title,'date':date,'category':cat,'excerpt':excerpt,'url':p.get('url','')})
json.dump(posts,open('data/blog.json','w'),ensure_ascii=False,indent=2)
print(f'博客文章: {len(posts)} 篇')
"

echo "正在同步 AI 工具..."
curl -s -X POST "https://api.notion.com/v1/databases/${TOOLS_DB}/query" \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Notion-Version: 2022-06-28" \
  -H "Content-Type: application/json" \
  -d '{"sorts":[{"property":"Rating","direction":"descending"}]}' \
  | python3 -c "
import json,sys
data=json.load(sys.stdin)
tools=[]
for p in data.get('results',[]):
    props=p['properties']
    name=props.get('名称',{}).get('title',[{}])[0].get('text',{}).get('content','')
    url=props.get('URL',{}).get('url','')
    cat=props.get('Category',{}).get('select',{}).get('name','')
    desc=''.join([t.get('text',{}).get('content','') for t in props.get('Description',{}).get('rich_text',[])])
    tags=[t.get('name','') for t in props.get('Tags',{}).get('multi_select',[])]
    rating=props.get('Rating',{}).get('select',{}).get('name','')
    tools.append({'id':p['id'],'name':name,'url':url,'category':cat,'description':desc,'tags':tags,'rating':rating})
json.dump(tools,open('data/tools.json','w'),ensure_ascii=False,indent=2)
print(f'AI 工具: {len(tools)} 个')
"

echo "同步完成！"
