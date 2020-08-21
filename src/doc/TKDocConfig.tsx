import * as React from "react";
import TKUIW3w from "../location/TKUIW3w";
import TKUIButton from "../buttons/TKUIButton";
import {genClassNames, TKUIButtonType} from "../index";
import {tKUIW3wDefaultStyle} from "../location/TKUIW3w.css";
import {tKUIDeaultTheme} from "../jss/TKUITheme";
import {tKUIButtonDefaultStyle} from "../buttons/TKUIButton.css";
import TKUIResultsView from "../trip/TKUIResultsView";
import {CardPresentation} from "../card/TKUICard";
import Util from "../util/Util";
import RoutingResults from "../model/trip/RoutingResults";
import Trip from "../model/trip/Trip";
import RoutingQuery from "../model/RoutingQuery";
import classNames from "classnames";
import jss from 'jss';
import {ReactComponent as IconDirections} from '../images/ic-directions.svg';
import TKUITripRow from "../trip/TKUITripRow";
import TKUITripOverviewView from "../trip/TKUITripOverviewView";
import {tKUITripOverviewViewDefaultStyle} from "../trip/TKUITripOverviewView.css";

function classNamesOf(defaultStyle: any) {
    return Object.keys(Util.isFunction(defaultStyle) ? defaultStyle(tKUIDeaultTheme(false)) : defaultStyle);
}

export function getMockRoutingResults(): Trip[] {
    const routingResultsJson = require("./data/routingResults.json");
    const routingResults = Util.deserialize(routingResultsJson, RoutingResults);
    routingResults.setQuery(new RoutingQuery());
    return routingResults.groups;
}

const tKDocConfig = {
    TKUIW3w: {
        showcase: () => <TKUIW3w w3w={"hola"} w3wInfoURL={"chau"}/>,
        style: classNamesOf(tKUIW3wDefaultStyle)
    },
    TKUIButton: {
        showcase: () =>
            <div className={classNames(genClassNames.flex, genClassNames.spaceAround)}>
                <div className={classNames(genClassNames.flex, genClassNames.column, classes.buttonsColumn)}>
                    <TKUIButton text={"Button"} randomizeClassNames={true}/>
                    <TKUIButton text={"Button"} icon={<IconDirections/>}/>
                    <TKUIButton text={"Button"} type={TKUIButtonType.PRIMARY_VERTICAL} icon={<IconDirections/>}/>
                    <TKUIButton text={"Button"} type={TKUIButtonType.PRIMARY_LINK}/>
                </div>
                <div className={classNames(genClassNames.flex, genClassNames.column, classes.buttonsColumn)}>
                    <TKUIButton text={"Button"} type={TKUIButtonType.SECONDARY}/>
                    <TKUIButton text={"Button"} type={TKUIButtonType.SECONDARY} icon={<IconDirections/>}/>
                    <TKUIButton text={"Button"} type={TKUIButtonType.SECONDARY_VERTICAL} icon={<IconDirections/>}/>
                </div>
            </div>,
        style: classNamesOf(tKUIButtonDefaultStyle)
    },
    TKUIResultsView: {
        showcase: () => <TKUIResultsView cardPresentation={CardPresentation.NONE} values={getMockRoutingResults()}/>
    },
    TKUITripRow: {
        showcase: () => <TKUITripRow value={getMockRoutingResults()[0]}/>
    },
    TKUITripOverviewView: {
        style: classNamesOf(tKUITripOverviewViewDefaultStyle),
        showcase: () =>
            //<TKPropsOverride componentKey={"TKUITripOverviewView"}
            //                 propsOverride={(props: TKUITripOverviewViewProps) => ({
                                 // actions: (trip: Trip, defaultActions: JSX.Element[]) => defaultActions.concat([<button>Mostrame a mi mejor!!</button>])
                                 // actions: (trip: Trip, defaultActions: JSX.Element[]) =>
                                 //     (props.actions ? props.actions(trip, defaultActions) : defaultActions)
                                 //         .concat([<button>Mostrame también!!</button>])
            //                 })}>
                <TKUITripOverviewView
                    value={getMockRoutingResults()[0]}
                    cardPresentation={CardPresentation.NONE}
                    // actions={(trip: Trip, defaultActions: JSX.Element[]) => [<button>Mostrame a mi solo!!!</button>]}
                    // actions={(trip: Trip, defaultActions: JSX.Element[]) => defaultActions.concat([<button>Mostrame!!!</button>])}
                />
           // </TKPropsOverride>
    }
};

const styles = {
    buttonsColumn: {
        '&>*': {
            margin: '20px 0'
        }
    }
};

const classes: Record<keyof typeof styles, string> = jss.createStyleSheet(styles as any).attach().classes;

export {tKDocConfig};