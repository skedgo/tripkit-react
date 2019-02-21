import Constants from "../util/Constants";
var Env;
(function (Env) {
    Env["PRODUCTION"] = "PRODUCTION";
    Env["BETA"] = "BETA";
    Env["DEVELOPMENT"] = "DEVELOPMENT";
})(Env || (Env = {}));
var Environment = /** @class */ (function () {
    function Environment() {
    }
    Environment.initialize = function () {
        if (Constants.DEPLOY_URL.includes("-beta")) {
            this.environment = Env.BETA;
        }
        else if (Constants.DEPLOY_URL.startsWith("http://localhost")) {
            this.environment = Env.DEVELOPMENT;
        }
        console.log("Environment: " + this.environment);
    };
    Environment.isProd = function () {
        return this.environment === Env.PRODUCTION;
    };
    Environment.isStaging = function () {
        return this.isProd() && Constants.DEPLOY_URL.includes("-staging");
    };
    Environment.isBeta = function () {
        return this.environment === Env.BETA;
    };
    Environment.isDev = function () {
        return this.environment === Env.DEVELOPMENT;
    };
    Environment.isNotProdAnd = function (cond) {
        return !this.isProd() && cond;
    };
    Environment.isDevAnd = function (cond) {
        return this.isDev() && cond;
    };
    Environment.environment = Env.PRODUCTION;
    return Environment;
}());
Environment.initialize();
export default Environment;
//# sourceMappingURL=Environment.js.map