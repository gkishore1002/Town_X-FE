import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Calculator } from "lucide-react";

import { calculateEmi, formatInr } from "@/lib/finance";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const emiFormSchema = z.object({
  principal: z.coerce.number().positive("Enter a property price"),
  annualRatePercent: z.coerce.number().min(0).max(30, "Rate looks too high"),
  tenureYears: z.coerce.number().min(1, "At least 1 year").max(30, "Max 30 years"),
  downPaymentPercent: z.coerce.number().min(0).max(90, "Max 90%"),
});

export type EmiFormInput = z.input<typeof emiFormSchema>;
export type EmiFormValues = z.output<typeof emiFormSchema>;

export interface EMICalculatorProps {
  propertyPrice: number;
  className?: string;
}

export function EMICalculator({ propertyPrice, className }: EMICalculatorProps) {
  const {
    register,
    watch,
    formState: { errors },
  } = useForm<EmiFormInput, unknown, EmiFormValues>({
    resolver: zodResolver(emiFormSchema),
    mode: "onChange",
    defaultValues: {
      principal: propertyPrice,
      annualRatePercent: 8.5,
      tenureYears: 20,
      downPaymentPercent: 20,
    },
  });

  // watch() reflects raw (pre-coercion) input values while typing, so numbers
  // are converted explicitly here for the live preview; zodResolver still
  // owns real validation/error messages above.
  const values = watch();
  const isValid = !Object.keys(errors).length;
  const result = isValid
    ? calculateEmi({
        principal: Number(values.principal),
        annualRatePercent: Number(values.annualRatePercent),
        tenureYears: Number(values.tenureYears),
        downPaymentPercent: Number(values.downPaymentPercent),
      })
    : null;

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Calculator className="size-4 text-primary" />
          EMI Calculator
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="emi-principal">Property price (₹)</Label>
            <Input id="emi-principal" type="number" {...register("principal")} />
            {errors.principal && (
              <p className="text-xs text-destructive">{errors.principal.message}</p>
            )}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="emi-down">Down payment (%)</Label>
            <Input id="emi-down" type="number" {...register("downPaymentPercent")} />
            {errors.downPaymentPercent && (
              <p className="text-xs text-destructive">{errors.downPaymentPercent.message}</p>
            )}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="emi-rate">Interest rate (% p.a.)</Label>
            <Input id="emi-rate" type="number" step="0.1" {...register("annualRatePercent")} />
            {errors.annualRatePercent && (
              <p className="text-xs text-destructive">{errors.annualRatePercent.message}</p>
            )}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="emi-tenure">Tenure (years)</Label>
            <Input id="emi-tenure" type="number" {...register("tenureYears")} />
            {errors.tenureYears && (
              <p className="text-xs text-destructive">{errors.tenureYears.message}</p>
            )}
          </div>
        </div>

        {result && (
          <div className="rounded-control bg-secondary p-4">
            <p className="text-xs text-muted-foreground">Estimated monthly EMI</p>
            <p className="font-display text-2xl font-semibold text-primary">
              {formatInr(result.monthlyEmi)}
            </p>
            <div className="mt-3 grid grid-cols-1 xs:grid-cols-3 gap-3 sm:gap-2 text-xs text-muted-foreground">
              <div>
                <p className="text-foreground font-medium">{formatInr(result.loanAmount, { compact: true })}</p>
                <p>Loan amount</p>
              </div>
              <div>
                <p className="text-foreground font-medium">{formatInr(result.totalInterest, { compact: true })}</p>
                <p>Total interest</p>
              </div>
              <div>
                <p className="text-foreground font-medium">{formatInr(result.totalPayment, { compact: true })}</p>
                <p>Total payment</p>
              </div>
            </div>
          </div>
        )}
        <p className="text-[11px] text-muted-foreground">
          Estimate only — actual EMI depends on your lender's terms and eligibility.
        </p>
      </CardContent>
    </Card>
  );
}

export default EMICalculator;
