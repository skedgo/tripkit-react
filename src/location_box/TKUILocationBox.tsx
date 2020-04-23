import React, { Component } from 'react';
import Autocomplete from 'react-autocomplete';
import {ReactComponent as IconRemove} from '../images/ic-cross.svg'
import {ReactComponent as IconSpin} from '../images/ic-loading2.svg'
import MultiGeocoder from "../geocode/MultiGeocoder";
import Location from '../model/Location';
import TKUIAutocompleteResult from "./TKUIAutocompleteResult";
import BBox from "../model/BBox";
import LatLng from "../model/LatLng";
import Tooltip from "rc-tooltip";
import DeviceUtil from "../util/DeviceUtil";
import {resetStyles} from "../css/ResetStyle.css";
import City from "../model/location/City";
import * as CSS from 'csstype';
import RegionsData from "../data/RegionsData";
import {TKError} from "../error/TKError";
import {CSSProps, TKUIWithClasses, TKUIWithStyle} from "../jss/StyleHelper";
import {TKComponentDefaultConfig, TKUIConfig} from "../config/TKUIConfig";
import {connect, mapperFromFunction} from "../config/TKConfigHelper";
import {tKUILocationBoxDefaultStyle} from "./TKUILocationBox.css";
import {genClassNames} from "../css/GenStyle.css";

interface IClientProps extends TKUIWithStyle<IStyle, IProps> {
    geocodingData: MultiGeocoder,
    placeholder?: string,
    bounds?: BBox,
    focus?: LatLng,
    value: Location | null,
    onChange?: (value: Location | null, highlighted: boolean) => void,
    onInputTextChange?: (text: string) => void,
    resolveCurr?: boolean
    onFailedToResolve?: (highlighted: boolean, error: Error) => void;
    inputAriaLabel?: string;
    inputId?: string;
    sideDropdown?: boolean;
    iconEmpty?: JSX.Element;
    style?: CSS.Properties;
    menuStyle?: CSS.Properties;
    inputStyle?: CSS.Properties;
    onFocus?: () => void;
}

interface IStyle {
    main: CSSProps<IProps>;
    iconLoading: CSSProps<IProps>;
    btnClear: CSSProps<IProps>;
    iconClear: CSSProps<IProps>;
    menu: CSSProps<IProps>;
    sideMenu: CSSProps<IProps>;
}

interface IProps extends IClientProps, TKUIWithClasses<IStyle, IProps> {}

export type TKUILocationBoxProps = IProps;
export type TKUILocationBoxStyle = IStyle;

const config: TKComponentDefaultConfig<IProps, IStyle> = {
    render: props => <TKUILocationBox {...props}/>,
    styles: tKUILocationBoxDefaultStyle,
    classNamePrefix: "TKUILocationBox"
};

interface IState {
    inputText: string,
    locationValue: Location | null,
    highlightedValue: Location | null;
    items: any[],
    focus: boolean,
    ddopen: () => boolean;
    waiting: boolean;
    waitingResolveFor?: Location;
}

export const ERROR_UNABLE_TO_RESOLVE_ADDRESS = "ERROR_UNABLE_TO_RESOLVE_ADDRESS";

class TKUILocationBox extends Component<IProps, IState> {

    private itemToLocationMap: Map<string, Location> = new Map<string, Location>();
    private highlightedItem: string | null = null;
    private geocodingData: MultiGeocoder;
    private inputRef: any;

    private readonly AUTOCOMPLETE_DELAY = 200;

    public static defaultProps: Partial<IProps> = {
        resolveCurr: true
    };

    constructor(props: IProps) {
        super(props);
        this.state = {
            inputText: '',
            locationValue: null,
            highlightedValue: null,
            items: [],
            focus: false,
            ddopen: () => {
                return this.state.focus && this.state.items !== undefined && this.state.items.length > 0;
                // return true;
            },
            waiting: false
        };
        this.geocodingData = props.geocodingData;
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
    }

    public static itemText(location: Location): string {
        return location instanceof City ? location.name : location.address;
    }

    private static itemId(location: Location): string {
        return TKUILocationBox.itemText(location) + (location.id ? "-" + location.id : "");
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
            inputText = locationValue ? TKUILocationBox.itemText(locationValue) : '';
        }
        const setStateCallback = () => {
            if (locationValue && (!locationValue.isResolved() || locationValue.hasDetail === false) &&
                (!locationValue.isCurrLoc() || (this.props.resolveCurr && !highlighted))) {
                this.resolve(locationValue);
            } else if (fireEvents) {
                this.fireLocationChange(highlighted);
            }
            if (callback) {
                callback();
            }
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
            this.setState({waitingResolveFor: locationValue});
            if (locationValue.source) {
                this.geocodingData.resolveLocation(locationValue)
                    .then((resolvedLocation: Location) => {
                        if (locationValue === this.state.locationValue || locationValue === this.state.highlightedValue) {
                            this.setValue(resolvedLocation, locationValue === this.state.highlightedValue, true, () => {
                                this.itemToLocationMap.set(TKUILocationBox.itemId(locationValue), resolvedLocation);
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
                            this.props.onFailedToResolve && this.props.onFailedToResolve(locationValue === this.state.highlightedValue, error);
                            this.setValue(null, false, true);
                        }
                    });
            } else {
                const searchAddress = () => {
                    this.geocodingData.geocode(locationValue.address, false, this.props.bounds ?
                        this.props.bounds : null, this.props.focus ? this.props.focus : null,
                        (query: string, results: Location[]) => {
                            if (this.state.waitingResolveFor === locationValue) {
                                this.setState({
                                    waitingResolveFor: undefined
                                });
                            }
                            if (locationValue === this.state.locationValue) {
                                if (results.length > 0) {
                                    this.setValue(results[0], false, true, () => {
                                        this.itemToLocationMap.set(TKUILocationBox.itemId(locationValue), results[0]);
                                        console.log("Resolved: " + JSON.stringify(results[0]));
                                    });
                                } else {
                                    this.props.onFailedToResolve && this.props.onFailedToResolve(
                                        locationValue === this.state.highlightedValue,
                                        new TKError("Cannot resolve address.", ERROR_UNABLE_TO_RESOLVE_ADDRESS));
                                    // this.setValue(null, false, true);
                                }
                            }
                        })
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
        }
    }

    private onChange(inputText: string) {
        this.setState({inputText: inputText}, () => {
            if (inputText === '') {
                this.refreshResults(this.state.inputText);
            } else {
                setTimeout(() => {
                    if (this.state.inputText === inputText) {
                        this.refreshResults(this.state.inputText)
                    }
                }, this.AUTOCOMPLETE_DELAY);
            }
        });
        // Remove location value when user deletes all text.
        if (inputText === '' && this.state.locationValue !== null) {
            this.setValue(null, false, true);
        }
    }

    private refreshResults(inputText: string) {
        this.setState({ waiting: true });
        this.geocodingData.geocode(inputText, true, this.props.bounds ? this.props.bounds : null, this.props.focus ? this.props.focus : null, this.handleAutocompleteResults)
    }

    // noinspection JSUnusedLocalSymbols
    private handleAutocompleteResults(query: string, results: Location[]) {
        if (query !== this.state.inputText) {   // A previous request arrived
            return;
        }
        this.setState({ waiting: false });
        const items: object[] = [];
        this.itemToLocationMap.clear();
        for (const i in results) {
            if (results.hasOwnProperty(i)) {
                const item = {label: TKUILocationBox.itemText(results[i]), id: TKUILocationBox.itemId(results[i])};
                items.push(item);
                this.itemToLocationMap.set(item.id, results[i]);
            }
        }
        // Next two lines are to reset highlighted item
        this.highlightedItem = null;
        this.setState({
            items: []
        }, () => {
            this.setState({
                items: items,
            }, () => {
                this.refreshHighlight()
            });
        })
    }

    private onSelect(selectedItem: string, item: any) {
        const locationValue = this.itemToLocationMap.get(item.id);
        this.setValue(locationValue!, false, true);
        this.inputRef && this.inputRef.blur();   // Lose focus on selection (e.g. user hits enter on highligthed result)
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
        if (this.state.items.length === 0) {
            return null;
        }
        return this.highlightedItem ? this.itemToLocationMap.get(this.highlightedItem)! : null;
    }

    private fireLocationChange(preselect: boolean) {
        if (this.props.onChange) {
            this.props.onChange(preselect ? this.state.highlightedValue : this.state.locationValue, preselect);
        }
    }

    private renderInput(props: any) {
        const classes = this.props.classes;
        return (
            <div className={classes.main}>
                <input type="text" {...props} style={this.props.inputStyle}/>
                {   this.state.waiting || this.state.waitingResolveFor ?
                    <IconSpin className={classes.iconLoading} focusable="false"/> :
                    (this.state.inputText ?
                        <button onClick={this.onClearClicked}
                                className={classes.btnClear}
                                style={resetStyles.button}
                                aria-hidden={true}
                                tabIndex={-1}>
                            <IconRemove aria-hidden={true} className={classes.iconClear} focusable="false"/>
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
                    this.inputRef && this.inputRef.focus();
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
                style={{width: "250px"}}
            />;
            return <Tooltip
                placement={this.props.inputId === "input-to" ? "right" : "rightTop"}
                overlay={overlay}
                arrowContent={<div className="rc-tooltip-arrow-inner"/>}
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
            return <div
                style={
                    { ...style,
                        position: "absolute",
                        top: "initial",
                        left: "0",
                        width: "100%",
                        // visibility: this.state.ddopen() ? "visible" : "hidden"
                        ...this.props.menuStyle
                    }
                }
                children={items}
                className={classes.menu}
                role="listbox"
                id={this.getPopupId()}
            />
        }
    }

    private renderItem(item: any, isHighlighted: boolean) {
        if (isHighlighted) {
            this.highlightedItem = item.id;
        }
        const location = this.itemToLocationMap.get(item.id)!;
        const geocoder = this.geocodingData.options.getGeocoderById(location.source!);
        return (
            <TKUIAutocompleteResult
                id={"item-" + this.state.items.indexOf(item)}
                key={this.state.items.indexOf(item)}
                location={location}
                highlighted={isHighlighted}
                ariaSelected={isHighlighted}
                onClick={() => this.setValue(location, false, true)}
                renderIcon={geocoder && geocoder.getOptions().renderIcon}
            />
        );
    }

    private onKeyDown(e: any) {
        if (e.keyCode === 38 || e.keyCode === 40) {
            setTimeout(this.refreshHighlight, 50);
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
    }

    public componentDidMount() {
        this.setValue(this.props.value);
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
                        if (DeviceUtil.isTablet && !isOpen) {
                            setTimeout(() => {
                                this.setState({focus: isOpen})
                            }, 40);
                        } else {
                            this.setState({focus: isOpen});
                        }
                    }}
                    open={this.state.ddopen()}
                    // open={true}
                    inputProps={
                        {
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
                            "aria-activedescendant": this.highlightedItem ? "item-" + this.state.items.map((item: any) => item.id).indexOf(this.highlightedItem) : undefined,
                            "aria-label": this.props.inputAriaLabel,
                            id: this.props.inputId,
                            "aria-owns": this.state.ddopen() ? popupId : undefined,
                            "aria-controls": this.state.ddopen() ? popupId : undefined
                            // "aria-owns": popupId,
                            // "aria-controls": popupId
                        }
                    }
                    wrapperStyle = {{
                        position: "relative",
                        ...this.props.style
                    }}
                    autoHighlight={false}
                    ref={el => {
                        if (el) {
                            this.inputRef = el;
                        }
                    }}
                    selectOnBlur={true}
                />
        );
    }
}

export default connect((config: TKUIConfig) => config.TKUILocationBox, config,
    mapperFromFunction((clientProps: IClientProps) => clientProps));