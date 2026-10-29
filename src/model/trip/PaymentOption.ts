interface PaymentOption {
    url: string;
    method: "GET" | "POST";
    paymentMode: "INTERNAL" | "EXTERNAL" | "FREE" | "WALLET" | "INVOICE" | "CASH";
    currency: string;
    discountedPrice?: number;
    fullPrice: number;
    description: string;
    currentBalance?: number;
    newBalance?: number;
    walletName?: string;
    sponsorImageURL?: string;
    sponsorTitle?: string;
    sponsorDescription?: string;
    preFilledInitiative?: string;
    preFilledOrganization?: string;
}

export default PaymentOption;