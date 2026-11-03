import { commandCatalog } from './data/commands.js';
import { commandNameOrigins } from './data/origins.js';
import { initialState, commandAliases, displayCommandName } from './core/state.js';
import { escapeHtml } from './core/html.js';
import { createParser } from './core/parser.js';
import { createFilesystem } from './core/filesystem.js';
import { createExecutor } from './core/executor.js';
import { createSidebar } from './ui/sidebar.js';
import { createDetail } from './ui/detail.js';
import { createExplorer } from './ui/explorer.js';
import { createTerminal } from './ui/terminal.js';
import { createSearch } from './ui/search.js';

// Shared application context: dependencies are explicit and testable.
// Commands operate solely on the virtual filesystem, not the host PC.
const ctx = {
  commandCatalog, commandNameOrigins, commandAliases, displayCommandName, escapeHtml,
  initialState, state: initialState(),
  commandListEl: document.getElementById('commandList'),
  commandSidebarEl: document.getElementById('commandSidebar'),
  menuToggleEl: document.getElementById('menuToggle'),
  commandDetailPanelEl: document.getElementById('commandDetailPanel'),
  commandDetailEl: document.getElementById('commandDetail'),
  terminalOutputEl: document.getElementById('terminalOutput'),
  terminalInputEl: document.getElementById('terminalInput'),
  explorerTreeEl: document.getElementById('explorerTree'),
  currentPathEl: document.getElementById('currentPath'),
  terminalFormEl: document.getElementById('terminalForm'),
  mainContentEl: document.getElementById('mainContent'),
  commandSearchFormEl: document.getElementById('commandSearchForm'),
  commandSearchInputEl: document.getElementById('commandSearchInput'),
  commandSearchClearEl: document.getElementById('commandSearchClear'),
  activeFilterIndicatorEl: document.getElementById('activeFilterIndicator'),
  searchNoticeDialogEl: document.getElementById('searchNoticeDialog'),
  searchNoticeTextEl: document.getElementById('searchNoticeText'),
  searchNoticeCloseEl: document.getElementById('searchNoticeClose'),
  searchNoticeDoneEl: document.getElementById('searchNoticeDone'),
};
Object.assign(ctx, createParser(ctx));
Object.assign(ctx, createFilesystem(ctx));
Object.assign(ctx, createExecutor(ctx));
Object.assign(ctx, createSidebar(ctx));
Object.assign(ctx, createDetail(ctx));
Object.assign(ctx, createExplorer(ctx));
Object.assign(ctx, createTerminal(ctx));
Object.assign(ctx, createSearch(ctx));


const initCommandList = (...args) => ctx.initCommandList(...args);
const renderExplorer = (...args) => ctx.renderExplorer(...args);
const showIntroPage = (...args) => ctx.showIntroPage(...args);
const writeTerminalLine = (...args) => ctx.writeTerminalLine(...args);
const initCommandSearch = (...args) => ctx.initCommandSearch(...args);

const state = ctx.state;
function init() {
        initCommandList();
        document.dispatchEvent(new CustomEvent('cmdpg:commands-ready', { detail: { commandNames: Object.keys(commandCatalog) } }));
        renderExplorer();
        showIntroPage();
        initCommandSearch();
        writeTerminalLine('Windows CMD シミュレータを起動しました。');
        writeTerminalLine('例: echo Hello > hello.txt / type hello.txt | find \"Hello\" / ping localhost / find "ERROR" notes.txt / findstr /s "INFO" *.txt / where /r C:\\WORK *.txt');
        writeTerminalLine('');
        writeTerminalLine(`${state.currentPath}>`);
      }



init();
