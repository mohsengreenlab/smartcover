import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";

interface Company {
  id: string;
  name: string;
  applicationLink: string;
  jobDescription: string;
  jobTitle: string;
}

interface CompanyCardProps {
  company: Company;
}

export default function CompanyCard({ company }: CompanyCardProps) {
  const openApplicationLink = () => {
    window.open(company.applicationLink, '_blank');
  };

  return (
    <Card>
      <div className="p-6 border-b border-slate-200">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-slate-900">{company.name}</h2>
          <Button variant="outline" onClick={openApplicationLink} className="text-primary border-primary hover:bg-primary/5">
            <ExternalLink className="w-4 h-4 mr-2" />
            View Application
          </Button>
        </div>
      </div>
      
      <CardContent className="p-6">
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-slate-900 mb-2">Job Title</h4>
            <p className="text-slate-700">{company.jobTitle}</p>
          </div>
          <div>
            <h4 className="font-medium text-slate-900 mb-2">Application Link</h4>
            <a 
              href={company.applicationLink} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-primary hover:text-blue-700 transition-colors text-sm break-all"
            >
              {company.applicationLink}
            </a>
          </div>
        </div>
        
        <div className="mt-6">
          <h4 className="font-medium text-slate-900 mb-2">Job Description</h4>
          <div className="bg-slate-50 rounded-lg p-4 max-h-40 overflow-y-auto">
            <p className="text-sm text-slate-700 leading-relaxed">
              {company.jobDescription}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
