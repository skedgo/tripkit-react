import Location from "../Location";
import { Any, JsonObject, JsonProperty } from "json2typescript";
import { LocationConverter } from "../location/LocationConverter";
import Favourite from "./Favourite";
import TKUserProfile from "../options/TKUserProfile";
import Trip from "../trip/Trip";

interface WaypointSegment {
    start: string;
    end: string;
    modes: string[];
}

@JsonObject
class FavouriteTrip extends Favourite {

    @JsonProperty('startLocation', LocationConverter)
    public startLocation: Location = new Location();   // need to specify default value in order for json2typescript to work
    @JsonProperty('endLocation', LocationConverter)
    public endLocation: Location = new Location();     // need to specify default value in order for json2typescript to work
    @JsonProperty('pattern', [Any])
    public pattern: WaypointSegment[] = [];

    public static create(trip: Trip): FavouriteTrip {
        const instance = new FavouriteTrip();
        instance.startLocation = trip.segments[0].from;
        instance.endLocation = trip.segments[trip.segments.length - 1].to;
        instance.pattern = trip.segments.reduce((waypoints, segment) => {
            if (segment.modeIdentifier) {
                waypoints.push({
                    start: "(" + segment.from.lat + "," + segment.from.lng + ")",
                    end: "(" + segment.to.lat + "," + segment.to.lng + ")",
                    modes: [segment.modeIdentifier]
                });
            }
            return waypoints;
        }, [] as WaypointSegment[]);
        instance.name = `${instance.startLocation.getDisplayString()} to ${instance.endLocation.getDisplayString()}`
        instance.type = "trip";
        return instance;
    }

    // TODO: delete all below once remove all uses.

    get from(): Location {
        return new Location();
    }

    set from(value: Location) {

    }

    get to(): Location {
        return new Location();
    }

    set to(value: Location) {

    }

    get options(): TKUserProfile | undefined {
        return new TKUserProfile();
    }

    set options(value: TKUserProfile | undefined) {

    }

    // public getKey(): string {
    //     // TODO: Revise this, for the trip to be the same we need to check the pattern, or just if it has the same uuid.
    //     // Give priority to the id, since, for instance, getKey for a CarParkLocation returns an id, while for the same object deserialized as a location it returns the lat,lng.
    //     return (this.startLocation.isCurrLoc() ? "CurrLoc" : this.startLocation.id ?? this.startLocation.getKey()) + (this.endLocation.isCurrLoc() ? "CurrLoc" : this.endLocation.id ?? this.endLocation.getKey());
    // }

    // public equals(other: any): boolean {
    //     if (other === undefined || other === null || !(other instanceof FavouriteTrip)) {
    //         return false;
    //     }
    //     return this.getKey() === other.getKey();
    // }
}

export default FavouriteTrip;