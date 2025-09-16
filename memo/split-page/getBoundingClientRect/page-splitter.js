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
//    get isVertical() {return 'vertical-rl'===this._.writingMode}
    split(els) {
        //const dummy = this.#getDummyPage();
        //dummy.classList.add(`show`);
        this._.dummy.show();
        this._.pages = [];
//        let page = this.#makePage();
        for (let el of els) {
            this._.dummy.el.appendChild(el); // ブロック要素単位（h, p）
//            dummy.appendChild(el); // ブロック要素単位（h, p）
            //if (this.#without(dummy)) {
            if (this._.dummy.without) {
                this._.dummy.el.removeChild(el);
                if ('P'===el.tagName) {this.#splitNodes(el);}// もしp要素ならinline要素単位で分割し挿入する
                else {this.#makePage(el)}//BlockElement単体(h,p)で画面サイズ超過するのは想定外(ruby,em,br等は全て単体で画面要素内に収まる事)
                /*
                if ('P'===el.tagName) {// もしp要素ならinline要素単位で分割し挿入する
                    //dummy.removeChild(el);
                    //this.#splitNodes(dummy, el);
                    this.#splitNodes(el);
                } else {this.#makePage(el)}//BlockElement単体(h,p)で画面サイズ超過するのは想定外(ruby,em,br等は全て単体で画面要素内に収まる事)
                */
            }
        }
        this._.dummy.hide();
//        dummy.classList.remove(`show`);
    }
    /*
//    #getDummyPage() {if (!Dom.q(`.dummy.page`)) {document.body.appendChild(Dom.tags.div({class:'dummy page'}))} return Dom.q(`.dummy.page`)}
    #makePage() {return Dom.tags.div({class:'page'})}
    #without(page) {
        // writingModeを取得する
        // block方向に超過したか確認し、超過ならtrueを返す
        const r = page.lastElementChild.getBoundingClientRect();
        return this.isVertical ? (r.left < 0) : (this._.size.block < r.bottom);
    }
    */
    #splitNodes(p) {// 引数のp要素内にあるnodes(inline要素とtextNode)を順に処理する。収まりきらなかった超過分を返す。
        const nodes = Array.from(p.childNodes);
        if (nodes.length < 2) {return nodes}
        for (let i=0; i<nodes.length; i++) {
            this._.dummy.el.appendChild(nodes[i]);
            if (this._.dummy.without) {
                this._.dummy.el.removeChild(nodes[i]);
                this.#makePage(Node.TEXT_NODE===nodes[i].nodeType ? this.#splitTextNode(nodes[i]) : nodes.slice(i));
//                if (Node.TEXT_NODE===nodes[i].nodeType) {this.#makePage(this.#splitTextNode(nodes[i]));}
//                else {this.#makePage(nodes.slice(i));}//p要素内ElementNode単体で画面サイズ超過するのは想定外(ruby,em,br等は全て単体で画面要素内に収まる事)
            }
        }
    }
    #splitTextNode(node) {
        const p = Dom.tags.p();
        this._.dummy.el.appendChild(p);
        if (this._.dummy.without) {this._.dummy.el.removeChild(p); return node;}
        const gs = node.Graphemes;
        for (let i=0; i<gs.length; i++) {
            p.appendChild(gs[i]);
            if (this._.dummy.without) {
                if (0===i) {this._.dummy.el.removeChild(p); return node;}
                else {p.lastElement.textContent = p.lastElement.textContent.slice(-1); return gs.slice(i);}
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
//        if (!(n instanceof Node || Type.isStrs(n) || Type.isAry(n) && n.every(v=>v instanceof Node))) {console.log('xxxxxxxxxxxx', n);return}
//        this._.dummy.el.appendChild(((n instanceof Node && Node.TEXT_NODE===n.nodeType) || Type.isStrs(n)) ? Dom.tags.p(n) : n);
    }
    #getChildren(n) {
        if ((n instanceof Node && Node.TEXT_NODE===n.nodeType) || Type.isStrs(n)) {return [Dom.tags.p(n)]}
        else if (n instanceof Node) {return [n]}
        else if (Type.isAry(n) && n.every(v=>v instanceof Node)) {return n}
        else {throw new TypeError(`要素が不正値です。`)}
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
        // writingModeを取得する
        // block方向に超過したか確認し、超過ならtrueを返す
        const r = this._.el.lastElementChild.getBoundingClientRect();
        //return this.isVertical ? (r.left < 0) : (this._.size.block < r.bottom);
        return this.isVertical ? (r.left < 0) : (Css.getFloat(`--page-block-size`) < r.bottom);
    }
}
class DummyPage extends Page {constructor() {super(); this._.el.classList.add('dummy');}}
/*
class PageSplitter {
    constructor(inlineSize=640, blockSize=480, isHorizontal=false) {
        this._ = {};
        this._.size = {inline:inlineSize, block:blockSize}
        this._.writingMode = isHorizontal ? 'horizontal-tb' : 'vertical-rl';
    }
    get isVertical() {return 'vertical-rl'===this._.writingMode}
    split(els) {
        const dummy = this.#getDummyPage();
        this._.pages = [];
        let page = this.#makePage();
        for (let el of els) {
            dummy.appendChild(el); // ブロック要素単位（h, p）
            if (this.#without(dummy)) {
                if ('P'===el.tagName) {// もしp要素ならinline要素単位で分割し挿入する
                    dummy.removeChild(el);
                    this.#splitNodes(dummy, el);
                }
            }
        }
    }
    #getDummyPage() {if (!Dom.q(`.dummy.page`)) {document.body.appendChild(Dom.tags.div({class:'dummy page'}))} return Dom.q(`.dummy.page`)}
    #makePage() {return Dom.tags.div({class:'page'})}
    #without(page) {
        // writingModeを取得する
        // block方向に超過したか確認し、超過ならtrueを返す
        const r = page.lastElementChild.getBoundingClientRect();
        return this.isVertical ? (r.left < 0) : (this._.size.block < r.bottom);
    }
    #splitNodes(page, p) {// 引数のp要素内にあるnodes(inline要素とtextNode)を順に処理する。収まりきらなかった超過分を返す。
        const nodes = Array.from(p.childNodes);
        if (nodes.length < 2) {return nodes}
        for (let i=0; i<nodes.length; i++) {
            page.appendChild(nodes[i]);
            if (this.#without(page)) {
                page.removeChild(nodes[i]);
                if (Node.TEXT_NODE===nodes[i].nodeType) {
                    const p = this.#splitTextNode(page, nodes[i]);
                    return i===nodes.length-1 ? [p] : [p, ...nodes.slice(i+1)];
                } else {return nodes.slice(i);}
            }
        }
    }
    #splitTextNode(page, node) {
        const p = Dom.tags.p();
        page.appendChild(p);
        const gs = node.Graphemes;
//        for (let g of node.Graphemes) {
        for (let i=0; i<gs.length; i++) {
            p.appendChild(gs[i]);
            if (this.#without(page)) {

            }
        }
    }
}
*/
