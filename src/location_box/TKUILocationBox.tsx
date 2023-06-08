import React, { Component, Fragment, useContext, useMemo } from 'react';
import ReactDOM from 'react-dom';
import Autocomplete from 'react-autocomplete';
import { ReactComponent as IconRemove } from '../images/ic-cross.svg'
import { ReactComponent as IconSpin } from '../images/ic-loading2.svg'
import MultiGeocoder from "../geocode/MultiGeocoder";
import Location from '../model/Location';
import TKUIAutocompleteResult from "./TKUIAutocompleteResult";
import BBox from "../model/BBox";
import LatLng from "../model/LatLng";
import Tooltip from "rc-tooltip";
import DeviceUtil from "../util/DeviceUtil";
import { resetStyles } from "../css/ResetStyle.css";
import RegionsData from "../data/RegionsData";
import { TKError } from "../error/TKError";
import { TKUIWithClasses, TKUIWithStyle } from "../jss/StyleHelper";
import { TKComponentDefaultConfig, TKUIConfig } from "../config/TKUIConfig";
import { connect, PropsMapper } from "../config/TKConfigHelper";
import { tKUILocationBoxDefaultStyle } from "./TKUILocationBox.css";
import { genClassNames } from "../css/GenStyle.css";
import TKGeocodingOptions, { getGeocodingOptions } from "../geocode/TKGeocodingOptions";
import { Subtract } from 'utility-types';
import { TKUIConfigContext } from "../config/TKUIConfigProvider";
import { ERROR_UNABLE_TO_RESOLVE_ADDRESS } from "../error/TKErrorHelper";
import LocationUtil from "../util/LocationUtil";
import TKDefaultGeocoderNames from "../geocode/TKDefaultGeocoderNames";
import { RoutingResultsContext } from '../trip-planner/RoutingResultsProvider';

interface IClientProps extends TKUIWithStyle<IStyle, IProps> {
    /**
     * The selected location value.
     * @ctype     
     */
    value: Location | null,
    /**
     * Called when the selected location changes.
     * @ctype
     */
    onChange?: (value: Location | null) => void,
    /**
     * Called when an autocompletion result is highlighted, using up/down arrows.     
     * @ctype
     */
    onResultHighlight?: (value: Location | null) => void,
    /**
     * Called when input text changes
     * @ctype
     */
    onInputTextChange?: (text: string) => void,
    placeholder?: string,
    /**
     * It determines if user's current location should be suggested on autocompletion.
     * @default true
     */
    showCurrLoc?: boolean,
    /**
     * It determines if, when setting as value user's current location, it should be or not automatically resolved by using browser's Geolocation API.
     * @default true
     */
    resolveCurr?: boolean
    /**
     * To be called if it failed to resolve user's current location. Relevant just if [`resolveCurr`]{@link TKUILocationBox#resolveCurr} was set to `true`. 
     */
    onFailedToResolve?: (error: Error) => void;
    /**
     * Main element's aria-label
     */
    ariaLabel?: string;
    /**
     * Input element's aria-label
     */
    inputAriaLabel?: string;
    /**
     * @ignore
     */
    inputId?: string;
    /**
     * Set true to display autocomplete suggestions popup to the side of the location input box.
     * @default false
     */
    sideDropdown?: boolean;
    /**
     * The icon to be displayed to the right of the location box content when no location is set.
     * @ctype
     */
    iconEmpty?: JSX.Element;
    /**
     * To be called when the input element recives focus.
     * @ctype
     */
    onFocus?: () => void;
    /**
     * Until implement forwarding ref on connect HOC.
     * @ignore
     */
    onRef?: (ref: TKUILocationBoxRef) => void;
    /**
     * To specify an external container for the menu, to be rendered using a React portal. Currently not used.
     * @ignore
     */
    menuContainer?: HTMLElement;
    /**
     * To specify a maximum height for the autocompletion menu.
     */
    menuMaxHeightPx?: number;
    /**
     * To be called when autocompletion menu appears and dissapears.
     * @ctype
     */
    onMenuVisibilityChange?: (open: boolean) => void;
    /**
     * Time in milliseconds to debounce requests to geocoding services after user type.
     * @default 200
     */
    debounce?: number;
    /**
     * Whether or not to automatically select the highlighted item when the input element loses focus.
     * @default true
     */
    selectOnBlur?: boolean;
}

interface IConsumedProps {
    /**
     * @ctype
     * @ignore Since currently it can just be specified through TKUIConfig. Evaluate enabling to specify it also through this prop.
     */
    geocodingOptions: TKGeocodingOptions;
    /**
     * Coordinates to focus from / to location search.
     * @ctype
     * @default The center of the main city of current region ({@link TKState#region})
     */
    focus?: LatLng;
    /**
     * Bounding box to restrict from / to location search.
     * @ctype
     * @default Bounds of the current region: {@link TKState#region}.bounds
     */
    bounds?: BBox;
}

type IStyle = ReturnType<typeof tKUILocationBoxDefaultStyle>;

interface IProps extends IClientProps, IConsumedProps, TKUIWithClasses<IStyle, IProps> { }

export type TKUILocationBoxProps = IProps;
export type TKUILocationBoxStyle = IStyle;

const config: TKComponentDefaultConfig<IProps, IStyle> = {
    render: props => <TKUILocationBox {...props} />,
    styles: tKUILocationBoxDefaultStyle,
    classNamePrefix: "TKUILocationBox"
};

interface IState {
    inputText: string,
    locationValue: Location | null,
    highlightedValue: Location | null;
    items: any[],
    focus: boolean,
    waiting: boolean;
    waitingResolveFor?: Location;
}

class TKUILocationBox extends Component<IProps, IState> {

    private resultsArrivedForQuery?: string;
    private geocodingData: MultiGeocoder;
    private autocompleteRef: React.RefObject<Autocomplete> = React.createRef<Autocomplete>();

    public static defaultProps: Partial<IProps> = {
        resolveCurr: true,
        selectOnBlur: true
    };

    constructor(props: IProps) {
        super(props);
        this.state = {
            inputText: '',
            locationValue: null,
            highlightedValue: null,
            items: [],
            focus: false,
            waiting: false
        };
        const geocodingOptions = this.props.geocodingOptions;
        this.geocodingData = new MultiGeocoder(geocodingOptions);
        this.handleAutocompleteResults = this.handleAutocompleteResults.bind(this);
        this.renderInput = this.renderInput.bind(this);
        this.renderMenu = this.renderMenu.bind(this);
        this.onChange = this.onChange.bind(this);
        this.onSelect = this.onSelect.bind(this);
        this.renderItem = this.renderItem.bind(this);
        this.onClearClicked = this.onClearClicked.bind(this);
        this.onKeyDown = this.onKeyDown.bind(this);
        this.refreshHighlight = this.refreshHighlight.bind(this);
        this.getHighlightedLocation = this.getHighlightedLocation.bind(this);
        this.setValue = this.setValue.bind(this);
        this.isDDOpen = this.isDDOpen.bind(this);
        this.getHighlightedItem = this.getHighlightedItem.bind(this);
        this.updateResolvedItem = this.updateResolvedItem.bind(this);
    }

    public focus() {
        this.autocompleteRef.current && this.autocompleteRef.current.focus();
    }

    private isDDOpen(state: IState = this.state) {
        return state.focus && state.items !== undefined && state.items.length > 0;
        // return true;
    }

    private getHighlightedIndex(): number | null {
        return this.autocompleteRef.current ? this.autocompleteRef.current.state.highlightedIndex : null;
    }

    private getHighlightedItem() {
        const highlightedIndex = this.getHighlightedIndex();
        return (highlightedIndex !== null && this.state.items.length > highlightedIndex) ? this.state.items[highlightedIndex] : null;
    }

    /**
     * Set a location to the location box.
     * @param {Location | null} locationValue - The location to set.
     * @param {boolean} highlighted - Indicates if the location is set just as highlighted, or as selected.
     * @param {boolean} fireEvents - If should fire events.
     */
    public setValue(locationValue: Location | null, highlighted: boolean = false, fireEvents: boolean = false, callback?: () => void) {
        if (!highlighted && locationValue === this.state.locationValue && locationValue !== null) {
            return; // If locationValue === null may still need to clear input text
        }
        let inputText = this.state.inputText;
        if (!highlighted) {   // Set location address as input text
            inputText = locationValue ? LocationUtil.getMainText(locationValue, this.props.t) : '';
        }
        const setStateCallback = () => {
            if (locationValue && (!locationValue.isResolved() || locationValue.hasDetail === false) &&
                (!locationValue.isCurrLoc() || (this.props.resolveCurr && !highlighted))) {
                this.resolve(locationValue);
            } else if (locationValue && locationValue.isResolved() && !locationValue.address && !locationValue.name) {
                this.resolve(locationValue);
            } else if (fireEvents) {
                this.fireLocationChange(highlighted);
            }
            callback && callback();
        };
        if (!highlighted) {
            this.setState((prevState: IState) => ({
                inputText: inputText,
                locationValue: locationValue,
                items: [],
                // Stop waiting spinner if changed location we are waiting for.
                waitingResolveFor: prevState.locationValue && !prevState.locationValue.equals(locationValue)
                    && prevState.waitingResolveFor === prevState.locationValue ? undefined : prevState.waitingResolveFor
            }), setStateCallback);
        } else {
            this.setState({
                inputText: inputText,
                highlightedValue: locationValue,
                items: this.state.items
            }, setStateCallback);
        }
    }

    private resolve(locationValue: Location) {
        if (locationValue && (!locationValue.isResolved() || locationValue.hasDetail === false) &&
            (!locationValue.isCurrLoc() || this.props.resolveCurr)) {
            this.setState({ waitingResolveFor: locationValue });
            if (locationValue.source) {
                this.geocodingData.resolveLocation(locationValue)
                    .then((resolvedLocation: Location) => {
                        if (locationValue === this.state.locationValue || locationValue === this.state.highlightedValue) {
                            this.setValue(resolvedLocation, locationValue === this.state.highlightedValue, true,
                                () => {
                                    this.updateResolvedItem(locationValue, resolvedLocation);
                                    console.log("Resolved: " + JSON.stringify(resolvedLocation));
                                });
                        }
                        if (this.state.waitingResolveFor === locationValue) {
                            this.setState({
                                waitingResolveFor: undefined
                            });
                        }
                    })
                    .catch((error: Error) => {
                        if (locationValue.isCurrLoc() && (locationValue === this.state.locationValue || locationValue === this.state.highlightedValue)) {
                            this.props.onFailedToResolve && this.props.onFailedToResolve(error);
                            this.setValue(null, false, true);
                        }
                    });
            } else {
                const searchAddress = () => {
                    this.getLimitBounds().then(limitBounds => {
                        if (!locationValue.address) {
                            return;
                        }
                        this.geocodingData.geocode(locationValue.address!, false, limitBounds, this.props.focus ? this.props.focus : null,
                            (query: string, results: Location[]) => {
                                if (this.state.waitingResolveFor === locationValue) {
                                    this.setState({
                                        waitingResolveFor: undefined
                                    });
                                }
                                if (locationValue === this.state.locationValue) {
                                    if (results.length > 0) {
                                        this.setValue(results[0], false, true,
                                            () => {
                                                this.updateResolvedItem(locationValue, results[0]);
                                                console.log("Resolved: " + JSON.stringify(results[0]));
                                            });
                                    } else {
                                        this.props.onFailedToResolve
                                            && this.props.onFailedToResolve(new TKError("Cannot resolve address.", ERROR_UNABLE_TO_RESOLVE_ADDRESS));
                                    }
                                }
                            });
                    }
                    )
                };
                if (this.props.bounds) {
                    searchAddress()
                } else {
                    // Wait for bounds, which are set after regions data arrive (geocoder is limited to region bounds,
                    // and focused to center of first city, if any, or region bounds center otherwise.
                    RegionsData.instance.requireRegions().then(() => {
                        setTimeout(searchAddress, 100);
                    });
                }
            }
        } else if (locationValue.isResolved() && !locationValue.address && !locationValue.name && !locationValue.isCurrLoc()) {
            // Coordinate without address nor name, so reverse geocode it.
            this.setState({ waitingResolveFor: locationValue });
            this.geocodingData.reverseGeocode(locationValue, location => {
                if (locationValue === this.state.locationValue) {
                    if (location) {
                        if (!location.address) {
                            location.address = "Unknown";
                        }
                        this.setValue(location, false, true, () =>
                            this.updateResolvedItem(locationValue, location));
                    }
                }
                if (this.state.waitingResolveFor === locationValue) {
                    this.setState({
                        waitingResolveFor: undefined
                    });
                }
            });
        }
    }

    private updateResolvedItem(unresolved, resolved) {
        const itemsUpdate = this.state.items
            .map((item) => {
                if (item.location === unresolved) {
                    return { ...item, location: resolved }
                }
                return item;
            });
        this.setState({
            items: itemsUpdate
        });
    }

    private onChange(inputText: string) {
        this.setState({ inputText: inputText }, () => {
            if (inputText === '') {
                this.refreshResults(this.state.inputText);
            } else {
                setTimeout(() => {
                    if (this.state.inputText === inputText) {
                        this.refreshResults(this.state.inputText)
                    }
                }, this.props.debounce !== undefined ? this.props.debounce : 200);
            }
        });
        // Remove location value when user deletes all text.
        if (inputText === '' && this.state.locationValue !== null) {
            this.setValue(null, false, true);
        }
    }

    private getLimitBounds(): Promise<BBox | null> {
        return RegionsData.instance.requireRegions().then(() => {
            return (this.props.geocodingOptions?.restrictToCoverageBounds && RegionsData.instance.getCoverageBounds())
                || this.props.bounds || null;
        });
    }

    private refreshResults(inputText: string) {
        this.setState({ waiting: true });
        this.getLimitBounds().then(limitBounds =>
            this.geocodingData.geocode(inputText, true, limitBounds, this.props.focus ? this.props.focus : null,
                this.handleAutocompleteResults));

    }

    // noinspection JSUnusedLocalSymbols
    private handleAutocompleteResults(query: string, results: Location[]) {
        if (query !== this.state.inputText) {   // A previous request arrived
            return;
        }
        this.setState({ waiting: false });
        const items: object[] = [];
        for (const i in results) {
            if (results.hasOwnProperty(i)) {
                const item = {
                    label: LocationUtil.getMainText(results[i], this.props.t),
                    location: results[i]
                };
                items.push(item);
            }
        }
        // Reset highlighted item, except that more results arrived for the same query.
        if (query !== this.resultsArrivedForQuery && this.autocompleteRef.current) {
            this.autocompleteRef.current.setState({ highlightedIndex: null });
        }
        this.resultsArrivedForQuery = query;
        this.setState({
            items: items,
        }, () => this.refreshHighlight());
    }

    private onSelect(selectedItem: string, item: any) {
        const locationValue = item.location;
        this.setValue(locationValue!, false, true);
        this.autocompleteRef.current && this.autocompleteRef.current.blur();   // Lose focus on selection (e.g. user hits enter on highligthed result)
    }

    /**
     * Refreshes location value to reflect item highlighted according to Autocomplete component.
     */
    private refreshHighlight() {
        const locationHighlighted = this.getHighlightedLocation();
        if (locationHighlighted !== null    // To avoid losing locationValue when user clicks on input
            && locationHighlighted !== this.state.highlightedValue) {
            this.setValue(locationHighlighted, true, true);
        }
    }

    private getHighlightedLocation(): Location | null {
        const highlightedItem = this.getHighlightedItem();
        return highlightedItem ? highlightedItem.location : null;
    }

    private fireLocationChange(preselect: boolean) {
        if (preselect) {
            this.props.onResultHighlight && this.props.onResultHighlight(this.state.highlightedValue);
        } else {
            this.props.onChange && this.props.onChange(this.state.locationValue);
        }
    }

    private renderInput(props: any) {
        const { classes } = this.props;
        return (
            <div className={classes.main} role="none">
                <input type="text"
                    spellCheck={false}
                    autoComplete="off"
                    autoCorrect="off"
                    autoCapitalize="off"
                    {...props}
                    className={classes.input}
                />
                {this.state.waiting || this.state.waitingResolveFor ?
                    <IconSpin className={classes.iconLoading} focusable="false" /> :
                    (this.state.inputText ?
                        <button onClick={this.onClearClicked}
                            className={classes.btnClear}
                            style={resetStyles.button as any}
                            aria-hidden={true}
                            tabIndex={-1}>
                            <IconRemove aria-hidden={true} className={classes.iconClear} focusable="false" />
                        </button> :
                        this.props.iconEmpty || "")
                }
            </div>
        );
    }

    private onClearClicked() {
        // focus() must be called after completion of setState() inside setValue()
        this.setValue(null, false, true,
            () => {
                setTimeout(() => {
                    this.autocompleteRef.current && this.autocompleteRef.current.focus();
                }, 100);    // TODO: see why: if don't put this timeout focus is not set, or is lost.

            });
    }

    // noinspection JSUnusedLocalSymbols
    private renderMenu(items: any[], value: any, style: any) {
        const classes = this.props.classes;
        if (this.props.sideDropdown) {
            const overlay = <div
                children={items}
                role="listbox"
                id={this.getPopupId()}
                className={genClassNames.root}
                style={{ width: "250px" }}
            />;
            return <Tooltip
                placement={this.props.inputId === "input-to" ? "right" : "rightTop"}
                overlay={overlay}
                arrowContent={<div className="rc-tooltip-arrow-inner" />}
                visible={true}
                overlayClassName={classes.sideMenu}
            >
                <div
                    style={{
                        position: "absolute",
                        top: this.props.inputId === "input-to" ? "15px" : 0,
                        right: "0"
                    }}
                />
            </Tooltip>
        } else {
            const externalContainer = this.props.menuContainer;
            const menu =
                <div
                    style={{
                        ...externalContainer && {
                            position: "relative",
                            left: undefined,
                            top: undefined,
                            width: undefined
                        },
                        ...this.props.menuMaxHeightPx && {
                            maxHeight: this.props.menuMaxHeightPx + 'px',
                            overflow: 'auto'
                        }
                    }}
                    children={items}
                    className={classes.menu}
                    role="listbox"
                    id={this.getPopupId()}
                    aria-label="Choose location result"
                />;
            return externalContainer ? <div>{ReactDOM.createPortal(menu, externalContainer)}</div> : menu;
        }
    }

    private renderItem(item: any, isHighlighted: boolean) {
        const location = item.location;
        const geocoder = this.geocodingData.options.geocoders[location.source!];
        return (
            <TKUIAutocompleteResult
                id={"item-" + this.state.items.indexOf(item)}
                key={this.state.items.indexOf(item)}
                location={location}
                highlighted={isHighlighted}
                ariaSelected={isHighlighted}
                onClick={() => this.setValue(location, false, true)}
                renderIcon={geocoder && geocoder.getOptions().renderIcon}
                scrollIntoView={!!this.props.menuMaxHeightPx}
            />
        );
    }

    private onKeyDown(e: any) {
        if (e.keyCode === 38 || e.keyCode === 40) {
            // Should set timeout to wait for this.highlightedItem to be set by renderItem. Don't wait longer since
            // screen reader reads de-selection of item (besides selection of new one).
            setTimeout(this.refreshHighlight, 1);
        }
    }

    public componentDidUpdate(prevProps: IProps, prevState: IState) {
        if (this.props.value !== prevProps.value && this.props.value !== this.state.locationValue) {
            this.setValue(this.props.value);
        }
        if (this.props.resolveCurr && !prevProps.resolveCurr
            && this.props.value && this.props.value.isCurrLoc() && !this.props.value.isResolved()) {
            this.resolve(this.props.value);
        }
        if (prevState.inputText !== this.state.inputText) {
            this.props.onInputTextChange && this.props.onInputTextChange(this.state.inputText);
        }
        // Refresh inputText (from locationValue) when translation resource arrives after current location was set, so
        // it gets the localized string.
        if (prevProps.locale !== this.props.locale && this.state.locationValue && this.state.locationValue.isCurrLoc()) {
            this.setState({
                inputText: LocationUtil.getMainText(this.state.locationValue, this.props.t)
            });
        }
        if (JSON.stringify(Object.keys(prevProps.geocodingOptions.geocoders)) !==
            JSON.stringify(Object.keys(this.props.geocodingOptions.geocoders))) {
            this.geocodingData = new MultiGeocoder(this.props.geocodingOptions);
        }
        if (this.isDDOpen() !== this.isDDOpen(prevState)) {
            this.props.onMenuVisibilityChange?.(this.isDDOpen());
        }
    }

    public componentDidMount() {
        this.setValue(this.props.value);
        this.props.onRef && this.props.onRef(this);
    }

    private getPopupId() {
        return this.props.inputId ? "popup-" + this.props.inputId : undefined;
    }

    public render() {
        const classes = this.props.classes;
        const popupId = this.getPopupId();
        return (
            <Autocomplete
                getItemValue={(item) => item.label}
                items={this.state.items}
                renderInput={this.renderInput}
                renderMenu={this.renderMenu}
                renderItem={this.renderItem}
                value={this.state.inputText}
                onChange={(e) => {
                    this.onChange(e.target.value);
                }}
                onSelect={this.onSelect}
                onMenuVisibilityChange={(isOpen) => {
                    // If menuContainer was provided, then delay hiding menu so a click on an external element happens
                    // before, since menu hiding may cause click target to move, missing the click.
                    if ((DeviceUtil.isTablet || this.props.menuContainer) && !isOpen) {
                        setTimeout(() => {
                            this.setState({ focus: isOpen })
                        }, 40);
                    } else {
                        this.setState({ focus: isOpen });
                    }
                }}
                open={this.isDDOpen()}
                wrapperStyle={{}}   // Just to remove the display: inline-block that Autocomplete sets to the wrapper element.
                wrapperProps={{
                    "aria-label": this.props.ariaLabel,
                    className: classes.wrapper
                }}
                inputProps={{
                    placeholder: this.props.placeholder,
                    onKeyDown: this.onKeyDown,
                    onFocus: () => { // Remove current location on focus.
                        if (this.state.locationValue && this.state.locationValue.isCurrLoc()) {
                            this.setValue(null, false, true,
                                () => this.refreshResults(this.state.inputText))
                        } else {
                            this.refreshResults(this.state.inputText);
                        }
                        this.props.onFocus && this.props.onFocus();
                    },
                    role: "combobox",
                    "aria-expanded": this.isDDOpen(),
                    "aria-activedescendant": this.getHighlightedItem() ? "item-" + this.state.items.indexOf(this.getHighlightedItem()) : undefined,
                    "aria-label": this.props.inputAriaLabel,
                    id: this.props.inputId,
                    "aria-owns": this.isDDOpen() ? popupId : undefined,
                    "aria-haspopup": this.isDDOpen(),
                    tabIndex: 0,
                    "aria-live": "polite"
                }}
                autoHighlight={false}
                ref={this.autocompleteRef}
                selectOnBlur={this.props.selectOnBlur}
            />
        );
    }
}

const Consumer: React.FunctionComponent<{ children: (props: IConsumedProps) => React.ReactNode, showCurrLoc?: boolean }> =
    (props: { children: (props: IConsumedProps) => React.ReactNode, showCurrLoc?: boolean }) => {
        const routingContext = useContext(RoutingResultsContext);
        const config = useContext(TKUIConfigContext);
        const geocodingOptions = getGeocodingOptions(config.geocoding);
        const calculateFocus = geocodingOptions.getFocus ??
            (({ selectedRegion }) =>
                selectedRegion ? (selectedRegion.cities.length !== 0 ? selectedRegion.cities[0] : selectedRegion.bounds.getCenter()) : undefined);
        // calculateFocus can be expensive (e.g. find region containing map viewport), so call it just if one of its inputs changed
        // (and not when, for instance, inputTexsFrom / inputTexstTo changed, which happens on each user type.)
        const focus = useMemo(() => calculateFocus({ selectedRegion: routingContext.region, mapViewport: routingContext.viewport }),
            [routingContext.region, routingContext.viewport]);
        if (props.showCurrLoc === false) {
            delete geocodingOptions.geocoders[TKDefaultGeocoderNames.geolocation];
        }
        return (
            <Fragment>
                {props.children({
                    geocodingOptions: geocodingOptions,
                    focus: focus,
                    bounds: routingContext.region ? routingContext.region.bounds : undefined
                })}
            </Fragment>
        );
    };

const Mapper: PropsMapper<IClientProps & Partial<IConsumedProps>, Subtract<IProps, TKUIWithClasses<IStyle, IProps>>> =
    ({ inputProps, children }) =>
        <Consumer showCurrLoc={inputProps.showCurrLoc}>
            {(consumedProps: IConsumedProps) =>
                children!({ ...consumedProps, ...inputProps })}
        </Consumer>;

export default connect((config: TKUIConfig) => config.TKUILocationBox, config, Mapper);
export type TKUILocationBoxRef = TKUILocationBox;
export { TKUILocationBox as TKUILocationBoxRaw };