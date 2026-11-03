import { getLanguage } from '../core/language.js';

export const UI = Object.freeze({
  ja: {
    menuOpen:'ページメニューを開く',menuClose:'ページメニューを閉じる', batch:'バッチファイル編',settings:'設定',contact:'お問い合わせ', back:'← CMD編に戻る',
    settingsSubtitle:'CMDプレイグラウンドの動作設定', explorer:'疑似エクスプローラー', resetConfirm:'リセット時に確認ダイアログを表示する',
    resetDesc:'ONの場合、リセット実行前に確認します。キャンセルするとデータは初期化されません。',
    cookieNote:'初期値はONです。設定はセッションCookieに保存されます（ブラウザのセッション復元によって残る場合があります）。',
    language:'表示言語', languageDesc:'画面の表示言語を選択します。選択しただけでは変更されず、「適用」を押すと反映されます。',
    apply:'適用', applied:'表示言語を適用しました。', already:'現在の言語が設定されています。', saveFailed:'Cookieに保存できませんでした。ブラウザのCookie設定を確認してください。',
    resetOn:'確認ダイアログ：ON（表示あり）',resetOff:'確認ダイアログ：OFF（表示なし）', savedOn:'保存しました：ON（表示あり）',savedOff:'保存しました：OFF（表示なし）',
    searching:'検索と絞り込み',searchPlaceholder:'コマンド名を検索（部分一致）',clearSearch:'検索文字列をクリア', search:'検索',filter:'絞り込み',
    commandDetail:'コマンド詳細', virtualExplorer:'擬似エクスプローラ',reset:'↻ リセット', terminalPlaceholder:'コマンドを入力',run:'実行',
    filterTitle:'コマンドの絞り込み', filterDesc:'タグを複数選択できます。通常検索はOR条件、除外検索では選択タグのいずれかを含むコマンドを除外します。',
    filterMode:'検索方式（同時指定不可）',include:'一致するコマンドを表示',exclude:'選択タグを除外',chooseTags:'タグを選択',clearFilter:'フィルター解除',applyClose:'適用して閉じる',close:'閉じる',
    filterCount:(a,b)=>`対象: ${a} / ${b} 項目`, filterStatus:(mode,n)=>`絞り込み中（${mode==='exclude'?'除外':'表示'}：${n}タグ）`,
    searchResults:'検索結果',searchNoMatch:(q)=>`「${q}」に一致するコマンドが見つかりませんでした。絞り込み条件も確認してください。`,
    noResults:'一致するコマンドがありません',noResultsDesc:'検索文字列とタグの絞り込み条件に一致するコマンドがありません。条件を変更するか解除してください。',
    introTitle:'そもそもコマンドプロンプトとは？',introSummary:'初めての方向け・基本解説',
    options:'オプション',noOptions:'オプションなし',examples:'実行例',scenarios:'学習用シナリオ',origin:'名前の由来：',copy:'コピー',copied:'コピー済み',copyFailed:'コピー失敗',
    ready:'Windows CMD シミュレータを起動しました。',resetQuestion:'疑似エクスプローラーを初期状態に戻します。作成・変更した仮想ファイルやコマンド履歴は失われます。よろしいですか？',
    batchStatus:'準備中',batchDesc:'バッチファイル編は現在準備中です。今後、コマンド入力・制御構文の学習機能を追加します。'
  },
  en: {
    menuOpen:'Open page menu',menuClose:'Close page menu',batch:'Batch File Tutorial',settings:'Settings',contact:'Contact the developer',back:'← Back to CMD',
    settingsSubtitle:'CMD playground preferences', explorer:'Virtual File Explorer', resetConfirm:'Show a confirmation dialog before resetting',
    resetDesc:'When enabled, confirm before resetting. Canceling the dialog preserves the virtual files.',
    cookieNote:'Confirmation defaults to ON. Settings are stored in session cookies (browser session restore may retain them).',
    language:'Display language', languageDesc:'Choose a display language. The selection is not applied until you click Apply.',
    apply:'Apply',applied:'Display language applied.',already:'This language is already active.',saveFailed:'Could not save the cookie. Check your browser cookie settings.',
    resetOn:'Reset confirmation: ON',resetOff:'Reset confirmation: OFF',savedOn:'Saved: ON',savedOff:'Saved: OFF',
    searching:'Search and filter',searchPlaceholder:'Search command names (partial match)',clearSearch:'Clear search text',search:'Search',filter:'Filter',
    commandDetail:'Command details',virtualExplorer:'Virtual File Explorer',reset:'↻ Reset',terminalPlaceholder:'Enter a command',run:'Run',
    filterTitle:'Filter commands',filterDesc:'Select multiple tags. Include mode matches ANY selected tag; exclude mode hides commands with ANY selected tag.',
    filterMode:'Filter mode (choose one)',include:'Include matching commands',exclude:'Exclude selected tags',chooseTags:'Select tags',clearFilter:'Clear filters',applyClose:'Apply and close',close:'Close',
    filterCount:(a,b)=>`Matches: ${a} / ${b}`,filterStatus:(mode,n)=>`Filtering (${mode==='exclude'?'exclude':'include'}: ${n} ${n===1?'tag':'tags'})`,
    searchResults:'Search results',searchNoMatch:(q)=>`No commands match “${q}”. Check your tag filters as well.`,
    noResults:'No matching commands',noResultsDesc:'No commands match the search text and selected tags. Change or clear the criteria.',
    introTitle:'What is Command Prompt?',introSummary:'Introduction and fundamentals',
    options:'Options',noOptions:'No options',examples:'Examples',scenarios:'Practice scenarios',origin:'Name origin: ',copy:'Copy',copied:'Copied',copyFailed:'Copy failed',
    ready:'Windows CMD simulator started.',resetQuestion:'Reset the virtual File Explorer? Created or changed virtual files and command history will be lost.',
    batchStatus:'Coming soon',batchDesc:'The batch-file tutorial is under development. Editing and control-flow lessons will be added later.'
  }
});
export const TAG_LABELS_EN = Object.freeze({general:'Windows CMD',file:'File operations',directory:'Directories',network:'Networking',search:'Search',system:'System information',process:'Processes',output:'Input / Output',comparison:'Comparison'});
export function t(key, lang = getLanguage()) { return UI[lang]?.[key] ?? UI.ja[key] ?? key; }
export function tagText(tag, lang=getLanguage(), japaneseLabel='') { return lang==='en' ? (TAG_LABELS_EN[tag] ?? japaneseLabel) : japaneseLabel; }

// Translation for summary and core purpose. Untranslated extended documentation
// remains in Japanese rather than silently dropping technical details.
export const COMMAND_EN = Object.freeze({
 mkdir:['Create a directory','Creates a directory in the virtual filesystem. No folders are created on your real computer.'],
 dir:['List directory contents','Lists files and directories in the current location.'],
 cd:['Change directory','Displays or changes the current path. Use cd /d to switch drives and directories together.'],
 echo:['Display text','Prints a message to the terminal.'],
 cls:['Clear screen','Clears the terminal output history.'],
 del:['Delete files','Deletes virtual files. erase is an alias; /q skips confirmation.'],
 rmdir:['Remove directories','Removes a directory. The /s flag also removes its contents. rd is an alias.'],
 copy:['Copy files','Copies files; when the destination is a directory, the source name is preserved. Several real CMD options are not simulated.'],
 xcopy:['Copy files and directories','Copies files and directories, including basic recursive copy options.'],
 robocopy:['Robust directory copy','Simulates directory copying and mirroring. /mir removes extraneous files from the destination.'],
 move:['Move files and directories','Moves or renames virtual files and directories.'],
 ren:['Rename a file or directory','Renames a file or directory within the same location. rename is an alias.'],
 tree:['Display directory tree','Displays the directory hierarchy as text.'],
 redirect:['Redirect output to a file','Writes standard output to a virtual file. > overwrites, while >> appends. This is a shell operator rather than a standalone command.'],
 pipe:['Pipe command output','Passes output from the command on the left to a command on the right. Supports selected find, findstr, and type examples.'],
 ping:['Test connectivity (simulated)','Simulates ICMP echo responses using fixed learning scenarios. No real network requests are made.'],
 ipconfig:['Show network configuration (simulated)','Displays fictional TCP/IP configuration for learning, not the real device settings.'],
 nslookup:['Look up DNS (simulated)','Shows simulated DNS resolution without contacting a real DNS server.'],
 type:['Display file contents','Prints the contents of virtual text files. Useful with pipes and redirection.'],
 find:['Find text in files','Finds matching lines in virtual files. Windows find does not support regular expressions.'],
 findstr:['Search text and patterns','Searches virtual files with a simplified regular expression mode. /l enables literal matching.'],
 where:['Locate matching files','Searches virtual file paths, optionally recursively with /r.'],
 help:['Display help','Lists available commands and basic usage information.'],
 whoami:['Show current user (simulated)','Displays a fictional username and optional simulated user ID.'],
 hostname:['Show computer name (simulated)','Displays a fictional host name.'],
 ver:['Show operating system version (simulated)','Displays a fictional Windows version string.'],
 date:['Show the date','Displays the date. Changing the system date is not supported.'],
 time:['Show the time','Displays the time. Changing the system time is not supported.'],
 systeminfo:['Show system information (simulated)','Displays sample OS and hardware information for a fictional computer.'],
 tracert:['Trace network route (simulated)','Displays a fictional network route with sample hop latencies.'],
 pathping:['Analyze packet loss (simulated)','Simulates network hops and packet loss along a route.'],
 netstat:['Show network connections (simulated)','Displays simulated TCP and UDP connections and listening ports.'],
 fc:['Compare files','Compares the contents of two virtual files.'],
 tasklist:['List processes (simulated)','Lists fictional processes and process IDs.'],
 taskkill:['Terminate processes (simulated)','Removes a simulated process from the virtual process list; no real process is affected.']
});
export function commandSummary(name, original, lang=getLanguage()) { return lang==='en' ? (COMMAND_EN[name]?.[0] ?? original) : original; }
export function commandDescription(name, original, lang=getLanguage()) { return lang==='en' ? (COMMAND_EN[name]?.[1] ?? original) : original; }
export function localizeStatic(doc=document, lang=getLanguage()) {
  doc.documentElement.lang = lang;
  for (const element of doc.querySelectorAll('[data-i18n]')) element.textContent = t(element.dataset.i18n, lang);
  for (const element of doc.querySelectorAll('[data-i18n-placeholder]')) element.placeholder = t(element.dataset.i18nPlaceholder,lang);
  for (const element of doc.querySelectorAll('[data-i18n-aria]')) element.setAttribute('aria-label',t(element.dataset.i18nAria,lang));
}
