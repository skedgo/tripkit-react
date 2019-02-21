import React, { Component } from 'react';
import Autocomplete from 'react-autocomplete';
import './LocationBox.css';
import IconRemove from '-!svg-react-loader!../images/ic-cross.svg'
import IconSpin from '-!svg-react-loader!../images/ic-loading2.svg'
import MultiGeocoder from "../geocode/MultiGeocoder";
import Location from '../model/Location';
import ResultItem from "./ResultItem";
import BBox from "../model/BBox";
import LatLng from "../model/LatLng";
import Tooltip from "rc-tooltip";
import DeviceUtil from "../util/DeviceUtil";

interface IProps {
    geocodingData: MultiGeocoder,
    placeholder?: string,
    bounds?: BBox,
    focus?: LatLng,
    value: Location | null,
    onChange?: (value: Location | null, highlighted: boolean) => void,
    resolveCurr?: boolean
    inputAriaLabel?: string;
    inputId?: string;
    sideDropdown?: boolean;
}

interface IState {
    inputText: string,
    locationValue: Location | null,
    highlightedValue: Location | null;
    items: any[],
    focus: boolean,
    ddopen: () => boolean;
    waiting: boolean;
}

class LocationBox extends Component<IProps, IState> {

    private itemToLocationMap: object = [];
    private highlightedItem: string | null = null;
    private geocodingData: MultiGeocoder;
    private inputRef: any;
    private inputFrameRef: any;

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

    private static itemText(location: Location): string {
        return location.address;
    }

    /**
     * Set a location to the location box.
     * @param {Location | null} locationValue - The location to set.
     * @param {boolean} highlighted - Indicates if the location is set just as highlighted, or as selected.
     * @param {boolean} fireEvents - If should fire events.
     */
    public setValue(locationValue: Location | null, highlighted: boolean = false, fireEvents: boolean = false, callback?: () => void) {
        let inputText = this.state.inputText;
        if (!highlighted) {   // Set location address as input text
            inputText = locationValue ? LocationBox.itemText(locationValue) : '';
        }
        const setStateCallback = () => {
            if (locationValue && !locationValue.isResolved() &&
                (!locationValue.isCurrLoc() || (this.props.resolveCurr && !highlighted))) {
                this.setState({waiting: true});
                this.geocodingData.resolveLocation(locationValue, (resolvedLocation: Location) => {
                    if (locationValue === this.state.locationValue) {
                        this.setState({
                            locationValue: resolvedLocation,
                            waiting: false
                        }, () => {
                            this.itemToLocationMap[LocationBox.itemText(locationValue)] = resolvedLocation;
                            this.fireLocationChange(highlighted);
                        });
                    }
                });
            } else if (fireEvents) {
                this.fireLocationChange(highlighted);
            }
            if (callback) {
                callback();
            }
        };
        if (!highlighted) {
            this.setState({
                inputText: inputText,
                locationValue: locationValue,
                items: []
            }, setStateCallback);
        } else {
            this.setState({
                inputText: inputText,
                highlightedValue: locationValue,
                items: this.state.items
            }, setStateCallback);
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
        this.itemToLocationMap = [];
        for (const i in results) {
            if (results.hasOwnProperty(i)) {
                const displayText = LocationBox.itemText(results[i]);
                items.push({label: displayText});
                this.itemToLocationMap[displayText] = results[i];
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

    private onSelect(selectedItem: string) {
        const locationValue = this.itemToLocationMap[selectedItem];
        this.setValue(locationValue, false, true);
        this.inputRef.blur();   // Lose focus on selection (e.g. user hits enter on highligthed result)
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
        return this.highlightedItem ? this.itemToLocationMap[this.highlightedItem] : null;
    }

    private fireLocationChange(preselect: boolean) {
        if (this.props.onChange) {
            this.props.onChange(preselect ? this.state.highlightedValue : this.state.locationValue, preselect);
        }
    }

    private renderInput(props: any) {
        return (
            <div className="LocationBox" ref={el => this.inputFrameRef = el}>
                <input type="text" {...props}/>
                {   this.state.waiting ?
                    <IconSpin className="LocationBox-iconLoading sg-animate-spin" focusable="false"/> :
                    (this.state.inputText ?
                        <button onClick={this.onClearClicked} className="LocationBox-btnClear" aria-hidden={true} tabIndex={-1}>
                            <IconRemove aria-hidden={true} className="LocationBox-iconClear" focusable="false"/>
                        </button> :
                        "")
                }
            </div>
        );
    }

    private onClearClicked() {
        // focus() must be called after completion of setState() inside setValue()
        this.setValue(null, false, true,
            () => this.inputRef.focus());
    }

    // noinspection JSUnusedLocalSymbols
    private renderMenu(items: any[], value: any, style: any) {
        if (this.props.sideDropdown) {
            const overlay = <div
                children={items}
                role="listbox"
                id={this.getPopupId()}
                className="app-style"
                style={{width: "250px"}}
            />;
            return <Tooltip
                placement={this.props.inputId === "input-to" ? "right" : "rightTop"}
                overlay={overlay}
                arrowContent={<div className="rc-tooltip-arrow-inner"/>}
                visible={true}
                overlayClassName="LocationBox-sideMenu"
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
                    }
                }
                children={items}
                className="LocationBox-menu"
                role="listbox"
                id={this.getPopupId()}
            />
        }
    }

    private renderItem(item: any, isHighlighted: boolean) {
        if (isHighlighted) {
            this.highlightedItem = item.label;
        }
        return (
            <ResultItem
                id={"item-" + this.state.items.indexOf(item)}
                key={this.state.items.indexOf(item)}
                location={this.itemToLocationMap[item.label]}
                highlighted={isHighlighted}
                ariaSelected={isHighlighted}
                onClick={() => this.setValue(this.itemToLocationMap[item.label], false, true)}
            />
        );
    }

    private onKeyDown(e: any) {
        if (e.keyCode === 38 || e.keyCode === 40) {
            setTimeout(this.refreshHighlight, 50);
        }
    }

    public componentWillReceiveProps(nextProps: any) {
        // Don't have to do this check first, but it can help prevent an unneeded render
        if (nextProps.value !== this.state.locationValue) {
            this.setValue(nextProps.value);
        }
    }

    public setFocus() {
        if (this.inputRef) {
            this.inputRef.focus();
        }
    }

    private getPopupId() {
        return this.props.inputId ? "popup-" + this.props.inputId : undefined;
    }

    public render() {
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
                            onFocus: () => {this.refreshResults(this.state.inputText);},
                            "aria-activedescendant": this.highlightedItem ? "item-" + this.state.items.map((item: any) => item.label).indexOf(this.highlightedItem) : undefined,
                            "aria-label": this.props.inputAriaLabel,
                            id: this.props.inputId,
                            "aria-owns": this.state.ddopen() ? popupId : undefined,
                            "aria-controls": this.state.ddopen() ? popupId : undefined
                            // "aria-owns": popupId,
                            // "aria-controls": popupId
                        }
                    }
                    wrapperStyle = {{
                        position: "relative"
                    }}
                    autoHighlight={false}
                    ref={el => this.inputRef = el}
                    selectOnBlur={true}
                />
        );
    }
}

export default LocationBox;