// Extracted from the original single-file CMD playground.
export function createExplorer(ctx) {
  const { currentPathEl, escapeHtml, explorerTreeEl, state } = ctx;
      function getCurrentDirectoryEntries() {
        const entries = state.fs[state.currentPath] || [];
        return [...entries].sort((a, b) => a.localeCompare(b, 'ja', { numeric: true }));
      }

      function renderExplorer() {
        explorerTreeEl.innerHTML = ['C:\\', 'D:\\'].map(root => buildTree(root)).join('');
        currentPathEl.textContent = state.currentPath;
      }

      function buildTree(pathName) {
        const entries = state.fs[pathName] || [];
        const nested = entries.map(name => {
          const childPath = pathName.endsWith('\\') ? pathName + name : pathName + '\\' + name;
          const isFolder = Object.prototype.hasOwnProperty.call(state.fs, childPath);
          const current = childPath.toLowerCase() === state.currentPath.toLowerCase();
          const childTree = isFolder ? buildTree(childPath) : '';
          return `<li class="${isFolder ? 'folder' : 'file'}${current ? ' current-directory' : ''}">${escapeHtml(name)}${childTree ? `<ul>${childTree}</ul>` : ''}</li>`;
        }).join('');
        const isDrive = /^[CD]:\\$/.test(pathName);
        if (isDrive) {
          const current = pathName.toLowerCase() === state.currentPath.toLowerCase();
          return `<li class="folder${current ? ' current-directory' : ''}">${escapeHtml(pathName)}<ul>${nested}</ul></li>`;
        }
        return nested;
      }
  return { getCurrentDirectoryEntries, renderExplorer, buildTree };
}
