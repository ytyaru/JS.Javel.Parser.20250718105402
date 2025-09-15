console.log('aaaaaaaaa!!');
window.addEventListener('DOMContentLoaded', async(event) => {
    console.log('DOMContentLoaded');
    const names = 'view isDnDView manuscript type prev next nowPage allPage cover content scroll slide novel'.split(' ');
    const [view,isDnDView,manuscript,type,prev,next,nowPage,allPage,cover,content,scroll,slide,novel] = names.map(n=>document.querySelector(`[name="${n}"]`));
    const pageConfig = new PageConfig();
    const parser = new JavelParser(manuscript.value);
    const pageTypes = new PageTypes();
    const picker = new TextBlockPicker();
    'scroll slide novel'.split(' ').map(n=>{
        const s = pageTypes.get(n);
        console.log(s)
        s.target = document.querySelector(`[name="${n}"]`);
        s.onLoading = ()=>updatePage();
        s.onLoaded = ()=>updatePage();
    });
    view.addEventListener('click', async(e)=>{
        console.log('view input!!');
        console.log(Dom);
        console.log(...['width','height'].map(n=>parseInt(Dom.q(`input[name="${n}"]`).value)), Dom.q(`select[name="writingMode"]`).value);
        pageConfig.calc(...['width','height'].map(n=>parseInt(Dom.q(`input[name="${n}"]`).value)), Dom.q(`select[name="writingMode"]`).value);
        console.log(Css.get('--page-inline-size'), Css.get('--page-block-size'));
       // parseInt(Dom.q(`input[name="width"]`).value), parseInt(Dom.q(`input[name="width"]`).value))
        parser.text = manuscript.value;
        pageTypes.get(type.value).target = Dom.q(`[name="viewer"] > [name="${type.value}"]`);
        console.log(pageTypes.get(type.value).target);
        console.log(['inline', 'block'].map(n=>Css.getFloat(`--page-${n}-size`)));
//        pageTypes.get(type.value).set = ['inline', 'block'].map(n=>Css.getFloat(`--page-${n}-size`));
        pageTypes.get(type.value)._.size.inline = Css.getInt(`--page-inline-size`);
        pageTypes.get(type.value)._.size.block = Css.getInt(`--page-block-size`);
        console.log(type.value, pageTypes.get(type.value), pageTypes.get(type.value).size);
        pageTypes.get(type.value).redom(parser.els);
    });
    /*
    manuscript.addEventListener('input', async(e)=>{
        parser.text = e.target.value;
        'scroll slide novel'.split(' ').map(n=>document.querySelector(`[name="${n}"]`).style.display='none');
        pageTypes.instances.map(async(i)=>{
            console.log('******UPDATE********:', i);
            await i.update(parser.els)
        });
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
    */
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
//        const idxs = picker.blockIndexes;
//        const rng = picker.blockInRange;
//        const blks = parser.blocks.slice(idxs[0], idxs[1]+1);
        console.log('原稿位置(blockIdx, stringIdx):', picker.blockIndexes, picker.blockInRange);
        console.log('原稿(ブロック単位):', picker.selectedBlocks);
        console.log('原稿(選択単位):', picker.selectedManuscript);
    })
    window.addEventListener('resize', async(e)=>{
        console.log(e)
        const is = `max:${WindowSize.isMaximized}, min:${WindowSize.isMinimized}, full:${WindowSize.isFullScreen}`;
        console.log(is);
        WindowSize.log();
        document.querySelector('[name="info"]').value = is+'\n'+WindowSize.gets();
        const isFitNowWindow = Dom.q(`input[name="isFitNowWindow"]`);
        if (isFitNowWindow.checked) {
            Dom.q(`input[name="width"]`).value = document.body.clientWidth;
            Dom.q(`input[name="height"]`).value = document.documentElement.clientHeight;
        }
    });
//    next.focus();
    view.focus();
});
window.addEventListener('beforeunload', (event) => {
    console.log('beforeunload!!');
});
