class Util {

    // must cast as any to set property on window
    public static global: any = (window /* browser */ || global /* node */) as any;

    public static getWindowHeight(): number {
        return "innerHeight" in window ? window.innerHeight : document.documentElement.offsetHeight;
    }

    /**
     * Generic clone, requires T to have a default constructor
     */

    public static clone<T>(instance: T): T {
        return Object.assign(new (instance.constructor as { new (): T })(), instance);
    }

    /**
     * Generic immutable assign, requires T to have a default constructor Util.clone can be used.
     */

    public static iAssign<T>(target: T, source: object): T {
        return Object.assign(Util.clone(target), source)
    }

}

export default Util;