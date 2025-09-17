class PageSplitter {
    constructor(inlineSize=640, blockSize=480, isHorizontal=false) {
        this._ = {};
        this._.size = {inline:inlineSize, block:blockSize}
        this._.writingMode = isHorizontal ? 'horizontal-tb' : 'vertical-rl';
        this._.dummy = new DummyPage();
        document.body.appendChild(this._.dummy.el);
        this._.pages = [];
    }
    get pages() {return this._.pages}
    split(els) {
        this._.dummy.show();
        this._.pages = [];
        for (let el of els) {
            this._.dummy.el.appendChild(el); // ブロック要素単位（h, p）
            if (this._.dummy.without) {
                this._.dummy.el.removeChild(el);
                if ('P'===el.tagName) {const n = this.#splitNodes([...el.childNodes]); if(n){this.#makePage(n)}}// もしp要素ならinline要素単位で分割し挿入する
                else {this.#makePage(el)}//BlockElement単体(h,p)で画面サイズ超過するのは想定外(ruby,em,br等は全て単体で画面要素内に収まる事)
            }
        }
        this.#makePage();
        this._.dummy.hide();
    }
    #splitNodes(nodes) {
        const p = this.#makeFirstP(true);
        if (this._.dummy.without) {this._.dummy.el.removeChild(p); return nodes;}
        let i = 0;
        for (i=0; i<nodes.length; i++) {
            p.appendChild(nodes[i]);
            if (this._.dummy.without) {
                p.removeChild(nodes[i]);
                if (Node.TEXT_NODE===nodes[i].nodeType) {this.#splitLetters(nodes[i].textContent.Graphemes)}
                else {this.#makePage(); return this.#splitNodes(nodes.slice(i));}// 再帰する
            }
        }
    }
    #splitLetters(letters) {//letters:node.textContent.Graphemes 一文字単位の配列
        console.log('#splitLetters():', letters);
        const p = this.#makeFirstP();
        console.log(p, this._.dummy.el);
        for (let i=0; i<letters.length; i++) {
            p.append(letters[i]);
            if (this._.dummy.without) {
                const lastNode = [...p.childNodes].at(-1);
                lastNode.textContent = lastNode.textContent.slice(0, -1);
                this.#makePage();
                this.#splitLetters(letters.slice(i));
                return;
            }
        }
    }
    #makePage(n) {// n:残留TextNode or 文字列
        // ページを追加する
        const page = this._.dummy.el.cloneNode(true);
        page.classList.remove('dummy');
        page.classList.remove('show');
        page.dataset.page = this._.pages.length + 1;
        this._.pages.push(page);
        // ダミーを初期化し残留テキストを追加する
        this._.dummy.el.innerHTML = '';
        this._.dummy.el.append(...this.#getChildren(n))
    }
    #getChildren(n) {
        if (n instanceof Node && Node.TEXT_NODE===n.nodeType) {return [Dom.tags.p(n)]}
        else if (Type.isStrs(n)) {return [Dom.tags.p(n.join(''))]}
        else if (n instanceof Node) {return [n]}
        else if (Type.isAry(n) && n.every(v=>v instanceof Node)) {return n}
        else if (undefined===n || null===n) {return []}
        else {console.log(n);throw new TypeError(`要素が不正値です。`)}
    }
    #makeFirstP(isForce=false) {// isForce:強制作成  dummyに<p>が一つも無いなら作成しDOM追加し返す。但し引数がtrueなら強制的に作成＆追加する
        if (isForce || !this._.dummy.el.querySelector(`p:last-child`)) {this._.dummy.el.appendChild(Dom.tags.p())}
        return this._.dummy.el.querySelector(`p:last-child`);
    }
}
class Page {
    static make() {return Dom.tags.div({class:'page'})}
    constructor() {this._ = {}; this._.el = Dom.tags.div({class:'page'}); this._writingMode='vertical-rl';}
    get el() {return this._.el}
    show() {this._.el.classList.add('show')}
    hide() {this._.el.classList.remove('show')}
    get isVertical() {return 'vertical-rl'===this._.writingMode}
    set isVertical(v) {if (Type.isBln(v)) {this._.writingMode = v ? 'vertical-rl' : 'horizontal-tb'}}
    get isHorizontal() {return 'horizontal-tb'===this._.writingMode}
    set isHorizontal(v) {if (Type.isBln(v)) {this._.writingMode = v ? 'horizontal-tb' : 'vertical-rl'}}
    get without() {
        if (null===this._.el.lastElementChild) {return false}
        // writingModeを取得する。block方向に超過したか確認し、超過ならtrueを返す
        const r = this._.el.lastElementChild.getBoundingClientRect();
        return this.isVertical ? (r.left < 0) : (Css.getFloat(`--page-block-size`) < r.bottom);
    }
}
class DummyPage extends Page {constructor() {super(); this._.el.classList.add('dummy');}}

