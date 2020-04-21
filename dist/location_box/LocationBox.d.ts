import { Component } from 'react';
import './LocationBox.css';
import MultiGeocoder from "../geocode/MultiGeocoder";
import Location from '../model/Location';
import BBox from "../model/BBox";
import LatLng from "../model/LatLng";
import * as CSS from 'csstype';
interface IProps {
    geocodingData: MultiGeocoder;
    placeholder?: string;
    bounds?: BBox;
    focus?: LatLng;
    value: Location | null;
    onChange?: (value: Location | null, highlighted: boolean) => void;
    onInputTextChange?: (text: string) => void;
    resolveCurr?: boolean;
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
interface IState {
    inputText: string;
    locationValue: Location | null;
    highlightedValue: Location | null;
    items: any[];
    focus: boolean;
    ddopen: () => boolean;
    waiting: boolean;
    waitingResolveFor?: Location;
}
export declare const ERROR_UNABLE_TO_RESOLVE_ADDRESS = "ERROR_UNABLE_TO_RESOLVE_ADDRESS";
declare class LocationBox extends Component<IProps, IState> {
    private itemToLocationMap;
    private highlightedItem;
    private geocodingData;
    private inputRef;
    private readonly AUTOCOMPLETE_DELAY;
    static defaultProps: Partial<IProps>;
    constructor(props: IProps);
    static itemText(location: Location): string;
    private static itemId;
    /**
     * Set a location to the location box.
     * @param {Location | null} locationValue - The location to set.
     * @param {boolean} highlighted - Indicates if the location is set just as highlighted, or as selected.
     * @param {boolean} fireEvents - If should fire events.
     */
    setValue(locationValue: Location | null, highlighted?: boolean, fireEvents?: boolean, callback?: () => void): void;
    private resolve;
    private onChange;
    private refreshResults;
    private handleAutocompleteResults;
    private onSelect;
    /**
     * Refreshes location value to reflect item highlighted according to Autocomplete component.
     */
    private refreshHighlight;
    private getHighlightedLocation;
    private fireLocationChange;
    private renderInput;
    private onClearClicked;
    private renderMenu;
    private renderItem;
    private onKeyDown;
    componentDidUpdate(prevProps: IProps, prevState: IState): void;
    componentDidMount(): void;
    private getPopupId;
    render(): JSX.Element;
}
export default LocationBox;
