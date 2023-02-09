import React from 'react';
import { connect, mapperFromFunction } from "../config/TKConfigHelper";
import { TKComponentDefaultConfig, TKUIConfig } from '../config/TKUIConfig';
import { TKUIWithClasses, TKUIWithStyle, overrideClass } from '../jss/StyleHelper';
import { tKUIModeLocationRowDefaultStyle } from './TKUIModeLocationRow.css';
import ModeLocation from '../model/location/ModeLocation';
import TKUIRow from '../options/TKUIRow';
import TransportUtil from '../trip/TransportUtil';
import { TKUserPosition } from '../util/GeolocationUtil';
import LocationUtil from '../util/LocationUtil';
import { ReactComponent as IconCurrLoc } from '../images/location/ic-curr-loc.svg';
import classNames from 'classnames';

type IStyle = ReturnType<typeof tKUIModeLocationRowDefaultStyle>

interface IClientProps extends TKUIWithStyle<IStyle, IProps> {
    location: ModeLocation;
    userPosition?: TKUserPosition;
    selected?: boolean;
    onClick?: () => void;
    showBothIcons?: boolean;
}

interface IProps extends IClientProps, TKUIWithClasses<IStyle, IProps> { }

export type TKUIModeLocationRowProps = IProps;
export type TKUIModeLocationRowStyle = IStyle;

const config: TKComponentDefaultConfig<IProps, IStyle> = {
    render: props => <TKUIModeLocationRow {...props} />,
    styles: tKUIModeLocationRowDefaultStyle,
    classNamePrefix: "TKUIMxMBookingCard"
};

const TKUIModeLocationRow: React.FunctionComponent<IProps> = ({ location, userPosition, selected, onClick, showBothIcons, classes, injectedStyles, t, theme }) => {
    const modeInfo = location.modeInfo;
    const icon = TransportUtil.getTransIcon(modeInfo, { onDark: theme.isDark });
    return (
        <div className={classNames(classes.main, selected && classes.selected)} onClick={onClick}>
            {showBothIcons && modeInfo.remoteIconIsBranding && modeInfo.remoteIcon &&
                <img src={TransportUtil.getTransIcon(modeInfo, { onDark: theme.isDark, useLocal: true })}
                    className={classes.transport} style={{ marginRight: '10px' }} />}
            <img src={icon} className={classes.transport} />
            <TKUIRow
                title={location.name}
                subtitle={location.address}
                styles={{
                    main: overrideClass(injectedStyles.row)
                }}
            />
            {userPosition &&
                <div className={classes.distance}>
                    <IconCurrLoc />
                    {TransportUtil.distanceToBriefString(LocationUtil.distanceInMetres(userPosition.latLng, location))}
                </div>}
        </div>
    )
}


export default connect((config: TKUIConfig) => config.TKUIModeLocationRow, config,
    mapperFromFunction((clientProps: IClientProps) => clientProps));