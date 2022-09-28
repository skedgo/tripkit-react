import * as React from "react";
import { TKUIWithClasses, TKUIWithStyle } from "../jss/StyleHelper";
import { ReactComponent as IconRightArrow } from "../images/ic-angle-right.svg";
import { tKUIPagerControlJss } from "./TKUIPagerControl.css";
import { TKComponentDefaultConfig, TKUIConfig } from "../config/TKUIConfig";
import { connect, mapperFromFunction } from "../config/TKConfigHelper";

type IStyle = ReturnType<typeof tKUIPagerControlJss>

export interface TKUIPagerControlClientProps {
    value: number;
    length: number;
    onChange: (selected) => void;
}

interface IClientProps extends TKUIPagerControlClientProps, TKUIWithStyle<IStyle, IProps> { }

interface IProps extends IClientProps, TKUIWithClasses<IStyle, IProps> { }

export type TKUIPagerControlProps = IProps;
export type TKUIPagerControlStyle = IStyle;

const config: TKComponentDefaultConfig<IProps, IStyle> = {
    render: props => <TKUIPagerControl {...props} />,
    styles: tKUIPagerControlJss,
    classNamePrefix: "TKUIPagerControl"
};


const TKUIPagerControl: React.FunctionComponent<IProps> = (props: IProps) => {
    const { value, length, onChange, classes } = props;
    const onPrevNext = (prev: boolean) => onChange(prev ? value - 1 : value + 1)
    return (
        <div className={classes.main}>
            <button className={classes.arrowBtn} disabled={value === 0} onClick={() => onPrevNext(true)}>
                <IconRightArrow />
            </button>
            <div>
                {`${value + 1} / ${length}`}
            </div>
            <button className={classes.arrowBtn} disabled={value === length - 1} onClick={() => onPrevNext(false)}>
                <IconRightArrow />
            </button>
        </div>
    );
};

export default connect((config: TKUIConfig) => config.TKUIPagerControl, config,
    mapperFromFunction((clientProps: IClientProps) => clientProps));