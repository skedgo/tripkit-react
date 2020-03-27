import {JsonObject, JsonProperty, JsonCustomConvert, JsonConverter} from "json2typescript";
import EmbarkationStopResult from "./EmbarkationStopResult";
import StopLocation from "../StopLocation";
import ServiceDeparture from "./ServiceDeparture";
import StopLocationParent from "./StopLocationParent";
import RealTimeAlert from "./RealTimeAlert";
import Util from "../../util/Util";

@JsonConverter
export class StopsLocationConverter implements JsonCustomConvert<StopLocation[]> {
    public serialize(location: StopLocation[]): any {
        return Util.serialize(location);
    }
    public deserialize(locationsJson: any): StopLocation[] {
        const locations: StopLocation[] = [];
        for (const locationJson of locationsJson) {
            if (locationJson.class === "ParentStopLocation" || locationJson.children) {
                locations.push(Util.deserialize(locationJson, StopLocationParent));
            } else {
                locations.push(Util.deserialize(locationJson, StopLocation));
            }
        }
        return locations;
    }
}

@JsonObject
class ServiceDeparturesResult {

    // It's required, but it doesn't come if it's an error json, so allow to be undefined.
    @JsonProperty("embarkationStops", [EmbarkationStopResult], true)
    public embarkationStops: EmbarkationStopResult[] | undefined = undefined;
    @JsonProperty("parentInfo", StopLocationParent, true)
    public parentInfo: StopLocationParent | undefined = undefined;
    @JsonProperty('alerts', [RealTimeAlert], true)
    public alerts: RealTimeAlert[] = [];
    @JsonProperty("stops", StopsLocationConverter, true)    // Does not appear on api specs.
    public stops: StopLocation[] | undefined = undefined;

    private alertsMap: Map<number, RealTimeAlert> = new Map<number, RealTimeAlert>();

    public isError() {
        return !this.embarkationStops;
    }

    public getStopFromCode(code: string): StopLocation | undefined {
        let result = this.parentInfo && this.parentInfo.getStopFromCode(code);
        if (!result && this.stops) {
            for (const parentStop of this.stops) {
                if (parentStop.code === code) {
                    result = parentStop;
                    break
                }
                if (parentStop instanceof StopLocationParent) {
                    result = parentStop.getStopFromCode(code);
                    break
                }
            }
        }
        return result;
    }

    public getDepartures(startStop: StopLocation): ServiceDeparture[] {
        const departures: ServiceDeparture[] = [];
        for (const alert of this.alerts) {
            this.alertsMap.set(alert.hashCode, alert);
        }
        for (const stopDepartures of this.embarkationStops!) {
            let departureStop = this.getStopFromCode(stopDepartures.stopCode);
            // TODO: When stop used to request departures does not come as part of parentInfo, is this still hapenning (shouldn't)?
            if (!departureStop && stopDepartures.stopCode === startStop.code) {
                departureStop = startStop;
            }
            for (const departure of stopDepartures.services) {
                departure.startStop = departureStop;
                departure.startStopCode = stopDepartures.stopCode;
                departure.startTimezone = startStop.timezone;
                if (departure.endStopCode) {
                    departure.endStop = this.getStopFromCode(departure.endStopCode);
                }
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