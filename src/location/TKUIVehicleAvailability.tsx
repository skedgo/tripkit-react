import React, { useContext, useEffect, useMemo, useRef, useState } from "react";
import { TKUIWithClasses, TKUIWithStyle } from "../jss/StyleHelper";
import { TKComponentDefaultConfig, TKUIConfig } from "../config/TKUIConfig";
import { PropsMapper, connect } from "../config/TKConfigHelper";
import TKLocationInfo from "../model/location/TKLocationInfo";
import { tKUIVehicleAvailabilityDefaultStyle } from "./TKUIVehicleAvailability.css";
import CarPodLocation from "../model/location/CarPodLocation";
import DateTimeUtil from "../util/DateTimeUtil";
import classNames from "classnames";
import { BookingAvailability, CarPodVehicle } from "../model/location/CarPodInfo";
import { ReactComponent as IconStartSlot } from "../images/ic-arrow-start-slot.svg";
import { ReactComponent as IconEndSlot } from "../images/ic-arrow-end-slot.svg";
import { ReactComponent as IconLeftArrow } from "../images/ic-chevron-left.svg";
import { ReactComponent as IconRightArrow } from "../images/ic-chevron-right.svg";
import { ReactComponent as IconCarOption } from "../images/ic-car-option.svg";
import { ReactComponent as IconCalendar } from "../images/ic-calendar-month.svg";
import TKUIDateTimePicker from "../time/TKUIDateTimePicker";
import { RoutingResultsContext } from "../trip-planner/RoutingResultsProvider";
import Util from "../util/Util";
import NetworkUtil from "../util/NetworkUtil";
import TKUIButton, { TKUIButtonType } from "../buttons/TKUIButton";
import { TKUIViewportUtil, TKUIViewportUtilProps } from "../util/TKUIResponsiveUtil";
import { ReactComponent as IconSpin } from '../images/ic-loading2.svg';
import { ScrollSync, ScrollSyncPane } from 'react-scroll-sync';
import DeviceUtil from "../util/DeviceUtil";
import { white } from "../jss/TKUITheme";

export interface IClientProps extends TKUIWithStyle<IStyle, IProps>, Partial<Pick<TKUIViewportUtilProps, "portrait">> {
    /**
     * @ctype
     */
    location: CarPodLocation;
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

function availableRange(startTime: string, endTime: string, vehicleAvailability: BookingAvailability): boolean {
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
    const timezone = region?.timezone ?? DateTimeUtil.defaultTZ;
    const [locationInfo, setLocationInfo] = useState<TKLocationInfo | undefined>();
    const { location, portrait, t, classes, theme } = props;
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
    const [vehiclesByDate, setVehiclesByDate] = useState<Map<string, CarPodVehicle[] | null>>(new Map());
    const vehicles = useMemo(() => getMergedVehicles(), [vehiclesByDate]);
    const loadingVehicles = vehicles.length === 0 && Array.from(vehiclesByDate.values()).some(value => value === null);
    const noVehicles = vehicles.length === 0 && !Array.from(vehiclesByDate.values()).some(value => value === null);

    function getMergedVehicles(): CarPodVehicle[] {
        // This shouldn't happen, we should always have data for displayStartTime(?)
        if (!vehiclesByDate.get(displayStartTime)) {
            return [];
        }
        const result: CarPodVehicle[] = [];
        for (let date = displayStartTime; DateTimeUtil.isoCompare(date, displayEndTime) <= 0; date = DateTimeUtil.isoAddMinutes(date, 24 * 60)) {
            const dateVehicles = vehiclesByDate.get(date);
            if (result.length === 0) {
                result.push(...dateVehicles!);
            } else if (dateVehicles) {
                result.forEach(vehicle => {
                    const dateVehicle = dateVehicles.find(v => v.identifier === vehicle.identifier);
                    vehicle.availability!.intervals = vehicle.availability!.intervals.concat(dateVehicle?.availability?.intervals ?? []);
                })
            }
        }
        return result;
    }

    function onSlotClick(slot: string, slotVehicle: CarPodVehicle) {
        if (selectedVehicle && selectedVehicle !== slotVehicle ||   // Selected vehicle and clicked a slot of another vehicle, or
            !available(slot, slotVehicle.availability!) ||  // slot not available, or
            bookStartTime && (DateTimeUtil.isoCompare(slot, bookStartTime) < 0 || !availableRange(bookStartTime, slot, slotVehicle.availability!)) ||
            !!bookStartTime && !!bookEndTime) { // book range already set
            return;
        }
        if (!selectedVehicle) {
            setSelectedVehicle(slotVehicle);
        }
        if (!bookStartTime) {
            setBookStartTime(slot);
            setTimeout(() => {
                buttonsRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
            }, 100);
        } else {
            setBookEndTime(slot);
        }
    }

    function selectedSlot(slot, vehicle: CarPodVehicle): boolean {
        if (vehicle !== selectedVehicle) {
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
        if (vehiclesByDate.get(displayStartTime)) {
            setScrollLeftToTime(DateTimeUtil.isoAddMinutes(displayStartTime, 8 * 60));
        }
    }, [vehiclesByDate.get(displayStartTime)]);

    useEffect(() => {
        coverDisplayRange();
    }, [displayStartTime, displayEndTime]);

    function onRequestMore() {
        setDisplayEndTime(DateTimeUtil.isoAddMinutes(displayEndTime, 24 * 60));
    }

    function coverDisplayRange() {
        let requestDates: string[] = [];
        for (let date = displayStartTime; DateTimeUtil.isoCompare(date, displayEndTime) <= 0; date = DateTimeUtil.isoAddMinutes(date, 24 * 60)) {
            if (vehiclesByDate.get(date) === undefined) {
                setVehiclesByDate(vehiclesByDate => {
                    const vehiclesByDateUpdate = new Map(vehiclesByDate);
                    vehiclesByDateUpdate.set(date, null);
                    return vehiclesByDateUpdate;
                });
                requestDates.push(date);
            }
        }
        // TODO: merge consecutive days into (multi-days) intervals to optimize request.
        requestDates.forEach(async date => {
            try {
                const location = await NetworkUtil.delayPromise<CarPodLocation>(1000)(Util.deserialize(require(`../mock/data/location-carPods-sgfleet-${date.substring(0, 10)}.json`), CarPodLocation));
                console.log(location);
                setVehiclesByDate(vehiclesByDate => {
                    if (vehiclesByDate.get(date) !== null) {
                        return vehiclesByDate;
                    }
                    const vehiclesByDateUpdate = new Map(vehiclesByDate);
                    vehiclesByDateUpdate.set(date, location.carPod.vehicles!);
                    return vehiclesByDateUpdate;
                });
            } catch (e) {
                setVehiclesByDate(vehiclesByDate => {
                    const vehiclesByDateUpdate = new Map(vehiclesByDate);
                    vehiclesByDateUpdate.set(date, []);
                    return vehiclesByDateUpdate;
                });
            }
        })
    }

    function isFetching(slot): boolean {
        return vehiclesByDate.get(DateTimeUtil.toJustDate(DateTimeUtil.momentFromIsoWithTimezone(slot)).format()) === null;
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
                    <TKUIDateTimePicker     // Switch rotingQuery.time to region timezone.
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
                                setVehiclesByDate(new Map());
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
            <button className={classes.arrowBtn} style={{ width: 40, ...portrait ? { right: 40 } : { left: VEHICLE_LABEL_WIDTH } }} disabled={false} onClick={() => onPrevNext(true)}>
                <div className={classes.arrowLeftIconContainer}>
                    <IconLeftArrow />
                </div>
                <div className={classes.whiteToTransparent} style={{ width: 14, height: '100%' }} />
            </button>
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
            <button className={classes.arrowBtn} style={{ width: 40, right: 0 }} disabled={false} onClick={() => onPrevNext(false)}>
                <div className={classes.transparentToWhite} style={{ width: 14, height: '100%' }} />
                <div className={classes.arrowRightIconContainer}>
                    <IconRightArrow />
                </div>
            </button>
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
                            {vehicles?.map((vehicle, i) => {
                                return (
                                    <div className={classNames(classes.vehicle, selectedVehicle && vehicle !== selectedVehicle && classes.fadeVehicle)}
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
                                                {vehicle.name}
                                            </div>
                                        </div>
                                        <div style={{ position: 'absolute', width: SCROLL_HORIZONT_WIDTH / 2, height: '54px', background: white(0, theme.isDark), left: portrait ? 0 : VEHICLE_LABEL_WIDTH }} />
                                        <div className={classes.whiteToTransparent} style={{ position: 'absolute', width: SCROLL_HORIZONT_WIDTH / 2, height: '54px', left: portrait ? SCROLL_HORIZONT_WIDTH / 2 : VEHICLE_LABEL_WIDTH + SCROLL_HORIZONT_WIDTH / 2 }} />
                                        <div className={classes.slots}>
                                            {slots.map((slot, i) => {
                                                const isDayStart = slot === DateTimeUtil.toIsoJustDate(slot);
                                                return (
                                                    <div className={classes.slot}
                                                        style={{ width: SLOT_WIDTH, height: SLOT_HEIGHT, ...portrait && { position: 'relative' } }}
                                                        onClick={() => onSlotClick(slot, vehicle)}
                                                        key={i}
                                                    >
                                                        {selectedSlot(slot, vehicle) ?
                                                            <div className={classNames(classes.selectedSlot, slot === bookStartTime && classes.firstSelectedSlot, ((!bookEndTime && slot === bookStartTime) || slot === bookEndTime) && classes.lastSelectedSlot)}>
                                                                {slot === bookStartTime ? <IconStartSlot /> : slot === bookEndTime ? <IconEndSlot /> : undefined}
                                                            </div>
                                                            :
                                                            <div className={classNames(
                                                                isFetching(slot) ? classes.loadingSlot : available(slot, vehicle.availability!) ? classes.availableSlot : classes.unavailableSlot,
                                                                slot === displayStartTime && classes.firstSlot,
                                                                DateTimeUtil.isoAddMinutes(slot, 30) === displayEndTime && classes.lastSlot,
                                                                vehicle === selectedVehicle && bookStartTime && (DateTimeUtil.isoCompare(slot, bookStartTime) < 0 || !availableRange(bookStartTime, slot, selectedVehicle.availability!)) && classes.fadeSlot
                                                            )}>
                                                                {portrait && DateTimeUtil.isoFormat(slot, "h:mma")}
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
                                                    <div>{bookStartTime && DateTimeUtil.isoFormatRelativeDay(bookStartTime, "h:mma ddd D", { justToday: true, partialReplace: "ddd D" })}</div>
                                                </div>
                                                <div className={classes.fromTo}>
                                                    <div>To</div>
                                                    <div className={!bookEndTime ? classes.placeholder : undefined}>{bookEndTime ? DateTimeUtil.isoFormatRelativeDay(bookEndTime, "h:mma ddd D", { justToday: true, partialReplace: "ddd D" }) : "Select end time"}</div>
                                                </div>
                                                <div className={classes.buttons} ref={buttonsRef}>
                                                    <TKUIButton text={"Clear"} type={TKUIButtonType.PRIMARY_LINK} onClick={onClearClick} />
                                                    <TKUIButton text={"Book"} type={TKUIButtonType.PRIMARY} />
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