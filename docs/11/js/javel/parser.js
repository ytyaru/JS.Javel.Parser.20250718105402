(function(){// Manuscript > TextBlock > HTML > Element
class TextBlock {
    fromText(text) {
        if (0===text.trim().length) { return [] }
        text = text.replace('\r\n', '\n')
        text = text.replace('\r', '\n')
        const blocks = []; let start = 0;
        for (let match of text.matchAll(/\n\n/gm)) {
            blocks.push(text.slice(start, match.index).trimLine())
            start = match.index + 2
        }
        blocks.push(text.slice(start).trimLine())
        return blocks.filter(v=>v).map(b=>/^#{1,6} /.test(b) ? b.split('\n') : b).flat();
    }
}
const tb = new TextBlock();
class ManuscriptBlock {
    constructor(manuscript) {
        this._ = {manuscript:null, blocks:null, coverRng:[0,0], contentRng:[0,0]};
        this.manuscript = manuscript ?? '';
    }
    get manuscript() {return this._.manuscript}
    set manuscript(v) {
//        console.log(v)
        if (!Type.isStr(v)) {throw new TypeError(`原稿はString型であるべきです。`)}
        this._.manuscript = v;
        this._.blocks = tb.fromText(this._.manuscript);
        this.#getContentStartIndex();
    }
    get blocks() {return this._.blocks}
    get covers() {return this._.blocks.slice(...this._.coverRng)}
    get contents() {return this._.blocks.slice(...this._.contentRng)}
    #getContentStartIndex() {
        const firstIdx = this._.blocks.findIndex(b=>b.startsWith('# '));
        const secondIdx = this._.blocks.slice(firstIdx+1).findIndex(b=>b.startsWith('# ')) + firstIdx+1;
//        console.log(firstIdx, secondIdx);
        this._.coverRng = [firstIdx, secondIdx];
        this._.contentRng = [secondIdx, this._.blocks.length];
    }
}
class HtmlParser {
    constructor(blocks) {this._blocks = blocks; this._hasNewline=false;}
    get blocks() {return this._blocks}
    set blocks(v) {if(Type.isStrs(v)){this._blocks = v}}
    get hasNewline() {return this._hasNewline}
    set hasNewline(v) {if(Type.isBln(v)){this._hasNewline = v}}
    get els() {return this.toEls(this._blocks)}
    get html() {return this.toHtmls(this._blocks).join((this._hasNewline) ? '\n' : '')}
    get htmls() {return this.toEls(blocks).map(el=>el.outerHTML)}
    toEls(blocks) {
        if (!Type.isStrs(blocks)) {throw new TypeError(`引数はblocksであるべきです。`)}
        //return blocks.map(b=>((this.#isHeading(b)) ? this.#getHeadingEl(b) : Dom.tags.p(...this.#inlines(b))))
        return blocks.map((b,i)=>{
            const el = ((this.#isHeading(b)) ? this.#getHeadingEl(b,i) : Dom.tags.p(...this.#inlines(b)));
            el.dataset.bi = i;
            return el;
        });
    }
    toHtml(blocks, hasNewline=false) {return this.toHtmls(blocks).join((hasNewline) ? '\n' : '')}
    toHtmls(blocks) {return this.toEls(blocks).map(el=>el.outerHTML)}
    #isHeading(v) {return /^(#{1,6}) (.+)$/.test(v)}
    #getHeadingEl(v) {
        const match = v.match(/^(#{1,6}) (.+)$/);
        const level = match[1].length;
        const inline = match[2];
        return Dom.tags[`h${level}`](...this.#inlines(inline));
    }
    #inlines(block) { 
        const inlines = []; let start = 0;
        for (let d of this.#genBrEmRuby(block)) {
            inlines.push(block.slice(start, d.index))
            inlines.push(d.html)
            start = d.index + d.length
        }
        inlines.push(block.slice(start).trimLine())
        return inlines.filter(v=>v)
    }
    #genBrEmRuby(text) { return [...this.#genBr(this.#matchBr(text)), ...this.#genEm(this.#matchEm(text)), ...this.#genRuby(this.#matchRubyL(text)), ...this.#genRuby(this.#matchRubyS(text))].sort((a,b)=>a.index - b.index) }
    #genBr(matches) { return matches.map(m=>({'match':m, 'html':Dom.tags.br({'data-bis':m.index, 'data-len':m[0].Graphemes.length}), 'index':m.index, 'length':m[0].length})) }
    #matchBr(text) { return [...text.matchAll(/[\r|\r?\n]/gm)] }
    #matchEm(text) { return [...text.matchAll(/《《([^｜《》\n]+)》》/gm)] }
    #genEm(matches) { return matches.map(m=>({'match':m, 'html':Dom.tags.em({'data-bis':m.index, 'data-len':m[0].Graphemes.length}, m[1]), 'index':m.index, 'length':m[0].length}))}
    #matchRubyL(text) { return [...text.matchAll(/｜([^｜《》\n\r]{1,50})《([^｜《》\n\r]{1,20})》/gm)] }
    #matchRubyS(text) { return [...text.matchAll(/([一-龠々仝〆〇ヶ]{1,50})《([^｜《》\n\r]{1,20})》/gm)] }
    #genRuby(matches) { return matches.map(m=>({match:m, html:Dom.tags.ruby({'data-bis':m.index, 'data-len':m[0].Graphemes.length}, m[1], Dom.tags.rp('（'), Dom.tags.rt(m[2]), Dom.tags.rp('）')), 'index':m.index, length:m[0].length})) }
}
const mb = new ManuscriptBlock();
const hp = new HtmlParser();
class JavelParser {
    constructor(text, type='scroll') {
        this._ = {mb:mb, hp:hp, htmls:null, els:null, opt:{type:'scroll'}};
        this.text = text;
        this.type = type;
    }
    get text() {return this._.mb.manuscript}
    get blocks() {return this._.mb.blocks}
    get coverBlocks() {return this._.mb.covers}
    get contentBlocks() {return this._.mb.contents}
    get htmls() {return hp.toHtmls(this._.mb.blocks)}
    get coverHtml() {return hp.toHtml(this._.mb.covers)}
    get contentHtml() {return hp.toHtml(this._.mb.contents)}
    get coverHtmls() {return hp.toHtmls(this._.mb.covers)}
    get contentHtmls() {return hp.toHtmls(this._.mb.contents)}
    get els() {return hp.toEls(this._.mb.blocks)}
    get coverEls() {return hp.toEls(this._.mb.covers)}
    get contentEls() {return hp.toEls(this._.mb.contents)}
    set text(v) {this._.mb.manuscript = v; this._.hp.blocks = this._.mb.blocks;}
    get type() {return this._.opt.type}
    set type(v) {
        const vs = 'scroll slide book'.split(' ');
        if (vs.some(n=>n===v)) {this._.opt.type=v}
        else {throw new TypeError(`typeは${vs}のいずれかのみ有効です。`)}
    }
}
window.JavelParser = JavelParser;
})();
