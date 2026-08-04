/** Real amortization math — no placeholder/fake numbers. */

export interface EmiInput {
  principal: number;
  annualRatePercent: number;
  tenureYears: number;
  downPaymentPercent?: number;
}

export interface EmiResult {
  loanAmount: number;
  downPayment: number;
  monthlyEmi: number;
  totalPayment: number;
  totalInterest: number;
}

export function calculateEmi({
  principal,
  annualRatePercent,
  tenureYears,
  downPaymentPercent = 0,
}: EmiInput): EmiResult {
  const downPayment = principal * (downPaymentPercent / 100);
  const loanAmount = Math.max(principal - downPayment, 0);
  const months = Math.max(Math.round(tenureYears * 12), 1);
  const monthlyRate = annualRatePercent / 12 / 100;

  let monthlyEmi: number;
  if (monthlyRate === 0) {
    monthlyEmi = loanAmount / months;
  } else {
    const factor = Math.pow(1 + monthlyRate, months);
    monthlyEmi = (loanAmount * monthlyRate * factor) / (factor - 1);
  }

  const totalPayment = monthlyEmi * months;
  const totalInterest = totalPayment - loanAmount;

  return {
    loanAmount,
    downPayment,
    monthlyEmi: Number.isFinite(monthlyEmi) ? monthlyEmi : 0,
    totalPayment: Number.isFinite(totalPayment) ? totalPayment : 0,
    totalInterest: Number.isFinite(totalInterest) ? totalInterest : 0,
  };
}

export function formatInr(value: number, { compact = false }: { compact?: boolean } = {}) {
  if (!value || Number.isNaN(value)) return "N/A";
  if (compact) {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      notation: "compact",
      maximumFractionDigits: 1,
    }).format(value);
  }
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}
