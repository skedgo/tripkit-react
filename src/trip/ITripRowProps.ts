import Trip from "../model/trip/Trip";
import {EventEmitter} from "fbemitter";
import TripGroup from "../model/trip/TripGroup";

interface ITripRowProps {
    value: Trip;
    className?: string;
    brief?: boolean;
    onClick?: () => void;
    onFocus?: () => void;
    onKeyDown?: (e: any) => void;
    eventBus?: EventEmitter;
    onAlternativeChange?: (group: TripGroup, alt: Trip) => void;
}

export const TRIP_ALT_PICKED_EVENT = "onTripAltPicked";

export default ITripRowProps;