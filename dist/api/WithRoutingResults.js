var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    }
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) if (e.indexOf(p[i]) < 0)
            t[p[i]] = s[p[i]];
    return t;
};
import TripGoApi from "./TripGoApi";
import * as React from "react";
import RoutingQuery from "../model/RoutingQuery";
function withRoutingResults(Consumer) {
    return /** @class */ (function (_super) {
        __extends(WithRoutingResults, _super);
        function WithRoutingResults(props) {
            var _this = _super.call(this, props) || this;
            _this.state = {
                query: RoutingQuery.create(),
                trips: null,
                waiting: false
            };
            _this.onQueryChange = _this.onQueryChange.bind(_this);
            _this.onReqRealtimeFor = _this.onReqRealtimeFor.bind(_this);
            _this.onAlternativeChange = _this.onAlternativeChange.bind(_this);
            return _this;
        }
        WithRoutingResults.prototype.onQueryChange = function (query) {
            var _this = this;
            var prevQuery = this.state.query;
            this.setState({ query: query });
            if (query.isComplete(true)) {
                if (!prevQuery.sameApiQueries(query)) { // Avoid requesting routing again if query url didn't change, e.g. dropped location resolved.
                    this.setState({
                        trips: [],
                        waiting: true
                    });
                    TripGoApi.computeTrips(query).then(function (tripPromises) {
                        if (tripPromises.length === 0) {
                            _this.setState({ waiting: false });
                            return;
                        }
                        var waitingState = {
                            query: query,
                            remaining: tripPromises.length
                        };
                        tripPromises.map(function (tripsP) { return tripsP.then(function (trips) {
                            if (!_this.state.query.sameApiQueries(query)) {
                                return;
                            }
                            if (trips !== null && _this.state.trips !== null) {
                                trips = trips.filter(function (trip) { return !_this.alreadyAnEquivalent(trip, _this.state.trips); });
                            }
                            if (tripPromises.length === 1 && trips.length > 0 && trips[0].isBicycleTrip()) {
                                trips = trips[0].trips;
                            }
                            _this.setState(function (prevState) {
                                return { trips: prevState.trips.concat(trips) };
                            });
                            _this.checkWaiting(waitingState);
                        }).catch(function (reason) {
                            console.log(reason);
                            _this.checkWaiting(waitingState);
                        }); });
                    });
                }
            }
            else {
                if (this.state.trips !== null) {
                    this.setState({
                        trips: null,
                        waiting: false
                    });
                }
            }
        };
        WithRoutingResults.prototype.checkWaiting = function (waitingState) {
            if (!this.state.query.sameApiQueries(waitingState.query)) {
                return;
            }
            waitingState.remaining--;
            if (waitingState.remaining === 0) {
                this.setState({ waiting: false });
            }
        };
        WithRoutingResults.prototype.alreadyAnEquivalent = function (newTrip, trips) {
            var _this = this;
            return !!trips.find(function (trip) { return _this.equivalentTrips(trip, newTrip); });
        };
        WithRoutingResults.prototype.equivalentTrips = function (tripA, tripB) {
            return tripA.depart === tripB.depart &&
                tripA.arrive === tripB.arrive &&
                tripA.weightedScore === tripB.weightedScore &&
                tripA.caloriesCost === tripB.caloriesCost &&
                tripA.carbonCost === tripB.carbonCost &&
                tripA.hassleCost === tripB.hassleCost &&
                tripA.segments.length === tripB.segments.length;
        };
        WithRoutingResults.prototype.onReqRealtimeFor = function (selected) {
            var _this = this;
            if (this.realtimeInterval) {
                clearInterval(this.realtimeInterval);
            }
            if (!selected || !selected.updateURL) { // No realtime data for the trip.
                return;
            }
            this.realtimeInterval = setInterval(function () {
                var updateURL = selected.updateURL;
                TripGoApi.updateRT(selected, _this.state.query)
                    .then(function (tripUpdate) {
                    // updateURL !== selected.updateURL will happen if selected trip group changed selected
                    // alternative, so shouldn't update.
                    if (!tripUpdate || updateURL !== selected.updateURL) {
                        return;
                    }
                    var selectedTGroup = selected;
                    selectedTGroup.replaceAlternative(selectedTGroup.getSelectedTrip(), tripUpdate);
                    _this.setState({});
                });
            }, 10000);
        };
        WithRoutingResults.prototype.onAlternativeChange = function (group, alt) {
            if (group.trips.indexOf(alt) !== -1) {
                group.setSelected(group.trips.indexOf(alt));
                this.setState({});
                return;
            }
        };
        WithRoutingResults.prototype.render = function () {
            var _a = this.props, urlQuery = _a.urlQuery, props = __rest(_a, ["urlQuery"]);
            return React.createElement(Consumer, __assign({}, props, { query: this.state.query, onQueryChange: this.onQueryChange, trips: this.state.trips, waiting: this.state.waiting, onReqRealtimeFor: this.onReqRealtimeFor, onAlternativeChange: this.onAlternativeChange }));
        };
        WithRoutingResults.prototype.componentDidMount = function () {
            var urlQuery = this.props.urlQuery;
            if (urlQuery) {
                this.onQueryChange(urlQuery);
            }
        };
        return WithRoutingResults;
    }(React.Component));
}
export default withRoutingResults;
//# sourceMappingURL=WithRoutingResults.js.map