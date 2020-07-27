import { connectToChild } from 'penpal/lib';

const iframe_rpa = <HTMLIFrameElement>document.getElementById('iframe_rpa');
const test_connect = connectToChild({
    iframe: iframe_rpa,
    debug: true,
    methods: {
        getName: () => 'test Name',
        getZoomPercentage: () => '100',
        needLogin: () => {
            return {
                login: 'test login',
                pwd: 'test password'
            };
        },
        },
    });

test_connect.promise.then((child) => {
    child.hideElements(['app']).then((res) => console.log('hideElements', res));
    child.showElements(['app']).then((res) => console.log('showElements', res));
    
    child.switchCSLoader('on').then((res) => console.log('switchCSLoader on', res));
    child.switchCSLoader('off').then((res) => console.log('switchCSLoader off', res));

    child.injectCSHTML('off').then((res) => console.log('injectCSHTML off', res));
    child.removeCSHTML('off').then((res) => console.log('removeCSHTML off', res));

    child.injectCSCSS('off').then((res) => console.log('injectCSCSS off', res));
    child.removeCSCSS('off').then((res) => console.log('removeCSCSS off', res));
});
export default test_connect;
