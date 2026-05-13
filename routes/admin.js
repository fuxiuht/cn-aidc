const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { db, hashPassword } = require('../db');

const storage = multer.diskStorage({
  destination: path.join(__dirname, '../public/uploads'),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, Date.now() + '-' + Math.round(Math.random() * 1e6) + ext);
  }
});
const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } });

function requireAuth(req, res, next) {
  if (req.session && req.session.adminId) return next();
  res.redirect('/admin/login');
}

router.get('/login', (req, res) => {
  res.render('admin/login', { error: null });
});

router.post('/login', (req, res) => {
  const { username, password } = req.body;
  const user = db.prepare('SELECT * FROM admin_users WHERE username = ? AND password_hash = ?')
    .get(username, hashPassword(password));
  if (user) {
    req.session.adminId = user.id;
    req.session.adminName = user.username;
    res.redirect('/admin');
  } else {
    res.render('admin/login', { error: '用户名或密码错误' });
  }
});

router.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/admin/login');
});

router.get('/', requireAuth, (req, res) => {
  const totalArticles = db.prepare('SELECT COUNT(*) as count FROM articles').get().count;
  const publishedArticles = db.prepare("SELECT COUNT(*) as count FROM articles WHERE status='published'").get().count;
  const totalCategories = db.prepare('SELECT COUNT(*) as count FROM categories').get().count;
  const recentArticles = db.prepare('SELECT * FROM articles ORDER BY created_at DESC LIMIT 5').all();
  res.render('admin/dashboard', { totalArticles, publishedArticles, totalCategories, recentArticles, adminName: req.session.adminName });
});

router.get('/articles', requireAuth, (req, res) => {
  const articles = db.prepare(`
    SELECT a.*, c.name as category_name
    FROM articles a
    LEFT JOIN categories c ON a.category_id = c.id
    ORDER BY a.created_at DESC
  `).all();
  res.render('admin/articles', { articles, adminName: req.session.adminName });
});

router.get('/articles/new', requireAuth, (req, res) => {
  const categories = db.prepare('SELECT * FROM categories ORDER BY sort_order').all();
  res.render('admin/article-edit', { article: null, categories, adminName: req.session.adminName });
});

router.get('/articles/edit/:id', requireAuth, (req, res) => {
  const article = db.prepare('SELECT * FROM articles WHERE id = ?').get(req.params.id);
  const categories = db.prepare('SELECT * FROM categories ORDER BY sort_order').all();
  res.render('admin/article-edit', { article, categories, adminName: req.session.adminName });
});

router.post('/articles/save', requireAuth, upload.single('cover'), (req, res) => {
  const { id, title, content, summary, category_id, status, tags } = req.body;
  const cover_image = req.file ? '/uploads/' + req.file.filename : (req.body.existing_cover || '');
  const is_featured = req.body.is_featured ? 1 : 0;
  const is_hot = req.body.is_hot ? 1 : 0;

  if (id) {
    db.prepare(`UPDATE articles SET title=?, content=?, summary=?, cover_image=?, category_id=?, status=?, tags=?, is_featured=?, is_hot=?, updated_at=CURRENT_TIMESTAMP WHERE id=?`)
      .run(title, content, summary, cover_image, category_id || null, status, tags || '', is_featured, is_hot, id);
  } else {
    db.prepare(`INSERT INTO articles (title, content, summary, cover_image, category_id, status, tags, is_featured, is_hot) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`)
      .run(title, content, summary, cover_image, category_id || null, status, tags || '', is_featured, is_hot);
  }
  res.redirect('/admin/articles');
});

router.post('/articles/delete/:id', requireAuth, (req, res) => {
  db.prepare('DELETE FROM articles WHERE id = ?').run(req.params.id);
  res.redirect('/admin/articles');
});

router.post('/upload-image', requireAuth, upload.single('image'), (req, res) => {
  if (req.file) {
    res.json({ url: '/uploads/' + req.file.filename });
  } else {
    res.status(400).json({ error: '上传失败' });
  }
});

// Categories
router.get('/categories', requireAuth, (req, res) => {
  const categories = db.prepare('SELECT c.*, (SELECT COUNT(*) FROM articles WHERE category_id = c.id) as article_count FROM categories c ORDER BY sort_order').all();
  res.render('admin/categories', { categories, adminName: req.session.adminName });
});

router.post('/categories/save', requireAuth, (req, res) => {
  const { id, name, description, sort_order } = req.body;
  if (id) {
    db.prepare('UPDATE categories SET name=?, description=?, sort_order=? WHERE id=?')
      .run(name, description, sort_order || 0, id);
  } else {
    db.prepare('INSERT INTO categories (name, description, sort_order) VALUES (?, ?, ?)')
      .run(name, description, sort_order || 0);
  }
  res.redirect('/admin/categories');
});

router.post('/categories/delete/:id', requireAuth, (req, res) => {
  db.prepare('DELETE FROM categories WHERE id = ?').run(req.params.id);
  res.redirect('/admin/categories');
});

// Banners
router.get('/banners', requireAuth, (req, res) => {
  const banners = db.prepare('SELECT * FROM banners ORDER BY sort_order, id DESC').all();
  res.render('admin/banners', { banners, adminName: req.session.adminName });
});

router.post('/banners/save', requireAuth, upload.single('banner_image'), (req, res) => {
  const { title, link, sort_order } = req.body;
  if (req.file) {
    const image = '/uploads/' + req.file.filename;
    db.prepare('INSERT INTO banners (title, image, link, sort_order) VALUES (?, ?, ?, ?)')
      .run(title, image, link || '', sort_order || 0);
  }
  res.redirect('/admin/banners');
});

router.post('/banners/toggle/:id', requireAuth, (req, res) => {
  const banner = db.prepare('SELECT is_active FROM banners WHERE id = ?').get(req.params.id);
  if (banner) {
    db.prepare('UPDATE banners SET is_active = ? WHERE id = ?').run(banner.is_active ? 0 : 1, req.params.id);
  }
  res.redirect('/admin/banners');
});

router.post('/banners/delete/:id', requireAuth, (req, res) => {
  db.prepare('DELETE FROM banners WHERE id = ?').run(req.params.id);
  res.redirect('/admin/banners');
});

module.exports = router;
