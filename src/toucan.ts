import { BobRpa, LoginData } from './base';
const css_toucan = require('./toucan.css');

class ToucanRpa extends BobRpa {
    isLoginWrapperPresent(): boolean {
        console.error('==> bob-rpa isLoginWrapperPresent');
        if (document.getElementsByClassName("login-wrapper")
            && document.getElementsByClassName("login-wrapper").length > 0) {
            return true;
        }
        return false;
    }

    logoutAction() {
        console.error('==> bob-rpa logoutAction');
        localStorage.setItem('token', '');
        localStorage.setItem('embed-token', '');
        localStorage.setItem('user', '');
        localStorage.setItem('userId', '');
        localStorage.setItem('currentUser', '');
        window.location.href = "/logout";
    }

    loginAction(data: LoginData) {
        console.error('==> bob-rpa loginAction');
        if (data) {
            console.log('data', data);
            const loginInput = <HTMLInputElement>document.getElementById('username_input');
            const pwdInput = <HTMLInputElement>document.getElementById('password_input');
            const buttonConnect = document.getElementById('login_submit');
            if (buttonConnect && loginInput && pwdInput) {
                console.log('==> bob-rpa login detected');
                this.setNativeValue(loginInput, data.login);
                this.setNativeValue(pwdInput, data.pwd);
                setTimeout(() => {
                    try {
                        buttonConnect.click();
                        console.log('==> bob-rpa login submit');
                    } catch (err) {
                        console.error('==> bob-rpa login fail submit', buttonConnect);
                    }
                }, 500);
            } else {
                console.error('==> bob-rpa fail to get, buttonConnect, loginInput or pwdInput', buttonConnect, loginInput, pwdInput);
            }
        }
    }
}
export const toucanRpa = new ToucanRpa(css_toucan);