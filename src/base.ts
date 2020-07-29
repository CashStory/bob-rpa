import { connectToParent } from 'penpal/lib';
import { CallSender, Connection } from 'penpal/lib/types';
const html_base = require('./base.html');
const css_base = require('./base.css');

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

export class BobRpa {
    version = '1.0.0';
    speedClick = 100;
    speedLogin = 1500;
    iFrameDetected = false;
    DEBUG = false;
    loginFormClass = 'login-form';
    csLoader: HTMLElement | null = null;
    cssElem: HTMLStyleElement | null = null;
    htmlElem: HTMLDivElement | null = null;
    bodyList: HTMLBodyElement | null = null;
    bodyObserver: MutationObserver | null = null;
    parent: ParentFrame | null = null;
    loginRetry: ReturnType<typeof setTimeout> | null = null;
    oldHref: string | null  = null;
    cssPlus = '';
    htmlPlus = '';
    htmlInject: string[] = [];
    cssInject: string[] = [];
    displayElems: {name: string, display: string}[] = [];
    cssBase = css_base;
    htmlBase = html_base;
    connexion: Connection<CallSender> | null = null;

    watchFunctions: Array<() => void> = [];
    mutationConfig = {
        childList: true,
        subtree: true
    };

    constructor(css_plus = '', html_plus = '') {
        this.cssPlus = css_plus;
        this.htmlPlus = html_plus;
        docReady.then(() => this.initAll());
    }

    initAll(): void {
        this.DEBUG = window.rpaDebug ? window.rpaDebug : false;
        if (this.DEBUG) {
            console.log('[Bob-rpa]  Child: init');
        }
        this.speedClick = window.rpaSpeed ? window.rpaSpeed : this.speedClick;
        this.speedLogin = window.rpaSpeed ? window.rpaSpeed * 10 : this.speedLogin;
        this.iFrameDetected = !(window === window.parent);
        this.cssElem = document.createElement('style');
        this.htmlElem = document.createElement("div");
        this.csLoader = document.getElementById("cs_loader_wrap");

        this.watchFunctions.push(() => this.addAnalytics());
        this.watchFunctions.push(() => this.setCSCSS());
        this.watchFunctions.push(() => this.setCSHTML());
        // window.addEventListener("load", () => { 
            if (this.cssElem) {
                document.head.appendChild(this.cssElem);
            }
            if (this.htmlElem) {
                document.body.appendChild(this.htmlElem);
            }
            this.bodyList = document.querySelector("body");
            if (this.bodyList) {
                this.bodyObserver = new MutationObserver(() => {
                    this.watchFunctions.forEach((element) => {
                        element();
                    });
                });
                this.bodyObserver.observe(this.bodyList, this.mutationConfig);
            }
            if (this.iFrameDetected) {
                this.initPenpal();
            } else {
                this.switchCSLoader('off');
            }
        // });

    }

    initPenpal(): void  {
        this.oldHref = document.location.href;
        if (this.DEBUG) {
            console.log('[Bob-rpa]  Child: iframe detected');
        }
        // eslint-disable-next-line @typescript-eslint/no-this-alias
        const bob = this;
        this.connexion = connectToParent({
            debug: true,
            timeout: 180000,
            methods: {
                hideElements(elements: string[]) {
                    elements.forEach(element => {
                        const index = bob.displayElems.findIndex(el => el.name === element);
                        if (index > -1) {
                            bob.displayElems[index] = {name: element, display: 'none'};
                        } else {
                            bob.displayElems.push({name: element, display: 'none'});
                        }
                    });
                    bob.setElementsDisplay();
                },
                showElements(elements: string[]) {
                    elements.forEach(element => {
                        const index = bob.displayElems.findIndex(el => el.name === element);
                        if (index > -1) {
                            bob.displayElems[index] = {name: element, display: ''};
                        } else {
                            bob.displayElems.push({name: element, display: ''});
                        }
                    });
                    bob.setElementsDisplay();
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
                        bob.cssInject.splice(index, 1);
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
                    console.log('[Bob-rpa]  Child: connected !');
                }
                this.watchFunctions.push(() => this.applyZoom());
                this.initAutoLogin();
            }
        }).catch(() => {
            if (this.DEBUG) {
                console.log('[Bob-rpa]  Child: iframe timeout');
            }
            this.switchCSLoader('off');
        });
    }

    switchCSLoader(kind: 'on' | 'off' = 'off'): void  {
        const csl = document.getElementById("cs_loader_wrap");
        if (csl && kind == 'off' && csl.style.display === "block") {
            csl.style.display = "none";
        } else if (csl && kind == 'on' && csl.style.display === "none") {
            csl.style.display = "block";
        }
    }

    setCSCSS(): void  {
        if (this.cssElem) {
            const newInner = `${this.cssBase}\n\n${this.cssPlus}\n\n${this.cssInject.join('\n')}\n\n/* Cashstory ${this.version} */`;
            if (newInner !== this.cssElem.innerHTML) {
                this.cssElem.innerHTML = newInner
            }
        }
    }

    setCSHTML(): void {
        if (this.htmlElem) {
            const newInner = `${this.htmlBase}\n\n${this.htmlPlus}\n\n${this.htmlInject.join('\n')}\n\n/* Cashstory ${this.version} */`;
            if (newInner !== this.htmlElem.innerHTML) {
                this.htmlElem.innerHTML = newInner
            }
        }
    }

    checkLogin(): void {
        if (!this.loginRetry && this.isLoginWrapperPresent()) {
            this.switchCSLoader('on');
            this.needLogin();
            this.loginRetry = setTimeout(() => this.checkLogin(), this.speedLogin);
        } else if (this.loginRetry) {
            if (this.DEBUG) {
                console.log('[Bob-rpa]  Child: mutation but not login wraper present', document.location.href);
            }
            clearTimeout(this.loginRetry);
            this.loginRetry = null;
            this.switchCSLoader('off');
        }
    }

    addAnalytics(): void {
        if (this.DEBUG) {
            console.log('[Bob-rpa]  Child: addAnalytics !');
        }
        if (this.parent && this.oldHref != document.location.href) {
            this.oldHref = document.location.href;
            if (this.DEBUG) {
                console.log('[Bob-rpa]  Child: url change !!');
            }
            this.parent.urlChangeEvent(this.oldHref);
        }
    }

    applyZoom(): void {
        if (this.DEBUG) {
            console.log('[Bob-rpa]  Child: applyZoom !');
        }
        if (this.parent) {
            this.parent.getZoomPercentage().then((zoom) => {
                const newZoom = `${zoom}%`;
                if (this.DEBUG) {
                    console.log('newZoom', newZoom);
                    console.log('oldZoom', document.body.style.zoom);
                }
                if ('zoom' in document.body.style && newZoom !== document.body.style.zoom) {
                    document.body.style.zoom = newZoom;
                }
            });
        }
    }

    setElementsDisplay(): void {
        this.displayElems.forEach((element) => {
            const elem = <HTMLElement>document.getElementsByClassName(element.name)[0];
            if (elem) {
                elem.style.display = element.display;
            }
        });
    }

    getFormElems(tag: string): HTMLElement[] {
        const formElem: HTMLElement | null = document.getElementById(this.loginFormClass);
        if (formElem && formElem.getElementsByTagName(tag)) {
            return Array.prototype.slice.call(formElem.getElementsByTagName(tag));
        }
        return [];
    }

    getSubmitButton(): HTMLElement | null {
        const elements = this.getFormElems('button');
        return elements.length === 1 ? elements[0] : null;
    }

    getFormInputElem(type: string): HTMLInputElement | null {
        let elemSelected: HTMLInputElement | null = null;
        const elements: HTMLInputElement[] = <HTMLInputElement[]>this.getFormElems('input');
        elements.forEach((elem) => {
            if (elem.type === type) {
                elemSelected = elem;
            }
        });
        return elemSelected;
    }

    findButton(searchText: string): HTMLButtonElement | null {
        const aTags: HTMLCollectionOf<HTMLButtonElement> = document.getElementsByTagName('button');
        let found: HTMLButtonElement | null = null;
        for (let i = 0; i < aTags.length; i++) {
            if (aTags[i].textContent == searchText) {
                found = aTags[i];
                break;
            }
        }
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

    cleanLogin(): void {
        if (this.parent) {
            this.parent.getName().then((name: string) => {
                if (this.DEBUG) {
                    console.log('[Bob-rpa]  Child: current name', name);
                }
                const currentName: string| null = localStorage.getItem('cs_child_name');
                if (!currentName || name !== currentName) {
                    this.logoutAction();
                }
                localStorage.setItem('cs_child_name', name)
            });
        }
    }

    initAutoLogin(): void  {
        if (this.parent) {
            this.parent.needLogin().then((data: LoginData) => {
                if (!data) {
                    this.switchCSLoader('off');
                    return;
                } else {
                    if (this.DEBUG) {
                        console.log('[Bob-rpa]  Child: need_login confirmed');
                    }
                    this.cleanLogin();
                    this.watchFunctions.push(() => this.checkLogin());
                    this.checkLogin();
                }
            });
        }
    }

    needLogin(): void {
        if (this.parent && this.isLoginWrapperPresent()) {
            this.parent.needLogin().then((data: LoginData) => {
                if (!data) {
                    if (this.DEBUG) {
                        console.log('[Bob-rpa]  Child: no login from parent');
                    }
                    this.switchCSLoader('off');
                    return;
                }
                if (this.DEBUG) {
                    console.log('[Bob-rpa]  Child: need_login', this.hiddePass(data));
                }
                this.loginAction(data);
            });
        }
    }

    isLoginWrapperPresent(): boolean {
        if (this.DEBUG) {
            console.error('[Bob-rpa]  Child: no loginAction configuration');
        }
        return false;
    }

    logoutAction(): void  {
        console.error('[Bob-rpa]  Child: no logoutAction configuration');
    }

    loginAction(data: LoginData): void  {
        console.error('[Bob-rpa]  Child: no loginAction configuration');
        if (data) {
            console.log('data', this.hiddePass(data));
        }
    }
}
