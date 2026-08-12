(function() {
  function setupPreviews() {
    const previewLinks = document.querySelectorAll('[data-link-detail], .featured-link > .link-row');

    previewLinks.forEach(function(link, index) {
      if (link.classList.contains('link-row--preview')) {
        return;
      }

      const sourceNodes = link.parentElement && link.parentElement.classList.contains('featured-link')
        ? Array.from(link.parentElement.querySelectorAll(':scope > .featured-link__text, :scope > .featured-link__note'))
        : [];
      const detailLines = sourceNodes.length
        ? sourceNodes.map(function(node) { return node.textContent.trim(); })
        : [link.getAttribute('data-link-detail') || ''];

      if (!detailLines.some(Boolean)) {
        return;
      }

      const detail = document.createElement('span');
      const detailId = 'link-preview-' + index;

      detail.className = 'link-row__detail';
      detail.id = detailId;
      detailLines.filter(Boolean).forEach(function(line, lineIndex) {
        const detailLine = document.createElement('span');
        detailLine.className = 'link-row__detail-line';
        if (lineIndex > 0) {
          detailLine.classList.add('link-row__detail-line--secondary');
        }
        detailLine.textContent = line;
        detail.appendChild(detailLine);
      });

      link.classList.add('link-row--preview');
      link.setAttribute('aria-describedby', detailId);
      link.appendChild(detail);
      sourceNodes.forEach(function(node) { node.remove(); });
    });
  }

  document.addEventListener('DOMContentLoaded', setupPreviews);
  window.addEventListener('bero:page-enter', setupPreviews);
})();
