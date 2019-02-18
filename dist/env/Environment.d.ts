declare class Environment {
    static readonly GMAPS_API_KEY: string;
    private static environment;
    static initialize(): void;
    static isProd(): boolean;
    static isStaging(): boolean;
    static isBeta(): boolean;
    static isDev(): boolean;
    static isNotProdAnd(cond: boolean): boolean;
    static isDevAnd(cond: boolean): boolean;
}
export default Environment;
