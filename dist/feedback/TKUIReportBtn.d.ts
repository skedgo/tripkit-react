/// <reference types="react" />
import { TKState } from "../config/TKStateConsumer";
import { CSSProps, TKUIWithClasses, TKUIWithStyle } from "../jss/StyleHelper";
interface IClientProps extends TKUIWithStyle<IStyle, IProps> {
    className?: string;
    tooltipClassName?: string;
    renderIcon?: () => JSX.Element;
    onClick?: (state: TKState) => void;
}
export interface IStyle {
    main: CSSProps<IProps>;
    actionMenu: CSSProps<IProps>;
    actionItem: CSSProps<IProps>;
    actionIcon: CSSProps<IProps>;
}
interface IConsumedProps {
    tKState: TKState;
}
interface IProps extends IConsumedProps, IClientProps, TKUIWithClasses<IStyle, IProps> {
}
export declare type TKUIReportBtnProps = IProps;
export declare type TKUIReportBtnStyle = IStyle;
export declare function feedbackTextFromState(state: TKState): string;
declare const _default: (props: IClientProps) => JSX.Element;
export default _default;
