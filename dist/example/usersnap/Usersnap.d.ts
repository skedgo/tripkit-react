import { TKState } from '../../index';
declare class Usersnap {
    static feedbackData?: string;
    static load(): void;
    static openReportWindow(): void;
    static setFeedbackData(state: TKState): void;
}
export default Usersnap;
