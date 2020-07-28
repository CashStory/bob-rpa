import { BobRpa, LoginData } from './base';
const css_jupyter = require('./jupyter.css');


class JupyterRpa extends BobRpa {

    isLoginWrapperPresent(): boolean {
        if (document.getElementById('login-main')) {
            return true;
        }
        return false;
    }

    logoutAction() {
        localStorage.setItem('jupyterhub-hub-login', '');
        localStorage.setItem('jupyterhub-session-id', '');
        localStorage.setItem('jupyterhub-user-bobcashstory', '');
        window.location.href = "/logout";
    }

    loginAction(data: LoginData) {
        const loginInput = <HTMLInputElement>document.getElementById('username_input');
        const pwdInput = <HTMLInputElement>document.getElementById('password_input');
        const buttonConnect = <HTMLButtonElement>document.getElementById('login_submit');
        if (buttonConnect && loginInput && pwdInput) {
            this.setNativeValue(loginInput, data.login);
            this.setNativeValue(pwdInput, data.pwd);
            console.log('==> bob-rpa login filled');
            setTimeout(() => {
                try {
                    buttonConnect.click();
                    console.log('==> bob-rpa login submit');
                } catch (err) {
                    console.error('==> bob-rpa login fail submit', buttonConnect);
                }
            }, this.speedClick);
        } else {
            console.error('==> bob-rpa fail to get, buttonConnect, loginInput or pwdInput', buttonConnect, loginInput, pwdInput);
        }
    }
}
export const jupyterRpa = new JupyterRpa(css_jupyter);