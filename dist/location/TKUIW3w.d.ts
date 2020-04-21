/// <reference types="react" />
import { CSSProps, TKUIWithClasses, TKUIWithStyle } from "../jss/StyleHelper";
export interface IClientProps extends TKUIWithStyle<IStyle, IProps> {
    w3w: string;
    w3wInfoURL?: string;
}
export interface IStyle {
    main: CSSProps<IProps>;
    icon: CSSProps<IProps>;
    details: CSSProps<IProps>;
    value: CSSProps<IProps>;
    url: CSSProps<IProps>;
}
interface IProps extends IClientProps, TKUIWithClasses<IStyle, IProps> {
}
export declare type TKUIW3wProps = IProps;
export declare type TKUIW3wStyle = IStyle;
declare const _default: (props: IClientProps) => JSX.Element;
export default _default;
