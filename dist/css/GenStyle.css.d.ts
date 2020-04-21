import * as CSS from 'csstype';
import { CSSProps } from "../jss/StyleHelper";
interface ITKUIGenStyle {
    flex: CSS.Properties;
    column: CSS.Properties;
    center: CSS.Properties;
    spaceBetween: CSS.Properties;
    spaceAround: CSS.Properties;
    justifyStart: CSS.Properties;
    justifyEnd: CSS.Properties;
    alignCenter: CSS.Properties;
    alignStart: CSS.Properties;
    alignStretch: CSS.Properties;
    alignSelfCenter: CSS.Properties;
    alignSelfStart: CSS.Properties;
    alignSelfStretch: CSS.Properties;
    grow: CSS.Properties;
    noShrink: CSS.Properties;
    wrap: CSS.Properties;
    animateSpin: CSS.Properties;
    svgFillCurrColor: CSSProps<{}>;
    svgPathFillCurrColor: CSSProps<{}>;
    scrollableY: CSSProps<{}>;
    relative: CSSProps<{}>;
    hidden: CSSProps<{}>;
    rotate180: CSSProps<{}>;
    fontL: CSSProps<{}>;
    fontM: CSSProps<{}>;
    fontS: CSSProps<{}>;
    fontSM: CSSProps<{}>;
    fontMImp: CSSProps<{}>;
    textGray: CSSProps<{}>;
    borderRadius: (radius: number, unit?: string) => CSSProps<{}>;
    transformRotate: (angle: number, unit?: string) => CSSProps<{}>;
}
declare const genStyles: ITKUIGenStyle;
export default genStyles;
