import * as React from "react";
import {CSSProps, TKUIWithClasses, TKUIWithStyle} from "../jss/StyleHelper";
import {ITKUIComponentDefaultConfig, TKUIConfig} from "../config/TKUIConfig";
import {tKUISearchBarDefaultStyle} from "./TKUISearchBar.css";
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
import FavouriteLocation from "../model/favourite/FavouriteLocation";

interface IClientProps extends TKUIWithStyle<IStyle, IProps> {
    onShowSideBar?: () => void;
    geocoderOptions?: MultiGeocoderOptions;
    onDirectionsClicked?: () => void;
}

interface IConsumedProps {
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

export type TKUISearchBarProps = IProps;
export type TKUISearchBarStyle = IStyle;

const config: ITKUIComponentDefaultConfig<IProps, IStyle> = {
    render: props => <TKUISearchBar {...props}/>,
    styles: tKUISearchBarDefaultStyle,
    classNamePrefix: "TKUISearchBar"
};

class TKUISearchBar extends React.Component<IProps, {}> {

    private geocodingData: MultiGeocoder;


    constructor(props: IProps) {
        super(props);
        this.geocodingData = new MultiGeocoder(this.props.geocoderOptions);
    }

    public render(): React.ReactNode {
        const classes = this.props.classes;
        const placeholder = "Where do you want to go?";
        return (
            <div className={classes.main}>
                <button className={classes.sideBarBtn}>
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
                    menuStyle={this.props.injectedStyles.resultsMenu}
                />
                <div className={classes.divider}/>
                <button className={classes.directionsBtn} onClick={this.props.onDirectionsClicked}>
                    <IconDirections className={classes.directionsIcon}/>
                </button>
            </div>
        );
    }

}

const Consumer: React.SFC<{children: (props: IConsumedProps) => React.ReactNode}> = props => {
    return (
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
                                FavouriteStop.create(value) : FavouriteLocation.create(value));
                        }
                    },
                    onPreChange: routingContext.onPreChange &&
                    ((location?: Location) => routingContext.onPreChange!(false, location)),
                    bounds: bounds,
                    focusLatLng: focusLatLng
                };
                return props.children!(consumerProps);
            }}
        </RoutingResultsContext.Consumer>
    );
};

const Mapper: PropsMapper<IClientProps, Subtract<IProps, TKUIWithClasses<IStyle, IProps>>> =
    ({inputProps, children}) =>
        <Consumer>
            {(consumedProps: IConsumedProps) =>
                children!({...inputProps, ...consumedProps})}
        </Consumer>;

export default connect((config: TKUIConfig) => config.TKUISearchBar, config, Mapper);