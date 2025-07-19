window.addEventListener('DOMContentLoaded', (event) => {
    const names = 'manuscript type prev next nowPage allPage cover content scroll slide novel'.split(' ');
    const [manuscript,type,prev,next,nowPage,allPage,cover,content,scroll,slide,novel] = names.map(n=>document.querySelector(`[name="${n}"]`));
    const parser = new JavelParser(manuscript.value);
    const splitter = new Splitter([['scroll', scroll],['slide', slide],['novel', novel]]);
    manuscript.addEventListener('input', async(e)=>{
        parser.text = e.target.value;
        console.log(parser.blocks, parser.coverBlocks, parser.contentBlocks, parser.coverHtmls, parser.contentHtmls, parser.coverEls, parser.contentEls);
//        const target = window[type.value];
        'scroll slide novel'.split(' ').map(n=>document.querySelector(`[name="${n}"]`).style.display='none');
        splitter.split(parser.els)
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
    /*
    function getPager() {
        switch (type.value) {
            case 'slide': return sld;
            case 'novel': return nvl; 
        }
    }
    */
    function updatePage() {
        /*
        const pgr = getPager();
        nowPage.textContent = pgr.nowPageNum;
        allPage.textContent = pgr.allPageNum;
        */
        const pgr = splitter.get(type.value);
        if (pgr) {
            nowPage.textContent = pgr.nowPageNum;
            allPage.textContent = pgr.allPageNum;
        }
    }
    next.addEventListener('click', async(e)=>{console.log(splitter.get(type.value));splitter.get(type.value).showNextPage();updatePage();});
    prev.addEventListener('click', async(e)=>{splitter.get(type.value).showPrevPage();updatePage();});
//    next.addEventListener('click', async(e)=>{getPager().showNextPage();updatePage();});
//    prev.addEventListener('click', async(e)=>{getPager().showPrevPage();updatePage();});
    next.focus();
});
window.addEventListener('beforeunload', (event) => {
    console.log('beforeunload!!');
});

