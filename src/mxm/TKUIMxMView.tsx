import React, {useState, useEffect, Fragment} from 'react';
import {overrideClass, TKUIWithClasses, TKUIWithStyle} from "../jss/StyleHelper";
import {tKUIMxMViewDefaultStyle} from "./TKUIMxMView.css";
import {connect, PropsMapper} from "../config/TKConfigHelper";
import {TKComponentDefaultConfig, TKUIConfig} from "../config/TKUIConfig";
import {TKUISlideUpPosition} from "../card/TKUISlideUp";
import TKUICardCarousel from "../card/TKUICardCarousel";
import {TKUIViewportUtil, TKUIViewportUtilProps} from "../util/TKUIResponsiveUtil";
import {Subtract} from 'utility-types';
import TKUIMxMIndex from "./TKUIMxMIndex";
import Trip from "../model/trip/Trip";
import {Visibility} from "../model/trip/SegmentTemplate";
import Segment from "../model/trip/Segment";
import {IRoutingResultsContext, RoutingResultsContext} from "../trip-planner/RoutingResultsProvider";
import TKUICard from "../card/TKUICard";
import TKUIServiceSteps from "../trip/TKUIServiceSteps";
import {TranslationFunction} from "../i18n/TKI18nProvider";
import TKUIServiceRealtimeInfo from "../service/TKUIServiceRealtimeInfo";
import TKUserProfile from "../model/options/TKUserProfile";
import {IOptionsContext, OptionsContext} from "../options/OptionsProvider";
import {cardSpacing} from "../jss/TKUITheme";
import {TKUIMapViewClass} from "../map/TKUIMapView";
import MapUtil from "../util/MapUtil";
import TKUIMxMTimetableCard from "./TKUIMxMTimetableCard";
import TKUIMxMBookingCard from "./TKUIMxMBookingCard";
import TKUIMxMCardHeader from "./TKUIMxMCardHeader";
import TKUIStreetStep from "../trip/TKUIStreetStep";

interface IClientProps extends TKUIWithStyle<IStyle, IProps> {
    parentElement?: any;
}

interface IConsumedProps extends TKUIViewportUtilProps {
    selectedTrip?: Trip;
    selectedTripSegment?: Segment;
    setSelectedTripSegment: (segment?: Segment) => void;
    refreshSelectedTrip: () => Promise<boolean>;
    options: TKUserProfile;
    mapAsync: Promise<TKUIMapViewClass>;
}

interface IProps extends IClientProps, IConsumedProps, TKUIWithClasses<IStyle, IProps> {}

type IStyle = ReturnType<typeof tKUIMxMViewDefaultStyle>

export type TKUIMxMViewProps = IProps;
export type TKUIMxMViewStyle = IStyle;

const config: TKComponentDefaultConfig<IProps, IStyle> = {
    render: props => <TKUIMxMView {...props}/>,
    styles: tKUIMxMViewDefaultStyle,
    classNamePrefix: "TKUIMxMView"
};

const MODAL_UP_TOP = 100;

interface SegmentMxMCardsProps {
    segment: Segment;
    onClose: () => void;
    t: TranslationFunction;
    options: TKUserProfile;
    landscape: boolean;
    refreshSelectedTrip: () => Promise<boolean>;
    mapAsync: Promise<TKUIMapViewClass>;
    trip?: Trip;
}

function getPTSegmentMxMCards(props: SegmentMxMCardsProps): JSX.Element[] {
    const {segment, onClose, t, options, landscape} = props;
    let cards: JSX.Element[] = [];
    cards.push(
        <TKUIMxMTimetableCard segment={segment} onRequestClose={onClose} key={segment.id + "a"}/>
    );
    const timezone = segment.from.timezone;
    cards.push(
        <TKUICard
            title={segment.getAction()}
            subtitle={t("Direction") + ": " + segment.serviceDirection}
            renderHeader={props => <TKUIMxMCardHeader segment={segment} {...props}/>}
            renderSubHeader={() => (
                <TKUIServiceRealtimeInfo
                    wheelchairAccessible={segment.wheelchairAccessible}
                    vehicle={segment.realtimeVehicle}
                    alerts={segment.hasAlerts ? segment.alerts : undefined}
                    modeInfo={segment.modeInfo}
                    options={options}
                    styles={{main: overrideClass({marginBottom: '16px'})}}
                    // Make alerts slide up go to the top so hides MxM navigation, avoiding
                    // moving to other segment while alerts view is showing: need to close it
                    // first to see MxM navigation.
                    alertsSlideUpOptions={{modalUp: {top: cardSpacing(landscape), unit: 'px'}, zIndex: 1010}}
                />
            )}
            onRequestClose={onClose}
            styles={{
                main: overrideClass({ height: '100%'})
            }}
            key={segment.id + "b"}
        >
            {segment.shapes &&
            <TKUIServiceSteps
                steps={segment.shapes}
                serviceColor={segment.getColor()}
                timezone={timezone}
            />}
        </TKUICard>
    );
    return cards;
}

function getStreetMxMCard(props: SegmentMxMCardsProps): JSX.Element {
    const {segment, onClose, mapAsync} = props;
    return (
        <TKUICard
            title={segment.getAction()}
            subtitle={segment.to.getDisplayString()}
            renderHeader={props => <TKUIMxMCardHeader segment={segment} {...props}/>}
            onRequestClose={onClose}
            styles={{
                main: overrideClass({ height: '100%'})
            }}
        >
            {segment.streets && segment.streets.map(street => {
                const onStepClick = () => {
                    mapAsync.then((map) =>
                        map.fitBounds(MapUtil.getStreetBounds([street])));
                };
                return <TKUIStreetStep street={street} onClick={onStepClick}/>;
            })}
        </TKUICard>
    );
}

function getSegmentMxMCards(props: SegmentMxMCardsProps): JSX.Element[] {
    const {segment, onClose, refreshSelectedTrip, trip} = props;
    if (segment.isPT()) {
        return getPTSegmentMxMCards(props);
    } else if (segment.isWalking() || segment.isBicycle()) {
        return [getStreetMxMCard(props)]
    } else if (segment.booking && (segment.booking.confirmation || segment.booking.quickBookingsUrl)) {
        return [
            <TKUIMxMBookingCard
                segment={segment}
                onRequestClose={onClose}
                refreshSelectedTrip={refreshSelectedTrip}
                trip={trip}
                key={segment.id}/>
        ];
    } else {
        return ([
            <TKUICard
                title={segment.getAction()}
                subtitle={segment.to.getDisplayString()}
                onRequestClose={onClose}
                renderHeader={props => <TKUIMxMCardHeader segment={segment} {...props}/>}
                styles={{
                    main: overrideClass({ height: '100%'})
                }}
                key={segment.id}
            >
                <div style={{height: '100%'}}/>
            </TKUICard>
        ]);
    }
}

/**
 * Gets the index in the carousel of the first card for the segment.
 */
const cardIndexForSegment = (segment: Segment, segments: Segment[], map: Map<Segment, JSX.Element[]>) =>
    segments.slice(0, segments.indexOf(segment))    // exclude segment since should count up to the previous one.
        .reduce((cardIndex, segment) => cardIndex + map.get(segment)!.length, 0);

/**
 * Maps the card index in the carousel to the associated segment (this is not a one-to-one correspondence given
 * some segments have 2 or more cards, as PT and Collect segments).
 */
const cardIndexToSegment = (cardIndex: number, segments: Segment[], map: Map<Segment, JSX.Element[]>) =>
    cardIndex < map.get(segments[0])!.length ? segments[0] :
        cardIndexToSegment(cardIndex - map.get(segments[0])!.length, segments.slice(1), map);

/**
 * Gets the first segment in segments, from the selected one, that is visible in summary.
 */
const findNextInSummary = (selectedSegment: Segment, segments: Segment[]): Segment =>
    segments.slice(segments.indexOf(selectedSegment))
        .find(segment => segment.hasVisibility(Visibility.IN_SUMMARY))!;

const TKUIMxMView: React.SFC<IProps> = (props: IProps) => {
    const {refreshSelectedTrip, mapAsync, t} = props;
    const trip = props.selectedTrip!;
    const segments = trip.getSegments();
    const segmentsInSummary = trip.getSegments(Visibility.IN_SUMMARY);
    // Evaluate if building the map on each render is too inefficient, and if so store on field and just
    // update if trip changes (including trip alternative).
    const segmentToCards = segments.reduce((map: Map<Segment, JSX.Element[]>, segment: Segment) => {
        map.set(segment, getSegmentMxMCards({
            segment,
            onClose: () => props.setSelectedTripSegment(undefined),
            t,
            options: props.options,
            landscape: props.landscape,
            refreshSelectedTrip,
            mapAsync,
            trip
        }));
        return map;
    }, new Map<Segment, JSX.Element[]>());
    const classes = props.classes;
    const selectedSegment = props.selectedTripSegment!;
    // A not-in-summary segment (e.g. a wait segment) is mapped to the next segment in the trip that is in summary.
    const selectedSegmentInSummary = findNextInSummary(selectedSegment, segments);
    const selectedIndexInSummary = segmentsInSummary.indexOf(selectedSegmentInSummary);
    // Since a segment may have 2 or more cards (e.g. PT or Collect segments), we use this offset to keep track of
    // which of the cards of the segment is currently visible in the cards carousel.
    const [selectedCardOffset, setSelectedCardOffset] = useState<number>(0);
    // Index of selected card in carousel.
    const selectedCardIndex = cardIndexForSegment(selectedSegment, segments, segmentToCards) + selectedCardOffset;
    useEffect(() => {
        props.mapAsync.then(map => {
            if (selectedSegment.isPT() && selectedCardOffset === 1 && selectedSegment.shapes) {
                map.fitBounds(MapUtil.getShapesBounds(selectedSegment.shapes, true));
            } else {
                const zoom = map.getZoom();
                const newZoom = zoom !== undefined && zoom >= 15 ? zoom : 15; // zoom in if zoom < 10.
                map.setViewport(selectedSegment.from, newZoom);
            }
        });
        return () => {
            props.mapAsync.then(map => map.fitBounds(MapUtil.getTripBounds(trip)))
        };
    }, [selectedSegment, selectedCardOffset]);
    return (
        <Fragment>
            <div className={classes.trackIndexPanel}>
                <TKUIMxMIndex
                    segments={segmentsInSummary}
                    value={selectedIndexInSummary}
                    onChange={(value: number) => {
                        props.setSelectedTripSegment(segmentsInSummary[value]);
                        // reset card offset since changed to another in-summary segment.
                        setSelectedCardOffset(0);
                    }}
                />
            </div>
            <TKUICardCarousel
                selected={selectedCardIndex}
                onChange={(selectedCardIndex) => {
                    const segment = cardIndexToSegment(selectedCardIndex, segments, segmentToCards);
                    props.setSelectedTripSegment(segment);
                    setSelectedCardOffset(selectedCardIndex - cardIndexForSegment(segment, segments, segmentToCards));
                }}
                slideUpOptions={{
                    position: props.portrait ? TKUISlideUpPosition.MIDDLE : TKUISlideUpPosition.UP,
                    modalDown: {top: (window as any).document.body.offsetHeight - 200, unit: 'px'},
                    modalUp: {top: MODAL_UP_TOP, unit: 'px'},
                    draggable: false
                }}
                showControls={true}
                parentElement={props.parentElement}
            >
                {segments.reduce((cards, segment) => cards.concat(segmentToCards.get(segment)!), [] as JSX.Element[])}
            </TKUICardCarousel>
        </Fragment>
    );
};

const Mapper: PropsMapper<IClientProps, Subtract<IProps, TKUIWithClasses<IStyle, IProps>>> =
    ({inputProps, children}) =>
        <OptionsContext.Consumer>
            {(optionsContext: IOptionsContext) =>
                <RoutingResultsContext.Consumer>
                    {(routingResultsContext: IRoutingResultsContext) =>
                        <TKUIViewportUtil>
                            {(viewportProps: TKUIViewportUtilProps) => {
                                const {selectedTrip, selectedTripSegment, setSelectedTripSegment, mapAsync, refreshSelectedTrip} = routingResultsContext;
                                return children!({...inputProps, ...viewportProps,
                                    options: optionsContext.userProfile,
                                    selectedTrip,
                                    selectedTripSegment,
                                    setSelectedTripSegment,
                                    refreshSelectedTrip,
                                    mapAsync
                                });
                            }}
                        </TKUIViewportUtil>
                    }
                </RoutingResultsContext.Consumer>
            }
        </OptionsContext.Consumer>;

export default connect((config: TKUIConfig) => config.TKUIMxMView, config, Mapper);