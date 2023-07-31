import LocalStorageItem from "./LocalStorageItem";
import { JsonConvert } from "json2typescript";

class LocalStorageItemArray<E extends { equals: (other: any) => boolean }> extends LocalStorageItem<E[]> {

    private elemClassRef: { new(): E; };

    constructor(elemClassRef: { new(): E }, localStorageKey: string) {
        super(Array, localStorageKey);
        this.elemClassRef = elemClassRef;
    }

    protected deserialize(itemJson: any): E[] {
        const jsonConvert: JsonConvert = new JsonConvert();
        return jsonConvert.deserializeArray(itemJson, this.elemClassRef);
    }

    public add(elem: E) {
        const favourites = this.get();
        const foundFavIndex = favourites.findIndex((e: E) => elem.equals(e));
        if (foundFavIndex !== -1) {
            favourites.splice(foundFavIndex, 1);
        }
        favourites.unshift(elem);
        this.save(favourites);
    }

    public remove(elem: E) {
        const favourites = this.get();
        const foundFavIndex = favourites.findIndex((e: E) => elem.equals(e));
        if (foundFavIndex !== -1) {
            favourites.splice(foundFavIndex, 1);
        }
        this.save(favourites);
    }

    public has(elem: E): boolean {
        const favourites = this.get();
        const foundFavIndex = favourites.findIndex((e: E) => elem.equals(e));
        return foundFavIndex !== -1;
    }

}

export default LocalStorageItemArray;