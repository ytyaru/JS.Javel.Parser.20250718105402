(function() {// ページ分割（画面内に収まる単位毎に<div>要素で区切る）
class PageTypes {
    static get ary() {return [ScrollPage, SlidePage, NovelPage]}
    constructor() {this._ = {inss: PageTypes.ary.map(t=>new t(t.name.replace('Page','').Chain))}}
    get types() {return PageTypes.ary}
    get instances() {return this._.inss}
    get ids() {return this._.inss.map(i=>i.typeId)}
    get(typeId) {return this._.inss.find(i=>i.typeId===typeId)}
    has(typeId) {return !!this.get(type)}
}
class PageTypeSplitter {//特定のタイプにおけるページ分割者
    constructor(typeId, target=document) {
        this._ = {
            typeId:typeId, 
            el:{target:target, dummy:null, page:null}, 
            size:{inline:0, block:0}, is:{loaded:false}, 
            on:{loading:null},
        }
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
    /*
    async *getPage(blocks) {//
        for (let block of blocks) {
            yield page;
            await wait(2000); // 2秒間待機する
        }
    }
    */
    async update(els) {//
        if (!Type.isEl(this._.el.target)) {return}
        this._.is.loaded = false;
        console.log('update!!!!!!!!!!!!!1')
        // ダミーを生成する（座標計算に必要）
        if (!this._.el.dummy) {this._.el.dummy=this._makePageEl(true);document.body.append(this._.el.dummy);}
        const pages = []
//        fn(pages); // ページに収まるか計算してページ追加する
        this.#removeEls();
        for (let page of this._generatePages(els)) {
            if (0===pages.length) {page.classList.add('show'); console.log(page);}
            pages.push(page);
            console.log(page)
            this._.el.target.appendChild(page);
            this._.el.dummy.style.display = 'none';
            console.log(this._.on.loading)
            if (Type.isFn(this._.on.loading)){this._.on.loading(page);}
//            yield page;
            await wait(2000); // 2秒間待機する（フリーズ防止）
            this._.el.dummy.style.display = 'block';
        }
        // ダミーを削除する
        this._.el.dummy.remove();
        this._.el.dummy = null;
        this._setupShow(pages);
        this._.is.loaded = true;
        if (Type.isFn(this._.on.loaded)){this._.on.loaded(pages);}
        /*
        for (let el of els) {
            yield page;
            this.#appendEls(this.make(els));
            await wait(2000); // 2秒間待機する
        }
        */
    }
    *_generatePages(els){
        const page = this._mkPage();
        page.append(...els);
        yield page;
    }
    _mkPage(count=0) {
        const page = this._makePageEl();
        if (0 < count) {page.dataset.page = count;}
        while(null!==this._.el.dummy.firstChild){page.appendChild(this._.el.dummy.firstChild)}
        return page;
    }
    _makePageEl(isDummy=false) {return Dom.tags.div({class:`page${isDummy ? ' dummy' : ''}`})}

    redom(els) {this.#removeEls(); this.#appendEls(this.make(els));}
    #removeEls() {while(this._.el.target.firstChild) {this._.el.target.firstChild.remove()}}
    #appendEls(children) {if (Type.isEl(this._.el.target)) {this._.el.target.append(...children)}}
    make(els) {return els}
    _make(fn) {
        // ダミーを生成する（座標計算に必要）
        if (!this._.el.dummy) {this._.el.dummy=this._makePageEl(true);document.body.append(this._.el.dummy);}
        const pages = []
        fn(pages); // ページに収まるか計算してページ追加する
        // ダミーを削除する
        this._.el.dummy.remove();
        this._.el.dummy = null;
        this._setupShow(pages);
        return pages;
    }
    _setupShow(pages) {pages[0].classList.add('show');}
    get isLoaded() {return this._.is.loaded}
    get onLoading() {return this._.on.loading}
    set onLoading(v) {if (Type.isFn(v)){this._.on.loading=v;}}
    get onLoaded() {return this._.on.loaded}
    set onLoaded(v) {if (Type.isFn(v)){this._.on.loaded=v;}}
    get firstPage() {return this._.el.target.querySelector(`.page:first-child`)}
    get lastPage() {return this._.el.target.querySelector(`.page:last-child`)}
    get nowPage() {return this._.el.target.querySelector(`.page.show`)}
    get nowPageNum() {return parseInt(this.nowPage?.dataset.page)}
    get allPageNum() {return parseInt(this.lastPage?.dataset.page)}
    showNextPage() {return this.#showNeary(false)}
    showPrevPage() {return this.#showNeary(true)}
    #showNeary(isPrev=false) {
        const target = this._.el.target.querySelector(`.page.show`)[`${isPrev ? 'previous' : 'next'}ElementSibling`];
        this._.el.target.querySelector(`.page.show`).classList.remove('show');
//        console.log((target ?? (isPrev ? this.lastPage : this.firstPage)), this.lastPage , this.firstPage);
        (target ?? (isPrev ? this.lastPage : this.firstPage)).classList.add('show');
    }
    showPage(p) {//p:自然数
        const pages = [...this._.el.target.querySelectorAll(`.page`)];
        if (!(Number.isSafeInteger(p) && 0<p && p<=pages.length)) {throw new RangeError(`範囲外です。`)}
        for (let i=0; i<pages.length; i++) {
            if (p===i) {pages[i].classList.add('show');return;}
        }
    }
    //_within(el) {return this._.size.block < el.getBoundingClientRect().bottom}
    _within(el) {
        const r = el.getBoundingClientRect();
        console.log(this._.size.block, r.bottom, (r.bottom - r.top), r);
        return this._.size.block < r.bottom;
//        return this._.size.block < (r.bottom - r.top);
        //return this._.size.block < (r.bottom - r.y);
    }
}
class ScrollPage extends PageTypeSplitter {
    constructor(typeId,target=document){super(typeId,target)}
    make(els) {return els}
}
class SlidePage extends PageTypeSplitter {
    constructor(typeId,target=document){super(typeId,target)}
    make(els) {return this._make((pages)=>this.__make(els, pages))}
    __make(els, pages, fn=null) {
        let page = null;
        let count = 1;
        for (let el of els) {
            this._.el.dummy.append(el);
            if (this._within(el)) {
                if (Type.isFn(fn)) {fn(pages, el, count)}
                pages.push(this._mkPage(count));
                this._.el.dummy.appendChild(el);
                count++;
            }
        }
        pages.push(this._mkPage(count));
    }
    _mkPage(count=0) {
        const page = this._makePageEl();
        if (0 < count) {page.dataset.page = count;}
        while(null!==this._.el.dummy.firstChild){page.appendChild(this._.el.dummy.firstChild)}
        return page;
    }
    _makePageEl(isDummy=false) {return Dom.tags.div({class:`page${isDummy ? ' dummy' : ''}`})}

    /*
    *generate(els) {yield this._generate((pages)=>this.__generate(els, pages))}
    *__generate(els, pages, fn=null) {
        let page = null;
        let count = 1;
        for (let el of els) {
            this._.el.dummy.append(el);
            if (this._within(el)) {
                if (Type.isFn(fn)) {fn(pages, el, count)}
                page = this._mkPage(count);
                pages.push(page);
                this._.el.dummy.appendChild(el);
                yield page;
                count++;
            }
        }
        pages.push(this._mkPage(count));
    }
    */
    *_generatePages(els) {yield* this.__generatePages(els)}
    *__generatePages(els, fn){
        const pages = [];
        let page = null;
        let count = 1;
        for (let el of els) {
            this._.el.dummy.append(el);
            if (this._within(el)) {
                if (Type.isFn(fn)) {fn(pages, el, count)}
                page = this._mkPage(count);
                pages.push(page);
                this._.el.dummy.appendChild(el);
                yield page;
                count++;
            }
        }
        page = this._mkPage(count);
        pages.push(page);
        yield page;
    }
}
class NovelPage extends SlidePage {
    make(els) {return this._make((pages)=>this.__make(els, pages, (pages,el,count)=>this._splitParagraph(el)))}
    _splitParagraph(el) {// p要素ならページを跨ぐ（p要素内にある子要素をできるかぎり詰め込む）
        if ('P'!==el.tagName) {return null}
        el.remove(); // dummy配下から離脱
        const p = Dom.tags.p(); // ギリギリdummyに入るp内子要素だけを入れる
        p.dataset.bi = el.dataset.bi;
        this._.el.dummy.appendChild(p);
        console.log(this._.el.dummy.getBoundingClientRect());
        if (this._within(p)) {return null}
        let node = el.firstChild;
        while (node) {
            p.append(node);
            if (this._within(p)) {
                if (node.TEXT_NODE===node.nodeType) {//テキストノードなら単語単位で分割する
                    el.prepend(node); // p要素から離脱し元に戻す
                    let i = 0;
                    const words = node.textContent.Words;
                    p.append('');
                    for (let i=0; i<words.length; i++) {
                        p.lastChild.textContent += words[i];
                        if (this._within(p)) {
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
    *_generatePages(els){yield* super.__generatePages(els, (pages,el,count)=>this._splitParagraph(el))}
}
window.PageTypes = PageTypes;
})();
