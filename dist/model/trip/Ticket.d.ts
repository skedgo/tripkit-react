declare class Ticket {
    private _cost;
    private _exchange;
    private _name;
    get cost(): number | undefined;
    get exchange(): number | undefined;
    get name(): string;
}
export default Ticket;
