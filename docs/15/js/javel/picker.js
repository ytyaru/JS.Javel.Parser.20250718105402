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
//        console.log(rng);
        return (1===blks.length) ? blks[0].Graphemes.slice(...rng.sort((a,b)=>a-b)).join('') : this.#getRangeBlocks(blks,rng).join('\n\n');
    }
    #getRangeBlocks(blks,rng) {
        const blks2 = [...blks];
//        console.log(rng, blks2[0].Graphemes)
        blks2[0] = blks2[0].Graphemes.slice(rng[0]).join('');
        blks2[blks2.length-1] = blks2[blks2.length-1].Graphemes.slice(0, rng[1]).join('');
        return blks2;
    }
    get blockIndexes() {
        return this.#getSelectedBlockIdx().sort((a,b)=>a-b);
    }
    get blockInRange() {
        const s = this._.selection;
        const blockIndexes = this.#getSelectedBlockIdx();
        const startIndexes = [this.#getBlockInStartIndexOfNode(s.anchorNode, s.anchorOffset),
                              this.#getBlockInStartIndexOfNode(s.focusNode, s.focusOffset)];
//        console.log(blockIndexes, startIndexes);
        // 後ろから前へ範囲選択していたらスワップする
        if (blockIndexes[1] < blockIndexes[0]) {// 異なるテキストブロックを跨いでおり、かつ後ろから前へ範囲選択していたら
//            console.log('異TB間SWAP!!!!!!!')
            return [this.#getBlockInStartIndexOfNode(s.focusNode, s.focusOffset),
                    this.#getBlockInStartIndexOfNode(s.anchorNode, s.anchorOffset, true)]
        } else if (blockIndexes[0]===blockIndexes[1]) {// 同一テキストブロック内なら
            if (startIndexes[1] < startIndexes[0]) {// 後ろから前へ範囲選択していたら
//                console.log('同一TB内　SWAP!!!!!!!')
                return [this.#getBlockInStartIndexOfNode(s.focusNode, s.focusOffset),
                        this.#getBlockInStartIndexOfNode(s.anchorNode, s.anchorOffset, true)]
            }
        }
        return [startIndexes[0], this.#getBlockInStartIndexOfNode(s.focusNode, s.focusOffset, true)];
    }
    #getSelectedNodes() {return 'anchor focus'.split(' ').map(n=>this._.selection[`${n}Node`])}
    #getSelectedOffset() {return 'anchor focus'.split(' ').map(n=>this._.selection[`${n}Offset`])}
    #getSelectedBlockIdx() {return this.#getSelectedNodes().map(n=>Number(this.#getTextBlockElement(n).dataset.bi))}
    #getBlockInStartIndexOfNode(node, offset, isEnd=false) {// 指定したノードのテキストブロック内開始位置を取得する
//        console.log(node, offset, node.nodeType, node.parentElement.tagName);
        if (1===node.nodeType && 0===offset) {return 0}// 要素先頭
        if (3===node.nodeType) {// TextNode
            const inlineDa = this.#isInlineElDataAttr(node.parentElement);
            if (inlineDa) {return Number(inlineDa.bis) + (isEnd ? Number(inlineDa.len) : 0);}
            else if (this._.tagNames.block.some(n=>n===node.parentElement.tagName)) {// p,h1〜6
                const childNodes = [...node.parentElement.childNodes];
                const I = childNodes.findIndex(n=>n===node);
                if (-1===I) {throw new TypeError(`プログラムエラー。nodeは必ず存在するはず。`)}
//                console.log('I:',I)
                let startIdx = 0;
                for (let i=0; i<I; i++) {
                    console.log(childNodes[i], startIdx)
                    if (3===childNodes[i].nodeType) {startIdx+=childNodes[i].textContent.Graphemes.length}
                    if (1===childNodes[i].nodeType) {
                        const childDa = this.#isInlineElDataAttr(childNodes[i]);
                        if (childDa) {startIdx+=Number(childDa.len);}
                    }
                }
//                console.log(startIdx)
                return startIdx + offset + (this._.tagNames.heading.some(n=>n===node.parentElement.tagName) ? this.#getHeadingLevel(node.parentElement)+1 : 0);
            }
        }
        throw new TypeError(`プログラムエラー。selection.anchorNode, selection.focusNodeは必ずTextNodeのはずだし、rubyやemはdata-bis属性値を持っているべき。`)
    }
    #isInlineElDataAttr(node) {// テキストブロックからみてInline要素であればそのdatasetを返す
        if ('RT RP'.split(' ').some(n=>n===node.tagName)) {return this.#isInlineElDataAttr(node.parentElement);}//ルビ文字
        else if ('BR EM RUBY'.split(' ').some(n=>n===node.tagName)) {
            if ('bis len'.split(' ').every(n=>n in node.dataset)) {return node.dataset;}
        }
    }
    #getTextBlockElement(node) {// 直近のテキストブロック要素（p/h{1,6}）
        if (this._.tagNames.block.some(n=>n===node.tagName)) {return node}
        else {
            const p = node.parentElement;
            return p ? this.#getTextBlockElement(p) : null;
        }
    }
    #getHeadingLevel(parent) {return (this._.tagNames.heading.some(n=>n===parent.tagName)) ? Number(parent.tagName.slice(1)) : 0;}
}
window.TextBlockPicker = TextBlockPicker;
})();

