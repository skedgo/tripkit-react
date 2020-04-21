/// <reference types="react" />
import { CSSProps, TKUIWithClasses, TKUIWithStyle } from "../jss/StyleHelper";
export interface IClientProps extends TKUIWithStyle<IStyle, IProps> {
    link?: string;
    customMsg: string;
}
export interface IStyle {
    main: CSSProps<IProps>;
    qrSharePanel: CSSProps<IProps>;
    qrLabel: CSSProps<IProps>;
    qrCode: CSSProps<IProps>;
    qrCodeImg: CSSProps<IProps>;
    copyLinkPanel: CSSProps<IProps>;
    linkBox: CSSProps<IProps>;
    linkIcon: CSSProps<IProps>;
    separation: CSSProps<IProps>;
}
interface IProps extends IClientProps, TKUIWithClasses<IStyle, IProps> {
}
export declare type TKUIShareViewProps = IProps;
export declare type TKUIShareViewStyle = IStyle;
declare const _default: (props: IClientProps) => JSX.Element;
export default _default;
