import * as React from "react";
import { CSSProps, TKUIWithClasses, TKUIWithStyle } from "../jss/StyleHelper";
export interface IClientProps extends TKUIWithStyle<IStyle, IProps> {
    placement?: string;
    overlay?: React.ReactNode;
    overlayContent?: React.ReactNode;
    mouseEnterDelay?: number;
    trigger?: string[];
    arrowContent?: React.ReactNode;
    className?: string;
    arrowColor?: string;
    children?: any;
    visible?: boolean;
    onVisibleChange?: (visible?: boolean) => void;
    reference?: (ref: TKUITooltip) => void;
    onRequestClose?: () => void;
}
export interface IStyle {
    main: CSSProps<IProps>;
    overlayContent: CSSProps<IProps>;
    btnClear: CSSProps<IProps>;
    iconClear: CSSProps<IProps>;
}
interface IProps extends IClientProps, TKUIWithClasses<IStyle, IProps> {
}
export declare type TKUITooltipProps = IProps;
export declare type TKUITooltipStyle = IStyle;
interface IState {
    temporaryVisible: boolean;
}
declare class TKUITooltip extends React.Component<IProps, IState> {
    constructor(props: IProps);
    private isVisible;
    private visibleForTimeout;
    setVisibleFor(duration?: number): void;
    render(): React.ReactNode;
}
declare const _default: (props: IClientProps) => JSX.Element;
export default _default;
