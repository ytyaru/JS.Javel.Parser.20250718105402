(function(){
class Book {
    constructor() {
        this._ = {el:{dummy:null, page:null}, size:{inline:0, block:0}}
        const page = this.#makePageEl();
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
        if (!this._.el.dummy) {this._.el.dummy=this.#makePageEl(true);document.body.append(this._.el.dummy);}
        const pages = [];
        let page = null;
        let count = 1;
        for (let el of els) {
            console.log(`${el.tagName}`)
            this._.el.dummy.append(el);
            const r = el.getBoundingClientRect();
            console.log(this._.size.block , r.bottom)
            if (this._.size.block < r.bottom) {
                pages.push(this.#mkPage(count));
                this._.el.dummy.appendChild(el);
                count++;
            }
        }
        pages.push(this.#mkPage(count))
        this._.el.dummy.remove();
        this._.el.dummy = null;
        this.#setupShow(pages);
        return pages;
    }
    #mkPage(count=0) {
        const page = this.#makePageEl();
        if (0 < count) {page.dataset.page = count;}
        while(null!==this._.el.dummy.firstChild){page.appendChild(this._.el.dummy.firstChild)}
        return page;
    }
    get pageEl() {return this._.el.page}
    #makePageEl(isDummy=false) {
        return Dom.tags.div({class:`page${isDummy ? ' dummy' : ''}`})
    }
    #setupShow(pages) {
        pages[0].classList.add('show');
    }
    get firstPage() {return document.querySelector(`.page:first-child`)}
    get lastPage() {return document.querySelector(`.page:last-child`)}
    get nowPage() {return document.querySelector(`.page.show`)}
    get nowPageNum() {return parseInt(this.nowPage.dataset.page)}
    get allPageNum() {return parseInt(this.lastPage.dataset.page)}
    showNextPage() {return this.#showNeary(false)}
    showPrevPage() {return this.#showNeary(true)}
    #showNeary(isPrev=false) {
        const target = document.querySelector(`.page.show`)[`${isPrev ? 'previous' : 'next'}ElementSibling`];
        document.querySelector(`.page.show`).classList.remove('show');
        console.log((target ?? (isPrev ? this.lastPage : this.firstPage)), this.lastPage , this.firstPage);
        (target ?? (isPrev ? this.lastPage : this.firstPage)).classList.add('show');
    }
    showPage(p) {//p:自然数
        const pages = [...document.querySelectorAll(`.page`)];
        if (!(Number.isSafeInteger(p) && 0<p && p<=pages.length)) {throw new RangeError(`範囲外です。`)}
        for (let i=0; i<pages.length; i++) {
            if (p===i) {pages[i].classList.add('show');return;}
        }
    }
}
window.Book = Book;
})();
