import { BobRpa, LoginData, waitElem } from './base';
require('./filestash.css');


class FilestashRpa extends BobRpa {

    loginSelector(): string {
        return '.component_page_connect';
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

    ftpLogin(tab: string, host: string, port: string, login: string, pwd: string): Promise<undefined> {
        let chTab = this.changeTab(tab);
        const checkBox = <HTMLInputElement>document.querySelectorAll('input[type=checkbox]')[0];
        if (port && checkBox && !checkBox.checked) {
            chTab = chTab.then(() => this.checkAdvancedBox);
        }
        return chTab.then(() => {
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
            return this.validateLogin(buttonConnect);
            } 
            console.error('[Bob-rpa] Child: fail to get buttonConnect, loginInput, pwdInput, hostInput or portInput', buttonConnect, loginInput, pwdInput, hostInput, portInput);
            return Promise.reject();
        });
    }

    gitLogin(tab: string, repo: string, login: string, pwd: string): Promise<undefined> {
        return this.changeTab(tab)
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
                    return this.validateLogin(buttonConnect);
                } 
                console.error('[Bob-rpa] Child: fail to get buttonConnect, loginInput, pwdInput, repoInput', buttonConnect, loginInput, pwdInput, repoInput);
                return Promise.reject();
            });
    }


    loginAction(data: LoginData): Promise<undefined> {
        if (this.DEBUG) {
            console.log('[Bob-rpa] Child: loginAction');
        }
        if (data.tab && data.host && data.port) {
            const selectedTab = data.tab.toUpperCase();
            if (selectedTab === 'FTPS' || selectedTab === 'FTP' || selectedTab === 'SFTP') {
                return this.ftpLogin(selectedTab, data.host, data.port, data.login, data.pwd);
            } else if (selectedTab === 'GIT') {
                return this.gitLogin(selectedTab, data.host, data.login, data.pwd);
            }
        } 
        console.error('[Bob-rpa] Child: missing tab, port or host');
        return Promise.reject();
    }
}

export const filestashRpa = new FilestashRpa();