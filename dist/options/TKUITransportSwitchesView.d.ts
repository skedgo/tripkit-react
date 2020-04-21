/// <reference types="react" />
import { CSSProps, TKUIWithClasses, TKUIWithStyle } from "../jss/StyleHelper";
import TKTransportOptions from "../model/options/TKTransportOptions";
import Region from "../model/region/Region";
export interface IClientProps extends TKUIWithStyle<IStyle, IProps> {
    onMoreOptions?: () => void;
}
interface IConsumedProps {
    region?: Region;
    value: TKTransportOptions;
    onChange: (value: TKTransportOptions) => void;
}
interface IProps extends IClientProps, IConsumedProps, TKUIWithClasses<IStyle, IProps> {
}
interface IStyle {
    main: CSSProps<IProps>;
    modeSelector: CSSProps<IProps>;
    modeIcon: CSSProps<IProps>;
    modeIconDisabled: CSSProps<IProps>;
    tooltip: CSSProps<IProps>;
    tooltipContent: CSSProps<IProps>;
    tooltipDisabled: CSSProps<IProps>;
    tooltipRight: CSSProps<IProps>;
    tooltipTitle: CSSProps<IProps>;
    tooltipStateEnabled: CSSProps<IProps>;
    tooltipStateDisabled: CSSProps<IProps>;
}
export declare type TKUITransportSwitchesViewProps = IProps;
export declare type TKUITransportSwitchesViewStyle = IStyle;
declare const _default: (props: IClientProps) => JSX.Element;
export default _default;
