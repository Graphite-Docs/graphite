declare function find(type: "name" | "pid" | "port", value: string | number | RegExp, strict?: boolean): Promise<{
    pid: number;
    ppid?: number;
    uid?: number;
    gid?: number;
    name: string;
    cmd: string;
}[]>
export = find;