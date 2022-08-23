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

    // TODO: Order Badges by what the user cares about. Current order is that one of the enum:
    // recommended > fast > cheap > healthy > easy > green
    public static getTripClassifications(trips: Trip[], options: {
        badges?: Badges[],
        preferredTripCompareFc?: (t1: Trip, t2: Trip) => number
    } = {}): Map<Trip, Badges> {
        const { badges = Object.values(Badges), preferredTripCompareFc } = options;
        const tripToBadge: Map<Trip, Badges> = new Map<Trip, Badges>();
        if (trips.length === 0) {
            return tripToBadge;
        }

        // Don't give any badge to groups which only have cancellations (see #13016).        
        trips = trips.filter(trip => !(trip instanceof TripGroup && trip.allCancelled()));
        for (const badge of badges) {
            // If the badge metric for any trip is unknown, then don't assign the badge.
            if (trips.some(trip => tripMetricForBadge(trip, badge) === undefined)) {
                continue;
            }
            // Sort trips by the metric associated to the badge.
            const sorted = trips.slice().sort((preferredTripCompareFc && badge === Badges.RECOMMENDED) ? preferredTripCompareFc : metricSortBuilder(badge));
            const best = sorted[0];
            const worst = sorted[sorted.length - 1];
            const metricForBest = tripMetricForBadge(best, badge) ?? Number.MAX_SAFE_INTEGER;
            const metricForWorst = tripMetricForBadge(worst, badge) ?? Number.MAX_SAFE_INTEGER;
            // If there's a trip with a badge that is as good w.r.t. the current metric (also with value metricForBest), 
            // then don't assign the badge.
            if (Array.from(tripToBadge.keys()).some(key => tripMetricForBadge(key, badge) === metricForBest)) {
                continue;
            }
            // Don't assign a badge if there's just one trip and we are using a custom preferred sorting (if no custom sorting
            // then this single trip case is contemplated by the condition below)
            if (preferredTripCompareFc && badge === Badges.RECOMMENDED && trips.length === 1) {
                continue;
            }

            // Don't give the label if everything is so close, except for Badges.RECOMMENDED when a preferred trip sorting function was specified,
            // in which case we have no concept of "so close", since an arbitrary compare function has been specified.
            // Assign the same badge to all the trips that are equivalent according to metric / compare function to the best one.
            // Notice that except for the possibilty of a metric to be undefined for a trip, we can model all of this with compare functions 
            // associated to metrics, instead of the metric values themselves, where the compare functions can be by default derived from metrics.
            const bests = sorted.filter(trip => (preferredTripCompareFc && badge === Badges.RECOMMENDED) ?
                preferredTripCompareFc(trip, best) === 0 :
                tripMetricForBadge(trip, badge) === metricForBest);
            bests.forEach(best => {
                if (preferredTripCompareFc && badge === Badges.RECOMMENDED ||
                    metricForBest > 0 && metricForWorst > metricForBest * 1.25 ||
                    metricForBest <= 0 && metricForWorst * 1.25 > metricForBest) {
                    tripToBadge.set(best, badge);
                }
            });            
            // Original version, where a badge can just be assigned to 1 trip.
            // if (preferredTripCompareFc && badge === Badges.RECOMMENDED ||
            //     metricForBest > 0 && metricForWorst > metricForBest * 1.25 ||
            //     metricForBest <= 0 && metricForWorst * 1.25 > metricForBest) {
            //     tripToBadge.set(best, badge);
            // }
        }
        return tripToBadge;
    }

}

export default TKMetricClassifier;