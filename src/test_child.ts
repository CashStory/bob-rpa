export {};

declare global {
    interface Window { rpaSpeed: number; }
}

window.rpaSpeed = 10000;