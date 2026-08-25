/**
 * Decorates the hero and prioritizes its above-the-fold image.
 * @param {Element} block The hero block element
 */
export default function decorate(block) {
  const image = block.querySelector('picture img');
  if (!image) return;

  image.loading = 'eager';
  image.fetchPriority = 'high';
}
