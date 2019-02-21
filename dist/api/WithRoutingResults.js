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
import RegionsData from "../data/RegionsData";
import OptionsView from "../options/OptionsView";
import NetworkUtil from "../util/NetworkUtil";
import Environment from "../env/Environment";
import RoutingResults from "../model/trip/RoutingResults";
import { JsonConvert } from "json2typescript";
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
                if (!this.sameApiQueries(prevQuery, query)) { // Avoid requesting routing again if query url didn't change, e.g. dropped location resolved.
                    this.setState({
                        trips: [],
                        waiting: true
                    });
                    this.computeTrips(query).then(function (tripPromises) {
                        if (tripPromises.length === 0) {
                            _this.setState({ waiting: false });
                            return;
                        }
                        var waitingState = {
                            query: query,
                            remaining: tripPromises.length
                        };
                        tripPromises.map(function (tripsP) { return tripsP.then(function (trips) {
                            if (!_this.sameApiQueries(_this.state.query, query)) {
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
            if (!this.sameApiQueries(this.state.query, waitingState.query)) {
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
        WithRoutingResults.prototype.sameApiQueries = function (q1, q2) {
            var modeSetsQ1;
            var modeSetsQ2;
            if (RegionsData.instance.hasRegions()) {
                var computeModeSetsFc = this.props.computeModeSets ? this.props.computeModeSets : this.computeModeSets;
                modeSetsQ1 = computeModeSetsFc(q1);
                modeSetsQ2 = computeModeSetsFc(q2);
            }
            else {
                modeSetsQ1 = [[]]; // Put empty set to put something if called with no region,
                modeSetsQ2 = [[]]; // which happens when checking if same query on TripPlanner.componentDidMount
            }
            var q1Urls = modeSetsQ1.map(function (modeSet) {
                return q1.getQueryUrl(modeSet);
            });
            var q2Urls = modeSetsQ2.map(function (modeSet) {
                return q2.getQueryUrl(modeSet);
            });
            return JSON.stringify(q1Urls) === JSON.stringify(q2Urls);
        };
        WithRoutingResults.prototype.getQueryUrlsWaitRegions = function (query) {
            var _this = this;
            return RegionsData.instance.requireRegions().then(function () {
                var computeModeSetsFc = _this.props.computeModeSets ? _this.props.computeModeSets : _this.computeModeSets;
                return computeModeSetsFc(query).map(function (modeSet) {
                    return query.getQueryUrl(modeSet);
                });
            });
        };
        WithRoutingResults.prototype.computeModeSets = function (query) {
            var referenceLatLng = query.from && query.from.isResolved() ? query.from : (query.to && query.to.isResolved() ? query.to : undefined);
            if (!referenceLatLng) {
                return [];
            }
            var region = RegionsData.instance.getRegion(referenceLatLng);
            if (!region) {
                return [];
            }
            var modes = region ? region.modes : [];
            var enabledModes = modes.filter(function (mode) {
                return (query.options.isModeEnabled(mode)
                    || (mode === "wa_wal" && query.options.wheelchair)) && // send wa_wal as mode when wheelchair is true.
                    !OptionsView.skipMode(mode) &&
                    !(mode === "pt_pub" && !query.options.isModeEnabled("pt_pub_bus")
                        && !query.options.isModeEnabled("pt_pub_tram"));
            });
            var modeSets = enabledModes.map(function (mode) { return [mode]; });
            var multiModalSet = enabledModes.slice();
            if (multiModalSet.length !== 1) {
                modeSets.push(multiModalSet);
            }
            return modeSets;
        };
        WithRoutingResults.prototype.computeTrips = function (query) {
            var _this = this;
            var routingPromises = this.getQueryUrlsWaitRegions(query).then(function (queryUrls) {
                return queryUrls.length === 0 ? [] : queryUrls.map(function (endpoint) {
                    return TripGoApi.apiCall(endpoint, NetworkUtil.MethodType.GET)
                        .then(function (routingResultsJson) {
                        var jsonConvert = new JsonConvert();
                        var routingResults = jsonConvert.deserialize(routingResultsJson, RoutingResults);
                        routingResults.setQuery(query);
                        routingResults.setSatappQuery(TripGoApi.getSatappUrl(endpoint));
                        return routingResults.groups;
                    })
                        .catch(function (reason) {
                        if (Environment.isDevAnd(false)) {
                            var jsonConvert = new JsonConvert();
                            var routingResults = jsonConvert.deserialize(_this.getRoutingResultsJSONTest(), RoutingResults);
                            return routingResults.groups;
                        }
                        throw reason;
                    });
                });
            });
            return routingPromises;
        };
        WithRoutingResults.prototype.getRoutingResultsJSONTest = function () {
            // const jsonS = '{"groups":[{"sources":[{"disclaimer":"OpenStreetMap contributors\\n\\nMap data available under the Open Database License. For more information, see http://www.openstreetmap.org/copyright.","provider":{"name":"OpenStreetMap","website":"https://www.openstreetmap.org"}}],"trips":[{"arrive":1535501699,"availability":"AVAILABLE","caloriesCost":246,"carbonCost":0,"currencySymbol":"$","depart":1535495684,"hassleCost":0,"mainSegmentHashCode":-589341551,"moneyCost":0,"moneyUSDCost":0,"plannedURL":"https://granduni.buzzhives.com/satapp/trip/planned/17e4ec30-4361-4bec-8600-82760ea79142","queryIsLeaveAfter":true,"queryTime":1535495684,"saveURL":"https://granduni.buzzhives.com/satapp/trip/save/17e4ec30-4361-4bec-8600-82760ea79142","segments":[{"availability":"AVAILABLE","endTime":1535501699,"segmentTemplateHashCode":-589341551,"startTime":1535495684}],"temporaryURL":"https://granduni.buzzhives.com/satapp/trip/17e4ec30-4361-4bec-8600-82760ea79142","weightedScore":47}]}],"region":"AU_ACT_Canberra","regions":["AU_ACT_Canberra"],"segmentTemplates":[{"action":"Walk<DURATION>","from":{"class":"Location","lat":-35.28192,"lng":149.1285,"timezone":"Australia/Sydney"},"hashCode":-589341551,"metres":6789,"mini":{"description":"Charlotte Street & Scarborough Street","instruction":"Walk","mainValue":"7.0km"},"modeIdentifier":"wa_wal","modeInfo":{"alt":"Walk","color":{"blue":99,"green":199,"red":30},"identifier":"wa_wal","localIcon":"walk"},"notes":"7.0km","streets":[{"encodedWaypoints":"`_jvEctem[e@uDZQr@k@PKRANB??JDRLNJJUFMHJHHJLFJHLDNFLBH@DBPLTLRPVVVRJXFn@LZ@^D\\\\Dj@D`AHHC@O????FD`@P??^F`AN@?h@Ft@HA@lBV??hBJbFd@bE^n@FnHp@??p@H`@DrPzAt@F~ANlAJ`BNlFf@~BRbQ`BPBN?NBdAJLBhGh@~A^B@nCVdHn@tAL??s@tAARFLJL??lBbBjEtD???AhDzC`CzBLFLBLAJGLS???@pAkCFOz@kBR_@dAz@HJnBbB@?pBfBJHXD??ZFVJlAbAz@p@??v@p@tBhBrD|C`@}@??\\\u@FQ??Pa@ZaAh@b@??z@k@r@e@v@[x@W`ASf@Kf@Mf@Y^W^[d@w@^i@Ne@DY~@J??^BpBdAA?@?fARv@Hl@B`@E\\\\RA?p@Zp@b@f@~@??A?`@f@p@t@??@?d@b@n@d@x@\\\\l@Vp@J\\\\DX?jAP??A?d@c@d@g@r@o@z@m@x@o@DCv@e@|@c@z@_@lAi@z@]fA]xA_@hAYhAMvAQx@M~AShC_@N?l@Md@Ed@Ax@?f@Dj@FvARbEj@??l@mF??rBXZD`@@lCCAaB","metres":6784}],"to":{"address":"Charlotte Street & Scarborough Street","class":"Location","lat":-35.33416,"lng":149.12386,"timezone":"Australia/Sydney"},"travelDirection":180,"turn-by-turn":"WALKING","type":"unscheduled","visibility":"in summary"}]}';
            var jsonS = "{\"groups\":[{\"sources\":[{\"disclaimer\":\"\\u00a9 OpenStreetMap contributors\\n\\nMap data available under the Open Database License. For more information, see http://www.openstreetmap.org/copyright.\",\"provider\":{\"name\":\"OpenStreetMap\",\"website\":\"https://www.openstreetmap.org\"}}],\"trips\":[{\"arrive\":1535501699,\"availability\":\"AVAILABLE\",\"caloriesCost\":246,\"carbonCost\":0,\"currencySymbol\":\"$\",\"depart\":1535495684,\"hassleCost\":0,\"mainSegmentHashCode\":-589341551,\"moneyCost\":0,\"moneyUSDCost\":0,\"plannedURL\":\"https://granduni.buzzhives.com/satapp/trip/planned/17e4ec30-4361-4bec-8600-82760ea79142\",\"queryIsLeaveAfter\":true,\"queryTime\":1535495684,\"saveURL\":\"https://granduni.buzzhives.com/satapp/trip/save/17e4ec30-4361-4bec-8600-82760ea79142\",\"segments\":[{\"availability\":\"AVAILABLE\",\"endTime\":1535501699,\"segmentTemplateHashCode\":-589341551,\"startTime\":1535495684}],\"temporaryURL\":\"https://granduni.buzzhives.com/satapp/trip/17e4ec30-4361-4bec-8600-82760ea79142\",\"weightedScore\":47}]}],\"region\":\"AU_ACT_Canberra\",\"regions\":[\"AU_ACT_Canberra\"],\"segmentTemplates\":[{\"action\":\"Walk<DURATION>\",\"from\":{\"class\":\"Location\",\"lat\":-35.28192,\"lng\":149.1285,\"timezone\":\"Australia/Sydney\"},\"hashCode\":-589341551,\"metres\":6789,\"mini\":{\"description\":\"Charlotte Street & Scarborough Street\",\"instruction\":\"Walk\",\"mainValue\":\"7.0km\"},\"modeIdentifier\":\"wa_wal\",\"modeInfo\":{\"alt\":\"Walk\",\"color\":{\"blue\":99,\"green\":199,\"red\":30},\"identifier\":\"wa_wal\",\"localIcon\":\"walk\"},\"notes\":\"7.0km\",\"streets\":[{\"encodedWaypoints\":\"`_jvEctem[e@uDZQr@k@PKRANB??JDRLNJJUFMHJHHJLFJHLDNFLBH@DBPLTLRPVVVRJXFn@LZ@^D\\\\Dj@D`AHHC@O????FD`@P??^F`AN@?h@Ft@HA@lBV??hBJbFd@bE^n@FnHp@??p@H`@DrPzAt@F~ANlAJ`BNlFf@~BRbQ`BPBN?NBdAJLBhGh@~A^B@nCVdHn@tAL??s@tAARFLJL??lBbBjEtD???AhDzC`CzBLFLBLAJGLS???@pAkCFOz@kBR_@dAz@HJnBbB@?pBfBJHXD??ZFVJlAbAz@p@??v@p@tBhBrD|C`@}@??\\\\u@FQ??Pa@ZaAh@b@??z@k@r@e@v@[x@W`ASf@Kf@Mf@Y^W^[d@w@^i@Ne@DY~@J??^BpBdAA?@?fARv@Hl@B`@E\\\\RA?p@Zp@b@f@~@??A?`@f@p@t@??@?d@b@n@d@x@\\\\l@Vp@J\\\\DX?jAP??A?d@c@d@g@r@o@z@m@x@o@DCv@e@|@c@z@_@lAi@z@]fA]xA_@hAYhAMvAQx@M~AShC_@N?l@Md@Ed@Ax@?f@Dj@FvARbEj@??l@mF??rBXZD`@@lCCAaB\",\"metres\":6784}],\"to\":{\"address\":\"Charlotte Street & Scarborough Street\",\"class\":\"Location\",\"lat\":-35.33416,\"lng\":149.12386,\"timezone\":\"Australia/Sydney\"},\"travelDirection\":180,\"turn-by-turn\":\"WALKING\",\"type\":\"unscheduled\",\"visibility\":\"in summary\"}]}";
            return JSON.parse(jsonS);
        };
        return WithRoutingResults;
    }(React.Component));
}
export default withRoutingResults;
//# sourceMappingURL=WithRoutingResults.js.map