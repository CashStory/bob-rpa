import { BobRpa, LoginData } from './base';
const css_healthcheck = require('./healthcheck.css');

class HealthcheckRpa extends BobRpa {

    isLoginWrapperPresent(): boolean {
        if (this.DEBUG) {
            console.log('==> bob-rpa isLoginWrapperPresent');
        }
        if (document.getElementById("login-form")) {
            return true;
        }
        return false;
    }

    logoutAction() {
        if (this.DEBUG) {
            console.log('==> bob-rpa logoutAction');
        }
        this.deleteCookie('sessionid');
        window.location.href = "/";
    }

    loginAction(data: LoginData) {
        const loginInput = this.getFormInputElem('email');
        const pwdInput = this.getFormInputElem('password');
        const buttonConnect = this.getSubmitButton();
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
                    if (this.DEBUG) {
                        console.log('==> bob-rpa login submited');
                    }
                } catch (err) {
                    console.error('==> bob-rpa login fail submit', buttonConnect);
                }
            }, this.speedClick);
        } else {
            console.error('==> bob-rpa fail to get, buttonConnect, loginInput or pwdInput', buttonConnect, loginInput, pwdInput);
        }
    }
}
export const healthcheckRpa = new HealthcheckRpa(css_healthcheck);