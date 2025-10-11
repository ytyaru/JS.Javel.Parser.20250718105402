(function(){
class Demo {
    constructor(parser, splitter) {
        this._ = {
            viewer: {
                el: Dom.q(`[name="demo-view"]`),
                width:0, height:0, writingMode:'vertical-rl',
            },
            editor: {
                el: Dom.q(`[name="demo-edit"]`),
            }
        }
        this.#setup(parser, splitter);
    }
    async #setup(parser, splitter) {
        const res = await fetch('asset/javel/intro.jv');
        const txt = await res.text();
        Dom.q(`[name="demo-edit"]`).value = txt;
        parser.manuscript = txt;
        for await (let page of splitter.generateAsync()) {
            Dom.q(`[name="demo-view"]`).appendChild(page);
        }
        Dom.q(`[name="demo-view"] *.page:not(.dummy)`).classList.add('show');
        this._.viewer.width = Css.getFloat('width', Dom.q('[name="demo-view"]'));
        this._.viewer.height = Css.getFloat('height', Dom.q('[name="demo-view"]'));
        this._.viewer.writingMode = Css.get('writing-mode', Dom.q('[name="demo-view"]'));
        this.#listen();
    }
    #listen() {
        console.log('listen()');
        //Dom.q(`[name="demo-view"]`).listen('click', async(e)=>{
        Dom.q(`[name="demo-view"]`).addEventListener('click', async(e)=>{
            const nowPage = Dom.q(`[name="demo-view"] *.page.show:not(.dummy)`);
            if (this.#isHorizontal) {
                if (this.#isClickLeft(e.clientX)) {this.#prevPage(nowPage)}
                else {this.#nextPage(nowPage)}
            } else {
                if (this.#isClickRight(e.clientX)) {this.#prevPage(nowPage)}
                else {this.#nextPage(nowPage)}
            }
            console.log(this.#isHorizontal, this.#isClickLeft(e.clientX), this._.viewer.width, this._.viewer.height);
        });
    }
    get #isHorizontal() {return this._.viewer.writingMode.startsWith('h')}
    get #isVertical() {return this._.viewer.writingMode.startsWith('v')}
    #isClickLeft(x, y) {return x < (this._.viewer.width / 2)}//画面を左右に二分割したとき左半分をクリックしたか
    #isClickRight(x, y) {return (this._.viewer.width / 2) <= x}//画面を左右に二分割したとき左半分をクリックしたか
    #nextPage(nowPage) {
        if (nowPage.nextElementSibling) {
            console.log('次に進む', nowPage);
            nowPage.nextElementSibling.classList.add('show');
            nowPage.classList.remove('show');
        } else {this.#prevPage(nowPage)} // 最期のページで次に進もうとしても前に戻る
    }
    #prevPage(nowPage) {
        if (nowPage.previousElementSibling) {
            console.log('前に戻る', nowPage);
            nowPage.previousElementSibling.classList.add('show');
            nowPage.classList.remove('show');
        } else {this.#nextPage(nowPage)} // 最初のページで前に戻ろうとしても次に進む
    }
}
window.Demo = Demo;
})();

