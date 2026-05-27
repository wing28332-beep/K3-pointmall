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
    drawer.className = 'prdDrawerHost';
    drawer.id = 'prdDrawer';
    drawer.innerHTML = [
      '<div class="prdDrawerMask" data-prd-close></div>',
      '<aside class="prdDrawer" role="dialog" aria-modal="true" aria-labelledby="prdDrawerTitle">',
      '<div class="prdDrawerHeader">',
      '<div><strong id="prdDrawerTitle">PRD 文档</strong><span id="prdDrawerMeta"></span></div>',
      '<button type="button" class="prdDrawerClose" data-prd-close aria-label="关闭PRD文档">×</button>',
      '</div>',
      '<div class="prdDrawerBody">',
      '<nav class="prdSidebar">',
      '<button type="button" class="prdNavItem active" id="prdChangelogBtn">更新日志</button>',
      '<div class="prdNavTitle">版本</div>',
      '<div id="prdVersion"></div>',
      '<div class="prdVersionDesc" id="prdVersionDesc"></div>',
      '<div class="prdNavTitle">目录</div>',
      '<div id="prdToc"></div>',
      '</nav>',
      '<main class="prdMain" id="prdDoc"><section class="prdSection"><h2>PRD 加载中</h2><p class="prdLead">正在读取 PRD 内容...</p></section></main>',
      '</div>',
      '</section>'
    ].join('');
    document.body.appendChild(drawer);

    drawer.addEventListener('click', function (event) {
      if (event.target.hasAttribute('data-prd-close')) closeDrawer();
    });

    document.getElementById('prdChangelogBtn').addEventListener('click', function () {
      showChangelog();
    });

    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape') closeDrawer();
    });

    document.getElementById('prdDoc').addEventListener('scroll', syncActiveToc);
  }

  function openDrawer () {
    createDrawer();
    document.getElementById('prdDrawer').classList.add('is_open');
    document.body.classList.add('noscroll');
    document.documentElement.classList.add('noscroll');
    if (!state.manifest) {
      loadManifest();
    }
  }

  function closeDrawer () {
    var drawer = document.getElementById('prdDrawer');
    if (!drawer) return;
    drawer.classList.remove('is_open');
    document.body.classList.remove('noscroll');
    document.documentElement.classList.remove('noscroll');
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
        document.getElementById('prdDoc').innerHTML = '<section class="prdSection"><h2>PRD 加载失败</h2><p class="prdLead">PRD 配置加载失败，请稍后重试。</p></section>';
      });
  }

  function renderManifest () {
    var versionBox = document.getElementById('prdVersion');
    versionBox.innerHTML = state.manifest.versions.map(function (item) {
      return '<button type="button" class="prdNavItem prdVersionItem" data-version="' + escapeHtml(item.version) + '">' + escapeHtml(item.version) + '</button>';
    }).join('');

    versionBox.querySelectorAll('button').forEach(function (button) {
      button.addEventListener('click', function () {
        loadVersion(button.getAttribute('data-version'));
      });
    });
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
    document.getElementById('prdDrawerTitle').textContent = item.title;
    document.getElementById('prdDrawerMeta').textContent = item.version + ' / ' + item.date;
    document.getElementById('prdVersionDesc').textContent = item.title || '';
    document.querySelectorAll('.prdVersionItem').forEach(function (button) {
      button.classList.toggle('active', button.getAttribute('data-version') === item.version);
    });
    document.getElementById('prdChangelogBtn').classList.remove('active');
    document.getElementById('prdDoc').innerHTML = '<section class="prdSection"><h2>PRD 加载中</h2><p class="prdLead">正在读取 PRD 内容...</p></section>';

    fetch(item.file, { cache: 'no-cache' })
      .then(function (response) {
        if (!response.ok) throw new Error('document load failed');
        return response.text();
      })
      .then(function (markdown) {
        document.getElementById('prdDoc').innerHTML = '<section class="prdSection prdDoc">' + markdownToHtml(markdown) + '</section>';
        renderToc();
      })
      .catch(function () {
        document.getElementById('prdDoc').innerHTML = '<section class="prdSection"><h2>PRD 加载失败</h2><p class="prdLead">PRD 文档加载失败，请检查文档文件是否存在。</p></section>';
      });
  }

  function showChangelog () {
    if (!state.manifest) return;
    document.getElementById('prdChangelogBtn').classList.add('active');
    document.querySelectorAll('.prdVersionItem').forEach(function (button) {
      button.classList.remove('active');
    });
    document.getElementById('prdToc').innerHTML = '';
    document.getElementById('prdDoc').innerHTML = [
      '<section class="prdSection">',
      '<h2>更新日志</h2>',
      '<table class="prdTable"><thead><tr><th>版本</th><th>更新内容</th><th>更新日期</th><th>更新人</th></tr></thead><tbody>',
      state.manifest.changelog.map(function (log) {
        return '<tr><td>' + escapeHtml(log.version) + '</td><td>' + escapeHtml((log.items || []).join('；')) + '</td><td>' + escapeHtml(log.date) + '</td><td>' + escapeHtml(log.owner || '-') + '</td></tr>';
      }).join(''),
      '</tbody></table>',
      '</section>'
    ].join('');
    document.getElementById('prdDoc').scrollTop = 0;
  }

  function renderToc () {
    var toc = document.getElementById('prdToc');
    toc.innerHTML = state.headings
      .filter(function (item) { return item.level > 1; })
      .map(function (item) {
        return '<button type="button" class="prdCatalogItem level_' + item.level + '" data-target="' + escapeHtml(item.id) + '">' + escapeHtml(item.text) + '</button>';
      }).join('');

    toc.querySelectorAll('button').forEach(function (link) {
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

    toc.querySelectorAll('button').forEach(function (link) {
      link.classList.toggle('is_active', link.getAttribute('data-target') === active);
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    var openButton = document.getElementById('prdDrawerOpen');
    if (openButton) openButton.addEventListener('click', openDrawer);
  });
})();
