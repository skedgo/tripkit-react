import {TKError} from "./TKError";

class TKErrorHelper {

    public static hasErrorCode(error: Error, code: string) {
        if (!(error instanceof TKError)) {
            return false;
        }
        return (error as TKError).code = code;
    }

}

export default TKErrorHelper;