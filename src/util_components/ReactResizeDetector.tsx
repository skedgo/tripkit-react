import React from "react";
import useResizeDetector from "react-resize-detector/build/useResizeDetector";

const ReactResizeDetector = (props: { handleWidth?: boolean, handleHeight?: boolean, targetRef?: any, onResize?: () => void }) => {
    useResizeDetector(props);
    return <></>;
}

export default ReactResizeDetector;