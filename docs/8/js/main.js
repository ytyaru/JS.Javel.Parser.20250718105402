window.addEventListener('DOMContentLoaded', (event) => {
    const names = 'manuscript type prev next nowPage allPage cover content scroll slide novel'.split(' ');
    const [manuscript,type,prev,next,nowPage,allPage,cover,content,scroll,slide,novel] = names.map(n=>document.querySelector(`[name="${n}"]`));
    const parser = new JavelParser(manuscript.value);
    const pageTypes = new PageTypes();
    const picker = new TextBlockPicker();
    'scroll slide novel'.split(' ').map(n=>{
        pageTypes.get(n).target = document.querySelector(`[name="${n}"]`);
    });
    manuscript.addEventListener('input', async(e)=>{
        parser.text = e.target.value;
        'scroll slide novel'.split(' ').map(n=>document.querySelector(`[name="${n}"]`).style.display='none');
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
        nowPage.textContent = pgr.nowPageNum;
        allPage.textContent = pgr.allPageNum;
    }
    next.addEventListener('click', async(e)=>{pageTypes.get(type.value).showNextPage();updatePage();});
    prev.addEventListener('click', async(e)=>{pageTypes.get(type.value).showPrevPage();updatePage();});

    let isTextSelecting = false;
    document.body.addEventListener('selectstart', async(e)=>{
        isTextSelecting = true;
    });
    document.body.addEventListener('pointerup', async(e)=>{
        if (!isTextSelecting) {return}
        isTextSelecting = false;
        const s = window.getSelection();
        picker.selection = window.getSelection();
        console.log('＜テキスト選択イベント＞')
        console.log('原稿(ブロック単位):', parser.blocks[picker.blockIndex])
        console.log('原稿(選択単位):', parser.blocks[picker.blockIndex].Graphemes.slice(...picker.blockInRange).join(''));
//        picker.blockIndex/blockInStart/blockInEnd
        /*
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

