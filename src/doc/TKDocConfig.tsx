import * as React from "react";
import TKUIW3w from "../location/TKUIW3w";
import TKUIButton from "../buttons/TKUIButton";
import {genClassNames, TKState, TKStateController, TKUIButtonType, TKUIRoutingQueryInput} from "../index";
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
import {tKUIRoutingQueryInputDefaultStyle} from "../query/TKUIRoutingQueryInput.css";
import {tKUIResultsDefaultStyle} from "../trip/TKUIResultsView.css";
import {tKUITripRowDefaultStyle} from "../trip/TKUITripRow.css";
import Location from "../model/Location";
import LatLng from "../model/LatLng";
import {tKUILocationDetailViewDefaultStyle} from "../location/TKUILocationDetailView.css";
import TKUILocationDetailView from "../location/TKUILocationDetailView";
import {tKUITimetableDefaultStyle} from "../service/TKUITimetableView.css";
import TKUITimetableView from "../service/TKUITimetableView";
import {loadTimetableState, loadTripState} from "../state/TKStateUrl";
import TKStateConsumer from "../config/TKStateConsumer";

function classNamesOf(defaultStyle: any) {
    return Object.keys(Util.isFunction(defaultStyle) ? defaultStyle(tKUIDeaultTheme(false)) : defaultStyle);
}

export function getMockQuery(): RoutingQuery {
    const from = Location.create(LatLng.createLatLng(-33.899487,151.119347), "Ashbury, NSW, Australia", "", "");
    const to = Location.create(LatLng.createLatLng(-33.859555,151.207844), "The Rocks, NSW, Australia", "", "");
    return RoutingQuery.create(from, to);
}

export function getMockRoutingResults(): Trip[] {
    const routingResultsJson = require("./data/routingResults.json");
    const routingResults = Util.deserialize(routingResultsJson, RoutingResults);
    routingResults.setQuery(new RoutingQuery());
    return routingResults.groups;
}

function getMockLocation(): Location {
    const locationJson = require("./data/location.json");
    return Util.deserialize(locationJson, Location);
}

const tKDocConfig = {
    TKUIRoutingQueryInput: {
        showcase: () => <TKUIRoutingQueryInput/>,
        style: classNamesOf(tKUIRoutingQueryInputDefaultStyle)
    },
    TKUILocationDetailView: {
        showcase: () => <TKUILocationDetailView location={getMockLocation()} cardPresentation={CardPresentation.NONE}/>,
        style: classNamesOf(tKUILocationDetailViewDefaultStyle)
    },
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
        showcase: () =>
        <React.Fragment>
            <TKUIResultsView cardPresentation={CardPresentation.NONE}/>
            <TKStateController
                onInit={(tKState: TKState) => {
                    const routingResultsJson = require("./data/routingResults.json");
                    loadTripState(tKState, JSON.stringify(routingResultsJson));
                }}
            />
        </React.Fragment>,
        style: classNamesOf(tKUIResultsDefaultStyle)
    },
    TKUITripRow: {
        showcase: () => <TKUITripRow value={getMockRoutingResults()[0]}/>,
        style: classNamesOf(tKUITripRowDefaultStyle)
    },
    TKUITripOverviewView: {
        style: classNamesOf(tKUITripOverviewViewDefaultStyle),
        showcase: () =>
            <TKUITripOverviewView
                value={getMockRoutingResults()[0]}
                cardPresentation={CardPresentation.NONE}
            />
    },
    TKUITimetableView: {
        showcase: () =>
            <TKStateConsumer>
                {(tKState: TKState) =>
                    <div style={{height: '800px', width: '400px', display: 'flex', flexDirection: 'column'}}>
                        {tKState.stop && <TKUITimetableView cardPresentation={CardPresentation.NONE}/>}
                        <TKStateController
                            onInit={(tKState: TKState) => loadTimetableState(tKState, "AU_NSW_Sydney", "200050")}
                        />
                    </div>
                }
            </TKStateConsumer>,
        style: classNamesOf(tKUITimetableDefaultStyle)
    },
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