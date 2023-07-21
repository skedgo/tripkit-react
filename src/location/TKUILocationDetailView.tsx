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
import TKLocationInfo from "../model/location/TKLocationInfo";
import HasCard, { HasCardKeys } from "../card/HasCard";
import TKUILocationDetail from "./TKUILocationDetail";
import Util from "../util/Util";
import CarPodLocation from "../model/location/CarPodLocation";


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

class TKUILocationDetailView extends React.Component<IProps, IState> {

    constructor(props: IProps) {
        super(props);
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
        let location = this.props.location;
        if (process.env.NODE_ENV === 'development') {
            location = Util.deserialize(require("../mock/data/location-carPods-sgfleet-2023-07-19.json"), CarPodLocation);
        }
        const title = LocationUtil.getMainText(location, this.props.t);
        const subtitle = LocationUtil.getSecondaryText(location);
        const classes = this.props.classes;
        const defaultActions = this.getDefaultActions(location);
        const actions = this.props.actions ? this.props.actions(location, defaultActions) : defaultActions;
        const subHeader = actions ?
            () => <TKUIActionsView actions={actions} className={classes.actionsPanel} /> : undefined;
        const slideUpOptions = this.props.slideUpOptions ? this.props.slideUpOptions : {};
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
                <TKUILocationDetail location={location}/>
            </TKUICard>
        );
    }

}

export default connect((config: TKUIConfig) => config.TKUILocationDetailView, config,
    mapperFromFunction((clientProps: IClientProps) => clientProps));