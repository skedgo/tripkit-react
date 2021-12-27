import React from 'react';
import {TKUIWithClasses, TKUIWithStyle} from "../jss/StyleHelper";
import Location from "../model/Location";
import {TKComponentDefaultConfig, TKUIConfig} from "../config/TKUIConfig";
import {connect, mapperFromFunction} from "../config/TKConfigHelper";
import TKUIMapPopup from "./TKUIMapPopup";
import LocationUtil from "../util/LocationUtil";
import StopLocation from "../model/StopLocation";
import {ReactComponent as IconTimes} from '../images/ic-clock.svg';
import {tKUIMapLocationPopupDefaultStyle} from './TKUIMapLocationPopup.css';
import TransportUtil from "../trip/TransportUtil";
import BikePodLocation from "../model/location/BikePodLocation";
import CarParkLocation from "../model/location/CarParkLocation";
import FreeFloatingVehicleLocation from "../model/location/FreeFloatingVehicleLocation";

interface IClientProps extends TKUIWithStyle<IStyle, IProps> {
    location: Location;
    onAction?: () => void;
}

type IStyle = ReturnType<typeof tKUIMapLocationPopupDefaultStyle>;

interface IProps extends IClientProps, TKUIWithClasses<IStyle, IProps> {}

export type TKUIMapLocationPopupProps = IProps;
export type TKUIMapLocationPopupStyle = IStyle;

const config: TKComponentDefaultConfig<IProps, IStyle> = {
    render: props => <TKUIMapLocationPopup {...props}/>,
    styles: tKUIMapLocationPopupDefaultStyle,
    classNamePrefix: "TKUIMapLocationPopup"
};

const TKUIMapLocationPopup: React.SFC<IProps> = (props: IProps) => {
    const location = props.location;
    const t = props.t;
    const classes = props.classes;
    const info = () => {
        if (location instanceof CarParkLocation) {
            return (
                <div className={classes.info}>
                    {location.carPark.availableSpaces !== undefined &&
                    <div className={classes.infoRow}>
                        <img src={TransportUtil.getTransportIconLocal("car", false, props.theme.isDark)} className={classes.infoRowImage}/>
                        <div className={classes.infoRowLabel}>
                            {t("Available.spots")}
                        </div>
                        <div className={classes.infoRowValue}>
                            {location.carPark.availableSpaces}
                        </div>
                    </div>}
                    {location.carPark.totalSpaces !== undefined &&
                    <div className={classes.infoRow}>
                        <img src={TransportUtil.getTransportIconLocal("parking", false, props.theme.isDark)} className={classes.infoRowImage}/>
                        <div className={classes.infoRowLabel}>
                            {t("Total.spaces")}
                        </div>
                        <div className={classes.infoRowValue}>
                            {location.carPark.totalSpaces}
                        </div>
                    </div>}
                </div>
            );
        }
        if (location instanceof BikePodLocation) {
            return (
                <div className={classes.info}>
                    {location.bikePod.availableBikes !== undefined &&
                    <div className={classes.infoRow}>
                        <img src={TransportUtil.getTransportIconLocal("bicycle", false, props.theme.isDark)} className={classes.infoRowImage}/>
                        <div className={classes.infoRowLabel}>
                            {t("Available.bikes")}
                        </div>
                        <div className={classes.infoRowValue}>
                            {location.bikePod.availableBikes}
                        </div>
                    </div>}
                    {location.bikePod.availableSpaces !== undefined &&
                    <div className={classes.infoRow}>
                        <img src={TransportUtil.getTransportIconLocal("bicycle-share", false, props.theme.isDark)} className={classes.infoRowImage}/>
                        <div className={classes.infoRowLabel}>
                            {t("Empty.docks")}
                        </div>
                        <div className={classes.infoRowValue}>
                            {location.bikePod.availableSpaces}
                        </div>
                    </div>}
                </div>
            );
        }
        if (location instanceof FreeFloatingVehicleLocation) {
            return (
                <div className={classes.info}>
                    <div className={classes.infoRow}>
                        <img src={TransportUtil.getTransportIconLocal(location.modeInfo.localIcon, false, props.theme.isDark)} className={classes.infoRowImage}/>
                        <div className={classes.infoRowLabel}>
                            {t("E-Bike")}
                        </div>
                    </div>
                    {location.vehicle?.batteryLevel !== undefined &&
                    <div className={classes.infoRow}>
                        <img src={TransportUtil.getTransportIconLocal("bicycle-share", false, props.theme.isDark)} className={classes.infoRowImage}/>
                        <div className={classes.infoRowLabel}>
                            {t("Battery")}
                        </div>
                        <div className={classes.infoRowValue}>
                            {location.vehicle.batteryLevel + '%'}
                        </div>
                    </div>}
                </div>
            );
        }
        return undefined;
    };

    return (
        <TKUIMapPopup title={LocationUtil.getMainText(location, props.t)}
                      subtitle={LocationUtil.getSecondaryText(location)}
                      onAction={props.onAction}
                      renderActionIcon={location instanceof StopLocation ? () => <IconTimes/> : undefined}
                      renderMoreInfo={info}
        />
    )
};


export default connect((config: TKUIConfig) => config.TKUIMapLocationPopup, config,
    mapperFromFunction((clientProps: IClientProps) => clientProps))