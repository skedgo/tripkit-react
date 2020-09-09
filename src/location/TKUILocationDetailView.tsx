import * as React from "react";
import {CSSProps, TKUIWithClasses, TKUIWithStyle} from "../jss/StyleHelper";
import Location from "../model/Location";
import {TKComponentDefaultConfig, TKUIConfig} from "../config/TKUIConfig";
import {tKUILocationDetailViewDefaultStyle} from "./TKUILocationDetailView.css";
import {connect, mapperFromFunction} from "../config/TKConfigHelper";
import TKUICard, {CardPresentation} from "../card/TKUICard";
import LocationUtil from "../util/LocationUtil";
import TKUIActionsView from "../action/TKUIActionsView";
import TKUIRouteToLocationAction from "../action/TKUIRouteToLocationAction";
import FavouriteStop from "../model/favourite/FavouriteStop";
import TKUIFavouriteAction from "../favourite/TKUIFavouriteAction";
import TKUIShareAction from "../action/TKUIShareAction";
import TKShareHelper from "../share/TKShareHelper";
import StopLocation from "../model/StopLocation";
import {IServiceResultsContext, ServiceResultsContext} from "../service/ServiceResultsProvider";
import TKUIButton, {TKUIButtonType} from "../buttons/TKUIButton";
import {ReactComponent as IconClock} from '../images/ic-clock.svg';
import FavouriteTrip from "../model/favourite/FavouriteTrip";
import {TKUISlideUpOptions} from "../card/TKUISlideUp";
import TKUIW3w from "./TKUIW3w";
import TKLocationInfo from "../model/location/TKLocationInfo";
import RealTimeAlert from "../model/service/RealTimeAlert";
import TKUIAlertRow from "../alerts/TKUIAlertRow";
import LocationsData from "../data/LocationsData";

export interface IClientProps extends TKUIWithStyle<IStyle, IProps> {
    location: Location;
    slideUpOptions?: TKUISlideUpOptions;
    actions?: (location: Location, defaultActions: (JSX.Element | null)[]) => (JSX.Element | null)[];
}

export interface IStyle {
    main: CSSProps<IProps>;
    actionsPanel: CSSProps<IProps>;
    alertsContainer: CSSProps<IProps>;
}

interface IProps extends IClientProps, TKUIWithClasses<IStyle, IProps> {}

export type TKUILocationDetailViewProps = IProps;
export type TKUILocationDetailViewStyle = IStyle;

const config: TKComponentDefaultConfig<IProps, IStyle> = {
    render: props => <TKUILocationDetailView {...props}/>,
    styles: tKUILocationDetailViewDefaultStyle,
    classNamePrefix: "TKUILocationDetailView"
};

interface IState {
    locationInfo?: TKLocationInfo
}

class TKUILocationDetailView extends React.Component<IProps, IState> {

    constructor(props: IProps) {
        super(props);
        this.state = {};
        this.getDefaultActions = this.getDefaultActions.bind(this);
    }

    private getDefaultActions(location: Location) {
        const t = this.props.t;
        return [
            location instanceof StopLocation ?
                <ServiceResultsContext.Consumer>
                    {(context: IServiceResultsContext) =>
                        <TKUIButton
                            type={TKUIButtonType.PRIMARY_VERTICAL}
                            icon={<IconClock/>}
                            text={t("Timetable")}
                            onClick={() =>
                                context.onStopChange(location)
                            }
                        />
                    }
                </ServiceResultsContext.Consumer>
                : null,
            <TKUIRouteToLocationAction location={location} buttonType={TKUIButtonType.PRIMARY_VERTICAL} key={2}/>,
            <TKUIFavouriteAction key={3}
                                 favourite={location instanceof StopLocation ? FavouriteStop.create(location) : FavouriteTrip.createForLocation(location)}
                                 vertical={true}/>,
            <TKUIShareAction
                title={t("Share")}
                link={TKShareHelper.getShareLocation(location)}
                vertical={true}
                message={""}
                key={4}
            />
        ]
    }

    public render(): React.ReactNode {
        const location = this.props.location;
        const title = LocationUtil.getMainText(location, this.props.t);
        const subtitle = LocationUtil.getSecondaryText(location);
        const classes = this.props.classes;
        const defaultActions = this.getDefaultActions(location);
        const actions = this.props.actions ? this.props.actions(location, defaultActions) : defaultActions;
        const subHeader = actions ?
            () => <TKUIActionsView actions={actions} className={classes.actionsPanel}/> : undefined;
        const slideUpOptions = this.props.slideUpOptions ? this.props.slideUpOptions : {};
        const locationInfo = this.state.locationInfo;
        return (
            <TKUICard
                title={title}
                subtitle={subtitle}
                renderSubHeader={subHeader}
                presentation={CardPresentation.SLIDE_UP}
                slideUpOptions={slideUpOptions}
            >
                <div className={classes.main}>
                    {locationInfo && locationInfo.alerts && locationInfo.alerts.length > 0 &&
                    <div className={classes.alertsContainer}>
                        {locationInfo.alerts.map((alert: RealTimeAlert, i: number) =>
                            <TKUIAlertRow alert={alert} key={i} asCard={true}/>
                        )}
                    </div>}
                    {locationInfo && locationInfo.details && locationInfo.details.w3w &&
                    <TKUIW3w w3w={locationInfo.details.w3w} w3wInfoURL={locationInfo.details.w3wInfoURL}/>}
                </div>
            </TKUICard>
        );
    }

    public componentDidMount() {
        // TODO: if this.props.location already has w3w data (e.g. is a SkedgoGeocoder result that has details)
        // then use that value.
        LocationsData.instance.getLocationInfo(this.props.location)
            .then((result: TKLocationInfo) => this.setState({locationInfo: result}))
            .catch((e) => console.log(e));
    }

}

export default connect((config: TKUIConfig) => config.TKUILocationDetailView, config,
    mapperFromFunction((clientProps: IClientProps) => clientProps));