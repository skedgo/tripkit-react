import ReactGA, {Tracker, InitializeOptions, EventArgs, TrackerNames} from 'react-ga';

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
    private static defaultTracker?: string;

    // It's checked before every GA event, allowing to enable / disable tracking
    // dynamically, e.g. depending con cookies / tracking consent.
    private static isEnabled: () => boolean = () => true;

    public static initialize(trackers: Tracker[], options?: InitializeOptions, isEnabled: () => boolean = () => true) {
        ReactGA.initialize(trackers, options);
        if (trackers[0].gaOptions && trackers[0].gaOptions.name) {
            this.defaultTracker = trackers[0].gaOptions.name;
        }
        this.initialized = true;
        this.isEnabled = isEnabled;
    };

    public static pageview(path: string, trackerNames?: TrackerNames, title?: string): void {
        const trackers = trackerNames ? trackerNames : this.defaultTracker ? [this.defaultTracker] : undefined;
        this.initialized && this.isEnabled() && ReactGA.pageview(path, trackers, title);
    }

    public static event(args: EventArgs, trackerNames?: TrackerNames) {
        const trackers = trackerNames ? trackerNames : this.defaultTracker ? [this.defaultTracker] : undefined;
        this.initialized && this.isEnabled() && ReactGA.event(args, trackers);
    }

}

export type TrackerOptions = Tracker;
export default GATracker;