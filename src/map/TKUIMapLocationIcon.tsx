import React from "react";
import {ReactComponent as IconPin} from '../images/map/ic-map-pin.svg';
import Location from "../model/Location";
import StopLocation from "../model/StopLocation";
import TransportUtil from "../trip/TransportUtil";
import {withTheme} from "react-jss";
import {CSSProps, TKUIWithClasses, TKUIWithStyle} from "../jss/StyleHelper";
import {TKComponentDefaultConfig, TKUIConfig} from "../config/TKUIConfig";
import {tKUIMapLocationIconDefaultStyle} from "./TKUIMapLocationIcon.css";
import {connect, mapperFromFunction} from "../config/TKConfigHelper";

export interface IClientProps extends TKUIWithStyle<IStyle, IProps> {
    location: Location;
    from?: boolean;
    selected?: boolean; // TODO: if false it's a circle, if true is a drop. MapLocations changes selected for drop,
                        // and from/to pin uses this always as drop. MapLocations pin will be behind from/to pin (at least until dissapears)
                        // but will be identical. Selected is on MapLocations state, so update should be without delay?
}

export interface IStyle {
    main: CSSProps<IProps>;
    iconPin: CSSProps<IProps>;
    icon: CSSProps<IProps>;
}

interface IProps extends IClientProps, TKUIWithClasses<IStyle, IProps> {}

export type TKUIMapLocationIconProps = IProps;
export type TKUIMapLocationIconStyle = IStyle;

const config: TKComponentDefaultConfig<IProps, IStyle> = {
    render: props => <TKUIMapLocationIcon {...props}/>,
    styles: tKUIMapLocationIconDefaultStyle,
    classNamePrefix: "TKUIMapLocationIcon",
};

class TKUIMapLocationIcon extends React.Component<IProps, {}> {
    public render(): React.ReactNode {
        const location = this.props.location;
        let iconSrc: string | undefined;
        if (location instanceof StopLocation) {
            iconSrc = TransportUtil.getTransportIcon(location.modeInfo, false, true);
            const remoteIcon = location.modeInfo.remoteIcon !== undefined;
        }
        const classes = this.props.classes;
        const icon = iconSrc && <img src={iconSrc} className={classes.icon}/>;
        return <div className={classes.main}>
            <IconPin className={classes.iconPin}/>
            {icon}
        </div>;
    }
}

export default connect((config: TKUIConfig) => config.TKUIMapLocationIcon, config,
    mapperFromFunction((clientProps: IClientProps) => clientProps));