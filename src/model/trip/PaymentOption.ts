interface PaymentOption {    
    url: string;
    method: "GET" | "POST";
    currency: string;
    discountedPrice: number;
    fullPrice: number;
    description: string;
}

export default PaymentOption;