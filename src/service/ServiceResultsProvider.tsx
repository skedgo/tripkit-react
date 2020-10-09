import * as React from "react";
import ServiceDeparture from "../model/service/ServiceDeparture";
import {Moment} from "moment-timezone";
import withServiceResults, {IWithServiceResultsProps} from "../api/WithServiceResults";
import StopLocation from "../model/StopLocation";
import {EventEmitter} from "fbemitter";
import DateTimeUtil from "../util/DateTimeUtil";
import Segment from "../model/trip/Segment";
import {TKError} from "../error/TKError";

export interface IServiceResultsContext {
    /**
     * The stop from which timetable services depart.
     * @ctype
     */
    stop?: StopLocation;    // TODO: maybe more intuitive timetableForStop and onTimetableForStop?

    /**
     * Timetable stop change callback.
     * @ctype
     */
    onStopChange: (stop?: StopLocation) => void;

    /**
     * The segment that timetable services cover.
     * @ctype
     */
    timetableForSegment?: Segment;

    /**
     * Timetable segment change callback.
     * @ctype
     */
    onTimetableForSegment: (segment?: Segment) => void;

    /**
     * Timetable initial time, i.e. the time from which to consider the service departures.
     * @ctype
     */
    timetableInitTime: Moment;

    /**
     * Timetable init time change callback.
     * @ctype
     */
    onInitTimeChange?: (initTime: Moment) => void;

    /**
     * Timetable filter.
     * @ctype
     */
    timetableFilter: string;

    /**
     * Timetable filter change callback.
     * @ctype
     */
    onFilterChange: (filter: string) => void;

    /**
     * Function that will be called when the user scrolls down to the bottom of the timetable to request more
     * service departures.
     * @ctype
     */
    onRequestMore?: () => void;

    /**
     * Function that will be called to request departures from ```stop```, starting at ```initTime``` until a service
     * identified with ````serviceCode``` is found. Useful to resolve a shared service deep link.
     * @ctype
     */
    onFindAndSelectService: (stop: StopLocation, serviceCode: string, initTime: Moment) => Promise<void>;

    /**
     * Array of service departures to be displayed.
     * @ctype
     */
    departures: ServiceDeparture[];

    /**
     * Stating if we are waiting for service departures to arrive from TripGo api request.
     */
    waiting: boolean;

    /**
     * Describing an error getting service departures.
     */
    serviceError?: TKError;

    /**
     * The title to be used for the timetable.
     */
    title: string;

    /**
     * Stating the service departure in ```departures``` that is currently selected.
     * @ctype
     * @default {@link TKState#selectedTrip}
     */
    selectedService?: ServiceDeparture;

    /**
     * Service departure selection change callback
     * @ctype
     */
    onServiceSelection: (departure?: ServiceDeparture) => void;

    /**
     * @ignore
     */
    servicesEventBus: EventEmitter;
}

export const ServiceResultsContext = React.createContext<IServiceResultsContext>({
    onStopChange: (stop?: StopLocation) => {},
    onTimetableForSegment: (segment?: Segment) => {},
    timetableInitTime: DateTimeUtil.getNow(),
    departures: [],
    waiting: true,
    title: "",
    onServiceSelection: (departure?: ServiceDeparture) => {},
    servicesEventBus: new EventEmitter(),
    onFindAndSelectService: (stop: StopLocation, serviceCode: string, initTime: Moment) => Promise.resolve(),
    onFilterChange: (filter: string) => {},
    timetableFilter: ""
});

class ServiceResultsProvider extends React.Component<IWithServiceResultsProps, {}> {
    private ContextWithValue = withServiceResults((props: IServiceResultsContext) =>
        <ServiceResultsContext.Provider value={props}>{this.props.children}</ServiceResultsContext.Provider>);

    public render(): React.ReactNode {
        return (
            <this.ContextWithValue {...this.props}/>
        );
    }
}

export default ServiceResultsProvider;