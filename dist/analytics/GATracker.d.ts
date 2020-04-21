declare class GATracker {
    private static _instance;
    static get instance(): GATracker;
    send(category: string, action: string, label: string): void;
}
export default GATracker;
