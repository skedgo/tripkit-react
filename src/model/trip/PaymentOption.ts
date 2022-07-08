interface PaymentOption {
    url: string;
    currency: string;
    discountedPrice: number;
    fullPrice: number;
    description: string;
}

export default PaymentOption;