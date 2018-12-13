namespace Receptacle {
    export interface Options<T> {
        id?: number|string;
        max?: number;
        items?: Items<T>[];
        lastModified?: Date;
    }

    export interface Export<T, X> {
        id: number|string;
        max: number|undefined;
        items: (Items<T> & InternalItemData<T>)[];
        lastModified: Date;
    }

    export interface SetOptions<X> {
        ttl?: number;
        refresh?: boolean;
        meta?: X;
    }

    export interface InternalItemData<X> {
        meta: X|undefined;
        refresh: number|undefined;
        expires: number|undefined;
    }

    export interface Items<T> {
        key: string;
        value: T;
    }
}

class Receptacle<T, X = undefined> {
    constructor(options?: Receptacle.Options<T>);
    public id: number|string;
    public max: number;
    public items: Receptacle.Items<T>[];
    public size: number;
    public has(key: string): boolean;
    public get(key: string): T|null;
    public meta(key: string): X|undefined;
    public set(key: string, value: T, options?: Receptacle.SetOptions<X>): Receptacle;
    public delete(key: string): void;
    public expire(key: string, ms: number = 0): void;
    public clear(): void;
    public toJSON(): Receptacle.Export<T, X>;
}

export = Receptacle;
