(function(){//HTMLから原稿の特定位置を指定する（正確にいうと原稿ではなくテキストブロック。Number型制約9000兆）
class TextBlockPicker {
    constructor() {this._={selection:null, blocks:null, tagNames:{heading:null, block:null, inline:null}};this.#makeTagNames();}
    #makeTagNames() {
        this._.tagNames.heading = [...new Array(6)].map((_,i)=>`H${i+1}`);
        this._.tagNames.block = ['P', ...this._.tagNames.heading];
        this._.tagNames.inline = 'EM RUBY RT RP BR'.split(' ');
    }
    get selection() {return this._.selection}
    set selection(v) {this._.selection = v}
    get sourceBlocks() {return this._.blocks}
    set sourceBlocks(v) {this._.blocks = v;}
    get selectedBlocks() {
        const idxs = this.blockIndexes;
        return this.sourceBlocks.slice(idxs[0], idxs[1]+1);
    }
    get selectedManuscript() {
        const blks = this.selectedBlocks;
        const rng = this.blockInRange;
        console.log(rng);
        return (1===blks.length) ? blks[0].Graphemes.slice(...rng.sort((a,b)=>a-b)).join('') : this.#getRangeBlocks(blks,rng).join('\n\n');
    }
    #getRangeBlocks(blks,rng) {
        const blks2 = [...blks];
        blks2[0] = blks2[0].Graphemes.slice(rng[0]).join('');
        blks2[blks2.length-1] = blks2[blks2.length-1].Graphemes.slice(0, rng[1]).join('');
        return blks2;
    }
    get blockIndexes() {
        /*
        let b = this._.selection.anchorNode;
        while(3===b.nodeType || (1===b.nodeType && b.parentElement && !b.hasAttribute('data-bi'))) {b=b.parentElement}
        if ('bi' in b.dataset){return Number(b.dataset.bi)}
        */
//        return 'anchor focus'.split(' ').map(n=>Number(this.#getTextBlockElement(this._.selection[`${n}Node`]).dataset.bi));
        return this.#getSelectedBlockIdx().sort((a,b)=>a-b);
    }
    get blockInRange() {
        const s = this._.selection;
//        return [this.#getBlockInStartIndex(s.anchorNode, s.anchorOffset),
//                this.#getBlockInStartIndex(s.focusNode, s.focusOffset, true)];
//        return [this.#getBlockInStartIndex(s.anchorNode, s.anchorOffset),
//                this.#getBlockInStartIndex(s.focusNode, s.focusOffset, true)].sort((a,b)=>a-b);

//        const rng = [this.#getBlockInStartIndex(s.anchorNode, s.anchorOffset),
//                     this.#getBlockInStartIndex(s.focusNode, s.focusOffset, true)];

        const isL2R = this.#isLeftToRight();
        const startId = (isL2R ? 'anchor' : 'focus');
        const endId = (isL2R ? 'focus' : 'anchor');
//        const ids = {start:(isL2R ? 'anchor' : 'focus'), end:(isL2R ? 'focus' : 'anchor')};
        const [startNode, startOffset] = ['Node','Offset'].map(n=>s[`${startId}${n}`])
        const [endNode, endOffset] = ['Node','Offset'].map(n=>s[`${endId}${n}`])
        const rng = [this.#getBlockInStartIndex(startNode, startOffset),
                     this.#getBlockInStartIndex(endNode, endOffset, true)];
        if (Number.isNaN(rng[1]) || rng[1]<=rng[0]) {rng[1]=rng[0]+1}
        return rng;
    }
    #getSelectedNodes() {return 'anchor focus'.split(' ').map(n=>this._.selection[`${n}Node`])}
    #getSelectedOffset() {return 'anchor focus'.split(' ').map(n=>this._.selection[`${n}Offset`])}
    #getSelectedBlockIdx() {return this.#getSelectedNodes().map(n=>Number(this.#getTextBlockElement(n).dataset.bi))}
    #isLeftToRight() {//選択を開始した方向は前にあるDOMから後ろにあるDOMか（もし逆なら計算が狂うのでanchorとfocusを逆転させる）
        const s = this._.selection;
        const [a,f] = this.#getSelectedNodes().map(n=>this.#getTextBlockElement(n));
        const [A,F] = this.#getSelectedOffset();
        if (a===f) {return A < F}
        else {
            const [f,l] = this.#getSelectedBlockIdx();
            return f < l;
        }
    }
    #getTextBlockElement(node) {// 直近のテキストブロック要素（p/h{1,6}）
        if (this._.tagNames.block.some(n=>n===node.tagName)) {return node}
        else {
            const p = node.parentElement;
            return p ? this.#getTextBlockElement(p) : null;
        }
    }
    // 同一テキストブロック内でしか機能しない！（前後のテキストブロックを跨ぐと機能しない！）
    #getBlockInStartIndex(self, offset, isEnd=false) {//el:s.[anchor|focus]Node.parentElement
        console.log(self, offset, isEnd);
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
                    //if ('len' in node.dataset) {blockInStartIndex+=Number(node.dataset.len)}
                    //if ('len' in node.dataset) {blockInStartIndex+=Number(node.dataset.bis)}
                    if ('len' in node.dataset) {if(isEnd){blockInStartIndex+=Number(node.dataset.bis)}}
                    else {throw new TypeError(`data-lenを用意してください。`)}
                } else if (3===node.nodeType) {//TextNode
                    blockInStartIndex += node.textContent.Graphemes.length;
                }
            }
            console.log(parent.tagName)
            if ('RUBY RT'.split(' ').every(n=>n!==parent.tagName)) {blockInStartIndex += offset;console.log('RUUUUUUU')}
            
            //blockInStartIndex += offset;
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
        console.log(blockInStartIndex)
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

