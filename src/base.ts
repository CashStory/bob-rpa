import { connectToParent } from 'penpal/lib';
import { CallSender, Connection } from 'penpal/lib/types';
import fetchIntercept from 'fetch-intercept';
import waitElement from '@1natsu/wait-element';

require('./base.css');
const html_base = require('./base.html');
const pkg = require('../package.json');

export interface LoginData {
    host?: string;
    port?: string;
    tab?: string;
    login: string;
    pwd: string;
}

interface ParentFrame {
    urlChangeEvent: (url: string) => Promise<void>;
    getZoomPercentage: () => Promise<string>;
    needLogin: () => Promise<LoginData>;
    getName: () => Promise<string>;
}
declare global {
    interface Window { rpaSpeed: number; rpaDebug: boolean; }
}
export const docReady = new Promise((resolve) => document.addEventListener('DOMContentLoaded', resolve));

export const waitElem = waitElement;
export class BobRpa {
    version = pkg.version;
    speedClick = 100;
    speedLogin = 1500;
    iFrameDetected = false;
    DEBUG = false;
    cssElem: HTMLStyleElement | null = null;
    htmlBaseElem: HTMLDivElement | null = null;
    htmlElem: HTMLDivElement | null = null;
    bodyObserver: MutationObserver | null = null;
    parent: ParentFrame | null = null;
    oldHref: string | null  = null;
    htmlPlus = '';
    htmlInject: string[] = [];
    cssInject: string[] = [];
    htmlBase = html_base;
    connexion: Connection<CallSender> | null = null;

    watchFunctions: Array<() => Promise<void>> = [];
    watchFunctionsWork: boolean;
    mutationConfig = {
        characterData: true,
        attributes: true,
        childList: true,
        subtree: true
    };
    fetchUnregister: () => void;

    constructor(html_plus = '') {
        this.htmlPlus = html_plus;
        this.fetchUnregister = () => { return null;};
        this.watchFunctionsWork = false;
        docReady.then(() => this.initAll());
    }

    initAll(): void {
        this.DEBUG = window.rpaDebug ? window.rpaDebug : false;
        if (this.DEBUG) {
            console.log('[Bob-rpa] Child: init');
        }
        this.speedClick = window.rpaSpeed ? window.rpaSpeed : this.speedClick;
        this.speedLogin = window.rpaSpeed ? window.rpaSpeed * 10 : this.speedLogin;
        this.iFrameDetected = !(window === window.parent);
        this.cssElem = document.createElement('style');
        this.htmlElem = document.createElement("div");
        this.htmlBaseElem = document.createElement("div");

        this.watchFunctions.push(() => this.addAnalytics());
        this.watchFunctions.push(() => this.setCSCSS());
        this.watchFunctions.push(() => this.setCSHTML());
        if (this.cssElem) {
            document.head.appendChild(this.cssElem);
        }
        if (this.htmlBaseElem) {
            document.body.insertBefore(this.htmlBaseElem, document.body.firstChild);
            this.setCSBaseHTML();
        }
        if (this.htmlElem) {
            document.body.insertBefore(this.htmlElem, this.htmlBaseElem);
        }
        this.bodyObserver = new MutationObserver(() => this.watchMutation);
        this.bodyObserver.observe(document, this.mutationConfig);
        if (this.iFrameDetected) {
            this.initPenpal();
        } else {
            window.addEventListener("load", () => {
                if (this.DEBUG) {
                    console.log('[Bob-rpa] Child: NO iframe detected');
                }
                this.switchCSLoader('off');
            });
        }
    }

    initPenpal(): void  {
        this.oldHref = document.location.href;
        if (this.DEBUG) {
            console.log('[Bob-rpa] Child: iframe detected');
        }
        // eslint-disable-next-line @typescript-eslint/no-this-alias
        const bob = this;
        this.connexion = connectToParent({
            debug: this.DEBUG,
            timeout: 180000,
            methods: {
                hideElements(elements: string[]) {
                    elements.forEach((element) => {
                        const className = element[0] === '.' ? element : `.${element}`;
                        this.removeCSCSS(`${className} {display: initial;}`);
                        this.injectCSCSS(`${className} {display: none;}`);
                    });
                    if (bob.DEBUG) {
                        console.log('[Bob-rpa] Child: hideElements!');
                    }
                },
                showElements(elements: string[]) {
                    elements.forEach((element) => {
                        const className = element[0] === '.' ? element : `.${element}`;
                        this.removeCSCSS(`${className} {display: none;}`);
                        this.injectCSCSS(`${className} {display: initial;}`);
                    });
                    if (bob.DEBUG) {
                        console.log('[Bob-rpa] Child: showElements!');
                    }
                },
                switchCSLoader(state: 'on' | 'off') {
                    bob.switchCSLoader(state);
                },
                injectCSHTML(htmlstring: string) {
                    bob.htmlInject.push(htmlstring);
                    bob.setCSHTML();
                }, 
                removeCSHTML(htmlstring: string) {
                    const index = bob.htmlInject.findIndex((html: string) => html === htmlstring);
                    if (index > -1) {
                        if (bob.DEBUG) {
                            console.log('[Bob-rpa] Child: removeCSHTML found !', index);
                        }
                        bob.htmlInject.splice(index, 1);
                        bob.setCSHTML();
                    }
                }, 
                injectCSCSS(cssstring: string) {
                    bob.cssInject.push(cssstring);
                    bob.setCSCSS();
                }, 
                removeCSCSS(cssstring: string) {
                    const index = bob.cssInject.findIndex((css: string) => css === cssstring);
                    if (index > -1) {
                        if (bob.DEBUG) {
                            console.log('[Bob-rpa] Child: removeCSCSS found !', index);
                        }
                        bob.cssInject.splice(index, 1);
                        bob.setCSCSS();
                    }
                }, 
            }
        });
    
        this.connexion.promise.then((parent: ParentFrame) => {
            this.parent = parent;
            if (parent) {
                if (this.DEBUG) {
                    console.log('[Bob-rpa] Child: connected !');
                }
                this.watchFunctions.push(() => this.applyZoom());
                this.initAutoLogin().then(() => {
                    setTimeout(() => {
                        this.watchMutation();
                    }, this.speedClick);
                }).catch(() => {
                    if (this.DEBUG) {
                        console.log('[Bob-rpa] Child: initAutoLogin NO LOGIN');
                    }
                    this.switchCSLoader('off');
                });
            }
        }).catch(() => {
            if (this.DEBUG) {
                console.log('[Bob-rpa] Child: iframe timeout');
            }
            this.switchCSLoader('off');
        });
    }
    async watchMutation(): Promise<void> {
        if (this.DEBUG) {
            console.log('[Bob-rpa] Child: MutationObserver');
        }
        if (!this.watchFunctionsWork) {
            this.watchFunctionsWork = true;
            for (const fn of this.watchFunctions) {
                if (this.DEBUG) {
                    console.log('[Bob-rpa] Child: watchFunction', fn);
                }
                await fn();
                if (this.DEBUG) {
                    console.log('[Bob-rpa] Child: watchFunction Done', fn);
                }
            }
            this.watchFunctionsWork = false;
        }
    }

    switchCSLoader(kind: 'on' | 'off' = 'off'): void  {
        if (this.DEBUG) {
            console.log('[Bob-rpa] Child: switchCSLoader', kind);
        }
        const csl = <HTMLElement>document.querySelector("#cs_loader_wrap");
        if (csl && kind == 'off') {
            csl.style.display = "none";
        } else if (csl && kind == 'on') {
            csl.style.display = "flex";
        }
    }

    async setCSCSS(): Promise<void>  {
        if (this.DEBUG) {
            console.log('[Bob-rpa] Child: setCSCSS');
        }
        if (this.cssElem) {
            const newInner = `/* Cashstory Inject*/\n${this.cssInject.join('\n')}\n\n/* Cashstory ${this.version} */`;
            if (this.DEBUG) {
                console.log('[Bob-rpa] Child: setCSCSS', newInner);
            }
            if (newInner !== this.cssElem.innerHTML) {
                this.cssElem.innerHTML = newInner
            }
        }
    }
    async setCSBaseHTML(): Promise<void>  {
        if (this.DEBUG) {
            console.log('[Bob-rpa] Child: setCSBaseHTML');
        }
        if (this.htmlBaseElem) {
            const newInner = `<!-- Cashstory Base -->\n${this.htmlBase}\n<!-- Cashstory ${this.version} -->`;
            if (this.DEBUG) {
                console.log('[Bob-rpa] Child: setCSBaseHTML', newInner);
            }
            if (newInner !== this.htmlBaseElem.innerHTML) {
                this.htmlBaseElem.innerHTML = newInner
            }
        }
    }

    async setCSHTML(): Promise<void> {
        if (this.DEBUG) {
            console.log('[Bob-rpa] Child: setCSHTML');
        }
        if (this.htmlElem) {
            const newInner = `<!-- Cashstory Plus -->\n${this.htmlPlus}\n<!-- Cashstory Inject -->\n${this.htmlInject.join('\n')}\n\n<!-- Cashstory ${this.version} -->`;
            if (this.DEBUG) {
                console.log('[Bob-rpa] Child: setCSHTML', newInner);
            }
            if (newInner !== this.htmlElem.innerHTML) {
                this.htmlElem.innerHTML = newInner
            }
        }
    }

    async checkLogin(wait = false): Promise<void> {
        const loginPresent = await this.isLoginWrapperPresent(wait);
        if (!loginPresent) {
            if (this.DEBUG) {
                console.log('[Bob-rpa] Child: mutation but not login wraper present', document.location.href);
            }
            this.switchCSLoader('off');
        } else {
            if (this.DEBUG) {
                console.log('[Bob-rpa] Child: mutation and login wraper present', document.location.href);
            }
            this.switchCSLoader('on');
            this.askLogin();
        }
    }

    async addAnalytics(): Promise<void> {
        if (this.DEBUG) {
            console.log('[Bob-rpa] Child: addAnalytics !');
        }
        if (this.parent && this.oldHref != document.location.href) {
            this.oldHref = document.location.href;
            if (this.DEBUG) {
                console.log('[Bob-rpa] Child: url change !!');
            }
            return await this.parent.urlChangeEvent(this.oldHref);
        }
        return Promise.resolve();
    }

    async applyZoom(): Promise<void> {
        if (this.DEBUG) {
            console.log('[Bob-rpa] Child: applyZoom !');
        }
        if (this.parent) {
            const zoom = await this.parent.getZoomPercentage();
            const newZoom = `${zoom}%`;
            if (this.DEBUG) {
                console.log('[Bob-rpa] Child: applyZoom newZoom', newZoom, 'oldZoom', document.body.style.zoom);
            }
            if ('zoom' in document.body.style && newZoom !== document.body.style.zoom) {
                document.body.style.zoom = newZoom;
            }
        }
    }

    getForm(): HTMLElement | null {
        const formElem: HTMLElement | null = document.querySelector('form');
        return formElem || document.body;
    }

    getFormElems(tag: string): HTMLElement[] {
        const formElem: HTMLElement | null = this.getForm();
        if (formElem && formElem.querySelectorAll(tag)) {
            return Array.prototype.slice.call(formElem.querySelectorAll(tag));
        }
        console.error('[Bob-rpa] Child: getFormElems not found', tag);
        return [];
    }

    getSubmitButton(): HTMLButtonElement | null {
        const formElem: HTMLElement | null = this.getForm();
        if (formElem) {
            return formElem.querySelector('button');
        }
        return null;
    }

    getFormInputElem(type: string): HTMLInputElement | null {
        let elemSelected: HTMLInputElement | null = null;
        const elements: HTMLInputElement[] = <HTMLInputElement[]>this.getFormElems('input');
        elements.some((elem) => {
            if (elem.type === type) {
                elemSelected = elem;
                return true;
            }
        });
        return elemSelected;
    }

    findButton(searchText: string): HTMLButtonElement | null {
        const aTags: HTMLButtonElement[] = Array.prototype.slice.call(document.querySelectorAll('button'));
        let found: HTMLButtonElement | null = null;
        aTags.some((element) => {
            if (element.textContent == searchText) {
                found = element;
                return true;
            }
        });
        return found;
    }

    setNativeValue(element: HTMLInputElement, value: string): void {
        const valueSetter = Object.getOwnPropertyDescriptor(element, 'value')?.set;
        const prototype = Object.getPrototypeOf(element);
        const prototypeValueSetter = Object.getOwnPropertyDescriptor(prototype, 'value')?.set;
        const event = new Event('input', { bubbles: true });
        if (valueSetter && prototypeValueSetter && valueSetter !== prototypeValueSetter) {
            prototypeValueSetter.call(element, value);
        } else if (valueSetter) {
            valueSetter.call(element, value);
        } else {
            element.value = value;
        }
        element.dispatchEvent(event);
    }

    hiddePass(data: LoginData): LoginData {
        const newData = Object.assign({}, data);
        newData.pwd = '****';
        return newData;
    }

    deleteCookie(name: string): void {
        document.cookie = name + '=; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    }

    // setCookie(name: string): void {
    //     document.cookie = name + '=; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    // }

    async cleanLogin(): Promise<void> {
        if (this.parent) {
            const name: string = await this.parent.getName();
            if (this.DEBUG) {
                console.log('[Bob-rpa] Child: current name', name);
            }
            const currentName: string| null = localStorage.getItem('cs_child_name');
            if (!currentName || name !== currentName) {
                this.logoutAction();
            }
            localStorage.setItem('cs_child_name', name);
        }
    }

    async initAutoLogin(): Promise<LoginData | null>  {
        if (this.parent) {
            const login: LoginData = await this.parent.needLogin();
            if (!login) {
                return Promise.reject();
            } else {
                if (this.DEBUG) {
                    console.log('[Bob-rpa] Child: needLogin confirmed');
                }
                await this.cleanLogin();
                this.loginInitAction();
                this.watchFunctions.push(() => this.checkLogin(true));
            }
            return login;
        } else {
            return Promise.reject();
        }
    }

    async askLogin(): Promise<void> {
        if (this.parent) {
            const login: LoginData = await this.parent.needLogin();
            if (!login) {
                return Promise.reject();
            }
            if (this.DEBUG) {
                console.log('[Bob-rpa] Child: askLogin', this.hiddePass(login));
            }  
            try {
                await this.loginAction(login);
                setTimeout(async () => {
                    const loginPresent = await this.isLoginWrapperPresent(false);
                    if (!loginPresent) {
                        this.switchCSLoader('off');
                        if (this.htmlElem && this.htmlElem.getAttribute("class")) {
                            this.htmlElem.removeAttribute("class");
                        }
                    }
                    if (this.DEBUG) {
                        console.log('[Bob-rpa] Child: askLogin Done \n\n\n\n');
                    }
                }, this.speedLogin);
            } catch (err) {
                if (this.DEBUG) {
                    console.error('[Bob-rpa] Child: askLogin error', err, '\n\n\n\n');
                }
            }
        }
    }

    async isLoginWrapperPresent(wait: boolean): Promise<boolean> {
        if (this.DEBUG) {
            console.log('[Bob-rpa] Child: isLoginWrapperPresent');
        }
        if (wait) {
            try {
                const elem = await waitElem(this.loginSelector(), { timeout: 2000 });
                return !!elem;
            } catch (err) {
                console.log('[Bob-rpa] Child: isLoginWrapperPresent waitElem not found', this.loginSelector());
                return false;
            }
        } else {
            if (document.querySelector(this.loginSelector())) {
                return true;
            }
        }
        return false;
    }

    loginSelector(): string {
        return '';
    }

    logoutAction(): void  {
        console.error('[Bob-rpa] Child: no logoutAction configuration');
    }

    loginInitAction(): void  {
        if (this.DEBUG) {
            console.log('[Bob-rpa] Child: add fetchIntercept');
        }
        // eslint-disable-next-line @typescript-eslint/no-this-alias
        const bob = this;
        this.fetchUnregister = fetchIntercept.register({
            request: function (url, config) {
                return [url, config];
            },
            requestError: function (error) {
                return Promise.reject(error);
            },
            response: function (response) {
                if (response.status == 401) {
                    if (bob.DEBUG) {
                        console.log('[Bob-rpa] Child: fetchIntercept 401 found');
                    }
                    if (bob.htmlElem && !bob.htmlElem.getAttribute("class")) {
                        if (bob.DEBUG) {
                            console.log('[Bob-rpa] Child: missing_login checkLogin');
                        }
                        bob.htmlElem.setAttribute("class", "missing_login");
                        bob.checkLogin(true);
                    }
                }
                return response;
            },
            responseError: function (error) {
                return Promise.reject(error);
            }
        });
    }

    validateLogin(button: HTMLButtonElement): Promise<undefined> {
        return new Promise((resolve, reject) => {
            return setTimeout(() => {
                try {
                    button.click();
                    if (this.DEBUG) {
                        console.log('[Bob-rpa] Child: login submit');
                    }
                    return setTimeout(() => {
                            return resolve();
                    }, this.speedClick);
                } catch (err) {
                    console.error('[Bob-rpa] Child: login fail submit', button);
                    return reject();
                }
            }, this.speedClick);
        });
    }

    loginAction(data: LoginData): Promise<undefined>  {
        console.error('[Bob-rpa] Child: no loginAction configuration');
        if (data && this.DEBUG) {
            console.log('[Bob-rpa] Child: loginAction data', this.hiddePass(data));
        }
        return Promise.reject();
    }
}
