declare module 'iana-hashes' {
    export interface Hash {
        update(data: any, inputEncoding?: string): Hash;
        digest(encoding: 'buffer'): Buffer;
        digest(encoding: string): any;
        digest(): Buffer;
    }

    export interface Hmac {
        update(data: any, inputEncoding?: string): Hash;
        digest(encoding: 'buffer'): Buffer;
        digest(encoding: string): any;
        digest(): Buffer;
    }

    export function getHashes(): Array<string>;
    export function createHash(algorithm: string): Hash;
    export function createHmac(algorithm: string, key: string|Buffer): Hmac;
}

