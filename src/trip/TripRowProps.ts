import Trip from "../model/trip/Trip";
import {EventEmitter} from "fbemitter";

interface TripRowProps {
    value: Trip;
    className?: string;
    brief?: boolean;
    onClick?: () => void;
    onFocus?: () => void;
    onKeyDown?: (e: any) => void;
    eventBus?: EventEmitter;
}

export const TRIP_ALT_PICKED_EVENT = "onTripAltPicked";

export default TripRowProps;