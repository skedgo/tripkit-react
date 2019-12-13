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

export interface IClientProps extends TKUIWithStyle<IStyle, IProps> {
    location: Location;
    top?: number;
}

export interface IStyle {
    main: CSSProps<IProps>;
    actionsPanel: CSSProps<IProps>;
}

interface IProps extends IClientProps, TKUIWithClasses<IStyle, IProps> {
    actions?: (location: Location) => (JSX.Element | undefined)[];
}

export type TKUILocationDetailViewProps = IProps;
export type TKUILocationDetailViewStyle = IStyle;

const config: TKComponentDefaultConfig<IProps, IStyle> = {
    render: props => <TKUILocationDetailView {...props}/>,
    styles: tKUILocationDetailViewDefaultStyle,
    classNamePrefix: "TKUILocationDetailView",
    props: {
        actions: (location: Location) => [
            location instanceof StopLocation ?
            <ServiceResultsContext.Consumer key={1}>
                {(context: IServiceResultsContext) =>
                    <TKUIButton
                        type={TKUIButtonType.PRIMARY_VERTICAL}
                        icon={<IconClock/>}
                        text={"Timetable"}
                        onClick={() =>
                            context.onStopChange(location)
                        }
                    />
                }
            </ServiceResultsContext.Consumer> : undefined,
            <TKUIRouteToLocationAction location={location} buttonType={TKUIButtonType.PRIMARY_VERTICAL} key={2}/>,
            <TKUIFavouriteAction key={3} favourite={location instanceof StopLocation ? FavouriteStop.create(location) : FavouriteTrip.createForLocation(location)} vertical={true}/>,
            <TKUIShareAction
                title={"Share location"}
                link={TKShareHelper.getShareLocation(location)}
                vertical={true}
                message={""}
                key={4}
            />
        ]
    }
};

class TKUILocationDetailView extends React.Component<IProps, {}> {

    public render(): React.ReactNode {
        const location = this.props.location;
        const title = LocationUtil.getMainText(location);
        const subtitle = LocationUtil.getSecondaryText(location);
        const classes = this.props.classes;
        const subHeader = this.props.actions ?
            () => <TKUIActionsView actions={this.props.actions!(location)} className={classes.actionsPanel}/> : undefined;
        return (
            <TKUICard
                title={title}
                subtitle={subtitle}
                renderSubHeader={subHeader}
                presentation={CardPresentation.SLIDE_UP}
                top={this.props.top}
                // onRequestClose={this.props.onRequestClose}
            >
                <div className={classes.main}>

                </div>
            </TKUICard>
        );
    }

}

export default connect((config: TKUIConfig) => config.TKUILocationDetailView, config,
    mapperFromFunction((clientProps: IClientProps) => clientProps));