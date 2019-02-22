declare class Util {
    static global: any;
    static getWindowHeight(): number;
    /**
     * Generic clone, requires T to have a default constructor
     */
    static clone<T>(instance: T): T;
    /**
     * Generic immutable assign, requires T to have a default constructor Util.clone can be used.
     */
    static iAssign<T>(target: T, source: object): T;
    /**
     * Needed this since Set type does not allow to specify a custom equality comparator:
     * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set.
     * Mutable.
     */
    static addNoRep<T>(array: T[], elem: T, equal: (e1: T, e2: T) => boolean): T[];
    static addAllNoRep<T>(array: T[], elems: T[], equal: (e1: T | null, e2: T | null) => boolean): T[];
    static isEmpty(obj: any): boolean;
}
export default Util;
