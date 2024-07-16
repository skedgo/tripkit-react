import React, { useEffect, useState } from 'react';
import { TKUIWithClasses, withStyles } from '../jss/StyleHelper';
import { tKUIReorderListStyle } from './TKUIReorderList.css';
import Util from '../util/Util';
import classNames from 'classnames';

export function moveFromTo(array: any[], from: number, to: number): any[] {
    for (let i = from; i !== to; i = from < to ? i + 1 : i - 1) {
        const bubbleTargetI = from < to ? i + 1 : i - 1;
        const bubble = array[i];
        array[i] = array[bubbleTargetI];
        array[bubbleTargetI] = bubble;
        console.log(array);
    }
    return array;
}

type IStyle = ReturnType<typeof tKUIReorderListStyle>

interface IProps extends TKUIWithClasses<IStyle, IProps> {
    children: React.ReactNode | ((onHandleMouseDown: (e: MouseEvent, i: number) => void) => React.ReactNode);
    onDragEnd: (dragged: number, to: number) => void;
}

const TKUIReorderList: React.FunctionComponent<IProps> = ({ children, onDragEnd, classes }) => {
    const [dragged, setDragged] = useState<number | null>(null);
    const [mouse, setMouse] = useState<[number, number]>([0, 0]);
    const containerRef = React.useRef<HTMLUListElement>(null);
    const containerTop = containerRef.current?.getBoundingClientRect().top ?? 0;
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            var x = e.x - (containerRef.current?.getBoundingClientRect().left ?? 0); //x position within the element.
            var y = e.y - (containerRef.current?.getBoundingClientRect().top ?? 0);  //y position within the element.
            setMouse([x, y]);
        };

        document.addEventListener("mousemove", handler);

        return () => document.removeEventListener("mousemove", handler);
    }, []);
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (dragged !== null) {
                e.preventDefault();
                setDragged(null);
                onDragEnd(dragged, targetIndex);
            }
        };
        document.addEventListener("mouseup", handler);
        return () => document.removeEventListener("mouseup", handler);
    });
    function mouseYToIndex(y: number): number {
        if (!containerRef.current) {
            return 0;
        }
        const childrenLength = [...containerRef.current.firstChild!.childNodes as any].filter(child => !(child as HTMLElement).className.includes("smooth-dnd-ghost")).length;
        for (let i = 0; i < childrenLength; i++) {
            const child = containerRef.current?.firstChild?.childNodes[i];
            const rect = (child as HTMLElement).getBoundingClientRect();
            if (y < rect.top - containerTop + rect.height) {
                return i;
            }
        }
        return childrenLength - 1;
    }
    const targetIndex = mouseYToIndex(mouse[1]);

    function onHandleMouseDown(e, i: number) {
        e.preventDefault();
        setDragged(i);
    }

    const externalHandles = Util.isFunction(children);
    const childrenNodes = Util.isFunction(children) ? (children as any)(onHandleMouseDown) : children;

    return (
        <ul className={classes.main} ref={containerRef}>
            <div className={classNames(classes.smoothDndContainer, classes.vertical)}>
                {React.Children.map(childrenNodes, (child, i) => {
                    const elem = containerRef.current?.firstChild?.childNodes[i] as HTMLElement;
                    const elemHeight = elem?.getBoundingClientRect().height ?? 0;
                    const shouldShiftUp = i > dragged! && i <= targetIndex;
                    const shouldShiftDown = i < dragged! && i >= targetIndex;
                    return (
                        <div>
                            <div
                                className={classNames(classes.smoothDndDraggableWrapper, dragged !== null && classes.animated)}
                                style={{
                                    transitionDuration: dragged !== null ? '250ms' : '0ms',
                                    ...dragged !== null && shouldShiftUp ? { transform: `translate3d(0px, -${elemHeight}px, 0px)` } : undefined,
                                    ...dragged !== null && shouldShiftDown ? { transform: `translate3d(0px, ${elemHeight}px, 0px)` } : undefined,
                                    ...dragged === i ? { visibility: "hidden" } : undefined
                                }}
                            >
                                <li className="MuiListItem-container-6" onMouseDown={externalHandles ? undefined : (e) => { onHandleMouseDown(e, i); }}>
                                    {child}
                                </li>
                            </div>
                        </div>
                    );
                })}
                {dragged !== null &&
                    <div
                        className="smooth-dnd-ghost vertical smooth-dnd-draggable-wrapper"
                        style={{
                            zIndex: 1000,
                            boxSizing: 'border-box',
                            position: 'fixed',
                            top: `${mouse[1] - 20}px`,
                            // left: '8px',
                            width: '100%',
                            height: '46px',
                            overflow: 'visible',
                            pointerEvents: 'none',
                            userSelect: 'none'
                        }}
                    >
                        <li className="MuiListItem-container-6">
                            {React.Children.toArray(childrenNodes)[dragged]}
                        </li>
                    </div>
                }
            </div>
        </ul >
    );
};


export default withStyles(TKUIReorderList, tKUIReorderListStyle);