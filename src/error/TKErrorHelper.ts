import {TKError} from "./TKError";

// TripGo api errors
export const ERROR_ROUTING_NOT_SUPPORTED = "1001";
export const ERROR_DESTINATION_OUTSIDE_COVERAGE = "1003";
export const ERROR_UNABLE_TO_RESOLVE_ADDRESS = "ERROR_UNABLE_TO_RESOLVE_ADDRESS";
export const ERROR_DEPARTURES_FROM_OLD_REQUEST = "ERROR_DEPARTURES_FROM_OLD_REQUEST";

class TKErrorHelper {

    public static hasErrorCode(error: Error, code: string) {
        if (!(error instanceof TKError)) {
            return false;
        }
        return (error as TKError).code === code;
    }

}

export default TKErrorHelper;