// サービスワーカーを登録する
if ('serviceWorker' in navigator) {navigator.serviceWorker.register('sw.js').then(
    (registration) => {console.log('Service worker registration successful:', registration);},
    (error) => {console.error(`Service worker registration failed: ${error}`);},
);} else {console.error("Service workers are not supported.");}
window.addEventListener('DOMContentLoaded', async(event) => {
    console.log('DOMContentLoaded!!');
    const installButton = new InstallButton();
    const appHeader = new AppHeader();
    const parser = new JavelParser();
    const splitter = new PageSplitter(parser);
//    const viewer = new PageViewer();
//    const demo = new Demo(parser, splitter);
    const viewer = new JavelViewer();
    // console.log()
    await viewer.make({
        javel: 'asset/javel/intro.jv',
//        javel: Dom.q(`[name="demo-edit"]`).value,
        viewer: Dom.q(`[name="demo-view"]`), 
        editor: Dom.q(`[name="demo-edit"]`), 
        writingMode:'horizontal-tb', 
//        writingMode:'vertical-rl', 
        width: Css.getInt('width', Dom.q(`[name="demo-edit"]`)), 
        height: Css.getInt('height', Dom.q(`[name="demo-edit"]`))
    });
    /*
    console.log(Dom.q(`[name="view"]`))
    Dom.q(`[name="view"]`).addEventListener('click', async(e)=>{
        Dom.q(`[name="book"]`).innerHTML = '';
        console.log(Dom.q(`[name="manuscript"]`).value);
        parser.manuscript = Dom.q(`[name="manuscript"]`).value;
        Dom.q(`[name="nowPageNum"]`).textContent = '1';
        Dom.q(`[name="progressRate"]`).style.display = 'inline';
        for await (let page of splitter.generateAsync()) {
            console.log('ページ数:',page.dataset.page)
            if ('1'==page.dataset.page) {Dom.q(`.page`).classList.add('show');await new Promise(resolve => setTimeout(resolve, 0));}
            Dom.q(`[name="progressRate"]`).textContent = `${parser.body.progress.rate.toFixed(100===parser.body.progress.rate ? 0 : 1)}%`;
            Dom.q(`[name="book"]`).appendChild(page);
            Dom.q(`[name="allPageNum"]`).textContent = `${page.dataset.page}<`;
        }
        Dom.q(`[name="allPageNum"]`).textContent = `${Dom.q(`[name="book"] > [data-page]:last-child`).dataset.page}`;
        Dom.q(`.page:not(.dummy)`).classList.add('show');
        Dom.q(`[name="progressRate"]`).style.display = 'none';
    });
    */
    /*
    Dom.q(`[name="prev"]`).addEventListener('click', async(e)=>{
        viewer.showPrevPage();
        Dom.q(`[name="nowPageNum"]`).textContent = viewer.nowPageNum;
    });
    Dom.q(`[name="next"]`).addEventListener('click', async(e)=>{
        viewer.showNextPage();
        Dom.q(`[name="nowPageNum"]`).textContent = viewer.nowPageNum;
    });
    */
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
