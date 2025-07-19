window.addEventListener('DOMContentLoaded', (event) => {
    const names = 'manuscript type prev next nowPage allPage cover content scroll slide novel'.split(' ');
    const [manuscript,type,prev,next,nowPage,allPage,cover,content,scroll,slide,novel] = names.map(n=>document.querySelector(`[name="${n}"]`));
    const parser = new JavelParser(manuscript.value);
    const pageTypes = new PageTypes();
//    'scroll slide novel'.split(' ').map(n=>pageTypes.get(n).target = window[n]);
    'scroll slide novel'.split(' ').map(n=>{
//        console.log(pageTypes.get(n).target, window[n]);
        //pageTypes.get(n).target = window[n];
        pageTypes.get(n).target = document.querySelector(`[name="${n}"]`);
    });
    //const splitter = new Splitter([['scroll', scroll],['slide', slide],['novel', novel]]);
    manuscript.addEventListener('input', async(e)=>{
        parser.text = e.target.value;
//        console.log(parser.blocks, parser.coverBlocks, parser.contentBlocks, parser.coverHtmls, parser.contentHtmls, parser.coverEls, parser.contentEls);
        'scroll slide novel'.split(' ').map(n=>document.querySelector(`[name="${n}"]`).style.display='none');
//        splitter.split(parser.els)
        console.log(parser.blocks, parser.els)
        pageTypes.instances.map(i=>i.redom(parser.els));
        document.querySelector(`[name="${type.value}"]`).style.display='block';
        document.querySelector(`[name="pager"]`).style.display = ('scroll'===e.target.value ? 'none' : 'block');
        updatePage();
    });
    manuscript.dispatchEvent(new Event('input'));
    type.addEventListener('input', async(e)=>{
        'scroll slide novel'.split(' ').map(n=>document.querySelector(`[name="${n}"]`).style.display='none');
        document.querySelector(`[name="${e.target.value}"]`).style.display='block';
        document.querySelector(`[name="pager"]`).style.display = ('scroll'===e.target.value ? 'none' : 'block');
        updatePage();
    });
    type.dispatchEvent(new Event('input'));
    function updatePage() {
        const pgr = pageTypes.get(type.value);
        if ('scroll'===pgr.typeId) {return}
        //const pgr = splitter.get(type.value);
        //if (!pgr) {return}
        nowPage.textContent = pgr.nowPageNum;
        allPage.textContent = pgr.allPageNum;
    }
    next.addEventListener('click', async(e)=>{pageTypes.get(type.value).showNextPage();updatePage();});
    prev.addEventListener('click', async(e)=>{pageTypes.get(type.value).showPrevPage();updatePage();});
//    next.addEventListener('click', async(e)=>{console.log(splitter.get(type.value));splitter.get(type.value).showNextPage();updatePage();});
//    prev.addEventListener('click', async(e)=>{splitter.get(type.value).showPrevPage();updatePage();});

    let isTextSelecting = false;
    document.body.addEventListener('selectstart', async(e)=>{
        isTextSelecting = true;
    });

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
    document.body.addEventListener('pointerup', async(e)=>{
        if (!isTextSelecting) {return}
        isTextSelecting = false;
        const s = window.getSelection();
        console.log('＜テキスト選択イベント＞')
        console.log(s.anchorNode, s.focusNode, s.anchorOffset, s.focusOffset);
        console.log(s.anchorNode.parentElement, s.focusNode.parentElement);
        console.log(s.anchorNode.parentElement.dataset.bi, s.anchorNode.parentElement.dataset.bis);
        console.log(parser.blocks[s.anchorNode.parentElement.dataset.bi]);

        let b = s.anchorNode;
        //while(Type.isEl(b) && b.parentElement && !b.hasAttribute('data-bi')) {b=b.parentElement;console.log('+')}
        while(3===b.nodeType || (1===b.nodeType && b.parentElement && !b.hasAttribute('data-bi'))) {b=b.parentElement;console.log('+')}
        console.log(b)
        console.log(b.dataset.bi)
        console.log('原稿(ブロック単位):', parser.blocks[b.dataset.bi])

        const [st, ed] = [getBlockInStartIndex(s.anchorNode, s.anchorOffset),
                          getBlockInStartIndex(s.focusNode, s.focusOffset, true)].sort((a,b)=>a-b);
        console.log(st, ed);
        console.log(parser.blocks[b.dataset.bi].Graphemes);
        console.log('原稿(選択単位):', parser.blocks[b.dataset.bi].Graphemes.slice(st, ed).join(''));
        /*
        const p = s.anchorNode.parentElement;
        const blockTagNames = [...new Array(6)].map((_,i)=>`H${i+1}`)
        blockTagNames.push('P');
        const inlineTagNames = 'EM RUBY RT RP BR'.split(' ');
        if (blockTagNames.some(n=>n===p.tagName)) {
            let blockInStartIndex = 0;
            for (let node of p.childNode) {
                if (node===s.anchorNode) {break}
                if (1===node.nodeType) {
                    if ('bis' in node.dataset) {blockInStartIndex+=Number(node.dataset.bis)}
                    else {throw new TypeError(`data-bisを用意してください。`)}
                } else if (3===node.nodeType) {
                    blockInStartIndex+=node.textContent.Graphmes.length;
                }
            }
        }
        else if (inlineTagNames.some(n=>n===p.tagName) {
            blockInStartIndex = Number(node.dataset.bis);
        }
        */
        /*
            start:TEXT, end:TEXT
            start:TEXT, end:em/ruby
            start:em/ruby, end:TEXT
            start:em/ruby, end:em/ruby
            親:h/p/em/ruby
            親=h: h内TEXT
            親=p: p内TEXT
            親=em: em内TEXT
            親=rt: rp内TEXT
            親=rp: rt内TEXT
            親=ruby: ruby内TEXT
        */
    })
    next.focus();
});
window.addEventListener('beforeunload', (event) => {
    console.log('beforeunload!!');
});

