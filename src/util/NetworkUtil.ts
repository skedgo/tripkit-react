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
                        throw TKError.create({ message: i18n.t("Something.went.wrong.") + " " + i18n.t("Contact.support"), code: response.status, usererror: false, response });
                    })
                    .then(jsonData => {
                        if (jsonData.error || jsonData.errorCode) {    // To contemplate new error format, which comes with fields `errorCode`, `title`, `subtitle`, and `userError`.
                            const messageElems = jsonData.error ? [jsonData.error] : [jsonData.title, jsonData.subtitle].filter(text => text);
                            const tkError = TKError.create({ message: messageElems.join(". "), code: jsonData.errorCode?.toString(), usererror: jsonData.usererror, response });
                            throw tkError;
                        } else {
                            return Promise.reject(TKError.create({ message: response.statusText ? response.statusText : response.status, code: response.status, usererror: false, response }));
                        }
                    })
            } else {
                return Promise.reject(TKError.create({ message: i18n.t("Something.went.wrong.") + " " + i18n.t("Contact.support"), code: response.status, usererror: false, response }));
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
                const tkError = TKError.create({ message: jsonData.error, code: jsonData.errorCode ? jsonData.errorCode.toString() : undefined, usererror: jsonData.usererror, response, title: jsonData.title, subtitle: jsonData.subtitle });
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
                const tkError = TKError.create({ message: jsonData.error, code: jsonData.errorCode ? jsonData.errorCode.toString() : undefined, usererror: jsonData.usererror, response });
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

    private static isExpired(request: Request): boolean {
        const cacheControl = request.headers.get("x-cache-control");
        if (!cacheControl) {
            return false;
        }
        const maxAge = cacheControl.match(/max-age=(\d+)/);
        if (!maxAge) {
            return false;
        }
        const maxAgeValue = parseInt(maxAge[1]);
        const date = request.headers.get("x-date");
        if (!date) {
            return false;
        }
        const dateValue = new Date(date).getTime();
        const now = new Date().getTime();
        return now - dateValue > maxAgeValue * 1000
    }

    public static async fetch(url: string, options: any, useCache: boolean = true, cacheRefreshCallback: (response: any) => void = () => { }): Promise<any> {
        if (!useCache) {
            try {
                const response = await fetch(url, options);
                return this.fetchApiCallback(response);
            } catch (e) {
                if (e instanceof TKError) {
                    throw e;
                }
                throw TKError.create({
                    message: i18n.t("Something.went.wrong.") + " " + i18n.t("Contact.support"), usererror: false, requestUrl: url
                });
            }
        }
        options.headers = options.headers || {};
        const fetchRequest = new Request(url, options);
        const cacheName = new URL(fetchRequest.url).hostname;
        const cache = await caches.open(cacheName);
        const cacheResponse = await cache.match(fetchRequest);
        const cacheAndNetwork = options.headers["x-fetch-policy"] === "cache-and-network";
        if (cacheResponse && !NetworkUtil.isExpired(fetchRequest) && !cacheAndNetwork) {
            return NetworkUtil.fetchApiCallback(cacheResponse);
        }
        // Remove custom browser cache headers, they shouldn't be sent to the server (e.g. CORS can complain).
        options.headers = { ...options.headers };
        delete options.headers["x-fetch-policy"];
        delete options.headers["x-cache-control"];
        delete options.headers["x-date"];
        if (cacheResponse && !NetworkUtil.isExpired(fetchRequest) && cacheAndNetwork) {
            fetch(url, options)
                .then(response => {
                    cache.put(fetchRequest, response.clone());
                    return response;
                })
                .then(NetworkUtil.fetchApiCallback)
                .then(cacheRefreshCallback)
                .catch(e => { });
            return NetworkUtil.fetchApiCallback(cacheResponse);
        }
        const response = await fetch(url, options);
        cache.put(fetchRequest, response.clone());
        return NetworkUtil.fetchApiCallback(response);
    }

    public static delayPromise<T>(duration: number): ((data: T) => Promise<T>) {
        return (data) => new Promise(resolve => setTimeout(() => resolve(data), duration));
    }
}


export default NetworkUtil;