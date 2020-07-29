import { BobRpa, LoginData } from './base';


class WekanRpa extends BobRpa {

    isLoginWrapperPresent(): boolean {
        if (this.DEBUG) {
            console.log('==> bob-rpa isLoginWrapperPresent');
        }
        if (document.getElementsByClassName("auth-layout")
            && document.getElementsByClassName("auth-layout").length > 0) {
            return true;
        }
        return false;
    }

    logoutAction() {
        if (this.DEBUG) {
            console.log('==> bob-rpa logoutAction');
        }
        localStorage.setItem('jupyterhub-hub-login', '');
        localStorage.setItem('jupyterhub-session-id', '');
        localStorage.setItem('jupyterhub-user-bobcashstory', '');
        window.location.href = "/logout";
    }

    loginAction(data: LoginData) {
        const loginInput = <HTMLInputElement>document.getElementById('at-field-username_and_email');
        const pwdInput = <HTMLInputElement>document.getElementById('at-field-password');
        const buttonConnect = <HTMLButtonElement>document.getElementById('at-btn');
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
                        console.log('==> bob-rpa login submit');
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
export const wekanRpa = new WekanRpa();
