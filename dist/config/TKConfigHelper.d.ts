import * as React from "react";
import { TKUIWithClasses, TKUIWithStyle } from "../jss/StyleHelper";
import { TKUIConfig, TKComponentDefaultConfig, TKComponentConfig } from "./TKUIConfig";
import { Subtract } from "utility-types";
import { TKI18nContextProps } from "../i18n/TKI18nProvider";
export declare type PropsMapper<INPUT_PROPS, OUTPUT_PROPS> = React.SFC<{
    inputProps: INPUT_PROPS;
    children: (outputProps: OUTPUT_PROPS) => React.ReactNode;
}>;
export declare function mapperFromFunction<INPUT_PROPS, OUTPUT_PROPS>(mapperFc: (inputProps: INPUT_PROPS) => OUTPUT_PROPS): PropsMapper<INPUT_PROPS, OUTPUT_PROPS>;
export declare function connect<IMPL_PROPS extends CLIENT_PROPS & TKUIWithClasses<STYLE, IMPL_PROPS> & TKI18nContextProps, CLIENT_PROPS extends TKUIWithStyle<STYLE, IMPL_PROPS>, STYLE>(confToCompMapper: (config: TKUIConfig) => Partial<TKComponentConfig<IMPL_PROPS, STYLE>> | undefined, defaultConfig: TKComponentDefaultConfig<IMPL_PROPS, STYLE>, PropsMapper: PropsMapper<CLIENT_PROPS, Subtract<IMPL_PROPS, TKUIWithClasses<STYLE, IMPL_PROPS>>>): (props: CLIENT_PROPS) => JSX.Element;
