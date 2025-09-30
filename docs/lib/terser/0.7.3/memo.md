# terser

* https://github.com/terser/terser

　2025/09/30時点。

　上記READMEにある通りブラウザで使用するため以下URLを使用した。

```html
<script src="https://cdn.jsdelivr.net/npm/source-map@0.7.3/dist/source-map.js"></script>
<script src="https://cdn.jsdelivr.net/npm/terser/dist/bundle.min.js"></script>
```

　これをオフライン`file://`で使用したい。単純にコードをテキストファイルとしてコピーしてHTMLで`<script>`で読んでも動作しなかった。そこでコードを読んでみたら、`bundle.min.js`はそもそもminifyされていなかった。なので`bundle.js`に改名した。モジュール部分は次のようなコードだった。この`exports`というオブジェクトが`window`になってくれていなかったのだと予想できる。

```javascript
exports._default_options = _default_options;
exports._run_cli = run_cli;
exports.minify = minify;
exports.minify_sync = minify_sync;
```

　そこで、上記コードの直下に、ブラウザ上で動作するよう以下コードを追加した。

```javascript
window.terser = {
    _default_options : _default_options,
    _run_cli : run_cli,
    minify : minify,
    minify_sync : minify_sync,
};
```

　これにて当該ファイルを`<script>`で読み込んだら`terser.minify()`としてミニファイ関数を呼び出せる。

```javascript
const result = await terser.minify('class Human {hello(){console.log('hello!!')}}', {});
result.code;
```

　せっかくなのでterser自身のコードをミニファイしてみた。すると半分以下になった。ファイル名を以下のようにした。

時|量|名
--|--|--
前|1.01MB|`bundle.js`
後|472KB|`bundle.min.js`


