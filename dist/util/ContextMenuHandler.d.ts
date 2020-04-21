export default class ContextMenuHandler {
    private longPressCountdown;
    private contextMenuPossible;
    private callback;
    constructor();
    onTouchStart: (e: any) => void;
    onTouchMove: (e: any) => void;
    onTouchCancel: (e: any) => void;
    onTouchEnd: (e: any) => void;
    onContextMenu: (e: any) => void;
    setContextMenuHandler(handler: (e: any) => void): void;
}
