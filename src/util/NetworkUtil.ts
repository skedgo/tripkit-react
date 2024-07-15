import Util from "./Util";
import { Env } from "../env/Environment";
import { TKError } from "../error/TKError";
import { i18n } from "../i18n/TKI18nConstants";

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
            const contentType = response.headers.get("content-type");
            if (contentType && contentType.indexOf("application/json") !== -1) {
                return response.json()
                    .catch(_e => {  // E.g. if "content-type" header is "application/json", but the body is actually not a valid json.                    
                        throw new TKError(i18n.t("Something.went.wrong.") + " " + i18n.t("Contact.support"), response.status, false);
                    })
                    .then(jsonData => {
                        if (jsonData.error || jsonData.errorCode) {    // To contemplate new error format, which comes with fields `errorCode`, `title`, `subtitle`, and `userError`.
                            const messageElems = jsonData.error ? [jsonData.error] : [jsonData.title, jsonData.subtitle].filter(text => text);
                            const tkError = new TKError(messageElems.join(". "), jsonData.errorCode?.toString(), jsonData.usererror);
                            tkError.title = jsonData.title;
                            tkError.subtitle = jsonData.subtitle;
                            throw tkError;
                        } else {
                            return Promise.reject(new Error(response.statusText ? response.statusText : response.status));
                        }
                    })
            } else {
                return Promise.reject(new TKError(i18n.t("Something.went.wrong.") + " " + i18n.t("Contact.support"), response.status, false));
            }
        }
    }

    /**
     * @deprecated Use content
     */
    public static json(response: any): Promise<any> {
        if (response.status === 204) {  // No content (so, no response.json()).
            return Promise.resolve({});
        }
        return response.json().then(jsonData => {
            if (jsonData.error) {
                const tkError = new TKError(jsonData.error, jsonData.errorCode && jsonData.errorCode.toString(), jsonData.usererror);
                tkError.title = jsonData.title;
                tkError.subtitle = jsonData.subtitle;
                throw tkError;
            }
            return jsonData;
        });
    }

    /**
     * @deprecated Use fetchApiCallback     
     */

    public static jsonCallback(response: any): Promise<any> {
        return NetworkUtil.status(response)
            .then(NetworkUtil.json);
    }

    public static content(response: any): Promise<any> {
        if (response.status === 204) {  // No content (so, no response.json()).
            return Promise.resolve({});
        }
        return response.text().then(text => {
            try {
                return JSON.parse(text);
            } catch (err) {
                return text;
            }
        }).then(content => {
            if (typeof content === 'object' && content?.error) {
                const jsonData = content;
                const tkError = new TKError(jsonData.error, jsonData.errorCode && jsonData.errorCode.toString(), jsonData.usererror);
                tkError.title = jsonData.title;
                tkError.subtitle = jsonData.subtitle;
                throw tkError;
            }
            return content;
        });
    }

    public static fetchApiCallback(response: any): Promise<any> {
        return NetworkUtil.status(response)
            .then(NetworkUtil.content);
    }

    public static deserializer<T>(classRef: { new(): T }): (json: any) => Promise<T> {
        return (json: any) => {
            try {
                return Promise.resolve(Util.deserialize(json, classRef));
            } catch (e) {
                // Print to console deserialize exception.
                console.log(e);
                return Promise.reject(e);
            }
        }
    }

    public static loadCss(url: string, callback?: () => void) {
        // Adding the script tag to the head as suggested before
        const head: any = document.getElementsByTagName('head')[0];
        const link: any = document.createElement('link');
        link.id = 'actTPStyle';
        link.rel = 'stylesheet';
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
                val => hasCanceled ? reject({ isCanceled: true }) : resolve(val),
                error => hasCanceled ? reject({ isCanceled: true }) : reject(error)
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

    // if (!cache) {
    //     const fetchPromise = fetch(url, options);
    //     return options.headers?.['Accept']?.contains("html") ? fetchPromise.then(result => result.text()) : fetchPromise.then(NetworkUtil.jsonCallback);
    // }

    public static fetch(url: string, options: any, cache: boolean = true): Promise<any> {
        if (!cache) {
            return fetch(url, options).then(NetworkUtil.fetchApiCallback);
        }
        const cacheKey = url + JSON.stringify(options);
        if (!NetworkUtil.getCache().has(cacheKey)) {
            const fetchPromise = fetch(url, options).then(NetworkUtil.fetchApiCallback);
            const resultP = fetchPromise
                .then((json: any) => NetworkUtil.setCache(cacheKey, json))
                .catch((reason: Error) => {
                    // Our api answers 200 with a null json when there is no update, so return undefined;
                    if (reason.message.includes("Unexpected end of JSON input")) {
                        return undefined;
                    }
                    Util.log(reason, Env.PRODUCTION);
                    throw reason;
                });
            return resultP;
        }
        return Promise.resolve(NetworkUtil.getCache().get(cacheKey));
    }

    public static delayPromise<T>(duration: number): ((data: T) => Promise<T>) {
        return (data) => new Promise(resolve => setTimeout(() => resolve(data), duration));
    }
}


export default NetworkUtil;