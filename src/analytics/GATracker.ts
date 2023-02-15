import ReactGA from 'react-ga4';
import { InitOptions as Tracker, UaEventOptions as EventArgs } from 'react-ga4/types/ga4';
import { TKUIGAConfig } from '../config/TKUIConfig';
import ReactUA from 'react-ga';

export const CATEGORY_TRIP_RESULTS = "trip results";
export const CATEGORY_QUERY_INPUT = "query input";
export const ACTION_COMPUTE_TRIPS = "compute trips";
export const ACTION_PICK_FROM_LOCATION = "pick from location";
export const ACTION_PICK_TO_LOCATION = "pick to location";
export const ACTION_SELECT_TIME_PREF = "select time pref";

class GATracker {

    // Registers if initialize method was called, since just in that case calls to
    // GATracker method should have effect. This avoids incorrectly tracking events
    // on a host page that init it's own GA instance,
    // e.g. when you embed the tripkit based app on a page that already setup GA.
    private static initialized = false;
    // If the first tracker has a name, then explicitly use that tracker name to track (e.g. pageviews and events).
    // This forces that first tracker to behave as the default when a host app has already init it's own GA instance,
    // and so the default tracker will be that of the host page,
    // e.g. when you embed the tripkit based app on a page that already setup GA.
    private static defaultTrackerId: string;

    // It's checked before every GA event, allowing to enable / disable tracking
    // dynamically, e.g. depending con cookies / tracking consent.
    private static isEnabled: () => boolean = () => true;

    private static isOldUA?: boolean;

    public static initialize(props: TKUIGAConfig) {
        const { tracker, isEnabled = () => true, isOldUA } = props;
        GATracker.isOldUA = isOldUA;
        if (isOldUA) {
            ReactUA.initialize([{ ...tracker, gaOptions: { name: "skedgo" }, debug: true }], { alwaysSendToDefaultTracker: false });
        } else {
            ReactGA.initialize([tracker]);
        }
        this.defaultTrackerId = isOldUA ? "skedgo" : tracker.trackingId;
        this.initialized = true;
        this.isEnabled = isEnabled;
    };

    public static event(args: EventArgs) {
        if (GATracker.isOldUA) {
            this.initialized && this.isEnabled() && ReactUA.event(args, [this.defaultTrackerId]);
        } else {
            this.initialized && this.isEnabled() && ReactGA.event(args, { 'send_to': this.defaultTrackerId });
        }
    }

}

export type TrackerOptions = Tracker;
export default GATracker;