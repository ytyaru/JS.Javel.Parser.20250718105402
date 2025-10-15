(function(){
class JavelViewer {
    constructor() {
        this._ = {}
        this._.parser = new JavelParser();
        this._.splitter = new PageSplitter(this._.parser);
    }
    async make(options) {
        this.#setOptions(options);
        await this.#setup();
    }
    get #defaultOptions() { return {
        javel: null,
        viewer: null,
        editor: null,
        width: document.body.clientWidth,
        height: window.innerHeight,
        writingMode: 'vertical-rl',
    } }
    #setOptions(options) {
        console.log('#setOptions() options:', options);
        const O = {...this.#defaultOptions, ...options};
        ['viewer', 'editor'].map(n=>{if (!Type.isEl(O[n])) {O[n]=null;}});
        if (!Type.isStr(O.javel)) {O.javel='';}
        if (!O.javel && (Type.isEl(O.editor) && !!O.editor.value)) {O.javel = O.editor.value}
        if (!Type.isEl(O.viewer)) {O.viewer=document.body;}
        if (!Number.isFinite(O.width)) {O.width=document.body.clientWidth}
        if (!Number.isFinite(O.height)) {O.width=window.innerHeight}//document.documentElement.clientHeight（横スクロールバーの高さも含まれるが表示しないため無問題）
        if (!this.#isValidWritingMode(O.writingMode)) {O.writingMode='vertical-rl';}
//        Css.set('writing-mode', 'var(--writing-mode)', this._.viewer);
        Css.set('--writing-mode', O.writingMode);
        this._.O = O;
        console.log('設定:', O, !O.javel && (Type.isEl(O.editor) && !!O.editor.value));
    }
    #makeLoading() {
        if (!this._.O.viewer.querySelector('[name="loading"]')) {
            this._.O.viewer.append(Dom.tags.div({name:'loading', style:'display:none;'}, 
                Dom.tags.span({name:'loading-rate'}, '0'),
                '　', Dom.tags.span({name:'loading-all-page'}), 'ページ', 
                Dom.tags.br(), Dom.tags.span({name:'loading-message'}, '読込中……しばしお待ち下さい'),
            ));
        }
    }
    async #load() {
        if (!this._.O.viewer.querySelector('[name="error"]')) {
            this._.O.viewer.append(Dom.tags.div({name:'error', style:'display:none; widht:100%; height:100%;'}, 
                Dom.tags.p('パースに失敗しました。Javel原稿の冒頭にはYAML形式のメタ情報が必要です。次のような形式にしてください。'),
                Dom.tags.pre(`---
title: 小説のタイトル
catch: 小説のキャッチコピー
obi: |-
小説の帯文。

Javel形式《けいしき》で書けるよ。
author:
name: 著者名
---

# 見出し

　本文。`),
            ));
        }
        try {
            if (this._.O.javel.startsWith('https://') || 0===(this._.O.javel.trim().match(new RegExp('\n', 'g')) || []).length) {
                const res = await fetch(this._.O.javel);
                const txt = await res.text();
//                Dom.q(`[name="demo-edit"]`).value = txt;
                if (this._.O.editor) {this._.O.editor.value = txt}
                this._.parser.manuscript = txt;
            } else { console.log(this._.O.javel); this._.parser.manuscript = this._.O.javel; }
            if (this._.O.editor) {this._.O.editor.value = this._.parser.manuscript;}
        } catch (err) {
            console.error(err);
            this._.O.viewer.querySelector('[name="error"]').style.display = 'block';
            throw err;
        }
    }
    #makeBookDiv() {
//        const book = Dom.q(`[name="book"]`);
        const book = this._.O.viewer.querySelector(`[name="book"]`);
        console.log('#makeBookDiv():', book);
        if (book) {book.innerHTML = ''; return book;}
        //else {const b = Dom.tags.div({name:'book', style:'display:block;padding:0;margin:0;box-sizing:border-box;', 'data-all-page':0});this._.O.viewer.appendChild(b); return b;}
        //else {const b = Dom.tags.div({name:'book', style:'position:relative;display:block;padding:0;margin:0;box-sizing:border-box;', 'data-all-page':0});this._.O.viewer.appendChild(b); return b;}
        //else {return Dom.tags.div({name:'book', style:'display:block;padding:0;margin:0;box-sizing:border-box;', 'data-all-page':0});}
        //else {const b = Dom.tags.div({name:'book', style:'position:relative;display:block;padding:0;margin:0;box-sizing:border-box;', 'data-all-page':0});this._.O.viewer.appendChild(b); return b;}
        //else {const b = Dom.tags.div({name:'book', style:';display:flex;flex-wrap:wrap;flex-direction:column;align-content:flex-start;padding:0;margin:0;box-sizing:border-box;', 'data-all-page':0});this._.O.viewer.appendChild(b); return b;}
        else {const b = Dom.tags.div({name:'book', style:';display:block;padding:0;margin:0;box-sizing:border-box;', 'data-all-page':0});this._.O.viewer.appendChild(b); return b;}
    }
    #makeFooter(book, calc) {
        const footer = this._.O.viewer.querySelector(`[name="header"]`);
        if (footer) {footer.style.display = 'none'; footer.innerHTML = ''; return footer;}
        else {
            // position:fixed;bottom:0;
            // display:flex;flex-direction:row;
            const f = Dom.tags.div({name:'footer', style:'display:none;align-items:flex-start;gap:1em;padding:0;margin:0;box-sizing:border-box;font-family:monoscape;font-size:16px;line-height:1em;'},
            //const f = Dom.tags.div({name:'footer', style:'display:flex;align-items:flex-start;gap:1em;position:absolute;bottom:0;padding:0;margin:0;box-sizing:border-box;font-family:monoscape;font-size:16px;'},
//            const f = Dom.tags.div({name:'footer', style:'display:flex;align-items:flex-start;gap:1em;padding:0;margin:0;box-sizing:border-box;font-family:monoscape;font-size:16px;'},
                Dom.tags.div({name:'time', style:'display:block;padding:0;margin:0;box-sizing:border-box;font-family:monoscape;'}, '00:00'),
                Dom.tags.div({name:'nombre', style:'display:flex;align-items:flex-start;padding:0;margin:0;box-sizing:border-box;font-family:monoscape;'}, 
                    Dom.tags.span({name:'nowPage'}, '0'),
                    '/',
                    Dom.tags.span({name:'allPage'}, '0'),
                ),
                //Dom.tags.div({name:'title', style:`display:block;padding:0;margin:0;box-sizing:border-box;font-family:monoscape;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;inline-size:${calc.inlineSize}px;}`}, '作品名０１２３４５６７８９０１２３４５６７８９０１２３４５６７８９０１２３４５６７８９０１２３４５６７８９０１２３４５６７８９０１２３４５６７８９０１２３４５６７８９０１２３４５６７８９０１２３４５６７８９０１２３４５６７８９０１２３４５６７８９０１２３４５６７８９０１２３４５６７８９０１２３４５６７８９０１２３４５６７８９０１２３４５６７８９０１２３４５６７８９'),
                Dom.tags.div({name:'title', style:`display:block;padding:0;margin:0;box-sizing:border-box;font-family:monoscape;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}`}, '作品名'),
                Dom.tags.div({name:'setting', style:'display:block;padding:0;margin:0;box-sizing:border-box;font-family:monoscape;'}, '⚙'),
            );
//            book.appendChild(f); return f;
            this._.O.viewer.appendChild(f); return f;
//            this._.O.viewer.querySelector(`[name="book"]`).appendChild(f); return f;
//            this._.O.viewer.appendChild(f); return f;
        }
    }
    #setSize() {
        const inlineSize = this.#isVertical ? this._.O.height : this._.O.width;
//        const blockSize = this.#isVertical ? this._.O.width: this._.O.height;
        const blockSize = (this.#isVertical ? this._.O.width: this._.O.height - 16); // -16はfooter
        const columnCount = 1040 < inlineSize ? 2 : 1;
        const columnWidth = 1===columnCount ? inlineSize : inlineSize + Css.getFloat('--column-gap')
        Css.set('--writing-mode', this._.O.writingMode);
        //Css.set(`--page-inline-size`, `${this.#isVertical ? this._.O.height : this._.O.width}px`);
        Css.set(`--page-inline-size`, `${inlineSize}px`);
        Css.set(`--page-block-size`, `${blockSize}px`);
        //Css.set(`--column-count`, `2`);
        Css.set(`--column-count`, `${columnCount}`);
        console.log('columnCount:', columnCount, 'inline:', inlineSize, 'block:', blockSize, 'mode:', this._.O.writingMode);
        const inlineChars = ((40 + (40*Css.getFloat('--letter-spacing'))) * columnCount) + Css.getFloat('--column-gap');
        const inlineFtSz = Math.max(16, inlineSize/inlineChars);
        Css.set(`--font-size`, `${inlineFtSz}px`);
        console.log('font-size:', inlineFtSz);
        //Math.max(16, inlineSize/(40+(1===columnCount ? 0 : Css.getFloat('--column-gap'))+(40*Css.getFloat('--letter-spacing'))));

        this._.O.viewer.style.blockSize = `${blockSize + 16}px`;
        this._.O.viewer.style.inlineSize = `${inlineSize}px`;
        this._.O.editor.style.blockSize = `${blockSize + 16}px`;
        this._.O.editor.style.inlineSize = `${inlineSize}px`;
        return {
            inlineSize: inlineSize,
            blockSize: blockSize,
            columnCount: columnCount,
            columnWidth: columnWidth,
            inlineFontSize: inlineFtSz,
        }
    }
    async #setup() {
        const calc = this.#setSize();
        console.log('calc:', calc);
        console.log('JavelViewer#setup() writingMode:', Css.get('--writing-mode'), Css.get('--page-inline-size'), Css.get('--page-block-size'), this.#isVertical, this._.O.width, this._.O.height);
//        ['width', 'height'].map(n=>Css.set(`--page-${this.isVertical ? '' : n}-size`, `${n}px`));
        //['inline', 'block'].map(n=>Css.set(`--page-${n}-size`, Css.getInt(`${n}-size`, O.viewer}+'px'));
        /*
        Css.set('--page-inline-size', `${Css.getInt('inline-size', O.viewer}px`);
        Css.set('--page-block-size', `${Css.getInt('block-size', O.viewer}px`);
        const W = Css.getInt('inline-size', Dom.q(`[name="demo-edit"]`));
        const H = Css.getInt('block-size', Dom.q(`[name="demo-edit"]`));
//        const W = Css.getInt('width', Dom.q(`[name="demo-edit"]`));
//        const H = Css.getInt('height', Dom.q(`[name="demo-edit"]`));
        Css.set('--page-inline-size', `${H}px`);
        Css.set('--page-block-size', `${W}px`);
        console.log('Demo W:H ', W, H);
        */
        /*
        */
        this.#makeLoading();
        await this.#load();
        //this._.O.viewer.querySelector('[name="error"]').style.display = 'none';
        this._.O.viewer.querySelector('[name="loading"]').style.display = 'block';
        const book = this.#makeBookDiv();
        const footer = this.#makeFooter(book, calc);
        //for await (let page of this._.splitter.generateAsync()) {
        for await (let page of this._.splitter.generateAsync(this._.O.viewer)) {
            console.log('ページ数:',page.dataset.page)
            book.appendChild(page);
            this._.O.viewer.querySelector('[name="loading-all-page"]').textContent = page.dataset.page;
            this._.O.viewer.querySelector('[name="loading-rate"]').textContent = `${this._.parser.body.progress.rate.toFixed(100===this._.parser.body.progress.rate ? 0 : 1)}%`;
            /*
            this._.O.viewer.appendChild(page);
            this._.O.viewer.querySelector('[name="loading-all-page"]').textContent = page.dataset.page;
            this._.O.viewer.querySelector('[name="loading-rate"]').textContent = `${this._.parser.body.progress.rate.toFixed(100===this._.parser.body.progress.rate ? 0 : 1)}%`;
            */
        }
        this._.O.viewer.querySelector('[name="loading"]').style.display = 'none';
        footer.style.display = 'flex';
        // ノンブルを表示する（未実装）
//        this._.O.viewer.querySelector('[name="loading-all-page"]').textContent = `${this._.O.viewer.querySelector(`[data-page]:last-child`).dataset.page}`;
        this._.O.viewer.querySelector('[name="loading-all-page"]').textContent = `${book.querySelector(`[data-page]:last-child`).dataset.page}`;
        //this._.O.viewer.querySelector('.page:not(.dummy)').classList.add('show');
        book.querySelector('.page:not(.dummy)').classList.add('show');
        this.#listen();
        this._.O.viewer.focus();
        /*
        const res = await fetch('asset/javel/intro.jv');
        const txt = await res.text();
        Dom.q(`[name="demo-edit"]`).value = txt;
        parser.manuscript = txt;
        for await (let page of splitter.generateAsync()) {
            Dom.q(`[name="demo-view"]`).appendChild(page);
        }
        Dom.q(`[name="demo-view"] *.page:not(.dummy)`).classList.add('show');
        this._.viewer.width = Css.getFloat('width', Dom.q('[name="demo-view"]'));
        this._.viewer.height = Css.getFloat('height', Dom.q('[name="demo-view"]'));
        //this._.viewer.writingMode = Css.get('writing-mode', Dom.q('[name="demo-view"]'));
        this.#listen();
        Dom.q(`[name="demo-view"]`).focus();
        */
    }
    #listen() {
        console.log('listen()');
        //Dom.q(`[name="demo-view"]`).listen('click', async(e)=>{
        this._.O.viewer.addEventListener('click', async(e)=>{
//            const nowPage = Dom.q(`[name="demo-view"] *.page.show:not(.dummy)`);
            const nowPage = this._.O.viewer.querySelector('.page.show:not(.dummy)');
            console.log(nowPage)
            if (this.#isHorizontal) {
                if (this.#isClickLeft(e.clientX)) {this.#prevPage(nowPage)}
                else {this.#nextPage(nowPage)}
            } else {
                if (this.#isClickRight(e.clientX)) {this.#prevPage(nowPage)}
                else {this.#nextPage(nowPage)}
            }
            console.log(this.#isHorizontal, this.#isClickLeft(e.clientX), this._.O.viewer.width, this._.O.viewer.height);
        });
//        Dom.q(`[name="demo-view"]`).setAttribute('tabindex', '0');
//        Dom.q(`[name="demo-view"]`).addEventListener('keyup', async(e)=>{
        this._.O.viewer.addEventListener('keyup', async(e)=>{
            //const nowPage = Dom.q(`[name="demo-view"] *.page.show:not(.dummy)`);
            const nowPage = this._.O.viewer.querySelector('.page.show:not(.dummy)');
            if (e.shiftKey) {
                if ([' ', 'Enter'].some(k=>k===e.key)) {this.#prevPage(nowPage);}
            } else {
                if ([' ', 'Enter'].some(k=>k===e.key)) {this.#nextPage(nowPage);}
                else if ('Escape'===e.key) {} // 設定画面表示
                else if ('ArrowLeft'===e.key) {this.#isHorizontal ? this.#prevPage(nowPage) : this.#nextPage(nowPage);}
                else if ('ArrowRight'===e.key) {this.#isHorizontal ? this.#nextPage(nowPage) : this.#prevPage(nowPage);}
                else if ('n'===e.key) {this.#nextPage(nowPage)}
                else if ('p'===e.key) {this.#prevPage(nowPage)}
            }
        });
    }
    #isValidWritingMode(v) {return ['horizontal-tb', 'vertical-rl'].some(n=>n===v)}
    /*
    get #isHorizontal() {return this._.viewer.writingMode.startsWith('h')}
    get #isVertical() {return this._.viewer.writingMode.startsWith('v')}
    #isClickLeft(x, y) {return x < (this._.viewer.width / 2)}//画面を左右に二分割したとき左半分をクリックしたか
    #isClickRight(x, y) {return (this._.viewer.width / 2) <= x}//画面を左右に二分割したとき左半分をクリックしたか
    */
    get #isHorizontal() {return this._.O.writingMode.startsWith('h')}
    get #isVertical() {return this._.O.writingMode.startsWith('v')}
    #isClickLeft(x, y) {return x < (this._.O.width / 2)}//画面を左右に二分割したとき左半分をクリックしたか
    #isClickRight(x, y) {return (this._.O.width / 2) <= x}//画面を左右に二分割したとき左半分をクリックしたか
    #nextPage(nowPage) {
        if (nowPage.nextElementSibling) {
            if (this.#isSelection) {return}
            console.log('次に進む', nowPage);
            if (!nowPage.nextElementSibling.classList.contains('page') || nowPage.nextElementSibling.classList.contains('dummy')) {}// 最初のページで前に戻ろうとしても次に進む
            else {
                nowPage.nextElementSibling.classList.add('show');
                nowPage.classList.remove('show');
            }
        //} else {this.#prevPage(nowPage)} // 最期のページで次に進もうとしても前に戻る
        } // 最期のページで次に進もうとしても何もしない
    }
    #prevPage(nowPage) {
        if (nowPage.previousElementSibling) {
            if (this.#isSelection) {return}
            console.log('前に戻る', nowPage);
            //if (!nowPage.previousElementSibling.classList.contains('page')) {return}// 最初のページで前に戻ろうとしてもerrorやloadingは表示しない
            if (!nowPage.previousElementSibling.classList.contains('page') || nowPage.previousElementSibling.classList.contains('dummy')) {this.#nextPage(nowPage)}// 最初のページで前に戻ろうとしても次に進む
            else {
                nowPage.previousElementSibling.classList.add('show');
                nowPage.classList.remove('show');
            }
        //} else {this.#nextPage(nowPage)} // 最初のページで前に戻ろうとしても次に進む
        } // 最初のページで前に戻ろうとしても何もしない
    }
    get #isSelection() {return 0 < window.getSelection().toString().length;}
}
window.JavelViewer = JavelViewer;
})();
