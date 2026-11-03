      // ブラウザ内だけに保持する、検索学習用の仮想ファイル本文。
      const INITIAL_CONTENTS = {
        'c:\\work\\notes.txt': 'Windows CMD memo\nERROR: sample failure\nINFO: ready',
        'c:\\work\\docs\\spec.txt': 'Specification\nINFO: document\nWARN: review required'
      };
      const INITIAL_FS = {
        'C:\\': ['WORK'],
        'C:\\WORK': ['docs', 'notes.txt', 'project'],
        'C:\\WORK\\docs': ['spec.txt'],
        'C:\\WORK\\project': ['src'],
        'C:\\WORK\\project\\src': [],
        'D:\\': ['DATA'],
        'D:\\DATA': []
      };
      function initialState() {
        return {
          currentPath: 'C:\\WORK',
          drivePaths: { C: 'C:\\WORK', D: 'D:\\' },
          fs: structuredClone(INITIAL_FS),
          contents: structuredClone(INITIAL_CONTENTS),
          processes: [{name:"explorer.exe",pid:1100,protected:true},{name:"notepad.exe",pid:2400},{name:"cmd.exe",pid:3100,protected:true},{name:"chrome.exe",pid:4200}],
          history: []
        };
      }

      const commandAliases = { md: 'mkdir', chdir: 'cd', erase: 'del', rd: 'rmdir', rename: 'ren' };
      // 一覧と詳細画面は同じ別名定義からタイトルを生成する。
      function displayCommandName(commandName) {
        const aliases = Object.keys(commandAliases).filter(alias => commandAliases[alias] === commandName);
        return aliases.length ? `${commandName} (${aliases.join(', ')})` : commandName;
      }


export { initialState, commandAliases, displayCommandName };
