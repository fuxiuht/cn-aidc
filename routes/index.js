const express = require('express');
const router = express.Router();
const { db } = require('../db');

const PER_PAGE = 12;

function getAllTags() {
  const rows = db.prepare("SELECT tags FROM articles WHERE status='published' AND tags != ''").all();
  const tagMap = {};
  rows.forEach(r => {
    r.tags.split(',').forEach(t => {
      t = t.trim();
      if (t) tagMap[t] = (tagMap[t] || 0) + 1;
    });
  });
  return Object.entries(tagMap).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count);
}

function getHotArticles(limit = 10) {
  return db.prepare(`
    SELECT id, title, views, cover_image, created_at FROM articles
    WHERE status = 'published'
    ORDER BY views DESC LIMIT ?
  `).all(limit);
}

function getCategories() {
  return db.prepare('SELECT * FROM categories ORDER BY sort_order').all();
}

router.get('/', (req, res) => {
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const offset = (page - 1) * PER_PAGE;

  const totalCount = db.prepare("SELECT COUNT(*) as count FROM articles WHERE status='published'").get().count;
  const totalPages = Math.ceil(totalCount / PER_PAGE);

  const articles = db.prepare(`
    SELECT a.*, c.name as category_name
    FROM articles a
    LEFT JOIN categories c ON a.category_id = c.id
    WHERE a.status = 'published'
    ORDER BY a.created_at DESC
    LIMIT ? OFFSET ?
  `).all(PER_PAGE, offset);

  const featuredArticles = db.prepare(`
    SELECT a.*, c.name as category_name
    FROM articles a
    LEFT JOIN categories c ON a.category_id = c.id
    WHERE a.status = 'published' AND a.is_featured = 1
    ORDER BY a.created_at DESC LIMIT 5
  `).all();

  const banners = db.prepare("SELECT * FROM banners WHERE is_active = 1 ORDER BY sort_order, id DESC").all();

  const categories = getCategories();
  const hotArticles = getHotArticles();
  const tags = getAllTags().slice(0, 20);

  const categoryArticles = categories.map(cat => ({
    ...cat,
    articles: db.prepare(`
      SELECT a.id, a.title, a.summary, a.cover_image, a.created_at, a.views
      FROM articles a WHERE a.category_id = ? AND a.status = 'published'
      ORDER BY a.created_at DESC LIMIT 4
    `).all(cat.id)
  })).filter(c => c.articles.length > 0);

  res.render('index', {
    articles, categories, featuredArticles, banners, hotArticles, tags,
    categoryArticles, page, totalPages, totalCount
  });
});

router.get('/article/:id', (req, res) => {
  const article = db.prepare(`
    SELECT a.*, c.name as category_name
    FROM articles a
    LEFT JOIN categories c ON a.category_id = c.id
    WHERE a.id = ?
  `).get(req.params.id);
  if (!article) return res.status(404).render('404');

  db.prepare('UPDATE articles SET views = views + 1 WHERE id = ?').run(req.params.id);
  article.views += 1;

  const related = db.prepare(`
    SELECT id, title, cover_image, created_at, views FROM articles
    WHERE category_id = ? AND id != ? AND status = 'published'
    ORDER BY created_at DESC LIMIT 5
  `).all(article.category_id, article.id);

  const prevArticle = db.prepare(`
    SELECT id, title FROM articles
    WHERE status = 'published' AND created_at > ? AND id != ?
    ORDER BY created_at ASC LIMIT 1
  `).get(article.created_at, article.id);

  const nextArticle = db.prepare(`
    SELECT id, title FROM articles
    WHERE status = 'published' AND created_at < ? AND id != ?
    ORDER BY created_at DESC LIMIT 1
  `).get(article.created_at, article.id);

  const hotArticles = getHotArticles();
  const categories = getCategories();

  res.render('article', { article, related, prevArticle, nextArticle, hotArticles, categories });
});

router.get('/category/:id', (req, res) => {
  const category = db.prepare('SELECT * FROM categories WHERE id = ?').get(req.params.id);
  if (!category) return res.status(404).render('404');

  const page = Math.max(1, parseInt(req.query.page) || 1);
  const offset = (page - 1) * PER_PAGE;
  const totalCount = db.prepare("SELECT COUNT(*) as count FROM articles WHERE category_id = ? AND status='published'").get(req.params.id).count;
  const totalPages = Math.ceil(totalCount / PER_PAGE);

  const articles = db.prepare(`
    SELECT a.*, c.name as category_name
    FROM articles a
    LEFT JOIN categories c ON a.category_id = c.id
    WHERE a.category_id = ? AND a.status = 'published'
    ORDER BY a.created_at DESC
    LIMIT ? OFFSET ?
  `).all(req.params.id, PER_PAGE, offset);

  const categories = getCategories();
  const hotArticles = getHotArticles();
  const tags = getAllTags().slice(0, 20);

  res.render('category', { category, articles, categories, hotArticles, tags, page, totalPages });
});

router.get('/search', (req, res) => {
  const q = (req.query.q || '').trim();
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const offset = (page - 1) * PER_PAGE;
  let articles = [];
  let totalCount = 0;
  let totalPages = 0;

  if (q) {
    const like = `%${q}%`;
    totalCount = db.prepare("SELECT COUNT(*) as count FROM articles WHERE status='published' AND (title LIKE ? OR summary LIKE ? OR tags LIKE ?)").get(like, like, like).count;
    totalPages = Math.ceil(totalCount / PER_PAGE);
    articles = db.prepare(`
      SELECT a.*, c.name as category_name
      FROM articles a
      LEFT JOIN categories c ON a.category_id = c.id
      WHERE a.status = 'published' AND (a.title LIKE ? OR a.summary LIKE ? OR a.tags LIKE ?)
      ORDER BY a.created_at DESC
      LIMIT ? OFFSET ?
    `).all(like, like, like, PER_PAGE, offset);
  }

  const categories = getCategories();
  const hotArticles = getHotArticles();
  res.render('search', { q, articles, categories, hotArticles, page, totalPages, totalCount });
});

router.get('/tag/:name', (req, res) => {
  const tagName = req.params.name;
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const offset = (page - 1) * PER_PAGE;
  const like = `%${tagName}%`;

  const totalCount = db.prepare("SELECT COUNT(*) as count FROM articles WHERE status='published' AND tags LIKE ?").get(like).count;
  const totalPages = Math.ceil(totalCount / PER_PAGE);

  const articles = db.prepare(`
    SELECT a.*, c.name as category_name
    FROM articles a
    LEFT JOIN categories c ON a.category_id = c.id
    WHERE a.status = 'published' AND a.tags LIKE ?
    ORDER BY a.created_at DESC
    LIMIT ? OFFSET ?
  `).all(like, PER_PAGE, offset);

  const categories = getCategories();
  const hotArticles = getHotArticles();
  const tags = getAllTags().slice(0, 20);

  res.render('tag', { tagName, articles, categories, hotArticles, tags, page, totalPages, totalCount });
});

router.get('/about', (req, res) => {
  const categories = getCategories();
  res.render('about', { categories });
});

// 嘉宾注册页面
router.get('/register', (req, res) => {
  const categories = getCategories();
  res.render('register', { categories, success: null, error: null });
});

// 提交注册
router.post('/register', (req, res) => {
  const { name, company, title, phone, email, wechat, event_name } = req.body;

  if (!name) {
    const categories = getCategories();
    return res.render('register', { categories, success: null, error: '请填写姓名' });
  }

  try {
    db.prepare(`
      INSERT INTO guests (name, company, title, phone, email, wechat, event_name)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(name, company || '', title || '', phone || '', email || '', wechat || '', event_name || '');

    const categories = getCategories();
    res.render('register', { categories, success: '报名成功！感谢您的参与，届时请准时到场。', error: null });
  } catch (err) {
    const categories = getCategories();
    res.render('register', { categories, success: null, error: '提交失败，请稍后重试' });
  }
});

// 管理后台：查看注册列表
router.get('/admin/guests', (req, res) => {
  if (!req.session || !req.session.adminId) {
    return res.redirect('/admin/login');
  }

  const guests = db.prepare(`
    SELECT * FROM guests ORDER BY registered_at DESC
  `).all();

  const totalCount = guests.length;
  const categories = getCategories();

  res.render('admin/guests', { guests, totalCount, categories, adminName: req.session.adminName });
});

module.exports = router;
