import React from 'react';
import { connect, mapperFromFunction } from "../config/TKConfigHelper";
import { TKComponentDefaultConfig, TKUIConfig } from '../config/TKUIConfig';
import { TKUIWithClasses, TKUIWithStyle } from '../jss/StyleHelper';
import { tKUIModeLocationRowDefaultStyle } from './TKUIModeLocationRow.css';
import ModeLocation from '../model/location/ModeLocation';
import TKUIRow from '../options/TKUIRow';

type IStyle = ReturnType<typeof tKUIModeLocationRowDefaultStyle>

interface IClientProps extends TKUIWithStyle<IStyle, IProps> {
    location: ModeLocation;    
}

interface IProps extends IClientProps, TKUIWithClasses<IStyle, IProps> { }

export type TKUIModeLocationRowProps = IProps;
export type TKUIModeLocationRowStyle = IStyle;

const config: TKComponentDefaultConfig<IProps, IStyle> = {
    render: props => <TKUIModeLocationRow {...props} />,
    styles: tKUIModeLocationRowDefaultStyle,
    classNamePrefix: "TKUIMxMBookingCard"
};

const TKUIModeLocationRow: React.FunctionComponent<IProps> = ({ location, classes, injectedStyles, t }) => {    
    return (
        <TKUIRow
            title={location.name}
            subtitle={location.address}
        />
    )
}


export default connect((config: TKUIConfig) => config.TKUIModeLocationRow, config,
    mapperFromFunction((clientProps: IClientProps) => clientProps));