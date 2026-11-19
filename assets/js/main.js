/* ============================================================
   渲染逻辑：所有文字从 content.js 读取，这里只负责排版。
   ============================================================ */
(function () {
  'use strict';

  var C = window.CONTENT || {};
  var page = document.body.dataset.page;

  function $(s, r) { return (r || document).querySelector(s); }
  function tag(t, cls, text) {
    var e = document.createElement(t);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    return e;
  }
  function fill(sel, text) { var n = $(sel); if (n) n.textContent = text; }

  /* ---------- 导航 ---------- */
  var HOME_LINKS = [
    ['index.html#about', '关于'],
    ['index.html#work', '项目'],
    ['index.html#experience', '实习'],
    ['index.html#skills', '技能'],
    ['blog.html', '笔记'],
    ['index.html#contact', '联系']
  ];
  var SUB_LINKS = [
    ['index.html', '首页'],
    ['index.html#work', '项目'],
    ['blog.html', '笔记'],
    ['index.html#contact', '联系']
  ];

  var nav = $('.nav');
  if (nav) {
    var list = $('.nav-links', nav);
    var links = page === 'home' ? HOME_LINKS : SUB_LINKS;
    links.forEach(function (l) {
      var li = tag('li');
      var a = tag('a', null, l[1]);
      a.href = l[0];
      if ((page === 'blog' && l[1] === '笔记') || (page === 'post' && l[1] === '笔记')) {
        a.setAttribute('aria-current', 'page');
      }
      li.appendChild(a);
      list.appendChild(li);
    });
    fill('#nav-name', C.name || '');
  }

  /* 首屏时导航随滚动出现；子页面常驻 */
  if (page === 'home' && nav) {
    var toggleNav = function () {
      nav.classList.toggle('show', window.scrollY > window.innerHeight * 0.45);
    };
    window.addEventListener('scroll', toggleNav, { passive: true });
    toggleNav();
  }

  /* ---------- 工具 ---------- */
  function chips(list) {
    var ul = tag('ul', 'tags');
    (list || []).forEach(function (t) { ul.appendChild(tag('li', null, t)); });
    return ul;
  }

  /* 机构标识：图片加载失败时自动隐藏，不留破图 */
  function crest(src, alt) {
    var box = tag('span', 'crest');
    var img = document.createElement('img');
    img.src = src;
    img.alt = alt;
    img.loading = 'lazy';
    img.decoding = 'async';
    img.addEventListener('error', function () { box.remove(); });
    box.appendChild(img);
    return box;
  }

  function pointsBlock(points) {
    var ol = tag('ol', 'points');
    (points || []).forEach(function (p) {
      var li = tag('li');
      li.appendChild(tag('h4', null, p[0]));
      li.appendChild(tag('p', null, p[1]));
      ol.appendChild(li);
    });
    return ol;
  }

  /* 条目：编号 + 分隔线 + 时间戳（编辑式抬头） */
  function ruleRow(no, stamp) {
    var row = tag('div', 'rule-row');
    if (no) row.appendChild(tag('span', 'no', no));
    row.appendChild(tag('span', 'line'));
    if (stamp) row.appendChild(tag('span', 'stamp', stamp));
    return row;
  }

  function workItem(item, no, delay) {
    var art = tag('article', 'work');
    art.setAttribute('data-reveal', '');
    if (delay) art.style.setProperty('--d', delay + 'ms');

    art.appendChild(ruleRow(no || item.no, item.period));

    var titleRow = tag('div', 'work-title-row');
    if (item.logo) titleRow.appendChild(crest(item.logo, item.logoAlt || ''));
    titleRow.appendChild(tag('h3', 'work-title', item.title || item.org));
    art.appendChild(titleRow);

    if (item.role) art.appendChild(tag('p', 'work-role', item.role));

    var body = tag('div', 'work-body');
    if (item.lead) body.appendChild(tag('p', 'work-lead', item.lead));
    if (item.points && item.points.length) body.appendChild(pointsBlock(item.points));
    if (item.tags && item.tags.length) body.appendChild(chips(item.tags));

    art.appendChild(body);
    return art;
  }

  /* ---------- 首页 ---------- */
  if (page === 'home') {
    document.title = (C.name || '张洋') + ' — ' + (C.eyebrow || '');

    fill('#hero-eyebrow', C.eyebrow);
    fill('#hero-name', C.name);
    fill('#hero-sub', C.subtitle);
    fill('#hero-meta', C.meta);

    var resume = $('#resume-link');
    if (resume && C.resumeUrl) resume.href = C.resumeUrl;

    /* 首屏索引：用真实内容生成，不编造 */
    var idx = $('#hero-index');
    if (idx) {
      var idxRows = [];
      (C.projects || []).forEach(function (p) {
        idxRows.push([p.no, p.title, (p.period || '').split(' ')[0]]);
      });
      (C.experience || []).forEach(function (e, i) {
        idxRows.push([String((C.projects || []).length + i + 1).padStart(2, '0'),
          e.org || '', (e.period || '').split(' ')[0]]);
      });
      idxRows.forEach(function (r) {
        var li = tag('li');
        li.appendChild(tag('span', 'idx', r[0]));
        li.appendChild(tag('span', 't', r[1]));
        li.appendChild(tag('span', 'y', r[2] || ''));
        idx.appendChild(li);
      });
    }

    var about = $('#about-body');
    (C.about || []).forEach(function (t) { about.appendChild(tag('p', null, t)); });

    var work = $('#work-list');
    (C.projects || []).forEach(function (p, i) {
      work.appendChild(workItem(p, p.no, i * 70));
    });

    var exp = $('#exp-list');
    (C.experience || []).forEach(function (e, i) {
      exp.appendChild(workItem({
        no: ('0' + (i + 1)).slice(-2),
        title: e.org,
        period: e.period,
        role: e.role,
        logo: e.logo,
        logoAlt: e.logoAlt,
        lead: e.lead,
        tags: e.tags,
        points: e.points
      }, null, 0));
    });

    var edu = $('#edu-list');
    (C.education || []).forEach(function (d) {
      var row = tag('div', 'edu');
      row.setAttribute('data-reveal', '');
      row.style.setProperty('--d', (edu.childElementCount * 70) + 'ms');
      var top = tag('div', 'edu-top');
      if (d.logo) top.appendChild(crest(d.logo, d.logoAlt || ''));
      top.appendChild(tag('span', 'edu-school', d.school));
      if (d.badge) top.appendChild(tag('span', 'badge', d.badge));
      top.appendChild(tag('span', 'edu-degree', d.degree));
      row.appendChild(top);
      if (d.period) row.appendChild(tag('div', 'edu-period', d.period));
      if (d.detail) row.appendChild(tag('div', 'edu-detail', d.detail));
      if (d.honors) row.appendChild(tag('div', 'edu-honors', d.honors));
      edu.appendChild(row);
    });

    var skills = $('#skill-list');
    (C.skills || []).forEach(function (s) {
      var row = tag('div', 'skill');
      row.setAttribute('data-reveal', '');
      row.style.setProperty('--d', (skills.childElementCount * 55) + 'ms');
      row.appendChild(tag('div', 'skill-group', s.group));
      var ul = tag('ul', 'skill-items');
      (s.items || []).forEach(function (i) { ul.appendChild(tag('li', null, i)); });
      row.appendChild(ul);
      skills.appendChild(row);
    });

    var ct = C.contact || {};
    fill('#contact-intro', ct.intro);
    var mail = $('#mail');
    if (mail && ct.email) {
      mail.textContent = ct.email;
      mail.href = 'mailto:' + ct.email;
    }

    var meta = $('#contact-meta');
    function metaRow(label, value, href) {
      if (!value) return;
      var row = tag('div');
      row.appendChild(tag('dt', null, label));
      var dd = tag('dd');
      if (href) {
        var a = tag('a', null, value);
        a.href = href;
        if (href.indexOf('http') === 0) { a.rel = 'noopener'; a.target = '_blank'; }
        dd.appendChild(a);
      } else {
        dd.textContent = value;
      }
      row.appendChild(dd);
      meta.appendChild(row);
    }
    if (meta) {
      metaRow('Email', ct.email, ct.email ? 'mailto:' + ct.email : null);
      metaRow('GitHub', ct.githubLabel || ct.github, ct.github);
      metaRow('Location', ct.location);
    }
  }

  /* ---------- 列表页 ---------- */
  if (page === 'blog') {
    document.title = '笔记 — ' + (C.name || '');
    var box = $('#post-list');

    if (!C.posts || !C.posts.length) {
      var e = tag('div', 'empty');
      e.appendChild(tag('h3', null, '还没有文章'));
      e.appendChild(tag('p', null, '第一篇正在写，稍后回来看看。'));
      box.appendChild(e);
    } else {
      C.posts.forEach(function (p, i) {
        var a = tag('a', 'post-item');
        a.href = 'post.html?id=' + encodeURIComponent(p.id);
        a.setAttribute('data-reveal', '');
        a.style.setProperty('--d', (i * 80) + 'ms');

        a.appendChild(tag('span', 'post-no', ('0' + (i + 1)).slice(-2)));

        var main = tag('div', 'post-main');
        main.appendChild(tag('time', null, p.date));
        main.appendChild(tag('h2', null, p.title));
        main.appendChild(tag('p', null, p.summary));
        a.appendChild(main);

        a.appendChild(tag('span', 'post-arrow', '→'));
        box.appendChild(a);
      });
    }
  }

  /* ---------- 文章页 ---------- */
  if (page === 'post') {
    var id = new URLSearchParams(location.search).get('id');
    var posts = C.posts || [];
    var post = null;
    for (var i = 0; i < posts.length; i++) {
      if (posts[i].id === id) { post = posts[i]; break; }
    }
    if (!post) post = posts[0];

    var host = $('#article');
    host.classList.add('article');

    if (!post) {
      var empty = tag('div', 'empty');
      empty.appendChild(tag('h3', null, '文章不存在'));
      empty.appendChild(tag('p', null, '链接可能过期了，回到笔记列表看看。'));
      host.appendChild(empty);
      document.title = '文章不存在 — ' + (C.name || '');
    } else {
      document.title = post.title + ' — ' + (C.name || '');
      host.appendChild(tag('time', null, post.date));
      host.appendChild(tag('h1', null, post.title));
      (post.body || []).forEach(function (t) {
        if (t.indexOf('## ') === 0) {
          host.appendChild(tag('h2', null, t.slice(3)));
        } else {
          host.appendChild(tag('p', null, t));
        }
      });

      var end = tag('div', 'article-end');
      end.appendChild(tag('span', null, (C.name || '') + ' · ' + (C.eyebrow || '')));
      var backLink = tag('a', null, '全部笔记 →');
      backLink.href = 'blog.html';
      end.appendChild(backLink);
      host.appendChild(end);
    }
  }

  /* ---------- 页脚 ---------- */
  var yr = new Date().getFullYear();
  fill('#foot-left', '© ' + yr + ' ' + (C.name || ''));
  fill('#foot-right', C.eyebrow || '');

  /* ---------- 入场动画 ---------- */
  var items = document.querySelectorAll('[data-reveal]');
  if (!items.length) return;

  if (!('IntersectionObserver' in window) ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    Array.prototype.forEach.call(items, function (n) { n.classList.add('in'); });
    return;
  }

  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (en) {
      if (en.isIntersecting) {
        en.target.classList.add('in');
        io.unobserve(en.target);
      }
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -6% 0px' });

  Array.prototype.forEach.call(items, function (n) { io.observe(n); });
})();
