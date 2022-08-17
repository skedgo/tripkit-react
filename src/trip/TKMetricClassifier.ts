import Trip from "../model/trip/Trip";
import TripGroup from "../model/trip/TripGroup";

export enum Badges {
    RECOMMENDED = "Recommended",
    FASTEST = "Fastest",
    CHEAPEST = "Cheapest",
    HEALTHIEST = "Healthiest",
    EASIEST = "Easiest",
    GREENEST = "Greenest"
}

function tripMetricForBadge(trip: Trip, badge: Badges): number | undefined {
    switch (badge) {
        case Badges.CHEAPEST: return trip.moneyCost ?? undefined;
        case Badges.EASIEST: return trip.hassleCost;
        case Badges.FASTEST: return trip.duration;
        case Badges.GREENEST: return trip.carbonCost;
        case Badges.HEALTHIEST: return trip.caloriesCost * -1; // inverted
        default: return trip.weightedScore // Badges.RECOMMENDED
    }
}

function metricSortBuilder(badge: Badges): ((trip1: Trip, trip2: Trip) => number) {
    return (trip1: Trip, trip2: Trip) => (tripMetricForBadge(trip1, badge) ?? Number.MAX_SAFE_INTEGER) - (tripMetricForBadge(trip2, badge) ?? Number.MAX_SAFE_INTEGER);
}

class TKMetricClassifier {

    public static getTripClassificationsThroughSort(trips: Trip[], preferredTripSortingFc?: (t1: Trip, t2: Trip) => number): Map<Trip, Badges> {
        const tripToBadge: Map<Trip, Badges> = new Map<Trip, Badges>();
        if (trips.length === 0) {
            return tripToBadge;
        }

        // Don't give any badge to groups which only have cancellations (see #13016).        
        trips = trips.filter(trip => !(trip instanceof TripGroup && trip.allCancelled()));
        // TODO: Order Badges by what the user cares about. Current order is that one of the enum:
        // recommended > fast > cheap > healthy > easy > green
        for (const badgeKey in Badges) {
            const badge = Badges[badgeKey];
            // If the badge metric for any trip is unknown, then don't assign the badge.
            if (trips.some(trip => tripMetricForBadge(trip, badge) === undefined)) {
                continue;
            }
            // Sort trips by metric associated to the badge.
            const sorted = trips.slice().sort((preferredTripSortingFc && badge === Badges.RECOMMENDED) ? preferredTripSortingFc : metricSortBuilder(badge));
            const best = sorted[0];            
            const worst = sorted[sorted.length - 1];
            const metricForBest = tripMetricForBadge(best, badge) ?? Number.MAX_SAFE_INTEGER;
            const metricForWorst = tripMetricForBadge(worst, badge) ?? Number.MAX_SAFE_INTEGER;
            // If there's already a trip with a badge assigned with the same value than the best for the current metric, 
            // then don't assign the badge.
            if (Array.from(tripToBadge.keys()).some(key => tripMetricForBadge(key, badge) === tripMetricForBadge(best, badge))) {
                continue;
            }
            // Don't give the label if everything is so close, except for Badges.RECOMMENDED when a preferred trip sorting function was specified.
            // in which case we have no concept of "so close", since an arbitrary compare function has been specified.
            if ((preferredTripSortingFc && badge === Badges.RECOMMENDED) ||     // Don't filter when Badges.RECOMMENDED and a preferred trip sorting function was specified.
                metricForBest > 0 && metricForWorst > metricForBest * 1.25 ||
                metricForBest <= 0 && metricForWorst * 1.25 > metricForBest) {
                tripToBadge.set(best, badge);
            }
        }
        return tripToBadge;
    }

}

export default TKMetricClassifier;