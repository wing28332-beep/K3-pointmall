(function () {
  var manifestUrl = 'prd/manifest.json';
  var state = {
    manifest: null,
    currentVersion: '',
    headings: []
  };

  function escapeHtml (value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function inlineMarkdown (value) {
    return escapeHtml(value)
      .replace(/`([^`]+)`/g, '<code>$1</code>')
      .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  }

  function slugify (text, index) {
    var slug = String(text || '')
      .trim()
      .toLowerCase()
      .replace(/[`~!@#$%^&*()+=[\]{}\\|;:'",.<>/?，。！？、；：“”‘’（）【】]/g, '')
      .replace(/\s+/g, '-');
    return slug || 'section-' + index;
  }

  function renderTable (lines, startIndex) {
    var rows = [];
    var index = startIndex;
    while (index < lines.length && /^\s*\|.+\|\s*$/.test(lines[index])) {
      rows.push(lines[index]);
      index += 1;
    }
    if (rows.length < 2) return null;

    var html = ['<table>'];
    rows.forEach(function (row, rowIndex) {
      if (rowIndex === 1 && /^\s*\|[\s\-:|]+\|\s*$/.test(row)) return;
      var cells = row.replace(/^\s*\||\|\s*$/g, '').split('|');
      var tag = rowIndex === 0 ? 'th' : 'td';
      html.push('<tr>' + cells.map(function (cell) {
        return '<' + tag + '>' + inlineMarkdown(cell.trim()) + '</' + tag + '>';
      }).join('') + '</tr>');
    });
    html.push('</table>');
    return { html: html.join(''), nextIndex: index };
  }

  function markdownToHtml (markdown) {
    var lines = markdown.replace(/\r\n/g, '\n').split('\n');
    var html = [];
    var paragraph = [];
    var inList = false;
    state.headings = [];

    function flushParagraph () {
      if (!paragraph.length) return;
      html.push('<p>' + inlineMarkdown(paragraph.join(' ')) + '</p>');
      paragraph = [];
    }

    function closeList () {
      if (!inList) return;
      html.push('</ul>');
      inList = false;
    }

    for (var i = 0; i < lines.length; i += 1) {
      var line = lines[i];
      var trimmed = line.trim();

      if (!trimmed) {
        flushParagraph();
        closeList();
        continue;
      }

      if (/^\s*\|.+\|\s*$/.test(line) && i + 1 < lines.length && /^\s*\|[\s\-:|]+\|\s*$/.test(lines[i + 1])) {
        flushParagraph();
        closeList();
        var table = renderTable(lines, i);
        if (table) {
          html.push(table.html);
          i = table.nextIndex - 1;
          continue;
        }
      }

      var heading = /^(#{1,4})\s+(.+)$/.exec(trimmed);
      if (heading) {
        flushParagraph();
        closeList();
        var level = heading[1].length;
        var text = heading[2].trim();
        var id = slugify(text, state.headings.length + 1);
        state.headings.push({ id: id, text: text, level: level });
        html.push('<h' + level + ' id="' + id + '">' + inlineMarkdown(text) + '</h' + level + '>');
        continue;
      }

      var listItem = /^[-*]\s+(.+)$/.exec(trimmed);
      if (listItem) {
        flushParagraph();
        if (!inList) {
          html.push('<ul>');
          inList = true;
        }
        html.push('<li>' + inlineMarkdown(listItem[1]) + '</li>');
        continue;
      }

      paragraph.push(trimmed);
    }

    flushParagraph();
    closeList();
    return html.join('');
  }

  function createDrawer () {
    if (document.getElementById('prdDrawer')) return;
    var drawer = document.createElement('div');
    drawer.className = 'prd_drawer';
    drawer.id = 'prdDrawer';
    drawer.innerHTML = [
      '<div class="prd_drawer_overlay" data-prd-close></div>',
      '<section class="prd_drawer_panel" role="dialog" aria-modal="true" aria-labelledby="prdDrawerTitle">',
      '<aside class="prd_drawer_sidebar">',
      '<div class="prd_drawer_log"><h3>更新日志</h3><div id="prdLog"></div></div>',
      '<h3>版本</h3><select class="prd_version_select" id="prdVersion"></select>',
      '<h3>文档目录</h3><nav class="prd_toc" id="prdToc"></nav>',
      '</aside>',
      '<main class="prd_drawer_main">',
      '<header class="prd_drawer_header">',
      '<div class="prd_drawer_title"><strong id="prdDrawerTitle">PRD文档</strong><span id="prdDrawerMeta"></span></div>',
      '<button type="button" class="prd_drawer_close" data-prd-close aria-label="关闭PRD文档">×</button>',
      '</header>',
      '<article class="prd_doc" id="prdDoc"><div class="prd_loading">正在加载 PRD...</div></article>',
      '</main>',
      '</section>'
    ].join('');
    document.body.appendChild(drawer);

    drawer.addEventListener('click', function (event) {
      if (event.target.hasAttribute('data-prd-close')) closeDrawer();
    });

    document.getElementById('prdVersion').addEventListener('change', function (event) {
      loadVersion(event.target.value);
    });

    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape') closeDrawer();
    });

    document.getElementById('prdDoc').addEventListener('scroll', syncActiveToc);
  }

  function openDrawer () {
    createDrawer();
    document.getElementById('prdDrawer').classList.add('is_open');
    document.body.style.overflow = 'hidden';
    if (!state.manifest) {
      loadManifest();
    }
  }

  function closeDrawer () {
    var drawer = document.getElementById('prdDrawer');
    if (!drawer) return;
    drawer.classList.remove('is_open');
    document.body.style.overflow = '';
  }

  function loadManifest () {
    fetch(manifestUrl, { cache: 'no-cache' })
      .then(function (response) {
        if (!response.ok) throw new Error('manifest load failed');
        return response.json();
      })
      .then(function (manifest) {
        state.manifest = manifest;
        renderManifest();
        loadVersion(manifest.currentVersion || (manifest.versions[0] && manifest.versions[0].version));
      })
      .catch(function () {
        document.getElementById('prdDoc').innerHTML = '<div class="prd_error">PRD 配置加载失败，请稍后重试。</div>';
      });
  }

  function renderManifest () {
    var versionSelect = document.getElementById('prdVersion');
    versionSelect.innerHTML = state.manifest.versions.map(function (item) {
      return '<option value="' + escapeHtml(item.version) + '">' + escapeHtml(item.version + ' - ' + item.title) + '</option>';
    }).join('');

    document.getElementById('prdLog').innerHTML = state.manifest.changelog.map(function (log) {
      return [
        '<div class="prd_drawer_log_item">',
        '<div class="prd_drawer_log_meta"><strong>' + escapeHtml(log.version) + '</strong><span>' + escapeHtml(log.date) + '</span></div>',
        '<ul>' + log.items.map(function (item) { return '<li>' + escapeHtml(item) + '</li>'; }).join('') + '</ul>',
        '</div>'
      ].join('');
    }).join('');
  }

  function findVersion (version) {
    return state.manifest.versions.filter(function (item) {
      return item.version === version;
    })[0] || state.manifest.versions[0];
  }

  function loadVersion (version) {
    if (!version) return;
    var item = findVersion(version);
    state.currentVersion = item.version;
    document.getElementById('prdVersion').value = item.version;
    document.getElementById('prdDrawerTitle').textContent = item.title;
    document.getElementById('prdDrawerMeta').textContent = item.version + ' / ' + item.date;
    document.getElementById('prdDoc').innerHTML = '<div class="prd_loading">正在加载 PRD...</div>';

    fetch(item.file, { cache: 'no-cache' })
      .then(function (response) {
        if (!response.ok) throw new Error('document load failed');
        return response.text();
      })
      .then(function (markdown) {
        document.getElementById('prdDoc').innerHTML = markdownToHtml(markdown);
        renderToc();
      })
      .catch(function () {
        document.getElementById('prdDoc').innerHTML = '<div class="prd_error">PRD 文档加载失败，请检查文档文件是否存在。</div>';
      });
  }

  function renderToc () {
    var toc = document.getElementById('prdToc');
    toc.innerHTML = state.headings
      .filter(function (item) { return item.level > 1; })
      .map(function (item) {
        return '<a class="level_' + item.level + '" href="#' + escapeHtml(item.id) + '" data-target="' + escapeHtml(item.id) + '">' + escapeHtml(item.text) + '</a>';
      }).join('');

    toc.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function (event) {
        event.preventDefault();
        var target = document.getElementById(link.getAttribute('data-target'));
        if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    });
    syncActiveToc();
  }

  function syncActiveToc () {
    var doc = document.getElementById('prdDoc');
    var toc = document.getElementById('prdToc');
    if (!doc || !toc || !state.headings.length) return;

    var active = '';
    state.headings.forEach(function (heading) {
      var node = document.getElementById(heading.id);
      if (node && node.offsetTop <= doc.scrollTop + 80) active = heading.id;
    });

    toc.querySelectorAll('a').forEach(function (link) {
      link.classList.toggle('is_active', link.getAttribute('data-target') === active);
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    var openButton = document.getElementById('prdDrawerOpen');
    if (openButton) openButton.addEventListener('click', openDrawer);
  });
})();
