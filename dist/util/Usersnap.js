import Util from "./Util";
// let userSnapEmail = 'email';
var feedback = '';
function hasFeedback() {
    return (feedback && feedback.length !== 0);
}
var _usersnapconfig = {
    beforeSend: function (obj) {
        if (hasFeedback()) {
            obj.addInfo = feedback;
        }
    }
};
// Export to gwt
Util.global.setUserSnapEmail = function setUserSnapEmail(email) {
    // userSnapEmail = email;
};
Util.global.openReportWindow = function openReportWindow() {
    Util.global.UserSnap.openReportWindow();
};
Util.global.setUserSnapData = function setUserSnapData(data) {
    feedback = data;
};
Util.global.initUsersnap = function initUsersnap(modeReport) {
    if (modeReport) {
        _usersnapconfig.mode = 'report';
    }
    var s = document.createElement('script');
    s.type = 'text/javascript';
    s.async = true;
    s.src = '//api.usersnap.com/beta/' +
        '73fafb00-c1d8-48de-a116-0b7f1785fd11.js';
    var x = document.getElementsByTagName('head')[0];
    x.appendChild(s);
};
//# sourceMappingURL=Usersnap.js.map