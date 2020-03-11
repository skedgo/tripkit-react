import {TKState, TKUtil} from '../../index';
import TKShareHelper from "../../share/TKShareHelper";

class Usersnap {

    public static feedbackData?: string;

    public static load() {
        const global = window as any;
        global.onUsersnapLoad = (api: any) => {
            api.init({
                button: null
            });
            api.on('open', (event: any) => {
                if (this.feedbackData) {
                    console.log(this.feedbackData);
                    event.api.setValue('customData', this.feedbackData);
                }});
            global.Usersnap = api;
        };
        const script: any = document.createElement('script');
        script.async = 1;
        script.src = 'https://api.usersnap.com/load/73fafb00-c1d8-48de-a116-0b7f1785fd11.js?onload=onUsersnapLoad';
        document.getElementsByTagName('head')[0].appendChild(script);
    }


    public static openReportWindow() {
        (window as any).Usersnap.open();
    };

    public static setFeedbackData(state: TKState) {
        const optionsJson = TKUtil.serialize(state.userProfile);
        const location = window.location;
        const plannerUrl = location.protocol + "//" + location.hostname
            + (location.port ? ":" + location.port : "") + location.pathname;
        this.feedbackData =
            "webapp url: " + encodeURI(TKShareHelper.getShareQuery(state.routingQuery, plannerUrl)) + "\n\n"
            + "options: " + JSON.stringify(optionsJson) + "\n\n"
            + "satapp url: " +  (state.selectedTrip ? state.selectedTrip.satappQuery : "") + "\n\n"
            + "trip url: " +  (state.selectedTrip ? state.selectedTrip.temporaryURL : "");
    }

}

Usersnap.load();

export default Usersnap;