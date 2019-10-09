import * as React from "react";
import {CSSProperties, ClassNameMap, Styles, WithSheet, StyleCreator} from 'react-jss';
import {CSSProps, TKUIStyles, withStyleProp} from "../jss/StyleHelper";
import classNames from "classnames";
import {tKUIButtonDefaultStyle} from "./TKUIButton.css";

export enum TKUIButtonType {
    PRIMARY, SECONDARY
}

export interface ITKUIButtonProps {
    type?: TKUIButtonType;
    text?: string;
    icon?: JSX.Element;
    styles?: any;
}

interface IProps extends ITKUIButtonProps {
    classes: ClassNameMap<keyof ITKUIButtonStyle>
}

export interface ITKUIButtonStyle {
    main: CSSProps<IProps>;
    primary: CSSProps<IProps>;
    secondary: CSSProps<IProps>;
    iconContainer: CSSProps<IProps>;
}

export class TKUIButtonConfig {
    public styles: TKUIStyles<ITKUIButtonStyle, ITKUIButtonProps> = tKUIButtonDefaultStyle;

    public static instance = new TKUIButtonConfig();
}

class TKUIButton extends React.Component<IProps, {}> {

    public static defaultProps: Partial<IProps> = {
        type: TKUIButtonType.PRIMARY
    };

    public render(): React.ReactNode {
        const classes = this.props.classes;
        return (
            <button className={classNames(classes.main,
                this.props.type === TKUIButtonType.SECONDARY ? classes.secondary : classes.primary)}>
                {this.props.icon &&
                <div className={classes.iconContainer}>
                    {this.props.icon}
                </div>
                }
                {this.props.text}
            </button>
        );
    }

}

const TKUIButtonWithStyleProp = withStyleProp(TKUIButton);

export default (props: ITKUIButtonProps) => {
    const stylesToPass = props.styles || TKUIButtonConfig.instance.styles;
    return <TKUIButtonWithStyleProp {...props} styles={stylesToPass}/>
};