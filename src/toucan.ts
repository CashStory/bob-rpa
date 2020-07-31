import { BobRpa, LoginData } from './base';
require('./toucan.css');

class ToucanRpa extends BobRpa {
    isLoginWrapperPresent(): boolean {
        if (this.DEBUG) {
            console.log('[Bob-rpa] Child: isLoginWrapperPresent');
        }
        if (document.getElementsByClassName("login-wrapper")
            && document.getElementsByClassName("login-wrapper").length > 0) {
            return true;
        }
        return false;
    }

    logoutAction() {
        if (this.DEBUG) {
            console.log('[Bob-rpa] Child: logoutAction');
        }
        localStorage.setItem('token', '');
        localStorage.setItem('embed-token', '');
        localStorage.setItem('user', '');
        localStorage.setItem('userId', '');
        localStorage.setItem('currentUser', '');
        window.location.href = "/logout";
    }


    initAutoLogin(): Promise<LoginData | null>  {
        if (this.parent) {
            return this.parent.needLogin().then((data: LoginData) => {
                if (!data) {
                    if (this.DEBUG) {
                        console.log('[Bob-rpa] Child: needLogin no data');
                    }
                    this.switchCSLoader('off');
                    return null;
                } else {
                    if (this.DEBUG) {
                        console.log('[Bob-rpa] Child: needLogin confirmed');
                    }
                    this.cleanLogin();
                    this.watchFunctions.push(() => this.checkLogin());
                    // eslint-disable-next-line @typescript-eslint/no-this-alias
                    const bob = this;
                    const oldXHROpen = window.XMLHttpRequest.prototype.open;
                    // listen for 401 and check login if that happen !
                    window.XMLHttpRequest.prototype.open = function() {
                        if (bob.DEBUG) {
                            console.log('[Bob-rpa] Child: XMLHttpRequest interceptor');
                        }
                        this.addEventListener('load', function() {
                            if (bob.DEBUG) {
                                console.log('[Bob-rpa] Child: XMLHttpRequest load');
                            }
                            if (this.status == 401) {
                                if (bob.DEBUG) {
                                    console.log('[Bob-rpa] Child: XMLHttpRequest 401 found');
                                }
                                bob.checkLogin();
                            }
                        });          
                        // eslint-disable-next-line prefer-rest-params
                        return oldXHROpen.apply(this, <never>arguments);
                    }
                }
                return data;
            });
        } else {
            return Promise.reject();
        }
    }

    loginAction(data: LoginData) {
        const loginInput = <HTMLInputElement>document.getElementsByClassName('login__input')[0];
        const pwdInput = <HTMLInputElement>document.getElementsByClassName('login__input')[1];
        const buttonConnect = <HTMLButtonElement>document.getElementsByClassName('login__button')[0];
        if (buttonConnect && loginInput && pwdInput) {
            if (this.DEBUG) {
                console.log('[Bob-rpa] Child: login detected');
            }
            this.setNativeValue(loginInput, data.login);
            this.setNativeValue(pwdInput, data.pwd);
            if (this.DEBUG) {
                console.log('[Bob-rpa] Child: login filled');
            }
            setTimeout(() => {
                try {
                    buttonConnect.click();
                } catch (err) {
                    console.error('[Bob-rpa] Child: fail submit', buttonConnect);
                }
            }, this.speedClick);

        } else {
            console.error('[Bob-rpa] Child: fail to get, buttonConnect, loginInput or pwdInput', buttonConnect, loginInput, pwdInput);
        }
    }
}
export const toucanRpa = new ToucanRpa();