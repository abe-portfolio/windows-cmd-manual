// Extracted from the original single-file CMD playground.
export function createFilesystem(ctx) {
  const { state } = ctx;
  const renderExplorer = (...args) => ctx.renderExplorer(...args);
  const writeTerminalLine = (...args) => ctx.writeTerminalLine(...args);
      // Windows パスは入力の円記号 (¥, ￥, \) や大小文字に関係なく照合する。
      function normalizeSlashes(v) { return String(v).replace(/[¥￥＼﹨⧵]/g, '\\').replace(/\//g, '\\'); }
      function existingDir(path) { return Object.keys(state.fs).find(k => k.toLowerCase() === path.toLowerCase()); }
      function entryName(path) { return path.slice(path.lastIndexOf('\\')+1); }
      function getParentPath(path) {
        if (/^[a-z]:\\$/i.test(path)) return null;
        const at=path.lastIndexOf('\\'); return at<=2 ? path.slice(0,3) : path.slice(0,at);
      }
      function fileKey(path) { return String(path).toLowerCase(); }
      function fileContent(path) { return state.contents[fileKey(path)] ?? ''; }
      function setFileContent(path, value) { state.contents[fileKey(path)] = value; }
      function wildcardRegex(pattern) {
        const normalized = String(pattern).replace(/[.+^${}()|[\]\\]/g, '\\$&');
        return new RegExp('^' + normalized.replace(/\*/g, '.*').replace(/\?/g, '.') + '$', 'i');
      }
      function expandFiles(pattern, recursive=false) {
        const full = parsePathInput(pattern);
        if (!full) return [];
        const parent = getParentPath(full), folder = existingDir(parent || '');
        if (!folder) return [];
        const regex = wildcardRegex(entryName(full));
        const out = [];
        const visit = (dir) => {
          for (const name of state.fs[dir] || []) {
            const next = joinPath(dir, name), childDir = existingDir(next);
            if (childDir) { if (recursive) visit(childDir); }
            else if (regex.test(name)) out.push(next);
          }
        };
        visit(folder);
        return out.sort((a,b)=>a.localeCompare(b, 'ja', {numeric:true}));
      }
      function patternFiles(pattern, recursive=false) {
        return /[*?]/.test(pattern) ? expandFiles(pattern, recursive)
          : recursive ? expandFiles(pattern, true) : (getFile(parsePathInput(pattern) || '') ? [parsePathInput(pattern)] : []);
      }
      function linesFor(path) { return fileContent(path).split(/\r?\n/); }
      function wildcardSearchNames(directory, pattern, recurse=false) {
        const base = existingDir(directory);
        if (!base) return [];
        return expandFiles(joinPath(base,pattern),recurse);
      }
      function getFile(path) {
        const parent=existingDir(getParentPath(path)||'');
        return parent && state.fs[parent].find(v=>v.toLowerCase()===entryName(path).toLowerCase());
      }
      function pathExists(path) { return !!existingDir(path) || !!getFile(path); }
      function parsePathInput(target) {
        let input=normalizeSlashes(target||'.').trim();
        const match=/^([a-z]):/i.exec(input);
        const drive=match?match[1].toUpperCase():state.currentPath[0].toUpperCase();
        if (!Object.prototype.hasOwnProperty.call(state.drivePaths,drive)) return null;
        const remaining=match?input.slice(2):input;
        const base=remaining.startsWith('\\')?`${drive}:\\`:state.drivePaths[drive];
        const components=base.slice(3).split('\\').filter(Boolean);
        for(const part of remaining.split('\\')) {
          if(!part||part==='.')continue;
          if(part==='..')components.pop(); else components.push(part);
        }
        const candidate=`${drive}:\\${components.join('\\')}`;
        return existingDir(candidate) || (getFile(candidate) ? `${existingDir(getParentPath(candidate))}\\${getFile(candidate)}` : candidate);
      }
      function removePath(path) {
        const dir=existingDir(path);
        if(dir) {
          for(const name of [...state.fs[dir]])removePath(joinPath(dir,name));
          delete state.fs[dir];
        }
        delete state.contents[fileKey(path)];
        const parent=existingDir(getParentPath(path)||'');
        if(parent)state.fs[parent]=state.fs[parent].filter(n=>n.toLowerCase()!==entryName(path).toLowerCase());
      }
      function joinPath(dir,name) {return dir.endsWith('\\')?dir+name:dir+'\\'+name;}
      function addFileOrDirectory(path,isDir) {
        const parent=existingDir(getParentPath(path)||'');
        if(!parent)throw Error('親ディレクトリが存在しません: '+getParentPath(path));
        if(pathExists(path))throw Error('同名のファイルまたはフォルダが既に存在します: '+path);
        const name=entryName(path);
        if(!name||/[<>:"|?*]/.test(name))throw Error('無効な名前です: '+name);
        state.fs[parent].push(name);
        if(isDir)state.fs[joinPath(parent,name)]=[];
        else setFileContent(joinPath(parent,name), '');
      }
      function copyNode(src,dst,recursive=true,includeEmpty=true) {
        const isDir=!!existingDir(src);
        if(!isDir&&!getFile(src))throw Error('コピー元が存在しません: '+src);
        if(pathExists(dst)) {
          if(!isDir||!existingDir(dst))throw Error('コピー先が既に存在します: '+dst);
        } else addFileOrDirectory(dst,isDir);
        if (!isDir) setFileContent(dst, fileContent(src));
        if(isDir&&recursive) {
          for(const name of [...state.fs[existingDir(src)]]) {
            const child=joinPath(src,name), childDir=!!existingDir(child);
            if(childDir&&!includeEmpty&&!hasFiles(child))continue;
            copyNode(child,joinPath(dst,name),true,includeEmpty);
          }
        }
      }
      function hasFiles(path) {return state.fs[existingDir(path)].some(name=>!existingDir(joinPath(path,name))||hasFiles(joinPath(path,name)));}
      function resolveDestination(src,dstArg) {
        const dest=parsePathInput(dstArg);
        if(!dest)throw Error('コピー先ドライブが存在しません。');
        return existingDir(dest)?joinPath(existingDir(dest),entryName(src)):dest;
      }
      function safeMutation(fn) {try {fn();renderExplorer();}catch(e){writeTerminalLine(e.message);}}
      function drawTree(path,showFiles,ascii,depth=0) {
        const out=[depth===0?path:entryName(path)];
        const walk=(dir,prefix)=>{
          const children=state.fs[existingDir(dir)]||[];
          const names=children.filter(n=>showFiles||existingDir(joinPath(dir,n)));
          names.forEach((name,i)=>{
            const last=i===names.length-1;
            out.push(prefix+(ascii?(last?'\\-- ':'|-- '):(last?'└── ':'├── '))+name);
            const child=joinPath(dir,name);
            if(existingDir(child))walk(child,prefix+(ascii?(last?'    ':'|   '):(last?'    ':'│   ')));
          });
        };walk(path,'');return out.join('\n');
      }
  return { normalizeSlashes, existingDir, entryName, getParentPath, fileKey, fileContent, setFileContent, wildcardRegex, expandFiles, patternFiles, linesFor, wildcardSearchNames, getFile, pathExists, parsePathInput, removePath, joinPath, addFileOrDirectory, copyNode, hasFiles, resolveDestination, safeMutation, drawTree };
}
