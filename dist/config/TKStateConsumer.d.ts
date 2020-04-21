import * as React from "react";
import RoutingQuery from "../model/RoutingQuery";
import Region from "../model/region/Region";
import TKUserProfile from "../model/options/TKUserProfile";
import Trip from "../model/trip/Trip";
import StopLocation from "../model/StopLocation";
import ServiceDeparture from "../model/service/ServiceDeparture";
import { Moment } from "moment-timezone";
import Location from "../model/Location";
interface IProps {
    children: (state: TKState) => React.ReactNode;
}
export interface TKState {
    routingQuery: RoutingQuery;
    preFrom?: Location;
    preTo?: Location;
    inputTextFrom: string;
    inputTextTo: string;
    region?: Region;
    userProfile: TKUserProfile;
    trips?: Trip[];
    selectedTrip?: Trip;
    stop?: StopLocation;
    selectedService?: ServiceDeparture;
    timetableInitTime: Moment;
}
declare class TKStateConsumer extends React.Component<IProps, {}> {
    render(): React.ReactNode;
}
export default TKStateConsumer;
