import Util from "./Util";

// let userSnapEmail = 'email';
let feedback = '';

function hasFeedback() {
    return (feedback && feedback.length !== 0);
}

const _usersnapconfig: any = {
    beforeSend: (obj: any) => {
        if (hasFeedback()) {
            obj.addInfo = feedback;
        }
    }
};

// Export to gwt

(window as any).setUserSnapEmail = function setUserSnapEmail(email: string) {
    // userSnapEmail = email;
};

(window as any).openReportWindow = function openReportWindow() {
    (window as any).UserSnap.openReportWindow();
};

(window as any).setUserSnapData = function setUserSnapData(data: string) {
    feedback = data;
};

(window as any).initUsersnap = function initUsersnap(modeReport: boolean) {
    if (modeReport) {
        _usersnapconfig.mode = 'report';
    }
    const s = document.createElement('script');
    s.type = 'text/javascript';
    s.async = true;
    s.src = '//api.usersnap.com/beta/'+
        '73fafb00-c1d8-48de-a116-0b7f1785fd11.js';
    const x = document.getElementsByTagName('head')[0];
    x.appendChild(s);
};