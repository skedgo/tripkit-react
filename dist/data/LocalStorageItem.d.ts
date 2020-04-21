import { EventSubscription } from "fbemitter";
declare class LocalStorageItem<T> {
    private classRef;
    private localStorageKey;
    private eventEmitter;
    constructor(classRef: {
        new (): T;
    }, localStorageKey: string);
    get(): T;
    save(update: T): void;
    private loadFromLS;
    protected deserialize(itemJson: any): T;
    private saveToLS;
    addChangeListener(callback: (update: T, prev: T) => void): EventSubscription;
    private fireChangeEvent;
}
export default LocalStorageItem;
