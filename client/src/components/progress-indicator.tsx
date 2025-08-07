import { Card, CardContent } from "@/components/ui/card";

interface ProgressIndicatorProps {
  currentIndex: number;
  totalCompanies: number;
}

export default function ProgressIndicator({ currentIndex, totalCompanies }: ProgressIndicatorProps) {
  const progressPercentage = totalCompanies > 0 ? ((currentIndex + 1) / totalCompanies) * 100 : 0;

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-slate-900">Application Progress</h3>
          <span className="text-sm text-slate-600">
            Company {currentIndex + 1} of {totalCompanies}
          </span>
        </div>
        <div className="w-full bg-slate-200 rounded-full h-2">
          <div 
            className="bg-primary h-2 rounded-full transition-all duration-300" 
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </CardContent>
    </Card>
  );
}
