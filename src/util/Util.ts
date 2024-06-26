import { JsonConvert } from "json2typescript";
import Environment, { Env } from "../env/Environment";

export type Update<T> = {
    [P in keyof T]?: T[P]
}

export const SKEDGO_TERMS_OF_USE_URL = "https://skedgo.com/home/terms-of-use";
export const SKEDGO_PRIVACY_POLICY_URL = "https://skedgo.com/privacy-policy";

class Util {

    public static getWindowHeight(): number {
        return "innerHeight" in window ? window.innerHeight : document.documentElement.offsetHeight;
    }

    /**
     * Generic clone, requires T to have a default constructor
     */

    public static clone<T extends { constructor: any }>(instance: T): T {
        return Object.assign(new (instance.constructor as { new(): T })(), instance);
    }

    /**
     * Deep clone, works with classes annotated with json2typescript.
     */

    public static deepClone<T extends { constructor: any }>(instance: T): T {
        return this.transerialize(instance, instance.constructor as { new(): T });
    }

    // Didn't tried this one:
    // public static clone<T>(instance: T): T {
    //     return JSON.parse(JSON.stringify(instance));
    // }

    /**
     * Serializes input object and deserializes to specified class. Both input object and passed classes should be
     * annotated with json2typescript.
     */

    public static transerialize<T, U>(instance: T, classRef: { new(): U }): U {
        return this.deserialize(this.serialize(instance), classRef);
    }

    /**
     * Generic immutable assign, requires T to have a default constructor Util.clone can be used.
     */

    public static iAssign<T>(target: T, source: Update<T>): T {
        return Object.assign(Util.clone(target), source);
    }

    /**
     * Needed this since Set type does not allow to specify a custom equality comparator:
     * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set.
     * Mutable.
     */
    public static addNoRep<T>(array: T[], elem: T, equal: (e1: T, e2: T) => boolean): T[] {
        if (!array.find((e: T) => equal(elem, e))) {
            array.push(elem);
        }
        return array;
    }

    public static addAllNoRep<T>(array: T[], elems: T[], equal: (e1?: T | null, e2?: T | null) => boolean): T[] {
        for (const elem of elems) {
            this.addNoRep(array, elem, equal);
        }
        return array;
    }

    public static isEmpty(obj: any): boolean {
        for (const key in obj) {
            if (obj.hasOwnProperty(key)) {
                return false;
            }
        }
        return true;
    }

    private static jsonConvertI: JsonConvert;

    public static jsonConvert(): JsonConvert {
        if (!this.jsonConvertI) {
            this.jsonConvertI = new JsonConvert();
        }
        return this.jsonConvertI;
    }

    public static deserialize<T>(json: any, classRef: { new(): T }): T {
        return this.jsonConvert().deserialize(json, classRef) as T;
    }

    public static serialize<T>(value: T): any {
        return this.jsonConvert().serialize(value);
    }

    public static stringify<T>(value: T): string {
        return this.stringifyJustValues(this.serialize(value));
    }

    public static stringifyJustValues(json: any): string {
        return JSON.stringify(json).replace(/"([^(")"]+)":/g, "$1:")
    }

    public static log(obj: any, level: Environment | null = Env.DEVELOPMENT) {
        if (level !== null &&
            (Environment.isDev()
                || (Environment.isBeta() && (level === Env.BETA || level === Env.PRODUCTION))
                || (Environment.isProd() && level === Env.PRODUCTION))) {
            console.log(obj);
        }
    }

    public static isFunction(functionToCheck: any) {
        return functionToCheck && {}.toString.call(functionToCheck) === '[object Function]';
    }

    public static isJsonString(str: string) {
        try {
            JSON.parse(str);
        } catch (e) {
            return false;
        }
        return true;
    }

    /**
     * Hook to run func only once before component mounts: https://stackoverflow.com/a/56818036
     * Comment for now since causes react compile error.
     */
    // public static useComponentWillMount = (func) => {
    //     useMemo(func, []);
    // }

    public static kebabCaseToSpaced(text: string): string {
        return text
            // insert a space before all caps
            .replace(/(-[a-z])/g, (str) => ' ' + str.substring(1).toUpperCase())
            // uppercase the first character
            .replace(/^./, function (str) { return str.toUpperCase(); })
    }

    public static spacedToKebabCase(text: string): string {
        return text
            // lowercase all characters
            .toLowerCase()
            // replace spaces with hyphens
            .replace(/([ ])/g, '-')
    }

    public static camelCaseToSpaced(text: string): string {
        return text
            // insert a space before all caps
            .replace(/([A-Z])/g, ' $1')
            // uppercase the first character
            .replace(/^./, function (str) { return str.toUpperCase(); })
    }

    public static spacedToCamelCase(text: string): string {
        return text
            // lowercase the first character
            .replace(/^./, function (str) { return str.toLowerCase(); })
            // remove the spaces
            .replace(/([ ])/g, '')
    }

    public static upperCaseToSpaced(text: string): string {
        return text.toLowerCase()
            // insert a space before all caps
            .replace(/(_[a-z])/g, (str) => ' ' + str.substring(1).toUpperCase())
            // uppercase the first character
            .replace(/^./, function (str) { return str.toUpperCase(); })
    }

    public static camelCaseToKebab(text: string): string {
        return this.spacedToKebabCase(this.camelCaseToSpaced(text));
    }

    public static kebabCaseToCamel(text: string): string {
        return this.spacedToCamelCase(this.kebabCaseToSpaced(text));
    }

    public static upperCaseToKebab(text: string): string {
        return this.spacedToKebabCase(this.upperCaseToSpaced(text));
    }

    public static toFirstUpperCase(text: string): string {
        return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
    }

    public static getCookiesMap(): any {
        if (!document.cookie) {
            return {};
        }
        return document.cookie.split(';').reduce((cookieObject, cookieString) => {
            const splitCookie = cookieString.split('=').map((cookiePart) => cookiePart.trim());
            try {
                cookieObject[splitCookie[0]] = JSON.parse(splitCookie[1])
            } catch (error) {
                cookieObject[splitCookie[0]] = splitCookie[1]
            }
            return cookieObject
        }, {});
    }

    public static addSkedGoTermsToMapAttribution(attribution?: string): string {
        return (attribution ? attribution + ' | ' : "") + `<a href='${SKEDGO_TERMS_OF_USE_URL}' tabindex='-1' target='_blank'>SkedGo Terms</a>`
    }

}

export default Util;