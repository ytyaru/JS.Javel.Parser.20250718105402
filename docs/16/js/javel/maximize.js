(function(){//
window.dispatchEvent('maximize', new CustomEvent())
window.addEventListener('resize', async(e)=>{
    if (window.innerWidth === screen.availWidth && window.innerHeight === screen.availHeight) {
        // ウィンドウが最大化された場合の処理
        console.log('ウィンドウが最大化されました');
    } else {
        // ウィンドウが最大化されていない場合の処理
        console.log('ウィンドウが最大化されていません');
    }
});
})();

