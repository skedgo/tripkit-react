declare class GATracker {
    private static _instance;
    static readonly instance: GATracker;
    send(category: string, action: string, label: string): void;
}
export default GATracker;
