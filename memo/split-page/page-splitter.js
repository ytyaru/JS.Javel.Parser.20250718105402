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
