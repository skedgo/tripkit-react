import Trip from "../model/trip/Trip";
import TripGroup from "../model/trip/TripGroup";

export enum Badges {
    CHEAPEST = "Cheapest",
    EASIEST = "Easiest",
    FASTEST = "Fastest",
    GREENEST = "Greenest",
    HEALTHIEST = "Healthiest",
    RECOMMENDED = "Recommended"
}

class TKMetricClassifier {

    public static getTripClassifications(trips: Trip[]): Map<Trip, Badges> {
        const ranges =
            {
                weighted: {min: Number.MAX_SAFE_INTEGER, max: 0},
                hassles: {min: Number.MAX_SAFE_INTEGER, max: 0},
                durations: {min: Number.MAX_SAFE_INTEGER, max: 0},
                calories: {min: Number.MAX_SAFE_INTEGER, max: 0},
                carbons: {min: Number.MAX_SAFE_INTEGER, max: 0},
                cheapest: {min: Number.MAX_SAFE_INTEGER, max: 0, anyUnknown: false}
            };
        for (const trip of trips) {
            ranges.weighted.min = Math.min(ranges.weighted.min, trip.weightedScore);
            ranges.weighted.max = Math.max(ranges.weighted.max, trip.weightedScore);
            ranges.hassles.min = Math.min(ranges.hassles.min, trip.hassleCost);
            ranges.hassles.max = Math.max(ranges.hassles.max, trip.hassleCost);
            ranges.durations.min = Math.min(ranges.durations.min, trip.duration);
            ranges.durations.max = Math.max(ranges.durations.max, trip.duration);
            ranges.calories.min = Math.min(ranges.calories.min, trip.caloriesCost * -1);    // inverted!
            ranges.calories.max = Math.max(ranges.calories.max, trip.caloriesCost * -1);
            ranges.carbons.min = Math.min(ranges.carbons.min, trip.carbonCost);
            ranges.carbons.max = Math.max(ranges.carbons.max, trip.carbonCost);
            if (trip.moneyCost) {
                ranges.cheapest.min = Math.min(ranges.cheapest.min, trip.moneyCost);
                ranges.cheapest.max = Math.max(ranges.cheapest.max, trip.moneyCost);
            } else {
                ranges.cheapest.anyUnknown = true;
            }
        }
        const tripToBadge: Map<Trip, Badges> = new Map<Trip, Badges>();
        for (const trip of trips) {
            const classification = this.classification(trip, ranges);
            if (classification) {
                tripToBadge.set(trip, classification);
            }
        }
        return tripToBadge;
    }

    private static classification(trip: Trip, ranges: any): Badges | undefined {
        // TODO: Order this by what the user cares about
        // recommended > fast > cheap > healthy > easy > green

        // guard let trip = tripGroup.visibleTrip else { return nil }

        // Don't give any badge to groups which only have cancellations (see #13016).
        // TODO check: if I want the badge to be reused by another trip maybe also need to exclude
        // cancelled groups from ranges calculation (getTripClassifications()).
        if (trip instanceof TripGroup && trip.allCancelled()) {
            return undefined;
        }

        if (this.matches(ranges.weighted, trip.weightedScore)) {
            return Badges.RECOMMENDED;
        }
        if (this.matches(ranges.durations, trip.duration)) {
            return Badges.FASTEST;
        }
        if (this.matches(ranges.cheapest, trip.moneyCost ? trip.moneyCost : undefined)) {
            return Badges.CHEAPEST;
        }
        if (this.matches(ranges.calories, trip.caloriesCost * -1)) { // inverted!
            return Badges.HEALTHIEST;
        }
        if (this.matches(ranges.hassles, trip.hassleCost)) {
            return Badges.EASIEST;
        }
        if (this.matches(ranges.carbons, trip.carbonCost)) {
            return Badges.GREENEST;
        }
        return undefined;
    }

    private static matches(range: {min: number, max: number, anyUnknown?: boolean}, value?: number): boolean {
        if (!value || range.anyUnknown) {
            return false;
        }
        if (value !== range.min) {
            return false;
        }
        // max has to be more than 25% of min, i.e., don't give the label if everything is so close
        return range.max > range.min * 1.25;
    }

}

export default TKMetricClassifier;