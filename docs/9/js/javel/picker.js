(function(){//HTMLから原稿の特定位置を指定する（正確にいうと原稿ではなくテキストブロック。Number型制約9000兆）
class TextBlockPicker {
    constructor() {this._={selection:null, tagNames:{heading:null, block:null, inline:null}};this.#makeTagNames();}
    #makeTagNames() {
        this._.tagNames.heading = [...new Array(6)].map((_,i)=>`H${i+1}`);
        this._.tagNames.block = ['P', ...this._.tagNames.heading];
        this._.tagNames.inline = 'EM RUBY RT RP BR'.split(' ');
    }
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
    // 同一テキストブロック内でしか機能しない！（前後のテキストブロックを跨ぐと機能しない！）
    #getBlockInStartIndex(self, offset, isEnd=false) {//el:s.[anchor|focus]Node.parentElement
        let blockInStartIndex = 0;
        const parent = self.parentElement;
//        const headingTagNames = [...new Array(6)].map((_,i)=>`H${i+1}`);
//        const blockTagNames = ['P', ...headingTagNames];
//        const inlineTagNames = 'EM RUBY RT RP BR'.split(' ');
        // 兄要素
        if (this._.tagNames.block.some(n=>n===parent.tagName)) {//selfはTextNodeである
            for (let node of parent.childNodes) {
                if (node===self) {break}
                if (1===node.nodeType) {//Element
                    if ('len' in node.dataset) {blockInStartIndex+=Number(node.dataset.len)}
                    else {throw new TypeError(`data-lenを用意してください。`)}
                } else if (3===node.nodeType) {//TextNode
                    blockInStartIndex += node.textContent.Graphemes.length;
                }
            }
            blockInStartIndex += offset;
            /*
            if (this._.tagNames.heading.some(n=>n===parent.tagName)) {
                const level = Number(parent.tagName.slice(1));
                blockInStartIndex+=level+1; // メタ文字#の数だけ追加する
            }
            */
            const level = this.#getHeadingLevel(parent);
            if (0<level) {blockInStartIndex += level+1;}
        }
        // selfはem/ruby/rt/rp/br等のinline系Elementである（parentはp/h[1〜6]のはず）
        else if (this._.tagNames.inline.some(n=>n===parent.tagName)) {
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
                const level = this.#getHeadingLevel(parent);
                if (0<level) {blockInStartIndex += level+1; break;}
                /*
                if (this._.tagNames.heading.some(n=>n===P.tagName)) {
                    const level = Number(parent.tagName.slice(1));
                    blockInStartIndex += level+1; // メタ文字#と半角スペース1個分だけ追加する
                    break;
                }
                */
                P = P.parentElement;
            }
        }
        else {}
        return blockInStartIndex;
    }
    #getHeadingLevel(parent) {
        if (this._.tagNames.heading.some(n=>n===parent.tagName)) {
            const level = Number(parent.tagName.slice(1));
            return level;
        }
        return 0;
    }
}
window.TextBlockPicker = TextBlockPicker;
})();

