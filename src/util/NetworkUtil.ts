import Util from "./Util";

enum MethodType {
    GET = "GET",
    POST = "POST",
    PUT = "PUT",
    DELETE = "DELETE"
}

class NetworkUtil {

    public static MethodType = MethodType;

    public static status(response: any): Promise<any> {
        if (response.status >= 200 && response.status < 300) {
            return Promise.resolve(response)
        } else {
            return Promise.reject(new Error(response.statusText))
        }
    }

    public static json(response: any): Promise<any> {
        if (response.status === 204) {  // No content (so, no response.json()).
            return Promise.resolve({});
        }
        return response.json();
    }

    public static jsonCallback(response: any): Promise<any> {
        return NetworkUtil.status(response)
            .then(NetworkUtil.json);
    }

    /**
     * Dynamically imports jquery, and then gets the script dynamically
     */
    public static getScript(url: string) {
        if (Util.global.$) {
            return Util.global.$.getScript(url);
        }
        return import('../jslib/JQuery').then(value => Util.global.$.getScript(url));
    }

    public static getStylesheet(url: string) {
        if (Util.global.$) {
            return NetworkUtil.getStylesheetJQ(url);
        }
        return import('../jslib/JQuery').then(value => NetworkUtil.getStylesheetJQ(url));
    }

    private static getStylesheetJQ = (href: any) => {
        const $d = $.Deferred();
        const $link = $('<link/>', {
            rel: 'stylesheet',
            type: 'text/css',
            href: href
        }).appendTo('head');
        $d.resolve($link);
        return $d.promise();
    };

    public static loadCss(url: string, callback?: () => void) {
        // Adding the script tag to the head as suggested before
        const head: any = document.getElementsByTagName('head')[0];
        const link: any = document.createElement('link');
        link.id = 'actTPStyle';
        link.rel  = 'stylesheet';
        link.type = 'text/css';
        link.href = url;
        link.media = 'all';
        link.onreadystatechange = callback;
        link.onload = callback;
        // Fire the loading
        head.appendChild(link);
    }

    public static makeCancelable(promise: Promise<any>): any {
        let hasCanceled = false;

        const wrappedPromise = new Promise((resolve, reject) => {
            promise.then(
                val => hasCanceled ? reject({isCanceled: true}) : resolve(val),
                error => hasCanceled ? reject({isCanceled: true}) : reject(error)
            )
        });

        return {
            promise: wrappedPromise,
            cancel() {
                hasCanceled = true;
            },
        };
    };
}

// Exports to gwt
Util.global.getScript = NetworkUtil.getScript;
Util.global.getStylesheet = NetworkUtil.getStylesheet;


export default NetworkUtil;