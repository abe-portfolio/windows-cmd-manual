// Extracted from the original single-file CMD playground.
export function createParser(ctx) {
  const { commandCatalog } = ctx;
      function normalizeCommand(rawInput) {
        const trimmed = rawInput.trim();
        if (!trimmed) return { command: '', args: [] };

        const match = trimmed.match(/^([^\s]+)(?:\s+(.+))?$/);
        if (!match) return { command: '', args: [] };

        const command = match[1].toLowerCase();
        const remainder = match[2] || '';
        const args = [...remainder.matchAll(/"([^"]*)"|([^\s"]+)/g)].map(m => m[1] ?? m[2]);
        return { command, args };
      }

      function suggestCommand(name) {
        const candidates = Object.keys(commandCatalog);
        let best = null;
        let bestScore = Infinity;

        for (const candidate of candidates) {
          const score = levenshtein(name, candidate);
          if (score < bestScore) {
            bestScore = score;
            best = candidate;
          }
        }

        return best && bestScore <= 3 ? best : null;
      }

      function levenshtein(a, b) {
        const dp = Array.from({ length: a.length + 1 }, () => new Array(b.length + 1).fill(0));
        for (let i = 0; i <= a.length; i++) dp[i][0] = i;
        for (let j = 0; j <= b.length; j++) dp[0][j] = j;

        for (let i = 1; i <= a.length; i++) {
          for (let j = 1; j <= b.length; j++) {
            const cost = a[i - 1] === b[j - 1] ? 0 : 1;
            dp[i][j] = Math.min(
              dp[i - 1][j] + 1,
              dp[i][j - 1] + 1,
              dp[i - 1][j - 1] + cost
            );
          }
        }

        return dp[a.length][b.length];
      }

      function commandExists(name) {
        return Object.prototype.hasOwnProperty.call(commandCatalog, name);
      }

      // 引用符内の演算子は特別扱いしない。CMDの全構文ではなく基本形の再現。
      function splitOperators(input, operator) {
        let quoted=false, start=0, chunks=[];
        for(let i=0;i<input.length;i++){
          if(input[i]==='"')quoted=!quoted;
          if(!quoted && input[i]===operator){
            if(operator==='|' && (input[i+1]==='|' || input[i-1]==='|'))return null;
            chunks.push(input.slice(start,i).trim()); start=i+1;
          }
        }
        chunks.push(input.slice(start).trim());
        return chunks;
      }
  return { normalizeCommand, suggestCommand, levenshtein, commandExists, splitOperators };
}
