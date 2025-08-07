import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface Company {
  name: string;
  jobTitle: string;
  jobDescription: string;
}

interface PromptEditorProps {
  template: string;
  onTemplateChange: (template: string) => void;
  company?: Company;
}

export default function PromptEditor({ template, onTemplateChange, company }: PromptEditorProps) {
  return (
    <Card>
      <div className="p-6 border-b border-slate-200">
        <h3 className="text-lg font-semibold text-slate-900">Customize Your Prompt Template</h3>
        <p className="text-sm text-slate-600 mt-1">Edit the prompt template that will be sent to AI. Placeholders will be automatically replaced with company data.</p>
      </div>
      
      <CardContent className="p-6">
        <div className="mb-4">
          <Label htmlFor="promptTemplate" className="text-sm font-medium text-slate-700 mb-2">
            AI Prompt Template
          </Label>
          <Textarea 
            id="promptTemplate"
            rows={6} 
            className="mt-2 text-sm leading-relaxed"
            placeholder="Enter your prompt template..."
            value={template}
            onChange={(e) => onTemplateChange(e.target.value)}
          />
        </div>
        
        {/* Placeholder Legend */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-medium text-blue-900 mb-3">Available Placeholders:</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
            <div className="flex items-center space-x-2">
              <code className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">{"{COMPANY_NAME}"}</code>
              <span className="text-blue-700">Company name</span>
            </div>
            <div className="flex items-center space-x-2">
              <code className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">{"{JOB_TITLE}"}</code>
              <span className="text-blue-700">Job title</span>
            </div>
            <div className="flex items-center space-x-2">
              <code className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">{"{JOB_DESCRIPTION}"}</code>
              <span className="text-blue-700">Job description</span>
            </div>
          </div>
        </div>

        {/* Preview populated prompt if company data is available */}
        {company && template && (
          <div className="mt-4">
            <Label className="text-sm font-medium text-slate-700 mb-2">Preview (with current company data):</Label>
            <div className="bg-slate-100 rounded-lg p-4 mt-2">
              <p className="text-sm text-slate-800 leading-relaxed">
                {template
                  .replace(/{COMPANY_NAME}/g, company.name)
                  .replace(/{JOB_TITLE}/g, company.jobTitle)
                  .replace(/{JOB_DESCRIPTION}/g, company.jobDescription.substring(0, 200) + "...")
                }
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
