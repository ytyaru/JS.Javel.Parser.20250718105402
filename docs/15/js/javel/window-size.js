(function(){
class WindowSize {// 窓最大化／FullScreen判定
    static get isMaximized() {
      return window.screen.availWidth === window.outerWidth &&
             window.screen.availHeight === window.outerHeight;
//      return window.screen.availWidth === window.innerWidth &&
//             window.screen.availHeight === window.innerHeight;
    }
    static get isMinimized() {//
//        return (window.outerWidth < window.screen.availWidth) || (window.outerHeight < window.screen.availHeight);
//        return (window.outerWidth < 1) || (window.outerHeight < 1);
        return document.hidden;
    }
    static get isFullScreen() {//https://blog.tsukumijima.net/article/javascript-fullscreen-decision/
        if ((document.fullscreenElement !== undefined && document.fullscreenElement !== null) || // HTML5 標準
            (document.mozFullScreenElement !== undefined && document.mozFullScreenElement !== null) || // Firefox
            (document.webkitFullscreenElement !== undefined && document.webkitFullscreenElement !== null) || // Chrome・Safari
            (document.webkitCurrentFullScreenElement !== undefined && document.webkitCurrentFullScreenElement !== null) || // Chrome・Safari (old)
            (document.msFullscreenElement !== undefined && document.msFullscreenElement !== null)){ // IE・Edge Legacy
            return true; // fullscreenElement に何か入ってる = フルスクリーン中
        } else {
            return false; // フルスクリーンではない or フルスクリーン非対応の環境（iOS Safari など）
        }
    }
    static get screens() {return [window.screen.width, window.screen.height]}
    static get avails() {return [window.screen.availWidth, window.screen.availHeight]}
    static get outers() {return [window.outerWidth, window.outerHeight]}
    static get inners() {return [window.innerWidth, window.innerHeight]}
    static get clients() {return [document.body.clientWidth, document.documentElement.clientHeight]}
    static get scrolls() {return [document.body.scrollWidth, document.documentElement.offsetHeight]}
    static swap(wh) {
        const tmp = wh[0];
        wh[0] = wh[1];
        wh[1] = tmp;
        return wh;
    }
    static log() {
        console.log('window.screen:', window.screen.width, window.screen.height);
        console.log('window.screen.avail:', window.screen.availWidth, window.screen.availHeight);
        console.log('window.outer:', window.outerWidth, window.outerHeight);
        console.log('window.inner:', window.innerWidth, window.innerHeight);
        console.log('document.client:', document.body.clientWidth, document.documentElement.clientHeight);
        console.log('document.scroll:', document.body.scrollWidth, document.documentElement.offsetHeight);
    }
    static gets() {
        return [
            window.screen.width, window.screen.height,
            window.screen.availWidth, window.screen.availHeight,
            window.outerWidth, window.outerHeight,
            window.innerWidth, window.innerHeight,
            document.body.clientWidth, document.documentElement.clientHeight,
            document.body.scrollWidth, document.documentElement.offsetHeight,
        ]
    }
    /*
    document.addEventListener("visibilitychange", function() {
      if (document.hidden) {
        console.log("ウィンドウは最小化または他のアプリにフォーカスされました。");
      } else {
        console.log("ウィンドウは表示されました。");
      }
    });
    */
}
window.WindowSize = WindowSize;
})();
