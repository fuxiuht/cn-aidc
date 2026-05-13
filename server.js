const express = require('express');
const path = require('path');
const session = require('express-session');
const { db } = require('./db');

const app = express();
const PORT = 3000;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(session({
  secret: 'zhisuan-aidc-2026',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 24 * 60 * 60 * 1000 }
}));

app.use((req, res, next) => {
  res.locals.currentPath = req.path;
  next();
});

// Sitemap
app.get('/sitemap.xml', (req, res) => {
  const articles = db.prepare("SELECT id, updated_at FROM articles WHERE status='published' ORDER BY updated_at DESC").all();
  const categories = db.prepare('SELECT id FROM categories').all();

  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
  xml += '  <url><loc>http://localhost:3000/</loc><changefreq>daily</changefreq><priority>1.0</priority></url>\n';
  xml += '  <url><loc>http://localhost:3000/about</loc><changefreq>monthly</changefreq><priority>0.5</priority></url>\n';

  categories.forEach(c => {
    xml += `  <url><loc>http://localhost:3000/category/${c.id}</loc><changefreq>daily</changefreq><priority>0.8</priority></url>\n`;
  });

  articles.forEach(a => {
    xml += `  <url><loc>http://localhost:3000/article/${a.id}</loc><lastmod>${(a.updated_at || '').slice(0, 10)}</lastmod><changefreq>weekly</changefreq><priority>0.7</priority></url>\n`;
  });

  xml += '</urlset>';
  res.set('Content-Type', 'application/xml');
  res.send(xml);
});

const indexRoutes = require('./routes/index');
const adminRoutes = require('./routes/admin');

app.use('/', indexRoutes);
app.use('/admin', adminRoutes);

app.use((req, res) => {
  res.status(404).render('404');
});

// Vercel export
module.exports = app;

// Local dev server
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`\n  CN-AIDC智算之心 门户网站已启动`);
    console.log(`  前台: http://localhost:${PORT}`);
    console.log(`  后台: http://localhost:${PORT}/admin`);
    console.log(`  后台账号: admin / admin123\n`);
  });
}
