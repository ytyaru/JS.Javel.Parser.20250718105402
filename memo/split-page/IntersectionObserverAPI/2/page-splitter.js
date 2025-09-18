class PageSplitter {
    constructor(target=null, inlineSize=640, blockSize=480, isHorizontal=false) {
        this._ = {};
        this._.dummy = new DummyPage();
        this._.target = target ?? document.body;
        this.target = this._.target;
        this._.size = {inline:inlineSize, block:blockSize}
        this._.writingMode = isHorizontal ? 'horizontal-tb' : 'vertical-rl';
        this._.pages = [];
        console.log(this._.dummy.isIntersecting);
//        document.body.appendChild(this._.dummy.el)
        console.log(this._.dummy.isIntersecting);
    }
    get target() {return this._.target}
    set target(v) {if (Type.isEl(v)){this._.target=v; this._.target.appendChild(this._.dummy.el);}}
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
            this._.dummy.el.appendChild(el); // ブロック要素単位（h, p）
            /*
            console.log(this._.dummy.isIntersecting);
            if (!this._.dummy.isIntersecting) {// 範囲外なら
                this._.dummy.el.removeChild(el);
//                if ('P'===el.tagName) {this.#splitNodes(el);}// もしp要素ならinline要素単位で分割し挿入する
                if ('P'===el.tagName) {this.#splitNodes(Array.from(el.childNodes));}// もしp要素ならinline要素単位で分割し挿入する
                else {this.#makePage(el);}// ELEMENT_NODEをdummyの先頭に追記する（この時点で収まりきらないサイズになることは想定外であるため必ず範囲内に収めること）
            }
            */
        }
//        this.#makePage();
        this._.dummy.hide();
    }
    #splitNodes(nodes) {// 引数のp要素内にあるnodes(inline要素とtextNode)を順に処理する。収まりきらなかった超過分nodeを返す。
//        if (nodes.length < 2) {return nodes}
        const p = Dom.tags.p();
        this._.dummy.el.appendChild(p);
        this._.dummy.observe(p);
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
        this._.dummy.el.appendChild(p);
        this._.dummy.observe(p);
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
        page.classList.remove('show');
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

class PageMaker {
    constructor(dummyEl) {
        this._ = {};
        this._.dummyEl = dummyEl;
        this._.pages = [];
    }
    get pages() {return this._.pages}
    make(n) {// n:残留TextNode or 文字列
        // ページを追加する
        const page = this._.dummyEl.cloneNode(true);
        page.classList.remove('dummy');
        page.classList.remove('show');
        this._.pages.push(page);
        // ダミーを初期化し残留テキストを追加する
        this._.dummyEl.innerHTML = '';
        if (!(n instanceof Node || Type.isStrs(n))) {return}
        this._.dummyEl.appendChild(((n instanceof Node && Node.TEXT_NODE===n.nodeType) || Type.isStrs(n)) ? Dom.tags.p(n) : n);
//        this._.dummy.observe(this._.dummy.el.lastChild);
//        if ((n instanceof Node && Node.TEXT_NODE===n.nodeType) || Type.isStrs(n)) {this._.dummy.el.appendChild(Dom.tags.p(n))}
//        if (n instanceof Node && Node.ELEMENT_NODE===n.nodeType) {this._.dummy.el.appendChild(n)}
    }
}
class DummyPage {
    constructor() {
        this._ = {}
        this._.el = Dom.tags.div({class:'dummy page'});
//        this._.isIntersecting = false;
        this._.iobserver = null;
        this._.mobserver = null;
        this.#make();
        this._.pm = new PageMaker(this._.el);
    }
    get el() {return this._.el}
    get isIntersecting() {return this._.isIntersecting}
    get pages() {return this._.pm.pages}
    show() {this._.el.classList.add('show')}
    //hide() {console.log('hide():', this._.el, this._.el.classList, this._.el.classList.contains('show'));this._.el.classList.remove('show');console.log(this._.el.classList.contains('show'));}
    hide() {
        console.log('hide():', this._.el, this._.el.classList, this._.el.classList.contains('show'));
        this._.el.classList.remove('show');
        console.log(this._.el.classList.contains('show'));
        console.log(this._.el===document.body.querySelector('.dummy.page'));
    }
    #make() {
        this._.iobserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                this._.isIntersecting = entry.isIntersecting;
                console.log('intersect:', this._.isIntersecting, entry);
                if (!this._.isIntersecting) {
                    this._.pm.make();
                }
            });
        }, {root:this._.el, rootMargin:'0px', threshold:1.0});
        this._.mobserver = new MutationObserver((mutationsList, observer) => {
            console.log('Mutation:', mutationsList);
            for (const mutation of mutationsList) {
//                console.log(mutation);
                //if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                if (mutation.addedNodes.length > 0) {
                    console.log(mutation);
                    let lastEl = [...mutation.addedNodes].at(-1);
                    if (Node.TEXT_NODE===lastEl.nodeType) {lastEl = lastEl.parentElement;}
                    if (Node.ELEMENT_NODE===lastEl.nodeType) {this.observe(lastEl);}// 最後のELEMENT_NODEを監視対象にする
                        /*
                    console.log([...mutation.addedNodes]);
                    const lastNode = [...mutation.addedNodes].filter(n=>Node.ELEMENT_NODE===n.nodeType).at(-1);
                    console.log(lastNode);
                    this.observe(lastNode);// 最後のELEMENT_NODEを監視対象にする
                    */
                    /*
                    mutation.addedNodes.forEach(node => {
                        // 追加されたノードが子要素であるか確認 (DOM要素のみを監視)
                        if (node.nodeType === Node.ELEMENT_NODE && node.classList.contains('child-element')) {
                            console.log('新しい子要素が追加されました:', node);
                            // 追加された子要素をIntersection Observerの監視対象に追加
                            this._.observe(node);
                        }
                    });
                    */
                }
            }
        });
        this._.mobserver.observe(this._.el, {childList:true, subtree:true});
    }
    observe(el) {// 引数elがdummypage内にあるか判定する
        console.log('observe():',el);
//        if (!Type.isEl(el)) {throw new TypeError(`引数elはHTML要素であるべきです。`)}
        this._.iobserver.disconnect();
        this._.iobserver.observe(el);
    }
}
