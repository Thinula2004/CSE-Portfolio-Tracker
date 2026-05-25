import Company from "./Company";

export default class Share {
  constructor(
    public id: number,
    public company: Company,
    public amount: number,
    public avgCost: number,
    public totalCost: number,
    public marketPrice: string = "",
  ) 
  {}
}