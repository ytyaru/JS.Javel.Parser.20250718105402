(function(){
class TextBlock {
    fromText(text) {
        if (0===text.trim().length) { return [] }
        text = text.replace('\r\n', '\n')
        text = text.replace('\r', '\n')
        const blocks = []; let start = 0;
        for (let match of text.matchAll(/\n\n/gm)) {
            blocks.push(text.slice(start, match.index).trimLine())
            start = match.index + 2
        }
        blocks.push(text.slice(start).trimLine())
        return blocks.filter(v=>v).map(b=>/^#{1,6} /.test(b) ? b.split('\n') : b).flat();
    }
}
window.TextBlock = TextBlock;
})();
