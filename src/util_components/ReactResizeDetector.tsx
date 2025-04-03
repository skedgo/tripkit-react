import React from "react";
import { useResizeDetector } from "react-resize-detector";
// If the previous import fails, a workaraound to make it work locally is with 
// the following line, removing the export property in react-resize-detector's package.json in node-modules.
// import useResizeDetector from "react-resize-detector/build/useResizeDetector";

const ReactResizeDetector = (props: { handleWidth?: boolean, handleHeight?: boolean, targetRef?: any, onResize?: () => void }) => {
    useResizeDetector(props);
    return <></>;
}

export default ReactResizeDetector;