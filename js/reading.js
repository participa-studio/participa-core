/* PARTICIPA CORE — READING OPTION (21 Nov 2026; see css/reading.css).
   Runs only when the site sets participa.reading: true (data-reading on <html>).
   Orders a case page.
   Panel: photos, video, the three blocks, the quote.
   Ending: one block under the panel, closed by one line. Every group
   (Reflections, Artefacts, References, Link, Licence, Photos) is a small label
   with its items beside it on wide screens, above them on phones. No lines between groups. */
document.addEventListener('DOMContentLoaded', function () {
  if (!document.documentElement.hasAttribute('data-reading')) return;
  var article = document.querySelector('article.case');
  if (!article) return;
  var lead = article.querySelector('.case__lead');
  if (lead) { var w = document.createElement('div'); w.className = 'case__lead-wrap'; lead.before(w); w.appendChild(lead); }
  var top = article.querySelector('.case__facts:not(.case__facts--end)');
  if (!top) return;
  var pick = function (sel) { return article.querySelector(':scope > ' + sel); };

  var panel = document.createElement('div'); panel.className = 'case__panel';
  ['.slider', '.case__video', '.case__blocks', '.case__quote'].forEach(function (s) { var el = pick(s); if (el) panel.appendChild(el); });
  top.after(panel);

  var ending = document.createElement('dl'); ending.className = 'case__ending';
  var group = function (label, items) {
    if (!items.length) return;
    var dt = document.createElement('dt'); dt.textContent = label;
    var dd = document.createElement('dd');
    items.forEach(function (it) { dd.appendChild(it); });
    ending.appendChild(dt); ending.appendChild(dd);
  };
  var item = function (href, name, meta, attrs) {
    var el = document.createElement(href ? 'a' : 'span');
    el.className = 'case__ending-item';
    if (href) { el.href = href; Object.keys(attrs || {}).forEach(function (k) { if (attrs[k] !== null) el.setAttribute(k, attrs[k]); }); }
    var n = document.createElement('span'); n.className = 'case__ending-name'; n.textContent = name; el.appendChild(n);
    if (meta) { var m = document.createElement('span'); m.className = 'case__ending-meta'; m.textContent = meta; el.appendChild(m); }
    return el;
  };

  var writing = pick('.case__writing');
  if (writing) {
    var posts = [].map.call(writing.querySelectorAll('a.blog__item'), function (a) {
      var t = a.querySelector('.blog__title'), d = a.querySelector('.blog__date');
      return item(a.getAttribute('href'), t ? t.textContent.trim() : a.textContent.trim(), d ? d.textContent.trim() : '');
    });
    group('Reflections', posts); writing.remove();
  }
  [['.case__artefacts:not(.case__references)', 'Artefacts'], ['.case__references', 'References']].forEach(function (pair) {
    var sec = pick(pair[0]); if (!sec) return;
    var rows = [].map.call(sec.querySelectorAll('li'), function (li) {
      var a = li.querySelector('a');
      var name = li.querySelector('.case__artefact-name'), meta = li.querySelector('.case__artefact-meta');
      return item(a ? a.getAttribute('href') : null, name ? name.textContent.trim() : li.textContent.trim(), meta ? meta.textContent.trim() : '',
        a ? { target: a.getAttribute('target'), rel: a.getAttribute('rel'), download: a.hasAttribute('download') ? '' : null } : null);
    });
    var h = sec.querySelector('h2');
    group(h ? h.textContent.trim() : pair[1], rows); sec.remove();
  });
  var end = pick('.case__facts--end');
  if (end) {
    [].forEach.call(end.querySelectorAll(':scope > div'), function (d) {
      var dt = d.querySelector('dt'), dd = d.querySelector('dd');
      var wrap = document.createElement('span'); wrap.className = 'case__ending-item case__ending-text'; wrap.innerHTML = dd.innerHTML;
      group(dt.textContent.trim(), [wrap]);
    });
    end.remove();
  }
  var note = pick('.case__note');
  if (note) { var n = document.createElement('span'); n.className = 'case__ending-item case__ending-text'; n.innerHTML = note.innerHTML; group('Note', [n]); note.remove(); }
  if (ending.children.length) panel.after(ending);
});

/* Reflections (21 Nov 2026): post page panel, marked lead, references after the panel; see css/reading.css */
document.addEventListener('DOMContentLoaded', function () {
  if (!document.documentElement.hasAttribute('data-reading')) return;
  var post = document.querySelector('article.post');
  if (!post) return;
  var lead = post.querySelector('.post__lead');
  if (lead) { var w = document.createElement('div'); w.className = 'post__lead-wrap'; lead.before(w); w.appendChild(lead); }
  var body = post.querySelector('.post__body');
  if (!body) return;
  var more = post.querySelector('.home__more');
  var panel = document.createElement('div'); panel.className = 'post__panel';
  var fig = post.querySelector(':scope > .post__lead-figure, :scope > .post__slider');
  var tags = post.querySelector(':scope > .tags');
  (fig || body).before(panel);
  if (fig) panel.appendChild(fig);
  panel.appendChild(body);
  /* Tags sit under the lead, above the line that opens the panel (where a selected tag shows on the list) */
  if (tags) panel.before(tags);
  var last = panel;
  /* A "References" heading with a list at the end of the text becomes a small block after the panel */
  [].forEach.call(body.querySelectorAll(':scope > h2'), function (h) {
    if (!/^references$/i.test(h.textContent.trim())) return;
    var list = h.nextElementSibling;
    if (!list || !/^(UL|OL)$/.test(list.tagName)) return;
    var dl = document.createElement('dl'); dl.className = 'case__ending';
    var dt = document.createElement('dt'); dt.textContent = h.textContent.trim();
    var dd = document.createElement('dd');
    [].forEach.call(list.children, function (li) { var s = document.createElement('span'); s.className = 'case__ending-item case__ending-text'; s.innerHTML = li.innerHTML; dd.appendChild(s); });
    dl.appendChild(dt); dl.appendChild(dd);
    h.remove(); list.remove();
    last.after(dl); last = dl;
  });
  if (more) last.after(more);
});

/* Home (21 Nov 2026): the marked opening under the statement stays within the statement's visual width */
(function () {
  if (!document.documentElement.hasAttribute('data-reading')) return;
  /* Also the Experiments and Reflections landing pages (21 Nov 2026): their opening wraps within the title's width */
  function fitOne(h) {
    var o = h.nextElementSibling;
    if (o && o.classList.contains('home__opening-wrap')) o = o.firstElementChild;
    if (!o || !o.classList.contains('page__opening')) return;
    var wrap = o.parentNode.classList.contains('home__opening-wrap') ? o.parentNode : null;
    if (!wrap) { wrap = document.createElement('div'); wrap.className = 'home__opening-wrap'; o.before(wrap); wrap.appendChild(o); }
    var r = document.createRange(); r.selectNodeContents(h);
    var w = 0; [].forEach.call(r.getClientRects(), function (q) { w = Math.max(w, q.width); });
    wrap.style.maxWidth = Math.ceil(w) + 'px';
  }
  function fit() {
    [].forEach.call(document.querySelectorAll('.home__statement, article.work > .case__title, article.blog > .case__title'), fitOne);
  }
  document.addEventListener('DOMContentLoaded', fit);
  window.addEventListener('load', fit);   /* after the web fonts, so the width is the real one */
  window.addEventListener('resize', fit);
})();

/* About (21 Nov 2026): marked opening and a panel around the main text; see css/reading.css */
document.addEventListener('DOMContentLoaded', function () {
  if (!document.documentElement.hasAttribute('data-reading')) return;
  var main = document.querySelector('.about__main');
  if (!main) return;
  var op = main.querySelector('.about__opening');
  if (op) { var w = document.createElement('div'); w.className = 'about__opening-wrap'; op.before(w); w.appendChild(op); }
  var texts = main.querySelectorAll(':scope > .about__text');
  if (!texts.length) return;
  var panel = document.createElement('div'); panel.className = 'about__panel';
  texts[0].before(panel);
  [].forEach.call(texts, function (t) { panel.appendChild(t); });
});

/* About on phones (21 Nov 2026): the photo moves into the top of the text panel; back beside the text on wider screens */
(function () {
  if (!document.documentElement.hasAttribute('data-reading')) return;
  var mq = window.matchMedia('(max-width: 720px)');
  function place() {
    var fig = document.querySelector('.about__photo');
    var panel = document.querySelector('.about__panel');
    var top = document.querySelector('.about__top');
    if (!fig || !panel || !top) return;
    if (mq.matches) { if (fig.parentNode !== panel) panel.prepend(fig); }
    else if (fig.parentNode !== top) top.appendChild(fig);
  }
  document.addEventListener('DOMContentLoaded', function () { setTimeout(place, 0); });
  if (mq.addEventListener) mq.addEventListener('change', place); else mq.addListener(place);
})();
