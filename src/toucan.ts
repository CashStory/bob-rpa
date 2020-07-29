import { BobRpa, LoginData } from './base';
const css_toucan = require('./toucan.css');

class ToucanRpa extends BobRpa {
    isLoginWrapperPresent(): boolean {
        if (this.DEBUG) {
            console.log('==> bob-rpa isLoginWrapperPresent');
        }
        if (document.getElementsByClassName("login-wrapper")
            && document.getElementsByClassName("login-wrapper").length > 0) {
            return true;
        }
        return false;
    }

    logoutAction() {
        if (this.DEBUG) {
            console.log('==> bob-rpa logoutAction');
        }
        localStorage.setItem('token', '');
        localStorage.setItem('embed-token', '');
        localStorage.setItem('user', '');
        localStorage.setItem('userId', '');
        localStorage.setItem('currentUser', '');
        window.location.href = "/logout";
    }

    loginAction(data: LoginData) {
        const loginInput = <HTMLInputElement>document.getElementsByClassName('login__input')[0];
        const pwdInput = <HTMLInputElement>document.getElementsByClassName('login__input')[1];
        const buttonConnect = <HTMLButtonElement>document.getElementsByClassName('login__button')[0];
        if (buttonConnect && loginInput && pwdInput) {
            if (this.DEBUG) {
                console.log('==> bob-rpa login detected');
            }
            this.setNativeValue(loginInput, data.login);
            this.setNativeValue(pwdInput, data.pwd);
            if (this.DEBUG) {
                console.log('==> bob-rpa login filled');
            }
            setTimeout(() => {
                try {
                    buttonConnect.click();
                } catch (err) {
                    console.error('==> bob-rpa fail submit', buttonConnect);
                }
            }, this.speedClick);

        } else {
            console.error('==> bob-rpa fail to get, buttonConnect, loginInput or pwdInput', buttonConnect, loginInput, pwdInput);
        }
    }
}
export const toucanRpa = new ToucanRpa(css_toucan);