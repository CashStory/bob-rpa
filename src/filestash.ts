import { BobRpa, LoginData } from './base';
const css_filestash = require('./filestash.css');


class FilestashRpa extends BobRpa {

    isLoginWrapperPresent(): boolean {
        if (this.DEBUG) {
            console.log('[Bob-rpa] Child: isLoginWrapperPresent');
        }
        if (document.getElementsByClassName("component_page_connect")
            && document.getElementsByClassName("component_page_connect").length > 0) {
            return true;
        }
        return false;
    }

    logoutAction() {
        if (this.DEBUG) {
            console.log('[Bob-rpa] Child: logoutAction');
        }
        window.location.href = "/logout";
    }

    changeTab(name: string) {
        return new Promise((resolve, reject) => {
            const buttonTab = this.findButton(name);
            if (buttonTab) {
                buttonTab.click();
                setTimeout(() => {
                    resolve();
                }, this.speedClick);
            } else {
                reject('tab not found');
            }
        });
    }

    checkAdvancedBox() {
        return new Promise((resolve, reject) => {
            const input = <HTMLInputElement>document.querySelectorAll('input[type=checkbox]')[0];
            if (input) {
                const event = new Event('input', { bubbles: true });
                input.click();
                input.dispatchEvent(event);
                setTimeout(() => {
                    resolve();
                }, 50);
            } else {
                reject('button not found');
            }
        });
    }

    ftpLogin(tab: string, host: string, port: string, login: string, pwd: string) {
        let chTab = this.changeTab(tab);
        const checkBox = <HTMLInputElement>document.querySelectorAll('input[type=checkbox]')[0];
        if (port && checkBox && !checkBox.checked) {
            chTab = chTab.then(() => this.checkAdvancedBox);
        }
        chTab.then(() => {
            const hostInput = <HTMLInputElement>document.getElementsByName('hostname')[0];
            const loginInput = <HTMLInputElement>document.getElementsByName('username')[0];
            const pwdInput = <HTMLInputElement>document.getElementsByName('password')[0];
            let portInput;
            if (port) {
                portInput = <HTMLInputElement>document.getElementsByName('port')[0];
            }
            const buttonConnect = this.findButton('CONNECT');
            if (buttonConnect && loginInput && pwdInput && hostInput) {
                if (this.DEBUG) {
                    console.log('[Bob-rpa] Child: login detected');
                }
                this.setNativeValue(hostInput, host);
                this.setNativeValue(loginInput, login);
                if (port && portInput) {
                    this.setNativeValue(portInput, port);
                }
                this.setNativeValue(pwdInput, pwd);
                if (this.DEBUG) {
                    console.log('[Bob-rpa] Child: ftp login filled');
                }
                setTimeout(() => {
                    try {
                        buttonConnect.click();
                    } catch (err) {
                        console.error('[Bob-rpa] Child: fail submit', buttonConnect);
                    }
                }, this.speedClick);
        } else {
                console.error('[Bob-rpa] Child: fail to get buttonConnect, loginInput, pwdInput, hostInput or portInput', buttonConnect, loginInput, pwdInput, hostInput, portInput);
            }
        }).catch((err) => {
            console.error(err);
        });
    }

    gitLogin(tab: string, repo: string, login: string, pwd: string) {
        this.changeTab(tab)
            .then(() => {
                const repoInput = <HTMLInputElement>document.getElementsByName('repo')[0];
                const loginInput = <HTMLInputElement>document.getElementsByName('username')[0];
                const pwdInput = <HTMLInputElement>document.getElementsByName('password')[0];
                const buttonConnect = <HTMLButtonElement>this.findButton('CONNECT');
                if (buttonConnect && loginInput && pwdInput && repoInput) {
                    if (this.DEBUG) {
                        console.log('[Bob-rpa] Child: login detected');
                    }
                    this.setNativeValue(repoInput, repo);
                    this.setNativeValue(loginInput, login);
                    this.setNativeValue(pwdInput, pwd);
                    if (this.DEBUG) {
                        console.log('[Bob-rpa] Child: git login filled');
                    }
                    setTimeout(() => {
                        try {
                            buttonConnect.click();
                        } catch (err) {
                            console.error('[Bob-rpa] Child: fail submit', buttonConnect);
                        }
                    }, this.speedClick);
            } else {
                    console.error('[Bob-rpa] Child: fail to get buttonConnect, loginInput, pwdInput, repoInput', buttonConnect, loginInput, pwdInput, repoInput);
                }
            }).catch((err) => {
                console.error(err);
            });
    }


    loginAction(data: LoginData) {
        if (this.DEBUG) {
            console.log('[Bob-rpa] Child: loginAction');
        }
        if (data.tab && data.host && data.port) {
            const selectedTab = data.tab.toUpperCase();
            if (selectedTab === 'FTPS' || selectedTab === 'FTP' || selectedTab === 'SFTP') {
                this.ftpLogin(selectedTab, data.host, data.port, data.login, data.pwd);
            } else if (selectedTab === 'GIT') {
                this.gitLogin(selectedTab, data.host, data.login, data.pwd);
            }
        } else {
            console.error('missing tab, port or host');
        }
    }
}

export const filestashRpa = new FilestashRpa(css_filestash);