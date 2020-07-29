import { BobRpa, LoginData } from './base';
require('./healthcheck.css');

class HealthcheckRpa extends BobRpa {

    isLoginWrapperPresent(): boolean {
        if (this.DEBUG) {
            console.log('[Bob-rpa] Child: isLoginWrapperPresent');
        }
        if (document.getElementById("login-form")) {
            return true;
        }
        return false;
    }

    logoutAction() {
        if (this.DEBUG) {
            console.log('[Bob-rpa] Child: logoutAction');
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
                    if (this.DEBUG) {
                        console.log('[Bob-rpa] Child: login submited');
                    }
                } catch (err) {
                    console.error('[Bob-rpa] Child: login fail submit', buttonConnect);
                }
            }, this.speedClick);
        } else {
            console.error('[Bob-rpa] Child: fail to get, buttonConnect, loginInput or pwdInput', buttonConnect, loginInput, pwdInput);
        }
    }
}
export const healthcheckRpa = new HealthcheckRpa();