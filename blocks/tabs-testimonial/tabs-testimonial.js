/**
 * Decorates the tabs-testimonial block.
 * Each row is [menu-label, panel-content]. Renders an accessible tabbed
 * interface: panels stacked in a content area, menu buttons below as a tablist.
 * @param {Element} block The tabs-testimonial block element
 */
export default function decorate(block) {
  const rows = [...block.children];

  const content = document.createElement('div');
  content.className = 'tabs-content';

  const menu = document.createElement('div');
  menu.className = 'tab-menu';
  menu.setAttribute('role', 'tablist');
  menu.setAttribute('aria-label', 'Testimonials');

  const panels = [];
  const buttons = [];

  rows.forEach((row, i) => {
    const cells = [...row.children];
    const menuCell = cells[0];
    const panelCell = cells[1];
    if (!menuCell || !panelCell) return;

    // Panel
    const panel = document.createElement('div');
    panel.className = 'tab-pane';
    panel.id = `testimonial-panel-${i}`;
    panel.setAttribute('role', 'tabpanel');
    panel.setAttribute('aria-labelledby', `testimonial-tab-${i}`);
    while (panelCell.firstChild) panel.append(panelCell.firstChild);
    if (i !== 0) panel.hidden = true;
    else panel.classList.add('is-active');
    panels.push(panel);
    content.append(panel);

    // Menu button
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'tab-menu-link';
    btn.id = `testimonial-tab-${i}`;
    btn.setAttribute('role', 'tab');
    btn.setAttribute('aria-controls', `testimonial-panel-${i}`);
    btn.setAttribute('aria-selected', i === 0 ? 'true' : 'false');
    btn.tabIndex = i === 0 ? 0 : -1;
    if (i === 0) btn.classList.add('is-active');
    while (menuCell.firstChild) btn.append(menuCell.firstChild);
    buttons.push(btn);
    menu.append(btn);
  });

  const activate = (index) => {
    buttons.forEach((b, i) => {
      const selected = i === index;
      b.classList.toggle('is-active', selected);
      b.setAttribute('aria-selected', selected ? 'true' : 'false');
      b.tabIndex = selected ? 0 : -1;
      panels[i].hidden = !selected;
      panels[i].classList.toggle('is-active', selected);
    });
  };

  buttons.forEach((btn, i) => {
    btn.addEventListener('click', () => activate(i));
    btn.addEventListener('keydown', (e) => {
      let next;
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') next = (i + 1) % buttons.length;
      else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') next = (i - 1 + buttons.length) % buttons.length;
      if (next !== undefined) {
        e.preventDefault();
        activate(next);
        buttons[next].focus();
      }
    });
  });

  block.replaceChildren(content, menu);
}
