import { BobRpa, LoginData } from './base';
require('./toucan.css');

class ToucanRpa extends BobRpa {

    loginSelector(): string {
        return '.login-wrapper';
    }

    logoutAction() {
        localStorage.setItem('token', '');
        localStorage.setItem('embed-token', '');
        localStorage.setItem('user', '');
        localStorage.setItem('userId', '');
        localStorage.setItem('currentUser', '');
        window.location.href = "/";
    }

    loginAction(data: LoginData): Promise<undefined> {
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
            return this.validateLogin(buttonConnect);
        }
        console.error('[Bob-rpa] Child: fail to get, buttonConnect, loginInput or pwdInput', buttonConnect, loginInput, pwdInput);
        return Promise.reject();
    }
}
export const toucanRpa = new ToucanRpa();