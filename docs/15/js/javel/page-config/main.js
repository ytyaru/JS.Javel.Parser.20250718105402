window.addEventListener('DOMContentLoaded', async(event) => {
    // ページ設定の推奨値を取得する（画面（全画面）、紙面（A4））。画面最大化時のサイズ取得もしたいがユーザ操作を要し自動化不能。
    const fixedConfigs = PageConfig.suggests();
    const resizeConfigs = null; // リサイズ時
    const stockConfigs = null;  // 任意
    function mkPgCfOpts() {
        const configs = document.querySelector('[name="pageConfigs"]');
        const fixedConfigNames = ['全画面(横書き)', '全画面(縦書き)', 'A4(横書き)', 'A4(縦書き)'];
        const options = fixedConfigs.map((c,i)=>Dom.tags.option({value:conf2Str(c)}, fixedConfigNames[i]));
        console.log(options)
        configs.append(Dom.tags.optgroup({label:'fixed'}, ...options));
        return configs;
        /*
        const options = 
        conf2Str(c), '全画面(横書き)'
        conf2Str(c), '全画面(縦書き)'
        conf2Str(c), 'A4(横書き)'
        conf2Str(c), 'A4(縦書き)'

        Dom.tags.option({value:value}, name)
        */

    }
    function conf2Str(c) {return `${c.writingMode[0]}${c.inlineSize}x${c.blockSize}_${c.fontSize}`}
    mkPgCfOpts();
});
window.addEventListener('beforeunload', (event) => {
    console.log('beforeunload!!');
});

