import React, { useState } from 'react';
import { TKUIWithClasses, TKUIWithStyle } from "../jss/StyleHelper";
import { TKComponentDefaultConfig, TKUIConfig } from "../config/TKUIConfig";
import { connect, mapperFromFunction } from "../config/TKConfigHelper";
import { tKUIServiceRealtimeInfoDefaultStyle } from "./TKUIServiceRealtimeInfo.css";
import genStyles from "../css/GenStyle.css";
import RealTimeVehicle from "../model/service/RealTimeVehicle";
import RealTimeAlert from "../model/service/RealTimeAlert";
import TKUserProfile from "../model/options/TKUserProfile";
import TKUIAlertsSummary from "../alerts/TKUIAlertsSummary";
import TKUIWheelchairInfo from "./occupancy/TKUIWheelchairInfo";
import TKUITrainOccupancyInfo from "./occupancy/TKUITrainOccupancyInfo";
import TKUIOccupancyInfo from "./occupancy/TKUIOccupancyInfo";
import ModeInfo from "../model/trip/ModeInfo";
import { ReactComponent as IconAngleDown } from "../images/ic-angle-down.svg";
import { TKUISlideUpOptions } from "../card/TKUISlideUp";
import TKUIBicycleInfo from './TKUIBicycleInfo';

export interface IClientProps extends TKUIWithStyle<IStyle, IProps> {
    wheelchairAccessible?: boolean;
    bicycleAccessible?: boolean;
    vehicle?: RealTimeVehicle;
    alerts?: RealTimeAlert[];
    options?: TKUserProfile;
    modeInfo?: ModeInfo;
    alertsSlideUpOptions?: TKUISlideUpOptions;
}

interface IProps extends IClientProps, TKUIWithClasses<IStyle, IProps> { }

type IStyle = ReturnType<typeof tKUIServiceRealtimeInfoDefaultStyle>

export type TKUIServiceRealtimeInfoProps = IProps;
export type TKUIServiceRealtimeInfoStyle = IStyle;

const config: TKComponentDefaultConfig<IProps, IStyle> = {
    render: props => <TKUIServiceRealtimeInfo {...props} />,
    styles: tKUIServiceRealtimeInfoDefaultStyle,
    classNamePrefix: "TKUIServiceRealtimeInfo"
};

const TKUIServiceRealtimeInfo: React.FunctionComponent<IProps> = (props: IProps) => {
    const [open, setOpen] = useState<boolean>(false);
    const { wheelchairAccessible, bicycleAccessible, vehicle, alerts, options, modeInfo, alertsSlideUpOptions, t, classes } = props;
    const showWheelchair = true;
    const showBicycle = bicycleAccessible;
    const occupancy = vehicle && vehicle.getOccupancyStatus();
    const alertElems = !alerts ? null :
        open ?
            <div className={classes.alertsSummary}>
                <TKUIAlertsSummary
                    alerts={alerts}
                    slideUpOptions={alertsSlideUpOptions}
                />
            </div> :
            <div className={classes.alertsBrief}>
                {t("X.alerts", { 0: alerts.length })}
            </div>;
    return ((showWheelchair || showBicycle || occupancy !== undefined || alertElems) &&
        <div className={classes.main}>
            <div className={open ? classes.realtimeInfoDetailed : classes.realtimeInfo}>
                {showWheelchair &&
                    <TKUIWheelchairInfo accessible={wheelchairAccessible} brief={!open} />}
                {showBicycle &&
                    <TKUIBicycleInfo accessible={bicycleAccessible} brief={!open} />}
                {occupancy !== undefined ?
                    <TKUIOccupancyInfo status={occupancy}
                        brief={!open} tabIndex={0} /> : undefined}
                {occupancy !== undefined && open && modeInfo?.alt.includes("train") &&
                    <TKUITrainOccupancyInfo components={vehicle!.components!} />}
                {alertElems}
            </div>
            <button
                onClick={() => setOpen(!open)}
                className={classes.iconAngleDown}
                style={open ? { ...genStyles.rotate180 as any } : undefined}
                aria-expanded={open}
                aria-label={"Show realtime info"}
            >
                <IconAngleDown />
            </button>
        </div>
    );
};

export default connect((config: TKUIConfig) => config.TKUIServiceRealtimeInfo, config,
    mapperFromFunction((clientProps: IClientProps) => clientProps));