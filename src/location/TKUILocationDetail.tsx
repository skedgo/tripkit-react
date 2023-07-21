import React, { Fragment, useContext, useEffect, useState } from "react";
import { TKUIWithClasses, TKUIWithStyle } from "../jss/StyleHelper";
import Location from "../model/Location";
import { TKComponentDefaultConfig, TKUIConfig } from "../config/TKUIConfig";
import { connect, mapperFromFunction } from "../config/TKConfigHelper";
import TKUILocationDetailField from "./TKUILocationDetailField";
import TKLocationInfo from "../model/location/TKLocationInfo";
import RealTimeAlert from "../model/service/RealTimeAlert";
import TKUIAlertRow from "../alerts/TKUIAlertRow";
import LocationsData from "../data/LocationsData";
import TKDefaultGeocoderNames from "../geocode/TKDefaultGeocoderNames";
import RegionsData from "../data/RegionsData";
import Region from "../model/region/Region";
import BikePodLocation from "../model/location/BikePodLocation";
import TransportUtil from "../trip/TransportUtil";
import DateTimeUtil from "../util/DateTimeUtil";
import { ReactComponent as IconPhone } from "../images/location/ic-phone.svg";
import { ReactComponent as IconWebsite } from "../images/location/ic-website.svg";
import { ReactComponent as IconOpenApp } from "../images/location/ic-open-app.svg";
import { ReactComponent as IconW3W } from "../images/location/ic-what3word.svg";
import CarParkLocation from "../model/location/CarParkLocation";
import CompanyInfo from "../model/location/CompanyInfo";
import { ToggleButtonGroup, ToggleButton } from '@material-ui/lab';
import { OpeningHours, PricingTable } from "../model/location/CarParkInfo";
import FreeFloatingVehicleLocation from "../model/location/FreeFloatingVehicleLocation";
import { renderBatteryIcon } from "../map/TKUIMapLocationPopup";
import { tKUILocationDetailDefaultStyle } from "./TKUILocationDetail.css";
import DeviceUtil from "../util/DeviceUtil";
import CarPodLocation from "../model/location/CarPodLocation";
import TKUIVehicleAvailability from "./TKUIVehicleAvailability";
import { RoutingResultsContext } from "../trip-planner/RoutingResultsProvider";

export interface IClientProps extends TKUIWithStyle<IStyle, IProps> {
    /**
     * @ctype
     */
    location: Location;
}

type IStyle = ReturnType<typeof tKUILocationDetailDefaultStyle>;

interface IProps extends IClientProps, TKUIWithClasses<IStyle, IProps> { }

export type TKUILocationDetailProps = IProps;
export type TKUILocationDetailStyle = IStyle;

const config: TKComponentDefaultConfig<IProps, IStyle> = {
    render: props => <TKUILocationDetail {...props} />,
    styles: tKUILocationDetailDefaultStyle,
    classNamePrefix: "TKUILocationDetail"
};

enum Sections {
    Details = "Details",
    OpeningHours = "Opening.Hours",
    Pricing = "Pricing",
    Vehicles = "Vehicles"
}

const TKUILocationDetail: React.FunctionComponent<IProps> = (props: IProps) => {
    const { location, t, classes, theme } = props;
    const hasVehicleAvailability = location instanceof CarPodLocation && location.supportsVehicleAvailability;

    const [section, setSection] = useState<Sections>(hasVehicleAvailability ? Sections.Vehicles : Sections.Details);
    const [locationInfo, setLocationInfo] = useState<TKLocationInfo | undefined>();

    // TODO Analyze if doing this. Need to wait for region.timezone to be available to display vehicle availability
    const { region } = useContext(RoutingResultsContext);

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
    let moreInfoItems: React.ReactElement[] = [];
    let operator: CompanyInfo | undefined = undefined;
    let openingHours: OpeningHours | undefined = undefined;
    let pricingTable: PricingTable | undefined = undefined;
    if (location instanceof BikePodLocation) {
        moreInfoItems.push(
            <div className={classes.availabilityInfo} key={"availability"}>
                <div className={classes.availabilityInfoBody}>
                    {location.bikePod.availableBikes !== undefined &&
                        <React.Fragment>
                            <div className={classes.availabilitySection}>
                                <div className={classes.availabilityLabel}>
                                    {t("Available.bikes")}
                                </div>
                                <div className={classes.availabilityValueCont}>
                                    <img src={TransportUtil.getTransportIconLocal("bicycle", false, theme.isDark)} className={classes.availabilityImage} />
                                    <div className={classes.availabilityValue}>
                                        {location.bikePod.availableBikes}
                                    </div>
                                </div>
                            </div>
                            <div className={classes.availabilityDivider} />
                        </React.Fragment>}
                    <div className={classes.availabilitySection}>
                        <div className={classes.availabilityLabel}>
                            {t("Empty.docks")}
                        </div>
                        <div className={classes.availabilityValueCont}>
                            <img src={TransportUtil.getTransportIconLocal("bicycle-share", false, theme.isDark)} className={classes.availabilityImage} />
                            <div className={classes.availabilityValue}>
                                {location.bikePod.availableSpaces !== undefined ? location.bikePod.availableSpaces : "?"}
                            </div>
                        </div>
                    </div>
                </div>
                {location.bikePod.lastUpdate &&
                    <div className={classes.availabilityUpdated}>
                        {"Updated: " +
                            DateTimeUtil.momentFromTimeTZ(location.bikePod.lastUpdate * 1000, location.timezone).format("DD MMM YYYY " + DateTimeUtil.timeFormat())}
                    </div>}
            </div>);
        operator = location.bikePod.operator;
    } else if (location instanceof FreeFloatingVehicleLocation) {
        const vehicle = location.vehicle;
        moreInfoItems.push(
            <div className={classes.availabilityInfo} key={"availability"}>
                <div className={classes.availabilityInfoBody}>
                    <div className={classes.availabilitySection}>
                        <div className={classes.availabilityLabel}>
                            {vehicle.vehicleTypeInfo.vehicleTypeS(t)}
                        </div>
                        <div className={classes.availabilityValueCont}>
                            <img src={TransportUtil.getTransportIconLocal(location.modeInfo.localIcon, false, theme.isDark)} className={classes.availabilityImage} />
                        </div>
                    </div>
                    {(vehicle.vehicleTypeInfo.propulsionType === "ELECTRIC" || vehicle.vehicleTypeInfo.propulsionType === "ELECTRIC_ASSIST") &&
                        <Fragment>
                            <div className={classes.availabilityDivider} />
                            <div className={classes.availabilitySection}>
                                <div className={classes.availabilityLabel}>
                                    {t("Battery")}
                                </div>
                                <div className={classes.availabilityValueCont}>
                                    {renderBatteryIcon(vehicle?.batteryLevel || 0)}
                                    <div className={classes.availabilityValue}>
                                        {vehicle?.batteryLevel !== undefined ? vehicle.batteryLevel + "%" : "?"}
                                    </div>
                                </div>
                            </div>
                        </Fragment>}
                </div>
                {vehicle.lastUpdate &&
                    <div className={classes.availabilityUpdated}>
                        {"Updated: " +
                            DateTimeUtil.momentFromTimeTZ(vehicle.lastUpdate * 1000, location.timezone).format("DD MMM YYYY " + DateTimeUtil.timeFormat())}
                    </div>}
            </div>);
        operator = vehicle.operator;
    } else if (location instanceof CarParkLocation) {
        moreInfoItems.push(
            <div className={classes.availabilityInfo} key={"availability"}>
                <div className={classes.availabilityInfoBody}>
                    {location.carPark.availableSpaces !== undefined &&
                        <React.Fragment>
                            <div className={classes.availabilitySection}>
                                <div className={classes.availabilityLabel}>
                                    {t("Available.spots")}
                                </div>
                                <div className={classes.availabilityValueCont}>
                                    <img src={TransportUtil.getTransportIconLocal("car", false, theme.isDark)}
                                        className={classes.availabilityImage} />
                                    <div className={classes.availabilityValue}>
                                        {location.carPark.availableSpaces}
                                    </div>
                                </div>
                            </div>
                            <div className={classes.availabilityDivider} />
                        </React.Fragment>}
                    <div className={classes.availabilitySection}>
                        <div className={classes.availabilityLabel}>
                            {t("Total.spaces")}
                        </div>
                        <div className={classes.availabilityValueCont}>
                            <img src={TransportUtil.getTransportIconLocal("parking", false, theme.isDark)} className={classes.availabilityImage} />
                            <div className={classes.availabilityValue}>
                                {location.carPark.totalSpaces !== undefined ? location.carPark.totalSpaces : "?"}
                            </div>
                        </div>
                    </div>
                </div>
                {location.carPark.lastUpdate &&
                    <div className={classes.availabilityUpdated}>
                        {"Updated: " +
                            DateTimeUtil.momentFromTimeTZ(location.carPark.lastUpdate * 1000, location.timezone).format("DD MMM YYYY " + DateTimeUtil.timeFormat())}
                    </div>}
            </div>);
        operator = location.carPark.operator;
    }
    if (operator) {
        let storeUrl;
        if (DeviceUtil.isIOS && operator?.appInfo?.appURLiOS) {
            storeUrl = operator?.appInfo?.appURLiOS;
        } else if (DeviceUtil.isAndroid && operator?.appInfo?.appURLAndroid) {
            storeUrl = operator?.appInfo?.appURLAndroid;
        }
        if (storeUrl) {
            moreInfoItems.push(
                <TKUILocationDetailField
                    title={<a href={storeUrl}>Open app</a>}
                    icon={<IconOpenApp />}
                    key={"open_app"}
                />
            )
        }
        // if (operator?.appInfo?.deepLink) {
        //     moreInfoItems.push(
        //         <TKUILocationDetailField
        //             title={
        //                 <a onClick={() => {
        //                     var now = new Date().valueOf();
        //                     setTimeout(() => {
        //                         if (new Date().valueOf() - now > 2000) return;
        //                         window.location.assign(operator?.appInfo?.appURLiOS!);
        //                     }, 200);
        //                     window.location.assign(operator?.appInfo?.deepLink!);
        //                 }}
        //                     style={{ cursor: "pointer" }}>
        //                     Open app
        //                 </a>
        //                 }
        //             icon={<IconOpenApp />}
        //             key={"open_app2"}
        //         />);
        // }
        // window.location.assign("intent://instagram.com/#Intent;scheme=https;package=com.instagram.android;end");
        // window.location.assign("intent://www.rideneuron.com/#Intent;scheme=nss;package=com.hhyu.neuron;end");        

        operator.phone &&
            moreInfoItems.push(
                <TKUILocationDetailField title={'tel:' + operator.phone}
                    icon={<IconPhone />}
                    key={"tel"}
                />
            );
        operator.website &&
            moreInfoItems.push(
                <TKUILocationDetailField title={operator.website}
                    icon={<IconWebsite />}
                    key={"website"}
                />)
    }
    if (locationInfo && locationInfo.details && locationInfo.details.w3w) {
        moreInfoItems.push(
            <TKUILocationDetailField
                title={locationInfo.details.w3w}
                subtitle={
                    <a href={locationInfo.details.w3wInfoURL} target="_blank" tabIndex={-1}>
                        {t("what3words.address")}
                    </a>}
                icon={<IconW3W />}
                styles={{
                    icon: defaultStyle => {
                        const newDefaultStyle = { ...defaultStyle };
                        delete newDefaultStyle['& path'];
                        return newDefaultStyle;
                    }
                }}
                key={"w3w"}
            />);
    }

    const onSectionChange = (event, newSection) => setSection(newSection);

    const tabs = (hasVehicleAvailability || openingHours || pricingTable) &&
        <ToggleButtonGroup value={section} exclusive onChange={onSectionChange} aria-label="text formatting">
            {hasVehicleAvailability &&
                <ToggleButton value={Sections.Vehicles} disableFocusRipple disableTouchRipple>
                    {t(Sections.Vehicles)}
                </ToggleButton>}
            <ToggleButton value={Sections.Details} disableFocusRipple disableTouchRipple>
                {t(Sections.Details)}
            </ToggleButton>
            {openingHours &&
                <ToggleButton value={Sections.OpeningHours} disableFocusRipple disableTouchRipple>
                    {t(Sections.OpeningHours)}
                </ToggleButton>}
            {pricingTable &&
                <ToggleButton value={Sections.Pricing} disableFocusRipple disableTouchRipple>
                    {t(Sections.Pricing)}
                </ToggleButton>}
        </ToggleButtonGroup>;

    let content;
    switch (section) {
        case Sections.Details:
            content =
                <div className={classes.details}>
                    {locationInfo && locationInfo.alerts && locationInfo.alerts.length > 0 &&
                        <div className={classes.alertsContainer}>
                            {locationInfo.alerts.map((alert: RealTimeAlert, i: number) =>
                                <TKUIAlertRow alert={alert} key={i} asCard={true} />
                            )}
                        </div>}
                    {/*{typeSpecificInfo}*/}
                    <div className={classes.fields}>
                        {moreInfoItems}
                    </div>
                </div>;
            break;
        case Sections.Vehicles:
            content = region &&
                <TKUIVehicleAvailability location={location as CarPodLocation}/>
    }

    return (
        <div className={classes.main}>
            {tabs}
            {content}
        </div>
    );
}

export default connect((config: TKUIConfig) => config.TKUILocationDetail, config,
    mapperFromFunction((clientProps: IClientProps) => clientProps));