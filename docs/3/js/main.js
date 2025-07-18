window.addEventListener('DOMContentLoaded', (event) => {
    function removeEls(target) {while(target.firstChild) {target.firstChild.remove()}}
    function appendEls(target, children) {target.append(...children)}
    function changeEls(target, children) {
        while(target.firstChild) {target.firstChild.remove()}
        target.append(...children);
    }
    const names = 'manuscript type prev next nowPage allPage cover content scroll slide book'.split(' ');
    const [manuscript,type,prev,next,nowPage,allPage,cover,content,scroll,slide,book] = names.map(n=>document.querySelector(`[name="${n}"]`));
    const parser = new JavelParser(manuscript.value);
    const bk = new Book();
    manuscript.addEventListener('input', async(e)=>{
        parser.text = e.target.value;
        console.log(parser.blocks, parser.coverBlocks, parser.contentBlocks, parser.coverHtmls, parser.contentHtmls, parser.coverEls, parser.contentEls);
//        cover.innerHTML = parser.coverHtml;
//        content.innerHTML = parser.contentHtml;
//        book.innerHTML = bk.make(parser.els);

//        book.append(...bk.make(parser.els));
//        changeEls(scroll, parser.els);
//        changeEls(book, bk.make(parser.els));
        const target = window[type.value];
//        removeEls(target);
//        appendEls(target, bk.make(parser.els));

        
        'scroll slide book'.split(' ').map(n=>document.querySelector(`[name="${n}"]`).style.display='none');
        removeEls(scroll);
        appendEls(scroll, parser.els);
        removeEls(book);
        appendEls(book, bk.make(parser.els));
        document.querySelector(`[name="${type.value}"]`).style.display='block';
        document.querySelector(`[name="pager"]`).style.display = ('book'===e.target.value ? 'block' : 'none');
    });
    manuscript.dispatchEvent(new Event('input'));
    type.addEventListener('input', async(e)=>{
        'scroll slide book'.split(' ').map(n=>document.querySelector(`[name="${n}"]`).style.display='none');
        document.querySelector(`[name="${e.target.value}"]`).style.display='block';
        document.querySelector(`[name="pager"]`).style.display = ('book'===e.target.value ? 'block' : 'none');
    });
    type.dispatchEvent(new Event('input'));
    function updatePage() {
        nowPage.textContent = bk.nowPageNum;
        allPage.textContent = bk.allPageNum;
    }
    next.addEventListener('click', async(e)=>{bk.showNextPage();updatePage();});
    prev.addEventListener('click', async(e)=>{bk.showPrevPage();updatePage();});
    updatePage();
    next.focus();
});
window.addEventListener('beforeunload', (event) => {
    console.log('beforeunload!!');
});

