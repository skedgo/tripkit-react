import RoutingQuery from "../model/RoutingQuery";
import RoutingResults from "../model/trip/RoutingResults";
import NetworkUtil from "../util/NetworkUtil";
import {JsonConvert} from "json2typescript";
import Trip from "../model/trip/Trip";
import StopLocation from "../model/StopLocation";
import Environment from "../env/Environment";

class TripGoApi {

    public static SATAPP = "https://api.tripgo.com/v1";
    public static SATAPP_STAGING = "https://api.tripgo.com/v1";
    public static SATAPP_BETA = "https://bigbang.skedgo.com/satapp-beta";

    public static isBetaServer = false;
    public static apiKey = "";

    public static getServer(): string {
        if (Environment.isStaging()) {
            return this.SATAPP_STAGING;
        }
        if (Environment.isBeta()) {
            return this.SATAPP_BETA
        }
        return this.SATAPP;
    }

    public static apiCall(endpoint: string, method: string, body?: any): Promise<any> {
        const url = this.getSatappUrl(endpoint);
        return this.apiCallUrl(url, method, body);
    }

    private static getSatappUrl(endpoint: string): string {
        const server = this.getServer();
        return server + "/" + endpoint;
    }

    public static apiCallUrl(url: string, method: string, body?: any, prod?: boolean): Promise<any> {
        return fetch(url, {
            method: method,
            headers: {
                'X-TripGo-Version': 'w3.2015.09.03',
                'X-TripGo-Key': this.apiKey,
                'referer': 'https://tripgo.com',
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: body ? JSON.stringify(body) : undefined
        })
            .then(NetworkUtil.jsonCallback);
    }

    public static computeTrips(query: RoutingQuery): Promise<Array<Promise<Trip[]>>> {
        const routingPromises: Promise<Array<Promise<Trip[]>>> = query.getQueryUrls().then((queryUrls: string[]) => {
            return queryUrls.length === 0 ? [] : queryUrls.map((endpoint: string) => {
                return this.apiCall(endpoint, NetworkUtil.MethodType.GET)
                    .then((routingResultsJson: any) => {
                        const jsonConvert = new JsonConvert();
                        const routingResults: RoutingResults = jsonConvert.deserialize(routingResultsJson, RoutingResults);
                        routingResults.setQuery(query);
                        routingResults.setSatappQuery(this.getSatappUrl(endpoint));
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

    public static updateRT(trip: Trip, query: RoutingQuery): Promise<Trip | undefined> {
        const updateURL = trip.updateURL;
        return TripGoApi.apiCallUrl(updateURL + (updateURL.includes("?") ? "&" : "?")
            + "v=11", NetworkUtil.MethodType.GET)
            .then((routingResultsJson: any) => {
                const jsonConvert = new JsonConvert();
                const routingResults: RoutingResults = jsonConvert.deserialize(routingResultsJson, RoutingResults);
                routingResults.setQuery(query);
                routingResults.setSatappQuery(trip.satappQuery);
                const tripGroups = routingResults.groups;
                if (tripGroups.length === 0) {
                    throw new Error('Empty trip group.');
                }
                return tripGroups[0];
            }).catch((reason: Error) => {
                // Our api answers 200 with a null json when there is no update, so return undefined;
                if (reason.message.includes("Unexpected end of JSON input")) {
                    return undefined;
                }
                console.log(reason);
                throw reason;
            })
    }

    public static findStopFromCode(regionCode: string, stopCode: string): Promise<StopLocation> {
        return this.apiCall("stopFinder.json", NetworkUtil.MethodType.POST,
            {region: regionCode, code: stopCode})
            .then((stopJson: any) => {
                const jsonConvert = new JsonConvert();
                return jsonConvert.deserialize(stopJson, StopLocation);
            });
    }

    private static getRoutingResultsJSONTest(): any {
        // const jsonS = '{"groups":[{"sources":[{"disclaimer":"OpenStreetMap contributors\\n\\nMap data available under the Open Database License. For more information, see http://www.openstreetmap.org/copyright.","provider":{"name":"OpenStreetMap","website":"https://www.openstreetmap.org"}}],"trips":[{"arrive":1535501699,"availability":"AVAILABLE","caloriesCost":246,"carbonCost":0,"currencySymbol":"$","depart":1535495684,"hassleCost":0,"mainSegmentHashCode":-589341551,"moneyCost":0,"moneyUSDCost":0,"plannedURL":"https://granduni.buzzhives.com/satapp/trip/planned/17e4ec30-4361-4bec-8600-82760ea79142","queryIsLeaveAfter":true,"queryTime":1535495684,"saveURL":"https://granduni.buzzhives.com/satapp/trip/save/17e4ec30-4361-4bec-8600-82760ea79142","segments":[{"availability":"AVAILABLE","endTime":1535501699,"segmentTemplateHashCode":-589341551,"startTime":1535495684}],"temporaryURL":"https://granduni.buzzhives.com/satapp/trip/17e4ec30-4361-4bec-8600-82760ea79142","weightedScore":47}]}],"region":"AU_ACT_Canberra","regions":["AU_ACT_Canberra"],"segmentTemplates":[{"action":"Walk<DURATION>","from":{"class":"Location","lat":-35.28192,"lng":149.1285,"timezone":"Australia/Sydney"},"hashCode":-589341551,"metres":6789,"mini":{"description":"Charlotte Street & Scarborough Street","instruction":"Walk","mainValue":"7.0km"},"modeIdentifier":"wa_wal","modeInfo":{"alt":"Walk","color":{"blue":99,"green":199,"red":30},"identifier":"wa_wal","localIcon":"walk"},"notes":"7.0km","streets":[{"encodedWaypoints":"`_jvEctem[e@uDZQr@k@PKRANB??JDRLNJJUFMHJHHJLFJHLDNFLBH@DBPLTLRPVVVRJXFn@LZ@^D\\\\Dj@D`AHHC@O????FD`@P??^F`AN@?h@Ft@HA@lBV??hBJbFd@bE^n@FnHp@??p@H`@DrPzAt@F~ANlAJ`BNlFf@~BRbQ`BPBN?NBdAJLBhGh@~A^B@nCVdHn@tAL??s@tAARFLJL??lBbBjEtD???AhDzC`CzBLFLBLAJGLS???@pAkCFOz@kBR_@dAz@HJnBbB@?pBfBJHXD??ZFVJlAbAz@p@??v@p@tBhBrD|C`@}@??\\\u@FQ??Pa@ZaAh@b@??z@k@r@e@v@[x@W`ASf@Kf@Mf@Y^W^[d@w@^i@Ne@DY~@J??^BpBdAA?@?fARv@Hl@B`@E\\\\RA?p@Zp@b@f@~@??A?`@f@p@t@??@?d@b@n@d@x@\\\\l@Vp@J\\\\DX?jAP??A?d@c@d@g@r@o@z@m@x@o@DCv@e@|@c@z@_@lAi@z@]fA]xA_@hAYhAMvAQx@M~AShC_@N?l@Md@Ed@Ax@?f@Dj@FvARbEj@??l@mF??rBXZD`@@lCCAaB","metres":6784}],"to":{"address":"Charlotte Street & Scarborough Street","class":"Location","lat":-35.33416,"lng":149.12386,"timezone":"Australia/Sydney"},"travelDirection":180,"turn-by-turn":"WALKING","type":"unscheduled","visibility":"in summary"}]}';
        const jsonS = "{\"groups\":[{\"sources\":[{\"disclaimer\":\"\\u00a9 OpenStreetMap contributors\\n\\nMap data available under the Open Database License. For more information, see http://www.openstreetmap.org/copyright.\",\"provider\":{\"name\":\"OpenStreetMap\",\"website\":\"https://www.openstreetmap.org\"}}],\"trips\":[{\"arrive\":1535501699,\"availability\":\"AVAILABLE\",\"caloriesCost\":246,\"carbonCost\":0,\"currencySymbol\":\"$\",\"depart\":1535495684,\"hassleCost\":0,\"mainSegmentHashCode\":-589341551,\"moneyCost\":0,\"moneyUSDCost\":0,\"plannedURL\":\"https://granduni.buzzhives.com/satapp/trip/planned/17e4ec30-4361-4bec-8600-82760ea79142\",\"queryIsLeaveAfter\":true,\"queryTime\":1535495684,\"saveURL\":\"https://granduni.buzzhives.com/satapp/trip/save/17e4ec30-4361-4bec-8600-82760ea79142\",\"segments\":[{\"availability\":\"AVAILABLE\",\"endTime\":1535501699,\"segmentTemplateHashCode\":-589341551,\"startTime\":1535495684}],\"temporaryURL\":\"https://granduni.buzzhives.com/satapp/trip/17e4ec30-4361-4bec-8600-82760ea79142\",\"weightedScore\":47}]}],\"region\":\"AU_ACT_Canberra\",\"regions\":[\"AU_ACT_Canberra\"],\"segmentTemplates\":[{\"action\":\"Walk<DURATION>\",\"from\":{\"class\":\"Location\",\"lat\":-35.28192,\"lng\":149.1285,\"timezone\":\"Australia/Sydney\"},\"hashCode\":-589341551,\"metres\":6789,\"mini\":{\"description\":\"Charlotte Street & Scarborough Street\",\"instruction\":\"Walk\",\"mainValue\":\"7.0km\"},\"modeIdentifier\":\"wa_wal\",\"modeInfo\":{\"alt\":\"Walk\",\"color\":{\"blue\":99,\"green\":199,\"red\":30},\"identifier\":\"wa_wal\",\"localIcon\":\"walk\"},\"notes\":\"7.0km\",\"streets\":[{\"encodedWaypoints\":\"`_jvEctem[e@uDZQr@k@PKRANB??JDRLNJJUFMHJHHJLFJHLDNFLBH@DBPLTLRPVVVRJXFn@LZ@^D\\\\Dj@D`AHHC@O????FD`@P??^F`AN@?h@Ft@HA@lBV??hBJbFd@bE^n@FnHp@??p@H`@DrPzAt@F~ANlAJ`BNlFf@~BRbQ`BPBN?NBdAJLBhGh@~A^B@nCVdHn@tAL??s@tAARFLJL??lBbBjEtD???AhDzC`CzBLFLBLAJGLS???@pAkCFOz@kBR_@dAz@HJnBbB@?pBfBJHXD??ZFVJlAbAz@p@??v@p@tBhBrD|C`@}@??\\\\u@FQ??Pa@ZaAh@b@??z@k@r@e@v@[x@W`ASf@Kf@Mf@Y^W^[d@w@^i@Ne@DY~@J??^BpBdAA?@?fARv@Hl@B`@E\\\\RA?p@Zp@b@f@~@??A?`@f@p@t@??@?d@b@n@d@x@\\\\l@Vp@J\\\\DX?jAP??A?d@c@d@g@r@o@z@m@x@o@DCv@e@|@c@z@_@lAi@z@]fA]xA_@hAYhAMvAQx@M~AShC_@N?l@Md@Ed@Ax@?f@Dj@FvARbEj@??l@mF??rBXZD`@@lCCAaB\",\"metres\":6784}],\"to\":{\"address\":\"Charlotte Street & Scarborough Street\",\"class\":\"Location\",\"lat\":-35.33416,\"lng\":149.12386,\"timezone\":\"Australia/Sydney\"},\"travelDirection\":180,\"turn-by-turn\":\"WALKING\",\"type\":\"unscheduled\",\"visibility\":\"in summary\"}]}";
        return JSON.parse(jsonS);
    }

}

export default TripGoApi;