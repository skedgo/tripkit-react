import React, { useContext, useEffect, useMemo, useRef, useState } from "react";
import { TKUIWithClasses, TKUIWithStyle } from "../jss/StyleHelper";
import { TKComponentDefaultConfig, TKUIConfig } from "../config/TKUIConfig";
import { PropsMapper, connect } from "../config/TKConfigHelper";
import TKLocationInfo from "../model/location/TKLocationInfo";
import { tKUIVehicleAvailabilityDefaultStyle } from "./TKUIVehicleAvailability.css";
import CarPodLocation from "../model/location/CarPodLocation";
import DateTimeUtil from "../util/DateTimeUtil";
import classNames from "classnames";
import { BookingAvailability, BookingAvailabilityInterval, CarAvailability, CarPodVehicle } from "../model/location/CarPodInfo";
import { ReactComponent as IconStartSlot } from "../images/ic-arrow-start-slot.svg";
import { ReactComponent as IconEndSlot } from "../images/ic-arrow-end-slot.svg";
import { ReactComponent as IconLeftArrow } from "../images/ic-chevron-left.svg";
import { ReactComponent as IconRightArrow } from "../images/ic-chevron-right.svg";
import { ReactComponent as IconCarOption } from "../images/ic-car-option.svg";
import { ReactComponent as IconCalendar } from "../images/ic-calendar-month.svg";
import TKUIDateTimePicker from "../time/TKUIDateTimePicker";
import { RoutingResultsContext } from "../trip-planner/RoutingResultsProvider";
import NetworkUtil from "../util/NetworkUtil";
import TKUIButton, { TKUIButtonType } from "../buttons/TKUIButton";
import { TKUIViewportUtil, TKUIViewportUtilProps } from "../util/TKUIResponsiveUtil";
import { ReactComponent as IconSpin } from '../images/ic-loading2.svg';
import { ScrollSync, ScrollSyncPane } from 'react-scroll-sync';
import DeviceUtil from "../util/DeviceUtil";
import { white } from "../jss/TKUITheme";
import TripGoApi from "../api/TripGoApi";
import RegionsData from "../data/RegionsData";
import Util from "../util/Util";
import Segment from "../model/trip/Segment";
import Trip from "../model/trip/Trip";
import PlannedTripsTracker from "../analytics/PlannedTripsTracker";
import { OptionsContext } from "../options/OptionsProvider";

export interface IClientProps extends TKUIWithStyle<IStyle, IProps>, Partial<Pick<TKUIViewportUtilProps, "portrait">> {
    /**
     * @ctype
     */
    location: CarPodLocation;
    segment?: Segment;
    /**
     * Handler for `Book` button click.
     * @ctype
     */
    onBookClick?: (data: { bookingURL: string, bookingStart: string, bookingEnd: string, vehicleId: string, bookingStartChanged: boolean, trip?: Trip }) => void;
    onUpdateTrip?: (data: { bookingStart: string, bookingEnd: string, vehicleId: string, bookingStartChanged: boolean }) => Promise<Trip | undefined>;
}

type IStyle = ReturnType<typeof tKUIVehicleAvailabilityDefaultStyle>;

interface IProps extends IClientProps, TKUIWithClasses<IStyle, IProps> { }

export type TKUIVehicleAvailabilityProps = IProps;
export type TKUIVehicleAvailabilityStyle = IStyle;

const config: TKComponentDefaultConfig<IProps, IStyle> = {
    render: props => <TKUIVehicleAvailability {...props} />,
    styles: tKUIVehicleAvailabilityDefaultStyle,
    classNamePrefix: "TKUIVehicleAvailability"
};

function getSlots(start: string, end): string[] {
    const slots: string[] = [];
    // for (let slot = start; DateTimeUtil.isoCompare(slot, end) < 0; slot = DateTimeUtil.isoAddMinutes(slot, 30)) {
    for (let slot = start; slot < end; slot = DateTimeUtil.isoAddMinutes(slot, 30)) {   // More efficient comparison (requires iso dates in same timezone)
        slots.push(slot);
    }
    return slots;
}

function betweenTimes(time: string, startTime: string, endTime: string): boolean {
    // return DateTimeUtil.isoToMillis(startTime) <= DateTimeUtil.isoToMillis(time) &&
    //     DateTimeUtil.isoToMillis(time) <= DateTimeUtil.isoToMillis(endTime);    
    return startTime <= time && time <= endTime;    // More efficient comparison (requires iso dates in same timezone)
}

function available(slot: string, vehicleAvailability: BookingAvailability): boolean {
    return vehicleAvailability.intervals.some(interval =>
        // interval.status === "AVAILABLE" && betweenTimes(slot, interval.start, interval.end));
        interval.status === "AVAILABLE" && interval.start <= slot && slot <= interval.end);   // More efficient comparison (requires iso dates in same timezone)
}

function availableRange(startTime: string | undefined, endTime: string | undefined, vehicleAvailability: BookingAvailability): boolean {
    if (!startTime || !endTime) {
        if (startTime) {
            return available(startTime, vehicleAvailability);
        }
        if (endTime) {
            return available(endTime, vehicleAvailability);
        }
        return true;
    }

    if (startTime > endTime) {
        return false;
    }
    // for (let slot = startTime; DateTimeUtil.isoCompare(slot, endTime) <= 0; slot = DateTimeUtil.isoAddMinutes(slot, 30)) {
    for (let slot = startTime; slot <= endTime; slot = DateTimeUtil.isoAddMinutes(slot, 30)) {  // More efficient comparison (requires iso dates in same timezone)
        if (!available(slot, vehicleAvailability)) {
            return false;
        }
    }
    return true;
}

function getClickableSlots(slots: string[], selectedVehicle: CarAvailability, bookStartTime?: string, bookEndTime?: string): { clickableSlots: string[], previewStartSlots: string[], previewEndSlots: string[] } {
    const vehicleAvailabilityIntervals = selectedVehicle.availability!.intervals;
    const matchingIntervals = vehicleAvailabilityIntervals.filter(interval => interval.status === "AVAILABLE" &&
        (!bookStartTime || interval.start <= bookStartTime) && (!bookEndTime || bookEndTime <= interval.end));
    const clickableSlots = new Array(slots.length).fill(false);
    const previewStartSlots = new Array(slots.length).fill(false);
    const previewEndSlots = new Array(slots.length).fill(false);
    for (let i = 0; i < slots.length; i++) {
        const slot = slots[i];
        const clickable = matchingIntervals.some(interval =>
            interval.start <= slot && slot <= interval.end);   // More efficient comparison (requires iso dates in same timezone)
        clickableSlots[i] = clickable;
        previewStartSlots[i] = clickable && (bookStartTime ? slot < bookStartTime : bookEndTime ? slot < bookEndTime : true);
        previewEndSlots[i] = clickable && (bookEndTime ? slot > bookEndTime : bookStartTime ? slot > bookStartTime : false);
    }
    return { clickableSlots, previewStartSlots, previewEndSlots };
}

function mergeIntervals(intervals1: BookingAvailabilityInterval[], intervals2: BookingAvailabilityInterval[]): BookingAvailabilityInterval[] {
    if (intervals1.length === 0) {
        return intervals2;
    } else if (intervals2.length === 0) {
        return intervals1;
    }
    const lastInterval1 = intervals1[intervals1.length - 1];
    const firstInterval2 = intervals2[0];
    const unionInterval = lastInterval1.status === firstInterval2.status && DateTimeUtil.isoAddMinutes(lastInterval1.end, 2) >= firstInterval2.start ?
        {
            status: lastInterval1.status,
            start: lastInterval1.start,
            end: lastInterval1.end > firstInterval2.end ? lastInterval1.end : firstInterval2.end
        } : undefined;
    return unionInterval ? intervals1.slice(0, -1).concat([unionInterval]).concat(intervals2.slice(1)) : intervals1.concat(intervals2);
}

const SCROLL_X_PANEL_ID = "scroll-x-panel";

const TKUIVehicleAvailability: React.FunctionComponent<IProps> = (props: IProps) => {
    const { region } = useContext(RoutingResultsContext);
    const { userProfile } = useContext(OptionsContext);
    const onBookClickDefault = ({ bookingURL, vehicleId, bookingStart, bookingEnd, trip }) => {
        const bookingUrlWithTimes = bookingURL
            .replace("<start_time>", bookingStart)
            .replace("<end_time>", bookingEnd)
            .concat(trip ? "&trip_id=" + trip.id : "");
        window.open(bookingUrlWithTimes, '_blank');
    }
    const { location, segment, onBookClick = onBookClickDefault, onUpdateTrip, portrait, t, classes, theme } = props;
    const SLOT_WIDTH = portrait ? 80 : 32;
    const SLOT_HEIGHT = portrait ? 40 : 24;
    const VEHICLE_LABEL_WIDTH = 200;
    const SCROLL_HORIZONT_WIDTH = portrait ? 20 : 32;
    const rideSegment = segment?.nextSegment();
    const initBookStartTime = rideSegment?.startTime && DateTimeUtil.toIsoJustTime(rideSegment?.startTime, 30 * 60 * 1000)
    const initBookEndTime = rideSegment?.endTime && DateTimeUtil.toIsoJustTime(rideSegment?.endTime, 30 * 60 * 1000, { direction: "ceil" })
    const initDisplayStartTime = rideSegment?.startTime && DateTimeUtil.toIsoJustDate(rideSegment?.startTime);
    const [displayStartTime, setDisplayStartTime] = useState<string>(initDisplayStartTime ?? DateTimeUtil.toJustDate(DateTimeUtil.getNow(region?.timezone)).format());
    // const [displayStartTime, setDisplayStartTime] = useState<string>("2023-07-19T00:00:00+10:00");
    const [displayEndTime, setDisplayEndTime] = useState<string>(DateTimeUtil.isoAddMinutes(displayStartTime, 24 * 60 - 1));
    const [displayDate, setDisplayDate] = useState<string>(DateTimeUtil.toIsoJustDate(displayStartTime));
    const [selectedVehicle, setSelectedVehicle] = useState<CarPodVehicle | undefined>();
    const [bookStartTime, setBookStartTime] = useState<string | undefined>(initBookStartTime);
    const [bookEndTime, setBookEndTime] = useState<string | undefined>(initBookEndTime);
    const slots = useMemo(() => getSlots(displayStartTime, displayEndTime), [displayStartTime, displayEndTime]);

    /**
     * undefined: not requested
     * null: waiting for response
     * Availability is requested with day granularity
     */
    const [vehicleAvailabilitiesByDate, setVehicleAvailabilitiesByDate] = useState<Map<string, CarAvailability[] | null>>(new Map());
    const vehicleAvailabilities = useMemo(() => getMergedVehicles(), [vehicleAvailabilitiesByDate]);
    const loadingVehicles = vehicleAvailabilities.length === 0 && Array.from(vehicleAvailabilitiesByDate.values()).some(value => value === null);
    const noVehicles = vehicleAvailabilities.length === 0 && !Array.from(vehicleAvailabilitiesByDate.values()).some(value => value === null);
    const { clickableSlots = [], previewStartSlots = [], previewEndSlots = [] } = useMemo<{ clickableSlots?: boolean[], previewStartSlots?: boolean[], previewEndSlots?: boolean[] }>(() => {
        if (!selectedVehicle) {
            return {};
        }
        const selectedVehicleAvailability = vehicleAvailabilities.find(av => av.car === selectedVehicle);
        return selectedVehicleAvailability ? getClickableSlots(slots, selectedVehicleAvailability, bookStartTime, bookEndTime) : {};
    }, [selectedVehicle, bookStartTime, bookEndTime, vehicleAvailabilities]);

    function getMergedVehicles(): CarAvailability[] {
        // This shouldn't happen, we should always have data for displayStartTime(?)
        if (!vehicleAvailabilitiesByDate.get(displayStartTime)) {
            return [];
        }
        let result: CarAvailability[] | undefined;
        for (let date = displayStartTime; DateTimeUtil.isoCompare(date, displayEndTime) <= 0; date = DateTimeUtil.isoAddMinutes(date, 24 * 60)) {
            const dateAvailabilities = vehicleAvailabilitiesByDate.get(date)
                ?.map(a => Util.clone(a));  // Clone (shallow copy) of availabilities, to avoid changing intervals arrays in the originals
            if (!result) {  // The first availability, which determines the vehicles to be displayed.
                result = [...dateAvailabilities!];
            } else if (dateAvailabilities) {
                result.forEach(availability => {
                    const dateAvailability = dateAvailabilities.find(a => a.car.identifier === availability.car.identifier);
                    // availability.availability!.intervals = availability.availability!.intervals.concat(dateAvailability?.availability?.intervals ?? []);
                    // Need to merge intervals so getClickableSlots works correctly.
                    availability.availability!.intervals = mergeIntervals(availability.availability!.intervals, dateAvailability?.availability?.intervals ?? []);
                })
            }
        }
        return result ?? [];
    }

    function slotClickHelper(slot: string, slotVehicle: CarAvailability): { clickable: boolean, startUpdate?: string | null, endUpdate?: string | null } {
        if (selectedVehicle && selectedVehicle !== slotVehicle.car ||
            !available(slot, slotVehicle.availability!)) { // slot not available
            return { clickable: false };
        }
        if (slot === bookStartTime) {
            return { clickable: true, startUpdate: null };
        }
        if (slot === bookEndTime) {
            return { clickable: true, endUpdate: null };
        }
        // const isStart = !bookStartTime && (!bookEndTime || DateTimeUtil.isoCompare(slot, bookEndTime) < 0)
        //     || bookStartTime && DateTimeUtil.isoCompare(slot, bookStartTime) < 0;
        const isStart = !bookStartTime && (!bookEndTime || slot < bookEndTime)  // More efficient comparison (requires iso dates in same timezone)
            || bookStartTime && slot < bookStartTime;
        // const isEnd = !isStart && (!bookEndTime || DateTimeUtil.isoCompare(slot, bookEndTime) > 0);
        const isEnd = !isStart && (!bookEndTime || slot > bookEndTime);
        const resultingRangeStart = isStart ? slot : bookStartTime;
        const resultingRangeEnd = isEnd ? slot : bookEndTime;
        if (resultingRangeStart && resultingRangeEnd && !availableRange(resultingRangeStart, resultingRangeEnd, slotVehicle.availability!)) {
            return { clickable: false };
        }
        if (isStart) {
            return { clickable: true, startUpdate: slot };
        }
        if (isEnd) {
            return { clickable: true, endUpdate: slot };
        }
        return { clickable: false }
    }

    function onSlotClick(slot: string, slotVehicle: CarAvailability) {
        const { clickable, startUpdate, endUpdate } = slotClickHelper(slot, slotVehicle)
        if (!clickable) {
            return;
        }

        if (!selectedVehicle) {
            setSelectedVehicle(slotVehicle.car);
        }

        if (startUpdate !== undefined) {
            setBookStartTime(startUpdate ?? undefined);
            return;
        }

        if (endUpdate !== undefined) {
            setBookEndTime(endUpdate ?? undefined);
            return;
        }
    }

    function selectedSlot(slot, vehicle: CarAvailability, preview: boolean = false): boolean {
        if (vehicle.car !== selectedVehicle && !preview) {
            return false;
        }
        return bookStartTime === slot || bookEndTime === slot ||
            // (!!bookStartTime && !!bookEndTime && betweenTimes(slot, bookStartTime, bookEndTime));
            (!!bookStartTime && !!bookEndTime && bookStartTime < slot && slot < bookEndTime);   // More efficient comparison (requires iso dates in same timezone)
    }

    function onPrevNext(prev: boolean) {
        if (!scrollXRef.current) {
            return;
        }
        scrollXRef.current.scrollLeft += prev ? -SLOT_WIDTH : SLOT_WIDTH;
    }

    function setScrollLeftToTime(time: string) {
        if (!scrollXRef.current) {
            return;
        }
        const slotIndex = slots.indexOf(DateTimeUtil.isoAddMinutes(time, 0)); // Improve this. Call isoAddMinutes to ensure the same format (it has no millis)        
        if (slotIndex === -1) {
            return;
        }
        scrollXRef.current.scrollLeft = slotIndex * SLOT_WIDTH;
    }

    const setScrollLeftToTimeRef = useRef<(time: string) => void>(setScrollLeftToTime);

    setScrollLeftToTimeRef.current = setScrollLeftToTime;

    function getTimeFromScrollLeft(scrollLeft: number): string {
        return DateTimeUtil.isoAddMinutes(displayStartTime, Math.floor(scrollLeft / SLOT_WIDTH) * 30);
    }

    useEffect(() => {
        // Effect called the first time vehicles arrive.
        const availabilities = vehicleAvailabilitiesByDate.get(displayStartTime);
        // Move scroll to 8am by default on display start date change.
        if (availabilities) {
            if (initBookStartTime) {    // segment was provided
                setScrollLeftToTime(initBookStartTime);
            } else {
                setScrollLeftToTime(DateTimeUtil.isoAddMinutes(displayStartTime, 8 * 60));
            }
        }
        if (availabilities && segment?.sharedVehicle?.identifier) {
            // TODO: Fix ids mismatch. BE returns the external id in av.car.identifier, and an internal id `id me_car-s_sgfleet-sydney|AU_NSW_Sydney|${externalId}` in segment.sharedVehicle.identifier
            const initSelectedVehicle = availabilities
                .find(av => av.car.identifier === segment!.sharedVehicle!.identifier)?.car;
            if (initSelectedVehicle) {
                setSelectedVehicle(initSelectedVehicle);
            }
        }
    }, [vehicleAvailabilitiesByDate.get(displayStartTime)]);

    useEffect(() => {
        coverDisplayRange();
    }, [displayStartTime, displayEndTime]);

    function onRequestMore() {
        setDisplayEndTime(DateTimeUtil.isoAddMinutes(displayEndTime, 24 * 60));
    }

    async function coverDisplayRange() {
        let requestDates: string[] = [];
        for (let date = displayStartTime; DateTimeUtil.isoCompare(date, displayEndTime) <= 0; date = DateTimeUtil.isoAddMinutes(date, 24 * 60)) {
            if (vehicleAvailabilitiesByDate.get(date) === undefined) {
                requestDates.push(date);
            }
        }
        if (requestDates.length === 0) {
            return;
        }
        setVehicleAvailabilitiesByDate(vehicleAByDate => {   // TODO: replace by just 1 setVehiclesByDate by moving the `for` inside it.
            const vehiclesByDateUpdate = new Map(vehicleAByDate);
            requestDates.forEach(date => vehiclesByDateUpdate.set(date, null));
            return vehiclesByDateUpdate;
        });
        await RegionsData.instance.requireRegions();
        const region = RegionsData.instance.getRegion(location);
        const regionCode = region?.name;
        // Merge consecutive days into (multi-days) intervals to optimize requests.
        const requestDateGroups = requestDates.reduce((groups, date) => {
            const lastGroup = groups[groups.length - 1];
            const lastGroupDate = lastGroup?.[lastGroup.length - 1];
            if (lastGroupDate && DateTimeUtil.isoSameTime(DateTimeUtil.isoAddMinutes(lastGroupDate, 24 * 60), date)) {
                lastGroup.push(date);
            } else {
                groups.push([date]);
            }
            return groups;
        }, [] as string[][]);
        requestDateGroups.forEach(async dateGroup => {
            const dateGStart = dateGroup[0];
            const dateGEnd = DateTimeUtil.isoAddMinutes(dateGroup[dateGroup.length - 1], 24 * 60 - 1);
            try {
                // const locationInfo = await NetworkUtil.delayPromise<CarPodLocation>(1000)(Util.deserialize(require(`../mock/data/locationInfo-carPod-sgfleet-${date.substring(0, 10)}.json`), CarPodLocation));                
                const locationInfo = await TripGoApi.apiCallT(`locationInfo.json?identifier=${location.id}&start=${encodeURIComponent(dateGStart)}&region=${regionCode}&end=${encodeURIComponent(dateGEnd)}`, NetworkUtil.MethodType.GET, TKLocationInfo)
                setVehicleAvailabilitiesByDate(availabilitiesAByDate => {
                    const availabilitiesByDateUpdate = new Map(availabilitiesAByDate);
                    dateGroup.forEach(date => {
                        if (availabilitiesAByDate.get(date) !== null) {
                            return;
                        }
                        if (!locationInfo.carPod) {
                            return;
                        }
                        const podAvailabilities = (locationInfo.carPod!.availabilities ?? []);
                        // Convert iso dates in intervals to region timezone, since needs this for efficient date campares.
                        podAvailabilities.forEach((availabilty: CarAvailability) => {
                            availabilty.availability?.intervals.forEach(interval => {
                                interval.start = DateTimeUtil.isoFromMillis(DateTimeUtil.isoToMillis(interval.start), region?.timezone);
                                interval.end = DateTimeUtil.isoFromMillis(DateTimeUtil.isoToMillis(interval.end), region?.timezone);
                            });
                        });
                        const nearPodsAvailabilities = locationInfo.carPod!.nearbyPods
                            ?.reduce((acc, nearbyPod) => {
                                acc.push(...nearbyPod.carPod.availabilities ?? []);
                                return acc;
                            }, [] as CarAvailability[]) ?? [];
                        const allVehicles = podAvailabilities.concat(nearPodsAvailabilities);
                        allVehicles.forEach(availabilty => {
                            if (!availabilty.availability) {
                                availabilty.availability = {  // Workaround for when availability doesn't come I assume available in all the range (e.g. GoGet)
                                    timestamp: DateTimeUtil.getNow().format(),
                                    intervals: [{
                                        "status": "AVAILABLE",
                                        "start": dateGStart,
                                        "end": dateGEnd
                                    }]
                                };
                            }
                            if (!availabilty.bookingURL) {  // Workaround for when booking URL comes empty.
                                availabilty.bookingURL = availabilty.car.operator?.website
                            }
                        })
                        availabilitiesByDateUpdate.set(date, allVehicles);
                    })
                    return availabilitiesByDateUpdate;
                });
            } catch (e) {
                setVehicleAvailabilitiesByDate(availabilitiesByDate => {
                    const availabilitiesByDateUpdate = new Map(availabilitiesByDate);
                    dateGroup.forEach(date => {
                        availabilitiesByDateUpdate.set(date, []);
                    });
                    return availabilitiesByDateUpdate;
                });
            }
        })
    }

    function isFetching(slot): boolean {
        return vehicleAvailabilitiesByDate.get(DateTimeUtil.toIsoJustDateEfficient(slot)) === null;
    }

    function onClearClick() {
        setSelectedVehicle(undefined);
        setBookStartTime(undefined);
        setBookEndTime(undefined);
    }

    // Need to do this, instead of passing scrollRef to div's ref prop, since ScrollSyncPane seems to override it.
    const scrollXRef = useRef<HTMLDivElement>();
    useEffect(() => {
        scrollXRef.current = document.getElementById(SCROLL_X_PANEL_ID) as any ?? null;
    })
    const scrollYRef = useRef<HTMLDivElement>(null);
    const [scrollSync, setScrollSync] = useState<boolean>(false);
    const buttonsRef = useRef<HTMLDivElement>(null);

    const header =
        <div
            className={classes.header}
            style={{
                ...portrait && { position: 'relative' },
                ...!portrait && { width: SLOT_WIDTH * slots.length + VEHICLE_LABEL_WIDTH + SCROLL_HORIZONT_WIDTH },
                paddingLeft: VEHICLE_LABEL_WIDTH + SCROLL_HORIZONT_WIDTH
            }}
        >
            <div className={classes.vehicleLabel} style={{ width: VEHICLE_LABEL_WIDTH, zIndex: 2, height: '60px' }}>
                <div className={classes.datePicker}>
                    <TKUIDateTimePicker
                        value={DateTimeUtil.momentFromIsoWithTimezone(displayDate)}
                        timeZone={region?.timezone}
                        onChange={date => {
                            // Next if just makes sense for iOS, where minDate property does not take effect (consider putting this logic inside TKUIDateTimePicker).
                            if (bookStartTime && DateTimeUtil.isoCompare(date.format(), bookStartTime) < 0) {
                                return;
                            }
                            if (!selectedVehicle) {
                                setDisplayStartTime(date.format());
                                setDisplayEndTime(DateTimeUtil.isoAddMinutes(date.format(), 24 * 60 - 1));
                                setDisplayDate(DateTimeUtil.toIsoJustDate(date.format()));
                                setVehicleAvailabilitiesByDate(new Map());
                            } else {
                                setDisplayEndTime(DateTimeUtil.isoAddMinutes(date.format(), 24 * 60 - 1));
                                setTimeout(() => {
                                    setScrollLeftToTimeRef.current(DateTimeUtil.isoAddMinutes(date.format(), 8 * 60));
                                }, 100);
                            }
                        }}
                        shouldCloseOnSelect={true}
                        renderCustomInput={DeviceUtil.isAndroid ? undefined :
                            (_value, onClick, onKeyDown, ref) =>
                                <button {...{ onClick, onKeyDown, ref }} className={classes.datePickerInput}>
                                    <IconCalendar />
                                    {/* value comes without timezone, so use displayDate */}
                                    {DateTimeUtil.formatRelativeDay(DateTimeUtil.momentFromIsoWithTimezone(displayDate), "ddd D", { justToday: true })}
                                </button>}
                        minDate={bookStartTime ? DateTimeUtil.momentFromIsoWithTimezone(bookStartTime) : undefined}
                        showTimeInput={false}
                    />
                </div>
            </div>
            {!portrait &&   // Hide arrows on portrait since they are confusing: can be interpreated as navigating through days, instead of time slots. Warn: portrait + no touch require the user to explicitly scroll with the mouse.
                <button className={classes.arrowBtn} style={{ width: 40, ...portrait ? { right: 40 } : { left: VEHICLE_LABEL_WIDTH } }} disabled={false} onClick={() => onPrevNext(true)}>
                    <div className={classes.arrowLeftIconContainer}>
                        <IconLeftArrow />
                    </div>
                    <div className={classes.whiteToTransparent} style={{ width: 14, height: '100%' }} />
                </button>}
            <div className={classes.timeIndexes}>
                {!portrait && slots.filter((_slot, i) => i % 2 === 0).map((slot, i) => {
                    const isDayStart = slot === DateTimeUtil.toIsoJustDateEfficient(slot);
                    return (
                        <div style={{ width: SLOT_WIDTH * 2 }} className={classes.timeIndex} key={slot}>
                            {isDayStart && <div className={classes.dayIndex}>{DateTimeUtil.formatRelativeDay(DateTimeUtil.momentFromIsoWithTimezone(slot), "ddd D", { justToday: true })}</div>}
                            {DateTimeUtil.isoFormat(slot, "ha")}
                        </div>
                    );
                }
                )}
            </div>
            {!portrait &&
                <button className={classes.arrowBtn} style={{ width: 40, right: 0 }} disabled={false} onClick={() => onPrevNext(false)}>
                    <div className={classes.transparentToWhite} style={{ width: 14, height: '100%' }} />
                    <div className={classes.arrowRightIconContainer}>
                        <IconRightArrow />
                    </div>
                </button>}
        </div>;

    return (
        <ScrollSync>
            <div className={classes.main}>
                {portrait ? header :
                    scrollSync &&
                    <ScrollSyncPane>
                        <div className={classes.scrollXPanel} style={{ paddingLeft: 0, paddingRight: SLOT_WIDTH, flexShrink: 0 }}>
                            {header}
                        </div>
                    </ScrollSyncPane>}
                <div
                    ref={scrollYRef}
                    className={classes.scrollYPanel}
                    onScroll={e => {
                        // Return if event was triggered by an inner scrollable panel (horizontal scroll panel)
                        if (scrollYRef.current !== e.target) {
                            return;
                        }
                        // Need scroll sync if there's vertical scroll.
                        const needScrollSync = ((e.target as any)?.scrollTop ?? 0) > 0;
                        if (scrollSync !== needScrollSync) {
                            setScrollSync(needScrollSync);
                        }
                    }}
                >
                    <ScrollSyncPane>
                        <div
                            className={classNames(classes.vehicles, classes.scrollXPanel)}
                            style={{ paddingRight: SLOT_WIDTH }}
                            id={SCROLL_X_PANEL_ID}
                            onScroll={e => {
                                const scrollElem = e.target as any;
                                // Don't allow negative values, which happen on mobile since the scroll limit is a bit elastic, causing
                                // a change to the previous day and then return.
                                const leftSlot = getTimeFromScrollLeft(Math.max(scrollElem.scrollLeft, 0));
                                if (!DateTimeUtil.isoSameTime(displayDate, DateTimeUtil.toIsoJustDate(leftSlot))) {
                                    setDisplayDate(DateTimeUtil.toIsoJustDate(leftSlot));
                                }
                                if (scrollElem.scrollLeft + scrollElem.clientWidth > scrollElem.scrollWidth - 30) {
                                    onRequestMore();
                                }
                            }}
                        >
                            {!portrait && !scrollSync && header}
                            {vehicleAvailabilities?.map((availability, i) => {
                                const vehicle = availability.car;
                                const isVehicleAvailableInRange = availableRange(bookStartTime, bookEndTime, availability.availability!);
                                const displayEndTimeMinus30 = DateTimeUtil.isoAddMinutes(displayEndTime, -30);
                                return (
                                    <div className={classNames(classes.vehicle,
                                        !isVehicleAvailableInRange ? classes.fadeVehicle : vehicle !== selectedVehicle && classes.availableVehicle,
                                        selectedVehicle && vehicle !== selectedVehicle && classes.unselectedVehicle,
                                    )}
                                        onClick={() => {
                                            vehicle !== selectedVehicle && isVehicleAvailableInRange && setSelectedVehicle(availability.car)
                                        }}
                                        style={{
                                            ...portrait ? { paddingLeft: 15, paddingTop: 65 } : { paddingLeft: VEHICLE_LABEL_WIDTH + SCROLL_HORIZONT_WIDTH },
                                            ...vehicle === selectedVehicle && { paddingBottom: SLOT_HEIGHT + 50 },
                                            width: SLOT_WIDTH * slots.length + (!portrait ? VEHICLE_LABEL_WIDTH + SCROLL_HORIZONT_WIDTH : 0)
                                        }}
                                        key={availability.car.identifier}
                                    >
                                        <div className={classes.vehicleLabel} style={{ ...portrait ? { transform: 'translateY(-55px)' } : { width: VEHICLE_LABEL_WIDTH } }}>
                                            <div className={classes.vehicleIcon}>
                                                <IconCarOption />
                                            </div>
                                            <div className={classes.vehicleName}>
                                                {availability.car.name}
                                            </div>
                                        </div>
                                        <div style={{ position: 'absolute', zIndex: 1, width: SCROLL_HORIZONT_WIDTH / 2, height: '54px', background: white(0, theme.isDark), left: portrait ? 0 : VEHICLE_LABEL_WIDTH }} />
                                        <div className={classes.whiteToTransparent} style={{ position: 'absolute', zIndex: 1, width: SCROLL_HORIZONT_WIDTH / 2, height: '54px', left: portrait ? SCROLL_HORIZONT_WIDTH / 2 : VEHICLE_LABEL_WIDTH + SCROLL_HORIZONT_WIDTH / 2 }} />
                                        <div className={classes.slots}>
                                            {slots.map((slot, i) => {
                                                const isDayStart = slot === DateTimeUtil.toIsoJustDateEfficient(slot);
                                                const isSelectedVehicle = vehicle === selectedVehicle;
                                                // const { clickable, startUpdate, endUpdate } = isSelectedVehicle ? slotClickHelper(slot, availability) : { clickable: false, startUpdate: undefined, endUpdate: undefined };
                                                const { clickable, startUpdate, endUpdate } = isSelectedVehicle ? { clickable: clickableSlots[i], startUpdate: previewStartSlots[i], endUpdate: previewEndSlots[i] } : { clickable: false, startUpdate: undefined, endUpdate: undefined }; // More efficient comparison (requires iso dates in same timezone)
                                                const isStartPreview = !!startUpdate;
                                                const isEndPreview = !!endUpdate;
                                                return (
                                                    <div className={classes.slot}
                                                        style={{ width: SLOT_WIDTH, height: SLOT_HEIGHT, ...portrait && { position: 'relative' } }}
                                                        onClick={() => onSlotClick(slot, availability)}
                                                        key={slot}
                                                    >
                                                        {selectedSlot(slot, availability, !!bookStartTime && !!bookEndTime && isVehicleAvailableInRange) ?
                                                            <div className={classNames(classes.selectedSlot, slot === bookStartTime && classes.firstSelectedSlot, ((!bookEndTime && slot === bookStartTime) || slot === bookEndTime) && classes.lastSelectedSlot)}>
                                                                {slot === bookStartTime ? <IconStartSlot /> : slot === bookEndTime ? <IconEndSlot /> : undefined}
                                                            </div>
                                                            :
                                                            <div className={classNames(
                                                                isFetching(slot) ? classes.loadingSlot : available(slot, availability.availability!) ? classes.availableSlot : classes.unavailableSlot,
                                                                slot === displayStartTime && classes.firstSlot,
                                                                slot === displayEndTimeMinus30 && classes.lastSlot, // More efficient comparison (requires iso dates in same timezone)
                                                                vehicle === selectedVehicle && !clickable && classes.fadeSlot,
                                                                isStartPreview && classes.startPreview,
                                                                isEndPreview && classes.endPreview
                                                            )}>
                                                                {portrait && (!selectedVehicle || vehicle === selectedVehicle) && <div className={classes.slotTime}>{DateTimeUtil.isoFormat(slot, "h:mma")}</div>}
                                                                {isStartPreview ? <IconStartSlot /> : isEndPreview ? <IconEndSlot /> : undefined}
                                                            </div>}
                                                        {portrait && isDayStart && <div className={classes.dayIndexPortrait}>{DateTimeUtil.formatRelativeDay(DateTimeUtil.momentFromIsoWithTimezone(slot), "ddd D", { justToday: true })}</div>}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                        {vehicle === selectedVehicle &&
                                            <div className={classes.selectionPanel} style={{ padding: `0 ${portrait ? 20 : 30}px 0 ${portrait ? 20 : VEHICLE_LABEL_WIDTH + SCROLL_HORIZONT_WIDTH}px`, transform: `translateY(${SLOT_HEIGHT + 25}px)` }}>
                                                <div className={classes.fromTo}>
                                                    <div>From</div>
                                                    <div className={!bookStartTime ? classes.placeholder : undefined}>
                                                        {bookStartTime ? DateTimeUtil.isoFormatRelativeDay(bookStartTime, "h:mma ddd D", { justToday: true, partialReplace: "ddd D" }) : "Select start time"}
                                                    </div>
                                                </div>
                                                <div className={classes.fromTo}>
                                                    <div>To</div>
                                                    <div className={!bookEndTime ? classes.placeholder : undefined}>
                                                        {bookEndTime ? DateTimeUtil.isoFormatRelativeDay(DateTimeUtil.isoAddMinutes(bookEndTime, 30), "h:mma ddd D", { justToday: true, partialReplace: "ddd D" }) : "Select end time"}
                                                    </div>
                                                </div>
                                                <div className={classes.buttons} ref={buttonsRef}>
                                                    <TKUIButton text={"Clear"} type={TKUIButtonType.PRIMARY_LINK} onClick={onClearClick} />
                                                    <TKUIButton
                                                        text={"Book"}
                                                        type={TKUIButtonType.PRIMARY}
                                                        disabled={bookStartTime === undefined || bookEndTime === undefined}
                                                        onClick={async () => {
                                                            const selectedAvailability: CarAvailability = vehicleAvailabilities.find(va => va.car === selectedVehicle)!;
                                                            const updatedTrip = onUpdateTrip ? await onUpdateTrip({ bookingStart: bookStartTime!, bookingEnd: DateTimeUtil.isoAddMinutes(bookEndTime!, 30)!, vehicleId: selectedVehicle!.identifier, bookingStartChanged: bookStartTime !== initBookStartTime }) : undefined;
                                                            onBookClick({ bookingURL: selectedAvailability.bookingURL!, bookingStart: bookStartTime!, bookingEnd: DateTimeUtil.isoAddMinutes(bookEndTime!, 30)!, vehicleId: selectedVehicle!.identifier, bookingStartChanged: bookStartTime !== initBookStartTime, trip: updatedTrip })
                                                            if (updatedTrip) {
                                                                PlannedTripsTracker.instance.track(!userProfile.trackTripSelections);
                                                            }
                                                        }}
                                                    />
                                                </div>
                                            </div>}
                                        <div className={classes.transparentToWhite} style={{ width: SCROLL_HORIZONT_WIDTH / 2, height: '54px', right: SCROLL_HORIZONT_WIDTH / 2, position: 'absolute' }} />
                                        <div style={{ width: SCROLL_HORIZONT_WIDTH / 2, height: '54px', right: 0, position: 'absolute', background: white(0, theme.isDark) }} />
                                    </div>
                                );
                            })}
                        </div>
                    </ScrollSyncPane>
                    <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'center' }}>
                        {loadingVehicles && <IconSpin className={classes.iconLoading} focusable="false" role="status" aria-label="Waiting results" />}
                        {noVehicles && <div className={classes.noVehicles}>No vehicles</div>}
                    </div>
                </div>
                {onUpdateTrip &&
                    <div className={classes.buttonsPanel}>
                        <TKUIButton
                            text={"Update trip"}
                            type={TKUIButtonType.PRIMARY}
                            disabled={bookStartTime === undefined || bookEndTime === undefined}
                            onClick={() => {
                                onUpdateTrip({ bookingStart: bookStartTime!, bookingEnd: DateTimeUtil.isoAddMinutes(bookEndTime!, 30)!, vehicleId: selectedVehicle!.identifier, bookingStartChanged: bookStartTime !== initBookStartTime })
                            }}
                        />
                        {/* <TKUIButton
                            text={"Update trip & Book"}
                            type={TKUIButtonType.PRIMARY}
                            disabled={bookStartTime === undefined || bookEndTime === undefined}
                            onClick={() => {
                                const selectedAvailability: CarAvailability = vehicleAvailabilities.find(va => va.car === selectedVehicle)!;
                                onBookClick({ bookingURL: selectedAvailability.bookingURL!, bookingStart: bookStartTime!, bookingEnd: DateTimeUtil.isoAddMinutes(bookEndTime!, 30)!, vehicleId: selectedVehicle!.identifier })
                            }}
                        /> */}
                    </div>}
            </div>
        </ScrollSync>
    );
}

const Mapper: PropsMapper<IClientProps, IClientProps> =
    ({ inputProps, children }) =>
        <TKUIViewportUtil>
            {({ portrait }) =>
                children!({ portrait, ...inputProps })}
        </TKUIViewportUtil>;

export default connect((config: TKUIConfig) => config.TKUIVehicleAvailability, config, Mapper);