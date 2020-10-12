import { BobRpa, LoginData } from './base';
require('./healthcheck.css');

class HealthcheckRpa extends BobRpa {

    loginSelector(): string {
        return '#login-form';
    }

    logoutAction() {
        this.deleteCookie('sessionid');
        window.location.href = "/";
    }

    getForm(): HTMLElement | null {
        const formElem: HTMLElement | null = document.getElementById('login-form');
        return formElem || document.body;
    }

    loginAction(data: LoginData): Promise<undefined> {
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
            return this.validateLogin(buttonConnect);
        }
        console.error('[Bob-rpa] Child: fail to get, buttonConnect, loginInput or pwdInput', buttonConnect, loginInput, pwdInput);
        return Promise.reject();
    }
}
export const healthcheckRpa = new HealthcheckRpa();