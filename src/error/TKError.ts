class TKError extends Error {

    public code?: string | number;
    public usererror?: boolean;
    public title?: string;
    public subtitle?: string;

    constructor(message: string, code?: string | number, usererror?: boolean, stack?: string) {
        super(message);
        this.code = code;
        this.usererror = usererror;
        if (stack) {
            this.stack = stack;
        }
    }

    public toString(): string {
        return super.toString() + (this.code ? " (" + this.code + ")" : "");
    }

}

export { TKError };