import * as React from "react";
import {CSSProps, TKUIWithClasses, TKUIWithStyle} from "../jss/StyleHelper";
import {TKComponentDefaultConfig, TKUIConfig} from "../config/TKUIConfig";
import {connect, mapperFromFunction} from "../config/TKConfigHelper";
import {tKUICookiesBannerDefaultStyle} from "./TKUICookiesBanner.css";
import TKUISlideUp from "../card/TKUISlideUp";

export interface IClientProps extends TKUIWithStyle<IStyle, IProps> {}

export interface IStyle {
    main: CSSProps<IProps>;
}

interface IProps extends IClientProps, TKUIWithClasses<IStyle, IProps> {}

export type TKUICookiesBannerProps = IProps;
export type TKUICookiesBannerStyle = IStyle;

const config: TKComponentDefaultConfig<IProps, IStyle> = {
    render: props => <TKUICookiesBanner {...props}/>,
    styles: tKUICookiesBannerDefaultStyle,
    classNamePrefix: "TKUICookiesBanner",
};

class TKUICookiesBanner extends React.Component<IProps, {}> {

    public render(): React.ReactNode {
        return (
            <TKUISlideUp>
                This website uses cookies to improve your experience. We'll assume
            </TKUISlideUp>
        );
    }

}

export default connect((config: TKUIConfig) => config.TKUICookiesBanner, config,
    mapperFromFunction((clientProps: IClientProps) => clientProps));