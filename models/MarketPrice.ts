import Company from "./Company";

export default class MarketPrice {
  constructor(
    public id: number,
    public company: Company,
    public price: number,
    public date: string
  ) {}

  getDate(): Date {
    return new Date(this.date);
  }
}