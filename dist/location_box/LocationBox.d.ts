import { Component } from 'react';
import './LocationBox.css';
import MultiGeocoder from "../geocode/MultiGeocoder";
import Location from '../model/Location';
import BBox from "../model/BBox";
import LatLng from "../model/LatLng";
interface IProps {
    geocodingData: MultiGeocoder;
    placeholder?: string;
    bounds?: BBox;
    focus?: LatLng;
    value: Location | null;
    onChange?: (value: Location | null, highlighted: boolean) => void;
    resolveCurr?: boolean;
    inputAriaLabel?: string;
    inputId?: string;
    sideDropdown?: boolean;
}
interface IState {
    inputText: string;
    locationValue: Location | null;
    highlightedValue: Location | null;
    items: any[];
    focus: boolean;
    ddopen: () => boolean;
    waiting: boolean;
}
declare class LocationBox extends Component<IProps, IState> {
    private itemToLocationMap;
    private highlightedItem;
    private geocodingData;
    private inputRef;
    private inputFrameRef;
    private readonly AUTOCOMPLETE_DELAY;
    static defaultProps: Partial<IProps>;
    constructor(props: IProps);
    private static itemText;
    /**
     * Set a location to the location box.
     * @param {Location | null} locationValue - The location to set.
     * @param {boolean} highlighted - Indicates if the location is set just as highlighted, or as selected.
     * @param {boolean} fireEvents - If should fire events.
     */
    setValue(locationValue: Location | null, highlighted?: boolean, fireEvents?: boolean, callback?: () => void): void;
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
    componentWillReceiveProps(nextProps: any): void;
    setFocus(): void;
    private getPopupId;
    render(): JSX.Element;
}
export default LocationBox;
