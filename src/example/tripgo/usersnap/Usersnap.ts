import TKState from "../../../config/TKState";
import {feedbackTextFromState} from "../../../feedback/TKUIReportBtn";
// import {TKState, feedbackTextFromState} from '../../../index';

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
        this.feedbackData = feedbackTextFromState(state);
    }

}

Usersnap.load();

export default Usersnap;