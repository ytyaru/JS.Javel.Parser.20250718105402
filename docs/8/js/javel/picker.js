(function(){//HTMLから原稿の特定位置を指定する（正確にいうと原稿ではなくテキストブロック。Number型制約9000兆）
class TextBlockPicker {
    constructor() {this._={selection:null};}
    get selection() {return this._.selection}
    set selection(v) {
        this._.selection = v
    }
    get blockIndex() {
        let b = this._.selection.anchorNode;
        while(3===b.nodeType || (1===b.nodeType && b.parentElement && !b.hasAttribute('data-bi'))) {b=b.parentElement}
        if ('bi' in b.dataset){return Number(b.dataset.bi)}
    }
    get blockInRange() {
        const s = this._.selection;
        return [this.#getBlockInStartIndex(s.anchorNode, s.anchorOffset),
                this.#getBlockInStartIndex(s.focusNode, s.focusOffset, true)].sort((a,b)=>a-b);
    }
    #getBlockInStartIndex(self, offset, isEnd=false) {//el:s.[anchor|focus]Node.parentElement
        let blockInStartIndex = 0;
        const parent = self.parentElement;
        const headingTagNames = [...new Array(6)].map((_,i)=>`H${i+1}`);
        const blockTagNames = ['P', ...headingTagNames];
        const inlineTagNames = 'EM RUBY RT RP BR'.split(' ');
//        console.log(self, offset, parent, parent.tagName, blockTagNames, inlineTagNames, parent.childNodes);
        // 兄要素
        if (blockTagNames.some(n=>n===parent.tagName)) {//selfはTextNodeである
            for (let node of parent.childNodes) {
                if (node===self) {break}
                if (1===node.nodeType) {//Element
                    if ('len' in node.dataset) {blockInStartIndex+=Number(node.dataset.len)}
                    else {throw new TypeError(`data-lenを用意してください。`)}
                } else if (3===node.nodeType) {//TextNode
                    blockInStartIndex+=node.textContent.Graphemes.length;
                }
            }
            blockInStartIndex+=offset;
            if (headingTagNames.some(n=>n===parent.tagName)) {
                const level = Number(parent.tagName.slice(1));
                blockInStartIndex+=level+1; // メタ文字#の数だけ追加する
            }
        }
        // selfはem/ruby/rt/rp/br等のinline系Elementである（parentはp/h[1〜6]のはず）
        else if (inlineTagNames.some(n=>n===parent.tagName)) {
            let P = parent;
            while (P) {
                if ('bis' in P.dataset) {break}
                P = P.parentElement;
            }
            blockInStartIndex = Number(parent.dataset.bis);
            if (isEnd) {blockInStartIndex += Number(parent.dataset.len)}

            P = parent.parentElement;
            while (P) {
                if ('P'===P.tagName){break}
                if (headingTagNames.some(n=>n===P.tagName)) {
                    const level = Number(parent.tagName.slice(1));
                    blockInStartIndex += level+1; // メタ文字#と半角スペース1個分だけ追加する
                    break;
                }
                P = P.parentElement;
            }
        }
        else {}
        return blockInStartIndex;
    }
    /*
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

    function getBlockInStartIndex(self, offset, isEnd=false) {//el:s.[anchor|focus]Node.parentElement
        let blockInStartIndex = 0;
        const parent = self.parentElement;
//        const p = s.anchorNode.parentElement;
        const headingTagNames = [...new Array(6)].map((_,i)=>`H${i+1}`);
        const blockTagNames = ['P', ...headingTagNames];
        //blockTagNames.push('P');
        blockTagNames.unshift('P');
        const inlineTagNames = 'EM RUBY RT RP BR'.split(' ');
        console.log(self, offset, parent, parent.tagName, blockTagNames, inlineTagNames, parent.childNodes);
        // 兄要素
        if (blockTagNames.some(n=>n===parent.tagName)) {//selfはTextNodeである
            for (let node of parent.childNodes) {
                if (node===self) {break}
                if (1===node.nodeType) {//Element
                    //if ('bis' in node.dataset) {blockInStartIndex+=Number(node.dataset.bis)}
                    if ('len' in node.dataset) {blockInStartIndex+=Number(node.dataset.len)}
                    else {throw new TypeError(`data-lenを用意してください。`)}
                } else if (3===node.nodeType) {//TextNode
                    blockInStartIndex+=node.textContent.Graphemes.length;
                }
            }
            blockInStartIndex+=offset;
            if (headingTagNames.some(n=>n===parent.tagName)) {
                const level = Number(parent.tagName.slice(1));
                blockInStartIndex+=level+1; // メタ文字#の数だけ追加する
            }
        }
        // selfはem/ruby/rt/rp/br等のinline系Elementである（parentはp/h[1〜6]のはず）
        else if (inlineTagNames.some(n=>n===parent.tagName)) {// em/ruby/rt/rp/brはその要素の開始位置にする（内部の半端な位置は返さない）
            console.log(self)
            //blockInStartIndex = Number(parent.dataset.bis);
            let P = parent;
            while (P) {
                if ('bis' in P.dataset) {break}
                P = P.parentElement;
            }
            blockInStartIndex = Number(parent.dataset.bis);
            if (isEnd) {blockInStartIndex += Number(parent.dataset.len)}

            P = parent.parentElement;
            while (P) {
                if ('P'===P.tagName){break}
                if (headingTagNames.some(n=>n===P.tagName)) {
                    const level = Number(parent.tagName.slice(1));
                    blockInStartIndex += level+1; // メタ文字#と半角スペース1個分だけ追加する
                    break;
                }
                P = P.parentElement;
            }
//            blockInStartIndex += offset;
        }
        else {}
        // self
//        if (blockTagNames.some(n=>n===parent.tagName)) {blockInStartIndex+=offset}
//        else if (inlineTagNames.some(n=>n===parent.tagName)) {blockInStartIndex+=Number(node.dataset.bis)}
//        else {}
        return blockInStartIndex;
    }
    */
}
window.TextBlockPicker = TextBlockPicker;
})();

