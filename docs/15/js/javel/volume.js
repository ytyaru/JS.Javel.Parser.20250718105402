(function(){
class TextBlockVolume {// Byte/字数/頁数
    constructor(blocks) {
        this._ = {blocks:null, volume:{block:{bytes:[], graphemes:[], pages:[]}, all:{bytes:0, graphemes:0, pages:0}}}
    }
    get blocks() {return this._.blocks}
    set blocks(v) {
        if (Type.isStrs(v)) {
            this._.blocks = v;
            this.#calc();
        }
    }
    get bytes() {return this._.volume.all.bytes}
    get graphemes() {return this._.volume.all.graphemes}
    get pages() {return this._.volume.all.pages}
    get blockBytes() {return this._.volume.block.bytes}
    get blockGraphemes() {return this._.volume.block.graphemes}
    get blockPages() {return this._.volume.block.pages}
    #calc() {
        this._.volume.block.bytes = this._.blocks.map(b=>b.length);
        this._.volume.block.graphemes = this._.blocks.map(b=>b.Graphemes.length);
        this._.volume.block.pages = this._.blocks.map(b=>0);
        'bytes graphemes pages'.map(n=>this._.volume.all[n]=this._.volume.block[n].reduce((s,v,i)=>s+=this._.volume.block[n][i],0));
//        this._.volume.all.bytes = this._.volume.block.bytes.reduce((s,v,i)=>s+=this._.volume.block.bytes[i],0)
    }
}
})();
