window.addEventListener('DOMContentLoaded', async(event) => {
    function getEl(name) {return document.querySelector(`[name="${name}"]`)}
//    getEl('width').value = window.screen.availWidth;
//    getEl('height').value = window.screen.availHeight;
    window.addEventListener('resize', async(event) => {
        if (getEl('isFitNowWindow').checked) {
            getEl('width').value = window.outerWidth;
            getEl('height').value = window.outerHeight;
            /*
            console.log(WindowSize);
            console.log(WindowSize.isMaximized);
            console.log(window.screen.availWidth, window.screen.availHeight);
            console.log(window.outerWidth, window.outerHeight);
            */
            getEl('isMaximaized').style.display = WindowSize.isMaximized ? 'inline-block' : 'none';
        }
    });
    'fullscreenchange webkitfullscreenchange mozfullscreenchange MSFullscreenChange'.split(' ').map(evNm=>{
        document.addEventListener(evNm, function() {
            console.log(evNm);

            if (document.fullscreenElement) {
                console.log('全画面表示');
            } else {
                console.log('全画面表示解除');
            }
//            window.dispatchEvent(new Event('resize'));
        });
    })
    window.dispatchEvent(new Event('resize'));
});
