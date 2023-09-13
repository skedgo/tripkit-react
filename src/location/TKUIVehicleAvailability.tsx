import React, { useContext, useEffect, useMemo, useRef, useState } from "react";
import { TKUIWithClasses, TKUIWithStyle } from "../jss/StyleHelper";
import { TKComponentDefaultConfig, TKUIConfig } from "../config/TKUIConfig";
import { PropsMapper, connect } from "../config/TKConfigHelper";
import TKLocationInfo from "../model/location/TKLocationInfo";
import { tKUIVehicleAvailabilityDefaultStyle } from "./TKUIVehicleAvailability.css";
import CarPodLocation from "../model/location/CarPodLocation";
import DateTimeUtil from "../util/DateTimeUtil";
import classNames from "classnames";
import { BookingAvailability, CarAvailability, CarPodVehicle } from "../model/location/CarPodInfo";
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

export interface IClientProps extends TKUIWithStyle<IStyle, IProps>, Partial<Pick<TKUIViewportUtilProps, "portrait">> {
    /**
     * @ctype
     */
    location: CarPodLocation;
    onBookClick?: (data: { bookingURL: string, bookingStart: string, bookingEnd: string, vehicleId: string }) => void
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
    let i = 0;
    for (let slot = start; DateTimeUtil.isoCompare(slot, end) < 0; slot = DateTimeUtil.isoAddMinutes(slot, 30)) {
        slots.push(slot);
    }
    return slots;
}

function betweenTimes(time: string, startTime: string, endTime: string): boolean {
    return DateTimeUtil.isoToMillis(startTime) <= DateTimeUtil.isoToMillis(time) &&
        DateTimeUtil.isoToMillis(time) <= DateTimeUtil.isoToMillis(endTime);
}

function available(slot: string, vehicleAvailability: BookingAvailability): boolean {
    return vehicleAvailability.intervals.some(interval =>
        interval.status === "AVAILABLE" && betweenTimes(slot, interval.start, interval.end));
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

    if (DateTimeUtil.isoCompare(startTime, endTime) > 0) {
        return false;
    }
    for (let slot = startTime; DateTimeUtil.isoCompare(slot, endTime) <= 0; slot = DateTimeUtil.isoAddMinutes(slot, 30)) {
        if (!available(slot, vehicleAvailability)) {
            return false;
        }
    }
    return true;
}

const SCROLL_X_PANEL_ID = "scroll-x-panel";

const TKUIVehicleAvailability: React.FunctionComponent<IProps> = (props: IProps) => {
    const { region } = useContext(RoutingResultsContext);
    const onBookClickDefault = ({ bookingURL, bookingStart, bookingEnd }) => {
        open(bookingURL + "&start=" + bookingStart + "&end=" + bookingEnd, '_blank');
    }
    const { location, onBookClick = onBookClickDefault, portrait, t, classes, theme } = props;
    const SLOT_WIDTH = portrait ? 80 : 32;
    const SLOT_HEIGHT = portrait ? 40 : 24;
    const VEHICLE_LABEL_WIDTH = 200;
    const SCROLL_HORIZONT_WIDTH = portrait ? 20 : 32;
    const [displayStartTime, setDisplayStartTime] = useState<string>("2023-07-19T00:00:00+10:00");
    const [displayEndTime, setDisplayEndTime] = useState<string>(DateTimeUtil.isoAddMinutes(displayStartTime, 24 * 60 - 1));
    const [displayDate, setDisplayDate] = useState<string>(DateTimeUtil.toIsoJustDate(displayStartTime));
    const [selectedVehicle, setSelectedVehicle] = useState<CarPodVehicle | undefined>();
    const [bookStartTime, setBookStartTime] = useState<string | undefined>();
    const [bookEndTime, setBookEndTime] = useState<string | undefined>();
    const slots = getSlots(displayStartTime, displayEndTime);

    /**
     * undefined: not requested
     * null: waiting for response
     * Availability is requested with day granularity
     */
    const [vehicleAvailabilitiesByDate, setVehicleAvailabilitiesByDate] = useState<Map<string, CarAvailability[] | null>>(new Map());
    const vehicleAvailabilities = useMemo(() => getMergedVehicles(), [vehicleAvailabilitiesByDate]);
    const loadingVehicles = vehicleAvailabilities.length === 0 && Array.from(vehicleAvailabilitiesByDate.values()).some(value => value === null);
    const noVehicles = vehicleAvailabilities.length === 0 && !Array.from(vehicleAvailabilitiesByDate.values()).some(value => value === null);

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
                    availability.availability!.intervals = availability.availability!.intervals.concat(dateAvailability?.availability?.intervals ?? []);
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
        const isStart = !bookStartTime && (!bookEndTime || DateTimeUtil.isoCompare(slot, bookEndTime) < 0)
            || bookStartTime && DateTimeUtil.isoCompare(slot, bookStartTime) < 0;
        const isEnd = !isStart && (!bookEndTime || DateTimeUtil.isoCompare(slot, bookEndTime) > 0);
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
            (!!bookStartTime && !!bookEndTime && betweenTimes(slot, bookStartTime, bookEndTime));
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
        // Move scroll to 8am by default on display start date change.
        if (vehicleAvailabilitiesByDate.get(displayStartTime)) {
            setScrollLeftToTime(DateTimeUtil.isoAddMinutes(displayStartTime, 8 * 60));
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
        const region = RegionsData.instance.getRegion(location)?.name;
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
        console.log(JSON.stringify(requestDateGroups));
        requestDateGroups.forEach(async dateGroup => {
            const dateGStart = dateGroup[0];
            const dateGEnd = DateTimeUtil.isoAddMinutes(dateGroup[dateGroup.length - 1], 24 * 60 - 1);
            try {
                // const locationInfo = await NetworkUtil.delayPromise<CarPodLocation>(1000)(Util.deserialize(require(`../mock/data/locationInfo-carPod-sgfleet-${date.substring(0, 10)}.json`), CarPodLocation));                
                const locationInfo = await TripGoApi.apiCallT(`locationInfo.json?identifier=${location.id}&start=${dateGStart}&region=${region}&end=${dateGEnd}`, NetworkUtil.MethodType.GET, TKLocationInfo)
                setVehicleAvailabilitiesByDate(availabilitiesAByDate => {
                    const availabilitiesByDateUpdate = new Map(availabilitiesAByDate);
                    dateGroup.forEach(date => {
                        if (availabilitiesAByDate.get(date) !== null) {
                            return;
                        }
                        const podAvailabilities = (locationInfo.carPod!.availabilities ?? []);
                        const nearPodsAvailabilities = locationInfo.carPod!.nearbyPods
                            ?.reduce((acc, nearbyPod) => {
                                acc.push(...nearbyPod.carPod.availabilities ?? []);
                                return acc;
                            }, [] as CarAvailability[]) ?? [];
                        const allVehicles = podAvailabilities.concat(nearPodsAvailabilities);
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
        return vehicleAvailabilitiesByDate.get(DateTimeUtil.toJustDate(DateTimeUtil.momentFromIsoWithTimezone(slot)).format()) === null;
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
                    const isDayStart = slot === DateTimeUtil.toIsoJustDate(slot);
                    return (
                        <div style={{ width: SLOT_WIDTH * 2 }} className={classes.timeIndex} key={i}>
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
                                return (
                                    <div className={classNames(classes.vehicle,
                                        !availableRange(bookStartTime, bookEndTime, availability.availability!) ? classes.fadeVehicle : vehicle !== selectedVehicle && classes.availableVehicle,
                                        selectedVehicle && vehicle !== selectedVehicle && classes.unselectedVehicle,
                                    )}
                                        onClick={() => {
                                            vehicle !== selectedVehicle && availableRange(bookStartTime, bookEndTime, availability.availability!) && setSelectedVehicle(availability.car)
                                        }}
                                        style={{
                                            ...portrait ? { paddingLeft: 15, paddingTop: 65 } : { paddingLeft: VEHICLE_LABEL_WIDTH + SCROLL_HORIZONT_WIDTH },
                                            ...vehicle === selectedVehicle && { paddingBottom: SLOT_HEIGHT + 50 },
                                            width: SLOT_WIDTH * slots.length + (!portrait ? VEHICLE_LABEL_WIDTH + SCROLL_HORIZONT_WIDTH : 0)
                                        }}
                                        key={i}
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
                                                const isDayStart = slot === DateTimeUtil.toIsoJustDate(slot);
                                                const isSelectedVehicle = vehicle === selectedVehicle;
                                                const { clickable, startUpdate, endUpdate } = isSelectedVehicle ? slotClickHelper(slot, availability) : { clickable: false, startUpdate: undefined, endUpdate: undefined };
                                                const isStartPreview = !!startUpdate;
                                                const isEndPreview = !!endUpdate;
                                                return (
                                                    <div className={classes.slot}
                                                        style={{ width: SLOT_WIDTH, height: SLOT_HEIGHT, ...portrait && { position: 'relative' } }}
                                                        onClick={() => onSlotClick(slot, availability)}
                                                        key={i}
                                                    >
                                                        {selectedSlot(slot, availability, !!bookStartTime && !!bookEndTime && availableRange(bookStartTime, bookEndTime, availability.availability!)) ?
                                                            <div className={classNames(classes.selectedSlot, slot === bookStartTime && classes.firstSelectedSlot, ((!bookEndTime && slot === bookStartTime) || slot === bookEndTime) && classes.lastSelectedSlot)}>
                                                                {slot === bookStartTime ? <IconStartSlot /> : slot === bookEndTime ? <IconEndSlot /> : undefined}
                                                            </div>
                                                            :
                                                            <div className={classNames(
                                                                isFetching(slot) ? classes.loadingSlot : available(slot, availability.availability!) ? classes.availableSlot : classes.unavailableSlot,
                                                                slot === displayStartTime && classes.firstSlot,
                                                                DateTimeUtil.isoAddMinutes(slot, 30) === displayEndTime && classes.lastSlot,
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
                                                        onClick={() => {
                                                            const selectedAvailability: CarAvailability = vehicleAvailabilities.find(va => va.car === selectedVehicle)!;
                                                            onBookClick({ bookingURL: selectedAvailability.bookingURL!, bookingStart: bookStartTime!, bookingEnd: bookEndTime!, vehicleId: selectedVehicle!.identifier })
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