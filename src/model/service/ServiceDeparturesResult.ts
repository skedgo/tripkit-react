import {JsonObject, JsonProperty} from "json2typescript";
import EmbarkationStopResult from "./EmbarkationStopResult";
import StopLocation from "../StopLocation";
import ServiceDeparture from "./ServiceDeparture";
import StopLocationParent from "./StopLocationParent";

@JsonObject
class ServiceDeparturesResult {

    // It's required, but it doesn't come if it's an error json, so allow to be undefined.
    @JsonProperty("embarkationStops", [EmbarkationStopResult], true)
    public embarkationStops: EmbarkationStopResult[] | undefined = undefined;
    @JsonProperty("parentInfo", StopLocationParent, true)
    public parentInfo: StopLocationParent | undefined = undefined;
    // @JsonProperty("alerts", [RealTimeAlert], true)
    // public alerts: RealTimeAlert[] | undefined = undefined

    public isError() {
        return !this.embarkationStops;
    }

    public getDepartures(startStop: StopLocation): ServiceDeparture[] {
        const departures: ServiceDeparture[] = [];
        for (const stopDepartures of this.embarkationStops!) {
            let departureStop = this.parentInfo ? this.parentInfo.getStopFromCode(stopDepartures.stopCode) : undefined;
            // TODO: When stop used to request departures does not come as part of parentInfo, is this still hapenning (shouldn't)?
            if (!departureStop && stopDepartures.stopCode === startStop.code) {
                departureStop = startStop;
            }
            for (const departure of stopDepartures.services) {
                departure.startStop = departureStop;
                departure.startStopCode = stopDepartures.stopCode;
                departures.push(departure);
                // if (departure.getAlertHashCodes() != null) {
                //     List<GWTSegmentAlert> alerts = new ArrayList<>();
                //     for (Long alertHash : departure.getAlertHashCodes()) {
                //         GWTSegmentAlert alert = getAlert(alertHash);
                //         if (alert != null)
                //             alerts.add(alert);
                //     }
                //     departure.setAlerts(alerts);
                // }
            }
        }
        return departures;
    }
}

export default ServiceDeparturesResult;