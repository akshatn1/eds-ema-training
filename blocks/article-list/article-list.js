const DEFAULT_SOURCE = '/query-index.json?limit=1000';
const EXCLUDED_PATHS = new Set(['/footer', '/nav']);
const EXCLUDED_PREFIXES = ['/drafts/', '/fragments/', '/docs/library/blocks/'];

function getSource(block) {
  const link = block.querySelector('a[href]');
  return new URL(link?.href || DEFAULT_SOURCE, window.location.href);
}

function isListablePage({ path = '' }) {
  return path
    && !EXCLUDED_PATHS.has(path)
    && !EXCLUDED_PREFIXES.some((prefix) => path.startsWith(prefix));
}

function createImage(page) {
  if (!page.image || /\/default-meta-image\./.test(page.image)) return null;

  const wrapper = document.createElement('div');
  wrapper.className = 'article-list-card-image';

  const image = document.createElement('img');
  image.src = page.image;
  image.alt = '';
  image.loading = 'lazy';
  image.width = 640;
  image.height = 360;
  image.addEventListener('error', () => wrapper.remove());
  wrapper.append(image);
  return wrapper;
}

function createCard(page) {
  const item = document.createElement('li');
  item.className = 'article-list-card';

  const link = document.createElement('a');
  link.href = page.path;
  link.className = 'article-list-card-link';
  link.setAttribute('aria-label', page.title || page.path);

  const image = createImage(page);
  if (image) link.append(image);

  const body = document.createElement('div');
  body.className = 'article-list-card-body';

  const title = document.createElement('h2');
  title.className = 'article-list-card-title';
  title.textContent = page.title || page.path;
  body.append(title);

  if (page.description) {
    const description = document.createElement('p');
    description.className = 'article-list-card-description';
    description.textContent = page.description;
    body.append(description);
  }

  const path = document.createElement('span');
  path.className = 'article-list-card-path';
  path.textContent = page.path;
  body.append(path);

  link.append(body);
  item.append(link);
  return item;
}

/**
 * Loads the published query index and renders its pages as a dynamic card list.
 * @param {Element} block The article list block.
 */
export default async function decorate(block) {
  const source = getSource(block);
  block.replaceChildren();
  block.setAttribute('aria-busy', 'true');

  const status = document.createElement('p');
  status.className = 'article-list-status';
  status.setAttribute('role', 'status');
  status.textContent = 'Loading published pages…';
  block.append(status);

  try {
    const response = await fetch(source, { cache: 'no-store' });
    if (!response.ok) throw new Error(`Index request failed: ${response.status}`);

    const { data = [] } = await response.json();
    const currentPath = window.location.pathname.replace(/\.html$/, '') || '/';
    const pages = data
      .filter(isListablePage)
      .filter((page) => page.path !== currentPath)
      .sort((first, second) => (first.title || first.path)
        .localeCompare(second.title || second.path));

    if (!pages.length) {
      status.textContent = 'No published pages are available yet.';
      return;
    }

    const list = document.createElement('ul');
    list.className = 'article-list-grid';
    pages.forEach((page) => list.append(createCard(page)));

    status.textContent = `${pages.length} published ${pages.length === 1 ? 'page' : 'pages'}`;
    block.append(list);
  } catch (error) {
    status.classList.add('article-list-error');
    status.setAttribute('role', 'alert');
    status.textContent = 'Published pages are temporarily unavailable.';
    // eslint-disable-next-line no-console
    console.error('Article list failed to load.', error);
  } finally {
    block.removeAttribute('aria-busy');
  }
}
