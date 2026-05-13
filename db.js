const crypto = require('crypto');

// In-memory store for Vercel (resets on each request - use KV/Postgres for persistence)
const store = {
  categories: [
    { id: 1, name: '行业资讯', description: 'AIDC行业最新动态与市场分析', sort_order: 1, created_at: '2026-04-01 00:00:00' },
    { id: 2, name: '技术前沿', description: 'AI基础设施、液冷、芯片等技术趋势', sort_order: 2, created_at: '2026-04-01 00:00:00' },
    { id: 3, name: '活动预告', description: '行业会议、论坛、展会信息', sort_order: 3, created_at: '2026-04-01 00:00:00' },
    { id: 4, name: '社群动态', description: '社群活动、交流互动', sort_order: 4, created_at: '2026-04-01 00:00:00' },
    { id: 5, name: '深度报告', description: '行业白皮书与深度研究', sort_order: 5, created_at: '2026-04-01 00:00:00' }
  ],
  articles: [
    { id: 1, title: 'Agent正杀入软件研发一线！全球超60位技术专家拆解AI落地困局，2026奇点智库大会即将召开', content: '<p>随着AI Agent技术的快速发展，软件研发领域正在经历前所未有的变革。全球超过60位顶尖技术专家齐聚一堂，深入探讨AI在实际业务场景中的落地挑战与解决方案。</p><p>2026奇点智库大会将于近期召开，届时将围绕Agent在代码生成、测试自动化、DevOps流程优化等核心议题展开讨论，为行业提供前沿视角与实践指南。</p>', summary: '全球超60位技术专家拆解AI落地困局，2026奇点智库大会即将召开', cover_image: '', category_id: 2, status: 'published', views: 328, is_featured: 1, is_hot: 1, tags: 'AI Agent,软件研发,智库大会', created_at: '2026-04-20 10:00:00', updated_at: '2026-04-20 10:00:00' },
    { id: 2, title: '【FAIR plus 2026】机器人全产业链接会重磅来袭 统一报名通道开启', content: '<p>FAIR plus 2026（Forum on Intelligent Robot Science and Technology）机器人全产业链接会即将盛大开幕。本次大会汇聚智能机器人学术产业前沿论坛及FIRST大会，覆盖全议程场次。</p><p>统一报名通道现已开启，欢迎产业链上下游企业、研究机构及技术爱好者踊跃参与。</p>', summary: 'FAIR plus 2026机器人全产业链接会统一报名通道开启，覆盖全议程场次', cover_image: '', category_id: 3, status: 'published', views: 215, is_featured: 1, is_hot: 0, tags: '机器人,FAIR,产业大会', created_at: '2026-04-18 09:00:00', updated_at: '2026-04-18 09:00:00' },
    { id: 3, title: '活动预告｜液冷 2.0：废热资产化与算电协同创新论坛', content: '<p>随着智算中心功率密度持续攀升，液冷技术已成为AIDC基础设施的标配。本次论坛聚焦"液冷2.0"时代的两大核心命题：</p><ul><li>废热资产化：如何将数据中心产生的大量废热转化为可利用的能源资产</li><li>算电协同：探索算力调度与电力系统的深度耦合机制</li></ul><p>诚邀产业界与学术界专家共同探讨下一代绿色智算解决方案。</p>', summary: '聚焦液冷2.0时代废热资产化与算电协同创新', cover_image: '', category_id: 3, status: 'published', views: 187, is_featured: 0, is_hot: 1, tags: '液冷,数据中心,绿色算力', created_at: '2026-04-14 08:30:00', updated_at: '2026-04-14 08:30:00' },
    { id: 4, title: '社群邀请｜TechWeek专业观众群开放，预登记常见问题Q&A', content: '<p>TechWeek专业观众社群现已正式开放！无论你是AIDC从业者、技术研究员还是行业投资人，都可以加入我们的专业交流群。</p><p>本文汇总了预登记过程中的常见问题，帮助你快速完成注册并获取最新活动资讯。</p>', summary: 'TechWeek专业观众群开放，预登记常见问题Q&A', cover_image: '', category_id: 4, status: 'published', views: 142, is_featured: 0, is_hot: 0, tags: 'TechWeek,社群,行业交流', created_at: '2026-04-10 14:00:00', updated_at: '2026-04-10 14:00:00' },
    { id: 5, title: '2026中国智算中心产业发展白皮书发布：算力需求年增超200%', content: '<p>近日，中国信通院联合多家机构发布《2026中国智算中心产业发展白皮书》。报告指出，受大模型训练和推理需求驱动，中国智算中心算力需求年增长率超过200%。</p><p>白皮书从政策环境、技术趋势、市场格局、投资动向等维度进行了全面分析，并对未来3-5年的产业发展趋势做出了前瞻性预测。</p>', summary: '中国智算中心算力需求年增超200%，白皮书深度解读产业趋势', cover_image: '', category_id: 5, status: 'published', views: 456, is_featured: 1, is_hot: 1, tags: '智算中心,白皮书,算力', created_at: '2026-04-08 10:00:00', updated_at: '2026-04-08 10:00:00' },
    { id: 6, title: '英伟达B300系列GPU全面解析：下一代AI训练芯片性能跃升', content: '<p>英伟达正式发布B300系列GPU，面向下一代AI大模型训练场景。相比上一代，B300在FP8算力上提升了60%，显存带宽提升了45%。</p><p>本文从架构创新、性能基准、功耗优化、生态适配等多个角度，全面解析B300系列的技术突破和产业影响。</p>', summary: '英伟达B300系列GPU性能跃升，全面解析下一代AI训练芯片', cover_image: '', category_id: 2, status: 'published', views: 523, is_featured: 0, is_hot: 1, tags: 'GPU,英伟达,AI芯片,算力', created_at: '2026-04-05 09:00:00', updated_at: '2026-04-05 09:00:00' },
    { id: 7, title: '数据中心液冷渗透率突破35%：2026年Q1行业数据盘点', content: '<p>据最新行业统计，2026年第一季度中国新建数据中心中液冷技术渗透率已突破35%，较去年同期增长近15个百分点。</p><p>液冷技术正从高端选配走向普惠标配，推动整个AIDC产业向更高密度、更低PUE的方向演进。</p>', summary: '2026年Q1液冷渗透率突破35%，行业全面拥抱液冷时代', cover_image: '', category_id: 1, status: 'published', views: 389, is_featured: 0, is_hot: 0, tags: '液冷,数据中心,PUE,行业数据', created_at: '2026-04-02 08:00:00', updated_at: '2026-04-02 08:00:00' },
    { id: 8, title: '算力调度平台技术演进：从资源管理到智能编排', content: '<p>随着多云、混合云架构成为主流，算力调度平台正经历从传统资源管理向智能编排的技术演进。</p><p>本文梳理了算力调度平台的三代技术路线，分析了当前主流方案的优劣势，并展望了AI驱动的智能调度技术发展方向。</p>', summary: '算力调度平台正经历从资源管理向智能编排的技术演进', cover_image: '', category_id: 2, status: 'published', views: 267, is_featured: 0, is_hot: 0, tags: '算力调度,云计算,智能编排', created_at: '2026-03-28 10:00:00', updated_at: '2026-03-28 10:00:00' }
  ],
  banners: [],
  adminUsers: [{ id: 1, username: 'admin', password_hash: hashPassword('admin123'), created_at: '2026-01-01 00:00:00' }],
  guests: []
};

// Create a simple SQL-like query interface
function createQuery(sql) {
  const lowerSql = sql.toLowerCase().trim();

  return {
    all: (...params) => {
      // SELECT queries
      if (lowerSql.startsWith('select')) {
        if (lowerSql.includes('from categories')) {
          if (lowerSql.includes('order by')) {
            return [...store.categories].sort((a, b) => a.sort_order - b.sort_order);
          }
          return store.categories;
        }
        if (lowerSql.includes('from articles')) {
          let result = [...store.articles];
          if (lowerSql.includes("status='published'")) {
            result = result.filter(a => a.status === 'published');
          }
          if (lowerSql.includes('order by created_at desc')) {
            result.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
          }
          if (lowerSql.includes('order by views desc')) {
            result.sort((a, b) => b.views - a.views);
          }
          if (lowerSql.includes('is_featured = 1')) {
            result = result.filter(a => a.is_featured === 1);
          }
          if (lowerSql.includes('limit')) {
            const match = lowerSql.match(/limit\s+(\d+)/);
            if (match) result = result.slice(0, parseInt(match[1]));
          }
          if (params.length >= 2) {
            const [limit, offset] = params;
            result = result.slice(offset || 0, (offset || 0) + limit);
          }
          return result;
        }
        if (lowerSql.includes('from banners')) {
          return store.banners;
        }
        if (lowerSql.includes('from guests')) {
          return store.guests;
        }
        if (lowerSql.includes('count(*)') && lowerSql.includes('categories')) {
          return [{ count: store.categories.length }];
        }
        if (lowerSql.includes('count(*)') && lowerSql.includes('articles')) {
          return [{ count: store.articles.length }];
        }
      }
      return [];
    },
    get: (...params) => {
      const id = params[0];
      if (lowerSql.includes('from categories where id')) {
        return store.categories.find(c => c.id === id) || null;
      }
      if (lowerSql.includes('from articles where id')) {
        return store.articles.find(a => a.id === id) || null;
      }
      if (lowerSql.includes('from admin_users where username')) {
        return store.adminUsers.find(u => u.username === id) || null;
      }
      if (lowerSql.includes('count(*)')) {
        if (lowerSql.includes('categories')) return { count: store.categories.length };
        if (lowerSql.includes('articles') && lowerSql.includes("status='published'")) {
          return { count: store.articles.filter(a => a.status === 'published').length };
        }
        if (lowerSql.includes('articles')) return { count: store.articles.length };
        if (lowerSql.includes('admin_users')) return { count: store.adminUsers.length };
        if (lowerSql.includes('guests')) return { count: store.guests.length };
      }
      return null;
    },
    run: (...params) => {
      if (lowerSql.includes('insert into guests')) {
        const guest = {
          id: store.guests.length + 1,
          name: params[0], company: params[1] || '', title: params[2] || '',
          phone: params[3] || '', email: params[4] || '', wechat: params[5] || '',
          event_name: params[6] || '',
          registered_at: new Date().toISOString().slice(0, 19).replace('T', ' ')
        };
        store.guests.push(guest);
        return { changes: 1 };
      }
      if (lowerSql.includes('update articles set views')) {
        const article = store.articles.find(a => a.id === params[0]);
        if (article) article.views++;
        return { changes: 1 };
      }
      return { changes: 0 };
    }
  };
}

const db = {
  prepare: createQuery
};

function hashPassword(password) {
  return crypto.createHash('sha256').update(password).digest('hex');
}

module.exports = { db, hashPassword };