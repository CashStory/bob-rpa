import { BobRpa, LoginData } from './base';
require('./jupyter.css');


class JupyterRpa extends BobRpa {

    loginSelector(): string {
        return '#login-main';
    }

    logoutAction() {
        localStorage.setItem('jupyterhub-hub-login', '');
        localStorage.setItem('jupyterhub-session-id', '');
        localStorage.setItem('jupyterhub-user-bobcashstory', '');
        window.location.href = "/logout";
    }

    loginAction(data: LoginData): Promise<undefined> {
        const loginInput = <HTMLInputElement>document.getElementById('username_input');
        const pwdInput = <HTMLInputElement>document.getElementById('password_input');
        const buttonConnect = <HTMLButtonElement>document.getElementById('login_submit');
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
export const jupyterRpa = new JupyterRpa();