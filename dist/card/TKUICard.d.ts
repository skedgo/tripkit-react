import { UIEventHandler } from "react";
import { CSSProperties } from 'react-jss';
import * as CSS from 'csstype';
import { CSSProps, TKUIWithClasses, TKUIWithStyle } from "../jss/StyleHelper";
import { TKUISlideUpOptions } from "./TKUISlideUp";
export declare enum CardPresentation {
    MODAL = 0,
    SLIDE_UP = 1,
    SLIDE_UP_STYLE = 2,
    NONE = 3
}
interface IClientProps extends TKUIWithStyle<IStyle, IProps> {
    title?: string;
    subtitle?: string;
    renderSubHeader?: () => JSX.Element;
    onRequestClose?: () => void;
    presentation?: CardPresentation;
    slideUpOptions?: TKUISlideUpOptions;
    open?: boolean;
    children?: any;
    bodyStyle?: CSS.Properties;
    bodyClassName?: string;
    touchEventsOnChildren?: boolean;
    handleRef?: (ref: any) => void;
    scrollRef?: (instance: HTMLDivElement | null) => void;
    onScroll?: UIEventHandler<HTMLDivElement>;
}
interface IStyle {
    modalContainer: CSS.Properties & CSSProperties<IProps>;
    main: CSS.Properties & CSSProperties<IProps>;
    innerMain: CSSProps<IProps>;
    header: CSS.Properties & CSSProperties<IProps>;
    subHeader: CSS.Properties & CSSProperties<IProps>;
    body: CSS.Properties & CSSProperties<IProps>;
    headerLeft: CSS.Properties & CSSProperties<IProps>;
    title: CSS.Properties & CSSProperties<IProps>;
    subtitle: CSS.Properties & CSSProperties<IProps>;
    btnClear: CSS.Properties & CSSProperties<IProps>;
    iconClear: CSS.Properties & CSSProperties<IProps>;
    handle: CSS.Properties & CSSProperties<IProps>;
    handleLine: CSS.Properties & CSSProperties<IProps>;
}
interface IProps extends IClientProps, TKUIWithClasses<IStyle, IProps> {
}
export declare type TKUICardProps = IProps;
export declare type TKUICardStyle = IStyle;
export declare type TKUICardClientProps = IClientProps;
export declare function hasHandle(props: IProps): boolean;
declare const _default: (props: IClientProps) => JSX.Element;
export default _default;
