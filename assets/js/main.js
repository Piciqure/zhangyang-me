(function () {
  var C = window.CONTENT;
  var page = document.body.dataset.page;

  function $(s, r) { return (r || document).querySelector(s); }
  function el(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    return e;
  }
  function fill(sel, text) { var n = $(sel); if (n) n.textContent = text; }

  // ---------- 导航 ----------
  var nav = $('.nav');
  if (nav) {
    var links = page === 'home'
      ? [['#about', '关于'], ['#projects', '项目'], ['#skills', '技能'], ['blog.html', '博客'], ['#contact', '联系']]
      : [['index.html', '首页'], ['blog.html', '博客']];
    var ul = $('ul', nav);
    links.forEach(function (l) {
      var li = el('li'), a = el('a', null, l[1]);
      a.href = l[0];
      if ((page === 'blog' || page === 'post') && l[0] === 'blog.html') a.setAttribute('aria-current', 'page');
      li.appendChild(a); ul.appendChild(li);
    });
    $('.brand', nav).textContent = C.name;
    if (page === 'home') {
      var onScroll = function () { nav.classList.toggle('show', window.scrollY > window.innerHeight * 0.6); };
      window.addEventListener('scroll', onScroll, { passive: true });
      onScroll();
    }
  }

  // ---------- 卡片 ----------
  function tagList(tags) {
    var ul = el('ul', 'tags');
    tags.forEach(function (t) { ul.appendChild(el('li', null, t)); });
    return ul;
  }
  function postCard(p) {
    var a = el('a', 'card reveal');
    a.href = 'post.html?id=' + encodeURIComponent(p.id);
    a.appendChild(el('span', 'date', p.date));
    a.appendChild(el('h3', null, p.title));
    a.appendChild(el('p', null, p.summary));
    return a;
  }

  if (page === 'home') {
    document.title = C.name + ' · 个人主页';
    fill('#hero-name', C.name);
    fill('#hero-sub', C.subtitle);
    $('#resume-link').href = C.resumeUrl;
    var about = $('#about-body');
    C.about.forEach(function (t) { about.appendChild(el('p', null, t)); });
    var grid = $('#project-grid');
    C.projects.forEach(function (p) {
      var c = el('article', 'card reveal');
      c.appendChild(el('h3', null, p.title));
      c.appendChild(el('p', null, p.desc));
      c.appendChild(tagList(p.tags));
      grid.appendChild(c);
    });
    var sk = $('#skill-list');
    C.skills.forEach(function (s) {
      var d = el('div', 'skill reveal');
      d.appendChild(el('dt', null, s.group));
      d.appendChild(el('dd', null, s.items));
      sk.appendChild(d);
    });
    var m = $('#mail');
    m.textContent = C.contact.email; m.href = 'mailto:' + C.contact.email;
    fill('#contact-intro', C.contact.intro);
    $('#github').href = C.contact.github;
  }

  if (page === 'blog') {
    document.title = '博客 · ' + C.name;
    var list = $('#post-list');
    if (!C.posts.length) {
      var e = el('div', 'empty reveal');
      e.appendChild(el('h3', null, '还没有文章'));
      e.appendChild(el('p', null, '第一篇正在写，稍后回来看看。'));
      list.appendChild(e);
    } else {
      C.posts.forEach(function (p) { list.appendChild(postCard(p)); });
    }
  }

  if (page === 'post') {
    var id = new URLSearchParams(location.search).get('id');
    var post = C.posts.filter(function (p) { return p.id === id; })[0] || C.posts[0];
    var box = $('#article');
    if (!post) {
      var e2 = el('div', 'empty');
      e2.appendChild(el('h3', null, '文章不存在'));
      box.appendChild(e2);
    } else {
      document.title = post.title + ' · ' + C.name;
      box.appendChild(el('span', 'date', post.date));
      box.appendChild(el('h1', null, post.title));
      post.body.forEach(function (t) {
        box.appendChild(t.indexOf('## ') === 0 ? el('h2', null, t.slice(3)) : el('p', null, t));
      });
    }
  }

  fill('#year', new Date().getFullYear() + ' ' + C.name);

  // ---------- 入场动画 ----------
  var items = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (x) { if (x.isIntersecting) { x.target.classList.add('in'); io.unobserve(x.target); } });
    }, { threshold: 0.12 });
    items.forEach(function (i) { io.observe(i); });
  } else {
    items.forEach(function (i) { i.classList.add('in'); });
  }
})();
