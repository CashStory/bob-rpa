import { BobRpa, LoginData } from './base';
require('./wekan.css');


class WekanRpa extends BobRpa {

    loginSelector(): string {
        return '.auth-layout';
    }

    logoutAction() {
        localStorage.setItem('jupyterhub-hub-login', '');
        localStorage.setItem('jupyterhub-session-id', '');
        localStorage.setItem('jupyterhub-user-bobcashstory', '');
        window.location.href = "/logout";
    }

    loginAction(data: LoginData): Promise<undefined> {
        const loginInput = <HTMLInputElement>document.getElementById('at-field-username_and_email');
        const pwdInput = <HTMLInputElement>document.getElementById('at-field-password');
        const buttonConnect = <HTMLButtonElement>document.getElementById('at-btn');
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
export const wekanRpa = new WekanRpa();
