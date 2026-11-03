// Extracted from the original single-file CMD playground.
export function createSidebar(ctx) {
  const { commandCatalog, commandDetailEl, commandDetailPanelEl, commandListEl, commandSidebarEl, displayCommandName, mainContentEl, menuToggleEl, state } = ctx;
  const renderCommandDetail = (...args) => ctx.renderCommandDetail(...args);
  const resetInputNavigation = (...args) => ctx.resetInputNavigation(...args);
      function setMobileMenuOpen(isOpen) {
        commandSidebarEl.classList.toggle('menu-open', isOpen);
        menuToggleEl.setAttribute('aria-expanded', String(isOpen));
        menuToggleEl.setAttribute('aria-label', isOpen ? 'コマンド一覧を閉じる' : 'コマンド一覧を開く');
      }

      menuToggleEl.addEventListener('click', () => {
        const opening = !commandSidebarEl.classList.contains('menu-open');
        setMobileMenuOpen(opening);
        // メニューを閉じる操作では、以前選択したコマンドの詳細も隠す。
        if (!opening) commandDetailPanelEl.classList.remove('mobile-detail-visible');
      });
      const INTRO_PAGE = 'intro';

      function showIntroPage() {
        mainContentEl.classList.add('intro-mode');
        document.querySelectorAll('.command-link').forEach(button => {
          button.classList.toggle('active', button.dataset.commandName === INTRO_PAGE);
        });
        commandDetailEl.dataset.commandName = INTRO_PAGE;
        commandDetailEl.innerHTML = `
          <div class="intro-content">
            <span class="badge">はじめに</span>
            <h2>そもそもコマンドプロンプトとは？</h2>
            <p><strong>コマンドプロンプト（Command Prompt）</strong>は、Windowsに標準搭載されている、文字を入力してパソコンを操作するためのツールです。「CMD（シーエムディー）」とも呼ばれます。</p>
            <p>普段はエクスプローラーをマウスで操作してフォルダを開いたりファイルをコピーしたりしますが、コマンドプロンプトでは同じような操作を<strong>コマンド（命令文）</strong>で実行できます。</p>

            <h3>何ができるの？</h3>
            <p>フォルダの移動や作成、ファイルの一覧表示・コピー・削除、ネットワークの状態確認などができます。また、複数の命令をまとめた <strong>.bat ファイル（バッチファイル）</strong>を作ると、繰り返しの作業を自動化できます。</p>

            <h3>コマンドの入力例</h3>
            <div class="intro-example">C:\WORK&gt; dir</div>
            <p><code> C:\WORK&gt; </code> は現在の作業場所を示す表示（プロンプト）です。入力するのは <strong>dir</strong> の部分で、Enterキーを押すと現在のフォルダ内のファイルやフォルダを一覧表示します。</p>
            <div class="intro-example">C:\WORK&gt; mkdir sample</div>
            <p>こちらは <strong>sample</strong> という名前のフォルダを作成する例です。</p>

            <h3>どうやって起動するの？</h3>
            <p>Windowsのスタートメニューで「cmd」または「コマンドプロンプト」と検索して起動できます。<strong>Win + R</strong> を押して「cmd」と入力し、Enterキーを押す方法もあります。</p>

            <h3>PowerShellとは何が違う？</h3>
            <p>コマンドプロンプトは従来のWindowsコマンドやバッチファイルを扱うための環境です。PowerShellは、より高度な自動化や管理作業向けに設計された別のコマンド操作環境です。同じコマンドが使える場合もありますが、構文や機能は同一ではありません。</p>

            <h3>このサイトの使い方</h3>
            <p>左のメニューから <strong>mkdir</strong> や <strong>dir</strong> などを選ぶと、コマンドの意味・使い方・実行例を確認できます。実行例は「コピー」ボタンでコピーできます。また、通常のコマンドページには疑似エクスプローラと入力欄があり、コマンドを試せます。</p>
            <p class="intro-note">※ このサイトのターミナルは学習用のシミュレータです。パソコンの実際のファイルやネットワークは操作しません。実際のWindowsコマンドと動作が異なる場合があります。</p>
          </div>`;
        commandDetailPanelEl.classList.add('mobile-detail-visible');
        setMobileMenuOpen(false);
      }

      function initCommandList() {
        const introLink = document.createElement('button');
        introLink.type = 'button';
        introLink.className = 'command-link';
        introLink.dataset.commandName = INTRO_PAGE;
        introLink.innerHTML = '<span class="command-name">そもそもコマンドプロンプトとは？</span><span class="command-summary">初めての方向け・基本解説</span>';
        introLink.addEventListener('click', showIntroPage);
        commandListEl.appendChild(introLink);
        Object.values(commandCatalog).forEach((command) => {
          const link = document.createElement('button');
          link.type = 'button';
          link.className = 'command-link';
          link.dataset.commandName = command.name;
          link.innerHTML = `
            <span class="command-name">${command.name === 'redirect' ? 'リダイレクト' : command.name === 'pipe' ? 'パイプ' : displayCommandName(command.name)}</span>
            <span class="command-summary">${command.summary}</span>
          `;
          link.addEventListener('click', () => {
            state.history = [];
            resetInputNavigation(true);
            renderCommandDetail(command.name);
            // 選択時だけ詳細を表示し、一覧を閉じる（PCでは常時表示）。
            commandDetailPanelEl.classList.add('mobile-detail-visible');
            setMobileMenuOpen(false);
          });
          commandListEl.appendChild(link);
        });
      }
  return { setMobileMenuOpen, showIntroPage, initCommandList };
}
