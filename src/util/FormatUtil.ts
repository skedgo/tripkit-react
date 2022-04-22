class FormatUtil {

    public static toMoney(n: number, options: { currency?: string, nInCents?: boolean, round?: boolean, forceDecimals?: boolean } = {}): string {
        let nInDollars = options.nInCents ? n / 100 : n;
        if (options.round) {
            nInDollars = Math.round(nInDollars);
            options.forceDecimals = false;
        }
        const toFixed2 = nInDollars.toFixed(2);
        const moneyS = (options.forceDecimals || !toFixed2.endsWith("00")) ? toFixed2 : nInDollars.toFixed();
        return (options.currency ?? "$") + moneyS;
    }

}

export default FormatUtil;