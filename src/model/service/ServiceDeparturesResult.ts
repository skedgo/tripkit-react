import {JsonObject, JsonProperty} from "json2typescript";
import EmbarkationStopResult from "./EmbarkationStopResult";
import StopLocation from "../StopLocation";
import ServiceDeparture from "./ServiceDeparture";
import StopLocationParent from "./StopLocationParent";
import RealTimeAlert from "./RealTimeAlert";

@JsonObject
class ServiceDeparturesResult {

    // It's required, but it doesn't come if it's an error json, so allow to be undefined.
    @JsonProperty("embarkationStops", [EmbarkationStopResult], true)
    public embarkationStops: EmbarkationStopResult[] | undefined = undefined;
    @JsonProperty("parentInfo", StopLocationParent, true)
    public parentInfo: StopLocationParent | undefined = undefined;
    @JsonProperty('alerts', [RealTimeAlert], true)
    public alerts: RealTimeAlert[] = [];

    private alertsMap: Map<number, RealTimeAlert> = new Map<number, RealTimeAlert>();

    public isError() {
        return !this.embarkationStops;
    }

    public getDepartures(startStop: StopLocation): ServiceDeparture[] {
        const departures: ServiceDeparture[] = [];
        for (const alert of this.alerts) {
            this.alertsMap.set(alert.hashCode, alert);
        }
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
                const departureAlerts = [];
                for (const alertHash of departure.alertHashCodes) {
                    const departureAlert = this.alertsMap.get(alertHash);
                    if (departureAlert) {
                        departureAlerts.push(departureAlert);
                    }
                }
                departure.alerts = departureAlerts;
            }
        }
        return departures;
    }
}

export default ServiceDeparturesResult;