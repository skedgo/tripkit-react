import Environment from "../env/Environment";

class GATracker {

    private static _instance: GATracker;

    public static get instance(): GATracker {
        if (!this._instance) {
            this._instance = new GATracker();
        }
        return this._instance;
    }

    public send(category: string, action: string, label: string) {
        // 10757 request, only production should report to analytics
        if (Environment.isProd() && !Environment.isStaging()) {
            if ((window as any).ga) {
                (window as any).ga('send', 'event', category, action, label);
            }
        }
        if (Environment.isDev()) {
            console.log("GA Track event -" + " category: " + category + ", action: " + action + ", label: " + label + ".");
        }
    }

}

export default GATracker;