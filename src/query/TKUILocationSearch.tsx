import * as React from "react";
import {CSSProps, TKUIWithClasses, TKUIWithStyle} from "../jss/StyleHelper";
import {TKComponentDefaultConfig, TKUIConfig} from "../config/TKUIConfig";
import {tKUILocationSearchDefaultStyle} from "./TKUILocationSearch.css";
import {connect, PropsMapper} from "../config/TKConfigHelper";
import MultiGeocoderOptions from "../geocode/MultiGeocoderOptions";
import Location from "../model/Location";
import BBox from "../model/BBox";
import LatLng from "../model/LatLng";
import {IRoutingResultsContext, RoutingResultsContext} from "../trip-planner/RoutingResultsProvider";
import {Subtract} from "utility-types";
import Util from "../util/Util";
import LocationBox from "../location_box/LocationBox";
import MultiGeocoder from "../geocode/MultiGeocoder";
import {ReactComponent as IconMenu} from '../images/ic-menu.svg';
import {ReactComponent as IconGlass} from "../images/ic-glass.svg";
import {ReactComponent as IconDirections} from '../images/ic-directions.svg';
import FavouritesData from "../data/FavouritesData";
import StopLocation from "../model/StopLocation";
import FavouriteStop from "../model/favourite/FavouriteStop";
import FavouriteTrip from "../model/favourite/FavouriteTrip";
import {TKUIViewportUtil, TKUIViewportUtilProps} from "../util/TKUIResponsiveUtil";

interface IClientProps extends TKUIWithStyle<IStyle, IProps> {
    onShowSideBar?: () => void;
    geocoderOptions?: MultiGeocoderOptions;
    onDirectionsClicked?: () => void;
}

interface IConsumedProps extends TKUIViewportUtilProps {
    value: Location | null;
    onChange?: (value: Location | null) => void;
    onPreChange?: (location?: Location) => void;
    bounds?: BBox;
    focusLatLng?: LatLng;
}

interface IProps extends IConsumedProps, IClientProps, TKUIWithClasses<IStyle, IProps> {}

interface IStyle {
    main: CSSProps<IProps>;
    sideBarBtn: CSSProps<IProps>;
    sideBarIcon: CSSProps<IProps>;
    locationBox: CSSProps<IProps>;
    locationBoxInput: CSSProps<IProps>;
    resultsMenu: CSSProps<IProps>;
    glassIcon: CSSProps<IProps>;
    divider: CSSProps<IProps>;
    directionsBtn: CSSProps<IProps>;
    directionsIcon: CSSProps<IProps>;
}

export type TKUILocationSearchProps = IProps;
export type TKUILocationSearchStyle = IStyle;

const config: TKComponentDefaultConfig<IProps, IStyle> = {
    render: props => <TKUILocationSearch {...props}/>,
    styles: tKUILocationSearchDefaultStyle,
    classNamePrefix: "TKUILocationSearch"
};

class TKUILocationSearch extends React.Component<IProps, {}> {

    private geocodingData: MultiGeocoder;


    constructor(props: IProps) {
        super(props);
        this.geocodingData = new MultiGeocoder(this.props.geocoderOptions || MultiGeocoderOptions.default(false));
    }

    public render(): React.ReactNode {
        const classes = this.props.classes;
        const placeholder = this.props.t("Where.do.you.want.to.go?");
        return (
            <TKUIViewportUtil>
                {(viewportProps: TKUIViewportUtilProps) =>
                    <div className={classes.main}>
                        <button className={classes.sideBarBtn} onClick={this.props.onShowSideBar}>
                            <IconMenu className={classes.sideBarIcon}/>
                        </button>
                        <LocationBox
                            geocodingData={this.geocodingData}
                            bounds={this.props.bounds}
                            focus={this.props.focusLatLng}
                            value={this.props.value}
                            placeholder={placeholder}
                            onChange={(value: Location | null, highlighted: boolean) => {
                                if (!highlighted) {
                                    this.props.onChange && this.props.onChange(value);
                                    if (this.props.onPreChange) {
                                        this.props.onPreChange(undefined);
                                    }
                                } else {
                                    if (this.props.onPreChange) {
                                        this.props.onPreChange(value ? value : undefined);
                                    }
                                }
                            }}
                            iconEmpty={<IconGlass className={classes.glassIcon}/>}
                            style={this.props.injectedStyles.locationBox}
                            inputStyle={this.props.injectedStyles.locationBoxInput}
                            menuStyle={{
                                ...this.props.injectedStyles.resultsMenu,
                                width: this.props.portrait ? 'calc(100% + 69px)' : 'calc(100% + 123px)'
                            }}
                        />
                        {viewportProps.landscape &&
                        <div className={classes.divider}/>}
                        {viewportProps.landscape &&
                        <button className={classes.directionsBtn} onClick={this.props.onDirectionsClicked}>
                            <IconDirections className={classes.directionsIcon}/>
                        </button>}
                    </div>
                }
            </TKUIViewportUtil>
        );
    }

}

const Consumer: React.SFC<{children: (props: IConsumedProps) => React.ReactNode}> = props => {
    return (
        <TKUIViewportUtil>
            {(viewportProps: TKUIViewportUtilProps) =>
                <RoutingResultsContext.Consumer>
                    {(routingContext: IRoutingResultsContext) => {
                        const region = routingContext.region;
                        const bounds = region ? region.bounds : undefined;
                        const focusLatLng = region ? (region.cities.length !== 0 ? region.cities[0] : region.bounds.getCenter()) : undefined;
                        const consumerProps: IConsumedProps = {
                            value: routingContext.query.to,
                            onChange: (value: Location | null) => {
                                routingContext.onQueryChange(Util.iAssign(routingContext.query, {to: value}));
                                if (value !== null && !value.isCurrLoc()) {
                                    FavouritesData.recInstance.add(value instanceof StopLocation ?
                                        FavouriteStop.create(value) : FavouriteTrip.createForLocation(value));
                                }
                            },
                            onPreChange: routingContext.onPreChange &&
                            ((location?: Location) => routingContext.onPreChange!(false, location)),
                            bounds: bounds,
                            focusLatLng: focusLatLng,
                            ...viewportProps
                        };
                        return props.children!(consumerProps);
                    }}
                </RoutingResultsContext.Consumer>
            }
        </TKUIViewportUtil>
    );
};

const Mapper: PropsMapper<IClientProps, Subtract<IProps, TKUIWithClasses<IStyle, IProps>>> =
    ({inputProps, children}) =>
        <Consumer>
            {(consumedProps: IConsumedProps) =>
                children!({...inputProps, ...consumedProps})}
        </Consumer>;

export default connect((config: TKUIConfig) => config.TKUILocationSearch, config, Mapper);