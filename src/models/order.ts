export interface IOrder {
    id: number;
    userId: number;
    city: string;
    street: string;
    shippingDate: Date;
    dateOrdering: Date;
    fourNumbersCredit: number;
}