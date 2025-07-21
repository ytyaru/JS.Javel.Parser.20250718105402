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
    /*
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
        console.log(isL2R, startNode, startOffset, endNode, endOffset);
        const rng = [this.#getBlockInStartIndex(startNode, startOffset),
                     this.#getBlockInStartIndex(endNode, endOffset, true)];
        if (Number.isNaN(rng[1]) || rng[1]<=rng[0]) {rng[1]=rng[0]+1}
        return rng;
    }
    */
    get blockInRange() {
        const s = this._.selection;
        const blockIndexes = this.#getSelectedBlockIdx();
//        const anchorStartIndex = this.#getBlockInStartIndexOfNode(s.anchorNode, s.anchorOffset);
//        const focusStartIndex = this.#getBlockInStartIndexOfNode(s.focusNode, s.focusOffset);
//        const startIndexes = [this.#getBlockInStartIndexOfNode(s.anchorNode, s.anchorOffset),
//                              this.#getBlockInStartIndexOfNode(s.focusNode, s.focusOffset, true)]
//        const startIndexes = [this.#getBlockInStartIndexOfNode(s.anchorNode, s.anchorOffset),
//                              this.#getBlockInStartIndexOfNode(s.focusNode, s.focusOffset, true)];
        const startIndexes = [this.#getBlockInStartIndexOfNode(s.anchorNode, s.anchorOffset),
                              this.#getBlockInStartIndexOfNode(s.focusNode, s.focusOffset)];
        console.log(blockIndexes, startIndexes);
        // 後ろから前へ範囲選択していたらスワップする
        if (blockIndexes[1] < blockIndexes[0]) {// 異なるテキストブロックを跨いでおり、かつ後ろから前へ範囲選択していたら
            console.log('異TB間SWAP!!!!!!!')
            return [this.#getBlockInStartIndexOfNode(s.focusNode, s.focusOffset),
                    this.#getBlockInStartIndexOfNode(s.anchorNode, s.anchorOffset, true)]
        //} else {return startIndexes}
        } else if (blockIndexes[0]===blockIndexes[1]) {// 同一テキストブロック内なら
            if (startIndexes[1] < startIndexes[0]) {// 後ろから前へ範囲選択していたら
                console.log('同一TB内　SWAP!!!!!!!')
                return [this.#getBlockInStartIndexOfNode(s.focusNode, s.focusOffset),
                        this.#getBlockInStartIndexOfNode(s.anchorNode, s.anchorOffset, true)]
            }
//            const anchorNodeIdx = blockIndexes[0].;
//            const focusNodeIdx = ;
        }
        return [startIndexes[0], this.#getBlockInStartIndexOfNode(s.focusNode, s.focusOffset, true)];
        /*
        if (blockIndexes[1] < blockIndexes[0]) {// 後ろから前へ範囲選択していたらスワップする
            const tmp = startIndexes[0];
            startIndexes[0] = startIndexes[1];
            startIndexes[1] = tmp;
        }
        return startIndexes;
        */
    }
    #getSelectedNodes() {return 'anchor focus'.split(' ').map(n=>this._.selection[`${n}Node`])}
    #getSelectedOffset() {return 'anchor focus'.split(' ').map(n=>this._.selection[`${n}Offset`])}
    #getSelectedBlockIdx() {return this.#getSelectedNodes().map(n=>Number(this.#getTextBlockElement(n).dataset.bi))}
    /*
    #isLeftToRight() {//選択を開始した方向は前にあるDOMから後ろにあるDOMか（もし逆なら計算が狂うのでanchorとfocusを逆転させる）
        const s = this._.selection;
        const [a,f] = this.#getSelectedNodes().map(n=>this.#getTextBlockElement(n));
        const [A,F] = this.#getSelectedOffset();
        if (a===f) {return A < F}
        else {
//            const [f,l] = this.#getSelectedBlockIdx();
//            return f < l;
            const blockInStartIndexes = [a,f].map(el=>{
                if ('bis' in el.dataset) {return Number(el.dataset.bis)} // ruby,em
                else {
                    
                }
            })
        }
    }
    */
    #isLeftToRight() {//選択を開始した方向は前にあるDOMから後ろにあるDOMか（もし逆なら計算が狂うのでanchorとfocusを逆転させる）
        const s = this._.selection;
        s.anchorNode
        s.focusNode
    }
    #getBlockInStartIndexOfNode(node, offset, isEnd=false) {// 指定したノードのテキストブロック内開始位置を取得する
        console.log(node, offset, node.nodeType, node.parentElement.tagName);
        if (3===node.nodeType) {// TextNode
            if ('RT RP'.split(' ').some(n=>n===node.parentElement.tagName)) {//ルビ文字
                if ('RUBY'===node.parentElement.parentElement.tagName) {
//                    if ('bis' in node.parentElement.parentElement.dataset) {return Number(node.parentElement.parentElement.dataset.bis) + (isEnd ? Number(node.parentElement.parentElement.dataset.len) : 0);}
                    if ('bis len'.split(' ').every(n=>n in node.parentElement.parentElement.dataset)) {
                        return Number(node.parentElement.parentElement.dataset.bis) + (isEnd ? Number(node.parentElement.parentElement.dataset.len) : 0)
                    }
                }
            }
            if ('RUBY'===node.parentElement.tagName) {//親文字
//                if ('bis' in node.parentElement.dataset) {return Number(node.parentElement.dataset.bis) + (isEnd ? Number(node.parentElement.dataset.len) : 0)}
                if ('bis len'.split(' ').every(n=>n in node.parentElement.dataset)) {
                    return Number(node.parentElement.dataset.bis) + (isEnd ? Number(node.parentElement.dataset.len) : 0)
                }
            }
            else if ('EM'===node.parentElement.tagName) {
//                if ('bis' in node.parentElement.dataset) {return Number(node.parentElement.dataset.bis) + (isEnd ? Number(node.parentElement.dataset.len) : 0)}
                if ('bis len'.split(' ').every(n=>n in node.parentElement.dataset)) {
                    return Number(node.parentElement.dataset.bis) + (isEnd ? Number(node.parentElement.dataset.len) : 0)
                }
            }
//            else if (this._.tagNames.block.some(n=>n===node.parentElement.tagName) {return 0+offset}
            else if (this._.tagNames.block.some(n=>n===node.parentElement.tagName)) {// p,h1〜6
                //const childNodes = [...node.parentElement.childNodes].reverse();
                const childNodes = [...node.parentElement.childNodes];
                const I = childNodes.findIndex(n=>n===node);
                if (-1===I) {throw new TypeError(`プログラムエラー。nodeは必ず存在するはず。`)}
                console.log('I:',I)
                let startIdx = 0;
                for (let i=0; i<I; i++) {
                    console.log(childNodes[i], startIdx)
                    if (3===childNodes[i].nodeType) {startIdx+=childNodes[i].textContent.Graphemes.length}
                    if (1===childNodes[i].nodeType) {
                        if ('RT RP'.split(' ').some(n=>n===childNodes[i].tagName)) {
                            if ('RUBY'===childNodes[i].parentElement.tagName) {
                                //if ('bis' in childNodes[i].parentElement.dataset) {startIdx+=Number(childNodes[i].parentElement.dataset.dataset.bis) + (isEnd ? Number(childNodes[i].parentElement.dataset.len) : 0)}
                                //if ('len' in childNodes[i].parentElement.dataset) {startIdx+=Number(childNodes[i].parentElement.dataset.len)}
                                if ('bis len'.split(' ').every(n=>n in childNodes[i].parentElement.dataset)) {
                                    startIdx+=Number(childNodes[i].parentElement.dataset.len)
                                    //if (isEnd) {startIdx+=Number(childNodes[i].parentElement.dataset.len)}
                                    //else {startIdx=Number(childNodes[i].parentElement.dataset.bis)}
                                }
                            }
                        }
                        else if ('RUBY'===childNodes[i].tagName) {//親文字
                            //if ('bis' in childNodes[i].parentElement.dataset) {startIdx+=Number(childNodes[i].parentElement.dataset.bis) + (isEnd ? Number(childNodes[i].parentElement.dataset.len) : 0)}
                            //if ('len' in childNodes[i].dataset) {startIdx+=Number(childNodes[i].dataset.len)}
                            //if ('len' in childNodes[i].dataset) {
                            if ('bis len'.split(' ').every(n=>n in childNodes[i].dataset)) {
                                startIdx+=Number(childNodes[i].dataset.len)
                                //if (isEnd) {startIdx+=Number(childNodes[i].dataset.len)}
                                //else {startIdx=Number(childNodes[i].dataset.bis)}
                            }
                        }
                        else if ('EM'===childNodes[i].tagName) {
                            //if ('bis' in childNodes[i].dataset) {startIdx+=Number(childNodes[i].dataset.bis) + (isEnd ? Number(childNodes[i].dataset.len) : 0)}
                            //if ('len' in childNodes[i].dataset) {startIdx+=Number(childNodes[i].dataset.len)}
                            //if ('len' in childNodes[i].dataset) {
                            if ('bis len'.split(' ').every(n=>n in childNodes[i].dataset)) {
                                startIdx+=Number(childNodes[i].dataset.len)
                                //if (isEnd) {startIdx+=Number(childNodes[i].dataset.len)}
                                //else {startIdx=Number(childNodes[i].dataset.bis)}
                            }
                        }
                    }
                }
                console.log(startIdx)
                return startIdx + offset + (this._.tagNames.heading.some(n=>n===node.parentElement.tagName) ? this.#getHeadingLevel(node.parentElement)+1 : 0);
//                return startIdx + (this._.tagNames.inline.some(v=>v===node.parentElement.tagName) ? 0 : offset);
//                return startIdx + (this._.tagNames.inline.some(v=>v===node.tagName) ? 0 : offset);
//                this._.tagNames.inline.
//                const i = childNodes.findIndex(n=>this._.tagNames.inline.some(v=>v===n));
            }
        }
        throw new TypeError(`プログラムエラー。selection.anchorNode, selection.focusNodeは必ずTextNodeのはずだし、rubyやemはdata-bis属性値を持っているべき。`)
        /*
        if (1===node.nodeType) {// Element
            
        } else if (3===node.nodeType) {// TextNode
            if ('RT'===node.parent || 'RP'===node.parent) {
                if ('RUBY'===node.parentElement.parent) {
                    if ('bis' in node.parentElement.parent.dataset) {return Number(node.parentElement.parent.dataset.bis)}
                }
            }
            else if ('EM'===node.parent) {
                if ('bis' in node.parentElement.dataset) {return Number(node.parentElement.dataset.bis)}
            }
            else if (this._.tagNames.block.some(n=>n===node.parentElement.tagName) {return 0}
        }
        */
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

