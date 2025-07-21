window.addEventListener('DOMContentLoaded', (event) => {
    const names = 'manuscript type prev next nowPage allPage cover content scroll slide novel'.split(' ');
    const [manuscript,type,prev,next,nowPage,allPage,cover,content,scroll,slide,novel] = names.map(n=>document.querySelector(`[name="${n}"]`));
    const parser = new JavelParser(manuscript.value);
    const pageTypes = new PageTypes();
    const picker = new TextBlockPicker();
    'scroll slide novel'.split(' ').map(n=>{
        //pageTypes.get(n).target = document.querySelector(`[name="${n}"]`);
        const s = pageTypes.get(n);
        console.log(s)
        s.target = document.querySelector(`[name="${n}"]`);
        s.onLoading = ()=>updatePage();
        s.onLoaded = ()=>updatePage();
    });
    manuscript.addEventListener('input', async(e)=>{
        parser.text = e.target.value;
        'scroll slide novel'.split(' ').map(n=>document.querySelector(`[name="${n}"]`).style.display='none');
        pageTypes.instances.map(async(i)=>await i.update(parser.els));
//        pageTypes.instances.map(i=>i.redom(parser.els));
        picker.sourceBlocks = parser.blocks;
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
        allPage.textContent = pgr.allPageNum + (pgr.isLoaded ? '' : '<');
        console.log(nowPage, pgr.nowPageNum);
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
        const idxs = picker.blockIndexes;
        const rng = picker.blockInRange;
        const blks = parser.blocks.slice(idxs[0], idxs[1]+1);
        console.log('原稿(ブロック単位):', blks);
        console.log(picker.blockInRange);
        console.log('原稿(選択単位):', picker.selectedBlocks, picker.selectedManuscript);
    })
    function getEndBlock(blks,rng) {
        const blks2 = [...blks];
        blks2[0] = blks2[0].Graphemes.slice(rng[0]).join('');
        blks2[blks2.length-1] = blks2[blks2.length-1].Graphemes.slice(0, rng[1]).join('');
        return blks2;
    }
    window.addEventListener('resize', async(e)=>{
        console.log(e)
        const is = `max:${WindowSize.isMaximized}, min:${WindowSize.isMinimized}, full:${WindowSize.isFullScreen}`;
        console.log(is);
        WindowSize.log();
        document.querySelector('[name="info"]').value = is+'\n'+WindowSize.gets();
    });
    next.focus();
});
window.addEventListener('beforeunload', (event) => {
    console.log('beforeunload!!');
});

