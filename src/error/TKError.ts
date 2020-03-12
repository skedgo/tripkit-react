class TKError extends Error {

    public code?: string;

    constructor(message: string, code?: string) {
        super(message);
        this.code = code;
    }

}

export {TKError};