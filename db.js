const Database = require('better-sqlite3');
const path = require('path');
const crypto = require('crypto');

const dbPath = path.join(__dirname, 'data.db');
const db = new Database(dbPath);

db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

db.exec(`
  CREATE TABLE IF NOT EXISTS categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT DEFAULT '',
    sort_order INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS articles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    content TEXT DEFAULT '',
    summary TEXT DEFAULT '',
    cover_image TEXT DEFAULT '',
    category_id INTEGER,
    status TEXT DEFAULT 'draft' CHECK(status IN ('draft', 'published')),
    views INTEGER DEFAULT 0,
    is_featured INTEGER DEFAULT 0,
    is_hot INTEGER DEFAULT 0,
    tags TEXT DEFAULT '',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
  );

  CREATE TABLE IF NOT EXISTS banners (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    image TEXT NOT NULL,
    link TEXT DEFAULT '',
    sort_order INTEGER DEFAULT 0,
    is_active INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS admin_users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

function hashPassword(password) {
  return crypto.createHash('sha256').update(password).digest('hex');
}

const adminExists = db.prepare('SELECT COUNT(*) as count FROM admin_users').get();
if (adminExists.count === 0) {
  db.prepare('INSERT INTO admin_users (username, password_hash) VALUES (?, ?)').run('admin', hashPassword('admin123'));
}

const catCount = db.prepare('SELECT COUNT(*) as count FROM categories').get();
if (catCount.count === 0) {
  const insertCat = db.prepare('INSERT INTO categories (name, description, sort_order) VALUES (?, ?, ?)');
  insertCat.run('行业资讯', 'AIDC行业最新动态与市场分析', 1);
  insertCat.run('技术前沿', 'AI基础设施、液冷、芯片等技术趋势', 2);
  insertCat.run('活动预告', '行业会议、论坛、展会信息', 3);
  insertCat.run('社群动态', '社群活动、交流互动', 4);
  insertCat.run('深度报告', '行业白皮书与深度研究', 5);
}

const artCount = db.prepare('SELECT COUNT(*) as count FROM articles').get();
if (artCount.count === 0) {
  const insertArt = db.prepare('INSERT INTO articles (title, content, summary, category_id, status, views, is_featured, is_hot, tags, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
  insertArt.run(
    'Agent正杀入软件研发一线！全球超60位技术专家拆解AI落地困局，2026奇点智库大会即将召开',
    '<p>随着AI Agent技术的快速发展，软件研发领域正在经历前所未有的变革。全球超过60位顶尖技术专家齐聚一堂，深入探讨AI在实际业务场景中的落地挑战与解决方案。</p><p>2026奇点智库大会将于近期召开，届时将围绕Agent在代码生成、测试自动化、DevOps流程优化等核心议题展开讨论，为行业提供前沿视角与实践指南。</p>',
    '全球超60位技术专家拆解AI落地困局，2026奇点智库大会即将召开',
    2, 'published', 328, 1, 1, 'AI Agent,软件研发,智库大会', '2026-04-20 10:00:00'
  );
  insertArt.run(
    '【FAIR plus 2026】机器人全产业链接会重磅来袭 统一报名通道开启',
    '<p>FAIR plus 2026（Forum on Intelligent Robot Science and Technology）机器人全产业链接会即将盛大开幕。本次大会汇聚智能机器人学术产业前沿论坛及FIRST大会，覆盖全议程场次。</p><p>统一报名通道现已开启，欢迎产业链上下游企业、研究机构及技术爱好者踊跃参与。</p>',
    'FAIR plus 2026机器人全产业链接会统一报名通道开启，覆盖全议程场次',
    3, 'published', 215, 1, 0, '机器人,FAIR,产业大会', '2026-04-18 09:00:00'
  );
  insertArt.run(
    '活动预告｜液冷 2.0：废热资产化与算电协同创新论坛',
    '<p>随着智算中心功率密度持续攀升，液冷技术已成为AIDC基础设施的标配。本次论坛聚焦"液冷2.0"时代的两大核心命题：</p><ul><li>废热资产化：如何将数据中心产生的大量废热转化为可利用的能源资产</li><li>算电协同：探索算力调度与电力系统的深度耦合机制</li></ul><p>诚邀产业界与学术界专家共同探讨下一代绿色智算解决方案。</p>',
    '聚焦液冷2.0时代废热资产化与算电协同创新',
    3, 'published', 187, 0, 1, '液冷,数据中心,绿色算力', '2026-04-14 08:30:00'
  );
  insertArt.run(
    '社群邀请｜TechWeek专业观众群开放，预登记常见问题Q&A',
    '<p>TechWeek专业观众社群现已正式开放！无论你是AIDC从业者、技术研究员还是行业投资人，都可以加入我们的专业交流群。</p><p>本文汇总了预登记过程中的常见问题，帮助你快速完成注册并获取最新活动资讯。</p>',
    'TechWeek专业观众群开放，预登记常见问题Q&A',
    4, 'published', 142, 0, 0, 'TechWeek,社群,行业交流', '2026-04-10 14:00:00'
  );
  insertArt.run(
    '2026中国智算中心产业发展白皮书发布：算力需求年增超200%',
    '<p>近日，中国信通院联合多家机构发布《2026中国智算中心产业发展白皮书》。报告指出，受大模型训练和推理需求驱动，中国智算中心算力需求年增长率超过200%。</p><p>白皮书从政策环境、技术趋势、市场格局、投资动向等维度进行了全面分析，并对未来3-5年的产业发展趋势做出了前瞻性预测。</p>',
    '中国智算中心算力需求年增超200%，白皮书深度解读产业趋势',
    5, 'published', 456, 1, 1, '智算中心,白皮书,算力', '2026-04-08 10:00:00'
  );
  insertArt.run(
    '英伟达B300系列GPU全面解析：下一代AI训练芯片性能跃升',
    '<p>英伟达正式发布B300系列GPU，面向下一代AI大模型训练场景。相比上一代，B300在FP8算力上提升了60%，显存带宽提升了45%。</p><p>本文从架构创新、性能基准、功耗优化、生态适配等多个角度，全面解析B300系列的技术突破和产业影响。</p>',
    '英伟达B300系列GPU性能跃升，全面解析下一代AI训练芯片',
    2, 'published', 523, 0, 1, 'GPU,英伟达,AI芯片,算力', '2026-04-05 09:00:00'
  );
  insertArt.run(
    '数据中心液冷渗透率突破35%：2026年Q1行业数据盘点',
    '<p>据最新行业统计，2026年第一季度中国新建数据中心中液冷技术渗透率已突破35%，较去年同期增长近15个百分点。</p><p>液冷技术正从高端选配走向普惠标配，推动整个AIDC产业向更高密度、更低PUE的方向演进。</p>',
    '2026年Q1液冷渗透率突破35%，行业全面拥抱液冷时代',
    1, 'published', 389, 0, 0, '液冷,数据中心,PUE,行业数据', '2026-04-02 08:00:00'
  );
  insertArt.run(
    '算力调度平台技术演进：从资源管理到智能编排',
    '<p>随着多云、混合云架构成为主流，算力调度平台正经历从传统资源管理向智能编排的技术演进。</p><p>本文梳理了算力调度平台的三代技术路线，分析了当前主流方案的优劣势，并展望了AI驱动的智能调度技术发展方向。</p>',
    '算力调度平台正经历从资源管理向智能编排的技术演进',
    2, 'published', 267, 0, 0, '算力调度,云计算,智能编排', '2026-03-28 10:00:00'
  );
}

module.exports = { db, hashPassword };
