import * as React from "react";
import {CSSProps, TKUIWithClasses, TKUIWithStyle} from "../jss/StyleHelper";
import {TKComponentDefaultConfig, TKUIConfig} from "../config/TKUIConfig";
import {tKUIMyLocationMarkerDefaultStyle} from "./TKUIMyLocationMapIcon.css";
import {connect, mapperFromFunction} from "../config/TKConfigHelper";

export interface IClientProps extends TKUIWithStyle<IStyle, IProps> {}

export interface IStyle {
    main: CSSProps<IProps>;
    pin: CSSProps<IProps>;
    pinEffect: CSSProps<IProps>;
}

interface IProps extends IClientProps, TKUIWithClasses<IStyle, IProps> {}

export type TKUIMyLocationMapIconProps = IProps;
export type TKUIMyLocationMapIconStyle = IStyle;

const config: TKComponentDefaultConfig<IProps, IStyle> = {
    render: props => <TKUIMyLocationMapIcon {...props}/>,
    styles: tKUIMyLocationMarkerDefaultStyle,
    classNamePrefix: "TKUIMyLocationMarker",
};

class TKUIMyLocationMapIcon extends React.Component<IProps, {}> {

    public render(): React.ReactNode {
        const classes = this.props.classes;
        const styles = this.props.injectedStyles;
        return(
            <div style={styles.main as any}>
                <div style={styles.pin as any}/>
                <div style={styles.pinEffect as any}/>
            </div>
        );
    }

}

export default connect((config: TKUIConfig) => config.TKUIMyLocationMapIcon, config,
    mapperFromFunction((clientProps: IClientProps) => clientProps));