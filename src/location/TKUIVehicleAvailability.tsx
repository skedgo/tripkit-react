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
    const [displayTime, setDisplayTime] = useState<string>(displayStartTime);
    const displayDate = DateTimeUtil.toJustDate(DateTimeUtil.momentFromIsoWithTimezone(displayTime)).format();
    const [selectedVehicle, setSelectedVehicle] = useState<CarPodVehicle | undefined>();
    const [bookStartTime, setBookStartTime] = useState<string | undefined>();
    const [bookEndTime, setBookEndTime] = useState<string | undefined>();
    const slots = getSlots(displayStartTime, displayEndTime);
    // const vehicles = location.carPod.vehicles;

    const [waiting, setWaiting] = useState<boolean>(false);

    /**
     * undefined: not requested
     * null: waiting for response
     * Availability is requested with day granularity
     */
    const [vehiclesByDate, setVehiclesByDate] = useState<Map<string, CarPodVehicle[] | null>>(new Map());
    const vehicles = useMemo(() => getMergedVehicles(), [vehiclesByDate]);

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
            !!bookStartTime && !!bookEndTime) { // book range already set
            return;
        }
        if (!selectedVehicle) {
            setSelectedVehicle(slotVehicle);
        }
        if (!bookStartTime) {
            setBookStartTime(slot);
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
        if (!scrollRef.current) {
            return;
        }
        scrollRef.current.scrollLeft += prev ? -SLOT_WIDTH : SLOT_WIDTH;
    }

    function setScrollLeftToTime(time: string) {
        if (!scrollRef.current) {
            console.log("return!");
            return;
        }
        const slotIndex = slots.indexOf(DateTimeUtil.isoAddMinutes(time, 0)); // Improve this. Call isoAddMinutes to ensure the same format (it has no millis)        
        console.log(slotIndex);
        if (slotIndex === -1) {
            return;
        }
        scrollRef.current.scrollLeft = slotIndex * SLOT_WIDTH;
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
                vehiclesByDate.set(date, null);
                requestDates.push(date);
            }
        }
        console.log(requestDates);
        // TODO: merge consecutive days into (multi-days) intervals to optimize request.
        requestDates.forEach(async date => {
            try {
                const location = await NetworkUtil.delayPromise<CarPodLocation>(1000)(Util.deserialize(require(`../mock/data/location-carPods-sgfleet-${date.substring(0, 10)}.json`), CarPodLocation));
                console.log(location);
                if (vehiclesByDate.get(date) !== null) {
                    return;
                }
                setVehiclesByDate(vehiclesByDate => {
                    const vehiclesByDateUpdate = new Map(vehiclesByDate);
                    vehiclesByDateUpdate.set(date, location.carPod.vehicles!);
                    return vehiclesByDateUpdate;
                });
            } catch (e) {

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

    const scrollRef = useRef<HTMLDivElement>(null);
    return (
        <div className={classNames(classes.main, portrait && classes.portrait)}>
            <div className={classes.scrollPanel}
                style={{ paddingLeft: 0, paddingRight: SLOT_WIDTH }}
                ref={scrollRef}
                onScroll={e => {
                    const scrollElem = scrollRef.current!;
                    const leftSlot = getTimeFromScrollLeft(scrollElem.scrollLeft);
                    if (!DateTimeUtil.isoSameTime(displayTime, leftSlot)) {
                        setDisplayTime(leftSlot);
                    }
                    if (scrollElem.scrollLeft + scrollElem.clientWidth > scrollElem.scrollWidth - 30) {
                        onRequestMore();
                    }
                }}
            >
                <div className={classes.header} style={{ width: SLOT_WIDTH * slots.length, paddingLeft: VEHICLE_LABEL_WIDTH + SCROLL_HORIZONT_WIDTH }}>
                    <div className={classes.vehicleLabel} style={{ width: VEHICLE_LABEL_WIDTH, zIndex: 1, height: '60px' }}>
                        <div className={classes.datePicker}>
                            <TKUIDateTimePicker     // Switch rotingQuery.time to region timezone.
                                value={DateTimeUtil.momentFromIsoWithTimezone(displayDate)}
                                timeZone={region?.timezone}
                                onChange={date => {
                                    if (!selectedVehicle) {
                                        setDisplayStartTime(date.format());
                                        setDisplayEndTime(DateTimeUtil.isoAddMinutes(date.format(), 24 * 60 - 1));
                                        setDisplayTime(date.format());
                                        setVehiclesByDate(new Map());
                                    } else {
                                        setDisplayEndTime(DateTimeUtil.isoAddMinutes(date.format(), 24 * 60 - 1));
                                        setTimeout(() => {
                                            setScrollLeftToTimeRef.current(DateTimeUtil.isoAddMinutes(date.format(), 8 * 60));
                                        }, 100);
                                    }
                                }}
                                // dateFormat={DateTimeUtil.dateFormat()}
                                dateFormat={"YYYY-MM-DD"}
                                // styles={(theme: TKUITheme) => ({
                                //     datePicker: overrideClass(this.props.injectedStyles.datePicker)
                                // })}
                                shouldCloseOnSelect={true}
                                renderCustomInput={(value: any, onClick: any, onKeyDown: any, ref: any) =>
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
                    <button className={classes.arrowBtn} style={{ width: 40, position: 'absolute', zIndex: 1, ...portrait ? { right: 40 } : { left: VEHICLE_LABEL_WIDTH } }} disabled={false} onClick={() => onPrevNext(true)}>
                        <div style={{ background: 'white', flexGrow: 1, padding: '24px 0 24px 14px', height: '100%' }}>
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
                        {/* {waiting && slots.length > 0 && <IconLoading style={{ width: '30px', height: '14px', marginTop: '-2px', marginLeft: '-25px' }} />} */}
                    </div>
                    <button className={classes.arrowBtn} style={{ width: 40, right: 0, position: 'absolute' }} disabled={false} onClick={() => onPrevNext(false)}>
                        <div className={classes.transparentToWhite} style={{ width: 14, height: '100%' }} />
                        <div style={{ background: 'white', flexGrow: 1, padding: '24px 14px 24px 0', height: '100%' }}>
                            {/* {waiting ? <IconLoading style={{ width: '30px', height: '14px', marginTop: '-2px' }} /> : <IconRightArrow />} */}
                            <IconRightArrow />
                        </div>
                    </button>
                </div>
                <div className={classes.vehicles} style={{ width: SLOT_WIDTH * slots.length }}>
                    {vehicles?.map((vehicle, i) => {
                        return (
                            <div className={classNames(classes.vehicle, selectedVehicle && vehicle !== selectedVehicle && classes.fadeVehicle)}
                                style={{ ...portrait ? { paddingTop: 50 } : { paddingLeft: VEHICLE_LABEL_WIDTH + SCROLL_HORIZONT_WIDTH }, ...vehicle === selectedVehicle && { paddingBottom: SLOT_HEIGHT + 40 } }}
                                key={i}
                            >
                                <div className={classes.vehicleLabel} style={{ ...portrait ? { transform: 'translateY(-45px)' } : { width: VEHICLE_LABEL_WIDTH } }}>
                                    <div className={classes.vehicleIcon}>
                                        <IconCarOption />
                                    </div>
                                    <div className={classes.vehicleName}>
                                        {vehicle.name}
                                    </div>
                                </div>
                                <div style={{ width: SCROLL_HORIZONT_WIDTH / 2, height: '54px', position: 'absolute', background: 'white', left: portrait ? 0 : VEHICLE_LABEL_WIDTH }} />
                                <div className={classes.whiteToTransparent} style={{ width: SCROLL_HORIZONT_WIDTH / 2, height: '54px', left: portrait ? SCROLL_HORIZONT_WIDTH / 2 : VEHICLE_LABEL_WIDTH + SCROLL_HORIZONT_WIDTH / 2, position: 'absolute' }} />
                                <div className={classes.slots}>
                                    {slots.map((slot, i) =>
                                        <div className={classNames(classes.slot)} style={{ width: SLOT_WIDTH, height: SLOT_HEIGHT }} onClick={() => onSlotClick(slot, vehicle)} key={i}>
                                            {selectedSlot(slot, vehicle) ?
                                                <div className={classNames(classes.selectedSlot, slot === bookStartTime && classes.firstSelectedSlot, ((!bookEndTime && slot === bookStartTime) || slot === bookEndTime) && classes.lastSelectedSlot)}>
                                                    {slot === bookStartTime ? <IconStartSlot /> : slot === bookEndTime ? <IconEndSlot /> : undefined}
                                                </div>
                                                :
                                                <div className={classNames(isFetching(slot) ? classes.loadingSlot : available(slot, vehicle.availability!) ? classes.availableSlot : classes.unavailableSlot, slot === displayStartTime && classes.firstSlot, DateTimeUtil.isoAddMinutes(slot, 30) === displayEndTime && classes.lastSlot)}>
                                                    {portrait && DateTimeUtil.isoFormat(slot, "h:mma")}
                                                </div>}
                                        </div>)}
                                </div>
                                {vehicle === selectedVehicle &&
                                    <div className={classes.selectionPanel} style={{ padding: `0 ${portrait ? 20 : 30}px 0 ${portrait ? 20 : VEHICLE_LABEL_WIDTH + SCROLL_HORIZONT_WIDTH}px`, transform: `translateY(${SLOT_HEIGHT + 25}px)` }}>
                                        <div className={classes.fromTo}>
                                            <div>From</div>
                                            <div>{bookStartTime && DateTimeUtil.isoFormatRelativeDay(bookStartTime, "h:mma ddd D", { justToday: true, partialReplace: "ddd D" })}</div>
                                        </div>
                                        <div className={classes.fromTo}>
                                            <div>To</div>
                                            <div className={!bookEndTime ? classes.placeholder : undefined}>{bookEndTime ? DateTimeUtil.isoFormatRelativeDay(bookEndTime, "h:mma ddd", { justToday: true, partialReplace: "ddd" }) : "Select end time"}</div>
                                        </div>
                                        <div className={classes.buttons}>
                                            <TKUIButton text={"Clear"} type={TKUIButtonType.PRIMARY_LINK} onClick={onClearClick} />
                                            <TKUIButton text={"Book"} type={TKUIButtonType.PRIMARY} />
                                        </div>
                                    </div>}
                                <div className={classes.transparentToWhite} style={{ width: SCROLL_HORIZONT_WIDTH / 2, height: '54px', right: SCROLL_HORIZONT_WIDTH / 2, position: 'absolute' }} />
                                <div style={{ width: SCROLL_HORIZONT_WIDTH / 2, height: '54px', right: 0, position: 'absolute', background: 'white' }} />
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

const Mapper: PropsMapper<IClientProps, IClientProps> =
    ({ inputProps, children }) =>
        <TKUIViewportUtil>
            {({ portrait }) =>
                children!({ portrait, ...inputProps })}
        </TKUIViewportUtil>;

export default connect((config: TKUIConfig) => config.TKUIVehicleAvailability, config, Mapper);