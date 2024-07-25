class TKError extends Error {

    public static debugMode = false;

    public code?: string | number;
    public usererror?: boolean;
    public title?: string;
    public subtitle?: string;
    public response?: Response;

    constructor(message: string, code?: string | number, usererror?: boolean, stack?: string) {
        super(message);
        this.code = code;
        this.usererror = usererror;
        if (stack) {
            this.stack = stack;
        }
    }

    public static create(props: { title?: string, subtitle?: string, message: string, code?: string | number, usererror?: boolean, stack?: string, response?: Response, requestUrl?: string }): TKError {
        const { message, code, usererror, stack, response, requestUrl } = props;
        const result = new TKError(message, code, usererror, stack);
        result.title = props.title;
        result.subtitle = props.subtitle;
        result.response = response;
        const reqUrl = requestUrl ?? response?.url;
        if (reqUrl) {
            if (TKError.debugMode) {
                if (result.message) {
                    result.message += " " + " | Request url: " + reqUrl.substring(0, 100) + (reqUrl.length > 100 ? "..." : "");
                } else if (result.subtitle) {
                    result.subtitle += " " + " | Request url: " + reqUrl.substring(0, 100) + (reqUrl.length > 100 ? "..." : "");
                }
            }
        }
        return result;
    }

    public toString(): string {
        return super.toString() + (this.code ? " (" + this.code + ")" : "");
    }

}

export { TKError };