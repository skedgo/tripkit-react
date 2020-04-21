declare class TKError extends Error {
    code?: string;
    constructor(message: string, code?: string);
}
export { TKError };
