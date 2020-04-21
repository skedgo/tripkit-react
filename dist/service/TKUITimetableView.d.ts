/// <reference types="react" />
import { IServiceResultsContext } from "../service/ServiceResultsProvider";
import { CSSProps, TKUIWithClasses, TKUIWithStyle } from "../jss/StyleHelper";
import StopLocation from "../model/StopLocation";
import { TKUISlideUpOptions } from "../card/TKUISlideUp";
interface IClientProps extends TKUIWithStyle<IStyle, IProps> {
    open?: boolean;
    onRequestClose?: () => void;
    onDirectionsClicked?: () => void;
    slideUpOptions?: TKUISlideUpOptions;
}
export interface IProps extends IClientProps, IServiceResultsContext, TKUIWithClasses<IStyle, IProps> {
    actions?: (stop: StopLocation) => JSX.Element[];
}
interface IStyle {
    main: CSSProps<IProps>;
    listPanel: CSSProps<IProps>;
    containerPanel: CSSProps<IProps>;
    subHeader: CSSProps<IProps>;
    serviceList: CSSProps<IProps>;
    serviceNumber: CSSProps<IProps>;
    actionsPanel: CSSProps<IProps>;
    secondaryBar: CSSProps<IProps>;
    filterPanel: CSSProps<IProps>;
    glassIcon: CSSProps<IProps>;
    filterInput: CSSProps<IProps>;
    faceButtonClass: CSSProps<IProps>;
    dapartureRow: CSSProps<IProps>;
    iconLoading: CSSProps<IProps>;
}
export declare type TKUITimetableViewProps = IProps;
export declare type TKUITimetableViewStyle = IStyle;
declare const _default: (props: IClientProps) => JSX.Element;
export default _default;
