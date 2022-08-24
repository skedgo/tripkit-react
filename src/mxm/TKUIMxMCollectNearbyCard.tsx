import React, { useContext, useEffect, useState } from 'react';
import TripGoApi from '../api/TripGoApi';
import TKUICard from '../card/TKUICard';
import { connect, mapperFromFunction } from "../config/TKConfigHelper";
import { TKComponentDefaultConfig, TKUIConfig } from '../config/TKUIConfig';
import { overrideClass, TKUIWithClasses, TKUIWithStyle } from '../jss/StyleHelper';
import LocationsResult from '../model/location/LocationsResult';
import Segment from '../model/trip/Segment';
import NetworkUtil from '../util/NetworkUtil';
import Util from '../util/Util';
import { tKUIMxMCollectNearbyCardDefaultStyle } from './TKUIMxMCollectNearbyCard.css';
import ModeLocation from '../model/location/ModeLocation';
import TKUIModeLocationRow from './TKUIModeLocationRow';
import GeolocationData from '../geocode/GeolocationData';
import { TKUserPosition } from '../util/GeolocationUtil';
import { RoutingResultsContext } from '../trip-planner/RoutingResultsProvider';

type IStyle = ReturnType<typeof tKUIMxMCollectNearbyCardDefaultStyle>

interface IClientProps extends TKUIWithStyle<IStyle, IProps> {
    segment: Segment;
    onRequestClose: () => void;
}

interface IProps extends IClientProps, TKUIWithClasses<IStyle, IProps> { }

export type TKUIMxMCollectNearbyCardProps = IProps;
export type TKUIMxMCollectNearbyCardStyle = IStyle;

const config: TKComponentDefaultConfig<IProps, IStyle> = {
    render: props => <TKUIMxMCollectNearbyCard {...props} />,
    styles: tKUIMxMCollectNearbyCardDefaultStyle,
    classNamePrefix: "TKUIMxMBookingCard"
};

const TKUIMxMCollectNearbyCard: React.FunctionComponent<IProps> = ({ segment, onRequestClose, classes, injectedStyles, t }) => {
    const [alternatives, setAlternatives] = useState<ModeLocation[] | undefined>(undefined);
    const [userPosition, setUserPosition] = useState<TKUserPosition | undefined>(undefined);
    useEffect(() => {
        const mode = segment.modeIdentifier ?? segment.modeInfo?.identifier;
        TripGoApi.apiCall(`locations.json?lat=${segment.from.lat}&lng=${segment.from.lng}&radius=500&modes=${mode}&strictModeMatch=false`, NetworkUtil.MethodType.GET)
            .then(groupsJSON => Util.deserialize(groupsJSON.groups[0], LocationsResult))
            .then(locationsResult => setAlternatives(locationsResult.getLocations()));
        // Use an observable instead.    
        GeolocationData.instance.requestCurrentLocation(true)
            .then(setUserPosition)
            .catch(() => { });  // Don't throw an exception if access was previously denied by the user.
    }, [segment]);
    const routingContext = useContext(RoutingResultsContext);
    return (
        <TKUICard
            title={segment.getAction()}
            styles={{
                main: overrideClass({ height: '100%', position: 'relative' })
            }}
        >
            {alternatives?.map((alt, i) =>
                <TKUIModeLocationRow
                    location={alt}
                    userPosition={userPosition}
                    selected={alt.id === segment.sharedVehicle?.identifier}
                    key={i}
                    onClick={() => routingContext.onSegmentCollectChange(segment, alt)}
                />)}
        </TKUICard>
    )
}

export default connect((config: TKUIConfig) => config.TKUIMxMCollectNearbyCard, config,
    mapperFromFunction((clientProps: IClientProps) => clientProps));