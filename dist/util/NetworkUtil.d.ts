/// <reference types="jquery" />
declare enum MethodType {
    GET = "GET",
    POST = "POST",
    PUT = "PUT",
    DELETE = "DELETE"
}
declare class NetworkUtil {
    static MethodType: typeof MethodType;
    static status(response: any): Promise<any>;
    static json(response: any): Promise<any>;
    static jsonCallback(response: any): Promise<any>;
    /**
     * Dynamically imports jquery, and then gets the script dynamically
     */
    static getScript(url: string): any;
    static getStylesheet(url: string): Promise<any> | JQuery.Promise<any, any, any>;
    private static getStylesheetJQ;
    static loadCss(url: string, callback?: () => void): void;
    static makeCancelable(promise: Promise<any>): any;
}
export default NetworkUtil;
