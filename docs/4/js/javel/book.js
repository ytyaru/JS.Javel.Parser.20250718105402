(function(){
class Slide {
    constructor(target=document) {
        this._ = {el:{target:target, dummy:null, page:null}, size:{inline:0, block:0}}
        const page = this._makePageEl();
        'inline block'.split(' ').map(n=>this._.size[n]=parseFloat(getComputedStyle(document.querySelector(`:root`)).getPropertyValue(`--page-${n}-size`)));
    }
    get size() {return [this._.size.inline, this._.size.block]}
    set size(v) {
        if (Array.isArray(v) && 2===v.length && v.every(x=>null!==x && !Number.isNaN(x) && 'number'===x)) {
            this._.size.inline = v[0];
            this._.size.block = v[1];
            this.resize();
        }
    }
    make(els) {
        if (!this._.el.dummy) {this._.el.dummy=this._makePageEl(true);document.body.append(this._.el.dummy);}
        const pages = [];
        let page = null;
        let count = 1;
        for (let el of els) {
            console.log(`${el.tagName}`)
            this._.el.dummy.append(el);
            const r = el.getBoundingClientRect();
            console.log(this._.size.block , r.bottom)
            if (this._.size.block < r.bottom) {
                pages.push(this._mkPage(count));
                this._.el.dummy.appendChild(el);
                count++;
            }
        }
        pages.push(this._mkPage(count))
        this._.el.dummy.remove();
        this._.el.dummy = null;
        this._setupShow(pages);
        return pages;
    }
    _mkPage(count=0) {
        const page = this._makePageEl();
        if (0 < count) {page.dataset.page = count;}
        while(null!==this._.el.dummy.firstChild){page.appendChild(this._.el.dummy.firstChild)}
        return page;
    }
    get pageEl() {return this._.el.page}
    _makePageEl(isDummy=false) {return Dom.tags.div({class:`page${isDummy ? ' dummy' : ''}`})}
    _setupShow(pages) {pages[0].classList.add('show');}
    get firstPage() {return this._.el.target.querySelector(`.page:first-child`)}
    get lastPage() {return this._.el.target.querySelector(`.page:last-child`)}
    get nowPage() {console.log(this._.el, this._.el.target);return this._.el.target.querySelector(`.page.show`)}
//    get firstPage() {return document.querySelector(`.page:first-child`)}
//    get lastPage() {return document.querySelector(`.page:last-child`)}
//    get nowPage() {return document.querySelector(`.page.show`)}
    get nowPageNum() {return parseInt(this.nowPage.dataset.page)}
    get allPageNum() {return parseInt(this.lastPage.dataset.page)}
    showNextPage() {return this.#showNeary(false)}
    showPrevPage() {return this.#showNeary(true)}
    #showNeary(isPrev=false) {
        //const target = document.querySelector(`.page.show`)[`${isPrev ? 'previous' : 'next'}ElementSibling`];
        const target = this._.el.target.querySelector(`.page.show`)[`${isPrev ? 'previous' : 'next'}ElementSibling`];
        //document.querySelector(`.page.show`).classList.remove('show');
        this._.el.target.querySelector(`.page.show`).classList.remove('show');
        console.log((target ?? (isPrev ? this.lastPage : this.firstPage)), this.lastPage , this.firstPage);
        (target ?? (isPrev ? this.lastPage : this.firstPage)).classList.add('show');
    }
    showPage(p) {//p:自然数
        //const pages = [...document.querySelectorAll(`.page`)];
        const pages = [...this._.el.target.querySelectorAll(`.page`)];
        if (!(Number.isSafeInteger(p) && 0<p && p<=pages.length)) {throw new RangeError(`範囲外です。`)}
        for (let i=0; i<pages.length; i++) {
            if (p===i) {pages[i].classList.add('show');return;}
        }
    }
}
class Novel extends Slide {
    make(els) {
        //if (!this._.el.dummy) {this._.el.dummy=this._makePageEl(true);document.body.append(this._.el.dummy);}
        if (!this._.el.dummy) {this._.el.dummy=this._makePageEl(true);document.body.append(this._.el.dummy);}
        const pages = [];
        let page = null;
        let count = 1;
        for (let el of els) {
            console.log(`${el.tagName}`)
            this._.el.dummy.append(el);
            const r = el.getBoundingClientRect();
            console.log(this._.size.block , r.bottom)
            if (this._.size.block < r.bottom) {
                const ps = this._splitParagraph(el);
                pages.push(this._mkPage(count));
                this._.el.dummy.appendChild(el);
                count++;
            }
        }
        pages.push(this._mkPage(count))
        this._.el.dummy.remove();
        this._.el.dummy = null;
        this._setupShow(pages);
        return pages;
    }
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
                /*
                if (node.TEXT_NODE===node.nodeType) {//テキストノードなら単語単位で分割する
                    node.remove(); // p要素から離脱
                    let i = 0;
                    const words = node.textContent.words;
                    for (let i=0; i<words.length; i++) {
                        p.append(words[i]);
                        r = p.getBoundingClientRect();
                        if (this._.size.block < r.bottom) {
                            p.lastChild.textContent.splice(-1, 1); // 末尾の一字を消す
                            node.textContent = words.slice(i).join('');
                        }
                        i++;
                    }
                }
                */
                el.prepend(node)
                return [p, el];
            }
            node = el.firstChild;
        }
        /*
        for (let node of el.childNodes) {
            p.append(node)
            r = p.getBoundingClientRect();
            if (this._.size.block < r.bottom) {
                el.prepend(node)
                return [p, el];
            }
        }
        */
        throw new TypeError(`プログラムエラー。全部入るなら最初からそうすべき。`)
    }
}
window.Slide = Slide;
window.Novel = Novel;
})();
