import React, { useContext, useEffect, useMemo, useRef, useState } from "react";
import { overrideClass, TKUIWithClasses, TKUIWithStyle } from "../jss/StyleHelper";
import genStyles from "../css/GenStyle.css";
import { black, colorWithOpacity, TKUITheme, white } from "../jss/TKUITheme";
import { connect, mapperFromFunction } from "../config/TKConfigHelper";
import { TKComponentDefaultConfig } from "../config/TKComponentConfig";
import Favourite from "../model/favourite/Favourite";
import TKUICard from "../card/TKUICard";
import HasCard, { HasCardKeys } from "../card/HasCard";
import TKUILocationBox from "../location_box/TKUILocationBox";
import FavouriteLocation from "../model/favourite/FavouriteLocation";
import FavouriteStop from "../model/favourite/FavouriteStop";
import Util from "../util/Util";
import LocationUtil from "../util/LocationUtil";
import TKUIMapView, { TKUIMapViewClass } from "../map/TKUIMapView";
import Location from "../model/Location";
import TKUIButton, { TKUIButtonType } from "../buttons/TKUIButton";
import StopLocation from "../model/StopLocation";
import FavouriteTrip from "../model/favourite/FavouriteTrip";
import LatLng from "../model/LatLng";
import { RoutingResultsContext } from "../trip-planner/RoutingResultsProvider";
import RegionsData from "../data/RegionsData";

const tKUIEditFavouriteViewJss = (theme: TKUITheme) => ({
    main: {
        ...genStyles.flex,
        ...genStyles.column,
        ...genStyles.spaceBetween,
        height: '100%',
        padding: '16px'
    },
    formGroup: {
        ...genStyles.flex,
        ...genStyles.column,
        '& label': {
            ...theme.textWeightSemibold,
            marginBottom: '10px'
        },
        '& input': {
            border: '1px solid ' + black(2, theme.isDark),
            ...genStyles.borderRadius(4),
            ...theme.textSizeBody,
            padding: '10px'
        }
    },
    map: {
        height: '350px',
        marginTop: '16px',
        borderRadius: '4px',
        border: '1px solid ' + black(2, theme.isDark),
        '& input': {
            ...theme.textSizeBody,
            padding: '10px'
        },
        ...genStyles.flex,
        ...genStyles.column
    },
    buttonsPanel: {
        marginTop: 'auto',
        display: 'flex',
        ...genStyles.justifyEnd,
        '&>*:last-child': {
            marginLeft: '20px'
        },
        '&>*:nth-last-child(2)': {
            marginLeft: 'auto'
        }
    },
    loadingPanel: {
        ...genStyles.flex,
        ...genStyles.center,
        ...genStyles.alignCenter,
        height: '100%',
        width: '100%',
        position: 'absolute',
        top: '0',
        background: white(1, theme.isDark)
    }
});

type IStyle = ReturnType<typeof tKUIEditFavouriteViewJss>
interface IClientProps extends TKUIWithStyle<IStyle, IProps>, Pick<HasCard, HasCardKeys.cardPresentation | HasCardKeys.slideUpOptions> {
    value?: Favourite;
    onRequestClose: (update?: Favourite) => void;
    onRemove?: () => void;
}
interface IProps extends IClientProps, TKUIWithClasses<IStyle, IProps> { }

const config: TKComponentDefaultConfig<IProps, IStyle> = {
    render: props => <TKUIEditFavouriteView {...props} />,
    styles: tKUIEditFavouriteViewJss,
    classNamePrefix: "TKUIEditFavouriteView"
};

const TKUIEditFavouriteView: React.FunctionComponent<IProps> = (props: IProps) => {
    const { value, onRequestClose, onRemove, cardPresentation, slideUpOptions, classes, t, theme } = props;
    const isCreate = value === undefined;
    const [update, setUpdate] = useState<Favourite>(isCreate ? Util.iAssign(FavouriteLocation.create(Location.create(new LatLng(), "", "", "")), { name: "" }) : value);
    // Use this to track location input value, which can be null, in which case `Save` button is disabled.
    const [searchValue, setSearchValue] = useState<Location | null>(isCreate ? null : update instanceof FavouriteLocation ? update.location : (update instanceof FavouriteStop) ? update.stop! : null);
    const [highlightValue, setHighlightValue] = useState<Location | null>(null);
    const mapRef = useRef<TKUIMapViewClass>(null);
    const { viewport } = useContext(RoutingResultsContext);
    const closerCity = useMemo(() => {
        const region = viewport && RegionsData.instance.getCloserRegion(viewport.center!);
        return region?.cities.sort((c1, c2) => LocationUtil.distanceInMetres(c1, viewport!.center!) - LocationUtil.distanceInMetres(c2, viewport!.center!))[0];
    }, [viewport?.center?.getKey(), !!RegionsData.instance.getRegionList()]);
    useEffect(() => {
        // OBSERVATION - mapRef.current is null after the first render. No problem in this case since we are waiting for regions
        // which causes mapRef.current to be instantiated.
        RegionsData.instance.requireRegions().then(() => {
            if (isCreate && viewport) {
                const region = RegionsData.instance.getCloserRegion(viewport.center!);
                const closerCity = region?.cities.sort((c1, c2) => LocationUtil.distanceInMetres(c1, viewport.center!) - LocationUtil.distanceInMetres(c2, viewport.center!))[0];
                mapRef.current?.setViewport(closerCity ?? viewport.center!, viewport.zoom!);
            }
        })
    }, []);
    // Favourite location was updated. It's not called when location input is cleared (null location),
    // nor for unresolved dropped pins.    
    function onLocationUpdate(location: Location) {
        // If favourite name matches the default name, update it to the new location name.
        // Otherwise, keep the name as is (e.g. `Home`).
        const hasDefaultName = update.name === (update instanceof FavouriteStop ? (update.stop ? FavouriteStop.create(update.stop).name : "") : FavouriteLocation.create((update as FavouriteLocation).location).name);
        const nameUpdate = (hasDefaultName || update.name === "") ? LocationUtil.getMainText(location, t) : update.name;
        const newUpdate = location instanceof StopLocation ?
            Util.iAssign(new FavouriteStop(), { ...Util.deserialize(Util.serialize(update), Favourite), type: "stop", stop: location, name: nameUpdate, region: location.region, stopCode: location.code }) :
            Util.iAssign(new FavouriteLocation(), { ...Util.deserialize(Util.serialize(update), Favourite), name: nameUpdate, location });
        setUpdate(newUpdate);
    };
    function handleNameChange(e: React.ChangeEvent<HTMLInputElement>): void {
        setUpdate(Util.iAssign(update, { name: e.target.value }));
    };

    let content: React.ReactNode;
    if (update instanceof FavouriteLocation || update instanceof FavouriteStop) {
        const placeholder = t("Name")
        content = (
            <>
                <div className={classes.formGroup}>
                    <label>Name</label>
                    <input type="text" value={update.name} placeholder={placeholder} onChange={handleNameChange} />
                </div>
                <div className={classes.map}>
                    <TKUIMapView
                        to={highlightValue ?? searchValue ?? undefined}
                        hideLocations={true}
                        showCurrLocBtn={false}
                        rightClickMenu={[{
                            label: t("set_location"),
                            effect: "SET_TO"
                        }]}
                        onToChange={(location: Location | null) => {
                            setSearchValue(location);
                            if (location === null || location.isDroppedPin()) {
                                return;
                            }
                            onLocationUpdate(location);
                        }}
                        mapClickBehaviour="SET_TO"
                        ref={mapRef}
                    />
                    <TKUILocationBox
                        value={searchValue}
                        onResultHighlight={(value: Location | null) => {
                            setHighlightValue(value);
                        }}
                        onChange={(value: Location | null) => {
                            setSearchValue(value);
                            if (value) {
                                onLocationUpdate(value);
                                // setSearchValue(Location.create(LatLng.createLatLng(0, 0), "", "", ""));
                                // setTimeout(() => setSearchValue(null), 10);
                            }
                        }}
                        showCurrLoc={false}
                        // Maybe this is not necessary given the logic in TKUILocationBox connector.
                        bounds={RegionsData.instance.getCoverageBounds()}
                        focus={closerCity}
                        placeholder={"Search location or drop pin on map"}
                    />
                </div>
            </>
        );
    } else {
        const placeholder = t("Name")
        content = (
            <>
                <div className={classes.formGroup}>
                    <label>Name</label>
                    <input type="text" value={update.name} placeholder={placeholder} onChange={handleNameChange} />
                </div>
                <div className={classes.map}>
                    <TKUIMapView
                        from={(value as FavouriteTrip).startLocation}
                        to={(value as FavouriteTrip).endLocation}
                        hideLocations={true}
                        showCurrLocBtn={false}
                        readonly={true}
                    />
                </div>
            </>
        );
    }
    return (
        <TKUICard
            title={t("Favourite")}
            presentation={cardPresentation}
            onRequestClose={() => onRequestClose()}
            slideUpOptions={slideUpOptions}
        >
            <div className={classes.main}>
                {content}
                <div className={classes.buttonsPanel}>
                    {onRemove && !isCreate &&
                        <TKUIButton
                            text={t("Delete")} onClick={() => onRemove()} type={TKUIButtonType.SECONDARY}
                            styles={{
                                secondary: overrideClass({
                                    color: theme.colorError,
                                    borderColor: colorWithOpacity(theme.colorError, .12),
                                    '&:hover': {
                                        borderColor: colorWithOpacity(theme.colorError, .5)
                                    }
                                })
                            }}
                        />}
                    <TKUIButton text={t("Cancel")} onClick={() => onRequestClose()} type={TKUIButtonType.SECONDARY} />
                    <TKUIButton text={Util.toFirstUpperCase(t("save"))} onClick={() => onRequestClose(update)} disabled={value instanceof FavouriteTrip ? false : !searchValue} />
                </div>
            </div>
        </TKUICard>
    );
};

export default connect(() => undefined, config,
    mapperFromFunction((clientProps: IClientProps) => clientProps));