import Environment from "../env/Environment";
var GATracker = /** @class */ (function () {
    function GATracker() {
    }
    Object.defineProperty(GATracker, "instance", {
        get: function () {
            if (!this._instance) {
                this._instance = new GATracker();
            }
            return this._instance;
        },
        enumerable: true,
        configurable: true
    });
    GATracker.prototype.send = function (category, action, label) {
        // 10757 request, only produdction should report to analytics
        if (Environment.isProd() && !Environment.isStaging()) {
            // i tried:
            // import { ga } from "google.analytics" - Module not found
            // create Analytics.js with the ga file: Class name must be in pascal case (and some other error i lost)
            // window.ga - Property 'ga' does not exist on type 'Window'.
            // disabling just no-unused-expressions
            // this is the only thing that works!
            // don't want to extract to a new file as i'm afraid to spend another hour on this
            // tslint:disable-next-line
            window['ga'] && window['ga']('send', 'event', category, action, label);
        }
        if (Environment.isDev()) {
            console.log("GA Track event -" + " category: " + category + ", action: " + action + ", label: " + label + ".");
        }
    };
    return GATracker;
}());
export default GATracker;
//# sourceMappingURL=GATracker.js.map