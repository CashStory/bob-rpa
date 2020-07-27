import { connectToParent } from 'penpal/lib';
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

export class BobRpa {
    version = '1.0.0';
    iFrameDetected = false;
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

    watchFunctions: Array<() => void> = [];
    mutationConfig = {
        childList: true,
        subtree: true
    };

    constructor(css_plus = '', html_plus = '') {
        this.iFrameDetected = !(window === window.parent);
        this.cssElem = document.createElement('style');
        this.htmlElem = document.createElement("div");
        this.csLoader = document.getElementById("cs_loader_wrap");
        this.cssPlus = css_plus;
        this.htmlPlus = html_plus;
        document.head.appendChild(this.cssElem);
        document.body.appendChild(this.htmlElem);

        this.watchFunctions.push(this.addAnalytics);
        this.watchFunctions.push(this.setCSCSS);
        this.watchFunctions.push(this.setCSHTML);
        window.addEventListener("load", () => { 
            this.bodyList = document.querySelector("body");
            if (this.bodyList) {
                this.bodyObserver = new MutationObserver(() => {
                    this.watchFunctions.forEach(element => {
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
        });
    }

    initPenpal(): void  {
        this.oldHref = document.location.href;
        console.log('==> bob-rpa iframe detected');
        // eslint-disable-next-line @typescript-eslint/no-this-alias
        const bob = this;
        const connection = connectToParent({
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
    
        connection.promise.then((parent) => {
            this.parent = <ParentFrame><unknown>parent;
            if (parent) {
                console.log('==> bob-rpa connected !');
                this.watchFunctions.push(this.applyZoom);
                this.initAutoLogin();
            }
        }).catch(() => {
            console.log('==> bob-rpa iframe timeout');
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
            this.loginRetry = setTimeout(this.checkLogin, 1500);
        } else if (this.loginRetry) {
            console.log('==> bob-rpa mutation but not login wraper present', document.location.href);
            clearTimeout(this.loginRetry);
            this.loginRetry = null;
            this.switchCSLoader('off');
        }
    }

    addAnalytics(): void {
        if (this.parent && this.oldHref != document.location.href) {
            this.oldHref = document.location.href;
            console.log('==> bob-rpa url change !!');
            this.parent.urlChangeEvent(this.oldHref);
        }
    }

    applyZoom(): void {
        if (this.parent) {
            this.parent.getZoomPercentage().then((zoom) => {
                if ('zoom' in document.body.style) {
                    document.body.style.zoom = zoom + "%";
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
        return Object.assign(data, {pwd: '****'});
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
                console.log('==> bob-rpa current name', name);
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
                    console.log('==> bob-rpa need_login confirmed');
                    this.watchFunctions.push(this.checkLogin);
                    this.cleanLogin();
                    this.checkLogin();
                }
            });
        }
    }

    needLogin(): void {
        if (this.parent && this.isLoginWrapperPresent()) {
            this.parent.needLogin().then((data: LoginData) => {
                if (!data) {
                    console.log('==> bob-rpa no login from parent');
                    this.switchCSLoader('off');
                    return;
                }
                console.log('==> bob-rpa need_login', this.hiddePass(data));
                this.loginAction(data);
            });
        }
    }

    isLoginWrapperPresent(): boolean {
        console.error('==> bob-rpa no loginAction configuration');
        return false;
    }

    logoutAction(): void  {
        console.error('==> bob-rpa no logoutAction configuration');
    }

    loginAction(data: LoginData): void  {
        console.error('==> bob-rpa no loginAction configuration');
        if (data) {
            console.log('data', data);
        }
    }
}
