/// <reference types="react" />
import { CSSProps, TKUIWithClasses, TKUIWithStyle } from "../jss/StyleHelper";
import ModeIdentifier from "../model/region/ModeIdentifier";
import TKUserProfile from "../model/options/TKUserProfile";
import RegionInfo from "../model/region/RegionInfo";
export interface IClientProps extends TKUIWithStyle<IStyle, IProps> {
    mode: ModeIdentifier;
    value: TKUserProfile;
    onChange: (value: TKUserProfile) => void;
}
interface IConsumedProps {
    regionInfo?: RegionInfo;
}
interface IProps extends IClientProps, IConsumedProps, TKUIWithClasses<IStyle, IProps> {
}
interface IStyle {
    main: CSSProps<IProps>;
    iconExpand: CSSProps<IProps>;
    transIcon: CSSProps<IProps>;
    expansionPanel: CSSProps<IProps>;
    expansionPanelDetails: CSSProps<IProps>;
    section: CSSProps<IProps>;
    sectionTitle: CSSProps<IProps>;
    sectionBody: CSSProps<IProps>;
    checkboxRow: CSSProps<IProps>;
    sliderRow: CSSProps<IProps>;
    sliderHeader: CSSProps<IProps>;
    prefModeTitle: CSSProps<IProps>;
    walkSpeedSelect: CSSProps<IProps>;
}
export declare type TKUITransportOptionsRowProps = IProps;
export declare type TKUITransportOptionsRowStyle = IStyle;
declare const _default: (props: IClientProps) => JSX.Element;
export default _default;
