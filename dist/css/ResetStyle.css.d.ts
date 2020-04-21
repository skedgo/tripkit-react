import { CSSProps } from "../jss/StyleHelper";
interface ITKUIResetStyle {
    button: CSSProps<{}>;
    select: CSSProps<{}>;
    input: CSSProps<{}>;
}
export declare const resetStyles: ITKUIResetStyle;
export declare const resetClasses: Record<"button" | "input" | "select", string>;
export {};
