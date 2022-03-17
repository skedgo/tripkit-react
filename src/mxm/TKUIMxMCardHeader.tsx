import * as React from "react";
import {TKUIWithClasses, TKUIWithStyle} from "../jss/StyleHelper";
import {tKUIMxMCardHeaderJss} from "./TKUIMxMCardHeader.css";
import {TKComponentDefaultConfig, TKUIConfig} from "../config/TKUIConfig";
import {connect, mapperFromFunction} from "../config/TKConfigHelper";
import TransportUtil from "../trip/TransportUtil";
import TKUICardHeader, {TKUICardHeaderClientProps} from "../card/TKUICardHeader";
import Segment from "../model/trip/Segment";

type IStyle = ReturnType<typeof tKUIMxMCardHeaderJss>

interface IClientProps extends TKUICardHeaderClientProps, TKUIWithStyle<IStyle, IProps> {
    segment: Segment;
}

interface IProps extends IClientProps, TKUIWithClasses<IStyle, IProps> {}

export type TKUIMxMCardHeaderProps = IProps;
export type TKUIMxMCardHeaderStyle = IStyle;

const config: TKComponentDefaultConfig<IProps, IStyle> = {
    render: props => <TKUIMxMCardHeader {...props}/>,
    styles: tKUIMxMCardHeaderJss,
    classNamePrefix: "TKUIMxMCardHeader"
};

const TKUIMxMCardHeader: React.SFC<IProps> = (props: IProps) => {
    const {segment, title, subtitle, onRequestClose, classes, closeAriaLabel, theme} = props;
    return (
        <div className={classes.main}>
            <img
                src={TransportUtil.getTransIcon(segment.modeInfo!, {
                    isRealtime: segment.realTime === true,
                    onDark: theme.isDark
                })}
                className={classes.transIcon}
                aria-hidden={true}
            />
            <TKUICardHeader
                title={title}
                subtitle={subtitle}
                onRequestClose={onRequestClose}
                closeAriaLabel={closeAriaLabel}
            />
        </div>
    );
};

export default connect((config: TKUIConfig) => config.TKUIMxMCardHeader, config,
    mapperFromFunction((clientProps: IClientProps) => clientProps));