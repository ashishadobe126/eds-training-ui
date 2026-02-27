export default function decorate(block) {
  const leftNodes = [];
  const rightNodes = [];

  [...block.children].forEach((row) => {
    const left = row.children[0];
    const right = row.children[1];

    if (left) {
      const leftChildren = left.children.length === 1 && left.children[0].tagName === 'DIV'
        ? left.children[0].childNodes
        : left.childNodes;
      [...leftChildren].forEach((n) => {
        if (n.nodeType !== Node.ELEMENT_NODE) return;
        const hasText = n.textContent.trim();
        const hasImg = n.querySelector('picture, img') || n.tagName === 'PICTURE' || n.tagName === 'IMG';
        if (hasText || hasImg) leftNodes.push(n.cloneNode(true));
      });
    }

    if (right) {
      const rightChildren = right.children.length === 1 && right.children[0].tagName === 'DIV'
        ? right.children[0].childNodes
        : right.childNodes;
      [...rightChildren].forEach((n) => {
        if (n.nodeType !== Node.ELEMENT_NODE) return;
        const hasText = n.textContent.trim();
        const hasImg = n.querySelector('picture, img') || n.tagName === 'PICTURE' || n.tagName === 'IMG';
        if (hasText || hasImg) rightNodes.push(n.cloneNode(true));
      });
    }
  });

  block.innerHTML = '';

  // left main content
  const main = document.createElement('div');
  main.className = 'art-main';

  let bodyIdx = 0;

  leftNodes.forEach((node) => {
    const tag = node.tagName;

    if (tag === 'H1') {
      node.className = 'art-title';
      main.appendChild(node);
      return;
    }

    if (/^H[2-6]$/.test(tag)) {
      node.className = 'art-heading';
      const line = document.createElement('span');
      line.className = 'art-yline';
      node.appendChild(line);
      main.appendChild(node);
      return;
    }

    if (tag === 'P' && node.querySelector('picture, img')) {
      const imgWrap = document.createElement('div');
      imgWrap.className = 'art-img';
      imgWrap.appendChild(node);
      main.appendChild(imgWrap);
      return;
    }

    if (tag === 'PICTURE' || tag === 'IMG') {
      const imgWrap = document.createElement('div');
      imgWrap.className = 'art-img';
      imgWrap.appendChild(node);
      main.appendChild(imgWrap);
      return;
    }

    if (tag === 'BLOCKQUOTE') {
      node.className = 'art-quote';
      const line = document.createElement('span');
      line.className = 'art-qline';
      node.appendChild(line);
      main.appendChild(node);
      return;
    }

    if (tag === 'P') {
      bodyIdx += 1;
      node.className = `art-body art-body-${bodyIdx}`;
      main.appendChild(node);
      return;
    }

    main.appendChild(node);
  });

  // right sidebar
  const side = document.createElement('aside');
  side.className = 'art-side';

  rightNodes.forEach((node) => {
    const tag = node.tagName;

    if (/^H[1-6]$/.test(tag)) {
      node.className = 'art-side-label';
      side.appendChild(node);
      return;
    }

    if (tag === 'UL' || tag === 'OL') {
      const nav = document.createElement('nav');
      nav.className = 'art-side-nav';

      [...node.querySelectorAll('li')].forEach((li) => {
        const a = li.querySelector('a');
        const currentPath = window.location.pathname;
        const linkPath = a && new URL(a.href, window.location.href).pathname;
        const isActive = a && linkPath === currentPath;
        const item = document.createElement('div');
        item.className = isActive ? 'art-side-item art-side-item-on' : 'art-side-item';

        if (a) {
          const fullText = a.textContent.trim();
          const dateRegex = /((?:Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday),?\s+\d{1,2}\s+\w+\s+\d{4}|\d{1,2}\s+\w+\s+\d{4})/i;
          const dateMatch = fullText.match(dateRegex);
          const titleText = dateMatch
            ? fullText.slice(0, fullText.indexOf(dateMatch[0])).trim()
            : fullText;
          const link = document.createElement('a');
          link.className = 'art-side-link';
          link.href = a.href;
          link.textContent = titleText;
          item.appendChild(link);
          if (dateMatch) {
            const meta = document.createElement('span');
            meta.className = 'art-side-meta';
            meta.textContent = dateMatch[0].trim();
            item.appendChild(meta);
          }
        }

        [...li.childNodes]
          .filter((n) => n.nodeType === Node.TEXT_NODE && n.textContent.trim())
          .forEach((n) => {
            const meta = document.createElement('span');
            meta.className = 'art-side-meta';
            meta.textContent = n.textContent.trim();
            item.appendChild(meta);
          });

        nav.appendChild(item);
      });

      side.appendChild(nav);
      return;
    }

    if (tag === 'P') {
      const a = node.querySelector('a');
      if (a) {
        const nav = document.createElement('nav');
        nav.className = 'art-side-nav';
        const item = document.createElement('div');
        item.className = 'art-side-item';
        const link = document.createElement('a');
        link.className = 'art-side-link';
        link.href = a.href;
        link.textContent = a.textContent.trim();
        item.appendChild(link);
        nav.appendChild(item);
        side.appendChild(nav);
      } else {
        node.className = 'art-side-label';
        side.appendChild(node);
      }
      return;
    }

    side.appendChild(node);
  });

  const wrap = document.createElement('div');
  wrap.className = 'art-wrap';
  wrap.appendChild(main);
  wrap.appendChild(side);
  block.appendChild(wrap);

  // breadcrumb injected after decorate runs, outside the AEM wrapper entirely
  const segments = window.location.pathname.split('/').filter(Boolean);
  if (segments.length > 0) {
    const crumbs = document.createElement('nav');
    crumbs.className = 'art-crumbs';

    const homeLink = document.createElement('a');
    homeLink.href = '/';
    homeLink.className = 'art-crumb';
    homeLink.textContent = 'Home';
    crumbs.appendChild(homeLink);

    segments.forEach((seg, i) => {
      const sep = document.createElement('span');
      sep.className = 'art-sep';
      sep.textContent = '/';
      crumbs.appendChild(sep);

      const a = document.createElement('a');
      a.href = `/${segments.slice(0, i + 1).join('/')}`;
      a.textContent = decodeURIComponent(seg.replace(/-/g, ' '));
      a.className = i === segments.length - 1 ? 'art-crumb art-crumb-cur' : 'art-crumb';
      crumbs.appendChild(a);
    });

    // walk up to the section/main element and prepend before the wrapper
    const section = block.closest('div.section') || block.parentElement.parentElement;
    section.insertAdjacentElement('afterbegin', crumbs);
  }
}
