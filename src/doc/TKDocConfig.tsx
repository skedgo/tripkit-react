import React, { useContext, useEffect, useState } from 'react';
import TKUIButton, { TKUIButtonType } from "../buttons/TKUIButton";
import { tKUIDeaultTheme } from "../jss/TKUITheme";
import { tKUIButtonDefaultStyle } from "../buttons/TKUIButton.css";
import TKUIRoutingResultsView, { TKUIRoutingResultsViewHelpers } from "../trip/TKUIRoutingResultsView";
import TKUICard, { CardPresentation } from "../card/TKUICard";
import Util from "../util/Util";
import RoutingResults from "../model/trip/RoutingResults";
import Trip from "../model/trip/Trip";
import RoutingQuery from "../model/RoutingQuery";
import classNames from "classnames";
import { jss } from 'react-jss';
import { ReactComponent as IconDirections } from '../images/ic-directions.svg';
import TKUITripRow from "../trip/TKUITripRow";
import TKUITripOverviewView from "../trip/TKUITripOverviewView";
import { tKUITripOverviewViewDefaultStyle } from "../trip/TKUITripOverviewView.css";
import { tKUIRoutingQueryInputDefaultStyle } from "../query/TKUIRoutingQueryInput.css";
import { tKUIResultsDefaultStyle } from "../trip/TKUIRoutingResultsView.css";
import { tKUITripRowDefaultStyle } from "../trip/TKUITripRow.css";
import Location from "../model/Location";
import LatLng from "../model/LatLng";
import { tKUILocationDetailViewDefaultStyle } from "../location/TKUILocationDetailView.css";
import TKUILocationDetailView from "../location/TKUILocationDetailView";
import { tKUITimetableDefaultStyle } from "../service/TKUITimetableView.css";
import TKUITimetableView, { TKUITimetableViewHelpers } from "../service/TKUITimetableView";
import { loadTimetableState } from "../state/TKStateUrl";
import TKStateConsumer from "../config/TKStateConsumer";
import TKUISelect, { SelectOption } from "../buttons/TKUISelect";
import { tKUISelectDefaultStyle } from "../buttons/TKUISelect.css";
import { overrideClass } from "../jss/StyleHelper";
import { tKUICardDefaultStyle } from "../card/TKUICard.css";
import TKUILocationSearch from "../query/TKUILocationSearch";
import { tKUILocationSearchDefaultStyle } from "../query/TKUILocationSearch.css";
import TKUIMapView from "../map/TKUIMapView";
import { tKUIMapViewDefaultStyle } from "../map/TKUIMapView.css";
import TKUIRoutingQueryInput, { TKUIRoutingQueryInputHelpers } from "../query/TKUIRoutingQueryInput";
import { genClassNames } from "../css/GenStyle.css";
import TKStateController from "../config/TKStateController";
import TKState from "../config/TKState";
import TKUIServiceView from '../service/TKUIServiceView';
import ServiceDeparture from '../model/service/ServiceDeparture';
import { tKUIServiceViewDefaultStyle } from '../service/TKUIServiceView.css';
import ServiceDeparturesResult from '../model/service/ServiceDeparturesResult';
import { ServiceResultsContext } from '../service/ServiceResultsProvider';
import { tKUILocationBoxDefaultStyle } from '../location_box/TKUILocationBox.css';
import TKUILocationBox from '../location_box/TKUILocationBox';
import { useTKState } from '../config/TKStateProvider';

function classNamesOf(defaultStyle: any) {
    return Object.keys(Util.isFunction(defaultStyle) ? defaultStyle(tKUIDeaultTheme({ isDark: false, isHighContrast: false })) : defaultStyle);
}

export function getMockQuery(): RoutingQuery {
    const from = Location.create(LatLng.createLatLng(-33.899487, 151.119347), "Ashbury, NSW, Australia", "", "");
    const to = Location.create(LatLng.createLatLng(-33.859555, 151.207844), "The Rocks, NSW, Australia", "", "");
    return RoutingQuery.create(from, to);
}

export function getMockRoutingResults(): Trip[] {
    const routingResultsJson = require("./data/routingResults.json");
    const routingResults = Util.deserialize(routingResultsJson, RoutingResults);
    routingResults.setQuery(new RoutingQuery());
    return routingResults.groups;
}

export function getMockServiceDeparture(): ServiceDeparture {
    const serviceDeparturesResult = getMockServiceDepartures();
    const departures = serviceDeparturesResult.getDepartures(serviceDeparturesResult.stops?.[0]!);
    return departures[0];
}

export function getMockServiceDepartures(): ServiceDeparturesResult {
    const serviceDeparturesJson = require("./data/serviceDepartures.json");
    const serviceDepartures = Util.deserialize(serviceDeparturesJson, ServiceDeparturesResult);
    return serviceDepartures;
}

function getMockLocation(): Location {
    const locationJson = require("./data/location.json");
    return Util.deserialize(locationJson, Location);
}

const TKUITimetableViewShowcase = () =>
    <TKStateConsumer>
        {(tKState: TKState) =>
            <div style={{ height: '800px', width: '400px', display: 'flex', flexDirection: 'column' }}>
                {tKState.stop &&
                    <TKUITimetableViewHelpers.TKStateProps>
                        {stateProps => <TKUITimetableView {...stateProps} initScrollToNow={false} cardPresentation={CardPresentation.NONE} />}
                    </TKUITimetableViewHelpers.TKStateProps>}
                <TKStateController
                    onInit={(tKState: TKState) => loadTimetableState(tKState, "AU_NSW_Sydney", "200050")}
                />
            </div>
        }
    </TKStateConsumer>

const TKUIServiceViewShowcase = () => {
    const { selectedService = null, onServiceSelection } = useContext(ServiceResultsContext);
    useEffect(() => {
        onServiceSelection(getMockServiceDeparture());
    }, []);
    return selectedService &&
        <TKUIServiceView
            // departure={departures[0]}
            cardPresentation={CardPresentation.NONE}
        />;
}

const TKUISelectShowcase = () => {
    const options = [
        { value: 0, label: 'Item 1' },
        { value: 1, label: 'Item 2' },
        { value: 2, label: 'Item 3' }
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

const TKUILocationBoxShowcase = () => {
    const [location, setLocation] = useState<Location | null>(null);
    return (
        <TKUILocationBox
            value={location}
            onChange={setLocation}
            placeholder='Search address'
            styles={{
                wrapper: overrideClass({
                    border: '1px solid lightgray',
                    padding: '0 10px',
                    borderRadius: '8px'
                }),
                menu: overrideClass({
                    top: '36px'
                })
            }}
        />
    );
}

const TKUIRoutingResultsViewShowcase = () => {
    const tKState = useTKState();
    useEffect(() => {
        const routingResultsJson = require("./data/routingResults2.json");
        tKState.onTripJsonUrl(JSON.stringify(routingResultsJson));
    }, []);
    return (
        <div style={{ maxHeight: 600, display: 'flex', justifyContent: 'center' }}>
            <TKUIRoutingResultsViewHelpers.TKStateProps>
                {stateProps =>
                    <TKUIRoutingResultsView
                        {...stateProps}
                        cardPresentation={CardPresentation.NONE}
                        showTimeSelect={false}
                        showTransportsBtn={false} />}
            </TKUIRoutingResultsViewHelpers.TKStateProps>
        </div>
    );
}

const tKDocConfig = {
    TKUICard: {
        showcase: () =>
            <TKUICard
                title={"Title"}
                subtitle={"Subtitle"}
                // renderSubHeader={() => <div>Subheader</div>}
                onRequestClose={() => { }}
            >
                <div style={{
                    padding: '16px',
                    height: '200px'
                }} />
            </TKUICard>,
        style: classNamesOf(tKUICardDefaultStyle)
    },
    TKUILocationBox: {
        showcase: () => <TKUILocationBoxShowcase />,
        style: classNamesOf(tKUILocationBoxDefaultStyle)
    },
    TKUILocationSearch: {
        showcase: () => <TKUILocationSearch />,
        style: classNamesOf(tKUILocationSearchDefaultStyle)
    },
    TKUIRoutingQueryInput: {
        showcase: () =>
            <TKUIRoutingQueryInputHelpers.TKStateProps>
                {stateProps => <TKUIRoutingQueryInput {...stateProps} />}
            </TKUIRoutingQueryInputHelpers.TKStateProps>,
        style: classNamesOf(tKUIRoutingQueryInputDefaultStyle)
    },
    TKUILocationDetailView: {
        showcase: () => <TKUILocationDetailView location={getMockLocation()} cardPresentation={CardPresentation.NONE} />,
        style: classNamesOf(tKUILocationDetailViewDefaultStyle)
    },
    TKUIButton: {
        showcase: () =>
            <div className={classNames(genClassNames.flex, genClassNames.spaceAround)}>
                <div className={classNames(genClassNames.flex, genClassNames.column, classes.buttonsColumn)}>
                    <TKUIButton text={"Button"} randomizeClassNames={true} />
                    <TKUIButton text={"Button"} icon={<IconDirections />} />
                    <TKUIButton text={"Button"} type={TKUIButtonType.PRIMARY_VERTICAL} icon={<IconDirections />} />
                    <TKUIButton text={"Button"} type={TKUIButtonType.PRIMARY_LINK} />
                </div>
                <div className={classNames(genClassNames.flex, genClassNames.column, classes.buttonsColumn)}>
                    <TKUIButton text={"Button"} type={TKUIButtonType.SECONDARY} />
                    <TKUIButton text={"Button"} type={TKUIButtonType.SECONDARY} icon={<IconDirections />} />
                    <TKUIButton text={"Button"} type={TKUIButtonType.SECONDARY_VERTICAL} icon={<IconDirections />} />
                </div>
            </div>,
        style: classNamesOf(tKUIButtonDefaultStyle)
    },
    TKUISelect: {
        showcase: () => <TKUISelectShowcase />,
        style: classNamesOf(tKUISelectDefaultStyle)
    },
    TKUIRoutingResultsView: {
        showcase: () => <TKUIRoutingResultsViewShowcase />,
        style: classNamesOf(tKUIResultsDefaultStyle)
    },
    TKUITripRow: {
        showcase: () => <TKUITripRow value={getMockRoutingResults()[0]} />,
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
        showcase: () => <TKUITimetableViewShowcase />,
        style: classNamesOf(tKUITimetableDefaultStyle)
    },
    TKUIServiceView: {
        showcase: () => <TKUIServiceViewShowcase />,
        style: classNamesOf(tKUIServiceViewDefaultStyle)
    },
    TKUIMapView: {
        showcase: () =>
            <div style={{ height: '500px' }}>
                <TKUIMapView />
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

// @ts-ignore: avoid TS2741
const classes: Record<keyof typeof styles, string> = jss.createStyleSheet(styles as any).attach().classes;

export { tKDocConfig };