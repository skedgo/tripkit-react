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
import TKUIMxMCardHeader from './TKUIMxMCardHeader';
import FacilityLocation from '../model/location/FacilityLocation';
import ModeInfo from '../model/trip/ModeInfo';
import TransportUtil from '../trip/TransportUtil';
import classNames from 'classnames';
import LocationUtil from '../util/LocationUtil';
import BikePodLocation from '../model/location/BikePodLocation';

type IStyle = ReturnType<typeof tKUIMxMCollectNearbyCardDefaultStyle>

interface IClientProps extends TKUIWithStyle<IStyle, IProps>, Pick<SegmentMxMCardsProps, "segment" | "onRequestClose" | "mapAsync" | "isSelectedCard"> {
    onAlternativeCollected?: () => void;
}

interface IProps extends IClientProps, TKUIWithClasses<IStyle, IProps> { }

export type TKUIMxMCollectNearbyCardProps = IProps;
export type TKUIMxMCollectNearbyCardStyle = IStyle;

const config: TKComponentDefaultConfig<IProps, IStyle> = {
    render: props => <TKUIMxMCollectNearbyCard {...props} />,
    styles: tKUIMxMCollectNearbyCardDefaultStyle,
    classNamePrefix: "TKUIMxMBookingCard"
};

const TKUIMxMCollectNearbyCard: React.FunctionComponent<IProps> = ({ segment, mapAsync, onRequestClose, isSelectedCard, onAlternativeCollected, theme, classes }) => {
    const [alternatives, setAlternatives] = useState<ModeLocation[] | undefined>(undefined);
    const [userPosition, setUserPosition] = useState<TKUserPosition | undefined>(undefined);
    const [disabledModes, setDisabledModes] = useState<string[]>([]);
    useEffect(() => {
        let mode: string | undefined;
        if (segment.modeInfo?.identifier === "stationary_parking-onstreet") {
            mode = "me_car"
        } else {
            mode = segment.modeIdentifier ?? undefined;  // segment.modeInfo?.identifier === "stationary_vehicle-collect";
        }
        if (!mode) {
            return;
        }
        TripGoApi.apiCall(`locations.json?lat=${segment.from.lat}&lng=${segment.from.lng}&radius=1000&modes=${mode}&strictModeMatch=false`, NetworkUtil.MethodType.GET)
            .then(groupsJSON => Util.deserialize(groupsJSON.groups[0], LocationsResult))
            .then(locationsResult => {
                const locations = locationsResult.getLocations()
                    .filter(location => !(location instanceof FacilityLocation) &&
                        !(location instanceof BikePodLocation && location.bikePod?.inService === false));
                setAlternatives(locations);
            });
        // Use an observable instead.    
        GeolocationData.instance.requestCurrentLocation(true)
            .then(setUserPosition)
            .catch(() => { });  // Don't throw an exception if access was previously denied by the user.
    }, [segment]);
    useEffect(() => {
        // TODO: See if can avoid the imperative access to the map, and access through props, instead. Maybe keep this as is for now, and then make a unified
        // scheme that also contemplate map locations. Probably should provide a context and access it from here and TKUIMapView.
        mapAsync?.then(map => {
            if (isSelectedCard!() && alternatives) {
                // Display alternatives on map except for the selected one, since it's already signaled with the segment pin. 
                map.setModeLocations(alternatives.filter(alt => alt.id !== segment.sharedVehicle?.identifier)
                    .filter(alt => !disabledModes.includes(getModeType(alt.modeInfo))),
                    location => routingContext.onSegmentCollectChange(segment, location)
                        .then(tripUpdate => tripUpdate && onAlternativeCollected?.()));
            } else {
                map.setModeLocations(undefined);
            }
        });
    }, [isSelectedCard!(), alternatives, disabledModes]);
    useEffect(() => {
        // Clear map also on unmount (close card or trip update after picking an alternative)
        return () => {
            mapAsync?.then(map => {
                map.setModeLocations(undefined);
            });
        }
    }, []);
    const routingContext = useContext(RoutingResultsContext);
    const getModeType = (mode: ModeInfo) => mode.remoteIcon ?? mode.localIcon;
    const modeInfos = alternatives?.reduce((modeInfos, alt) => {
        if (!modeInfos.some(modeInfo => getModeType(modeInfo) === getModeType(alt.modeInfo))) {
            modeInfos.push(alt.modeInfo);
        }
        return modeInfos;
    }, [] as ModeInfo[]);
    const filter = modeInfos && modeInfos.length > 0 &&
        <div className={classes.filter}>
            {modeInfos.map((modeInfo, i) => {
                const modeType = getModeType(modeInfo);
                const disabled = disabledModes.includes(modeType);
                return (
                    <div
                        className={classNames(classes.toggle, disabled && classes.disabled)}
                        onClick={() => {
                            const disabledModesUpdate = disabledModes.slice();
                            if (disabled) {
                                disabledModesUpdate.splice(disabledModesUpdate.indexOf(modeType), 1);
                            } else {
                                disabledModesUpdate.push(modeType);
                            }
                            setDisabledModes(disabledModesUpdate);
                        }}
                        key={i}
                    >
                        {modeInfo.remoteIconIsBranding && modeInfo.remoteIcon &&
                            <img src={TransportUtil.getTransIcon(modeInfo, { onDark: theme.isDark, useLocal: true })}
                                className={classes.icon} />}
                        <img src={TransportUtil.getTransIcon(modeInfo, { onDark: theme.isDark })}
                            className={classes.icon} />
                    </div>
                );
            })}
        </div>
    const sortedAlternatives = alternatives?.slice();
    sortedAlternatives?.sort((alt1, alt2) => LocationUtil.distanceInMetres(alt1, segment.location) - LocationUtil.distanceInMetres(alt2, segment.location));
    return (
        <TKUICard
            title={segment.getAction()}
            styles={{
                main: overrideClass({ height: '100%', position: 'relative' })
            }}
            onRequestClose={onRequestClose}
            renderHeader={props => <TKUIMxMCardHeader segment={segment} {...props} />}
            renderSubHeader={filter ? () => filter : undefined}
        >
            {sortedAlternatives?.filter(alt => !disabledModes.includes(getModeType(alt.modeInfo)))
                .map((alt, i) =>
                    <TKUIModeLocationRow
                        location={alt}
                        userPosition={userPosition}
                        selected={alt.id === segment.sharedVehicle?.identifier || alt instanceof BikePodLocation && LocationUtil.distanceInMetres(alt, segment.location) < 10}
                        key={i}
                        onClick={() => routingContext.onSegmentCollectChange(segment, alt)
                            .then(tripUpdate => tripUpdate && onAlternativeCollected?.())}
                    />)}
        </TKUICard>
    )
}

export default connect((config: TKUIConfig) => config.TKUIMxMCollectNearbyCard, config,
    mapperFromFunction((clientProps: IClientProps) => clientProps));