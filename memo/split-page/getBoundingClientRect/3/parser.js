(function(){// Manuscript > TextBlock > HTML > Element
class TextBlock {
    constructor() {this._={}; this._.blocks=[];}
    fromText(text) {
        this._.blocks = [];
        if (0===text.trim().length) { return this._.blocks }
        //text = text.replace('\r\n', '\n')
        //text = text.replace('\r', '\n')
        //text = text.replace(/\r\n?/gm, '\n').trimLine();
        text = text.normalizeLineBreaks().trimLine();
        let start = 0;
        for (let match of text.matchAll(/\n\n/gm)) {
            this._.blocks.push(text.slice(start, match.index).trimLine())
            start = match.index + 2
        }
        this._.blocks.push(text.slice(start).trimLine())
        return blocks.filter(v=>v).map(b=>/^#{1,6} /.test(b) ? b.split('\n') : b).flat();
    }
    async *generate(text) {
        this._.blocks = [];
        if (0===text.trim().length) { return this._.blocks }
        //text = text.replace(/\r?\n/gm, '\n')
        //text = text.replace(/\r\n?/gm, '\n').trimLine();
        text = text.normalizeLineBreaks().trimLine();
        let start = 0; let block = null;
        for (let match of text.matchAll(/\n\n/gm)) {
            block = text.slice(start, match.index).trimLine();
            this._.blocks.push(block);
            start = match.index + 2
            yield block;
        }
        block = text.slice(start).trimLine();
        blocks.push(block);
        yield block;
        this._.blocks = blocks.filter(v=>v).map(b=>/^#{1,6} /.test(b) ? b.split('\n') : b).flat();
    }
    get blocks() {return this._.blocks}
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
    constructor() {this._ = {mb:mb, hp:hp, htmls:null, els:null, opt:{type:'scroll'}};}
    /*
    constructor(text, type='scroll') {
        this._ = {mb:mb, hp:hp, htmls:null, els:null, opt:{type:'scroll'}};
        this.text = text;
        this.type = type;
    }
    */
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
    /*
    get type() {return this._.opt.type}
    set type(v) {
        const vs = 'scroll slide book'.split(' ');
        if (vs.some(n=>n===v)) {this._.opt.type=v}
        else {throw new TypeError(`typeは${vs}のいずれかのみ有効です。`)}
    }
    */
}
// https://github.com/nodeca/js-yaml 依存
class JavelParser {
    constructor() {
    }
    parse(text) {
        text = text.normalizeLineBreaks().trimLine();
        return {meta: ,body{blocks:, els:}};
    }
    async *generate(text) {

    }
    #splitMetaBody(text) {
        const matches = text.matchAll(/^# /);
        if (0===matches.length) {throw new TypeError(`Javel形式のテキストには一つ以上の見出しが必要です。行頭が# の文字列を含めてください。`)}
        if (0===matches[0].index) {
            console.warn('FlontMatterを省略しました。最初の見出しレベル1〜6をタイトル、著者名、キャッチコピーとし、本文をあらすじとします。');
            const metaLastIndex = (1===matches.length) ? text.length : matches[1].index;
            if (1===matches.length) {console.warn('本文がありません。');}
            const coverText = text.slice(0, metaLastIndex);
            const bodyText = text.slice(metaLastIndex);
            const parser = new TextBlock();
            const coverBlocks = parser.fromText(coverText);

            const meta = {javel:{author:{}}, el:{}}
            let i = coverBlocks.findIndex(b=>b.startsWith('# '));
            if (-1 < i) {meta.javel.title = coverBlocks[i].slice(2)}
            i = coverBlocks.findIndex(b=>b.startsWith('## '));
            if (-1 < i) {meta.javel.author.name=coverBlocks[i].slice(3)}
            i = coverBlocks.findIndex(b=>b.startsWith('### '));
            if (-1 < i) {meta.javel.catchCopy=coverBlocks[i].slice(4)}
//            coverBlocks.filter(b=>!b.startsWith(`#`))
            meta.javel.obi = coverBlocks.filter(b=>!b.match(/^#{1,6} /)); // 企画(pitch:小説の企画提案, synopsis:概要, logline: 主人公が誰を相手に、どのような動機で、何をするのかを1〜3行で表現した要約文です。作品全体の「何が起きるか」を示すあらすじの要約とも言えます。, tagline:作品の個性を際立たせる、さらに短い一文のキャッチコピーで、製品に付けられるタグ（識別票）のように、作品を一瞬で印象付ける役割を果たします。), 読者へ(catchCopy: , 帯文:売り文句(200字))
            matches[1].index
//            this.#set(meta, 'title', coverBlocks, '# ');
//            this.#set(meta, 'author.name', coverBlocks, '## ');
//            this.#set(meta, 'catchCopy', coverBlocks, '## ');
//            const second = text.slice(match.index+1).match(/^# /);
        } else {
            
        }
        jsyaml.load();
        const firstIdx = this._.blocks.findIndex(b=>b.startsWith('# '));
        const secondIdx = this._.blocks.slice(firstIdx+1).findIndex(b=>b.startsWith('# ')) + firstIdx+1;
//        console.log(firstIdx, secondIdx);
        this._.coverRng = [firstIdx, secondIdx];
        this._.contentRng = [secondIdx, this._.blocks.length];


    }
    /*
    #set(o, name, coverBlocks, prefix='# ') {
        let i = coverBlocks.findIndex(b=>b.startsWith(prefix));
        if (-1 < i) {o[name] = coverBlocks[i].slice(prefix.length)}
    }
    */
}

window.JavelParser = JavelParser;
})();
