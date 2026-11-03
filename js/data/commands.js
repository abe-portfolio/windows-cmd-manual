      const commandCatalog = {
        mkdir: {
          name: 'mkdir',
          summary: 'フォルダを作成する',
          syntax: 'mkdir <folderName>',
          description: '指定した名前のフォルダを作成します。実際のファイルシステムには影響せず、擬似エクスプローラ上で表示されます。',
          options: ['現時点ではオプション未対応（Windows CMD の mkdir は -p を必要としません）', '<strong>md</strong> : mkdir の別名'],
          validator: (args) => {
            if (!args.length) return { ok: false, message: 'mkdir には作成先の名前が必要です。例: mkdir hoge' };
            if (args.length !== 1 || args[0].startsWith('-')) return { ok: false, message: '構文エラーです。例: mkdir hoge' };
            return { ok: true };
          }
        },
        dir: {
          name: 'dir',
          summary: '現在のディレクトリの内容を表示する',
          syntax: 'dir [options]',
          description: '現在の場所にあるファイルとフォルダを一覧表示します。',
          options: [
            '<strong>/a</strong> : 隠しファイルも含めて表示',
            '<strong>/w</strong> : 横並びで表示'
          ],
          validator: (args) => {
            const unsupported = args.find((arg) => arg.startsWith('/') && !['/a', '/w'].includes(arg.toLowerCase()));
            if (args.filter(a=>!a.startsWith('/')).length>1) return {ok:false,message:'構文: dir [pattern] [/a] [/w]'};
            if (unsupported) {
              return { ok: false, message: `未対応のオプションです: ${unsupported}` };
            }
            return { ok: true };
          }
        },
        cd: {
          name: 'cd',
          summary: '作業ディレクトリを移動する',
          syntax: 'cd [/d] [drive:][path] / chdir [/d] [drive:][path]',
          description: '現在のパスを表示・変更します。別ドライブへ切り替える場合は cd /d D:\\DATA、または D: と入力します。cd D:\\DATA だけではドライブは切り替わりません。',
          options: [
            '<strong>..</strong> : 親フォルダへ移動',
            '<strong>\\</strong> : 現在のドライブのルートへ移動',
            '<strong>/d</strong> : ドライブも同時に切り替える',
            '<strong>D:</strong> : Dドライブの現在位置へ切り替える',
            '<strong>chdir</strong> : cd と同じコマンド',
            '<strong>¥ / ￥</strong> : 日本語キーボードの円記号もパス区切りとして受付'
          ],
          validator: (args) => {
            if (args.length > 2 || (args.length === 2 && args[0].toLowerCase() !== '/d') || (args.length === 1 && args[0].toLowerCase() === '/d')) return { ok: false, message: '構文エラーです。例: cd / cd hoge / cd /d D:\\DATA' };
            return { ok: true };
          }
        },
        echo: {
          name: 'echo',
          summary: '文字列を表示する',
          syntax: 'echo [message]',
          description: '指定した文字列をターミナルに出力します。',
          options: [
            '<strong>--help</strong> : 利用方法を表示'
          ],
          validator: (args) => {
            if (args[0] === '--help') return { ok: true };
            if (!args.length) return { ok: false, message: 'echo には表示したい文字列が必要です。' };
            return { ok: true };
          }
        },
        cls: {
          name: 'cls',
          summary: '画面をクリアする',
          syntax: 'cls',
          description: 'ターミナル画面に出力されている履歴を消去します。',
          options: [],
          validator: () => ({ ok: true })
        },

        del: { name:'del', summary:'ファイルを削除する', syntax:'del [/q] <file>', description:'ファイルを削除します。別名: erase。/q は確認なしです（シミュレータでは常に確認なし）。', options:['<strong>/q</strong> : 確認を省略','<strong>erase</strong> : del の別名'], validator: a => a.length && a.filter(x=>x.toLowerCase()!=='/q').length===1 ? {ok:true}:{ok:false,message:'構文: del [/q] <file>'} },
        rmdir: { name:'rmdir', summary:'フォルダを削除する', syntax:'rmdir [/s] [/q] <folder>', description:'空のフォルダを削除します。/s は中身もすべて削除。別名: rd。', options:['<strong>/s</strong> : 配下も削除','<strong>/q</strong> : 確認なし','<strong>rd</strong> : rmdir の別名'], validator:a=>a.length && a.filter(x=>!['/s','/q'].includes(x.toLowerCase())).length===1 ? {ok:true}:{ok:false,message:'構文: rmdir [/s] [/q] <folder>'} },
        copy: {
          name:'copy', summary:'ファイルをコピーする', syntax:'copy [options] <source> [destination]',
          description:'ファイルをコピーします。コピー先がフォルダの場合は元のファイル名を使用します。以下のオプションはWindows CMDの仕様を紹介するもので、現在のシミュレータでは未対応です。',
          options:[
            '<strong>/a</strong> : ASCIIテキストファイルとして扱う（未対応）',
            '<strong>/b</strong> : バイナリファイルとして扱う（未対応）',
            '<strong>/v</strong> : コピー後に書き込みを検証する（未対応）',
            '<strong>/y</strong> : 上書き確認を省略する（未対応）',
            '<strong>/-y</strong> : 上書き確認を表示する（未対応）',
            '<strong>/z</strong> : ネットワークコピーを再開可能モードで行う（未対応）',
            '<strong>/d</strong> : 暗号化されたファイルを復号した状態でコピーできるようにする（未対応）',
            '<strong>/n</strong> : 利用可能な場合、短いファイル名を使用する（未対応）',
            '<strong>/?</strong> : ヘルプを表示する（未対応）'
          ],
          examples:[
            {code:'copy notes.txt backup.txt',note:'notes.txt を backup.txt としてコピー（シミュレータで実行可能）'},
            {code:'copy notes.txt docs\\',note:'notes.txt を docs フォルダへコピー（シミュレータで実行可能）'},
            {code:'copy /y notes.txt backup.txt',note:'上書き確認を省略してコピー（オプションは未対応）'},
            {code:'copy /b a.bin+b.bin combined.bin',note:'バイナリファイルを結合（未対応）'}
          ],
          validator:a=>a.length===2?{ok:true}:{ok:false,message:'構文: copy <source> <destination>（オプション未対応）'}
        },
        xcopy: { name:'xcopy', summary:'ファイル・フォルダをコピーする', syntax:'xcopy <source> <destination> [/s] [/e] [/i] [/y]', description:'ディレクトリもコピー可能です。基本動作を再現します。', options:['<strong>/s</strong> : 空でないサブフォルダもコピー','<strong>/e</strong> : 空フォルダもコピー','<strong>/i</strong> : コピー先をフォルダとみなす','<strong>/y</strong> : 上書き確認を省略（本シミュレータは確認なし）'], validator:a=>a.filter(x=>!x.startsWith('/')).length===2 && a.every(x=>!x.startsWith('/')||['/s','/e','/i','/y'].includes(x.toLowerCase()))?{ok:true}:{ok:false,message:'構文: xcopy <source> <destination> [/s] [/e] [/i] [/y]'} },
        robocopy: { name:'robocopy', summary:'フォルダ間でファイルをコピーする', syntax:'robocopy <sourceDir> <destDir> [/s] [/e] [/mir] [/l]', description:'ディレクトリのコピーとミラーリングを簡易再現。/mir はコピー先の余剰ファイルを削除します。', options:['<strong>/s</strong> : 空でないサブフォルダをコピー','<strong>/e</strong> : 空フォルダを含む','<strong>/mir</strong> : コピー先をミラー化（余剰を削除）','<strong>/l</strong> : 実際には変更せず対象を表示'], validator:a=>a.filter(x=>!x.startsWith('/')).length===2 && a.every(x=>!x.startsWith('/')||['/s','/e','/mir','/l'].includes(x.toLowerCase()))?{ok:true}:{ok:false,message:'構文: robocopy <sourceDir> <destDir> [/s] [/e] [/mir] [/l]'} },
        move: { name:'move', summary:'ファイル・フォルダを移動する', syntax:'move <source> <destination>', description:'ファイルやフォルダを移動・改名します。', options:['オプションは今回未対応'], validator:a=>a.length===2?{ok:true}:{ok:false,message:'構文: move <source> <destination>'} },
        ren: { name:'ren', summary:'ファイル・フォルダの名前を変更する', syntax:'ren <oldName> <newName>', description:'同じ場所で名前を変更します。別名: rename。', options:['<strong>rename</strong> : ren の別名'], validator:a=>a.length===2?{ok:true}:{ok:false,message:'構文: ren <oldName> <newName>'} },
        tree: { name:'tree', summary:'フォルダ構造をツリー表示する', syntax:'tree [path] [/f] [/a]', description:'ディレクトリ構造をテキストで表示します。', options:['<strong>/f</strong> : ファイルも表示','<strong>/a</strong> : ASCII記号で表示'], validator:a=>a.filter(x=>!x.startsWith('/')).length<=1 && a.every(x=>!x.startsWith('/')||['/f','/a'].includes(x.toLowerCase()))?{ok:true}:{ok:false,message:'構文: tree [path] [/f] [/a]'} },
        redirect: {
          name:'redirect', summary:'出力をファイルへ保存する（> / >>）',
          syntax:'command > file / command >> file',
          description:'標準出力を仮想ファイルに保存します。> は上書き、>> は追記です。ファイルがなければ新規作成します。CMDではリダイレクトは独立したコマンドではなく演算子です。',
          options:['<strong>&gt;</strong> : 出力先を上書き','<strong>&gt;&gt;</strong> : 出力先に追記','<strong>2&gt;</strong> : 標準エラー出力のリダイレクト（未対応）','<strong>&lt;</strong> : ファイルからの標準入力（未対応）'],
          examples:[{code:'echo Hello > hello.txt',note:'ファイルを新規作成、または上書き'},{code:'echo World >> hello.txt',note:'既存ファイルの末尾に追記'},{code:'dir > files.txt',note:'ディレクトリ一覧を保存'},{code:'type hello.txt',note:'保存した内容を表示'}],
          validator:()=>({ok:false,message:'リダイレクトはコマンドの後ろに指定してください。例: echo Hello > hello.txt'})
        },
        pipe: {
          name:'pipe', summary:'前のコマンドの出力を次のコマンドへ渡す（|）',
          syntax:'command1 | command2',
          description:'左側のコマンドの標準出力を右側へ渡します。学習用として find、findstr、type と組み合わせる基本パターンに対応しています。',
          options:['<strong>|</strong> : 標準出力を次のコマンドへ渡す','<strong>&amp;&amp; / ||</strong> : 条件付きコマンド実行（未対応）'],
          examples:[{code:'echo ERROR found | find "ERROR"',note:'標準出力から ERROR を検索'},{code:'type notes.txt | findstr /i "error"',note:'ファイル内容をパイプ経由で検索'},{code:'dir | find ".txt"',note:'ディレクトリ表示を絞り込む'}],
          validator:()=>({ok:false,message:'パイプはコマンドの間に指定してください。例: dir | find ".txt"'})
        },
        ping: {
          name:'ping', summary:'宛先との疎通を確認する（疑似実行）',
          syntax:'ping [-n count] [-w timeout] host',
          description:'ICMP Echo要求の疎通確認です。実際の通信はせず、127.0.0.1〜127.0.0.5 を学習用の固定シナリオに割り当てています。注意：実際のWindowsでは127.0.0.2以降もループバックアドレスであり、これらのIPアドレスが本来エラーになるわけではありません。',
          scenarios:[
            '<strong>127.0.0.1</strong> : 正常応答（受信100%、損失0%）',
            '<strong>127.0.0.2</strong> : 要求がタイムアウトしました（損失100%・疑似）',
            '<strong>127.0.0.3</strong> : 宛先ホストに到達できません（疑似）',
            '<strong>127.0.0.4</strong> : 応答とタイムアウトが交互に起こる（部分的なパケット損失・疑似）',
            '<strong>127.0.0.5</strong> : 一般エラー（送信処理に失敗した例・疑似）',
            '<strong>存在しないホスト名</strong> : 名前解決エラー（例: ping nonexistent.invalid・疑似）'
          ],
          options:[
            '<strong>-n 数</strong> : 送信回数（1〜10）',
            '<strong>-w ミリ秒</strong> : 応答待ちタイムアウト（疑似表示）',
            '<strong>-t</strong> : 停止まで繰り返す（未対応）',
            '<strong>-4 / -6</strong> : IPバージョン指定（未対応）'
          ],
          examples:[
            {code:'ping 127.0.0.1',note:'正常：すべて応答する'},
            {code:'ping 127.0.0.2',note:'異常：すべてタイムアウトする（疑似）'},
            {code:'ping 127.0.0.3',note:'異常：宛先ホストに到達できない（疑似）'},
            {code:'ping -n 4 127.0.0.4',note:'異常：一部だけ応答する（疑似）'},
            {code:'ping 127.0.0.5',note:'異常：一般エラー（疑似）'},
            {code:'ping nonexistent.invalid',note:'異常：名前解決できない（疑似）'},
            {code:'ping -n 2 localhost',note:'2回だけ送信する（正常）'}
          ],
          validator:a=>a.length?{ok:true}:{ok:false,message:'構文: ping [-n count] [-w timeout] host'}
        },
        ipconfig: {
          name:'ipconfig', summary:'ネットワーク設定を確認する（疑似実行）',
          syntax:'ipconfig [/all] [/release] [/renew] [/flushdns]',
          description:'WindowsのTCP/IP設定を表示・操作します。このプレイグラウンドに表示されるIPアドレスは例示用で、端末の実際の設定ではありません。',
          options:['<strong>/all</strong> : 詳細情報','<strong>/release</strong> : DHCPアドレスの解放（未対応）','<strong>/renew</strong> : DHCPアドレス更新（未対応）','<strong>/flushdns</strong> : DNSキャッシュ消去（未対応）'],
          examples:[{code:'ipconfig',note:'疑似IPv4設定を表示'},{code:'ipconfig /all',note:'疑似MACアドレス・DNSなども表示'},{code:'ipconfig /flushdns',note:'DNSキャッシュを消去する実コマンド（未対応）'}],
          validator:a=>a.every(x=>['/all','/release','/renew','/flushdns'].includes(x.toLowerCase()))?{ok:true}:{ok:false,message:'構文: ipconfig [/all]（/release /renew /flushdns は未対応）'}
        },
        nslookup: {
          name:'nslookup', summary:'DNSの名前解決を確認する（疑似実行）',
          syntax:'nslookup hostname [server]',
          description:'DNSを照会するコマンドです。プレイグラウンドでは実際にDNSへ接続せず、学習用の固定IPアドレスを表示します。',
          options:['<strong>hostname</strong> : 問い合わせるホスト名','<strong>server</strong> : DNSサーバー指定（未対応）','<strong>-type=MX</strong> : MXレコード問い合わせ（未対応）'],
          examples:[{code:'nslookup example.com',note:'疑似DNS応答を表示'},{code:'nslookup localhost',note:'localhostの疑似解決結果'},{code:'nslookup example.com 8.8.8.8',note:'DNSサーバー指定（未対応）'}],
          validator:a=>a.length>=1?{ok:true}:{ok:false,message:'構文: nslookup hostname'}
        },
        type: {
          name:'type', summary:'テキストファイルの内容を表示する',
          syntax:'type file [file ...]',
          description:'仮想テキストファイルの内容を画面に表示します。リダイレクトやパイプの学習にも利用できます。',
          options:['<strong>複数ファイル</strong> : 順に表示','<strong>/?</strong> : ヘルプ（未対応）'],
          examples:[{code:'type notes.txt',note:'notes.txtを読む'},{code:'type notes.txt | find "ERROR"',note:'ファイルの内容を絞り込む'}],
          validator:a=>a.length?{ok:true}:{ok:false,message:'構文: type file'}
        },
        find: {
          name:'find', summary:'ファイル中の文字列を検索する',
          syntax:'find [/i] [/v] [/n] [/c] "文字列" [file ...]',
          description:'指定文字列を行単位で検索します。Windows CMDの find は正規表現を扱いません。仮想ファイルの本文を検索します。',
          options:['<strong>/i</strong> : 大文字・小文字を区別しない','<strong>/v</strong> : 一致しない行を表示','<strong>/n</strong> : 行番号を付ける','<strong>/c</strong> : 一致行数を表示','<strong>/?</strong> : ヘルプ表示（未対応）'],
          examples:[{code:'find "ERROR" notes.txt',note:'ERROR を含む行を検索'},{code:'find /i "error" *.txt',note:'大文字小文字を区別せず、現在のフォルダのテキストファイルを検索'},{code:'find /n "INFO" notes.txt',note:'行番号付きで検索'}],
          validator:a=>a.some(x=>!x.startsWith('/'))?{ok:true}:{ok:false,message:'構文: find [/i] [/v] [/n] [/c] "文字列" [file]'}
        },
        findstr: {
          name:'findstr', summary:'文字列・正規表現でファイルを検索する',
          syntax:'findstr [/i] [/n] [/s] [/m] [/r|/l] "pattern" [files ...]',
          description:'仮想ファイル内を検索します。既定では簡易的な正規表現検索です。/l で文字列そのものとして検索します。Windows本来の正規表現方言とは一部異なります。',
          options:['<strong>/i</strong> : 大文字小文字を区別しない','<strong>/n</strong> : 行番号を表示','<strong>/s</strong> : サブフォルダも検索','<strong>/m</strong> : 一致するファイル名だけ表示','<strong>/r</strong> : 正規表現で検索','<strong>/l</strong> : リテラル文字列で検索','<strong>/c:文字列</strong> : 空白を含む検索語を指定（簡易対応）','<strong>/?</strong> : ヘルプ表示（未対応）'],
          examples:[{code:'findstr /i "error" *.txt',note:'テキストファイルからerrorを検索'},{code:'findstr /s /n "INFO" *.txt',note:'子フォルダも含めて行番号付きで検索'},{code:'findstr /m "ERROR" *.txt',note:'該当ファイル名のみ表示'}],
          validator:a=>a.length?{ok:true}:{ok:false,message:'構文: findstr [/i] [/n] [/s] "pattern" [files]'}
        },
        where: {
          name:'where', summary:'ファイルの場所を検索する',
          syntax:'where [/r directory] pattern [pattern ...]',
          description:'ファイルのパスを検索します。/r では指定フォルダ以下を再帰検索します。PATHの代わりに、このプレイグラウンドの仮想フォルダを対象とします。',
          options:['<strong>/r dir</strong> : 指定フォルダ以下を再帰検索','<strong>* / ?</strong> : ファイル名のワイルドカード','<strong>/?</strong> : ヘルプ表示（未対応）'],
          examples:[{code:'where *.txt',note:'カレントフォルダにあるtxtファイルのパスを表示'},{code:'where /r C:\\WORK *.txt',note:'C:\\WORK 以下のtxtファイルを再帰検索'},{code:'where notes.?xt',note:'? を一文字として検索'}],
          validator:a=>a.length?{ok:true}:{ok:false,message:'構文: where [/r directory] pattern'}
        },
        help: {
          name: 'help',
          summary: '利用可能なコマンドを表示する',
          syntax: 'help [command]',
          description: 'コマンド一覧や各コマンドの概要を表示します。',
          options: ['<strong>mkdir</strong> : mkdir の説明を表示'],
          validator: () => ({ ok: true })
        }
      };


      // 学習用ドキュメント。プレイグラウンドの実行処理は変更しない。
      const commandDocumentation = {
  "mkdir": {
    "options": [
      "<strong>md</strong> : mkdir の別名",
      "<strong>/?</strong> : Windows CMDでヘルプを表示（プレイグラウンド未対応）",
      "<strong>補足</strong> : Windows CMDでは -p は不要。中間フォルダも作成可能ですが、このシミュレータでは一部の構文のみ対応"
    ],
    "examples": [
      {
        "code": "mkdir sample",
        "note": "sample フォルダを作成"
      },
      {
        "code": "md reports",
        "note": "別名 md でもフォルダを作成"
      },
      {
        "code": "mkdir logs\\2026",
        "note": "階層指定の例。中間フォルダを含む作成はWindows CMDの仕様で、プレイグラウンドでは一部未対応"
      }
    ]
  },
  "dir": {
    "options": [
      "<strong>/a</strong> : 属性指定でファイルを表示（プレイグラウンドは基本表示のみ対応）",
      "<strong>/w</strong> : 横並びの簡易表示（プレイグラウンドは表示形式未対応）",
      "<strong>/s</strong> : サブフォルダを含めて一覧表示（未対応）",
      "<strong>/b</strong> : 名前だけを簡潔に表示（未対応）",
      "<strong>/o:n</strong> : 名前順に並べ替え（未対応）",
      "<strong>/?</strong> : ヘルプを表示（未対応）"
    ],
    "examples": [
      {
        "code": "dir",
        "note": "現在のフォルダの一覧"
      },
      {
        "code": "dir /a",
        "note": "属性を含む一覧指定。プレイグラウンドでは簡易的な一覧表示のみ対応"
      },
      {
        "code": "dir /s",
        "note": "サブフォルダを再帰的に一覧表示（未対応）"
      },
      {
        "code": "dir /b *.txt",
        "note": "テキストファイルの名前だけを表示（/b は未対応、ワイルドカードは対応）"
      }
    ]
  },
  "cd": {
    "options": [
      "<strong>..</strong> : 親フォルダへ移動",
      "<strong>\\</strong> : 現在のドライブのルートへ移動",
      "<strong>/d</strong> : ドライブも同時に切り替える",
      "<strong>chdir</strong> : cd の別名",
      "<strong>D:</strong> : Dドライブの保存された現在位置へ切り替え",
      "<strong>/?</strong> : ヘルプを表示（未対応）"
    ],
    "examples": [
      {
        "code": "cd",
        "note": "現在のディレクトリを表示"
      },
      {
        "code": "cd docs",
        "note": "docs に移動"
      },
      {
        "code": "cd ..",
        "note": "1つ上のフォルダへ移動"
      },
      {
        "code": "cd /d D:\\DATA",
        "note": "ドライブごと D:\\DATA に移動（対応。¥ / ￥ も入力可）"
      },
      {
        "code": "D:",
        "note": "ドライブをDに切り替え"
      },
      {
        "code": "chdir \\",
        "note": "別名でルートへ戻る"
      }
    ]
  },
  "echo": {
    "options": [
      "<strong>echo [文字列]</strong> : 文字列を表示",
      "<strong>echo off / on</strong> : バッチ処理でコマンド表示を制御（未対応）",
      "<strong>&gt;</strong> : ファイルへ上書き出力（未対応）",
      "<strong>&gt;&gt;</strong> : ファイルへ追記（未対応）",
      "<strong>補足</strong> : --help は標準CMDのオプションではありません（シミュレータ独自の案内）"
    ],
    "examples": [
      {
        "code": "echo Hello World",
        "note": "文字列を表示"
      },
      {
        "code": "echo Hello > message.txt",
        "note": "ファイルに書き込み（未対応）"
      },
      {
        "code": "echo More >> message.txt",
        "note": "ファイルへ追記（未対応）"
      },
      {
        "code": "echo off",
        "note": "バッチでコマンドの表示を無効にする用途（未対応）"
      }
    ]
  },
  "cls": {
    "options": [
      "<strong>オプションなし</strong> : ターミナル表示を消去",
      "<strong>/?</strong> : ヘルプ表示は標準的なclsの構文ではありません"
    ],
    "examples": [
      {
        "code": "cls",
        "note": "画面の出力履歴を消去"
      }
    ]
  },
  "del": {
    "options": [
      "<strong>/p</strong> : ファイル削除ごとに確認（未対応）",
      "<strong>/f</strong> : 読み取り専用ファイルも強制削除（未対応）",
      "<strong>/s</strong> : サブフォルダ内の指定ファイルも削除（未対応）",
      "<strong>/q</strong> : ワイルドカード削除時の確認を省略（プレイグラウンドは簡易対応）",
      "<strong>/a:r</strong> : 属性で削除対象を指定（未対応）",
      "<strong>erase</strong> : del の別名",
      "<strong>/?</strong> : ヘルプを表示（未対応）"
    ],
    "examples": [
      {
        "code": "del notes.txt",
        "note": "ファイルを削除"
      },
      {
        "code": "erase notes.txt",
        "note": "別名 erase で削除"
      },
      {
        "code": "del /q notes.txt",
        "note": "確認なしでファイルを削除（簡易対応）"
      },
      {
        "code": "del /s *.log",
        "note": "サブフォルダの .log ファイルを削除（未対応）"
      }
    ]
  },
  "rmdir": {
    "options": [
      "<strong>/s</strong> : フォルダ配下を含めて削除",
      "<strong>/q</strong> : /s 利用時の確認を省略（プレイグラウンドでは常に確認なし）",
      "<strong>rd</strong> : rmdir の別名",
      "<strong>/?</strong> : ヘルプを表示（未対応）"
    ],
    "examples": [
      {
        "code": "rmdir empty",
        "note": "空フォルダを削除"
      },
      {
        "code": "rd empty",
        "note": "別名 rd でも削除"
      },
      {
        "code": "rmdir /s /q old",
        "note": "配下もまとめて削除（対応、確認なし）"
      }
    ]
  },
  "xcopy": {
    "options": [
      "<strong>/s</strong> : 空でないサブフォルダもコピー（簡易対応）",
      "<strong>/e</strong> : 空フォルダを含めてコピー（簡易対応）",
      "<strong>/i</strong> : コピー先をディレクトリと仮定（簡易対応）",
      "<strong>/y</strong> : 上書き確認を省略（プレイグラウンドは常に確認なし）",
      "<strong>/h</strong> : 隠しファイル・システムファイルもコピー（未対応）",
      "<strong>/d[:日付]</strong> : 更新日を基準にコピー（未対応）",
      "<strong>/exclude:ファイル名</strong> : 指定文字列を含むパスを除外（未対応）",
      "<strong>/?</strong> : ヘルプを表示（未対応）"
    ],
    "examples": [
      {
        "code": "xcopy docs D:\\DATA\\docs /e /i",
        "note": "docs を空フォルダ込みでコピー（基本的な動作に対応）"
      },
      {
        "code": "xcopy docs backup /s",
        "note": "空でないサブフォルダをコピー（簡易対応）"
      },
      {
        "code": "xcopy docs backup /h",
        "note": "隠しファイルもコピー（/h は未対応）"
      }
    ]
  },
  "robocopy": {
    "options": [
      "<strong>/s</strong> : 空でないサブフォルダもコピー（簡易対応）",
      "<strong>/e</strong> : 空フォルダを含めてコピー（簡易対応）",
      "<strong>/mir</strong> : コピー先をミラー化し余剰ファイルを削除（簡易対応）",
      "<strong>/l</strong> : コピー対象のみ一覧表示・変更しない（簡易対応）",
      "<strong>/r:n</strong> : コピー失敗時の再試行回数（未対応）",
      "<strong>/w:n</strong> : 再試行間隔を秒で指定（未対応）",
      "<strong>/xd</strong> : ディレクトリを除外（未対応）",
      "<strong>/xf</strong> : ファイルを除外（未対応）",
      "<strong>/log:ファイル</strong> : ログをファイルへ出力（未対応）",
      "<strong>/?</strong> : ヘルプを表示（未対応）"
    ],
    "examples": [
      {
        "code": "robocopy C:\\WORK\\docs D:\\DATA\\docs /e",
        "note": "空フォルダを含めてコピー（簡易対応）"
      },
      {
        "code": "robocopy C:\\WORK D:\\DATA\\WORK /mir",
        "note": "ミラーリング。コピー先にしかないデータは削除対象（簡易対応）"
      },
      {
        "code": "robocopy C:\\WORK D:\\DATA /l",
        "note": "変更せず対象のみ表示（簡易対応）"
      },
      {
        "code": "robocopy C:\\WORK D:\\DATA /e /r:2 /w:1",
        "note": "失敗時の再試行条件つきコピー（/r、/w は未対応）"
      }
    ]
  },
  "move": {
    "options": [
      "<strong>/y</strong> : 上書き確認を省略（未対応）",
      "<strong>/-y</strong> : 上書き確認を行う（未対応）",
      "<strong>/?</strong> : ヘルプを表示（未対応）"
    ],
    "examples": [
      {
        "code": "move notes.txt docs\\",
        "note": "ファイルをdocsへ移動"
      },
      {
        "code": "move docs D:\\DATA\\",
        "note": "フォルダをDドライブへ移動（基本動作に対応）"
      },
      {
        "code": "move /y a.txt b.txt",
        "note": "上書き確認なしで移動（/y は未対応）"
      }
    ]
  },
  "ren": {
    "options": [
      "<strong>rename</strong> : ren の別名",
      "<strong>/?</strong> : ヘルプを表示（未対応）",
      "<strong>補足</strong> : ren は名前変更用。別フォルダへの移動には move を利用"
    ],
    "examples": [
      {
        "code": "ren notes.txt memo.txt",
        "note": "ファイル名を変更"
      },
      {
        "code": "rename project project_old",
        "note": "別名 rename でフォルダ名を変更"
      },
      {
        "code": "ren *.txt *.bak",
        "note": "ワイルドカードによる一括改名（未対応）"
      }
    ]
  },
  "tree": {
    "options": [
      "<strong>/f</strong> : ファイル名も表示",
      "<strong>/a</strong> : 罫線ではなくASCII文字で表示（簡易対応）",
      "<strong>/?</strong> : ヘルプを表示（未対応）"
    ],
    "examples": [
      {
        "code": "tree",
        "note": "現在のフォルダの階層表示"
      },
      {
        "code": "tree /f",
        "note": "ファイルを含めて表示"
      },
      {
        "code": "tree D:\\DATA /a",
        "note": "DドライブのフォルダをASCII文字で表示（簡易対応）"
      }
    ]
  },
  "help": {
    "options": [
      "<strong>help</strong> : 使用可能なコマンド一覧を表示",
      "<strong>help コマンド名</strong> : 指定コマンドのヘルプを表示（簡易対応）",
      "<strong>/?</strong> : ヘルプ表示（未対応）"
    ],
    "examples": [
      {
        "code": "help",
        "note": "コマンド一覧を表示"
      },
      {
        "code": "help mkdir",
        "note": "mkdir の概要を表示"
      },
      {
        "code": "help md",
        "note": "別名 md から mkdir の概要を表示"
      }
    ]
  }
};
      // ワイルドカードを使う例はこの版でプレイグラウンドでも動作します。
      commandDocumentation.dir.options.push('<strong>* / ?</strong> : 名前パターンによる絞り込み');
      commandDocumentation.dir.examples.push({code:'dir *.txt',note:'現在のフォルダ内の txt ファイルを表示'});
      commandDocumentation.del.options.push('<strong>* / ?</strong> : ファイル名のパターン指定（確認なしで削除）');
      commandDocumentation.del.examples.push({code:'del *.tmp',note:'現在のフォルダの tmp ファイルを一括削除'});
      commandCatalog.copy.options.push('<strong>* / ?</strong> : コピー元ファイル名を指定（複数一致時は既存のフォルダへコピー）');
      commandCatalog.copy.examples.push({code:'copy *.txt docs',note:'現在のフォルダにある txt ファイルを docs にコピー'});
      commandDocumentation.move.options.push('<strong>* / ?</strong> : 移動元のワイルドカード指定（未対応）');
      commandDocumentation.xcopy.options.push('<strong>* / ?</strong> : ファイル名パターンの指定（プレイグラウンド未対応）');
      commandDocumentation.robocopy.options.push('<strong>* / ?</strong> : ファイル名パターンの指定（プレイグラウンド未対応）');
      for (const [name, documentation] of Object.entries(commandDocumentation)) {
        Object.assign(commandCatalog[name], documentation);
      }


      // 追加のWindows CMD学習コマンド（端末情報・通信・プロセスは完全に疑似）。
      commandCatalog["whoami"] = {"name": "whoami", "summary": "現在のユーザー名を表示", "syntax": "whoami [/user]", "description": "ログオンしているユーザーを表示します。仮想環境のユーザーを表示し、実際のPC情報は取得しません。", "options": ["<strong>/user</strong> : ユーザー名とSIDを表示（疑似）"], "examples": [{"code": "whoami", "note": "ユーザー名を表示"}, {"code": "whoami /user", "note": "ユーザー名とSIDを表示"}]};
      commandCatalog["whoami"].validator = () => ({ok:true});
      commandCatalog["hostname"] = {"name": "hostname", "summary": "ホスト名を表示", "syntax": "hostname", "description": "現在のコンピューターのホスト名を表示します。実際の端末情報ではなく架空の名前を表示します。", "options": [], "examples": [{"code": "hostname", "note": "ホスト名を表示"}]};
      commandCatalog["hostname"].validator = () => ({ok:true});
      commandCatalog["ver"] = {"name": "ver", "summary": "Windowsのバージョンを表示", "syntax": "ver", "description": "Windowsのバージョン文字列を表示します。このサイトでは架空のバージョンを表示します。", "options": [], "examples": [{"code": "ver", "note": "OSバージョンを表示"}]};
      commandCatalog["ver"].validator = () => ({ok:true});
      commandCatalog["date"] = {"name": "date", "summary": "日付を表示する", "syntax": "date [/t]", "description": "日付を表示します。/t なしの実CMDは日付変更入力を促すことがありますが、シミュレータでは日付を変更できません。", "options": ["<strong>/t</strong> : 日付を表示するだけ"], "examples": [{"code": "date /t", "note": "日付を表示"}, {"code": "date", "note": "日付を表示（変更操作は未対応）"}]};
      commandCatalog["date"].validator = () => ({ok:true});
      commandCatalog["time"] = {"name": "time", "summary": "時刻を表示する", "syntax": "time [/t]", "description": "時刻を表示します。/t なしの実CMDは時刻変更入力を促すことがありますが、シミュレータでは時刻を変更できません。", "options": ["<strong>/t</strong> : 時刻を表示するだけ"], "examples": [{"code": "time /t", "note": "時刻を表示"}, {"code": "time", "note": "時刻を表示（変更操作は未対応）"}]};
      commandCatalog["time"].validator = () => ({ok:true});
      commandCatalog["systeminfo"] = {"name": "systeminfo", "summary": "システム情報の一覧を表示", "syntax": "systeminfo", "description": "OS・メモリ・起動時間などを確認するコマンドです。架空のPCのサンプル情報を表示します。", "options": ["<strong>/fo table / csv / list</strong> : 出力形式の指定（未対応）", "<strong>/s</strong> : リモートシステム指定（未対応）"], "examples": [{"code": "systeminfo", "note": "疑似システム情報を表示"}]};
      commandCatalog["systeminfo"].validator = () => ({ok:true});
      commandCatalog["tracert"] = {"name": "tracert", "summary": "通信経路をホップ単位で表示", "syntax": "tracert [-d] [-h max_hops] host", "description": "宛先までに経由するルーターなどを調べるコマンドです。架空の経路と応答時間を表示します。", "options": ["<strong>-d</strong> : IPアドレスをホスト名へ変換しない", "<strong>-h 数</strong> : 最大ホップ数（疑似・1〜10）"], "examples": [{"code": "tracert example.com", "note": "宛先までの疑似経路を表示"}, {"code": "tracert -d -h 2 example.com", "note": "名前解決をせず2ホップまで表示"}]};
      commandCatalog["tracert"].validator = () => ({ok:true});
      commandCatalog["pathping"] = {"name": "pathping", "summary": "通信経路とパケット損失を調べる", "syntax": "pathping [-n] [-h max_hops] host", "description": "tracertの経路表示とpingの損失調査を組み合わせたコマンド。架空の経路・損失率を即時表示します。", "options": ["<strong>-n</strong> : IPアドレスの名前解決をしない", "<strong>-h 数</strong> : 最大ホップ数（疑似・1〜10）"], "examples": [{"code": "pathping example.com", "note": "疑似経路と損失率を確認"}, {"code": "pathping -n example.com", "note": "名前解決なしで表示"}]};
      commandCatalog["pathping"].validator = () => ({ok:true});
      commandCatalog["netstat"] = {"name": "netstat", "summary": "ネットワーク接続・待受ポートを表示", "syntax": "netstat [-a] [-n] [-o]", "description": "TCP/UDP接続や待受ポートの状態を表示します。表示内容は固定の架空の通信情報です。", "options": ["<strong>-a</strong> : 待受ポートも表示", "<strong>-n</strong> : アドレス・ポートを数値で表示", "<strong>-o</strong> : PIDを表示"], "examples": [{"code": "netstat", "note": "疑似TCP接続を表示"}, {"code": "netstat -ano", "note": "待受を含む数値表示＋PID"}]};
      commandCatalog["netstat"].validator = () => ({ok:true});
      commandCatalog["fc"] = {"name": "fc", "summary": "2つのファイルの差分を比較", "syntax": "fc [/b] file1 file2", "description": "仮想ファイルシステム内の2つのファイルを比較します。基本的なテキスト行の比較に対応します。", "options": ["<strong>/b</strong> : バイナリ比較（未対応）", "<strong>/n</strong> : 行番号の表示（疑似比較では未対応）"], "examples": [{"code": "fc notes.txt docs\\spec.txt", "note": "2ファイルの本文を比較"}, {"code": "fc notes.txt notes.txt", "note": "同一ファイルの比較"}]};
      commandCatalog["fc"].validator = () => ({ok:true});
      commandCatalog["tasklist"] = {"name": "tasklist", "summary": "実行中のプロセスを一覧表示", "syntax": "tasklist [/fi \"imagename eq name\"]", "description": "実行中のプロセスのイメージ名とPIDを表示します。疑似プロセスを使用し、実際のWindowsプロセスにはアクセスしません。", "options": ["<strong>/fi \"imagename eq 名前\"</strong> : プロセス名による絞り込み（簡易対応）", "<strong>/v /svc</strong> : 詳細・サービス表示（未対応）"], "examples": [{"code": "tasklist", "note": "疑似プロセス一覧"}, {"code": "tasklist /fi \"imagename eq notepad.exe\"", "note": "notepad.exeだけを表示"}]};
      commandCatalog["tasklist"].validator = () => ({ok:true});
      commandCatalog["taskkill"] = {"name": "taskkill", "summary": "指定したプロセスを終了する", "syntax": "taskkill [/f] /pid PID | /im imageName", "description": "指定したプロセスを終了するコマンドです。実際のプロセスは終了せず、仮想プロセス一覧だけを更新します。", "options": ["<strong>/pid 数値</strong> : プロセスIDで指定", "<strong>/im 名前</strong> : イメージ名で指定", "<strong>/f</strong> : 強制終了（疑似環境では実際の強制終了なし）"], "examples": [{"code": "taskkill /pid 2400", "note": "架空のnotepad.exeを終了"}, {"code": "taskkill /im notepad.exe", "note": "名前で疑似プロセスを終了"}, {"code": "tasklist", "note": "終了後の一覧を確認"}]};
      commandCatalog["taskkill"].validator = () => ({ok:true});


export { commandCatalog };
