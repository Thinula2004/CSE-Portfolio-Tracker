import Company from './Company';

export default class Transaction {
  constructor(
    public id: number,
    public company: Company,
    public type: string,
    public shareCount: number,
    public pricePerShare: number,
    public handlingFee: number,
    public grossAmount: number,
    public netAmount: number,
    public transactionDate: string,
    public transactionTime: string,
    public notes: string | null
  ) {}
}