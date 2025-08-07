import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Save, RefreshCw } from "lucide-react";

interface Company {
  name: string;
  jobTitle: string;
  jobDescription: string;
}

interface PromptEditorProps {
  template: string;
  onTemplateChange: (template: string) => void;
  onSaveTemplate: (template: string) => void;
  company?: Company;
  isSaving?: boolean;
}

export default function PromptEditor({ template, onTemplateChange, onSaveTemplate, company, isSaving }: PromptEditorProps) {
  return (
    <Card>
      <div className="p-6 border-b border-slate-200">
        <h3 className="text-lg font-semibold text-slate-900">Customize Your Prompt Template</h3>
        <p className="text-sm text-slate-600 mt-1">Edit the prompt template that will be sent to AI. Placeholders will be automatically replaced with company data.</p>
      </div>
      
      <CardContent className="p-6">
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <Label htmlFor="promptTemplate" className="text-sm font-medium text-slate-700">
              AI Prompt Template
            </Label>
            <Button 
              size="sm" 
              onClick={() => onSaveTemplate(template)}
              disabled={isSaving}
              className="flex items-center gap-2"
            >
              {isSaving ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              {isSaving ? "Saving..." : "Save Template"}
            </Button>
          </div>
          <Textarea 
            id="promptTemplate"
            rows={6} 
            className="mt-2 text-sm leading-relaxed"
            placeholder="Enter your prompt template..."
            value={template}
            onChange={(e) => onTemplateChange(e.target.value)}
          />
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
