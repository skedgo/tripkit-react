class Constants {

    public static DEPLOY_URL: string;
    // Using tripgo.com as static assets repository.
    // TODO: avoid this.
    public static RESOURCES_URL: string = "https://tripgo.com";

    private static isMe(scriptElem: any){
        return scriptElem.getAttribute('src') && scriptElem.getAttribute('src').includes("/embed.js");
    }

    private static getCurrentScript(): any {
        if (document.currentScript) {
            return document.currentScript;
        }
        let currentScript = null;
        const scripts = Array.prototype.slice.call(document.getElementsByTagName("script"));
        for (const script of scripts) {
            if(Constants.isMe(script)){
                currentScript = script;
            }
        }
        return currentScript;
    }

    public static initialize() {
        try {
            const currentScript = Constants.getCurrentScript();
            const embedjsSrc = currentScript ? currentScript.src : "https://tripgo.com/static/js";

            Constants.DEPLOY_URL = embedjsSrc.indexOf("/embed.js") !== -1 ? embedjsSrc.slice(0, embedjsSrc.indexOf("/embed.js")) :
                embedjsSrc.indexOf("/static/js") !== -1 ? embedjsSrc.slice(0, embedjsSrc.indexOf("/static/js")) :
                    embedjsSrc.slice(0, embedjsSrc.indexOf("/index.js"));

            console.log("Constants.DEPLOY_URL = " + Constants.DEPLOY_URL);
        } catch (error) {
            // TODO: analyze which url makes sense to use as fallback.
            Constants.DEPLOY_URL = "https://tripgo.com";
            console.log("Constants.DEPLOY_URL = " + Constants.DEPLOY_URL + " (fallback)");
        }
    }

    public static absUrl(path: string): string {
        return this.RESOURCES_URL + path;
    }

}

Constants.initialize();

export default Constants;