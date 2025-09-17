class PageSplitter {
    constructor(target=null, inlineSize=640, blockSize=480, isHorizontal=false) {
        this._ = {};
        this._.target = target;
        this._.size = {inline:inlineSize, block:blockSize}
        this._.writingMode = isHorizontal ? 'horizontal-tb' : 'vertical-rl';
        this._.dummy = new DummyPage();
        this._.pages = [];
        console.log(this._.dummy.isIntersecting);
        document.body.appendChild(this._.dummy.el)
        console.log(this._.dummy.isIntersecting);
    }
    get target() {return this._.target}
    set target(v) {if (Type.isEl(v)){this._.target=v}}
//    #addTarget() {if (Type.isEl(this._.target) && !document.body.querySelector(this._.target)) {}}
    get isVertical() {return 'vertical-rl'===this._.writingMode}
    set isVertical(v) {if (Type.isBln(v)) {this._.writingMode = v ? 'vertical-rl' : 'horizontal-tb'}}
    get isHorizontal() {return 'horizontal-tb'===this._.writingMode}
    set isHorizontal(v) {if (Type.isBln(v)) {this._.writingMode = v ? 'horizontal-tb' : 'vertical-rl'}}
    get size() {return ({inline:this._.size.inline, block:this._.size.block})}
    set size(v) {
        const names = 'inline block'.split(' ');
        if (Type.isObj(v) && names.every(n=>v.hasOwnProperty(n) && Type.isNum(v[n]))) {
            names.every(n=>this._.size[n] = v[n]);
//            this._.size.inline = v.inline;
//            this._.size.block = v.block;
        }
    }
    get pages() {return this._.pages}
    split(els) {
        this._.pages = [];
        this._.dummy.show();
        for (let el of els) {
            this._.dummy.observe(el);
            console.log(this._.dummy.isIntersecting);
            this._.dummy.el.appendChild(el); // ブロック要素単位（h, p）
            if (!this._.dummy.isIntersecting) {// 範囲外なら
                this._.dummy.el.removeChild(el);
//                if ('P'===el.tagName) {this.#splitNodes(el);}// もしp要素ならinline要素単位で分割し挿入する
                if ('P'===el.tagName) {this.#splitNodes(Array.from(el.childNodes));}// もしp要素ならinline要素単位で分割し挿入する
                else {this.#makePage(el);}// ELEMENT_NODEをdummyの先頭に追記する（この時点で収まりきらないサイズになることは想定外であるため必ず範囲内に収めること）
            }
        }
        this.#makePage();
        this._.dummy.hide();
    }
    #splitNodes(nodes) {// 引数のp要素内にあるnodes(inline要素とtextNode)を順に処理する。収まりきらなかった超過分nodeを返す。
//        if (nodes.length < 2) {return nodes}
        const p = Dom.tags.p();
        this._.dummy.observe(p);
        this._.dummy.el.appendChild(p);
        if (!this._.dummy.isIntersecting) {this._.dummy.el.removeChild(p); this.#makePage(nodes);}
        for (let i=0; i<nodes.length; i++) {
            p.appendChild(nodes[i]);
//            this._.dummy.observe(nodes[i]);
//            this._.dummy.el.appendChild(nodes[i]);
            if (!this._.dummy.isIntersecting) {// 範囲外なら
                //this._.dummy.el.removeChild(nodes[i]);
                p.removeChild(nodes[i]);
                if (Node.TEXT_NODE===nodes[i].nodeType) {this.#makePage(this.#splitTextNode(nodes[i]));}
                else {this.#makePage(nodes[i]);}//ELEMENT_NODEをdummyの先頭に追記する(この時点で収まりきらないサイズになることは想定外であるため必ず範囲内に収めること)
            }
        }
        return []
    }
    /*
    #splitNodes(p) {// 引数のp要素内にあるnodes(inline要素とtextNode)を順に処理する。収まりきらなかった超過分nodeを返す。
        const nodes = Array.from(p.childNodes);
        if (nodes.length < 2) {return nodes}
//        const p = Dom.tags.p();
//        if (!this._.dummy.isIntersecting) {this._.dummy.el.removeChild(p); this.#makePage(nodes[i]);}
        for (let i=0; i<nodes.length; i++) {
            this._.dummy.observe(nodes[i]);
            this._.dummy.el.appendChild(nodes[i]);
            if (!this._.dummy.isIntersecting) {// 範囲外なら
                this._.dummy.el.removeChild(nodes[i]);
                if (Node.TEXT_NODE===nodes[i].nodeType) {this.#makePage(this.#splitTextNode(nodes[i]));}
                else {this.#makePage(nodes[i]);}//ELEMENT_NODEをdummyの先頭に追記する(この時点で収まりきらないサイズになることは想定外であるため必ず範囲内に収めること)
            }
        }
        return []
    }
    */
    #splitTextNode(node) {// 引数のTextNodeにある字を順に追加する。収まりきらなかった超過分の字を返す。
        const p = Dom.tags.p();
        this._.dummy.observe(p);
        this._.dummy.el.appendChild(p);
        if (!this._.dummy.isIntersecting) {this._.dummy.el.removeChild(p); return node;}// 範囲外ならnode丸ごと返す
        const gs = node.Graphemes;
//        for (let g of node.Graphemes) {
        for (let i=0; i<gs.length; i++) {
            p.appendChild(gs[i]);
            if (!this._.dummy.isIntersecting) {// 範囲外なら
                if (0===i) {this._.dummy.el.removeChild(p); return node;} // 全部超過したので全部返す
                else {return gs.slice(i);} // 超過した字を返す
            }
        }
    }
    #makePage(n) {// n:残留TextNode or 文字列
        // ページを追加する
        const page = this._.dummy.el.cloneNode(true);
        page.classList.remove('dummy');
        this._.pages.push(page);
        // ダミーを初期化し残留テキストを追加する
        this._.dummy.el.innerHTML = '';
        if (!(n instanceof Node || Type.isStrs(n))) {return}
        this._.dummy.el.appendChild(((n instanceof Node && Node.TEXT_NODE===n.nodeType) || Type.isStrs(n)) ? Dom.tags.p(n) : n);
        this._.dummy.observe(this._.dummy.el.lastChild);
//        if ((n instanceof Node && Node.TEXT_NODE===n.nodeType) || Type.isStrs(n)) {this._.dummy.el.appendChild(Dom.tags.p(n))}
//        if (n instanceof Node && Node.ELEMENT_NODE===n.nodeType) {this._.dummy.el.appendChild(n)}
    }
}
class DummyPage {
    constructor() {
        this._ = {}
        this._.el = Dom.tags.div({class:'dummy page'});
        this._.observer = null;
        this.#make();
    }
    get el() {return this._.el}
    get isIntersecting() {return this._.isIntersecting}
    show() {this._.el.classList.add('show')}
    hide() {this._.el.classList.remove('show')}
    #make() {
        this._.observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                this._.isIntersecting = entry.isIntersecting;
                console.log(entry);
                /*
                if (entry.isIntersecting) {
                    console.log('要素が画面内に入りました');
                } else {
                    console.log('要素が画面外に出ました');
                }
                */
            });
//        }, {threshold:1.0});
        }, {root:this._.el, threshold:1.0});
//        this._.observer.observe(this._.el);
    }
    observe(el) {// 引数elがdummypage内にあるか判定する
//        if (!Type.isEl(el)) {throw new TypeError(`引数elはHTML要素であるべきです。`)}
        this._.observer.disconnect();
        this._.observer.observe(el);
    }
    /*
    #reset() {
        this._.observer.disconnect();
        this._.observer.observe(this._.el);
    }
    */
}
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
