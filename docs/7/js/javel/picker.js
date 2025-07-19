(function(){//HTMLから原稿の特定位置を指定する（正確にいうと原稿ではなくテキストブロック。Number型制約9000兆）
class TextBlockPicker {
    constructor(blocks) {
        this._ = {blocks:null, startIdxs:[]};
        this.blocks = blocks;
    }
    get blocks() {return this._.blocks}
    set blocks(v) {
        if (Type.isStrs(v)) {
            this._.blocks = v;
            this.#resetStartIdxs();
        }
    }
    #resetStartIdxs() {
        const lengths = this._.blocks.map(b=>b.Graphemes);
        lengths.reduce((s,v,i)=>{this._.startIdxs[i]=s;return s+v}, 0)
    }
}
window.TextBlockPicker = TextBlockPicker;
})();

