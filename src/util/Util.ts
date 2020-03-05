import {JsonConvert} from "json2typescript";
import Environment, {Env} from "../env/Environment";

type Update<T> = {
    [P in keyof T]?: T[P]
}

class Util {

    // must cast as any to set property on window
    public static global: any = (window /* browser */ || global /* node */) as any;

    public static getWindowHeight(): number {
        return "innerHeight" in window ? window.innerHeight : document.documentElement.offsetHeight;
    }

    /**
     * Generic clone, requires T to have a default constructor
     */

    public static clone<T extends {constructor: any}>(instance: T): T {
        return Object.assign(new (instance.constructor as { new (): T })(), instance);
    }

    /**
     * Deep clone, works with classes annotated with json2typescript.
     */

    public static deepClone<T extends {constructor: any}>(instance: T): T {
        return this.transerialize(instance, instance.constructor as { new (): T });
    }

    // Didn't tried this one:
    // public static clone<T>(instance: T): T {
    //     return JSON.parse(JSON.stringify(instance));
    // }

    /**
     * Serializes input object and deserializes to specified class. Both input object and passed classes should be
     * annotated with json2typescript.
     */

    public static transerialize<T,U>(instance: T, classRef: { new(): U }): U {
        return this.deserialize(this.serialize(instance), classRef);
    }

    /**
     * Generic immutable assign, requires T to have a default constructor Util.clone can be used.
     */

    public static iAssign<T>(target: T, source: Update<T>): T {
        return Object.assign(Util.clone(target), source)
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
        for(const key in obj) {
            if(obj.hasOwnProperty(key)) {
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
        return this.jsonConvert().deserialize(json, classRef);
    }

    public static serialize<T>(value: T): any {
        return this.jsonConvert().serialize(value);
    }

    public static stringify<T>(value: T): string {
        return this.stringifyJustValues(this.serialize(value));
    }

    public static stringifyJustValues(json: any): string {
        return JSON.stringify(json).replace(/"([^(")"]+)":/g,"$1:")
    }

    public static log(obj: any, level: Environment = Env.DEVELOPMENT) {
        if (Environment.isDev()
            || (Environment.isBeta() && (level === Env.BETA || level === Env.PRODUCTION))
            || (Environment.isProd() && level === Env.PRODUCTION)) {
            console.log(obj);
        }
    }

    public static isFunction(functionToCheck: any) {
        return functionToCheck && {}.toString.call(functionToCheck) === '[object Function]';
    }

}

export default Util;