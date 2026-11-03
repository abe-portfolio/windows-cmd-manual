// Extracted from the original single-file CMD playground.
export function createExecutor(ctx) {
  const { commandAliases, commandCatalog, state } = ctx;
  const addFileOrDirectory = (...args) => ctx.addFileOrDirectory(...args);
  const captureOutput = (...args) => ctx.captureOutput(...args);
  const clearTerminal = (...args) => ctx.clearTerminal(...args);
  const commandExists = (...args) => ctx.commandExists(...args);
  const copyNode = (...args) => ctx.copyNode(...args);
  const drawTree = (...args) => ctx.drawTree(...args);
  const entryName = (...args) => ctx.entryName(...args);
  const existingDir = (...args) => ctx.existingDir(...args);
  const fileContent = (...args) => ctx.fileContent(...args);
  const getCurrentDirectoryEntries = (...args) => ctx.getCurrentDirectoryEntries(...args);
  const getFile = (...args) => ctx.getFile(...args);
  const getParentPath = (...args) => ctx.getParentPath(...args);
  const hasFiles = (...args) => ctx.hasFiles(...args);
  const joinPath = (...args) => ctx.joinPath(...args);
  const linesFor = (...args) => ctx.linesFor(...args);
  const normalizeCommand = (...args) => ctx.normalizeCommand(...args);
  const parsePathInput = (...args) => ctx.parsePathInput(...args);
  const pathExists = (...args) => ctx.pathExists(...args);
  const patternFiles = (...args) => ctx.patternFiles(...args);
  const removePath = (...args) => ctx.removePath(...args);
  const renderExplorer = (...args) => ctx.renderExplorer(...args);
  const resolveDestination = (...args) => ctx.resolveDestination(...args);
  const safeMutation = (...args) => ctx.safeMutation(...args);
  const setFileContent = (...args) => ctx.setFileContent(...args);
  const splitOperators = (...args) => ctx.splitOperators(...args);
  const suggestCommand = (...args) => ctx.suggestCommand(...args);
  const wildcardRegex = (...args) => ctx.wildcardRegex(...args);
  const wildcardSearchNames = (...args) => ctx.wildcardSearchNames(...args);
  const writeTerminalLine = (...args) => ctx.writeTerminalLine(...args);
      function runCaptured(commandLine) {
        return captureOutput(() => executeCommand(commandLine, true));
      }
      function runWithStdin(commandLine, stdin) {
        const parsed=normalizeCommand(commandLine);
        if(!['find','findstr'].includes(parsed.command)) {
          writeTerminalLine('パイプ受信側は find / findstr に対応しています。');return;
        }
        // 入力文字列は現在のフォルダの一時的な仮想ファイルへ流し込む。
        let num=0, name;
        do {name=`__cmd_pipe_${num++}.txt`;} while(pathExists(joinPath(state.currentPath,name)));
        const full=joinPath(state.currentPath,name);
        addFileOrDirectory(full,false);setFileContent(full,stdin);
        try {
          const lines=runCaptured(commandLine+' "'+name+'"');
          // 一時ファイルのパス表示は実際のパイプの標準入力に近い表示に置き換える。
          const cleaned=lines.replaceAll(full+':\n','').replaceAll(full+': ','');
          if(cleaned)writeTerminalLine(cleaned);
        } finally {removePath(full);}
      }
      function executeShellLine(line) {
        const pipes=splitOperators(line,'|');
        if(!pipes){writeTerminalLine('|| は未対応です。');return;}
        if(pipes.length>1){
          if(pipes.some(x=>!x)){writeTerminalLine('パイプの前後にコマンドを指定してください。');return;}
          if(pipes.length>2){writeTerminalLine('3段以上のパイプは未対応です。');return;}
          const left=runCaptured(pipes[0]);
          runWithStdin(pipes[1],left);
          return;
        }
        let quoted=false, op=-1, append=false;
        for(let i=0;i<line.length;i++){
          if(line[i]==='"')quoted=!quoted;
          else if(!quoted && line[i]==='>') {op=i;append=line[i+1]==='>';break;}
        }
        if(op>=0){
          const left=line.slice(0,op).trim(), destination=line.slice(op+(append?2:1)).trim().replace(/^"(.*)"$/,'$1');
          if(!left||!destination||/[<>|]/.test(destination)){writeTerminalLine('構文: コマンド > ファイル / コマンド >> ファイル');return;}
          const target=parsePathInput(destination);
          if(!target||existingDir(target)){writeTerminalLine('出力先ファイルを指定してください。');return;}
          const parent=existingDir(getParentPath(target)||'');
          if(!parent){writeTerminalLine('出力先のフォルダが見つかりません。');return;}
          const output=runCaptured(left);
          try {
            if(!pathExists(target))addFileOrDirectory(target,false);
            setFileContent(target,(append?fileContent(target):'')+output+'\r\n');
            renderExplorer();
          }catch(e){writeTerminalLine(e.message);}
          return;
        }
        executeCommand(line);
      }

      function executeCommand(rawInput) {
        const { command, args } = normalizeCommand(rawInput);

        if (!command) {
          return;
        }

        const actualCommand = commandAliases[command] || command;

        if (/^[a-z]:$/i.test(command)) {
          const drive = command[0].toUpperCase();
          if (!state.drivePaths[drive]) writeTerminalLine(`ドライブが見つかりません: ${drive}:`);
          else if (args.length) writeTerminalLine("ドライブ指定に引数は指定できません。");
          else { state.currentPath = state.drivePaths[drive]; renderExplorer(); }
          return;
        }

        const commandEntry = commandCatalog[actualCommand];

        if (!commandEntry) {
          const suggestion = suggestCommand(command);
          writeTerminalLine(`'${command}' は存在しません。`);
          if (suggestion) {
            writeTerminalLine(`もしかして: ${suggestion} ?`);
          }
          return;
        }

        const validation = commandEntry.validator(args);
        if (!validation.ok) {
          writeTerminalLine(validation.message);
          return;
        }

        switch (actualCommand) {
          case 'mkdir': {
            const dest=parsePathInput(args[0]);
            if(!dest){writeTerminalLine('ドライブが見つかりません。');break;}
            safeMutation(()=>{addFileOrDirectory(dest,true);writeTerminalLine(`作成しました: ${dest}`);});
            break;
          }

          case 'dir': {
            const pattern=args.find(a=>!a.startsWith('/'));
            const entries=pattern ? (()=>{
              const full=parsePathInput(pattern), parent=full && existingDir(getParentPath(full)||'');
              if (!parent) return [];
              const regex=wildcardRegex(entryName(full));
              return state.fs[parent].filter(name=>regex.test(name)).sort((a,b)=>a.localeCompare(b,'ja',{numeric:true}));
            })() : getCurrentDirectoryEntries();
            if (!entries.length) {
              writeTerminalLine('ファイルは見つかりませんでした。');
              return;
            }
            writeTerminalLine(entries.join('\n'));
            break;
          }

          case 'cd': {
            if (!args.length) { writeTerminalLine(state.currentPath); break; }
            if (args[0] === '/?') {
              writeTerminalLine('cd [/d] [drive:][path]  /d: ドライブも切り替え');
              break;
            }
            const hasD = args[0].toLowerCase() === '/d';
            const target = hasD ? args[1] : args[0];
            if (!target || (target.startsWith('/') && target !== '/')) {
              writeTerminalLine('構文エラーです。例: cd /d D:\\DATA'); break;
            }
            // cd D: は Dドライブの現在位置を表示する（ドライブは切り替えない）。
            if (/^[a-z]:$/i.test(target) && !hasD) {
              const drive = target[0].toUpperCase();
              writeTerminalLine(state.drivePaths[drive] || `ドライブが見つかりません: ${drive}:`);
              break;
            }
            const nextPath = parsePathInput(target);
            if (!nextPath || !Object.prototype.hasOwnProperty.call(state.fs, nextPath)) {
              writeTerminalLine(`指定されたパスが見つかりません: ${target}`); break;
            }
            const drive = nextPath[0].toUpperCase();
            state.drivePaths[drive] = nextPath;
            if (hasD || drive === state.currentPath[0].toUpperCase()) {
              state.currentPath = nextPath;
              writeTerminalLine(`現在の場所: ${state.currentPath}`);
              renderExplorer();
            } else {
              writeTerminalLine(`${drive}: の現在位置を ${nextPath} に変更しました（ドライブの切り替えには /d を使用）。`);
            }
            break;
          }

          case 'del': {
            const pattern=args.find(x=>x.toLowerCase()!=='/q');
            const path=parsePathInput(pattern);
            if(!path){writeTerminalLine('指定されたドライブが見つかりません。');break;}
            safeMutation(()=>{
              if(existingDir(path))throw Error('フォルダは del で削除できません。rmdir を使用してください。');
              const paths=patternFiles(pattern);
              if(!paths.length)throw Error('ファイルが存在しません: '+pattern);
              for(const file of paths)removePath(file);
              writeTerminalLine(`${paths.length} 件削除しました: ${paths.join(', ')}`);
            });break;
          }
          case 'rmdir': {
            const recursive=args.some(x=>x.toLowerCase()==='/s');
            const path=parsePathInput(args.find(x=>!['/s','/q'].includes(x.toLowerCase())));
            safeMutation(()=>{
              const dir=path&&existingDir(path);
              if(!dir)throw Error('ディレクトリが存在しません: '+args.join(' '));
              if(/^[a-z]:\\$/i.test(dir))throw Error('ドライブのルートは削除できません。');
              if(Object.values(state.drivePaths).some(p=>p.toLowerCase()===dir.toLowerCase())||state.currentPath.toLowerCase()===dir.toLowerCase()||state.currentPath.toLowerCase().startsWith(dir.toLowerCase()+'\\'))throw Error('使用中のディレクトリは削除できません。');
              if(state.fs[dir].length&&!recursive)throw Error('ディレクトリが空ではありません。/s を指定してください。');
              removePath(dir);writeTerminalLine('削除しました: '+dir);
            });break;
          }
          case 'copy': {
            safeMutation(()=>{
              const sources=patternFiles(args[0]);
              if(!sources.length)throw Error('コピー元ファイルが見つかりません。');
              if(sources.length>1 && !existingDir(parsePathInput(args[1])))throw Error('複数ファイルのコピー先には既存のフォルダを指定してください。');
              for(const src of sources){
                const dst=resolveDestination(src,args[1]);
                if(src.toLowerCase()===dst.toLowerCase())throw Error('コピー元とコピー先が同じです。');
                copyNode(src,dst);
              }
              writeTerminalLine(sources.length+' 個のファイルをコピーしました。');
            });break;
          }
          case 'xcopy': {
            safeMutation(()=>{
              const names=args.filter(x=>!x.startsWith('/'));const flags=args.filter(x=>x.startsWith('/')).map(x=>x.toLowerCase());
              const src=parsePathInput(names[0]);if(!src||!pathExists(src))throw Error('コピー元が見つかりません。');
              const dest=parsePathInput(names[1]);
              const dir=!!existingDir(src);
              if(dir&&(dest.toLowerCase()===src.toLowerCase()||dest.toLowerCase().startsWith(src.toLowerCase()+'\\')))throw Error('ディレクトリを自身の配下へコピーできません。');
              if(dir){
                if(!existingDir(dest))addFileOrDirectory(dest,true);
                for(const name of [...state.fs[existingDir(src)]]){
                  const child=joinPath(src,name),folder=!!existingDir(child);
                  if(folder&&!flags.some(f=>['/s','/e'].includes(f)))continue;
                  if(folder&&!flags.includes('/e')&&!hasFiles(child))continue;
                  copyNode(child,joinPath(dest,name),true,flags.includes('/e'));
                }
              }else copyNode(src,resolveDestination(src,names[1]));
              writeTerminalLine('コピーが完了しました: '+dest);
            });break;
          }
          case 'robocopy': {
            safeMutation(()=>{
              const names=args.filter(x=>!x.startsWith('/'));const flags=args.filter(x=>x.startsWith('/')).map(x=>x.toLowerCase());
              const src=parsePathInput(names[0]),dst=parsePathInput(names[1]);
              if(!src||!existingDir(src))throw Error('コピー元フォルダが存在しません。');
              if(!dst)throw Error('コピー先のドライブが存在しません。');
              if(dst.toLowerCase()===src.toLowerCase()||dst.toLowerCase().startsWith(src.toLowerCase()+'\\'))throw Error('コピー先はコピー元の配下に指定できません。');
              if(flags.includes('/l')){writeTerminalLine('プレビュー（変更なし）: '+src+' -> '+dst);return;}
              if(!existingDir(dst))addFileOrDirectory(dst,true);
              const mir=flags.includes('/mir'),recursive=mir||flags.includes('/s')||flags.includes('/e');
              const sync=(from,to)=>{
                const children=[...state.fs[existingDir(from)]];
                for(const name of children){
                  const f=joinPath(from,name),d=joinPath(to,name),folder=!!existingDir(f);
                  if(folder){
                    if(!recursive||(!mir&&!flags.includes('/e')&&!hasFiles(f)))continue;
                    if(!existingDir(d)){if(pathExists(d))throw Error('コピー先に同名のファイルがあります: '+d);addFileOrDirectory(d,true);}
                    sync(f,d);
                  }else if(!pathExists(d)){addFileOrDirectory(d,false);setFileContent(d,fileContent(f));}
                  else if(existingDir(d))throw Error('コピー先に同名のフォルダがあります: '+d);
                  else setFileContent(d,fileContent(f));
                }
                if(mir)for(const name of [...state.fs[existingDir(to)]]){
                  if(!children.some(x=>x.toLowerCase()===name.toLowerCase()))removePath(joinPath(to,name));
                }
              };
              sync(src,dst);writeTerminalLine('robocopy 完了: '+src+' -> '+dst);
            });break;
          }
          case 'move':
          case 'ren': {
            safeMutation(()=>{
              const src=parsePathInput(args[0]);if(!src||!pathExists(src))throw Error('移動元が存在しません。');
              if(/^[a-z]:\\$/i.test(src))throw Error('ルートは移動できません。');
              const dst=actualCommand==='ren'?joinPath(getParentPath(src),args[1]):resolveDestination(src,args[1]);
              if(actualCommand==='ren'&&(/[\\/:*?"<>|¥￥]/.test(args[1])||!args[1]))throw Error('ren の新しい名前にはパスを指定できません。');
              if(dst.toLowerCase()===src.toLowerCase())throw Error('移動元と移動先が同じです。');
              if(pathExists(dst))throw Error('移動先が既に存在します: '+dst);
              const folder=!!existingDir(src);
              if(folder&&(dst.toLowerCase().startsWith(src.toLowerCase()+'\\')||Object.values(state.drivePaths).some(p=>p.toLowerCase()===src.toLowerCase())||state.currentPath.toLowerCase()===src.toLowerCase()||state.currentPath.toLowerCase().startsWith(src.toLowerCase()+'\\')))throw Error('現在使用中のフォルダや自身の配下へは移動できません。');
              if(folder){copyNode(src,dst);removePath(src);}else {addFileOrDirectory(dst,false);setFileContent(dst,fileContent(src));removePath(src);}
              writeTerminalLine('変更しました: '+src+' -> '+dst);
            });break;
          }
          case 'find':
          case 'findstr': {
            const isStr=actualCommand==='findstr';
            const optNames=isStr?['/i','/n','/s','/m','/r','/l']:['/i','/n','/v','/c'];
            const flags=args.filter(a=>optNames.includes(a.toLowerCase())).map(a=>a.toLowerCase());
            const invalid=args.find(a=>a.startsWith('/')&&!optNames.includes(a.toLowerCase())&&!(isStr&&a.toLowerCase().startsWith('/c:')));
            if(invalid){writeTerminalLine('未対応のオプション: '+invalid);break;}
            const words=args.filter(a=>!optNames.includes(a.toLowerCase())&&!a.toLowerCase().startsWith('/c:'));
            const cArg=isStr?args.find(a=>a.toLowerCase().startsWith('/c:')):null;
            const query=cArg?cArg.slice(3):words.shift();
            if(!query){writeTerminalLine('検索文字列を指定してください。');break;}
            const patterns=words.length?words:['*.txt'];
            const paths=[...new Set(patterns.flatMap(pattern=>patternFiles(pattern, flags.includes('/s'))))];
            if(!paths.length){writeTerminalLine('検索対象のファイルが見つかりません。');break;}
            let regex;
            if(isStr&&!flags.includes('/l')) {
              try {regex=new RegExp(query, flags.includes('/i')?'i':'');}
              catch(e){writeTerminalLine('検索パターンが不正です: '+e.message);break;}
            }
            let found=0;
            for(const path of paths){
              let count=0;
              const output=[];
              linesFor(path).forEach((line,i)=>{
                const matching=regex?regex.test(line):(flags.includes('/i')?line.toLowerCase().includes(query.toLowerCase()):line.includes(query));
                const selected=flags.includes('/v')&&!isStr?!matching:matching;
                if(selected){count++;output.push(`${flags.includes('/n')?`[${i+1}]`:''}${line}`);}
              });
              found+=count;
              if(!isStr&&flags.includes('/c'))writeTerminalLine(`${path}: ${count}`);
              else if(isStr&&flags.includes('/m')){if(count)writeTerminalLine(path);}
              else if(output.length)writeTerminalLine(`${path}:\n${output.join('\n')}`);
            }
            if(!found)writeTerminalLine('一致する行はありません。');
            break;
          }
          case 'where': {
            const recursive=args[0]?.toLowerCase()==='/r';
            const base=recursive?parsePathInput(args[1]):state.currentPath;
            const patterns=recursive?args.slice(2):args;
            if(!base||!existingDir(base)||!patterns.length){writeTerminalLine('構文: where [/r directory] pattern');break;}
            if(patterns.some(p=>p.startsWith('/'))){writeTerminalLine('未対応のオプションです。');break;}
            const out=[...new Set(patterns.flatMap(pattern=>{
              const full=/^[a-z]:|[\\¥￥]/i.test(pattern)?parsePathInput(pattern):joinPath(base,pattern);
              if(!full)return [];
              const parent=getParentPath(full);
              return parent?wildcardSearchNames(parent,entryName(full),recursive):[];
            }))];
            writeTerminalLine(out.length?out.join('\n'):'INFO: 指定されたパターンのファイルが見つかりません。');
            break;
          }
          case 'tree': {
            const name=args.find(x=>!x.startsWith('/'))||'.';const dir=parsePathInput(name);
            if(!dir||!existingDir(dir)){writeTerminalLine('フォルダが存在しません: '+name);break;}
            writeTerminalLine(drawTree(dir,args.some(x=>x.toLowerCase()==='/f'),args.some(x=>x.toLowerCase()==='/a')));break;
          }

          case 'type': {
            for(const name of args){
              const path=parsePathInput(name);
              if(!path||!getFile(path))writeTerminalLine('ファイルが見つかりません: '+name);
              else writeTerminalLine(fileContent(path));
            }
            break;
          }
          case 'hostname': writeTerminalLine('【疑似端末】CMD-PLAYGROUND'); break;
          case 'whoami': {
            if(args.length>1 || (args.length && args[0].toLowerCase()!=='/user')) {writeTerminalLine('構文: whoami [/user]');break;}
            writeTerminalLine(args.length?'playground\\student   S-1-5-21-1000-1000-1000-1001':'playground\\student');break;
          }
          case 'ver': writeTerminalLine('【疑似端末】Microsoft Windows [Version 10.0.19045.0000]'); break;
          case 'date':
          case 'time': {
            if(args.length && !(args.length===1&&args[0].toLowerCase()==='/t')) {writeTerminalLine('構文: '+actualCommand+' [/t]');break;}
            const d=new Date();
            const fmt=actualCommand==='date'?new Intl.DateTimeFormat('ja-JP',{year:'numeric',month:'2-digit',day:'2-digit',weekday:'short'}).format(d):new Intl.DateTimeFormat('ja-JP',{hour:'2-digit',minute:'2-digit',second:'2-digit',hour12:false}).format(d);
            writeTerminalLine('【ブラウザの日時】 '+fmt+(args.length?'':'（日時の変更は未対応）'));break;
          }
          case 'systeminfo': {
            if(args.length){writeTerminalLine('systeminfo のオプションは未対応です。');break;}
            writeTerminalLine('【疑似システム情報：実機ではありません】\nホスト名: CMD-PLAYGROUND\nOS 名: Microsoft Windows 10 Pro (サンプル)\nOS バージョン: 10.0.19045 (サンプル)\nシステム製造元: Example Manufacturer\nシステムの種類: x64-based PC\n物理メモリ合計: 8,192 MB\n利用可能な物理メモリ: 4,096 MB\nネットワーク アダプター: Ethernet / 192.0.2.10');break;
          }
          case 'tracert':
          case 'pathping': {
            let host='',max=10,bad=false;
            for(let i=0;i<args.length;i++){
              const a=args[i].toLowerCase();
              if(a==='-h' && args[i+1])max=Number(args[++i]);
              else if(a===(actualCommand==='tracert'?'-d':'-n')){} 
              else if(a.startsWith('-'))bad=true;
              else if(!host)host=args[i];else bad=true;
            }
            if(bad||!host||!Number.isInteger(max)||max<1||max>10){writeTerminalLine('構文: '+actualCommand+' [-h 1..10] host');break;}
            const hops=[['192.0.2.1','1 ms'],['198.51.100.1','8 ms'],['203.0.113.10','19 ms']];
            writeTerminalLine('【疑似経路：実際のネットワークへは接続しません】 '+host+' へのルートを追跡しています');
            hops.slice(0,max).forEach((hop,i)=>writeTerminalLine(`${i+1}   ${hop[1]}   ${hop[1]}   ${hop[1]}   ${hop[0]}`));
            if(max<3)writeTerminalLine('指定された最大ホップ数に達しました。');
            else if(actualCommand==='pathping')writeTerminalLine('\n【疑似損失統計】\nホップ 1: 0% の損失\nホップ 2: 10% の損失\nホップ 3: 0% の損失');
            else writeTerminalLine('トレースを完了しました。');
            break;
          }
          case 'netstat': {
            if(args.some(a=>!['-a','-n','-o','-ano','-an','-ao','-no'].includes(a.toLowerCase()))){writeTerminalLine('構文: netstat [-a] [-n] [-o]');break;}
            const flags=args.join('').toLowerCase(),all=flags.includes('a'),pid=flags.includes('o');
            writeTerminalLine('【疑似接続一覧】\nプロトコル  ローカル アドレス       外部アドレス          状態'+(pid?'             PID':''));
            writeTerminalLine('TCP        192.0.2.10:51000       198.51.100.20:443     ESTABLISHED'+(pid?'    4200':''));
            if(all){writeTerminalLine('TCP        0.0.0.0:135            0.0.0.0:0             LISTENING'+(pid?'      1100':''));writeTerminalLine('UDP        0.0.0.0:5353           *:*'+(pid?'                           1100':''));}
            break;
          }
          case 'fc': {
            if(args[0]?.startsWith('/')){writeTerminalLine('fc のオプションは現在未対応です。');break;}
            if(args.length!==2){writeTerminalLine('構文: fc file1 file2');break;}
            const p1=parsePathInput(args[0]),p2=parsePathInput(args[1]);
            if(!p1||!p2||!getFile(p1)||!getFile(p2)){writeTerminalLine('比較するファイルが見つかりません。');break;}
            const a=fileContent(p1).split(/\r?\n/),b=fileContent(p2).split(/\r?\n/);
            writeTerminalLine(`ファイル ${p1} と ${p2} を比較しています`);
            if(fileContent(p1)===fileContent(p2))writeTerminalLine('FC: 相違点は検出されませんでした。');
            else {writeTerminalLine('***** '+p1+'\n'+a.join('\n')+'\n***** '+p2+'\n'+b.join('\n')+'\n*****');}
            break;
          }
          case 'tasklist': {
            if(args.length){
              if(args.length!==2||args[0].toLowerCase()!=='/fi'||!/^imagename eq .+$/i.test(args[1])){writeTerminalLine('構文: tasklist [/fi "imagename eq name"]');break;}
            }
            const filter=args.length?args[1].replace(/^imagename eq /i,'').toLowerCase():null;
            const list=state.processes.filter(x=>!filter||x.name.toLowerCase()===filter);
            writeTerminalLine('【疑似プロセス一覧：実際のプロセスは操作しません】\nイメージ名                   PID');
            list.forEach(x=>writeTerminalLine(x.name.padEnd(28,' ')+x.pid));
            if(!list.length)writeTerminalLine('INFO: 指定された条件に一致するタスクはありません。');
            break;
          }
          case 'taskkill': {
            let pid=null,im=null,invalid=false;
            for(let i=0;i<args.length;i++){
              const a=args[i].toLowerCase();
              if(a==='/f')continue;
              if(a==='/pid' && args[i+1]){pid=Number(args[++i]);continue;}
              if(a==='/im' && args[i+1]){im=args[++i].toLowerCase();continue;}
              invalid=true;
            }
            if(invalid||(pid===null)===(im===null)||(pid!==null&&(!Number.isInteger(pid)||pid<1))){writeTerminalLine('構文: taskkill [/f] /pid PID | /im imageName');break;}
            const matching=state.processes.filter(p=>pid!==null?p.pid===pid:p.name.toLowerCase()===im);
            if(!matching.length){writeTerminalLine('エラー: 指定されたプロセスが見つかりません。');break;}
            for(const p of matching){
              if(p.protected){writeTerminalLine(`エラー: PID ${p.pid} は学習用の保護されたプロセスです。`);continue;}
              state.processes=state.processes.filter(item=>item!==p);
              writeTerminalLine(`成功: PID ${p.pid} のプロセス "${p.name}" を終了しました（疑似）。`);
            }
            break;
          }
          case 'ping': {
            let count=4, host='', timeout=4000, bad=false;
            for(let i=0;i<args.length;i++){
              const a=args[i].toLowerCase();
              if(a==='-n' && args[i+1])count=Number(args[++i]);
              else if(a==='-w' && args[i+1])timeout=Number(args[++i]);
              else if(a.startsWith('-'))bad=true;
              else if(!host)host=args[i];else bad=true;
            }
            if(bad||!host||!Number.isInteger(count)||count<1||count>10||!Number.isInteger(timeout)||timeout<1){
              writeTerminalLine('構文: ping [-n 1..10] [-w ミリ秒] host（-t 等は未対応）');break;
            }
            const h=host.toLowerCase();
            const scenarios={'127.0.0.1':'success','127.0.0.2':'timeout','127.0.0.3':'unreachable','127.0.0.4':'partial','127.0.0.5':'general'};
            if(h==='nonexistent.invalid' || h.endsWith('.invalid')){
              writeTerminalLine(`【疑似通信】Ping 要求ではホスト ${host} が見つかりませんでした。ホスト名を確認してもう一度実行してください。`);
              break;
            }
            const scenario=scenarios[h] || 'success';
            const ip=h==='localhost'?'127.0.0.1':(/^(?:\d{1,3}\.){3}\d{1,3}$/.test(h)?host:'192.0.2.1');
            writeTerminalLine(`【疑似通信：学習用シナリオ】 ${host} [${ip}] に ping を送信しています（32 バイトのデータ）:`);
            let received=0, unreachable=0;
            for(let i=0;i<count;i++){
              const status=scenario==='partial'?(i%2===0?'success':'timeout'):scenario;
              if(status==='success'){
                received++;
                writeTerminalLine(`${ip} からの応答: バイト数=32 時間<1ms TTL=128`);
              }else if(status==='timeout'){
                writeTerminalLine('要求がタイムアウトしました。');
              }else if(status==='unreachable'){
                unreachable++;
                writeTerminalLine('192.0.2.1 からの応答: 宛先ホストに到達できません。');
              }else{
                writeTerminalLine('PING: 転送に失敗しました。一般エラー。');
              }
            }
            // 到達不能はICMPエラー応答であり、正常なEcho応答ではない。
            // Windowsが表示する統計との差異を避け、学習用のEcho成功数として集計する。
            const lost=count-received;
            writeTerminalLine(`${ip} の ping 統計（学習用・Echo応答基準）: 送信 = ${count}, 受信 = ${received}, 損失 = ${lost} (${Math.round(100*lost/count)}% の損失)`);
            if(unreachable)writeTerminalLine('補足：到達不能のICMPエラー応答はEcho成功として集計していません。');
            break;
          }
          case 'ipconfig': {
            const option=args[0]?.toLowerCase();
            if(option && option!=='/all'){writeTerminalLine(`${option} はプレイグラウンド未対応です。`);break;}
            writeTerminalLine('【疑似設定：実際の端末情報ではありません】\nWindows IP 構成\n\nイーサネット アダプター Ethernet:\n   IPv4 アドレス . . . . . : 192.0.2.10\n   サブネット マスク . . . : 255.255.255.0\n   デフォルト ゲートウェイ : 192.0.2.1'+(option==='/all'?'\n   物理アドレス . . . . . : 02-00-00-00-00-01\n   DNS サーバー . . . . . : 192.0.2.53':''));
            break;
          }
          case 'nslookup': {
            if(args.length!==1 || args[0].startsWith('-')){writeTerminalLine('DNSサーバー指定や -type オプションは未対応です。');break;}
            const host=args[0];
            const address=/^localhost$/i.test(host)?'127.0.0.1':'192.0.2.20';
            writeTerminalLine(`【疑似DNS応答】\nサーバー:  example-dns\nAddress: 192.0.2.53\n\n名前:    ${host}\nAddress: ${address}`);
            break;
          }
          case 'echo': {
            const message = args.includes('--help') ? 'echo [message]' : args.join(' ');
            writeTerminalLine(message);
            break;
          }

          case 'cls': {
            clearTerminal();
            break;
          }

          case 'help': {
            const target = args[0];
            if (target && commandExists(commandAliases[target.toLowerCase()] || target.toLowerCase())) {
              const detail = commandCatalog[commandAliases[target.toLowerCase()] || target.toLowerCase()];
              writeTerminalLine(`${detail.name} : ${detail.summary}`);
              writeTerminalLine(`構文: ${detail.syntax}`);
            } else {
              writeTerminalLine('利用可能なコマンド: whoami, hostname, ver, date, time, systeminfo, tracert, pathping, netstat, fc, tasklist, taskkill, mkdir/md, dir, cd/chdir, del/erase, rmdir/rd, copy, xcopy, robocopy, move, ren/rename, tree, find, findstr, where, echo, type, ping, ipconfig, nslookup, cls, help, C:, D:');
            }
            break;
          }

          default:
            writeTerminalLine(`未実装のコマンド: ${command}`);
        }
      }
  return { runCaptured, runWithStdin, executeShellLine, executeCommand };
}
