class TKShareHelper {

    public static isSharedTripLink(): boolean {
        const shareLinkPath = document.location.pathname;
        return shareLinkPath.startsWith("/trip");
    }

    public static isSharedStopLink(): boolean {
        const shareLinkPath = document.location.pathname;
        return shareLinkPath.startsWith("/stop");
    }

    public static isSharedServiceLink(): boolean {
        const shareLinkPath = document.location.pathname;
        return shareLinkPath.startsWith("/service");
    }

}

export default TKShareHelper;