import React, { useState, useEffect, Fragment, useContext } from 'react';
import { overrideClass, TKUIWithClasses, TKUIWithStyle } from "../jss/StyleHelper";
import { tKUIMxMViewDefaultStyle } from "./TKUIMxMView.css";
import { connect, PropsMapper } from "../config/TKConfigHelper";
import { TKComponentDefaultConfig, TKUIConfig } from "../config/TKUIConfig";
import { TKUISlideUpPosition } from "../card/TKUISlideUp";
import TKUICardCarousel from "../card/TKUICardCarousel";
import { TKUIViewportUtil } from "../util/TKUIResponsiveUtil";
import TKUIMxMIndex from "./TKUIMxMIndex";
import Trip from "../model/trip/Trip";
import { Visibility } from "../model/trip/SegmentTemplate";
import Segment from "../model/trip/Segment";
import { RoutingResultsContext } from "../trip-planner/RoutingResultsProvider";
import TKUICard, { CardPresentation } from "../card/TKUICard";
import TKUIServiceSteps from "../trip/TKUIServiceSteps";
import { TranslationFunction } from "../i18n/TKI18nProvider";
import TKUIServiceRealtimeInfo from "../service/TKUIServiceRealtimeInfo";
import TKUserProfile from "../model/options/TKUserProfile";
import { OptionsContext } from "../options/OptionsProvider";
import { cardSpacing, colorWithOpacity } from "../jss/TKUITheme";
import { TKUIMapViewClass } from "../map/TKUIMapView";
import MapUtil from "../util/MapUtil";
import TKUIMxMTimetableCard from "./TKUIMxMTimetableCard";
import TKUIMxMCardHeader from "./TKUIMxMCardHeader";
import TKUIStreetStep from "../trip/TKUIStreetStep";
import DeviceUtil from '../util/DeviceUtil';
import TKUILocationDetail from '../location/TKUILocationDetailView';
import FreeFloatingVehicleLocation from '../model/location/FreeFloatingVehicleLocation';
import Util from '../util/Util';
import { SignInStatus, TKAccountContext } from '../account/TKAccountContext';
import TKUILocationDetailField from '../location/TKUILocationDetailField';
import { ReactComponent as IconWebsite } from "../images/location/ic-website.svg";
import TKUIMxMCollectNearbyCard from './TKUIMxMCollectNearbyCard';
import { TKUIConfigContext } from '../config/TKUIConfigProvider';
import TKUIButton, { TKUIButtonType } from '../buttons/TKUIButton';

interface IClientProps extends IConsumedProps, TKUIWithStyle<IStyle, IProps> {
    /**
     * @ctype
     * @default {@link TKState#userProfile}
     */
    options?: TKUserProfile;

    /**
     * @ignore
     */
    parentElement?: any;

    /**
     * Function that will be run when the view is requested to be closed (either by clicking close button or pressing ESC).
     * @ctype     
     */
    onRequestClose?: () => void;

    onShowVehicleAvailabilityForSegment?: (data: { segment: Segment }) => void;
}

interface IConsumedProps {
    /**
     * @ctype
     * @order 1
     * @tkstateprop {@link TKState#selectedTrip}
     */
    trip: Trip;

    /**
     * @ctype
     * @order 2
     * @tkstateprop {@link TKState#selectedTripSegment}
     */
    selectedTripSegment?: Segment;

    /**
     * @ctype
     * @order 3
     * @tkstateprop {@link TKState#setSelectedTripSegment}
     * @divider
     */
    onTripSegmentSelected: (segment: Segment) => void;

    /**
     * Function to request the real-time refresh of the trip.
     * Just used by booking card, maybe can avoid passing this prop to this component.
     * @ctype
     * @ignore
     */
    refreshSelectedTrip?: () => Promise<boolean>;

    /**
     * Promise resolving to a map reference, used internally to fit segments of the trip (imperatively), 
     * and display segment relevant information (e.g. TKUIMxMCollectNearbyCard).
     * Consider removing map logic from this component, possibly moving it up to TKUITripPlanner, based on selected segment,
     * though this logic depends on info inside TKUIMxMCollectNearbyCard, which should be lifted up to SDK or TKUITripPlannerApp state.
     * @ignore
     */
    mapAsync?: Promise<TKUIMapViewClass>;

    /**
     * Stating if it should be optimized for portrait.
     * 
     * @tkstateprop global state orientation value.
     * @default false
     */
    portrait?: boolean;
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
    onRequestClose?: () => void;
    t: TranslationFunction;
    options?: TKUserProfile;
    landscape: boolean;
    refreshSelectedTrip: () => Promise<boolean>;
    mapAsync?: Promise<TKUIMapViewClass>;
    trip?: Trip;
    accountsSupported?: boolean;
    signInStatus?: SignInStatus;
    isSelectedCard?: () => boolean;
    tkconfig: TKUIConfig;
    onShowVehicleAvailabilityForSegment?: (data: { segment: Segment }) => void;
}

const cardStyles = {
    main: overrideClass({ height: '100%' }),
    divider: {}
}

function getPTSegmentMxMCards(props: SegmentMxMCardsProps, generateCardIndex: () => number): JSX.Element[] {
    const { segment, onRequestClose, t, options, landscape, accountsSupported, signInStatus, refreshSelectedTrip, trip, tkconfig } = props;
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
                    bicycleAccessible={segment.bicycleAccessible ?? undefined}
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
    if (tkconfig.booking && (!tkconfig.booking.enabled || tkconfig.booking.enabled(segment))
        && segment.booking && accountsSupported && tkconfig.booking.renderBookingCard && (segment.booking.confirmation || segment.booking.quickBookingsUrl) &&
        signInStatus === SignInStatus.signedIn) {
        cards.push(tkconfig.booking.renderBookingCard({
            segment, onRequestClose, refreshSelectedTrip, trip, key: generateCardIndex()
        }));
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
                    mapAsync?.then(map =>
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
    const { segment, onRequestClose, refreshSelectedTrip, trip, accountsSupported, mapAsync, tkconfig, onShowVehicleAvailabilityForSegment } = props;
    if (segment.isPT()) {
        return getPTSegmentMxMCards(props, generateCardIndex);
    } else if (tkconfig.booking && tkconfig.booking.renderBookingCard && (!tkconfig.booking.enabled || tkconfig.booking.enabled(segment)) && segment.booking && accountsSupported && (segment.booking.confirmation || segment.booking.quickBookingsUrl)) {
        return [
            tkconfig.booking.renderBookingCard({
                segment, onRequestClose, refreshSelectedTrip, trip, key: generateCardIndex()
            })
        ];
    } else if (segment.modeInfo?.identifier === "stationary_vehicle-collect" && segment.modeIdentifier === "me_car-s_sgfleet-sydney" && segment.sharedVehicle) {
        // Notice car share vehicles (as CND or GoGet) will also be modelled as FreeFloatingVehicleLocation/s , since segment.sharedVehicle
        // matches fields of VehicleInfo, and not CarPodVehicle.
        const freeFloatingVehicleLoc = Util.iAssign(new FreeFloatingVehicleLocation(), segment.location);
        // Need to ammend the local icon since modeInfo doesn't come in segment.location for collect segments. 
        const localIcon = segment.sharedVehicle?.vehicleTypeInfo.vehicleTypeLocalIcon() ?? segment.nextSegment()?.modeInfo?.localIcon
        if (localIcon) {
            freeFloatingVehicleLoc.modeInfo.localIcon = localIcon;
        }
        freeFloatingVehicleLoc.vehicle = segment.sharedVehicle;
        return [
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
                {segment.booking?.externalActions?.[0] &&
                    <TKUIButton
                        text={segment.booking.title}
                        icon={<IconWebsite />}
                        // onClick={() => window.open(segment.booking!.externalActions![0], '_blank')}
                        onClick={() => onShowVehicleAvailabilityForSegment?.({ segment })}
                        styles={{
                            main: overrideClass({
                                margin: '10px 0 0 16px'
                            }),
                            primary: overrideClass({
                                backgroundColor: props => colorWithOpacity(props.theme.colorPrimary, .1),
                                color: props => props.theme.colorPrimary,
                                '&:hover': {
                                    backgroundColor: props => colorWithOpacity(props.theme.colorPrimary, .3)
                                },
                                '&:active': {
                                    backgroundColor: props => colorWithOpacity(props.theme.colorPrimary, .4)
                                }
                            })
                        }}
                    />}
                {/* <TKUIButton
                    text={"Change"}
                    onClick={() => onShowVehicleAvailabilityForSegment?.({ segment })}
                    type={TKUIButtonType.PRIMARY_LINK}
                    styles={{
                        main: overrideClass({
                            margin: '10px 0 0 16px'
                        })
                    }}
                /> */}
                <TKUILocationDetail location={freeFloatingVehicleLoc} actions={() => null} cardProps={{ presentation: CardPresentation.CONTENT }} />
            </TKUICard>
        ];
    } else if (segment.modeInfo?.identifier === "stationary_vehicle-collect" && segment.sharedVehicle) {
        // Notice car share vehicles (as CND or GoGet) will also be modelled as FreeFloatingVehicleLocation/s , since segment.sharedVehicle
        // matches fields of VehicleInfo, and not CarPodVehicle.
        const freeFloatingVehicleLoc = Util.iAssign(new FreeFloatingVehicleLocation(), segment.location);
        // Need to ammend the local icon since modeInfo doesn't come in segment.location for collect segments. 
        const localIcon = segment.sharedVehicle?.vehicleTypeInfo.vehicleTypeLocalIcon() ?? segment.nextSegment()?.modeInfo?.localIcon
        if (localIcon) {
            freeFloatingVehicleLoc.modeInfo.localIcon = localIcon;
        }
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
                {segment.booking?.externalActions?.[0] &&
                    <TKUIButton
                        text={segment.booking.title}
                        icon={<IconWebsite />}
                        onClick={() => window.open(segment.booking!.externalActions![0], '_blank')}
                        styles={{
                            main: overrideClass({
                                margin: '10px 0 0 16px'
                            }),
                            primary: overrideClass({
                                backgroundColor: props => colorWithOpacity(props.theme.colorPrimary, .1),
                                color: props => props.theme.colorPrimary,
                                '&:hover': {
                                    backgroundColor: props => colorWithOpacity(props.theme.colorPrimary, .3)
                                },
                                '&:active': {
                                    backgroundColor: props => colorWithOpacity(props.theme.colorPrimary, .4)
                                }
                            })
                        }}
                    />}
                <TKUILocationDetail location={freeFloatingVehicleLoc} actions={() => null} cardProps={{ presentation: CardPresentation.CONTENT }} />
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
                <TKUILocationDetail location={location} actions={() => null} cardProps={{ presentation: CardPresentation.CONTENT }} />
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

const TKUIMxMView: React.FunctionComponent<IProps> = (props: IProps) => {
    const { trip, selectedTripSegment, refreshSelectedTrip = () => Promise.resolve(true), portrait, mapAsync, onShowVehicleAvailabilityForSegment, t, classes } = props;
    const accountContext = useContext(TKAccountContext);
    const segments = trip.getSegments()
        .filter(segment => !segment.isContinuation);  // Don't display MxM card for continuation segments.
    const segmentsInSummary = trip.getSegments(Visibility.IN_SUMMARY)
        .filter(segment => !segment.isContinuation); // Maybe not necessary as it seems continuation segments are not visible in summary.    
    const selectedSegment = selectedTripSegment ?? segments[0];
    // A not-in-summary segment (e.g. a wait segment) is mapped to the next segment in the trip that is in summary.
    const selectedSegmentInSummary = findNextInSummary(selectedSegment, segments);
    const selectedIndexInSummary = segmentsInSummary.indexOf(selectedSegmentInSummary);

    const tkconfig = useContext(TKUIConfigContext);

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
            onRequestClose: props.onRequestClose,
            t,
            options: props.options,
            landscape: !portrait,
            refreshSelectedTrip,
            mapAsync,
            trip,
            accountsSupported: accountContext.accountsSupported,
            signInStatus: accountContext.status,
            tkconfig,
            onShowVehicleAvailabilityForSegment
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
            props.onTripSegmentSelected(segment);
            setSelectedCardOffset(selectedCardIndex - cardIndexForSegment(segment, segments, segmentToCards));
        }
    };
    useEffect(() => {
        props.mapAsync?.then(map => {
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
            props.mapAsync?.then(map => map.fitBounds(MapUtil.getTripBounds(trip)))
        };
    }, []);
    return (
        <Fragment>
            <div className={classes.trackIndexPanel}>
                <TKUIMxMIndex
                    segments={segmentsInSummary}
                    value={selectedIndexInSummary}
                    onChange={(value: number) => {
                        props.onTripSegmentSelected(segmentsInSummary[value]);
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

const Consumer: React.FunctionComponent<{ children: (props: IConsumedProps) => React.ReactNode }> =
    (props: { children: (props: IConsumedProps) => React.ReactNode }) => {
        const { selectedTrip, selectedTripSegment, setSelectedTripSegment, mapAsync, refreshSelectedTrip } = useContext(RoutingResultsContext);
        if (!selectedTrip) {
            return null;
        }
        return (
            <>
                {props.children!({
                    trip: selectedTrip,
                    selectedTripSegment,
                    onTripSegmentSelected: setSelectedTripSegment,
                    refreshSelectedTrip,
                    mapAsync
                })}
            </>
        );
    };

const Mapper: PropsMapper<IClientProps, IClientProps> =
    ({ inputProps, children }) => {
        const { userProfile } = useContext(OptionsContext);
        return (
            <TKUIViewportUtil>
                {({ portrait }) =>
                    children!({ options: userProfile, portrait, ...inputProps })}
            </TKUIViewportUtil>
        );
    };

export default connect((config: TKUIConfig) => config.TKUIMxMView, config, Mapper);

export const TKUIMxMViewHelpers = {
    TKStateProps: Consumer
}

/**
 * Need to define moveToNext global to the render method, and pass down to the componets an arrow function calling it,
 * to ensure when that arrow function is called the latest version of moveToNext function is called, with the latest
 * context (in particular, the latest version of props.selectedTripSegment). If not doing this, then the moveToNext 
 * is called with an old context (viz., old selected segment - the context gets fixed at the moment the function is 
 * declared and passed) while already displaying the new / updated trip, which causes problems (on next index calculation).
 */
export let moveToNext: () => void;