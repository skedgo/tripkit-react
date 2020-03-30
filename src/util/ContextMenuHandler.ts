const longPressDuration = 610;

export default class ContextMenuHandler {

    private longPressCountdown: any;
    private contextMenuPossible: any;
    private callback: any;

    constructor() {
        this.callback = () => {};
        this.longPressCountdown = null;
        this.contextMenuPossible = false;
    }

    public onTouchStart = (e: any) => {
        this.contextMenuPossible = true;

        const touch = e.touches[0];

        this.longPressCountdown = setTimeout(() => {
            this.contextMenuPossible = false;
            this.callback(touch);
        }, longPressDuration);
    };

    public onTouchMove = (e: any) => {
        clearTimeout(this.longPressCountdown);
    };

    public onTouchCancel = (e: any) => {
        this.contextMenuPossible = false;
        clearTimeout(this.longPressCountdown);
    };

    public onTouchEnd = (e: any) => {
        this.contextMenuPossible = false;
        clearTimeout(this.longPressCountdown);
    };

    public onContextMenu = (e: any) => {
        this.contextMenuPossible = false;

        clearTimeout(this.longPressCountdown);

        this.callback(e);
        e.preventDefault();
    };

    public setContextMenuHandler(handler: (e: any) => void) {
        this.callback = handler;
    }
}
