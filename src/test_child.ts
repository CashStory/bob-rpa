export {};

declare global {
    interface Window { rpaSpeed: number; rpaDebug: boolean; }
}

window.rpaSpeed = 5000;
window.rpaDebug = true;