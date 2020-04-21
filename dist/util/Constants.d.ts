declare class Constants {
    static DEPLOY_URL: string;
    private static isMe;
    private static getCurrentScript;
    static initialize(): void;
    static absUrl(path: string): string;
}
export default Constants;
