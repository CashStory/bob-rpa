import { connectToChild } from 'penpal/lib';
const fakeData = require('./fakeData.json');

const stepWait = 3000;
let wait = stepWait;

const testFunction = (callback) => {
    setTimeout(() => {
        callback();
    },wait);
    wait += stepWait;
}

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
            testFunction(() => child.switchCSLoader('on').then(() => console.log('[bob-rpa] Parent: switchCSLoader(\'on\') Done')));
            testFunction(() => child.switchCSLoader('off').then(() => console.log('[bob-rpa] Parent: switchCSLoader(\'off\') Done')));
            testFunction(() => child.injectCSHTML('<div class="dallasclass">TOTO</div>').then(() => console.log('[bob-rpa] Parent: injectCSHTML(\'<div class="dallasclass">TOTO</div>\') Done')));
            testFunction(() => child.injectCSCSS('.dallasclass{color: red;}').then(() => console.log('[bob-rpa] Parent: injectCSCSS(\'.dallasclass{color: red;}\') Done')));
            testFunction(() => child.removeCSCSS('.dallasclass{color: red;}').then(() => console.log('[bob-rpa] Parent: removeCSCSS(\'.dallasclass{color: red;}\') Done')));
            testFunction(() => child.hideElements(['.dallasclass']).then(() => console.log('[bob-rpa] Parent: hideElements(\'.dallasclass\') Done')));
            testFunction(() => child.showElements(['.dallasclass']).then(() => console.log('[bob-rpa] Parent: showElements(\'.dallasclass\') Done')));
            testFunction(() => child.removeCSHTML('<div class="dallasclass">TOTO</div>').then(() => console.log('[bob-rpa] Parent: removeCSHTML(\'<div class="dallasclass">TOTO</div>\') Done')));
        });
    }
});