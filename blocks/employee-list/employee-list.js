const PAGE_SIZE = 10;
const DEFAULT_SOURCE = '/employees.json';
const DEFAULT_LOAD_MORE_LABEL = 'Load more';

function normalizeKey(value = '') {
  return value.toLowerCase().replace(/[^a-z0-9]/g, '');
}

async function getLoadMoreLabel() {
  try {
    const response = await fetch('/placeholders.json');
    if (!response.ok) throw new Error(`Placeholder request failed: ${response.status}`);

    const { data = [] } = await response.json();
    const placeholder = data.find((entry) => {
      const key = entry.key ?? entry.Key ?? entry.name ?? entry.Name;
      return normalizeKey(key) === 'loadmore';
    });

    return placeholder?.text
      ?? placeholder?.Text
      ?? placeholder?.value
      ?? placeholder?.Value
      ?? DEFAULT_LOAD_MORE_LABEL;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.warn('Could not load the employee list placeholder.', error);
    return DEFAULT_LOAD_MORE_LABEL;
  }
}

function getSource(block) {
  const link = block.querySelector('a[href]');
  const authoredSource = link?.href || block.textContent.trim();
  const source = authoredSource || DEFAULT_SOURCE;
  return new URL(source, window.location.href);
}

function createCell(tagName, text, label) {
  const cell = document.createElement(tagName);
  cell.textContent = text;
  if (label) cell.dataset.label = label;
  return cell;
}

function createEmployeeRow(employee) {
  const row = document.createElement('tr');
  const fields = [
    ['Name', employee.Name],
    ['Department', employee.Department],
    ['Experience', employee.Experience],
    ['City', employee.City],
  ];

  fields.forEach(([label, value]) => {
    row.append(createCell('td', value ?? '', label));
  });
  return row;
}

function createTable() {
  const table = document.createElement('table');
  table.className = 'employee-list-table';

  const caption = document.createElement('caption');
  caption.textContent = 'Employee directory';
  table.append(caption);

  const head = document.createElement('thead');
  const headerRow = document.createElement('tr');
  ['Name', 'Department', 'Experience', 'City'].forEach((heading) => {
    const cell = createCell('th', heading);
    cell.scope = 'col';
    headerRow.append(cell);
  });
  head.append(headerRow);

  const body = document.createElement('tbody');
  table.append(head, body);
  return { table, body };
}

/**
 * Loads employees from an authored JSON sheet and renders them ten at a time.
 * @param {Element} block The employee list block.
 */
export default async function decorate(block) {
  const source = getSource(block);
  block.replaceChildren();
  block.setAttribute('aria-busy', 'true');

  try {
    const [employeeResponse, loadMoreLabel] = await Promise.all([
      fetch(source),
      getLoadMoreLabel(),
    ]);
    if (!employeeResponse.ok) {
      throw new Error(`Employee request failed: ${employeeResponse.status}`);
    }

    const { data: employees = [] } = await employeeResponse.json();
    const { table, body } = createTable();
    const status = document.createElement('p');
    status.className = 'employee-list-status';
    status.setAttribute('aria-live', 'polite');

    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'button primary employee-list-load-more';
    button.textContent = loadMoreLabel;

    let visibleCount = 0;
    const renderNextPage = () => {
      const nextEmployees = employees.slice(visibleCount, visibleCount + PAGE_SIZE);
      const fragment = document.createDocumentFragment();
      nextEmployees.forEach((employee) => fragment.append(createEmployeeRow(employee)));
      body.append(fragment);
      visibleCount += nextEmployees.length;
      status.textContent = `Showing ${visibleCount} of ${employees.length} employees`;
      button.hidden = visibleCount >= employees.length;
    };

    button.addEventListener('click', renderNextPage);
    block.append(table, status, button);

    if (employees.length) renderNextPage();
    else {
      status.textContent = 'No employees are currently available.';
      button.hidden = true;
    }
  } catch (error) {
    const message = document.createElement('p');
    message.className = 'employee-list-error';
    message.setAttribute('role', 'alert');
    message.textContent = 'The employee directory is temporarily unavailable.';
    block.append(message);
    // eslint-disable-next-line no-console
    console.error('Employee list failed to load.', error);
  } finally {
    block.removeAttribute('aria-busy');
  }
}
