import React from "react";
import {ReactComponent as IconPin} from '../images/map/ic-map-pin.svg';
import Location from "../model/Location";
import StopLocation from "../model/StopLocation";
import TransportUtil from "../trip/TransportUtil";
import * as CSS from 'csstype';
import genStyles from "../css/general.module.css";
import {withTheme} from "react-jss";

// export interface IClientProps extends TKUIWithStyle<IStyle, IProps> {
export interface IClientProps {
    location: Location;
    from?: boolean;
    styles: (props: TKUIMapLocationIconProps) => TKUIMapLocationIconStyle;
    selected?: boolean; // TODO: if false it's a circle, if true is a drop. MapLocations changes selected for drop,
                        // and from/to pin uses this always as drop. MapLocations pin will be behind from/to pin (at least until dissapears)
                        // but will be identical. Selected is on MapLocations state, so update should be without delay?
}

export interface IStyle {
    main: CSS.Properties;
    iconPin: CSS.Properties;
    icon: CSS.Properties;
}

// interface IProps extends IClientProps, TKUIWithClasses<IStyle, IProps> {}
interface IProps extends IClientProps {}

export type TKUIMapLocationIconProps = IProps;
export type TKUIMapLocationIconStyle = IStyle;

// const config: TKComponentDefaultConfig<IProps, IStyle> = {
//     render: props => <TKUIMapLocationIcon {...props}/>,
//     styles: tKUIMapLocationIconDefaultStyle,
//     classNamePrefix: "TKUIMapLocationIcon",
// };

class TKUIMapLocationIcon extends React.Component<IProps, {}> {
    public render(): React.ReactNode {
        const styles = this.props.styles(this.props);
        const location = this.props.location;
        let iconSrc: string | undefined;
        if (location instanceof StopLocation) {
            iconSrc = TransportUtil.getTransportIcon(location.modeInfo, false, true);
            const remoteIcon = location.modeInfo.remoteIcon !== undefined;
        }
        const icon = iconSrc && <img src={iconSrc} style={styles.icon}/>;
        return <div style={styles.main}>
            <IconPin style={{...styles.iconPin}} className={genStyles.svgFillCurrColor}/>
            {icon}
        </div>;
    }
}

// export default connect((config: TKUIConfig) => config.TKUIMapLocationIcon, config,
//     mapperFromFunction((clientProps: IClientProps) => clientProps));

export default TKUIMapLocationIcon;