import * as React from "react";
import {TKUIWithClasses, TKUIWithStyle} from "../jss/StyleHelper";
import {TKComponentDefaultConfig, TKUIConfig} from "../config/TKUIConfig";
import {tKUILocationSearchDefaultStyle} from "./TKUILocationSearch.css";
import {connect, PropsMapper} from "../config/TKConfigHelper";
import Location from "../model/Location";
import BBox from "../model/BBox";
import LatLng from "../model/LatLng";
import {IRoutingResultsContext, RoutingResultsContext} from "../trip-planner/RoutingResultsProvider";
import {Subtract} from "utility-types";
import Util from "../util/Util";
import TKUILocationBox, {TKUILocationBoxRef} from "../location_box/TKUILocationBox";
import FavouritesData from "../data/FavouritesData";
import StopLocation from "../model/StopLocation";
import FavouriteStop from "../model/favourite/FavouriteStop";
import FavouriteTrip from "../model/favourite/FavouriteTrip";

interface IClientProps extends TKUIWithStyle<IStyle, IProps> {
    from?: boolean;
}

interface IConsumedProps {
    /**
     * Destination location.
     * @default {@link TKState#query}.to
     * @ctype
     */
    value: Location | null;

    /**
     * Destination location change callback.
     * @ctype
     * @default Callback updating {@link TKState#query}.to
     */
    onChange?: (value: Location | null) => void;

    /**
     * @ctype
     * @default {@link TKState#onPreChange}
     */
    onPreChange?: (location?: Location) => void;

    /**
     * @ctype
     * @default {@link TKState#onInputTextChange}
     */
    onInputTextChange?: (text: string) => void;

    /**
     * Bounding box to restrict from / to location search.
     * @ctype
     * @default Bounds of the current region: {@link TKState#region}.bounds
     */
    bounds?: BBox;

    /**
     * Coordinates to focus location search.
     * @ctype
     * @default The center of the main city of current region ({@link TKState#region})
     */
    focusLatLng?: LatLng;

    onLocationBoxRef?: (ref: TKUILocationBoxRef) => void;
}

interface IProps extends IConsumedProps, IClientProps, TKUIWithClasses<IStyle, IProps> {}

interface IStyle {
}

export type TKUIQueryLocationBoxProps = IProps;
export type TKUIQueryLocationBoxStyle = IStyle;

const config: TKComponentDefaultConfig<IProps, IStyle> = {
    render: props => <TKUIQueryLocationBox {...props}/>,
    styles: tKUILocationSearchDefaultStyle,
    classNamePrefix: "TKUILocationSearch"
};

class TKUIQueryLocationBox extends React.Component<IProps, {}> {

    public render(): React.ReactNode {
        const classes = this.props.classes;
        const placeholder = this.props.t("Where.do.you.want.to.go?");
        const inputId = "input-search";
        const ariaLabel = this.props.value ?
            "To " + this.props.value.getDisplayString() : placeholder;
        return (
            <TKUILocationBox
                showCurrLoc={false}
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
                onInputTextChange={(text: string) => {
                    this.props.onInputTextChange && this.props.onInputTextChange(text);
                }}
                inputId={inputId}
                ariaLabel={"Search location"}
                inputAriaLabel={ariaLabel}
                onRef={this.props.onLocationBoxRef}
            />
        );
    }

}

const Consumer: React.SFC<{children: (props: IConsumedProps) => React.ReactNode, from?: boolean}> = props => {
    return (
        <RoutingResultsContext.Consumer>
            {(routingContext: IRoutingResultsContext) => {
                const region = routingContext.region;
                const bounds = region ? region.bounds : undefined;
                const focusLatLng = region ? (region.cities.length !== 0 ? region.cities[0] : region.bounds.getCenter()) : undefined;
                const from = !!props.from;
                const consumerProps: IConsumedProps = {
                    value: from ? routingContext.query.from : routingContext.query.to,
                    onChange: (value: Location | null) => {
                        routingContext.onQueryChange(Util.iAssign(routingContext.query, from ? {from: value} : {to: value}));
                        if (value !== null && !value.isCurrLoc()) {
                            FavouritesData.recInstance.add(value instanceof StopLocation ?
                                FavouriteStop.create(value) : FavouriteTrip.createForLocation(value));
                        }
                    },
                    onPreChange: routingContext.onPreChange &&
                    ((location?: Location) => routingContext.onPreChange!(from, location)),
                    onInputTextChange: routingContext.onInputTextChange &&
                    ((text: string) => routingContext.onInputTextChange!(from, text)),
                    bounds: bounds,
                    focusLatLng: focusLatLng,
                };
                return props.children!(consumerProps);
            }}
        </RoutingResultsContext.Consumer>
    );
};

const Mapper: PropsMapper<IClientProps & Partial<IConsumedProps>, Subtract<IProps, TKUIWithClasses<IStyle, IProps>>> =
    ({inputProps, children}) =>
        <Consumer from={inputProps.from}>
            {(consumedProps: IConsumedProps) =>
                children!({...inputProps, ...consumedProps})}
        </Consumer>;

export default connect((config: TKUIConfig) => config.TKUIQueryLocationBox, config, Mapper);