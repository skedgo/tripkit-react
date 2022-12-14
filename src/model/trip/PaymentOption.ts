interface PaymentOption {    
    url: string;
    method: "GET" | "POST";
    paymentMode: "INTERNAL" | "EXTERNAL" | "FREE";
    currency: string;
    discountedPrice: number;
    fullPrice: number;
    description: string;
}

export default PaymentOption;