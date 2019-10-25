import Util from "./Util";
import {Env} from "../env/Environment";

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

    public static deserializer<T>(classRef: { new(): T }): (json: any) => Promise<T> {
        return (json: any) => {
            return Promise.resolve(Util.deserialize(json, classRef));
        }
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

    // For now it's just for development, to avoid doing so much api calls and accelerating answers.

    private static LS_FETCH_CACHE = "FETCH_CACHE";

    private static loadCacheFromLS(): Map<string, any> {
        const fetchChacheItem = localStorage.getItem(this.LS_FETCH_CACHE);
        return fetchChacheItem ? new Map<string, any>(JSON.parse(fetchChacheItem)) : new Map<string, any>();
    }

    private static saveCacheToLS(fetchCache: Map<string, any>) {
        localStorage.setItem(this.LS_FETCH_CACHE, JSON.stringify(Array.from(fetchCache.entries())));
    }

    private static fetchCache: Map<string, any>;
    private static getCache(): Map<string, any> {
        if (!NetworkUtil.fetchCache) {
            NetworkUtil.fetchCache = NetworkUtil.loadCacheFromLS();
        }
        return NetworkUtil.fetchCache;
    }
    private static setCache(cacheKey: string, response: any) {
        NetworkUtil.fetchCache.set(cacheKey, response);
        this.saveCacheToLS(this.fetchCache);
    }

    public static fetch(url: string, options: any, cache: boolean = true): Promise<any>  {
        if (!cache) {
            return fetch(url, options).then(NetworkUtil.jsonCallback);
        }
        const cacheKey = url + JSON.stringify(options);
        if (!NetworkUtil.getCache().has(cacheKey)) {
            const fetchPromise = fetch(url, options).then(NetworkUtil.jsonCallback);
            fetchPromise
                .then((json: any) => NetworkUtil.setCache(cacheKey, json))
                .catch((reason: Error) => {
                    // Our api answers 200 with a null json when there is no update, so return undefined;
                    if (reason.message.includes("Unexpected end of JSON input")) {
                        return undefined;
                    }
                    Util.log(reason, Env.PRODUCTION);
                    throw reason;
                });
            return fetchPromise;
        }
        return Promise.resolve(NetworkUtil.getCache().get(cacheKey));
    }
}

// Exports to gwt
Util.global.getScript = NetworkUtil.getScript;
Util.global.getStylesheet = NetworkUtil.getStylesheet;


export default NetworkUtil;