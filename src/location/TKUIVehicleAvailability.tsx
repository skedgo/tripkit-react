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

const SLOT_WIDTH = 32;
const VEHICLE_LABEL_WIDTH = SLOT_WIDTH * 5;

const TKUIVehicleAvailability: React.FunctionComponent<IProps> = (props: IProps) => {
    const [locationInfo, setLocationInfo] = useState<TKLocationInfo | undefined>();
    const { location, t, classes, theme } = props;
    const [timeRange, setTimeRange] = useState<[string, string]>([DateTimeUtil.getNow().format("HH:mm"), DateTimeUtil.getNow().add(2, 'hours').format("HH:mm")]);
    // Start datetime (in 30 mins steps) of the display interval.
    // For now assum I display 12h (24 slots) from displayTime, though it should depend on component width.
    const [displayTime, setDisplayTime] = useState<string>("2023-07-19T00:00:00.000Z");
    const slots = getSlots(displayTime);
    const vehicles = location.carPod.vehicles;
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
                <div className={classes.header}>
                    <div className={classes.vehicleLabel} style={{ width: VEHICLE_LABEL_WIDTH }}>
                        <div style={{ flexGrow: 1 }} />
                        <div className={classes.gradient} style={{ width: SLOT_WIDTH }} />
                    </div>
                    <div className={classes.timeIndexes}>
                        {slots.filter((_slot, i) => i % 2 === 0).map((slot, i) =>
                            <div style={{ width: SLOT_WIDTH * 2 }} className={classes.timeIndex} key={i}>
                                {DateTimeUtil.isoFormat(slot, "ha")}
                            </div>
                        )}
                    </div>
                </div>
                <div className={classes.vehicles}>
                    {vehicles?.map((vehicle, i) => {
                        return (
                            <div className={classes.vehicle} key={i}>
                                <div className={classes.vehicleLabel} style={{ width: VEHICLE_LABEL_WIDTH }}>
                                    <div style={{ paddingLeft: '20px', flexGrow: 1 }}>
                                        {vehicle.name}
                                    </div>
                                    <div className={classes.gradient} style={{ width: SLOT_WIDTH }} />
                                </div>
                                {slots.map((slot, i) =>
                                    <div className={classes.slot} style={{ width: SLOT_WIDTH }}></div>)}
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