import { connectToChild } from 'penpal/lib';
const fakeData = require('./fakeData.json');

document.addEventListener('DOMContentLoaded', () => {
    console.log('DOMContentLoaded');
    const iframe_rpa = <HTMLIFrameElement>document.getElementById('iframe_rpa');
    let test_connect = null;
    if (iframe_rpa) {
        test_connect = connectToChild({
            iframe: iframe_rpa,
            debug: true,
            methods: {
                getName: () => fakeData.iframeName,
                getZoomPercentage: () => fakeData.zoom,
                needLogin: () => {
                    return fakeData.login;
                },
                },
            });
        
        test_connect.promise.then((child) => {
            console.log('[bob-rpa] Parent: child', child);
            // child.hideElements(['app']).then((res) => console.log('hideElements', res));
            // child.showElements(['app']).then((res) => console.log('showElements', res));
            
            setTimeout(() => {
                child.switchCSLoader('on').then(() => console.log('[bob-rpa] Parent: switchCSLoader(\'on\') Done'));
            }, 6000);
            setTimeout(() => {
                child.switchCSLoader('off').then(() => console.log('[bob-rpa] Parent: switchCSLoader(\'off\') Done'));
            }, 9000);
            setTimeout(() => {
                child.injectCSHTML('<div class="dallasclass">TOTO</div>').then(() => console.log('[bob-rpa] Parent: injectCSHTML(\'<div class="dallasclass">TOTO</div>\') Done'));
            }, 12000);
            setTimeout(() => {
                child.hideElements(['.dallasclass']).then(() => console.log('[bob-rpa] Parent: hideElements(\'.dallasclass\') Done'));
            }, 15000);
            // setTimeout(() => {
            //     child.showElements(['.dallasclass']).then(() => console.log('[bob-rpa] Parent: showElements(\'.dallasclass\') Done'));
            // }, 18000);
            // setTimeout(() => {
            //     child.injectCSCSS('.dallasclass{color: red;}').then(() => console.log('[bob-rpa] Parent: injectCSCSS(\'TOTO\') Done'));
            // }, 21000);
            // setTimeout(() => {
            //     child.removeCSCSS('.dallasclass{color: red;}').then(() => console.log('[bob-rpa] Parent: removeCSCSS(\'TOTO\') Done'));
            // }, 24000);
            // setTimeout(() => {
            //     child.removeCSHTML('<div class="dallasclass">TOTO</div>').then(() => console.log('[bob-rpa] Parent: removeCSHTML(\'<div class="dallasclass">TOTO</div>\') Done'));
            // }, 27000);
        });
    }
});