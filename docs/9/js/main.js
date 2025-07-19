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
        //console.log('原稿(ブロック単位):', parser.blocks[picker.blockIndex])
        const idxs = picker.blockIndexes;
        const rng = picker.blockInRange;
        const blks = parser.blocks.slice(idxs[0], idxs[1]+1);
        console.log('原稿(ブロック単位):', blks);
        console.log(picker.blockInRange);
//        const blks2 = [...blks];
//        blks2[0] = blks2[0].Graphemes.slice(rng[0]);
//        blks2[blks2.length-1] = [blks2.length-1].Graphemes.slice(0, rng[1]);
//        const str = ((idxs[0]===idxs[1]) ? blks[idxs[0]].Graphemes.slice(...rng) : blks2).join('');
        //const str = ((idxs[0]===idxs[1]) ? blks[0].Graphemes.slice(...rng) : getEndBlock(blks,rng)).join('\n\n');
        const str = (1===blks.length) ? blks[0].Graphemes.slice(...rng.sort((a,b)=>a-b)).join('') : getEndBlock(blks,rng).join('\n\n');
        console.log('原稿(選択単位):', str);
        //console.log('原稿(選択単位):', parser.blocks[picker.blockIndex].Graphemes.slice(...picker.blockInRange).join(''));
    })
    function getEndBlock(blks,rng) {
        const blks2 = [...blks];
        blks2[0] = blks2[0].Graphemes.slice(rng[0]).join('');
        blks2[blks2.length-1] = blks2[blks2.length-1].Graphemes.slice(0, rng[1]).join('');
        return blks2;
    }
    next.focus();
});
window.addEventListener('beforeunload', (event) => {
    console.log('beforeunload!!');
});

