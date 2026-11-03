      const commandNameOrigins = {
        mkdir: 'make directory（ディレクトリを作成する）の略。別名 md も同じ意味です。',
        dir: 'directory（ディレクトリ）の省略形です。',
        cd: 'change directory（ディレクトリを変更する）の略。chdir も同じ意味です。',
        echo: '英語の echo（反響・こだま）から。指定した文字列をそのまま表示するイメージです。',
        cls: 'clear screen（画面を消去する）の略です。',
        del: 'delete（削除する）の省略形。別名 erase も「消去する」という意味です。',
        rmdir: 'remove directory（ディレクトリを削除する）の略。別名 rd も同じ意味です。',
        copy: '英語の copy（複製する）から来ています。',
        xcopy: 'extended copy（拡張されたコピー）に由来する名称です。',
        robocopy: 'robust file copy（堅牢なファイルコピー）の略です。',
        move: '英語の move（移動する）から来ています。',
        ren: 'rename（名前を変更する）の省略形です。',
        tree: '英語の tree（木）から。フォルダ階層を枝分かれした木のように表示します。',
        ping: 'ネットワークで応答を確かめる名称で、音波探知の「ping（ピンという反響音）」に由来します。公式な英単語の頭文字の略ではありません。',
        ipconfig: 'IP configuration（IPの設定・構成）の略です。',
        nslookup: 'name server lookup（ネームサーバーへの問い合わせ）に由来します。',
        type: '英語の type（タイプする・文字を打つ）から。ファイルの内容を画面に表示するコマンド名です。',
        find: '英語の find（見つける・探す）から来ています。',
        findstr: 'find string（文字列を検索する）を縮めた名前です。',
        where: '英語の where（どこ）から。ファイルがどこにあるか探します。',
        help: '英語の help（助ける・手助け）から。使い方を案内します。',
        redirect: '英語の redirect（向きを変える）から。出力先を画面からファイルなどに切り替えます。',
        pipe: '英語の pipe（管）から。コマンド間を管のようにつなぎ、出力を次へ渡します。'
      };

      commandNameOrigins["whoami"] = "who am I?（私は誰？）という英語の問いを、そのままコマンド名にしています。";
      commandNameOrigins["hostname"] = "host（ネットワーク上で通信の主体となるコンピューターなど）＋ name（名前）。「computer name」ではなく「host」を使うのは、ネットワークでは接続先・接続元の機器をホストと呼び、その識別名を hostname と呼ぶためです。Windowsの「コンピューター名」と重なることは多いですが、DNS名やFQDNとは必ずしも同義ではありません。";
      commandNameOrigins["ver"] = "version（バージョン）の省略形です。";
      commandNameOrigins["date"] = "英語の date（日付）から来ています。";
      commandNameOrigins["time"] = "英語の time（時刻・時間）から来ています。";
      commandNameOrigins["systeminfo"] = "system information（システム情報）を縮めた名前です。";
      commandNameOrigins["tracert"] = "trace route（経路を追跡する）に由来する名称です。Windowsでは tracert、他のOSでは traceroute と呼ばれるコマンドがあります。";
      commandNameOrigins["pathping"] = "path（経路）＋ ping（応答を確認する）を組み合わせた名前です。";
      commandNameOrigins["netstat"] = "network statistics（ネットワークの統計）の略です。";
      commandNameOrigins["fc"] = "file compare（ファイル比較）の略です。";
      commandNameOrigins["tasklist"] = "task（実行中の処理）＋ list（一覧）から来ています。";
      commandNameOrigins["taskkill"] = "task（実行中の処理）＋ kill（停止・終了させる）から来ています。";


export { commandNameOrigins };
