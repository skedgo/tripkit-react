/// <reference types="react" />
import { CSSProps, TKUIWithClasses, TKUIWithStyle } from "../jss/StyleHelper";
export declare enum TKRequestStatus {
    wait = 0,
    success = 1,
    error = 2
}
export interface IClientProps extends TKUIWithStyle<IStyle, IProps> {
    status?: TKRequestStatus;
    message?: string;
}
export interface IStyle {
    main: CSSProps<IProps>;
    waitingBanner: CSSProps<IProps>;
    waitingMessage: CSSProps<IProps>;
    iconLoading: CSSProps<IProps>;
    iconTick: CSSProps<IProps>;
    iconCross: CSSProps<IProps>;
}
interface IProps extends IClientProps, TKUIWithClasses<IStyle, IProps> {
}
export declare type TKUIWaitingRequestProps = IProps;
export declare type TKUIWaitingRequestStyle = IStyle;
declare const _default: (props: IClientProps) => JSX.Element;
export default _default;
