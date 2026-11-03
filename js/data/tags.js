// 固定の学習用カテゴリ。外部入力からタグやCSSクラスを生成しない。
export const TAGS = Object.freeze({
  general: { label: 'Windows CMD', className: 'tag-general' },
  file: { label: 'ファイル操作', className: 'tag-file' },
  directory: { label: 'ディレクトリ', className: 'tag-directory' },
  network: { label: 'ネットワーク', className: 'tag-network' },
  search: { label: '検索', className: 'tag-search' },
  system: { label: 'システム情報', className: 'tag-system' },
  process: { label: 'プロセス', className: 'tag-process' },
  output: { label: '入出力', className: 'tag-output' },
  comparison: { label: '比較', className: 'tag-comparison' }
});

const CLASSIFICATIONS = Object.freeze({
  mkdir: ['file', 'directory'],
  dir: ['file', 'directory'],
  cd: ['directory'],
  echo: ['output'],
  cls: ['output'],
  del: ['file'],
  rmdir: ['file', 'directory'],
  copy: ['file'],
  xcopy: ['file', 'directory'],
  robocopy: ['file', 'directory'],
  move: ['file', 'directory'],
  ren: ['file', 'directory'],
  tree: ['directory', 'output'],
  redirect: ['file', 'output'],
  pipe: ['output'],
  ping: ['network'],
  ipconfig: ['network', 'system'],
  nslookup: ['network', 'search'],
  type: ['file', 'output'],
  find: ['search', 'file'],
  findstr: ['search', 'file'],
  where: ['search', 'file'],
  whoami: ['system'],
  hostname: ['system', 'network'],
  ver: ['system'],
  date: ['system'],
  time: ['system'],
  systeminfo: ['system'],
  tracert: ['network'],
  pathping: ['network'],
  netstat: ['network', 'system'],
  fc: ['comparison', 'file'],
  tasklist: ['process', 'system'],
  taskkill: ['process']
});

export function getCommandTags(commandName) {
  const assigned = CLASSIFICATIONS[commandName];
  return assigned?.length ? assigned : ['general'];
}

// ユーザーが選択するタグは事前定義されたIDに限定する。
export function filterCommandNames(commandNames, selectedTags, mode = 'include') {
  const selected = new Set([...selectedTags].filter(id => Object.hasOwn(TAGS, id)));
  if (selected.size === 0) return [...commandNames];
  return commandNames.filter(name => {
    const hasMatch = getCommandTags(name).some(tag => selected.has(tag));
    return mode === 'exclude' ? !hasMatch : hasMatch;
  });
}
