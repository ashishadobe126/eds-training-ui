import { toClassName, createOptimizedPicture } from '../../scripts/aem.js';

function buildCardGrid(panel) {
  const grid = document.createElement('div');
  grid.className = 'tabs-cards';

  const rows = panel.querySelectorAll('table tr');
  if (!rows.length) return null;

  rows.forEach((tr) => {
    const tds = [...tr.querySelectorAll('td')];
    // skip rows with no image — these are EDS block header/title rows
    if (!tds.length || !tr.querySelector('img')) return;

    const card = document.createElement('div');
    card.className = 'tc-card';

    // first td — extract and optimise the picture
    const picCell = tds[0];
    const img = picCell && picCell.querySelector('img');
    if (img) {
      const imgWrap = document.createElement('div');
      imgWrap.className = 'tc-img';
      const optimised = createOptimizedPicture(img.src, img.alt || '', false, [{ width: '750' }]);
      imgWrap.appendChild(optimised);
      card.appendChild(imgWrap);
    }

    // second td — heading and description text
    const textCell = tds[1] || tds[0];
    if (textCell) {
      const body = document.createElement('div');
      body.className = 'tc-body';
      [...textCell.children].forEach((el) => {
        if (/^H[1-6]$/.test(el.tagName)) {
          const h = document.createElement(el.tagName.toLowerCase());
          h.className = 'tc-title';
          h.textContent = el.textContent.trim();
          body.appendChild(h);
        } else if (el.tagName === 'P' && !el.querySelector('picture, img')) {
          const p = document.createElement('p');
          p.className = 'tc-desc';
          p.textContent = el.textContent.trim();
          body.appendChild(p);
        }
      });
      card.appendChild(body);
    }

    grid.appendChild(card);
  });

  return grid;
}

export default async function decorate(block) {
  const tablist = document.createElement('div');
  tablist.className = 'tabs-list';
  tablist.setAttribute('role', 'tablist');

  const tabs = [...block.children].map((child) => child.firstElementChild);

  tabs.forEach((tab, i) => {
    const id = toClassName(tab.textContent);
    const tabpanel = block.children[i];

    tabpanel.className = 'tabs-panel';
    tabpanel.id = `tabpanel-${id}`;
    tabpanel.setAttribute('aria-hidden', !!i);
    tabpanel.setAttribute('aria-labelledby', `tab-${id}`);
    tabpanel.setAttribute('role', 'tabpanel');

    // if panel contains a table, it is card content — convert it
    if (tabpanel.querySelector('table')) {
      const grid = buildCardGrid(tabpanel);
      if (grid && grid.children.length) {
        // remove everything inside the content cell and replace with grid
        const contentCell = tabpanel.children[1] || tabpanel;
        contentCell.innerHTML = '';
        contentCell.appendChild(grid);
      }
    }

    const button = document.createElement('button');
    button.className = 'tabs-tab';
    button.id = `tab-${id}`;
    button.innerHTML = tab.innerHTML;
    button.setAttribute('aria-controls', `tabpanel-${id}`);
    button.setAttribute('aria-selected', !i);
    button.setAttribute('role', 'tab');
    button.setAttribute('type', 'button');
    button.addEventListener('click', () => {
      block.querySelectorAll('[role=tabpanel]').forEach((panel) => {
        panel.setAttribute('aria-hidden', true);
      });
      tablist.querySelectorAll('button').forEach((btn) => {
        btn.setAttribute('aria-selected', false);
      });
      tabpanel.setAttribute('aria-hidden', false);
      button.setAttribute('aria-selected', true);
    });
    tablist.append(button);
    tab.remove();
  });

  block.prepend(tablist);
}