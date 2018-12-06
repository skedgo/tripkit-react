import Options from "../model/Options";
import {JsonConvert} from "json2typescript";
import {EventEmitter} from "fbemitter";

class OptionsData {

    private readonly LOCAL_STORAGE_KEY: string = "OPTIONS";

    private static _instance: OptionsData;

    private eventEmitter: EventEmitter = new EventEmitter();

    public static get instance(): OptionsData {
        if (!this._instance) {
            this._instance = new OptionsData();
        }
        return this._instance;
    }

    public get(): Options {
        return this.loadFromLS();
    }

    public save(update: Options) {
        const prev = this.get();
        this.saveToLS(update);
        this.fireChangeEvent(update, prev);
    }

    // TODO: create generic class LocalStorageItem<T> or LocalStorageData<T> that receives a LS_KEY (constructor)
    // and implements loadFromLS(): T, saveToLS(item: T) / get(): T, save(item: T).
    // See if jsonConvert.deserialize supports generic type.

    private loadFromLS(): Options {
        const optionsS = localStorage.getItem(this.LOCAL_STORAGE_KEY);
        if (optionsS === null) {
            return new Options();
        }
        try {
            const optionsJson = JSON.parse(optionsS);
            const jsonConvert: JsonConvert = new JsonConvert();
            return jsonConvert.deserialize(optionsJson, Options);
        } catch (e) {
            console.log("options format error");
            return new Options();
        }
    }

    private saveToLS(options: Options) {
        const jsonConvert: JsonConvert = new JsonConvert();
        localStorage.setItem(this.LOCAL_STORAGE_KEY, JSON.stringify(jsonConvert.serialize(options)));
    }

    public addChangeListener(callback: (update: Options, prev: Options) => void) {
        this.eventEmitter.addListener('change', callback);
    }

    private fireChangeEvent(update: Options, prev: Options) {
        this.eventEmitter.emit('change', update, prev);
    }

}

export default OptionsData;