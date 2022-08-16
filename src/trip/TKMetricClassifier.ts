import Trip from "../model/trip/Trip";
import TripGroup from "../model/trip/TripGroup";
import TransportUtil from "./TransportUtil";

export enum Badges {
    CHEAPEST = "Cheapest",
    EASIEST = "Easiest",
    FASTEST = "Fastest",
    GREENEST = "Greenest",
    HEALTHIEST = "Healthiest",
    RECOMMENDED = "Recommended"
}

class TKMetricClassifier {

    public static getTripClassifications(trips: Trip[], modePriorities?: string[][]): Map<Trip, Badges> {
        const ranges =
        {
            priorityBucket: { min: Number.MAX_SAFE_INTEGER },
            weighted: { min: Number.MAX_SAFE_INTEGER, max: 0 },
            hassles: { min: Number.MAX_SAFE_INTEGER, max: 0 },
            durations: { min: Number.MAX_SAFE_INTEGER, max: 0 },
            calories: { min: Number.MAX_SAFE_INTEGER, max: -Number.MAX_SAFE_INTEGER },    // Since it's inverted (negative range).
            carbons: { min: Number.MAX_SAFE_INTEGER, max: 0 },
            cheapest: { min: Number.MAX_SAFE_INTEGER, max: 0, anyUnknown: false }
        };
        // Find the first bucket matching some trip.
        let firstNonemptyBucket = modePriorities?.findIndex(bucket => trips.some(trip => TransportUtil.bucketMatchesTrip(bucket, trip)));
        if (firstNonemptyBucket === -1) {
            firstNonemptyBucket = modePriorities?.length;
        }
        for (const trip of trips) {
            // If mode priorities were specified, just consider for setting the weighted.min those trips in the first non-empty bucket.            
            if (!modePriorities || TransportUtil.matchingBucketIndex(trip, modePriorities) === firstNonemptyBucket) {
                ranges.weighted.min = Math.min(ranges.weighted.min, trip.weightedScore);
            }
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
            const classification = this.classification(trip, ranges, modePriorities, firstNonemptyBucket);
            if (classification) {
                tripToBadge.set(trip, classification);
            }
        }
        return tripToBadge;
    }

    private static classification(trip: Trip, ranges: any, modePriorities?: string[][], firstNonemptyBucket?: number): Badges | undefined {
        // TODO: Order this by what the user cares about
        // recommended > fast > cheap > healthy > easy > green
        
        // Don't give any badge to groups which only have cancellations (see #13016).
        // TODO check: if I want the badge to be reused by another trip maybe also need to exclude
        // cancelled groups from ranges calculation (getTripClassifications()).
        if (trip instanceof TripGroup && trip.allCancelled()) {
            return undefined;
        }
        // If mode priorities was specified, just consider for recommended badge those trips in the first non-empty bucket
        // (notice a trip in other bucket may casually match the ranges.weighted.min score, but shouldn't be considered).
        if ((!modePriorities || TransportUtil.matchingBucketIndex(trip, modePriorities) === firstNonemptyBucket) &&
            this.matches(ranges.weighted, trip.weightedScore)) {
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

    private static matches(range: { min: number, max: number, anyUnknown?: boolean }, value?: number): boolean {
        if (!value || range.anyUnknown) {
            return false;
        }
        if (value !== range.min) {
            return false;
        }
        // max has to be more than 25% of min, i.e., don't give the label if everything is so close
        return range.min > 0 ? range.max > range.min * 1.25 : range.max * 1.25 > range.min; // To contemplate the case of calories, which comes with negative values.
    }

}

export default TKMetricClassifier;