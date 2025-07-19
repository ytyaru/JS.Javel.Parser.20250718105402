(function() {// ページ分割（画面内に収まる単位毎に<div>要素で区切る）
/*
PageTypes.ary
PageTypes.valid()
Page.getSplitter(type, target, make)
Page.getElement(type) // ダミーに使う

const PageTypes = [ScrollPage, SlidePage, NovelPage];
pagers = PageTypes.map(t=>new t());
pagers.findIndex(p=>p.id===type)
pagers.findIndex(p=>p.constructor.name.toLowerCase()===`${type}Page`.toLowerCase())

*/
class PageTypes {
    static get ary() {return [ScrollPage, SlidePage, NovelPage]}
    constructor() {this._ = {inss: PageTypes.ary.map(t=>new t(t.name.replace('Page','').Chain))}; console.log(this._.inss);}
    get types() {return PageTypes.ary}
    get instances() {return this._.inss}
    //get ids() {return this._.inss.map(i=>i.constructor.name.replace('Page','').Chain)}
    get ids() {return this._.inss.map(i=>i.typeId)}
    //get(type) {return this._.inss.find(i=>i.constructor.name.toLowerCase()===`${type}Page`.toLowerCase())}
    get(typeId) {return this._.inss.find(i=>i.typeId===typeId)}
    has(typeId) {return !!this.get(type)}
}
class PageTypeSplitter {//特定のタイプにおけるページ分割者（）
    constructor(typeId, target=document) {
        this._ = {typeId:typeId, el:{target:target, dummy:null, page:null}, size:{inline:0, block:0}}
        'inline block'.split(' ').map(n=>this._.size[n]=parseFloat(getComputedStyle(document.querySelector(`:root`)).getPropertyValue(`--page-${n}-size`)));
    }
    get typeId() {return this._.typeId}
    get target() {return this._.el.target}
    set target(v) {if (Type.isEl(v)){this._.el.target=v}}
    get size() {return [this._.size.inline, this._.size.block]}
    set size(v) {
        if (Array.isArray(v) && 2===v.length && v.every(x=>null!==x && !Number.isNaN(x) && 'number'===x)) {
            this._.size.inline = v[0];
            this._.size.block = v[1];
            this.resize();
        }
    }
    redom(els) {this.#removeEls(); this.#appendEls(this.make(els));}
    #removeEls() {while(this._.el.target.firstChild) {this._.el.target.firstChild.remove()}}
    //#appendEls(children) {this._.el.target.append(...children)}
    #appendEls(children) {if (Type.isEl(this._.el.target)) {this._.el.target.append(...children)}}
    make(els) {return els}
    _make(fn) {
        // ダミーを生成する
        if (!this._.el.dummy) {this._.el.dummy=this._makePageEl(true);console.log(document.body);document.body.append(this._.el.dummy);}
        const pages = []
        //const pages = fn(pages); // ページに収まるか計算してページ追加する
        fn(pages); // ページに収まるか計算してページ追加する
        // ダミーを削除する
        this._.el.dummy.remove();
        this._.el.dummy = null;
        this._setupShow(pages);
        return pages;
    }

    /*
    _make(pages, fn) {
        // ダミーを生成する
        if (!this._.el.dummy) {this._.el.dummy=this._makePageEl(true);document.body.append(this._.el.dummy);}
        fn(pages); // ページに収まるか計算してページ追加する
        // ダミーを削除する
        this._.el.dummy.remove();
        this._.el.dummy = null;
        this._setupShow(pages);
        return pages;
    }
    */
    _setupShow(pages) {pages[0].classList.add('show');}
    get firstPage() {return this._.el.target.querySelector(`.page:first-child`)}
    get lastPage() {return this._.el.target.querySelector(`.page:last-child`)}
    get nowPage() {console.log(this._.el, this._.el.target);return this._.el.target.querySelector(`.page.show`)}
    get nowPageNum() {return parseInt(this.nowPage.dataset.page)}
    get allPageNum() {return parseInt(this.lastPage.dataset.page)}
    showNextPage() {return this.#showNeary(false)}
    showPrevPage() {return this.#showNeary(true)}
    #showNeary(isPrev=false) {
        const target = this._.el.target.querySelector(`.page.show`)[`${isPrev ? 'previous' : 'next'}ElementSibling`];
        this._.el.target.querySelector(`.page.show`).classList.remove('show');
        console.log((target ?? (isPrev ? this.lastPage : this.firstPage)), this.lastPage , this.firstPage);
        (target ?? (isPrev ? this.lastPage : this.firstPage)).classList.add('show');
    }
    showPage(p) {//p:自然数
        const pages = [...this._.el.target.querySelectorAll(`.page`)];
        if (!(Number.isSafeInteger(p) && 0<p && p<=pages.length)) {throw new RangeError(`範囲外です。`)}
        for (let i=0; i<pages.length; i++) {
            if (p===i) {pages[i].classList.add('show');return;}
        }
    }
    _within(r) {return this._.size.block < r.bottom}
}
class ScrollPage extends PageTypeSplitter {
    constructor(typeId,target=document){super(typeId,target)}
    make(els) {return els}
}
class SlidePage extends PageTypeSplitter {
    constructor(typeId,target=document){super(typeId,target)}
//    make(els) {return this._make((pages)=>this.#make(els, pages))}
//    make(els) {return this._make((pages)=>this.__make(els, pages, (pages,el,count)=>this.#make(pages, el, count)))}
    make(els) {return this._make((pages)=>this.__make(els, pages))}
    /*
    #make(els, pages) {
        let page = null;
        let count = 1;
        for (let el of els) {
            this._.el.dummy.append(el);
            const r = el.getBoundingClientRect();
            if (this._.size.block < r.bottom) {
                pages.push(this._mkPage(count));
                this._.el.dummy.appendChild(el);
                count++;
            }
        }
        pages.push(this._mkPage(count));
    }
    */
    __make(els, pages, fn=null) {
        let page = null;
        let count = 1;
        for (let el of els) {
            this._.el.dummy.append(el);
            const r = el.getBoundingClientRect();
            /*
            if (this._.size.block < r.bottom) {
                fn(pages, el, count)
//                this.#make(pages, el, count);
//                pages.push(this._mkPage(count));
//                this._.el.dummy.appendChild(el);
                count++;
            }
            */
            if (this._within(r)) {
                if (Type.isFn(fn)) {fn(pages, el, count)}
                pages.push(this._mkPage(count));
                this._.el.dummy.appendChild(el);
                count++;
            }
        }
        pages.push(this._mkPage(count));
    }
    /*
    #make(pages, el, count) {
        pages.push(this._mkPage(count));
        this._.el.dummy.appendChild(el);
    }
    */
    _mkPage(count=0) {
        const page = this._makePageEl();
        if (0 < count) {page.dataset.page = count;}
        while(null!==this._.el.dummy.firstChild){page.appendChild(this._.el.dummy.firstChild)}
        return page;
    }
    _makePageEl(isDummy=false) {return Dom.tags.div({class:`page${isDummy ? ' dummy' : ''}`})}
}
class NovelPage extends SlidePage {
    make(els) {return this._make((pages)=>this.__make(els, pages, (pages,el,count)=>this._splitParagraph(el)))}
    _splitParagraph(el) {// p要素ならページを跨ぐ（p要素内にある子要素をできるかぎり詰め込む）
        if ('P'!==el.tagName) {return null}
        el.remove(); // dummy配下から離脱
        const p = Dom.tags.p(); // ギリギリdummyに入るp内子要素だけを入れる
        this._.el.dummy.appendChild(p);
        let r = p.getBoundingClientRect();
        if (this._.size.block < r.bottom) {return null}
        let node = el.firstChild;
        while (node) {
            p.append(node);
            r = p.getBoundingClientRect();
            if (this._.size.block < r.bottom) {
                if (node.TEXT_NODE===node.nodeType) {//テキストノードなら単語単位で分割する
                    el.prepend(node); // p要素から離脱し元に戻す
                    let i = 0;
                    const words = node.textContent.words();
//                    console.log(words)
                    p.append('');
                    for (let i=0; i<words.length; i++) {
//                        console.log(p, p.lastChild)
                        p.lastChild.textContent += words[i];
                        r = p.getBoundingClientRect();
                        if (this._.size.block < r.bottom) {
//                            console.log(words[i], p, p.lastChild);
                            p.lastChild.textContent = p.lastChild.textContent.slice(0, words[i].length*-1);// 最後の単語を消す
                            node.textContent = words.slice(i).join(''); // 最後の単語を含むテキストを元のnodeに含める
                            return [p, node]
                        }
                    }
                }
            }
            node = el.firstChild;
        }
        throw new TypeError(`プログラムエラー。全部入るなら最初からそうすべき。`)
    }
}
window.PageTypes = PageTypes;
})();
