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
            
            child.switchCSLoader('on').then(() => console.log('[bob-rpa] Parent: switchCSLoader(\'on\') Done'));
            // child.switchCSLoader('off').then((res) => console.log('switchCSLoader off', res));
        
            // child.injectCSHTML('off').then((res) => console.log('injectCSHTML off', res));
            // child.removeCSHTML('off').then((res) => console.log('removeCSHTML off', res));
        
            // child.injectCSCSS('off').then((res) => console.log('injectCSCSS off', res));
            // child.removeCSCSS('off').then((res) => console.log('removeCSCSS off', res));
        });
    }
});