import React, { useState, useEffect, Fragment, useContext } from 'react';
import { overrideClass, TKUIWithClasses, TKUIWithStyle } from "../jss/StyleHelper";
import { tKUIMxMViewDefaultStyle } from "./TKUIMxMView.css";
import { connect, PropsMapper } from "../config/TKConfigHelper";
import { TKComponentDefaultConfig, TKUIConfig } from "../config/TKUIConfig";
import { TKUISlideUpPosition } from "../card/TKUISlideUp";
import TKUICardCarousel from "../card/TKUICardCarousel";
import { TKUIViewportUtil, TKUIViewportUtilProps } from "../util/TKUIResponsiveUtil";
import { Subtract } from 'utility-types';
import TKUIMxMIndex from "./TKUIMxMIndex";
import Trip from "../model/trip/Trip";
import { Visibility } from "../model/trip/SegmentTemplate";
import Segment from "../model/trip/Segment";
import { IRoutingResultsContext, RoutingResultsContext } from "../trip-planner/RoutingResultsProvider";
import TKUICard from "../card/TKUICard";
import TKUIServiceSteps from "../trip/TKUIServiceSteps";
import { TranslationFunction } from "../i18n/TKI18nProvider";
import TKUIServiceRealtimeInfo from "../service/TKUIServiceRealtimeInfo";
import TKUserProfile from "../model/options/TKUserProfile";
import { IOptionsContext, OptionsContext } from "../options/OptionsProvider";
import { cardSpacing } from "../jss/TKUITheme";
import { TKUIMapViewClass } from "../map/TKUIMapView";
import MapUtil from "../util/MapUtil";
import TKUIMxMTimetableCard from "./TKUIMxMTimetableCard";
import TKUIMxMBookingCard from "./TKUIMxMBookingCard";
import TKUIMxMCardHeader from "./TKUIMxMCardHeader";
import TKUIStreetStep from "../trip/TKUIStreetStep";
import DeviceUtil from '../util/DeviceUtil';
import TKUILocationDetail from '../location/TKUILocationDetail';
import FreeFloatingVehicleLocation from '../model/location/FreeFloatingVehicleLocation';
import Util from '../util/Util';
import { SignInStatus, TKAccountContext } from '../account/TKAccountContext';
import TKUILocationDetailField from '../location/TKUILocationDetailField';
import { ReactComponent as IconWebsite } from "../images/location/ic-website.svg";
import TKUIMxMCollectNearbyCard from './TKUIMxMCollectNearbyCard';

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

interface IProps extends IClientProps, IConsumedProps, TKUIWithClasses<IStyle, IProps> { }

type IStyle = ReturnType<typeof tKUIMxMViewDefaultStyle>

export type TKUIMxMViewProps = IProps;
export type TKUIMxMViewStyle = IStyle;

const config: TKComponentDefaultConfig<IProps, IStyle> = {
    render: props => <TKUIMxMView {...props} />,
    styles: tKUIMxMViewDefaultStyle,
    classNamePrefix: "TKUIMxMView"
};

const MODAL_UP_TOP = 100;

export interface SegmentMxMCardsProps {
    segment: Segment;
    onRequestClose: () => void;
    t: TranslationFunction;
    options: TKUserProfile;
    landscape: boolean;
    refreshSelectedTrip: () => Promise<boolean>;
    mapAsync: Promise<TKUIMapViewClass>;
    trip?: Trip;
    accountsSupported?: boolean;
    signInStatus?: SignInStatus;
    isSelectedCard?: () => boolean;
}

const cardStyles = {
    main: overrideClass({ height: '100%' }),
    divider: {}
}

function getPTSegmentMxMCards(props: SegmentMxMCardsProps, generateCardIndex: () => number): JSX.Element[] {
    const { segment, onRequestClose, t, options, landscape, accountsSupported, signInStatus, refreshSelectedTrip, trip } = props;
    let cards: JSX.Element[] = [];
    cards.push(
        <TKUIMxMTimetableCard segment={segment} onRequestClose={onRequestClose} key={generateCardIndex()} />
    );
    const timezone = segment.from.timezone;
    cards.push(
        <TKUICard
            title={segment.getAction()}
            subtitle={t("Direction") + ": " + segment.serviceDirection}
            renderHeader={props => <TKUIMxMCardHeader segment={segment} {...props} />}
            renderSubHeader={() => (
                <TKUIServiceRealtimeInfo
                    wheelchairAccessible={segment.wheelchairAccessible}
                    vehicle={segment.realtimeVehicle}
                    alerts={segment.hasAlerts ? segment.alerts : undefined}
                    modeInfo={segment.modeInfo}
                    options={options}
                    styles={{ main: overrideClass({ marginBottom: '16px' }) }}
                    // Make alerts slide up go to the top so hides MxM navigation, avoiding
                    // moving to other segment while alerts view is showing: need to close it
                    // first to see MxM navigation.
                    alertsSlideUpOptions={{ modalUp: { top: cardSpacing(landscape), unit: 'px' }, zIndex: 1010 }}
                />
            )}
            onRequestClose={onRequestClose}
            styles={cardStyles}
            key={generateCardIndex()}
            slideUpOptions={{
                showHandle: true
            }}
        >
            {segment.shapes &&
                <TKUIServiceSteps
                    steps={segment.shapes}
                    serviceColor={segment.getColor()}
                    timezone={timezone}
                />}
        </TKUICard>
    );
    if (segment.booking && accountsSupported && (segment.booking.confirmation || segment.booking.quickBookingsUrl) &&
        signInStatus === SignInStatus.signedIn) {
        cards.push(
            <TKUIMxMBookingCard
                segment={segment}
                onRequestClose={onRequestClose}
                refreshSelectedTrip={refreshSelectedTrip}
                trip={trip}
                key={generateCardIndex()}
            />
        );
    }
    return cards;
}

function getStreetMxMCard(props: SegmentMxMCardsProps, generateCardIndex: () => number): JSX.Element {
    const { segment, onRequestClose, mapAsync } = props;
    return (
        <TKUICard
            title={segment.getAction()}
            subtitle={segment.to.getDisplayString()}
            renderHeader={props => <TKUIMxMCardHeader segment={segment} {...props} />}
            onRequestClose={onRequestClose}
            styles={cardStyles}
            key={generateCardIndex()}
            slideUpOptions={{
                showHandle: true
            }}
        >
            {segment.streets && segment.streets.map((street, i) => {
                const onStepClick = () => {
                    mapAsync.then((map) =>
                        map.fitBounds(MapUtil.getStreetBounds([street])));
                };
                return <TKUIStreetStep street={street} onClick={onStepClick} key={i} />;
            })}
        </TKUICard>
    );
}

function getSegmentMxMCards(
    props: SegmentMxMCardsProps,
    generateCardIndex: () => number,
    isSelectedCardBuilder: (cardIndex: number) => () => boolean,
    moveToNext: () => void
): JSX.Element[] {
    const { segment, onRequestClose, refreshSelectedTrip, trip, accountsSupported, mapAsync } = props;
    if (segment.isPT()) {
        return getPTSegmentMxMCards(props, generateCardIndex);
    } else if (segment.booking && accountsSupported && (segment.booking.confirmation || segment.booking.quickBookingsUrl)) {
        return [
            <TKUIMxMBookingCard
                segment={segment}
                onRequestClose={onRequestClose}
                refreshSelectedTrip={refreshSelectedTrip}
                trip={trip}
                key={generateCardIndex()}
            />
        ];
    } else if (segment.modeInfo?.identifier === "stationary_vehicle-collect" && segment.sharedVehicle) {
        // Notice car share vehicles (as CND or GoGet) will also be modelled as FreeFloatingVehicleLocation/s , since segment.sharedVehicle
        // matches fields of VehicleInfo, and not CarPodVehicle.
        const freeFloatingVehicleLoc = Util.iAssign(new FreeFloatingVehicleLocation(), segment.location);
        freeFloatingVehicleLoc.vehicle = segment.sharedVehicle;
        const collectCardIndex = generateCardIndex();
        return [
            <TKUIMxMCollectNearbyCard
                segment={segment}
                onRequestClose={onRequestClose}
                mapAsync={mapAsync}
                key={collectCardIndex}
                isSelectedCard={isSelectedCardBuilder(collectCardIndex)}
                onAlternativeCollected={moveToNext}
            />,
            <TKUICard
                title={segment.getAction()}
                subtitle={segment.to.getDisplayString()}
                onRequestClose={onRequestClose}
                renderHeader={props => <TKUIMxMCardHeader segment={segment} {...props} />}
                styles={cardStyles}
                key={generateCardIndex()}
                slideUpOptions={{
                    showHandle: true
                }}
            >
                <TKUILocationDetail location={freeFloatingVehicleLoc} />
            </TKUICard>
        ];
    } else if (segment.modeInfo?.identifier === "stationary_parking-onstreet") {
        const location = segment.location;
        const collectCardIndex = generateCardIndex();
        return [
            <TKUIMxMCollectNearbyCard
                segment={segment}
                onRequestClose={onRequestClose}
                mapAsync={mapAsync}
                key={collectCardIndex}
                isSelectedCard={isSelectedCardBuilder(collectCardIndex)}
                onAlternativeCollected={moveToNext}
            />,
            <TKUICard
                title={segment.getAction()}
                subtitle={segment.to.getDisplayString()}
                onRequestClose={onRequestClose}
                renderHeader={props => <TKUIMxMCardHeader segment={segment} {...props} />}
                styles={cardStyles}
                key={generateCardIndex()}
                slideUpOptions={{
                    showHandle: true
                }}
            >
                <TKUILocationDetail location={location} />
            </TKUICard>
        ];
    } else if (segment.isWalking() || segment.isBicycle()) {
        return [getStreetMxMCard(props, generateCardIndex)]
    } else {
        const externalActionUrl = segment.booking?.externalActions?.find(action => action.startsWith("https"));
        return ([
            <TKUICard
                title={segment.getAction()}
                subtitle={segment.to.getDisplayString()}
                onRequestClose={onRequestClose}
                renderHeader={props => <TKUIMxMCardHeader segment={segment} {...props} />}
                styles={cardStyles}
                key={generateCardIndex()}
                slideUpOptions={{
                    showHandle: true
                }}
            >
                <div style={{ height: '100%', padding: '20px' }}>
                    {externalActionUrl &&
                        <TKUILocationDetailField
                            title={<a href={externalActionUrl} {...DeviceUtil.isDesktop && { target: "_blank" }}>
                                {segment.booking?.title || "Open app"}
                            </a>}
                            icon={<IconWebsite />}
                            key={"open_app"}
                        />}
                </div>
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
 * Returns undefined if the index suprasses the number of cards (segments[0] is undefined)
 */
const cardIndexToSegment = (cardIndex: number, segments: Segment[], map: Map<Segment, JSX.Element[]>): Segment | undefined =>
    segments[0] &&
    (cardIndex < map.get(segments[0])!.length ? segments[0] :
        cardIndexToSegment(cardIndex - map.get(segments[0])!.length, segments.slice(1), map));

/**
 * Gets the first segment in segments, from the selected one, that is visible in summary.
 */
const findNextInSummary = (selectedSegment: Segment, segments: Segment[]): Segment =>
    segments.slice(segments.indexOf(selectedSegment))
        .find(segment => segment.hasVisibility(Visibility.IN_SUMMARY))!;

/**
 * Need to define moveToNext global to the render method, and pass down to the componets an arrow function calling it,
 * to ensure when that arrow function is called the latest version of moveToNext function is called, with the latest
 * context (in particular, the latest version of props.selectedTripSegment). If not doing this, then the moveToNext 
 * is called with an old context (viz., old selected segment - the context gets fixed at the moment the function is 
 * declared and passed) while already displaying the new / updated trip, which causes problems (on next index calculation).
 */
export let moveToNext: () => void;

const TKUIMxMView: React.FunctionComponent<IProps> = (props: IProps) => {
    const { refreshSelectedTrip, mapAsync, t } = props;
    const accountContext = useContext(TKAccountContext);
    const trip = props.selectedTrip!;
    const segments = trip.getSegments()
        .filter(segment => !segment.isContinuation);  // Don't display MxM card for continuation segments.
    const segmentsInSummary = trip.getSegments(Visibility.IN_SUMMARY)
        .filter(segment => !segment.isContinuation); // Maybe not necessary as it seems continuation segments are not visible in summary.
    const classes = props.classes;
    const selectedSegment = props.selectedTripSegment!;
    // A not-in-summary segment (e.g. a wait segment) is mapped to the next segment in the trip that is in summary.
    const selectedSegmentInSummary = findNextInSummary(selectedSegment, segments);
    const selectedIndexInSummary = segmentsInSummary.indexOf(selectedSegmentInSummary);

    // Call this function to generate the key for each card. Also pass it to the isSelectedCardBuilder to create a
    // isSelectedCard function to pass to cards that need to know when they are selected.
    let cardCount = 0;
    const generateCardIndex = () => {
        const cardIndex = cardCount;
        cardCount++;
        return cardIndex;
    }
    const isSelectedCardBuilder = (cardIndex: number) => () => cardIndex === selectedCardIndex;

    moveToNext = () => onSelectedCardIndex(selectedCardIndex + 1);

    // Evaluate if building the map on each render is too inefficient, and if so store on field and just
    // update if trip changes (including trip alternative).
    const segmentToCards = segments.reduce((map: Map<Segment, JSX.Element[]>, segment: Segment) => {
        map.set(segment, getSegmentMxMCards({
            segment,
            onRequestClose: () => props.setSelectedTripSegment(undefined),
            t,
            options: props.options,
            landscape: props.landscape,
            refreshSelectedTrip,
            mapAsync,
            trip,
            accountsSupported: accountContext.accountsSupported,
            signInStatus: accountContext.status
        }, generateCardIndex, isSelectedCardBuilder, () => moveToNext()));
        return map;
    }, new Map<Segment, JSX.Element[]>());

    // Since a segment may have 2 or more cards (e.g. PT or Collect segments), we use this offset to keep track of
    // which of the cards of the segment is currently visible in the cards carousel.
    const [selectedCardOffset, setSelectedCardOffset] = useState<number>(0);
    // Index of selected card in carousel.
    const selectedCardIndex = cardIndexForSegment(selectedSegment, segments, segmentToCards) + selectedCardOffset;
    const onSelectedCardIndex = (selectedCardIndex: number): void => {
        const segment = cardIndexToSegment(selectedCardIndex, segments, segmentToCards);
        // Segment may come undefined if the passed selected index overflows the cards for the trip,
        // which may happen when trying to select a card after a trip update (the new trip may have less segments)
        if (segment) {
            props.setSelectedTripSegment(segment);
            setSelectedCardOffset(selectedCardIndex - cardIndexForSegment(segment, segments, segmentToCards));
        }
    };
    useEffect(() => {
        props.mapAsync.then(map => {
            if (selectedSegment.isPT() && selectedCardOffset === 1 && selectedSegment.shapes) {
                map.fitBounds(MapUtil.getShapesBounds(selectedSegment.shapes, true));
            } else {
                const zoom = map.getZoom();
                const newZoom = zoom !== undefined && zoom >= 16 ? zoom : 16; // zoom in if zoom < 16.
                map.setViewport(selectedSegment.from, newZoom);
            }
        });
    }, [selectedSegment, selectedCardOffset]);
    useEffect(() => {
        return () => {
            // Return map to fit the trip on unmount
            props.mapAsync.then(map => map.fitBounds(MapUtil.getTripBounds(trip)))
        };
    }, []);
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
                onChange={onSelectedCardIndex}
                slideUpOptions={{
                    ...DeviceUtil.isTouch() ? {
                        initPosition: props.portrait ? TKUISlideUpPosition.MIDDLE : TKUISlideUpPosition.UP
                    } : {
                        position: props.portrait ? TKUISlideUpPosition.MIDDLE : TKUISlideUpPosition.UP,
                    },
                    modalDown: { top: (window as any).document.body.offsetHeight - 200, unit: 'px' },
                    modalUp: { top: MODAL_UP_TOP - (trip.hideExactTimes ? 25 : 0), unit: 'px' },
                    draggable: DeviceUtil.isTouch()
                }}
                swipeable={false}
                showControls={true}
                parentElement={props.parentElement}
                animated={false}
            >
                {segments.reduce((cards, segment) => cards.concat(segmentToCards.get(segment)!), [] as JSX.Element[])}
            </TKUICardCarousel>
        </Fragment>
    );
};

const Mapper: PropsMapper<IClientProps, Subtract<IProps, TKUIWithClasses<IStyle, IProps>>> =
    ({ inputProps, children }) =>
        <OptionsContext.Consumer>
            {(optionsContext: IOptionsContext) =>
                <RoutingResultsContext.Consumer>
                    {(routingResultsContext: IRoutingResultsContext) =>
                        <TKUIViewportUtil>
                            {(viewportProps: TKUIViewportUtilProps) => {
                                const { selectedTrip, selectedTripSegment, setSelectedTripSegment, mapAsync, refreshSelectedTrip } = routingResultsContext;
                                return children!({
                                    ...inputProps, ...viewportProps,
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