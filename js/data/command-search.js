import { filterCommandNames } from './tags.js';

export function matchesCommandQuery(name, query, displayCommandName) {
  const normalized = String(query ?? '').trim().toLocaleLowerCase();
  if (!normalized) return true;
  // Search command titles and aliases only, not descriptions or tag text.
  const title = name === 'intro'
    ? 'そもそもコマンドプロンプトとは？'
    : displayCommandName(name);
  return title.toLocaleLowerCase().includes(normalized);
}

// Search term AND tag filter; multiple included tags use OR,
// while multiple excluded tags remove anything matching at least one tag.
export function filterVisibleCommands(names, query, selectedTags, mode, displayCommandName) {
  const byTags = filterCommandNames(names, selectedTags, mode);
  return byTags.filter(name => matchesCommandQuery(name, query, displayCommandName));
}
