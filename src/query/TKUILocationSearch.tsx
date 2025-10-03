import React, { Fragment } from "react";
import { overrideClass, TKUIWithClasses, TKUIWithStyle } from "../jss/StyleHelper";
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
import { TKUIViewportUtil } from "../util/TKUIResponsiveUtil";
import TKUICard from "../card/TKUICard";
import FavouriteLocation from "../model/favourite/FavouriteLocation";
import classNames from "classnames";

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
    onDirectionsClick?: () => void;

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

    callToAction?: string;
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

type IStyle = ReturnType<typeof tKUILocationSearchDefaultStyle>;

interface IProps extends IConsumedProps, IClientProps, TKUIWithClasses<IStyle, IProps> { }

export type TKUILocationSearchProps = IProps;
export type TKUILocationSearchStyle = IStyle;

const config: TKComponentDefaultConfig<IProps, IStyle> = {
    render: props => <TKUILocationSearch {...props} />,
    styles: tKUILocationSearchDefaultStyle,
    classNamePrefix: "TKUILocationSearch"
};

const TKUILocationSearch: React.FunctionComponent<IProps> = (props) => {
    const { value, onChange, callToAction, onShowSideMenuClicked, onResultHighlight, onInputTextChange,
        injectedStyles, onDirectionsClick, onLocationBoxRef, menuContainer, portrait, onMenuVisibilityChange, classes, t } = props;
    const placeholder = t("Search.for.destination");
    const inputId = "input-search";
    const ariaLabel = value ?
        "To " + value.getDisplayString() : placeholder;
    return (
        <TKUICard scrollable={false} mainFocusElemId={inputId} ariaLabel={"Quick Search"}
            styles={{
                main: overrideClass({ overflow: 'visible' })
            }}
            role="search"
        >
            <div className={classNames(classes.main, callToAction && classes.withCallToAction)}>
                {onShowSideMenuClicked &&
                    <button
                        className={classes.sideBarBtn}
                        onClick={onShowSideMenuClicked}
                        aria-label="Menu"
                    >
                        <IconMenu className={classes.sideBarIcon} />
                    </button>}
                {callToAction &&
                    <div className={classes.callToAction}>
                        {callToAction}
                    </div>
                }
                <div className={classes.locationBoxContainer}>
                    <TKUILocationBox
                        showCurrLoc={false}
                        value={value}
                        placeholder={placeholder}
                        onChange={(value: Location | null) => {
                            onChange?.(value);
                            onResultHighlight?.(null);
                        }}
                        onResultHighlight={onResultHighlight}
                        onInputTextChange={onInputTextChange}
                        iconEmpty={!callToAction ? <IconGlass className={classes.glassIcon} /> : undefined}
                        iconLeft={callToAction ? <IconGlass className={classes.glassIcon} /> : undefined}
                        styles={{
                            wrapper: overrideClass(injectedStyles.locationBox),
                            main: overrideClass(callToAction ? { padding: '0 12px', marginLeft: '-16px' } : {}),
                            input: overrideClass(injectedStyles.locationBoxInput),
                            menu: overrideClass({
                                ...injectedStyles.resultsMenu as any,
                                // I need to specify next two styles as functions as a workaround so they update dynamically. 
                                // Otherwise, the style of TKUILocationBox gets fixed to the first values of these props.
                                // Also notice this works since props is a reference, in a function component would need to use useRef.
                                // Finally notice that I cannot do left: props => `-${(onShowSideMenuClicked ? 36 : 0) + 25}px`,
                                // since those props are TKUILocationBox props, not TKUILocationSearch's.
                                left: () => `-${(onShowSideMenuClicked && !callToAction ? 36 : 0) + 25}px`,
                                width: () => `calc(100% + ${(onShowSideMenuClicked && !callToAction ? 36 : 0) + (onDirectionsClick && !portrait ? 53 : 0) + (callToAction && !portrait ? 24 : 32)}px)`
                            })
                        }}
                        inputId={inputId}
                        ariaLabel={"Search location"}
                        inputAriaLabel={ariaLabel}
                        onRef={onLocationBoxRef}
                        menuContainer={menuContainer}
                        onMenuVisibilityChange={onMenuVisibilityChange}
                    />
                </div>
                {props.onDirectionsClick && !portrait &&
                    <Fragment>
                        <div className={classes.divider} />
                        <button className={classes.directionsBtn} onClick={props.onDirectionsClick}
                            aria-label="Get directions"
                        >
                            <IconDirections className={classes.directionsIcon} />
                        </button>
                    </Fragment>}
            </div>
        </TKUICard >
    );
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
                                FavouriteStop.create(value) : FavouriteLocation.create(value));
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