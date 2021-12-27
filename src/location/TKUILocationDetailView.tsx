import React from "react";
import { TKUIWithClasses, TKUIWithStyle } from "../jss/StyleHelper";
import Location from "../model/Location";
import { TKComponentDefaultConfig, TKUIConfig } from "../config/TKUIConfig";
import { tKUILocationDetailViewDefaultStyle } from "./TKUILocationDetailView.css";
import { connect, mapperFromFunction } from "../config/TKConfigHelper";
import TKUICard, { CardPresentation } from "../card/TKUICard";
import LocationUtil from "../util/LocationUtil";
import TKUIActionsView from "../action/TKUIActionsView";
import TKUIRouteToLocationAction from "../action/TKUIRouteToLocationAction";
import FavouriteStop from "../model/favourite/FavouriteStop";
import TKUIFavouriteAction from "../favourite/TKUIFavouriteAction";
import TKUIShareAction from "../action/TKUIShareAction";
import TKShareHelper from "../share/TKShareHelper";
import StopLocation from "../model/StopLocation";
import { IServiceResultsContext, ServiceResultsContext } from "../service/ServiceResultsProvider";
import TKUIButton, { TKUIButtonType } from "../buttons/TKUIButton";
import { ReactComponent as IconClock } from '../images/ic-clock.svg';
import FavouriteTrip from "../model/favourite/FavouriteTrip";
import TKUILocationDetailField from "./TKUILocationDetailField";
import TKLocationInfo from "../model/location/TKLocationInfo";
import RealTimeAlert from "../model/service/RealTimeAlert";
import TKUIAlertRow from "../alerts/TKUIAlertRow";
import LocationsData from "../data/LocationsData";
import HasCard, { HasCardKeys } from "../card/HasCard";
import TKDefaultGeocoderNames from "../geocode/TKDefaultGeocoderNames";
import RegionsData from "../data/RegionsData";
import Region from "../model/region/Region";
import BikePodLocation from "../model/location/BikePodLocation";
import TransportUtil from "../trip/TransportUtil";
import DateTimeUtil from "../util/DateTimeUtil";
import iconW3w from "../images/location/ic-what3words.png";
import { ReactComponent as IconPhone } from "../images/location/ic-phone.svg";
import { ReactComponent as IconWebsite } from "../images/location/ic-website.svg";
import CarParkLocation from "../model/location/CarParkLocation";
import CompanyInfo from "../model/location/CompanyInfo";
import { ToggleButtonGroup, ToggleButton } from '@material-ui/lab';
import { OpeningHours, PricingTable } from "../model/location/CarParkInfo";
import FreeFloatingVehicleLocation from "../model/location/FreeFloatingVehicleLocation";


export interface IClientProps extends TKUIWithStyle<IStyle, IProps>,
    Pick<HasCard, HasCardKeys.onRequestClose | HasCardKeys.cardPresentation | HasCardKeys.slideUpOptions> {

    /**
     * @ctype
     */
    location: Location;

    /**
     * Allows to specify a list of action buttons (JSX.Elements) associated with the location, to be rendered on card header.
     * It receives the location and the default list of buttons.
     * @ctype @ctype (location: Location, defaultActions: JSX.Element[]) => JSX.Element[]
     * @default _Direction_, _Add to favourites_ actions, and _Share_, which are instances of [](TKUIButton).
     */
    actions?: (location: Location, defaultActions: JSX.Element[]) => JSX.Element[];
}

type IStyle = ReturnType<typeof tKUILocationDetailViewDefaultStyle>;

interface IProps extends IClientProps, TKUIWithClasses<IStyle, IProps> { }

export type TKUILocationDetailViewProps = IProps;
export type TKUILocationDetailViewStyle = IStyle;

const config: TKComponentDefaultConfig<IProps, IStyle> = {
    render: props => <TKUILocationDetailView {...props} />,
    styles: tKUILocationDetailViewDefaultStyle,
    classNamePrefix: "TKUILocationDetailView"
};

interface IState {
    locationInfo?: TKLocationInfo,
    section: string;
}

enum Sections {
    Details = "Details",
    OpeningHours = "Opening.Hours",
    Pricing = "Pricing"
}

class TKUILocationDetailView extends React.Component<IProps, IState> {

    constructor(props: IProps) {
        super(props);
        this.state = {
            section: Sections.Details
        };
        this.getDefaultActions = this.getDefaultActions.bind(this);
    }

    private getDefaultActions(location: Location) {
        const t = this.props.t;
        return (location instanceof StopLocation ? [
            <ServiceResultsContext.Consumer key={1}>
                {(context: IServiceResultsContext) =>
                    <TKUIButton
                        type={TKUIButtonType.PRIMARY_VERTICAL}
                        icon={<IconClock />}
                        text={t("Timetable")}
                        onClick={() =>
                            context.onStopChange(location)
                        }
                    />
                }
            </ServiceResultsContext.Consumer>
        ] : [])
            .concat([
                <TKUIRouteToLocationAction location={location} buttonType={TKUIButtonType.PRIMARY_VERTICAL} key={2} />,
                <TKUIFavouriteAction key={3}
                    favourite={location instanceof StopLocation ? FavouriteStop.create(location) : FavouriteTrip.createForLocation(location)}
                    vertical={true} />,
                <TKUIShareAction
                    title={t("Share")}
                    link={TKShareHelper.getShareLocation(location)}
                    vertical={true}
                    message={""}
                    key={4}
                />
            ]);
    }

    public render(): React.ReactNode {
        const location = this.props.location;
        const title = LocationUtil.getMainText(location, this.props.t);
        const subtitle = LocationUtil.getSecondaryText(location);
        const classes = this.props.classes;
        const defaultActions = this.getDefaultActions(location);
        const actions = this.props.actions ? this.props.actions(location, defaultActions) : defaultActions;
        const subHeader = actions ?
            () => <TKUIActionsView actions={actions} className={classes.actionsPanel} /> : undefined;
        const slideUpOptions = this.props.slideUpOptions ? this.props.slideUpOptions : {};
        const locationInfo = this.state.locationInfo;
        const t = this.props.t;
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
                                        <img src={TransportUtil.getTransportIconLocal("bicycle", false, this.props.theme.isDark)} className={classes.availabilityImage} />
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
                                <img src={TransportUtil.getTransportIconLocal("bicycle-share", false, this.props.theme.isDark)} className={classes.availabilityImage} />
                                <div className={classes.availabilityValue}>
                                    {location.bikePod.availableSpaces !== undefined ? location.bikePod.availableSpaces : "?"}
                                </div>
                            </div>
                        </div>
                    </div>
                    {location.bikePod.lastUpdate &&
                        <div className={classes.availabilityUpdated}>
                            {"Updated: " +
                                DateTimeUtil.momentFromTimeTZ(location.bikePod.lastUpdate * 1000, location.timezone).format("DD MMM YYYY " + DateTimeUtil.TIME_FORMAT)}
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
                                {vehicle.vehicleTypeInfo.formFactorS(t)}
                            </div>
                            <div className={classes.availabilityValueCont}>
                                <img src={TransportUtil.getTransportIconLocal(location.modeInfo.localIcon, false, this.props.theme.isDark)} className={classes.availabilityImage} />
                            </div>
                        </div>
                        <div className={classes.availabilityDivider} />
                        <div className={classes.availabilitySection}>
                            <div className={classes.availabilityLabel}>
                                {t("Battery")}
                            </div>
                            <div className={classes.availabilityValueCont}>
                                <img src={TransportUtil.getTransportIconLocal("bicycle-share", false, this.props.theme.isDark)} className={classes.availabilityImage} />
                                <div className={classes.availabilityValue}>
                                    {vehicle?.batteryLevel !== undefined ? vehicle.batteryLevel + "%" : "?"}
                                </div>
                            </div>
                        </div>
                    </div>
                    {vehicle.lastUpdate &&
                        <div className={classes.availabilityUpdated}>
                            {"Updated: " +
                                DateTimeUtil.momentFromTimeTZ(vehicle.lastUpdate * 1000, location.timezone).format("DD MMM YYYY " + DateTimeUtil.TIME_FORMAT)}
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
                                        <img src={TransportUtil.getTransportIconLocal("car", false, this.props.theme.isDark)}
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
                                <img src={TransportUtil.getTransportIconLocal("parking", false, this.props.theme.isDark)} className={classes.availabilityImage} />
                                <div className={classes.availabilityValue}>
                                    {location.carPark.totalSpaces !== undefined ? location.carPark.totalSpaces : "?"}
                                </div>
                            </div>
                        </div>
                    </div>
                    {location.carPark.lastUpdate &&
                        <div className={classes.availabilityUpdated}>
                            {"Updated: " +
                                DateTimeUtil.momentFromTimeTZ(location.carPark.lastUpdate * 1000, location.timezone).format("DD MMM YYYY " + DateTimeUtil.TIME_FORMAT)}
                        </div>}
                </div>);
            operator = location.carPark.operator;
        }
        if (operator) {
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
                <TKUILocationDetailField title={locationInfo.details.w3w}
                    subtitle={
                        <a href={locationInfo.details.w3wInfoURL} target="_blank" tabIndex={-1}>
                            {t("what3words.address")}
                        </a>}
                    icon={iconW3w}
                    key={"w3w"}
                />);
        }

        const onSectionChange = (event, newSection) => {
            this.setState({ section: newSection });
        };

        const tabs =
            <ToggleButtonGroup value={this.state.section} exclusive onChange={onSectionChange} aria-label="text formatting">
                <ToggleButton value={Sections.Details}>
                    {t(Sections.Details)}
                </ToggleButton>
                <ToggleButton value={Sections.OpeningHours}>
                    {t(Sections.OpeningHours)}
                </ToggleButton>
                <ToggleButton value={Sections.Pricing}>
                    {t(Sections.Pricing)}
                </ToggleButton>
            </ToggleButtonGroup>;

        return (
            <TKUICard
                title={title}
                subtitle={subtitle}
                ariaLabel={title + " " + subtitle + " location detail"}
                renderSubHeader={subHeader}
                presentation={this.props.cardPresentation !== undefined ? this.props.cardPresentation : CardPresentation.SLIDE_UP}
                slideUpOptions={slideUpOptions}
                onRequestClose={this.props.onRequestClose}
            >
                {/*{tabs}*/}
                {this.state.section === Sections.Details &&
                    <div className={classes.main}>
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
                    </div>}
            </TKUICard>
        );
    }

    public componentDidMount() {
        // TODO: if this.props.location already has w3w data (e.g. is a SkedgoGeocoder result that has details)
        // then use that value.
        const location = this.props.location;
        RegionsData.instance.getRegionP(location).then((region?: Region) =>
            LocationsData.instance.getLocationInfo(location.source === TKDefaultGeocoderNames.skedgo && location.id ?
                location.id : location, location.source === TKDefaultGeocoderNames.skedgo && location.id && region ?
                region.name : undefined)
                .then((result: TKLocationInfo) => this.setState({ locationInfo: result }))
                .catch((e) => console.log(e)));
    }

}

export default connect((config: TKUIConfig) => config.TKUILocationDetailView, config,
    mapperFromFunction((clientProps: IClientProps) => clientProps));