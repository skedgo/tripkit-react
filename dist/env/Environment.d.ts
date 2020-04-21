export declare enum Env {
    PRODUCTION = "PRODUCTION",
    BETA = "BETA",
    DEVELOPMENT = "DEVELOPMENT"
}
declare class Environment {
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
