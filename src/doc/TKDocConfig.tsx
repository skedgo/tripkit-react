import React, {useState} from 'react';
import TKUIButton from "../buttons/TKUIButton";
import {genClassNames, TKState, TKStateController, TKUIButtonType, TKUICard, TKUIRoutingQueryInput} from "../index";
import {tKUIDeaultTheme} from "../jss/TKUITheme";
import {tKUIButtonDefaultStyle} from "../buttons/TKUIButton.css";
import TKUIRoutingResultsView from "../trip/TKUIRoutingResultsView";
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
import {tKUIResultsDefaultStyle} from "../trip/TKUIRoutingResultsView.css";
import {tKUITripRowDefaultStyle} from "../trip/TKUITripRow.css";
import Location from "../model/Location";
import LatLng from "../model/LatLng";
import {tKUILocationDetailViewDefaultStyle} from "../location/TKUILocationDetailView.css";
import TKUILocationDetailView from "../location/TKUILocationDetailView";
import {tKUITimetableDefaultStyle} from "../service/TKUITimetableView.css";
import TKUITimetableView from "../service/TKUITimetableView";
import {loadTimetableState, loadTripState} from "../state/TKStateUrl";
import TKStateConsumer from "../config/TKStateConsumer";
import TKUISelect, {SelectOption} from "../buttons/TKUISelect";
import {tKUISelectDefaultStyle} from "../buttons/TKUISelect.css";
import {overrideClass} from "../jss/StyleHelper";
import {tKUICardDefaultStyle} from "../card/TKUICard.css";
import TKUILocationSearch from "../query/TKUILocationSearch";
import {tKUILocationSearchDefaultStyle} from "../query/TKUILocationSearch.css";
import TKUIMapView from "../map/TKUIMapView";
import {tKUIMapViewDefaultStyle} from "../map/TKUIMapView.css";

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

const TKUISelectShowcase = () => {
    const options = [
        { value: 0, label: 'Item 1'},
        { value: 1, label: 'Item 2'},
        { value: 2, label: 'Item 3'}
    ];
    const [option, setOption] = useState<SelectOption>(options[0]);
    return (
        <TKUISelect
            options={options}
            value={option}
            onChange={(option: SelectOption) => setOption(option)}
            styles={{
                main: overrideClass({ width: '80px' })
            }}
        />
    )
};

const tKDocConfig = {
    TKUICard: {
        showcase: () =>
            <TKUICard
                title={"Title"}
                subtitle={"Subtitle"}
                // renderSubHeader={() => <div>Subheader</div>}
                onRequestClose={() => {}}
            >
                <div style={{
                    padding: '16px',
                    height: '200px'
                }}/>
            </TKUICard>,
        style: classNamesOf(tKUICardDefaultStyle)
    },
    TKUILocationSearch: {
        showcase: () => <TKUILocationSearch/>,
        style: classNamesOf(tKUILocationSearchDefaultStyle)
    },
    TKUIRoutingQueryInput: {
        showcase: () => <TKUIRoutingQueryInput/>,
        style: classNamesOf(tKUIRoutingQueryInputDefaultStyle)
    },
    TKUILocationDetailView: {
        showcase: () => <TKUILocationDetailView location={getMockLocation()} cardPresentation={CardPresentation.NONE}/>,
        style: classNamesOf(tKUILocationDetailViewDefaultStyle)
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
    TKUISelect: {
        showcase: () => <TKUISelectShowcase/>,
        style: classNamesOf(tKUISelectDefaultStyle)
    },
    TKUIRoutingResultsView: {
        showcase: () =>
        <React.Fragment>
            <TKUIRoutingResultsView cardPresentation={CardPresentation.NONE}/>
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
    TKUIMapView: {
        showcase: () =>
            <div style={{height: '500px'}}>
                <TKUIMapView/>
            </div>,
        style: classNamesOf(tKUIMapViewDefaultStyle)
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