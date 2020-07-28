import { BobRpa, LoginData } from './base';


class WekanRpa extends BobRpa {

    isLoginWrapperPresent(): boolean {
        if (document.getElementsByClassName("auth-layout")
            && document.getElementsByClassName("auth-layout").length > 0) {
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
        const loginInput = <HTMLInputElement>document.getElementById('at-field-username_and_email');
        const pwdInput = <HTMLInputElement>document.getElementById('at-field-password');
        const buttonConnect = <HTMLButtonElement>document.getElementById('at-btn');
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
            }, this.speedClick);
    } else {
            console.error('==> bob-rpa fail to get, buttonConnect, loginInput or pwdInput', buttonConnect, loginInput, pwdInput);
        }
    }
}
export const wekanRpa = new WekanRpa();
