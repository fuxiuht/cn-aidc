# ADT-AIDC智算之心 官方媒体门户网站 — 使用说明

## 快速启动

```bash
# 1. 进入项目目录
cd /Users/yeqinglin.10/Desktop/111/zhisuan

# 2. 设置 Node.js 路径（如果 node 不在默认 PATH 中）
export PATH="/Users/yeqinglin.10/.joyclaw/node/node-v22.16.0-darwin-arm64/bin:$PATH"

# 3. 安装依赖（首次使用）
npm install

# 4. 启动服务器
node server.js
```

启动后控制台会输出：
```
ADT-AIDC智算之心 门户网站已启动
  前台: http://localhost:3000
  后台: http://localhost:3000/admin
  后台账号: admin / admin123
```

---

## 前台功能

### 首页 (http://localhost:3000)

| 区域 | 内容 |
|------|------|
| Hero Banner | 品牌标语 + 统计数字（原创文章数、板块数） |
| 分类导航栏 | 全部 / 行业资讯 / 技术前沿 / 活动预告 / 社群动态 / 深度报告 |
| 文章列表 | 卡片式布局，展示封面图、分类标签、标题、摘要、日期 |

### 文章详情 (http://localhost:3000/article/:id)

点击任意文章卡片进入：
- 分类标签 + 标题 + 发布时间
- 封面大图
- 正文富文本内容
- 底部相关文章推荐

### 分类页 (http://localhost:3000/category/:id)

- 顶部分类导航（当前分类高亮）
- 该分类下所有已发布文章

### 关于我们 (http://localhost:3000/about)

- 平台介绍
- 内容覆盖领域（AI基础设施 / 算力生态 / 行业动态 / 会议活动）
- 联系方式（公众号、视频号）

---

## 后台管理

### 登录 (http://localhost:3000/admin/login)

- 默认账号：`admin`
- 默认密码：`admin123`
- 登录后 session 有效期 24 小时

### 仪表盘 (http://localhost:3000/admin)

四个统计卡片：
| 指标 | 说明 |
|------|------|
| 文章总数 | 包含已发布 + 草稿 |
| 已发布 | 当前对外可见的文章数 |
| 草稿 | 尚未发布的文章 |
| 分类数 | 内容分类总数 |

下方是最近 5 篇文章的快速预览。

### 文章管理 (http://localhost:3000/admin/articles)

操作：
- **新建文章**：点击右上角「+ 新建文章」
- **编辑**：每行右侧「编辑」按钮
- **删除**：每行右侧「删除」按钮（需确认）

### 文章编辑器 (http://localhost:3000/admin/articles/new)

| 字段 | 说明 |
|------|------|
| 标题 | 文章标题（必填） |
| 分类 | 从下拉列表选择 |
| 状态 | 「发布」对外可见 /「草稿」仅后台可见 |
| 封面图片 | 点击上传（支持 jpg/png/gif，上限 10MB） |
| 摘要 | 可选，显示在文章卡片上 |
| 正文 | Quill 富文本编辑器，支持标题、加粗、列表、链接、图片、代码块 |

> **注意**：编辑器中插入图片时使用 URL 方式。如需上传本地图片作为正文插图，可先通过封面上传拿到 URL 路径。

### 分类管理 (http://localhost:3000/admin/categories)

- 顶部表单可直接添加新分类（名称 + 描述 + 排序号）
- 表格展示现有分类及其文章数
- 可删除分类（关联文章的分类会被置空，不会删除文章）

---

## 技术架构

```
浏览器
  │
  ├── 前台页面 ──→ Express 路由 (routes/index.js)
  │                    │
  │                    ├── 查询 SQLite (db.js)
  │                    └── 渲染 EJS 模板 (views/*.ejs)
  │
  └── 后台页面 ──→ Express 路由 (routes/admin.js)
                       │
                       ├── Session 鉴权中间件
                       ├── Multer 文件上传
                       ├── 查询/写入 SQLite
                       └── 渲染 EJS 模板 (views/admin/*.ejs)
```

| 组件 | 技术 |
|------|------|
| 服务器 | Node.js + Express |
| 数据库 | SQLite (better-sqlite3) |
| 模板引擎 | EJS |
| 富文本编辑器 | Quill.js (CDN) |
| 文件上传 | Multer |
| 会话管理 | express-session |

### 数据库表结构

```
articles
├── id (主键)
├── title (标题)
├── content (HTML正文)
├── summary (摘要)
├── cover_image (封面路径)
├── category_id (分类外键)
├── status (draft/published)
├── created_at
└── updated_at

categories
├── id (主键)
├── name (分类名)
├── description (描述)
└── sort_order (排序)

admin_users
├── id (主键)
├── username
└── password_hash (SHA256)
```

---

## 文件目录

```
zhisuan/
├── package.json           # 依赖声明
├── server.js              # Express 主入口，端口 3000
├── db.js                  # 数据库初始化 + 种子数据
├── data.db                # SQLite 数据库文件（自动生成）
├── public/
│   ├── css/
│   │   ├── style.css      # 前台样式（深蓝+科技青主题）
│   │   └── admin.css      # 后台样式
│   ├── js/
│   │   └── main.js        # 前台 JS
│   └── uploads/           # 上传文件存储目录
├── views/
│   ├── header.ejs         # 前台公共头部
│   ├── footer.ejs         # 前台公共底部
│   ├── index.ejs          # 首页
│   ├── article.ejs        # 文章详情
│   ├── category.ejs       # 分类页
│   ├── about.ejs          # 关于我们
│   ├── 404.ejs            # 404 页面
│   └── admin/
│       ├── header.ejs     # 后台公共头部（含侧边栏）
│       ├── footer.ejs     # 后台公共底部
│       ├── login.ejs      # 登录页
│       ├── dashboard.ejs  # 仪表盘
│       ├── articles.ejs   # 文章列表
│       ├── article-edit.ejs # 文章编辑器
│       └── categories.ejs # 分类管理
└── routes/
    ├── index.js           # 前台路由
    └── admin.js           # 后台路由
```

---

## 常见操作

### 发布一篇新文章

1. 访问 http://localhost:3000/admin → 登录
2. 点击「+ 新建文章」
3. 填写标题、选择分类、上传封面、编写正文
4. 状态选「发布」→ 点击「保存」
5. 回到前台首页即可看到新文章

### 修改管理员密码

编辑 `db.js`，找到 `hashPassword('admin123')` 改为你想要的密码，然后删除 `data.db` 重启服务即可重建数据库。

### 更换端口

编辑 `server.js` 中的 `const PORT = 3000` 改为目标端口。

### 重置数据

删除 `data.db` 文件后重启服务，数据库会自动重建并注入种子数据。
