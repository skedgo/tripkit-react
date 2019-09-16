import React from "react";
import TripGoApi from "./TripGoApi";
import TripGroup from "../model/trip/TripGroup";
import Trip from "../model/trip/Trip";
import {IRoutingResultsContext as RResultsConsumerProps} from "../trip-planner/RoutingResultsProvider";
import RoutingQuery from "../model/RoutingQuery";
import {Subtract} from "utility-types";
import RegionsData from "../data/RegionsData";
import OptionsView from "../options/OptionsView";
import NetworkUtil from "../util/NetworkUtil";
import Environment from "../env/Environment";
import RoutingResults from "../model/trip/RoutingResults";
import {JsonConvert} from "json2typescript";
import Options from "../model/Options";
import Location from "../model/Location";
import Region from "../model/region/Region";
import LatLng from "../model/LatLng";

interface IWithRoutingResultsProps {
    urlQuery?: RoutingQuery;
    options: Options;
    computeModeSets?: (query: RoutingQuery, options: Options) => string[][];
}

interface IWithRoutingResultsState {
    query: RoutingQuery;
    preFrom?: Location;
    preTo?: Location;
    viewport?: {center?: LatLng, zoom?: number};
    region?: Region; // Once region gets instantiated (with a valid region), never becomes undefined.
    trips?: Trip[];
    selected?: Trip;
    waiting: boolean;
}

// function withRoutingResults<P extends RResultsConsumerProps>(Consumer: React.ComponentType<P>) {
function withRoutingResults<P extends RResultsConsumerProps>(Consumer: any) {

    return class WithRoutingResults extends React.Component<Subtract<P, RResultsConsumerProps> & IWithRoutingResultsProps, IWithRoutingResultsState> {

        public realtimeInterval: any;

        constructor(props: Subtract<P, RResultsConsumerProps> & IWithRoutingResultsProps) {
            super(props);
            this.state = {
                query: RoutingQuery.create(),
                waiting: false
            };
            this.onQueryChange = this.onQueryChange.bind(this);
            this.onChange = this.onChange.bind(this);
            this.onViewportChange = this.onViewportChange.bind(this);
            this.onReqRealtimeFor = this.onReqRealtimeFor.bind(this);
            this.onAlternativeChange = this.onAlternativeChange.bind(this);
        }

        public onQueryChange(query: RoutingQuery) {
            const prevQuery = this.state.query;
            this.setState({ query: query }, () => {
                this.refreshRegion();
                // TODO: Next logic currently does not depend on this.state.region, although it should (in computeModeSets).
                // In that execute next code after refreshRegion took effect on state.
                if (query.isComplete(true)) {
                    if (!this.sameApiQueries(prevQuery, this.props.options, query, this.props.options)) { // Avoid requesting routing again if query url didn't change, e.g. dropped location resolved.
                        this.refreshTrips();
                    }
                } else {
                    if (this.state.trips !== null) {
                        this.setState({
                            trips: undefined,
                            waiting: false
                        });
                    }
                }
            });
        }

        public onChange(select?: Trip): void {
            this.setState({
                selected: select
            });
        }

        public onViewportChange(viewport: {center?: LatLng, zoom?: number}) {
            this.setState({viewport: viewport},
                () => this.refreshRegion());
        }

        public refreshRegion() {
            const query = this.state.query;
            const viewport = this.state.viewport;
            const referenceLatLng = query.from && query.from.isResolved() ? query.from :
                (query.to && query.to.isResolved() ? query.to : (viewport && viewport.center));
            if (referenceLatLng) {
                RegionsData.instance.getCloserRegionP(referenceLatLng).then((region: Region) => {
                    if (region.polygon === "") {
                        console.log("empty region");
                    }
                    this.setState({region: region});
                });
            }
        }

        public refreshTrips() {
            const query = this.state.query;
            const options = this.props.options;
            this.setState({
                trips: [],
                waiting: true
            });
            this.computeTrips(query).then((tripPromises: Array<Promise<Trip[]>>) => {
                if (tripPromises.length === 0) {
                    this.setState({waiting: false});
                    return;
                }
                const waitingState = {
                    query: query,
                    options: options,
                    remaining: tripPromises.length
                };
                tripPromises.map((tripsP: Promise<Trip[]>) => tripsP.then((trips: Trip[]) => {
                    if (!this.sameApiQueries(this.state.query, this.props.options, query, options)) {
                        return;
                    }
                    if (trips !== null && this.state.trips !== null) {
                        trips = trips.filter((trip: Trip) => !this.alreadyAnEquivalent(trip, this.state.trips!))
                    }
                    if (tripPromises.length === 1 && trips.length > 0 && trips[0].isBicycleTrip()) {
                        trips = (trips[0] as TripGroup).trips;
                    }
                    this.setState(prevState => {
                        return {trips: prevState.trips!.concat(trips)}
                    });
                    this.checkWaiting(waitingState)
                }).catch((reason: any) => {
                    console.log(reason);
                    this.checkWaiting(waitingState)
                }))
            });
        }

        public checkWaiting(waitingState: any) {
            if (!this.sameApiQueries(this.state.query, this.props.options, waitingState.query, waitingState.options)) {
                return;
            }
            waitingState.remaining--;
            if (waitingState.remaining === 0) {
                this.setState({waiting: false});
            }
        }

        public alreadyAnEquivalent(newTrip: Trip, trips:Trip[]): boolean {
            return !!trips.find((trip: Trip) => this.equivalentTrips(trip, newTrip));
        }

        public equivalentTrips(tripA: Trip, tripB: Trip): boolean {
            return tripA.depart === tripB.depart &&
                tripA.arrive === tripB.arrive &&
                tripA.weightedScore === tripB.weightedScore &&
                tripA.caloriesCost === tripB.caloriesCost &&
                tripA.carbonCost === tripB.carbonCost &&
                tripA.hassleCost === tripB.hassleCost &&
                tripA.segments.length === tripB.segments.length;
        }

        public onReqRealtimeFor(selected?: Trip) {
            if (this.realtimeInterval) {
                clearInterval(this.realtimeInterval);
            }
            if (!selected || !selected.updateURL) {  // No realtime data for the trip.
                return;
            }
            this.realtimeInterval = setInterval(() => {
                const updateURL = selected.updateURL;
                TripGoApi.updateRT(selected, this.state.query)
                    .then((tripUpdate: Trip | undefined) => {
                        // updateURL !== selected.updateURL will happen if selected trip group changed selected
                        // alternative, so shouldn't update.
                        if (!tripUpdate || updateURL !== selected.updateURL) {
                            return;
                        }
                        const selectedTGroup = selected as TripGroup;
                        selectedTGroup.replaceAlternative(selectedTGroup.getSelectedTrip(), tripUpdate);
                        this.setState({});
                    });
            }, 10000);
        }

        public onAlternativeChange(group: TripGroup, alt: Trip) {
            if (group.trips.indexOf(alt) !== -1) {
                group.setSelected(group.trips.indexOf(alt));
                this.setState({});
                return;
            }
        }

        public render(): React.ReactNode {
            const { urlQuery, ...props } = this.props as IWithRoutingResultsProps;
            return <Consumer
                            {...props}
                             query={this.state.query}
                             onQueryChange={this.onQueryChange}
                             preFrom={this.state.preFrom}
                             preTo={this.state.preTo}
                             onPreChange={(from: boolean, location?: Location) => {
                                 if (from) {
                                     this.setState({preFrom: location})
                                 } else {
                                     this.setState({preTo: location})
                                 }
                             }}
                             region={this.state.region}
                             onViewportChange={this.onViewportChange}
                             trips={this.state.trips}
                             waiting={this.state.waiting}
                             selected={this.state.selected}
                             onChange={this.onChange}
                             onReqRealtimeFor={this.onReqRealtimeFor}
                             onAlternativeChange={this.onAlternativeChange}
            />;
        }


        public componentDidMount(): void {
            const urlQuery: RoutingQuery | undefined = this.props.urlQuery;
            if (urlQuery) {
                this.onQueryChange(urlQuery);
            }
        }

        public componentDidUpdate(prevProps: Readonly<Subtract<P, RResultsConsumerProps> & IWithRoutingResultsProps>,
                                  prevState: Readonly<IWithRoutingResultsState>): void {
            if (this.props.options !== prevProps.options &&
                !this.sameApiQueries(this.state.query, prevProps.options, this.state.query, this.props.options)) {
                this.refreshTrips();
            }
            // Clear selected
            if (prevState.trips !== this.state.trips) {
                if (!this.state.trips || this.state.trips.length === 0) {
                    this.onChange(undefined);
                }
            }
        }

        public sameApiQueries(q1: RoutingQuery, opts1: Options, q2: RoutingQuery, opts2: Options): boolean {
            let modeSetsQ1;
            let modeSetsQ2;
            if (RegionsData.instance.hasRegions()) {
                const computeModeSetsFc = this.props.computeModeSets ? this.props.computeModeSets! : this.computeModeSets;
                modeSetsQ1 = computeModeSetsFc(q1, opts1);
                modeSetsQ2 = computeModeSetsFc(q2, opts2);
            } else {
                modeSetsQ1 = [[]]; // Put empty set to put something if called with no region,
                modeSetsQ2 = [[]]; // which happens when checking if same query on TripPlanner.componentDidMount
            }
            const q1Urls = modeSetsQ1.map((modeSet: string[]) => {
                return q1.getQueryUrl(modeSet, opts1);
            });
            const q2Urls = modeSetsQ2.map((modeSet: string[]) => {
                return q2.getQueryUrl(modeSet, opts2);
            });
            return JSON.stringify(q1Urls) === JSON.stringify(q2Urls);
        }

        public getQueryUrlsWaitRegions(query: RoutingQuery): Promise<string[]> {
            return RegionsData.instance.requireRegions().then(() => {
                const computeModeSetsFc = this.props.computeModeSets ? this.props.computeModeSets! : this.computeModeSets;
                return computeModeSetsFc(query, this.props.options).map((modeSet: string[]) => {
                    return query.getQueryUrl(modeSet, this.props.options);
                });
            });
        }

        public computeModeSets(query: RoutingQuery, options: Options): string[][] {
            const referenceLatLng = query.from && query.from.isResolved() ? query.from : (query.to && query.to.isResolved() ? query.to : undefined);
            if (!referenceLatLng) {
                return [];
            }
            const region = RegionsData.instance.getRegion(referenceLatLng);
            if (!region) {
                return [];
            }
            const modes = region ? region.modes : [];
            const enabledModes = modes.filter((mode: string) =>
                (options.isModeEnabled(mode)
                    || (mode === "wa_wal" && options.wheelchair)) &&  // send wa_wal as mode when wheelchair is true.
                !OptionsView.skipMode(mode) &&
                !(mode === "pt_pub" && !options.isModeEnabled("pt_pub_bus")
                    && !options.isModeEnabled("pt_pub_tram"))
            );
            const modeSets = enabledModes.map((mode: string) => [mode]);
            const multiModalSet: string[] = enabledModes.slice();
            if (multiModalSet.length !== 1) {
                modeSets.push(multiModalSet);
            }
            return modeSets;
        }

        public computeTrips(query: RoutingQuery): Promise<Array<Promise<Trip[]>>> {
            const routingPromises: Promise<Array<Promise<Trip[]>>> = this.getQueryUrlsWaitRegions(query).then((queryUrls: string[]) => {
                return queryUrls.length === 0 ? [] : queryUrls.map((endpoint: string) => {
                    return TripGoApi.apiCall(endpoint, NetworkUtil.MethodType.GET)
                        .then((routingResultsJson: any) => {
                            const jsonConvert = new JsonConvert();
                            const routingResults: RoutingResults = jsonConvert.deserialize(routingResultsJson, RoutingResults);
                            routingResults.setQuery(query);
                            routingResults.setSatappQuery(TripGoApi.getSatappUrl(endpoint));
                            return routingResults.groups;
                        })
                        .catch(reason => {
                            if (Environment.isDevAnd(false)) {
                                const jsonConvert = new JsonConvert();
                                const routingResults: RoutingResults = jsonConvert.deserialize(this.getRoutingResultsJSONTest(), RoutingResults);
                                return routingResults.groups;
                            }
                            throw reason;
                        });
                });
            });
            return routingPromises;
        }

        public getRoutingResultsJSONTest(): any {
            // const jsonS = '{"groups":[{"sources":[{"disclaimer":"OpenStreetMap contributors\\n\\nMap data available under the Open Database License. For more information, see http://www.openstreetmap.org/copyright.","provider":{"name":"OpenStreetMap","website":"https://www.openstreetmap.org"}}],"trips":[{"arrive":1535501699,"availability":"AVAILABLE","caloriesCost":246,"carbonCost":0,"currencySymbol":"$","depart":1535495684,"hassleCost":0,"mainSegmentHashCode":-589341551,"moneyCost":0,"moneyUSDCost":0,"plannedURL":"https://granduni.buzzhives.com/satapp/trip/planned/17e4ec30-4361-4bec-8600-82760ea79142","queryIsLeaveAfter":true,"queryTime":1535495684,"saveURL":"https://granduni.buzzhives.com/satapp/trip/save/17e4ec30-4361-4bec-8600-82760ea79142","segments":[{"availability":"AVAILABLE","endTime":1535501699,"segmentTemplateHashCode":-589341551,"startTime":1535495684}],"temporaryURL":"https://granduni.buzzhives.com/satapp/trip/17e4ec30-4361-4bec-8600-82760ea79142","weightedScore":47}]}],"region":"AU_ACT_Canberra","regions":["AU_ACT_Canberra"],"segmentTemplates":[{"action":"Walk<DURATION>","from":{"class":"Location","lat":-35.28192,"lng":149.1285,"timezone":"Australia/Sydney"},"hashCode":-589341551,"metres":6789,"mini":{"description":"Charlotte Street & Scarborough Street","instruction":"Walk","mainValue":"7.0km"},"modeIdentifier":"wa_wal","modeInfo":{"alt":"Walk","color":{"blue":99,"green":199,"red":30},"identifier":"wa_wal","localIcon":"walk"},"notes":"7.0km","streets":[{"encodedWaypoints":"`_jvEctem[e@uDZQr@k@PKRANB??JDRLNJJUFMHJHHJLFJHLDNFLBH@DBPLTLRPVVVRJXFn@LZ@^D\\\\Dj@D`AHHC@O????FD`@P??^F`AN@?h@Ft@HA@lBV??hBJbFd@bE^n@FnHp@??p@H`@DrPzAt@F~ANlAJ`BNlFf@~BRbQ`BPBN?NBdAJLBhGh@~A^B@nCVdHn@tAL??s@tAARFLJL??lBbBjEtD???AhDzC`CzBLFLBLAJGLS???@pAkCFOz@kBR_@dAz@HJnBbB@?pBfBJHXD??ZFVJlAbAz@p@??v@p@tBhBrD|C`@}@??\\\u@FQ??Pa@ZaAh@b@??z@k@r@e@v@[x@W`ASf@Kf@Mf@Y^W^[d@w@^i@Ne@DY~@J??^BpBdAA?@?fARv@Hl@B`@E\\\\RA?p@Zp@b@f@~@??A?`@f@p@t@??@?d@b@n@d@x@\\\\l@Vp@J\\\\DX?jAP??A?d@c@d@g@r@o@z@m@x@o@DCv@e@|@c@z@_@lAi@z@]fA]xA_@hAYhAMvAQx@M~AShC_@N?l@Md@Ed@Ax@?f@Dj@FvARbEj@??l@mF??rBXZD`@@lCCAaB","metres":6784}],"to":{"address":"Charlotte Street & Scarborough Street","class":"Location","lat":-35.33416,"lng":149.12386,"timezone":"Australia/Sydney"},"travelDirection":180,"turn-by-turn":"WALKING","type":"unscheduled","visibility":"in summary"}]}';
            const jsonS = "{\"groups\":[{\"sources\":[{\"disclaimer\":\"\\u00a9 OpenStreetMap contributors\\n\\nMap data available under the Open Database License. For more information, see http://www.openstreetmap.org/copyright.\",\"provider\":{\"name\":\"OpenStreetMap\",\"website\":\"https://www.openstreetmap.org\"}}],\"trips\":[{\"arrive\":1535501699,\"availability\":\"AVAILABLE\",\"caloriesCost\":246,\"carbonCost\":0,\"currencySymbol\":\"$\",\"depart\":1535495684,\"hassleCost\":0,\"mainSegmentHashCode\":-589341551,\"moneyCost\":0,\"moneyUSDCost\":0,\"plannedURL\":\"https://granduni.buzzhives.com/satapp/trip/planned/17e4ec30-4361-4bec-8600-82760ea79142\",\"queryIsLeaveAfter\":true,\"queryTime\":1535495684,\"saveURL\":\"https://granduni.buzzhives.com/satapp/trip/save/17e4ec30-4361-4bec-8600-82760ea79142\",\"segments\":[{\"availability\":\"AVAILABLE\",\"endTime\":1535501699,\"segmentTemplateHashCode\":-589341551,\"startTime\":1535495684}],\"temporaryURL\":\"https://granduni.buzzhives.com/satapp/trip/17e4ec30-4361-4bec-8600-82760ea79142\",\"weightedScore\":47}]}],\"region\":\"AU_ACT_Canberra\",\"regions\":[\"AU_ACT_Canberra\"],\"segmentTemplates\":[{\"action\":\"Walk<DURATION>\",\"from\":{\"class\":\"Location\",\"lat\":-35.28192,\"lng\":149.1285,\"timezone\":\"Australia/Sydney\"},\"hashCode\":-589341551,\"metres\":6789,\"mini\":{\"description\":\"Charlotte Street & Scarborough Street\",\"instruction\":\"Walk\",\"mainValue\":\"7.0km\"},\"modeIdentifier\":\"wa_wal\",\"modeInfo\":{\"alt\":\"Walk\",\"color\":{\"blue\":99,\"green\":199,\"red\":30},\"identifier\":\"wa_wal\",\"localIcon\":\"walk\"},\"notes\":\"7.0km\",\"streets\":[{\"encodedWaypoints\":\"`_jvEctem[e@uDZQr@k@PKRANB??JDRLNJJUFMHJHHJLFJHLDNFLBH@DBPLTLRPVVVRJXFn@LZ@^D\\\\Dj@D`AHHC@O????FD`@P??^F`AN@?h@Ft@HA@lBV??hBJbFd@bE^n@FnHp@??p@H`@DrPzAt@F~ANlAJ`BNlFf@~BRbQ`BPBN?NBdAJLBhGh@~A^B@nCVdHn@tAL??s@tAARFLJL??lBbBjEtD???AhDzC`CzBLFLBLAJGLS???@pAkCFOz@kBR_@dAz@HJnBbB@?pBfBJHXD??ZFVJlAbAz@p@??v@p@tBhBrD|C`@}@??\\\\u@FQ??Pa@ZaAh@b@??z@k@r@e@v@[x@W`ASf@Kf@Mf@Y^W^[d@w@^i@Ne@DY~@J??^BpBdAA?@?fARv@Hl@B`@E\\\\RA?p@Zp@b@f@~@??A?`@f@p@t@??@?d@b@n@d@x@\\\\l@Vp@J\\\\DX?jAP??A?d@c@d@g@r@o@z@m@x@o@DCv@e@|@c@z@_@lAi@z@]fA]xA_@hAYhAMvAQx@M~AShC_@N?l@Md@Ed@Ax@?f@Dj@FvARbEj@??l@mF??rBXZD`@@lCCAaB\",\"metres\":6784}],\"to\":{\"address\":\"Charlotte Street & Scarborough Street\",\"class\":\"Location\",\"lat\":-35.33416,\"lng\":149.12386,\"timezone\":\"Australia/Sydney\"},\"travelDirection\":180,\"turn-by-turn\":\"WALKING\",\"type\":\"unscheduled\",\"visibility\":\"in summary\"}]}";
            return JSON.parse(jsonS);
        }
    }
}

export default withRoutingResults;