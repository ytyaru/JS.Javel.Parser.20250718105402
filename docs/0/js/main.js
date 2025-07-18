window.addEventListener('DOMContentLoaded', (event) => {
    const names = 'manuscript cover content'.split(' ');
    const [manuscript,cover,content] = names.map(n=>document.querySelector(`[name="${n}"]`));
//    const manuscript = document.querySelector(`[name="manuscript"]`);
    const parser = new JavelParser(manuscript.value);
    manuscript.addEventListener('input', async(e)=>{
        parser.text = e.target.value;
        console.log(parser.blocks, parser.coverBlocks, parser.contentBlocks, parser.coverHtmls, parser.contentHtmls, parser.coverEls, parser.contentEls);
        console.log(parser.coverHtml);
        cover.innerHTML = parser.coverHtml;
        content.innerHTML = parser.contentHtml;
    });
    manuscript.dispatchEvent(new Event('input'));
});
window.addEventListener('beforeunload', (event) => {
    console.log('beforeunload!!');
});

