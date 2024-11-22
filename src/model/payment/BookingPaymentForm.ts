import PaymentOption from "../trip/PaymentOption";
import BookingReview from "../trip/BookingReview";
import { BookingField } from "../trip/BookingInfo";
import EphemeralResult from "./EphemeralResult";

export interface BookingPaymentForm {
    paymentOptions?: PaymentOption[],
    reviews?: BookingReview[],
    publishableApiKey: string,
    ephemeralKey: EphemeralResult,
    initiative: BookingField
}