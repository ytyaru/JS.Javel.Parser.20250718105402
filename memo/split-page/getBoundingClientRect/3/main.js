window.addEventListener('DOMContentLoaded', async(event) => {
    console.log('DOMContentLoaded!!');
    const parser = new JavelParser();
    //const splitter = new PageSplitter(Dom.q(`[name="book"]`));
    //const splitter = new PageSplitter(parser, Dom.q(`[name="book"]`));
    const splitter = new PageSplitter(parser);
    const viewer = new PageViewer();
//    splitter.target = Dom.q(`[name="book"]`);
    console.log(Dom.q(`[name="view"]`))
    Dom.q(`[name="view"]`).addEventListener('click', async(e)=>{
        Dom.q(`[name="book"]`).innerHTML = '';
        console.log(Dom.q(`[name="manuscript"]`).value);
        parser.manuscript = Dom.q(`[name="manuscript"]`).value;
        Dom.q(`[name="nowPageNum"]`).textContent = '1';
        for (let page of splitter.generate()) {
            console.log('ページ数:',page.dataset.page)
            if ('1'==page.dataset.page) {Dom.q(`.page`).classList.add('show');}
            Dom.q(`[name="book"]`).appendChild(page);
            Dom.q(`[name="allPageNum"]`).textContent = `${page.dataset.page}`;
        }
        Dom.q(`.page`).classList.add('show');
        /*
//        console.log(parser.els);
//        Dom.q(`[name="book"]`).append(...parser.els);
        splitter.split(parser.els);
        console.log(splitter.pages);
        Dom.q(`[name="book"]`).append(...splitter.pages);

        Dom.q(`.page`).classList.add('show');
        Dom.q(`[name="nowPageNum"]`).textContent = '1';
        Dom.q(`[name="allPageNum"]`).textContent = `${splitter.pages.length}`;

        console.log(Css.get(`--page-inline-size`), Css.get(`--page-block-size`));
//        Dom.q(`[name="book"]`).append(...parser.els);
//        splitter.split(parser.els);
        */
        /*
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
        */
    });
    Dom.q(`[name="prev"]`).addEventListener('click', async(e)=>{
        viewer.showPrevPage();
        Dom.q(`[name="nowPageNum"]`).textContent = viewer.nowPageNum;
    });
    Dom.q(`[name="next"]`).addEventListener('click', async(e)=>{
        viewer.showNextPage();
        Dom.q(`[name="nowPageNum"]`).textContent = viewer.nowPageNum;
    });
    /*
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
    */
});
window.addEventListener('beforeunload', (event) => {
    console.log('beforeunload!!');
});
