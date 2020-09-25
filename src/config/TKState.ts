import {TKUIConfig} from "./TKUIConfig";
import {IRoutingResultsContext} from "../trip-planner/RoutingResultsProvider";
import {IServiceResultsContext} from "../service/ServiceResultsProvider";
import {IOptionsContext} from "../options/OptionsProvider";

export interface TKState extends IRoutingResultsContext, IServiceResultsContext, IOptionsContext {
    /**
     * @ctype
     */
    config: TKUIConfig;
}

export const TKStateForDoc = (props: TKState) => null;
TKStateForDoc.displayName = 'TKState';

export default TKState;