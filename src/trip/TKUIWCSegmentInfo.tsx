import * as React from "react";
import Segment from "../model/trip/Segment";
import {CSSProps, TKUIWithClasses, TKUIWithStyle} from "../jss/StyleHelper";
import {tKUIWCSegmentInfoDefaultStyle} from "./TKUIWCSegmentInfo.css";
import TransportUtil from "./TransportUtil";
import {TKComponentDefaultConfig, TKUIConfig} from "../config/TKUIConfig";
import {connect, mapperFromFunction} from "../config/TKConfigHelper";

interface IClientProps extends TKUIWithStyle<IStyle, IProps> {
    value: Segment;
}

interface IProps extends IClientProps, TKUIWithClasses<IStyle, IProps> {}

export interface IStyle {
    main: CSSProps<IProps>;
    references: CSSProps<IProps>;
    safeRef: CSSProps<IProps>;
    unsafeRef: CSSProps<IProps>;
    dismountRef: CSSProps<IProps>;
    unknownRef: CSSProps<IProps>;
    bar: CSSProps<IProps>;
    safeBar: CSSProps<IProps>;
    unsafeBar: CSSProps<IProps>;
    dismountBar: CSSProps<IProps>;
    mtsLabels: CSSProps<IProps>;
    safeMtsLabel: CSSProps<IProps>;
    unsafeMtsLabel: CSSProps<IProps>;
    dismountMtsLabel: CSSProps<IProps>;
    unknownMtsLabel: CSSProps<IProps>;
}

export type TKUIWCSegmentInfoProps = IProps;
export type TKUIWCSegmentInfoStyle = IStyle;

const config: TKComponentDefaultConfig<IProps, IStyle> = {
    render: props => <TKUIWCSegmentInfo {...props}/>,
    styles: tKUIWCSegmentInfoDefaultStyle,
    classNamePrefix: "TKUIWCSegmentInfo",
};

class TKUIWCSegmentInfo extends React.Component<IProps, {}> {

    public render(): React.ReactNode {
        const segment = this.props.value;
        const metres = segment.metres;
        const metresSafe = segment.metresSafe;
        const metresUnsafe = segment.metresUnsafe;
        const metresDismount = segment.metresDismount ? segment.metresDismount : 0;
        if (metres === undefined || metresSafe === undefined || metresUnsafe === undefined) {
            return null;
        }
        const metresUnknown = metres - metresSafe - metresUnsafe;
        const safePct = ((metresSafe / metres) * 100);
        const unsafePct = ((metresUnsafe / metres) * 100);
        const dismountPct = ((metresDismount / metres) * 100);
        const unknownPct = ((metresUnknown / metres) * 100);
        const classes = this.props.classes;
        return (
            <div className={classes.main}>
                <div className={classes.references}>
                    {safePct > 0 &&
                    <div>
                        <div className={classes.safeRef}/>
                        Friendly
                    </div>}
                    {unsafePct > 0 &&
                    <div>
                        <div className={classes.unsafeRef}/>
                        Unfriendly
                    </div>}
                    {dismountPct > 0 &&
                    <div>
                        <div className={classes.dismountRef}/>
                        Dismount
                    </div>}
                    {unknownPct> 0 &&
                    <div>
                        <div className={classes.unknownRef}/>
                        Unknown
                    </div>}
                </div>
                <div className={classes.bar}>
                    <div className={classes.safeBar} style={{width: safePct + "%"}}/>
                    <div className={classes.unsafeBar} style={{width: unsafePct + "%"}}/>
                    <div className={classes.dismountBar} style={{width: dismountPct + "%"}}/>
                </div>
                <div className={classes.mtsLabels}>
                    {safePct > 0 &&
                    <div className={classes.safeMtsLabel} style={{minWidth: safePct * .85 + "%"}}>
                        {TransportUtil.distanceToBriefString(metresSafe)}
                    </div>}
                    {unsafePct > 0 &&
                    <div className={classes.unsafeMtsLabel} style={{minWidth: unsafePct * .85 + "%"}}>
                        {TransportUtil.distanceToBriefString(metresUnsafe)}
                    </div>}
                    {dismountPct > 0 &&
                    <div className={classes.dismountMtsLabel} style={{minWidth: dismountPct * .85 + "%"}}>
                        {TransportUtil.distanceToBriefString(metresDismount)}
                    </div>}
                    {unknownPct > 0 &&
                    <div className={classes.unknownMtsLabel} style={{minWidth: unknownPct * .85 + "%"}}>
                        {TransportUtil.distanceToBriefString(metresUnknown)}
                    </div>}
                </div>
            </div>
        );
    }

}

export default connect(
    (config: TKUIConfig) => config.TKUIWCSegmentInfo, config,
    mapperFromFunction((clientProps: IClientProps) => clientProps));