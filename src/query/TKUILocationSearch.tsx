import React, { Fragment } from "react";
import { CSSProps, overrideClass, TKUIWithClasses, TKUIWithStyle } from "../jss/StyleHelper";
import { TKComponentDefaultConfig, TKUIConfig } from "../config/TKUIConfig";
import { tKUILocationSearchDefaultStyle } from "./TKUILocationSearch.css";
import { connect, PropsMapper } from "../config/TKConfigHelper";
import Location from "../model/Location";
import { IRoutingResultsContext, RoutingResultsContext } from "../trip-planner/RoutingResultsProvider";
import { Subtract } from "utility-types";
import Util from "../util/Util";
import TKUILocationBox, { TKUILocationBoxRef } from "../location_box/TKUILocationBox";
import { ReactComponent as IconMenu } from '../images/ic-menu.svg';
import { ReactComponent as IconGlass } from "../images/ic-search.svg";
import { ReactComponent as IconDirections } from '../images/ic-directions.svg';
import FavouritesData from "../data/FavouritesData";
import StopLocation from "../model/StopLocation";
import FavouriteStop from "../model/favourite/FavouriteStop";
import FavouriteTrip from "../model/favourite/FavouriteTrip";
import { TKUIViewportUtil, TKUIViewportUtilProps } from "../util/TKUIResponsiveUtil";
import TKUICard from "../card/TKUICard";

interface IClientProps extends TKUIWithStyle<IStyle, IProps> {
    /**
     * Function that will run when side bar button is clicked.
     * @ctype
     */
    onShowSideBarClicked?: () => void;

    /**
     * Function that will run when directions button is clicked.
     * @ctype
     */
    onDirectionsClicked?: () => void;
}

interface IConsumedProps extends TKUIViewportUtilProps {
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

    onLocationBoxRef?: (ref: TKUILocationBoxRef) => void;

    menuContainer?: HTMLElement;
}

interface IProps extends IConsumedProps, IClientProps, TKUIWithClasses<IStyle, IProps> { }

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
    render: props => <TKUILocationSearch {...props} />,
    styles: tKUILocationSearchDefaultStyle,
    classNamePrefix: "TKUILocationSearch"
};

class TKUILocationSearch extends React.Component<IProps, {}> {

    public render(): React.ReactNode {
        const classes = this.props.classes;
        const placeholder = this.props.t("Search.for.destination");
        const inputId = "input-search";
        const ariaLabel = this.props.value ?
            "To " + this.props.value.getDisplayString() : placeholder;
        return (
            <TKUICard scrollable={false} mainFocusElemId={inputId} ariaLabel={"Quick Search"}
                styles={{
                    main: overrideClass({ overflow: 'visible' })
                }}
                role="search"
            >
                <TKUIViewportUtil>
                    {(viewportProps: TKUIViewportUtilProps) =>
                        <div className={classes.main}>
                            {this.props.onShowSideBarClicked &&
                                <button className={classes.sideBarBtn} onClick={this.props.onShowSideBarClicked}
                                    aria-label="Menu"
                                >
                                    <IconMenu className={classes.sideBarIcon} />
                                </button>}
                            <TKUILocationBox
                                showCurrLoc={false}
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
                                iconEmpty={<IconGlass className={classes.glassIcon} />}
                                style={this.props.injectedStyles.locationBox as any}
                                inputStyle={this.props.injectedStyles.locationBoxInput as any}
                                menuStyle={{
                                    ...this.props.injectedStyles.resultsMenu as any,
                                    width: this.props.portrait ? 'calc(100% + 69px)' : 'calc(100% + 123px)'
                                }}
                                inputId={inputId}
                                ariaLabel={"Search location"}
                                inputAriaLabel={ariaLabel}
                                onRef={this.props.onLocationBoxRef}
                                menuContainer={this.props.menuContainer}
                            />
                            {this.props.onDirectionsClicked && viewportProps.landscape &&
                                <Fragment>
                                    <div className={classes.divider} />
                                    <button className={classes.directionsBtn} onClick={this.props.onDirectionsClicked}
                                        aria-label="Get directions"
                                    >
                                        <IconDirections className={classes.directionsIcon} />
                                    </button>
                                </Fragment>}
                        </div>
                    }
                </TKUIViewportUtil>
            </TKUICard>
        );
    }

}

const Consumer: React.FunctionComponent<{ children: (props: IConsumedProps) => React.ReactNode }> = props => {
    return (
        <TKUIViewportUtil>
            {(viewportProps: TKUIViewportUtilProps) =>
                <RoutingResultsContext.Consumer>
                    {(routingContext: IRoutingResultsContext) => {
                        const consumerProps: IConsumedProps = {
                            value: routingContext.query.to,
                            onChange: (value: Location | null) => {
                                routingContext.onQueryChange(Util.iAssign(routingContext.query, { to: value }));
                                if (value !== null && !value.isCurrLoc()) {
                                    FavouritesData.recInstance.add(value instanceof StopLocation ?
                                        FavouriteStop.create(value) : FavouriteTrip.createForLocation(value));
                                }
                            },
                            onPreChange: routingContext.onPreChange &&
                                ((location?: Location) => routingContext.onPreChange!(false, location)),
                            onInputTextChange: routingContext.onInputTextChange &&
                                ((text: string) => routingContext.onInputTextChange!(false, text)),
                            ...viewportProps
                        };
                        return props.children!(consumerProps);
                    }}
                </RoutingResultsContext.Consumer>
            }
        </TKUIViewportUtil>
    );
};

const Mapper: PropsMapper<IClientProps & Partial<IConsumedProps>, Subtract<IProps, TKUIWithClasses<IStyle, IProps>>> =
    ({ inputProps, children }) =>
        <Consumer>
            {(consumedProps: IConsumedProps) =>
                children!({ ...inputProps, ...consumedProps })}
        </Consumer>;

export default connect((config: TKUIConfig) => config.TKUILocationSearch, config, Mapper);
export { TKUILocationSearch as TKUILocationSearchRaw };