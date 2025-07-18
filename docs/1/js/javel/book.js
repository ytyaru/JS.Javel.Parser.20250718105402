(function(){
class Book {
    constructor() {
        this._ = {el:{dummy:null, page:null}, size:{inline:0, block:0}}
        const page = this.#makePageEl();
        'inline block'.split(' ').map(n=>this._.size[n]=parseFloat(getComputedStyle(document.querySelector(`:root`)).getPropertyValue(`--page-${n}-size`)));
        console.log(this._.size)
//        parseFlort(getComputedStyle(document.querySelector(`:root`)).getPropertyValue(`--page-inline-size`));
//        parseFlort(getComputedStyle(document.querySelector(`:root`)).getPropertyValue(`--page-block-size`));
        
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
        if (!this._.el.dummy) {this._.el.dummy=this.#makePageEl();document.body.append(this._.el.dummy);}
        const pages = [];
        let page = null;
        for (let el of els) {
            console.log(`${el.tagName}`)
            this._.el.dummy.append(el);
//            page.append(el);
//            const r = el.getBoundingClientRect();
//            const r = this._.el.dummy.getBoundingClientRect();
            const r = el.getBoundingClientRect();
            console.log(this._.size.block , r.bottom)
            if (this._.size.block < r.bottom) {
                console.log('超過！ページ確定！');
//                let nextPage = this.#makePageEl();
//                nextPage.append(el);
//                page.append(...[...this._.el.dummy.children]);

//                page = this.#makePageEl();
//                for (let child of this._.el.dummy.children){page.append(child)}
//                pages.push(page);
                pages.push(this.#mkPage());
                this._.el.dummy.appendChild(el);
//                page = this.#makePageEl();
//                page.appendChild(el);
//                page = nextPage;
            }
        }
//        pages.push(page);
//        page = this.#makePageEl();
//        for (let child of this._.el.dummy.children){page.append(child)}
//        pages.push(page);
        pages.push(this.#mkPage())
        return pages;
    }
    #mkPage() {
        const page = this.#makePageEl();
//        for (let child of this._.el.dummy.children){page.append(child)}
//        console.log([...this._.el.dummy.children])
//        page.append(...[...this._.el.dummy.children]);
        while(null!==this._.el.dummy.firstChild){page.appendChild(this._.el.dummy.firstChild)}
        return page;
    }
    get pageEl() {return this._.el.page}
    #makePageEl() {
        return Dom.tags.div({class:'page'})
    }
    #within() {
        getBoundingClientRect
    }
}
window.Book = Book;
})();
