import Constants from "../util/Constants";

export enum Env {
    PRODUCTION = "PRODUCTION",
    BETA = "BETA",
    DEVELOPMENT = "DEVELOPMENT"
}

class Environment {

    private static environment = Env.PRODUCTION;

    public static initialize() {
        if (Constants.DEPLOY_URL.includes("beta.") || Constants.DEPLOY_URL.includes("tripkit.")) {
            this.environment = Env.BETA;
        } else if (Constants.DEPLOY_URL.startsWith("http://localhost")) {
            this.environment = Env.DEVELOPMENT;
        }
        console.log("Environment: " + this.environment);
    }

    public static setEnvironment(environment: Env) {
        this.environment = environment;
    }

    public static isProd(): boolean {
        return this.environment === Env.PRODUCTION;
    }

    public static isStaging(): boolean {
        return this.isProd() && (Constants.DEPLOY_URL.includes("-staging") || Constants.DEPLOY_URL.includes("staging."));
    }

    public static isBeta(): boolean {
        return this.environment === Env.BETA;
    }

    public static isDev(): boolean {
        return this.environment === Env.DEVELOPMENT;
    }

    public static isNotProdAnd(cond: boolean) {
        return !this.isProd() && cond;
    }

    public static isDevAnd(cond: boolean) {
        return this.isDev() && cond;
    }

    public static isLocal(): boolean {
        return window.location.hostname.includes("localhost");
    }

}

Environment.initialize();

export default Environment;