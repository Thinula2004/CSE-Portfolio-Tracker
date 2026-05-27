export default class Summary {
  constructor(
    public totalInv: number,
    public marketVal: number,
    public dividends: number,
    public companyCount: number,
    public realizedGains: number
  ) 
  {}

  getGL(): number {
    return this.marketVal - this.totalInv;
  }

  getGLPercentage(): number {
    if (this.totalInv === 0) {
      return 0;
    }

    return (this.getGL() / this.totalInv) * 100;
  }
}