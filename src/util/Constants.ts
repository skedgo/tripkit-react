class Constants {

    public static DEPLOY_URL: string;

    private static isMe(scriptElem: any){
        return scriptElem.getAttribute('src') && scriptElem.getAttribute('src').endsWith("/embed.js");
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
        const currentScript = Constants.getCurrentScript();
        const embedjsSrc = currentScript ? currentScript.src : "https://act.tripgo.com/static/js";

        Constants.DEPLOY_URL = embedjsSrc.indexOf("/embed.js") !== -1 ? embedjsSrc.slice(0, embedjsSrc.indexOf("/embed.js")) :
            embedjsSrc.slice(0, embedjsSrc.indexOf("/static/js"));

        console.log("Constants.DEPLOY_URL = " + Constants.DEPLOY_URL);
    }

    public static absUrl(path: string): string {
        return this.DEPLOY_URL + path;
    }

}

Constants.initialize();

export default Constants;