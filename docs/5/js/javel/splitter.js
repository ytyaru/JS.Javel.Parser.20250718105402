(function(){
class Slide {
    constructor(target=document) {
        this._ = {el:{target:target, dummy:null, page:null}, size:{inline:0, block:0}}
        const page = this._makePageEl();
        'inline block'.split(' ').map(n=>this._.size[n]=parseFloat(getComputedStyle(document.querySelector(`:root`)).getPropertyValue(`--page-${n}-size`)));
    }
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
}
class Novel extends Slide {
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
class Splitter {// [[type, target, make]]  {type:, target:, make:}
    static get Types() {return 'scroll slide novel'.split(' ')}
    static validType(v) {return Type.isStr(v) && Splitter.Types.some(t=>t===v)}
    constructor(types) {
        this._ = {types:null, sld:null, nvl:null}
        this.types = types;
    }
    get(type) { switch (type) {
        case 'slide': return this._.sld;
        case 'novel': return this._.nvl; 
    } }
    set types(v) {
        if (Type.isArys(v) && v.every(x=>2<=x.length && Splitter.validType(x[0]) && Type.isEl(x[1]))) {
            for (let i=0; i<v.length; i++) {
                     if ('slide'===v[i][0] && !this._.sld) {this._.sld = new Slide(v[i][1])}
                else if ('novel'===v[i][0] && !this._.nvl) {this._.nvl = new Novel(v[i][1])}
                if (2===v[i].length) {v[i].push(this.#defaultMake(...v[i]))}
                else {if (!Type.isFn(v[i][2])) {throw new TypeError(`typeの第三値は関数であるべきです。`)}}
            }
        } else {throw new TypeError(`typesが不正値です。`)}
        this._.types = v;
    }
    split(els) {
        for (let i=0; i<this._.types.length; i++) {
            const [type, target, make] = this._.types[i];
            this.#removeEls(target);
            this.#appendEls(target, make(els));
        }
    }
    #removeEls(target) {while(target.firstChild) {target.firstChild.remove()}}
    #appendEls(target, children) {target.append(...children)}
    #defaultMake(type, target) {
        switch (type) {
            case 'scroll': return (els)=>els
            case 'slide': return (els)=>this._.sld.make(els)
            case 'novel': return (els)=>this._.nvl.make(els)
            default: throw new TypeError(`typeが不正値です。:${type}`)
        }
    }
}
window.Splitter = Splitter;
})();
