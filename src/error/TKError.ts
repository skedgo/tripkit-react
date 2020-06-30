class TKError extends Error {

    public code?: string;
    public usererror?: boolean;

    constructor(message: string, code?: string, usererror?: boolean) {
        super(message);
        this.code = code;
        this.usererror = usererror;
    }

    public toString(): string {
        return super.toString() + (this.code ? " (" + this.code + ")" : "");
    }

}

export {TKError};