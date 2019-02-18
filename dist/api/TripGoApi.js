import RoutingResults from "../model/trip/RoutingResults";
import NetworkUtil from "../util/NetworkUtil";
import { JsonConvert } from "json2typescript";
import StopLocation from "../model/StopLocation";
import Environment from "../env/Environment";
var TripGoApi = /** @class */ (function () {
    function TripGoApi() {
    }
    TripGoApi.getServer = function () {
        if (Environment.isStaging()) {
            return this.SATAPP_STAGING;
        }
        if (Environment.isBeta()) {
            return this.SATAPP_BETA;
        }
        return this.SATAPP;
    };
    TripGoApi.apiCall = function (endpoint, method, body) {
        var url = this.getSatappUrl(endpoint);
        return this.apiCallUrl(url, method, body);
    };
    TripGoApi.getSatappUrl = function (endpoint) {
        var server = this.getServer();
        return server + "/" + endpoint;
    };
    TripGoApi.apiCallUrl = function (url, method, body, prod) {
        return fetch(url, {
            method: method,
            headers: {
                'X-TripGo-Version': 'w3.2018.12.20',
                'X-TripGo-Key': this.apiKey,
                'referer': 'https://tripgo.com',
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: body ? JSON.stringify(body) : undefined
        })
            .then(NetworkUtil.jsonCallback);
    };
    TripGoApi.computeTrips = function (query) {
        var _this = this;
        var routingPromises = query.getQueryUrls().then(function (queryUrls) {
            return queryUrls.length === 0 ? [] : queryUrls.map(function (endpoint) {
                return _this.apiCall(endpoint, NetworkUtil.MethodType.GET)
                    .then(function (routingResultsJson) {
                    var jsonConvert = new JsonConvert();
                    var routingResults = jsonConvert.deserialize(routingResultsJson, RoutingResults);
                    routingResults.setQuery(query);
                    routingResults.setSatappQuery(_this.getSatappUrl(endpoint));
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
    TripGoApi.updateRT = function (trip, query) {
        var updateURL = trip.updateURL;
        return TripGoApi.apiCallUrl(updateURL + (updateURL.includes("?") ? "&" : "?")
            + "v=11", NetworkUtil.MethodType.GET)
            .then(function (routingResultsJson) {
            var jsonConvert = new JsonConvert();
            var routingResults = jsonConvert.deserialize(routingResultsJson, RoutingResults);
            routingResults.setQuery(query);
            routingResults.setSatappQuery(trip.satappQuery);
            var tripGroups = routingResults.groups;
            if (tripGroups.length === 0) {
                throw new Error('Empty trip group.');
            }
            return tripGroups[0];
        }).catch(function (reason) {
            // Our api answers 200 with a null json when there is no update, so return undefined;
            if (reason.message.includes("Unexpected end of JSON input")) {
                return undefined;
            }
            console.log(reason);
            throw reason;
        });
    };
    TripGoApi.findStopFromCode = function (regionCode, stopCode) {
        return this.apiCall("stopFinder.json", NetworkUtil.MethodType.POST, { region: regionCode, code: stopCode })
            .then(function (stopJson) {
            var jsonConvert = new JsonConvert();
            return jsonConvert.deserialize(stopJson, StopLocation);
        });
    };
    TripGoApi.getRoutingResultsJSONTest = function () {
        // const jsonS = '{"groups":[{"sources":[{"disclaimer":"OpenStreetMap contributors\\n\\nMap data available under the Open Database License. For more information, see http://www.openstreetmap.org/copyright.","provider":{"name":"OpenStreetMap","website":"https://www.openstreetmap.org"}}],"trips":[{"arrive":1535501699,"availability":"AVAILABLE","caloriesCost":246,"carbonCost":0,"currencySymbol":"$","depart":1535495684,"hassleCost":0,"mainSegmentHashCode":-589341551,"moneyCost":0,"moneyUSDCost":0,"plannedURL":"https://granduni.buzzhives.com/satapp/trip/planned/17e4ec30-4361-4bec-8600-82760ea79142","queryIsLeaveAfter":true,"queryTime":1535495684,"saveURL":"https://granduni.buzzhives.com/satapp/trip/save/17e4ec30-4361-4bec-8600-82760ea79142","segments":[{"availability":"AVAILABLE","endTime":1535501699,"segmentTemplateHashCode":-589341551,"startTime":1535495684}],"temporaryURL":"https://granduni.buzzhives.com/satapp/trip/17e4ec30-4361-4bec-8600-82760ea79142","weightedScore":47}]}],"region":"AU_ACT_Canberra","regions":["AU_ACT_Canberra"],"segmentTemplates":[{"action":"Walk<DURATION>","from":{"class":"Location","lat":-35.28192,"lng":149.1285,"timezone":"Australia/Sydney"},"hashCode":-589341551,"metres":6789,"mini":{"description":"Charlotte Street & Scarborough Street","instruction":"Walk","mainValue":"7.0km"},"modeIdentifier":"wa_wal","modeInfo":{"alt":"Walk","color":{"blue":99,"green":199,"red":30},"identifier":"wa_wal","localIcon":"walk"},"notes":"7.0km","streets":[{"encodedWaypoints":"`_jvEctem[e@uDZQr@k@PKRANB??JDRLNJJUFMHJHHJLFJHLDNFLBH@DBPLTLRPVVVRJXFn@LZ@^D\\\\Dj@D`AHHC@O????FD`@P??^F`AN@?h@Ft@HA@lBV??hBJbFd@bE^n@FnHp@??p@H`@DrPzAt@F~ANlAJ`BNlFf@~BRbQ`BPBN?NBdAJLBhGh@~A^B@nCVdHn@tAL??s@tAARFLJL??lBbBjEtD???AhDzC`CzBLFLBLAJGLS???@pAkCFOz@kBR_@dAz@HJnBbB@?pBfBJHXD??ZFVJlAbAz@p@??v@p@tBhBrD|C`@}@??\\\u@FQ??Pa@ZaAh@b@??z@k@r@e@v@[x@W`ASf@Kf@Mf@Y^W^[d@w@^i@Ne@DY~@J??^BpBdAA?@?fARv@Hl@B`@E\\\\RA?p@Zp@b@f@~@??A?`@f@p@t@??@?d@b@n@d@x@\\\\l@Vp@J\\\\DX?jAP??A?d@c@d@g@r@o@z@m@x@o@DCv@e@|@c@z@_@lAi@z@]fA]xA_@hAYhAMvAQx@M~AShC_@N?l@Md@Ed@Ax@?f@Dj@FvARbEj@??l@mF??rBXZD`@@lCCAaB","metres":6784}],"to":{"address":"Charlotte Street & Scarborough Street","class":"Location","lat":-35.33416,"lng":149.12386,"timezone":"Australia/Sydney"},"travelDirection":180,"turn-by-turn":"WALKING","type":"unscheduled","visibility":"in summary"}]}';
        var jsonS = "{\"groups\":[{\"sources\":[{\"disclaimer\":\"\\u00a9 OpenStreetMap contributors\\n\\nMap data available under the Open Database License. For more information, see http://www.openstreetmap.org/copyright.\",\"provider\":{\"name\":\"OpenStreetMap\",\"website\":\"https://www.openstreetmap.org\"}}],\"trips\":[{\"arrive\":1535501699,\"availability\":\"AVAILABLE\",\"caloriesCost\":246,\"carbonCost\":0,\"currencySymbol\":\"$\",\"depart\":1535495684,\"hassleCost\":0,\"mainSegmentHashCode\":-589341551,\"moneyCost\":0,\"moneyUSDCost\":0,\"plannedURL\":\"https://granduni.buzzhives.com/satapp/trip/planned/17e4ec30-4361-4bec-8600-82760ea79142\",\"queryIsLeaveAfter\":true,\"queryTime\":1535495684,\"saveURL\":\"https://granduni.buzzhives.com/satapp/trip/save/17e4ec30-4361-4bec-8600-82760ea79142\",\"segments\":[{\"availability\":\"AVAILABLE\",\"endTime\":1535501699,\"segmentTemplateHashCode\":-589341551,\"startTime\":1535495684}],\"temporaryURL\":\"https://granduni.buzzhives.com/satapp/trip/17e4ec30-4361-4bec-8600-82760ea79142\",\"weightedScore\":47}]}],\"region\":\"AU_ACT_Canberra\",\"regions\":[\"AU_ACT_Canberra\"],\"segmentTemplates\":[{\"action\":\"Walk<DURATION>\",\"from\":{\"class\":\"Location\",\"lat\":-35.28192,\"lng\":149.1285,\"timezone\":\"Australia/Sydney\"},\"hashCode\":-589341551,\"metres\":6789,\"mini\":{\"description\":\"Charlotte Street & Scarborough Street\",\"instruction\":\"Walk\",\"mainValue\":\"7.0km\"},\"modeIdentifier\":\"wa_wal\",\"modeInfo\":{\"alt\":\"Walk\",\"color\":{\"blue\":99,\"green\":199,\"red\":30},\"identifier\":\"wa_wal\",\"localIcon\":\"walk\"},\"notes\":\"7.0km\",\"streets\":[{\"encodedWaypoints\":\"`_jvEctem[e@uDZQr@k@PKRANB??JDRLNJJUFMHJHHJLFJHLDNFLBH@DBPLTLRPVVVRJXFn@LZ@^D\\\\Dj@D`AHHC@O????FD`@P??^F`AN@?h@Ft@HA@lBV??hBJbFd@bE^n@FnHp@??p@H`@DrPzAt@F~ANlAJ`BNlFf@~BRbQ`BPBN?NBdAJLBhGh@~A^B@nCVdHn@tAL??s@tAARFLJL??lBbBjEtD???AhDzC`CzBLFLBLAJGLS???@pAkCFOz@kBR_@dAz@HJnBbB@?pBfBJHXD??ZFVJlAbAz@p@??v@p@tBhBrD|C`@}@??\\\\u@FQ??Pa@ZaAh@b@??z@k@r@e@v@[x@W`ASf@Kf@Mf@Y^W^[d@w@^i@Ne@DY~@J??^BpBdAA?@?fARv@Hl@B`@E\\\\RA?p@Zp@b@f@~@??A?`@f@p@t@??@?d@b@n@d@x@\\\\l@Vp@J\\\\DX?jAP??A?d@c@d@g@r@o@z@m@x@o@DCv@e@|@c@z@_@lAi@z@]fA]xA_@hAYhAMvAQx@M~AShC_@N?l@Md@Ed@Ax@?f@Dj@FvARbEj@??l@mF??rBXZD`@@lCCAaB\",\"metres\":6784}],\"to\":{\"address\":\"Charlotte Street & Scarborough Street\",\"class\":\"Location\",\"lat\":-35.33416,\"lng\":149.12386,\"timezone\":\"Australia/Sydney\"},\"travelDirection\":180,\"turn-by-turn\":\"WALKING\",\"type\":\"unscheduled\",\"visibility\":\"in summary\"}]}";
        return JSON.parse(jsonS);
    };
    TripGoApi.SATAPP = "https://api.tripgo.com/v1";
    TripGoApi.SATAPP_STAGING = "https://api.tripgo.com/v1";
    TripGoApi.SATAPP_BETA = "https://bigbang.skedgo.com/satapp-beta";
    TripGoApi.isBetaServer = false;
    TripGoApi.apiKey = "";
    return TripGoApi;
}());
export default TripGoApi;
//# sourceMappingURL=TripGoApi.js.map