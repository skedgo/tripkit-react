import * as React from "react";
import Segment from "../model/trip/Segment";
import {CSSProps, TKUIWithStyle, withStyleProp} from "../jss/StyleHelper";
import {ClassNameMap} from "react-jss";
import {tKUIWCSegmentInfoDefaultStyle} from "./TKUIWCSegmentInfo.css";
import TransportUtil from "./TransportUtil";

export interface ITKUIWCSegmentInfoProps extends TKUIWithStyle<ITKUIWCSegmentInfoStyle, ITKUIWCSegmentInfoProps> {
    value: Segment;
}

interface IProps extends ITKUIWCSegmentInfoProps {
    classes: ClassNameMap<keyof ITKUIWCSegmentInfoStyle>
}

export interface ITKUIWCSegmentInfoStyle {
    main: CSSProps<ITKUIWCSegmentInfoProps>;
    references: CSSProps<ITKUIWCSegmentInfoProps>;
    safeRef: CSSProps<ITKUIWCSegmentInfoProps>;
    unsafeRef: CSSProps<ITKUIWCSegmentInfoProps>;
    dismountRef: CSSProps<ITKUIWCSegmentInfoProps>;
    unknownRef: CSSProps<ITKUIWCSegmentInfoProps>;
    bar: CSSProps<ITKUIWCSegmentInfoProps>;
    safeBar: CSSProps<ITKUIWCSegmentInfoProps>;
    unsafeBar: CSSProps<ITKUIWCSegmentInfoProps>;
    dismountBar: CSSProps<ITKUIWCSegmentInfoProps>;
    mtsLabels: CSSProps<ITKUIWCSegmentInfoProps>;
    safeMtsLabel: CSSProps<ITKUIWCSegmentInfoProps>;
    unsafeMtsLabel: CSSProps<ITKUIWCSegmentInfoProps>;
    dismountMtsLabel: CSSProps<ITKUIWCSegmentInfoProps>;
    unknownMtsLabel: CSSProps<ITKUIWCSegmentInfoProps>;
}

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

export const Connect = (RawComponent: React.ComponentType<IProps>) => {
    const RawComponentStyled = withStyleProp(RawComponent, "TKUIWCSegmentInfo");
    return (props: ITKUIWCSegmentInfoProps) => {
        const stylesToPass = props.styles || tKUIWCSegmentInfoDefaultStyle;
        const randomizeClassNamesToPass = props.randomizeClassNames;
        return <RawComponentStyled {...props} styles={stylesToPass} randomizeClassNames={randomizeClassNamesToPass}/>;
    };
};

export default Connect(TKUIWCSegmentInfo);