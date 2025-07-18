window.addEventListener('DOMContentLoaded', (event) => {
    const names = 'manuscript cover content book'.split(' ');
    const [manuscript,cover,content,book] = names.map(n=>document.querySelector(`[name="${n}"]`));
    const parser = new JavelParser(manuscript.value);
    const bk = new Book();
    manuscript.addEventListener('input', async(e)=>{
        parser.text = e.target.value;
        console.log(parser.blocks, parser.coverBlocks, parser.contentBlocks, parser.coverHtmls, parser.contentHtmls, parser.coverEls, parser.contentEls);
//        cover.innerHTML = parser.coverHtml;
//        content.innerHTML = parser.contentHtml;
//        book.innerHTML = bk.make(parser.els);
        book.append(...bk.make(parser.els));
    });
    manuscript.dispatchEvent(new Event('input'));
});
window.addEventListener('beforeunload', (event) => {
    console.log('beforeunload!!');
});

