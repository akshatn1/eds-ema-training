/**
 * Decorates the accordion-faq block.
 * Each row is [question, answer] and becomes a native <details>/<summary>
 * disclosure so it is accessible and keyboard-operable by default.
 * @param {Element} block The accordion-faq block element
 */
export default function decorate(block) {
  [...block.children].forEach((row) => {
    const cells = [...row.children];
    const question = cells[0];
    const answer = cells[1];
    if (!question || !answer) return;

    const details = document.createElement('details');
    details.className = 'faq-item';

    const summary = document.createElement('summary');
    summary.className = 'faq-question';
    const label = document.createElement('span');
    label.innerHTML = question.innerHTML;
    summary.append(label);

    answer.className = 'faq-answer';

    details.append(summary, answer);
    row.replaceWith(details);
  });
}
