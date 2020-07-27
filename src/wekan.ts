import { BobRpa, LoginData } from './base';


class WekanRpa extends BobRpa {

    isLoginWrapperPresent(): boolean {
        console.error('==> bob-rpa no loginAction configuration');

        return false;
    }

    logoutAction() {
        console.error('==> bob-rpa no logoutAction configuration');
        localStorage.setItem('jupyterhub-hub-login', '');
        localStorage.setItem('jupyterhub-session-id', '');
        localStorage.setItem('jupyterhub-user-bobcashstory', '');
        window.location.href = "/logout";
    }

    loginAction(data: LoginData) {
        console.error('==> bob-rpa no loginAction configuration');
        if (data) {
            console.log('data', data);
            const loginInput = <HTMLInputElement>document.getElementById('username_input');
            const pwdInput = <HTMLInputElement>document.getElementById('password_input');
            const buttonConnect = document.getElementById('login_submit');
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
                }, 500);
        } else {
                console.error('==> bob-rpa fail to get, buttonConnect, loginInput or pwdInput', buttonConnect, loginInput, pwdInput);
            }
        }
    }
}
export const wekan = ():BobRpa => new WekanRpa();
