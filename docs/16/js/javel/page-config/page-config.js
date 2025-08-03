(function(){// Manuscript > TextBlock > HTML > Element
class PageConfig {
    // CSSでは1in=96px。1in=2.54cm。210mm/25.4mm=8.26771653543inch=793.7007874px。297/25.4mm=11.6929133858inch=1122.519685。
    static suggests() {//全画面、A4(210mm x 297mm)時の推奨サイズを返す https://www.graphic.jp/comic/user_guide/px_mm_converter
        const params = [
            [screen.width, screen.height, 'horizontal-tb'],
            [screen.width, screen.height, 'vertical-rl'],
            [793, 1122, 'horizontal-tb'],
            [793, 1122, 'vertical-rl'],
        ];
        return params.map(p=>new PageConfig(...p));
    }
    constructor(width, height, writingMode) {
        console.log('screen:', screen.width, screen.height);
        console.log(width, height, writingMode);
        this._ = {
            size:{inline:0, block:0, width:0, height:0}, 
            aspectRatio:{inline:0, block:0}, 
            orientation:'portrait/landscape',
            column: {count:{min:1, max:2}, gap:{min:0, max:2}},
            writingMode: 'vertical-rl',
            textOrientation: 'upright',
            // 文庫本のサイズ8〜10pt(10.67〜13.34px)が一般的で学習用なら10.5〜14pt(14〜18.67px)
            lineOfChars: { // 一行あたりの字数(25〜50の間で調整可能。32〜40がお勧め)
                range: {min:25, max:50},   // 最小〜最大
                suggest: {min:32, max:40}, // 日本語が読みやすい数
            },
            pageOfLines: {suggest: {min:15, max:20}},        // ページあたりの行数
            pageOfChars: {suggest: {min:480, max:600}},      // ページあたりの字数
            bookOfPages: {suggest: {min:150, max:300}},      // 文庫本一冊あたりのページ数（134〜261）
            bookOfChars: {suggest: {min:80000, max:125000}}, // 文庫本一冊あたりの字数
            //font: {size:{min:16, max:32}, spacing:0.05, height:1.7},
            font: {size:{min:16, max:32}, spacing:{min:0, max:0.05}, height:{range:{min:1, max:1.75},suggest:{min:1.5,max:1.7}}},
            pageOfColumn: {
                size:{inline:0, block:0, width:0, height:0},
                lineOfChars:0,
                font: {size:16, spacing:0, height:1},
                column: {count:1, gap:2},
            },
            target: {
                p: {
                    font: {
                        family: `'Noto Serif JP', 'Source Han Serif JP', 'Noto Color Emoji', serif`,
                        size: 16,
                        lineHeight: 1.7,
                        letterSpacing: 0.05,
                    }
                },
                h1: {
                    font: {
                        family: `'Noto Sans JP', 'Source Han Sans JP', 'Noto Color Emoji', sans-serif`,
                    }
                },
                em: {
                    font: {style: 'normal'}, /* 非イタリック化 */
                    textEmphasis: `${this.textEmphasisStyle} ${this.textEmphasisColor}`,
                    webkit: {textEmphasis: `${this.textEmphasisStyle} ${this.textEmphasisColor}`},
                }
            },
        }
        this.#calc(width ?? document.body.clientWidth, height ?? document.documentElement.clientHeight, this.#getValidWritingMode(writingMode) ?? 'horizontal-tb');
        /*
        this.#calcSize();
        this.#calcSize(screen.width, screen.heigth, 'horizontal-tb');
        this.#calcSize(screen.width, screen.heigth, 'vertical-rl');
        this.#calcSize();
        this.#calcSize(document.body.clientWidth, document.documentElement.clientHeight, 'horizontal-tb');
        console.log(this._);
        */
        console.log('aaaaaaa:', this.width, this.height);
    }
    #calc(width, height, writingMode) {
        console.log(width, height, writingMode);
        const W = (Number.isSafeInteger(width) && 0 < width) ? width : document.body.clientWidth;
        const H = (Number.isSafeInteger(height) && 0 < height) ? height : document.documentElement.clientHeight;
        console.log(W, H);
        this._.size.width = W;
        this._.size.height = H;
        this._.orientation = W < H ? 'portrait' : 'landscape';
        //this.writingMode = this.#getValidWritingMode(writingMode) ?? 'horizontal-tb';
        this._.writingMode = this.#getValidWritingMode(writingMode) ?? 'horizontal-tb';
        this._.size.inline = this.isVertical ? H : W;
        this._.size.block = this.isVertical ? W : H;
        this.#setAspectRatio();
        console.log(this._.size.inline, this._.size.block);
        // 一ページにある一カラムあたりのインライン長
        this.#setColumn();
        this._.pageOfColumn.size.inline = (this._.size.inline / this._.pageOfColumn.column.count) - (this._.pageOfColumn.font.size * this._.pageOfColumn.column.gap);
        this._.pageOfColumn.size.block = this._.size.block;
        this._.pageOfColumn.size.width = this.isVertical ? this._.pageOfColumn.size.block : this._.pageOfColumn.size.inline;
        this._.pageOfColumn.size.height = this.isVertical ? this._.pageOfColumn.size.inline : this._.pageOfColumn.size.block;
        console.log(this._.pageOfColumn.size.inline, this._.pageOfColumn.size.block);
        console.log(this._.pageOfColumn.size.width, this._.pageOfColumn.size.height);
        console.log('a::::::::::::::', this.columnCount, this.columnGap);
        console.log('x::::::::::::::', this._.pageOfColumn.size.width, this._.pageOfColumn.size.height);
        console.log('y::::::::::::::', this._.pageOfColumn.size.inline, this._.pageOfColumn.size.block);
        // 字間と行間
        this._.pageOfColumn.font.spacing = this._.font.spacing[((this._.font.size.min * (this._.lineOfChars.suggest.min * (1+this._.font.spacing.max))) < this._.pageOfColumn.size.inline) ? 'max' : 'min'];
        this._.pageOfColumn.font.height = this.#getLineHeight();
        // 字
        this.#setLineOfChars(); // 40〜25字／行
        this._.pageOfColumn.font.size = this._.pageOfColumn.size.inline / (this._.pageOfColumn.lineOfChars + (this._.pageOfColumn.font.spacing * this._.pageOfColumn.lineOfChars));
//        this.#setCss();
    }
    /*
    #calcSize() {
//        this._.target.page.column.count = this.#getColumnCount();
        const [W,H] = [document.body.clientWidth, document.documentElement.clientHeight];
        this._.size.width = W;
        this._.size.height = H;
        this._.orientation = W < H ? 'portrait' : 'landscape';
        this._.size.inline = this.isVertical ? H : W;
        this._.size.block = this.isVertical ? W : H;
        this.#setAspectRatio();

        this.#setColumn();
        // 一ページにある一カラムあたりのインライン長
        this._.pageOfColumn.size.inline = (this._.size.inline / this._.pageOfColumn.count) - (this._.pageOfColumn.font.size * this._.pageOfColumn.column.gap);
        this._.pageOfColumn.size.block = this._.size.block;

        // 字間と行間
        this._.pageOfColumn.font.spacing = this._.font.spacing[((this._.font.size.min * (this._.lineOfChars.suggest.min * (1+this._.font.spacing.max))) < this._.pageOfColumn.size.inline) ? 'max' : 'min'];
        this._.pageOfColumn.font.height = this.#getLineHeight();

        // 字
        this.#setLineOfChars(); // 40〜25字／行
        this._.pageOfColumn.font.size = this._.pageOfColumn.size.inline / (this._.pageOfColumn.lineOfChars + (this._.pageOfColumn.font.spacing * this._.pageOfColumn.lineOfChars));
        this.#setCss();
    }
    */
    setCss() {
        const S = document.documentElement.style;
        const s = S.setProperty.bind(S);
        s('--page-inline-size', this._.pageOfColumn.size.inline + 'px');
        s('--page-block-size', this._.pageOfColumn.size.block + 'px');
        s('--column-count', this._.pageOfColumn.column.count);
        s('--column-gap', this._.pageOfColumn.column.gap + 'em');
        s('--writing-mode', this.writingMode);
        s('--text-orientation', this.textOrientation);
        s('--font-size', this._.pageOfColumn.font.size + 'px');
        s('--line-height', this._.pageOfColumn.font.height + 'em');
        s('--letter-spacing', this._.pageOfColumn.font.spacing + 'em');
    }
    #setAspectRatio() {
        const gcd = (a, b) => b === 0 ? a : gcd(b, a % b);
        const commonDivisor = gcd(this._.size.inline, this._.size.block);
        this._.aspectRatio.inline = this._.size.inline / commonDivisor;
        this._.aspectRatio.block = this._.size.block / commonDivisor;
    }
    #getLineHeight() {
        // 544px(20行*(16px*1.7em))より大きいなら行間を1.7emにする
        // 360px(15行*(16px*1.5em))より大きいなら行間を1.5emにする
        // 上記以下なら行間を1emにする
        const thresholds = 'max min'.split(' ').map(n=>[this._.pageOfLines.suggest[n] * this._.font.size.min * this._.font.height.suggest[n], this._.font.height.suggest[n]]);
        console.log(thresholds, this._.pageOfColumn.size.block)
        //for (let [sb, lh] of thresholds) {if (this._.size.block < sb) {return lh}}
        //for (let [sb, lh] of thresholds) {if (this._.pageOfColumn.size.block < sb) {return lh}}
        for (let [sb, lh] of thresholds) {if (sb < this._.pageOfColumn.size.block) {return lh}}
        return this._.font.height.range.min;
    }
    #setColumn() {// 一ページあたりの列数と隙間
        this._.pageOfColumn.column.count = this.#getColumnCount();
        this._.pageOfColumn.column.gap = (this._.pageOfColumn.column.count-1) * this._.column.gap.max;
//        this._.pageOfColumn.count = this.#getColumnCount();
//        this._.pageOfColumn.gap = (this._.pageOfColumn.count-1) * this._.column.gap.max;
    }
    #getColumnCount() {//32字*(16px+0.05em)*2列) + column-gap(2字分)超過なら2列にする。それ以外は1列。
        const charPx = (this._.font.size.min * (1+this._.font.spacing.max));
        const columnCount = 2;
        const columnGap = charPx * 2;
        const sz = (this._.lineOfChars.suggest.min * charPx * columnCount) + columnGap;
        return sz < (this.isHorizontal ? this._.size.inline : this._.size.block) ? 2 : 1;
    }
    #setLineOfChars() {
        /*
        const oloc = this.#getOverLineOfChars();
        if (oloc < this._.lineOfChars.suggest.max+1) {this._.pageOfColumn.lineOfChars = oloc-1;}
        else {this._.pageOfColumn.lineOfChars = this._.pageOfColumn.size.inline < (this._.lineOfChars.range.min * this._.font.size.min) ? this._.lineOfChars.range.min : this._.lineOfChars.suggest.max;}
        //else {this._.pageOfColumn.lineOfChars = this._.lineOfChars.suggest.max;}
        */
        const safeLoc = this.#getSafeLineOfChars();
        //this._.pageOfColumn.lineOfChars = safeLoc ?? this._.lineOfChars.range.min;
        this._.pageOfColumn.lineOfChars = safeLoc ?? (this._.pageOfColumn.size.inline < (this._.lineOfChars.range.min * this._.font.size.min) ? this._.lineOfChars.range.min : this._.lineOfChars.suggest.max);

    }
    #getSafeLineOfChars() {
    //#getOverLineOfChars() {
        // 40〜32字に収まるなら返す(16px/字)
        for (let loc of [...new Array(this._.lineOfChars.suggest.max - this._.lineOfChars.range.min)].map((_,i)=>this._.lineOfChars.suggest.max-i)) {
            //console.log(this._.pageOfColumn.size.inline, ((this._.font.size.min * (1+this._.font.spacing)) * loc));
            //console.log(this._.pageOfColumn.size.inline, ((this._.pageOfColumn.font.size.min * (1+this._.pageOfColumn.font.spacing)) * loc));
            //console.log(this._.pageOfColumn.size.inline, this._.pageOfColumn.font.size.min, this._.pageOfColumn.font.spacing, loc);
            //console.log(this._.pageOfColumn.size.inline, this._.font.size.min, this._.pageOfColumn.font.spacing, loc);
            console.log(this._.pageOfColumn.size.inline, ((this._.font.size.min * (1+this._.pageOfColumn.font.spacing)) * loc));
            //if (this._.pageOfColumn.size.inline < ((this._.font.size.min * (1+this._.font.spacing)) * loc)) {return loc}
            //if (this._.pageOfColumn.size.inline < ((this._.font.size.min * (1+this._.pageOfColumn.font.spacing)) * loc)) {return loc}
            if (this._.pageOfColumn.size.inline < ((this._.font.size.min * (1+this._.pageOfColumn.font.spacing)) * loc)) {continue}
            return loc;
        }
        return null;
        //return this._.lineOfChars.suggest.min;
    }
    get isPortrait() {return 'portrait'===this._.orientation}
    get isLandscape() {return 'landscape'===this._.orientation}
    get writingMode() {return this._.writingMode}
    set writingMode(v) {
        const V = this.#getValidWritingMode(v);
        if (V) {
            this._.writingMode = v;
            if (this.isHorizontal) {this.textOrientation = 'mixed'}
            else if (this.isVertical) {this.textOrientation = 'upright'}
//            this.#calcSize();
            this.#calc();
        }
        /*
        if ('horizontal-tb vertical-rl vertical-lr sideways-rl sideways-lr'.split(' ').some(c=>c===v)) {this._.writingMode = v;}
        else if ('horizontal-tb'.startsWith(v)) {this._.writingMode = v;}
        else if ('vertical'.startsWith(v)) {this._.writingMode = 'vertical-rl';}
        else if ('sideways'.startsWith(v)) {this._.writingMode = 'sideways-rl';}
        */
    }
    #getValidWritingMode(v) {
        if ('horizontal-tb vertical-rl vertical-lr sideways-rl sideways-lr'.split(' ').some(c=>c===v)) {return v}
        else if ('horizontal'.startsWith(v.toLowerCase())) {return v.toLowerCase()}
        else if ('vertical'.startsWith(v.toLowerCase())) {return 'vertical-rl';}
        else if ('sideways'.startsWith(v.toLowerCase())) {return 'sideways-rl';}
        else {return null}
    }
    get isVertical() {return this._.writingMode.startsWith('vertical')}
    get isHorizontal() {return this._.writingMode.startsWith('horizontal')}
    swapWritingMode() {this._.writingMode = this.isHorizontal ? 'vertical-rl' : 'horizontal-tb';}
    get textOrientation() {return this._.textOrientation}
    set textOrientation(v) {if ('mixed upright sideways-right sideways use-glyph-orientation'.split(' ').some(c=>c===v)) {this._.textOrientation = v}}

    get columnCount() {return this._.pageOfColumn.column.count}
    get columnGap() {return this._.pageOfColumn.column.gap}
    get width() {return this._.pageOfColumn.size.width}
    get height() {return this._.pageOfColumn.size.height}
    get inlineSize() {return this._.pageOfColumn.size.inline}
    get blockSize() {return this._.pageOfColumn.size.block}
    get lineOfChars() {return this._.pageOfColumn.lineOfChars}
    get fontSize() {return this._.pageOfColumn.font.size}
    get letterSpacing() {return this._.pageOfColumn.font.spacing}
    get lineHeight() {return this._.pageOfColumn.font.height}
 
}
window.PageConfig = PageConfig;
})();
