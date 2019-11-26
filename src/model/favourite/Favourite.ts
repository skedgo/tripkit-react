class Favourite {

    constructor() {

    }

    public type: string = "";

    equals(other: any): boolean {
        return JSON.stringify(this) === JSON.stringify(other);
    }

}

export default Favourite;