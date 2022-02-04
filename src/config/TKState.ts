import {TKUIConfig} from "./TKUIConfig";
import {IRoutingResultsContext} from "../trip-planner/RoutingResultsProvider";
import {IServiceResultsContext} from "../service/ServiceResultsProvider";
import {IOptionsContext} from "../options/OptionsProvider";
import { IAccessibilityContext } from "./TKAccessibilityProvider";

export interface TKState extends IRoutingResultsContext, IServiceResultsContext, IOptionsContext, IAccessibilityContext {
    /**
     * @ctype
     */
    config: TKUIConfig;
}

export const TKStateForDoc = (props: TKState) => null;
TKStateForDoc.displayName = 'TKState';

export default TKState;