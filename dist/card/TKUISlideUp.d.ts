import React from "react";
import { ClassNameMap } from "react-jss";
interface IProps extends TKUISlideUpOptions {
    containerClass?: string;
    classes: ClassNameMap<any>;
    open?: boolean;
    onDrag?: () => void;
    onDragEnd?: () => void;
    handleRef?: any;
    draggable?: boolean;
    cardOnTop?: (onTop: boolean) => void;
}
export declare enum TKUISlideUpPosition {
    UP = 0,
    MIDDLE = 1,
    DOWN = 2,
    HIDDEN = 3
}
export interface TKUISlideUpOptions {
    initPosition?: TKUISlideUpPosition;
    modalUp?: {
        top: number;
        unit: string;
    };
    modalMiddle?: {
        top: number;
        unit: string;
    };
    modalDown?: {
        top: number;
        unit: string;
    };
    position?: TKUISlideUpPosition;
    onPositionChange?: (position: TKUISlideUpPosition) => void;
    draggable?: boolean;
}
declare const _default: React.ComponentType<Pick<Pick<IProps, never> & Partial<Pick<IProps, "classes" | "position" | "open" | "containerClass" | "onDrag" | "onDragEnd" | "handleRef" | "draggable" | "cardOnTop" | "initPosition" | "modalUp" | "modalMiddle" | "modalDown" | "onPositionChange">> & Partial<Pick<Partial<IProps>, never>>, "position" | "open" | "containerClass" | "onDrag" | "onDragEnd" | "handleRef" | "draggable" | "cardOnTop" | "initPosition" | "modalUp" | "modalMiddle" | "modalDown" | "onPositionChange"> & import("react-jss").StyledComponentProps<"container">>;
export default _default;
