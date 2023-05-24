import React, { Fragment } from "react";
import { CSSProps, overrideClass, TKUIWithClasses, TKUIWithStyle } from "../jss/StyleHelper";
import { TKComponentDefaultConfig, TKUIConfig } from "../config/TKUIConfig";
import { tKUILocationSearchDefaultStyle } from "./TKUILocationSearch.css";
import { connect, PropsMapper } from "../config/TKConfigHelper";
import Location from "../model/Location";
import { IRoutingResultsContext, RoutingResultsContext } from "../trip-planner/RoutingResultsProvider";
import Util from "../util/Util";
import TKUILocationBox, { TKUILocationBoxRef } from "../location_box/TKUILocationBox";
import { ReactComponent as IconMenu } from '../images/ic-menu.svg';
import { ReactComponent as IconGlass } from "../images/ic-search.svg";
import { ReactComponent as IconDirections } from '../images/ic-directions.svg';
import FavouritesData from "../data/FavouritesData";
import StopLocation from "../model/StopLocation";
import FavouriteStop from "../model/favourite/FavouriteStop";
import FavouriteTrip from "../model/favourite/FavouriteTrip";
import { TKUIViewportUtil } from "../util/TKUIResponsiveUtil";
import TKUICard from "../card/TKUICard";

interface IClientProps extends IConsumedProps, TKUIWithStyle<IStyle, IProps> {
    /**
     * Function that will run when side bar button is clicked.
     * @ctype
     */
    onShowSideMenuClicked?: () => void;

    /**
     * Function that will run when directions button is clicked.
     * @ctype
     */
    onDirectionsClicked?: () => void;

    /**
     * @ignore
     */
    onMenuVisibilityChange?: (open: boolean) => void;

    /**
     * Stating if it should be optimized for portrait.
     * 
     * @tkstateprop global state orientation value.
     * @default false
     */
    portrait?: boolean;
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

    /**
     * Called when an autocompletion result is highlighted, using up/down arrows.     
     * @ctype
     */
    onResultHighlight?: (value: Location | null) => void

    /**
     * @ctype
     * @default {@link TKState#onInputTextChange}
     */
    onInputTextChange?: (text: string) => void;

    /**
     * @ignore
     */
    onLocationBoxRef?: (ref: TKUILocationBoxRef) => void;

    /**
     * @ignore
     */
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
        const { portrait, classes } = this.props;
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
                <div className={classes.main}>
                    {this.props.onShowSideMenuClicked &&
                        <button className={classes.sideBarBtn} onClick={this.props.onShowSideMenuClicked}
                            aria-label="Menu"
                        >
                            <IconMenu className={classes.sideBarIcon} />
                        </button>}
                    <TKUILocationBox
                        showCurrLoc={false}
                        value={this.props.value}
                        placeholder={placeholder}
                        onChange={(value: Location | null) => {
                            this.props.onChange?.(value);
                            this.props.onResultHighlight?.(null);
                        }}
                        onResultHighlight={this.props.onResultHighlight}
                        onInputTextChange={this.props.onInputTextChange}
                        iconEmpty={<IconGlass className={classes.glassIcon} />}
                        styles={{
                            wrapper: overrideClass(this.props.injectedStyles.locationBox),
                            input: overrideClass(this.props.injectedStyles.locationBoxInput),
                            menu: overrideClass({
                                ...this.props.injectedStyles.resultsMenu as any,
                                // I need to specify next two styles as functions as a workaround so they update dynamically. 
                                // Otherwise, the style of TKUILocationBox gets fixed to the first values of these props.
                                // Also notice this works since this.props is a reference, in a function component would need to use useRef.
                                // Finally notice that I cannot do left: props => `-${(props.onShowSideMenuClicked ? 36 : 0) + 25}px`,
                                // since those props are TKUILocationBox props, not TKUILocationSearch's.
                                left: () => `-${(this.props.onShowSideMenuClicked ? 36 : 0) + 25}px`,
                                width: () => `calc(100% + ${(this.props.onShowSideMenuClicked ? 36 : 0) + (this.props.onDirectionsClicked && !this.props.portrait ? 53 : 0) + 32}px)`
                            })
                        }}
                        inputId={inputId}
                        ariaLabel={"Search location"}
                        inputAriaLabel={ariaLabel}
                        onRef={this.props.onLocationBoxRef}
                        menuContainer={this.props.menuContainer}
                        onMenuVisibilityChange={this.props.onMenuVisibilityChange}
                    />
                    {this.props.onDirectionsClicked && !portrait &&
                        <Fragment>
                            <div className={classes.divider} />
                            <button className={classes.directionsBtn} onClick={this.props.onDirectionsClicked}
                                aria-label="Get directions"
                            >
                                <IconDirections className={classes.directionsIcon} />
                            </button>
                        </Fragment>}
                </div>
            </TKUICard>
        );
    }

}

const Consumer: React.FunctionComponent<{ children: (props: IConsumedProps) => React.ReactNode }> = props => {
    return (
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
                    onResultHighlight: routingContext.onPreChange &&
                        ((location: Location | null) => routingContext.onPreChange!(false, location ?? undefined)),
                    onInputTextChange: routingContext.onInputTextChange &&
                        ((text: string) => routingContext.onInputTextChange!(false, text))
                };
                return props.children!(consumerProps);
            }}
        </RoutingResultsContext.Consumer>
    );
};

const Mapper: PropsMapper<IClientProps, IClientProps> =
    ({ inputProps, children }) =>
        <TKUIViewportUtil>
            {({ portrait }) =>
                children!({ portrait, ...inputProps })}
        </TKUIViewportUtil>;

export default connect((config: TKUIConfig) => config.TKUILocationSearch, config, Mapper);

export const TKUILocationSearchHelpers = {
    TKStateProps: Consumer
}

export { TKUILocationSearch as TKUILocationSearchRaw };