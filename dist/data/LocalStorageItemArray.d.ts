import LocalStorageItem from "./LocalStorageItem";
declare class LocalStorageItemArray<E extends {
    equals: (other: any) => boolean;
}> extends LocalStorageItem<E[]> {
    private elemClassRef;
    constructor(elemClassRef: {
        new (): E;
    }, localStorageKey: string);
    protected deserialize(itemJson: any): E[];
    add(elem: E): void;
    remove(elem: E): void;
    has(elem: E): boolean;
}
export default LocalStorageItemArray;
