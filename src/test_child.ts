export {};

declare global {
    interface Window { rpaSpeed: number; rpaDebug: boolean; }
}

window.rpaSpeed = 10000;
window.rpaDebug = true;