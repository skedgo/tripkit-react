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

const TKUIVehicleAvailability: React.FunctionComponent<IProps> = (props: IProps) => {
    const [locationInfo, setLocationInfo] = useState<TKLocationInfo | undefined>();
    const { location, t, classes, theme } = props;
    const [timeRange, setTimeRange] = useState<[string, string]>([DateTimeUtil.getNow().format("HH:mm"), DateTimeUtil.getNow().add(2, 'hours').format("HH:mm")]);
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
            <DatePicker
                selected={new Date()}
                onChange={date => console.log(date)}
                inline
                calendarClassName={classes.calendar}
                // showTimeInput={true}
                // customTimeInput={<TimeRangePicker/>}
            />
            <TimeRangePicker value={timeRange} onChange={setTimeRange}/>
        </div>
    );
}

export default connect((config: TKUIConfig) => config.TKUIVehicleAvailability, config,
    mapperFromFunction((clientProps: IClientProps) => clientProps));