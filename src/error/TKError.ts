class TKError extends Error {

    public code?: string;
    public userError?: boolean;

    constructor(message: string, code?: string, userError?: boolean) {
        super(message);
        this.code = code;
        this.userError = userError;
    }

    public toString(): string {
        return super.toString() + (this.code ? " (" + this.code + ")" : "");
    }

}

export {TKError};