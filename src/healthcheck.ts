import { BobRpa, LoginData } from './base';
const css_healthcheck = require('./healthcheck.css');

class HealthcheckRpa extends BobRpa {

    isLoginWrapperPresent(): boolean {
        if (document.getElementsByClassName("page-login")
            && document.getElementsByClassName("page-login").length > 0) {
            return true;
        }
        return false;
    }

    logoutAction() {
        this.deleteCookie('sessionid');
        window.location.href = "/";
    }

    loginAction(data: LoginData) {
        console.error('==> bob-rpa no loginAction configuration');
        const loginInput = <HTMLInputElement>document.getElementById('username_input');
        const pwdInput = <HTMLInputElement>document.getElementById('password_input');
        const buttonConnect = document.getElementById('login_submit');
        if (buttonConnect && loginInput && pwdInput) {
            this.setNativeValue(loginInput, data.login);
            this.setNativeValue(pwdInput, data.pwd);
            console.log('==> bob-rpa login filled');
            setTimeout(() => {
                try {
                    buttonConnect.click();
                    console.log('==> bob-rpa login submited');
                } catch (err) {
                    console.error('==> bob-rpa login fail submit', buttonConnect);
                }
            }, 500);
        } else {
            console.error('==> bob-rpa fail to get, buttonConnect, loginInput or pwdInput', buttonConnect, loginInput, pwdInput);
        }
    }
}
export const healthcheckRpa = new HealthcheckRpa(css_healthcheck);