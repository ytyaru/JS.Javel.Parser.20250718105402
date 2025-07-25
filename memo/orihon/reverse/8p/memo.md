# 印刷

　ブラウザ標準(Chrome v92)の印刷機能では、縦書き時の全角ダッシュ二連続が縦でなく横になってしまう。バグと思われる。

　PDF生成ライブラリ[jsPDF][]を使用すればイケそう。根拠は[jsPDF][]を使用したWEBアプリ[orie][]。これは縦書き時の全角ダッシュ二連族が縦に表示されていた。[orie制作][]によると[jsPDF][]を使用していると書いてあったので。

[orie制作]:https://blog.comilab.net/post/2020-04-13/
[orie]:https://orie.comilab.net/
[jsPDF]:https://github.com/parallax/jsPDF

　`<ruby>`要素も正しく描画できるのか？　どうやって？

https://ytkyk.info/blog/2014/07/01/ruby+pdfkit-ruby%E3%81%A7html%E3%81%8B%E3%82%89pdf%E3%82%92%E7%94%9F%E6%88%90%E3%81%99%E3%82%8B/

