import React, { useEffect, useState } from "react";
import { TKUIWithClasses, TKUIWithStyle } from "../jss/StyleHelper";
import Location from "../model/Location";
import { TKComponentDefaultConfig, TKUIConfig } from "../config/TKUIConfig";
import { connect, mapperFromFunction } from "../config/TKConfigHelper";
import TKLocationInfo from "../model/location/TKLocationInfo";
import LocationsData from "../data/LocationsData";
import TKDefaultGeocoderNames from "../geocode/TKDefaultGeocoderNames";
import RegionsData from "../data/RegionsData";
import Region from "../model/region/Region";
import { tKUIVehicleAvailabilityDefaultStyle } from "./TKUIVehicleAvailability.css";
import DatePicker from 'react-datepicker/dist/es';
import CarPodLocation from "../model/location/CarPodLocation";
import TimeRangePicker from '@wojtekmaj/react-timerange-picker/dist/entry'
import DateTimeUtil from "../util/DateTimeUtil";
import classNames from "classnames";
import { BookingAvailability, CarPodVehicle } from "../model/location/CarPodInfo";
import { ReactComponent as IconStartSlot } from "../images/ic-arrow-start-slot.svg";
import { ReactComponent as IconEndSlot } from "../images/ic-arrow-end-slot.svg";
import { ReactComponent as IconRightArrow } from "../images/ic-angle-right.svg";

export interface IClientProps extends TKUIWithStyle<IStyle, IProps> {
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

function getSlots(start: string): string[] {
    const slots: string[] = [];
    for (let i = 0; i < 48; i++) {
        slots.push(DateTimeUtil.isoAddMinutes(start, i * 30));
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

const SLOT_WIDTH = 32;
const VEHICLE_LABEL_WIDTH = SLOT_WIDTH * 5;

const TKUIVehicleAvailability: React.FunctionComponent<IProps> = (props: IProps) => {
    const [locationInfo, setLocationInfo] = useState<TKLocationInfo | undefined>();
    const { location, t, classes, theme } = props;
    const [timeRange, setTimeRange] = useState<[string, string]>([DateTimeUtil.getNow().format("HH:mm"), DateTimeUtil.getNow().add(2, 'hours').format("HH:mm")]);
    // Start datetime (in 30 mins steps) of the display interval.
    // For now assum I display 12h (24 slots) from displayTime, though it should depend on component width.
    const [displayTime, setDisplayTime] = useState<string>("2023-07-19T00:00:00.000Z");
    const [selectedVehicle, setSelectedVehicle] = useState<CarPodVehicle | undefined>();
    const [bookStartTime, setBookStartTime] = useState<string | undefined>();
    const [bookEndTime, setBookEndTime] = useState<string | undefined>();
    const slots = getSlots(displayTime);
    const vehicles = location.carPod.vehicles;
    function onSlotClick(slot: string, slotVehicle: CarPodVehicle) {
        if (selectedVehicle && selectedVehicle !== slotVehicle) {
            return;
        }
        if (!selectedVehicle) {
            setSelectedVehicle(slotVehicle);
        }
        if (!available(slot, slotVehicle.availability!) ||  // Slot not available, or
            !!bookStartTime && !!bookEndTime) { // Book range already set
            return;
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

    }
    useEffect(() => {
        // TODO: if location already has w3w data (e.g. is a SkedgoGeocoder result that has details)
        // then use that value.
        setLocationInfo(undefined);
        RegionsData.instance.getRegionP(location).then((region?: Region) =>
            LocationsData.instance.getLocationInfo(location.source === TKDefaultGeocoderNames.skedgo && location.id ?
                location.id : location, location.source === TKDefaultGeocoderNames.skedgo && location.id && region ?
                region.name : undefined)
                .then((result: TKLocationInfo) => setLocationInfo(result))
                .catch((e) => console.log(e)));
    }, [location.getKey()]);
    return (
        <div className={classes.main}>
            <div className={classes.scrollPanel} style={{ paddingLeft: VEHICLE_LABEL_WIDTH }}>
                <div className={classes.header} style={{ width: SLOT_WIDTH * 48 }}>
                    <div className={classes.vehicleLabel} style={{ width: VEHICLE_LABEL_WIDTH }}>
                        <div style={{ flexGrow: 1 }} />
                        <button className={classes.arrowBtn} style={{ width: 40, left: VEHICLE_LABEL_WIDTH - 40 }} disabled={false} onClick={() => onPrevNext(true)}>
                            <div style={{ background: 'white', flexGrow: 1, padding: '14px 0 14px 14px', height: '100%' }}>
                                <IconRightArrow style={{ transform: 'rotate(180deg)' }} />
                            </div>
                            <div className={classes.whiteToTransparent} style={{ width: 14, height: '100%' }} />
                        </button>
                    </div>
                    <div className={classes.timeIndexes}>
                        {slots.filter((_slot, i) => i % 2 === 0).map((slot, i) =>
                            <div style={{ width: SLOT_WIDTH * 2 }} className={classes.timeIndex} key={i}>
                                {DateTimeUtil.isoFormat(slot, "ha")}
                            </div>
                        )}
                    </div>
                    {/* <div className={classes.transparentToWhite} style={{ width: SLOT_WIDTH }} /> */}
                    {/* <button className={classes.arrowBtn} style={{ width: 40, right: 0 }} disabled={false} onClick={() => onPrevNext(false)}>
                        <IconRightArrow style={{ transform: 'rotate(180deg)' }} />
                    </button> */}
                    <button className={classes.arrowBtn} style={{ width: 40, right: 0, position: 'absolute' }} disabled={false} onClick={() => onPrevNext(false)}>
                        <div className={classes.transparentToWhite} style={{ width: 14, height: '100%' }} />
                        <div style={{ background: 'white', flexGrow: 1, padding: '14px 14px 14px 0', height: '100%' }}>
                            <IconRightArrow />
                        </div>
                    </button>
                </div>
                <div className={classes.vehicles} style={{ width: SLOT_WIDTH * 48 }}>
                    {vehicles?.map((vehicle, i) => {
                        return (
                            <div className={classNames(classes.vehicle, selectedVehicle && vehicle !== selectedVehicle && classes.fadeVehicle)} key={i}>
                                <div className={classes.vehicleLabel} style={{ width: VEHICLE_LABEL_WIDTH }}>
                                    <div style={{ padding: '20px 0 20px 20px', flexGrow: 1 }}>
                                        {vehicle.name}
                                    </div>
                                    <div className={classes.whiteToTransparent} style={{ width: SLOT_WIDTH }} />
                                </div>
                                {slots.map((slot, i) =>
                                    <div className={classNames(classes.slot)} style={{ width: SLOT_WIDTH }} onClick={() => onSlotClick(slot, vehicle)}>
                                        {selectedSlot(slot, vehicle) ?
                                            <div className={classNames(classes.selectedSlot, slot === bookStartTime && classes.firstSelectedSlot, ((!bookEndTime && slot === bookStartTime) || slot === bookEndTime) && classes.lastSelectedSlot)}>
                                                {slot === bookStartTime ? <IconStartSlot /> : slot === bookEndTime ? <IconEndSlot /> : undefined}
                                            </div>
                                            :
                                            <div className={available(slot, vehicle.availability!) ? classes.availableSlot : classes.unavailableSlot} />}
                                    </div>)}
                                <div className={classes.transparentToWhite} style={{ width: SLOT_WIDTH / 2, height: '54px', right: SLOT_WIDTH / 2, position: 'absolute' }} />
                                <div style={{ width: SLOT_WIDTH / 2, height: '54px', right: 0, position: 'absolute', background: 'white' }} />
                            </div>
                        );
                    })}
                </div>
            </div>
            {/* <DatePicker
                selected={new Date()}
                onChange={date => console.log(date)}
                inline
                calendarClassName={classes.calendar}
                // showTimeInput={true}
                // customTimeInput={<TimeRangePicker/>}
            />
            <TimeRangePicker value={timeRange} onChange={setTimeRange}/> */}
        </div>
    );
}

export default connect((config: TKUIConfig) => config.TKUIVehicleAvailability, config,
    mapperFromFunction((clientProps: IClientProps) => clientProps));