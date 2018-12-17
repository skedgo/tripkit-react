import {JsonConvert} from "json2typescript";
import {EventEmitter, EventSubscription} from "fbemitter";

class LocalStorageItem<T> {

    private classRef: { new (): T;};
    private localStorageKey: string;
    private eventEmitter: EventEmitter = new EventEmitter();

    constructor(classRef: { new(): T }, localStorageKey: string) {
        this.classRef = classRef;
        this.localStorageKey = localStorageKey;
    }

    public get(): T {
        return this.loadFromLS();
    }

    public save(update: T) {
        const prev = this.get();
        this.saveToLS(update);
        this.fireChangeEvent(update, prev);
    }

    private loadFromLS(): T {
        const itemS = localStorage.getItem(this.localStorageKey);
        if (itemS === null) {
            return new this.classRef();
        }
        try {
            const itemJson = JSON.parse(itemS);
            // return jsonConvert.deserialize(itemJson, this.classRef);
            return this.deserialize(itemJson);
        } catch (e) {
            return new this.classRef();
        }
    }

    protected deserialize(itemJson: any): T {
        const jsonConvert: JsonConvert = new JsonConvert();
        return jsonConvert.deserialize(itemJson, this.classRef);
    }

    private saveToLS(item: T) {
        const jsonConvert: JsonConvert = new JsonConvert();
        localStorage.setItem(this.localStorageKey, JSON.stringify(jsonConvert.serialize(item)));
    }

    public addChangeListener(callback: (update: T, prev: T) => void): EventSubscription {
        return this.eventEmitter.addListener('change', callback);
    }

    private fireChangeEvent(update: T, prev: T) {
        this.eventEmitter.emit('change', update, prev);
    }

}

export default LocalStorageItem;