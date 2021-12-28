import React from 'react';
import {TKUIWithClasses, TKUIWithStyle} from "../jss/StyleHelper";
import {connect, mapperFromFunction} from "../config/TKConfigHelper";
import {TKComponentDefaultConfig} from "../config/TKUIConfig";
import {tKUIFromToDefaultStyle} from "./TKUIFromTo.css";
import Location from "../model/Location";

interface IClientProps extends TKUIWithStyle<IStyle, IProps> {
    from: Location;
    to: Location;
    onClick?: () => void;
}

interface IProps extends IClientProps, TKUIWithClasses<IStyle, IProps> {}

type IStyle = ReturnType<typeof tKUIFromToDefaultStyle>

export type TKUIFromToProps = IProps;
export type TKUIFromToStyle = IStyle;

const config: TKComponentDefaultConfig<IProps, IStyle> = {
    render: props => <TKUIFromTo {...props}/>,
    styles: tKUIFromToDefaultStyle,
    classNamePrefix: "TKUIFromTo"
};

const TKUIFromTo: React.SFC<IProps> = (props: IProps) => {
    const {from, to, onClick, classes} = props;
    return (
        <div className={classes.group} onClick={onClick} style={onClick && {cursor: 'pointer'}}>
            <div className={classes.fromToTrack}>
                <div className={classes.circle}/>
                <div className={classes.line}/>
                <div className={classes.circle}/>
            </div>
            <div className={classes.groupRight}>
                <div className={classes.label} style={{marginTop: 0}}>
                    Pickup
                </div>
                <div className={classes.value} style={{marginTop: 0, marginBottom: 10}}>
                    {from.getDisplayString(true)}
                </div>
                <div className={classes.label}>
                    Drop off
                </div>
                <div className={classes.value}>
                    {to.getDisplayString(true)}
                </div>
            </div>
        </div>
    );
};

export default connect(() => undefined, config,
    mapperFromFunction((clientProps: IClientProps) => clientProps));