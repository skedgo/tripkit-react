import React, { useContext, useEffect, useState } from 'react';
import TripGoApi from '../api/TripGoApi';
import TKUICard from '../card/TKUICard';
import { connect, mapperFromFunction } from "../config/TKConfigHelper";
import { TKComponentDefaultConfig, TKUIConfig } from '../config/TKUIConfig';
import { overrideClass, TKUIWithClasses, TKUIWithStyle } from '../jss/StyleHelper';
import LocationsResult from '../model/location/LocationsResult';
import NetworkUtil from '../util/NetworkUtil';
import Util from '../util/Util';
import { tKUIMxMCollectNearbyCardDefaultStyle } from './TKUIMxMCollectNearbyCard.css';
import ModeLocation from '../model/location/ModeLocation';
import TKUIModeLocationRow from './TKUIModeLocationRow';
import GeolocationData from '../geocode/GeolocationData';
import { TKUserPosition } from '../util/GeolocationUtil';
import { RoutingResultsContext } from '../trip-planner/RoutingResultsProvider';
import { SegmentMxMCardsProps } from './TKUIMxMView';

type IStyle = ReturnType<typeof tKUIMxMCollectNearbyCardDefaultStyle>

interface IClientProps extends TKUIWithStyle<IStyle, IProps>, Pick<SegmentMxMCardsProps, "segment" | "onRequestClose" | "mapAsync" | "isSelectedCard"> { }

interface IProps extends IClientProps, TKUIWithClasses<IStyle, IProps> { }

export type TKUIMxMCollectNearbyCardProps = IProps;
export type TKUIMxMCollectNearbyCardStyle = IStyle;

const config: TKComponentDefaultConfig<IProps, IStyle> = {
    render: props => <TKUIMxMCollectNearbyCard {...props} />,
    styles: tKUIMxMCollectNearbyCardDefaultStyle,
    classNamePrefix: "TKUIMxMBookingCard"
};

const TKUIMxMCollectNearbyCard: React.FunctionComponent<IProps> = ({ segment, mapAsync, onRequestClose, isSelectedCard: selectedCard, classes, injectedStyles, t }) => {
    const [alternatives, setAlternatives] = useState<ModeLocation[] | undefined>(undefined);
    const [userPosition, setUserPosition] = useState<TKUserPosition | undefined>(undefined);
    useEffect(() => {
        const mode = segment.modeIdentifier ?? segment.modeInfo?.identifier;
        TripGoApi.apiCall(`locations.json?lat=${segment.from.lat}&lng=${segment.from.lng}&radius=500&modes=${mode}&strictModeMatch=false`, NetworkUtil.MethodType.GET)
            .then(groupsJSON => Util.deserialize(groupsJSON.groups[0], LocationsResult))
            .then(locationsResult => {
                setAlternatives(locationsResult.getLocations());
            });
        // Use an observable instead.    
        GeolocationData.instance.requestCurrentLocation(true)
            .then(setUserPosition)
            .catch(() => { });  // Don't throw an exception if access was previously denied by the user.
    }, [segment]);
    useEffect(() => {
        // TODO: See if can avoid the imperative access to the map, and access through props, instead. Maybe keep this as is for now, and then make a unified
        // scheme that also contemplate map locations. Probably should provide a context and access it from here and TKUIMapView.
        mapAsync.then(map => {
            if (selectedCard() && alternatives) {
                map.setModeLocations(alternatives, location => routingContext.onSegmentCollectChange(segment, location))
            } else {
                map.setModeLocations(undefined);
            }
        });
    }, [selectedCard(), alternatives]);
    const routingContext = useContext(RoutingResultsContext);
    return (
        <TKUICard
            title={segment.getAction()}
            styles={{
                main: overrideClass({ height: '100%', position: 'relative' })
            }}
            onRequestClose={onRequestClose}
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