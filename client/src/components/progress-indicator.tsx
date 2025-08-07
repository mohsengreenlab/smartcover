import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface ProgressIndicatorProps {
  currentIndex: number;
  totalCompanies: number;
  onPreviousCompany?: () => void;
  onNextCompany?: () => void;
}

export default function ProgressIndicator({ 
  currentIndex, 
  totalCompanies,
  onPreviousCompany,
  onNextCompany 
}: ProgressIndicatorProps) {
  const progressPercentage = totalCompanies > 0 ? ((currentIndex + 1) / totalCompanies) * 100 : 0;

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-slate-900">Application Progress</h3>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-slate-600">
              Company {currentIndex + 1} of {totalCompanies}
            </span>
            
            {totalCompanies > 1 && (
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onPreviousCompany}
                  disabled={currentIndex === 0}
                  className="h-8 w-8 p-0"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onNextCompany}
                  disabled={currentIndex >= totalCompanies - 1}
                  className="h-8 w-8 p-0"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
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
