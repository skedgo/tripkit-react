import { JsonConvert } from "json2typescript";
import Environment from "../env/Environment";
declare type Update<T> = {
    [P in keyof T]?: T[P];
};
declare class Util {
    static global: any;
    static getWindowHeight(): number;
    /**
     * Generic clone, requires T to have a default constructor
     */
    static clone<T extends {
        constructor: any;
    }>(instance: T): T;
    /**
     * Deep clone, works with classes annotated with json2typescript.
     */
    static deepClone<T extends {
        constructor: any;
    }>(instance: T): T;
    /**
     * Serializes input object and deserializes to specified class. Both input object and passed classes should be
     * annotated with json2typescript.
     */
    static transerialize<T, U>(instance: T, classRef: {
        new (): U;
    }): U;
    /**
     * Generic immutable assign, requires T to have a default constructor Util.clone can be used.
     */
    static iAssign<T>(target: T, source: Update<T>): T;
    /**
     * Needed this since Set type does not allow to specify a custom equality comparator:
     * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set.
     * Mutable.
     */
    static addNoRep<T>(array: T[], elem: T, equal: (e1: T, e2: T) => boolean): T[];
    static addAllNoRep<T>(array: T[], elems: T[], equal: (e1?: T | null, e2?: T | null) => boolean): T[];
    static isEmpty(obj: any): boolean;
    private static jsonConvertI;
    static jsonConvert(): JsonConvert;
    static deserialize<T>(json: any, classRef: {
        new (): T;
    }): T;
    static serialize<T>(value: T): any;
    static stringify<T>(value: T): string;
    static stringifyJustValues(json: any): string;
    static log(obj: any, level?: Environment): void;
    static isFunction(functionToCheck: any): boolean;
}
export default Util;
