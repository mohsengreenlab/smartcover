import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Save, RefreshCw, FolderOpen, Trash2, Plus } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface Company {
  name: string;
  jobTitle: string;
  jobDescription: string;
}

interface PromptTemplate {
  id: string;
  name: string;
  template: string;
  isDefault: boolean;
  createdAt: string;
}

interface PromptEditorProps {
  template: string;
  onTemplateChange: (template: string) => void;
  onSaveTemplate: (template: string) => void;
  company?: Company;
  isSaving?: boolean;
}

export default function PromptEditor({ template, onTemplateChange, onSaveTemplate, company, isSaving }: PromptEditorProps) {
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [loadDialogOpen, setLoadDialogOpen] = useState(false);
  const [templateName, setTemplateName] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch saved templates
  const { data: templatesData } = useQuery<{ templates: PromptTemplate[] }>({
    queryKey: ["/api/prompt-templates"],
  });

  // Save template mutation
  const saveTemplateMutation = useMutation({
    mutationFn: async (data: { name: string; template: string; isDefault?: boolean }) => {
      const response = await apiRequest("POST", "/api/prompt-templates", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/prompt-templates"] });
      setSaveDialogOpen(false);
      setTemplateName("");
      toast({
        title: "Success",
        description: "Template saved successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to save template",
        variant: "destructive",
      });
    }
  });

  // Load template (apply to current editor)
  const handleLoadTemplate = (selectedTemplate: PromptTemplate) => {
    onTemplateChange(selectedTemplate.template);
    setLoadDialogOpen(false);
    toast({
      title: "Success",
      description: `Template "${selectedTemplate.name}" loaded`,
    });
  };

  // Delete template mutation
  const deleteTemplateMutation = useMutation({
    mutationFn: async (templateId: string) => {
      const response = await apiRequest("DELETE", `/api/prompt-templates/${templateId}`, {});
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/prompt-templates"] });
      toast({
        title: "Success",
        description: "Template deleted successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete template",
        variant: "destructive",
      });
    }
  });

  return (
    <Card>
      <div className="p-6 border-b-2 border-accent/30 bg-secondary/10 dark:bg-secondary/5">
        <h3 className="text-lg font-semibold text-foreground">Customize Your Prompt Template</h3>
        <p className="text-sm text-muted-foreground mt-1">Edit the prompt template that will be sent to AI. Placeholders will be automatically replaced with company data.</p>
      </div>
      
      <CardContent className="p-6">
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <Label htmlFor="promptTemplate" className="text-sm font-medium text-foreground">
              AI Prompt Template
            </Label>
            <div className="flex items-center gap-2">
              <Dialog open={loadDialogOpen} onOpenChange={setLoadDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" variant="outline" className="flex items-center gap-2">
                    <FolderOpen className="h-4 w-4" />
                    Load
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Load Saved Template</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {templatesData?.templates && templatesData.templates.length > 0 ? (
                      templatesData.templates.map((savedTemplate) => (
                        <div key={savedTemplate.id} className="border rounded-lg p-4 space-y-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <h3 className="font-medium">{savedTemplate.name}</h3>
                              {savedTemplate.isDefault && (
                                <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">Default</span>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              <Button
                                size="sm"
                                onClick={() => handleLoadTemplate(savedTemplate)}
                              >
                                Load
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => deleteTemplateMutation.mutate(savedTemplate.id)}
                                disabled={deleteTemplateMutation.isPending}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                          <div className="bg-muted/50 rounded p-3">
                            <p className="text-sm text-muted-foreground line-clamp-3">
                              {savedTemplate.template}
                            </p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        No saved templates found. Save your first template to get started!
                      </div>
                    )}
                  </div>
                </DialogContent>
              </Dialog>

              <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" className="flex items-center gap-2">
                    <Save className="h-4 w-4" />
                    Save As...
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Save Template</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="templateName">Template Name</Label>
                      <Input
                        id="templateName"
                        value={templateName}
                        onChange={(e) => setTemplateName(e.target.value)}
                        placeholder="Enter template name..."
                        className="mt-1"
                      />
                    </div>
                    <div className="bg-muted/50 rounded p-3">
                      <Label className="text-sm font-medium text-foreground">Template Preview:</Label>
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-4">
                        {template}
                      </p>
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        onClick={() => setSaveDialogOpen(false)}
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={() => saveTemplateMutation.mutate({ name: templateName, template })}
                        disabled={!templateName.trim() || saveTemplateMutation.isPending}
                      >
                        {saveTemplateMutation.isPending ? (
                          <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                        ) : null}
                        Save Template
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
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
            <Label className="text-sm font-medium text-foreground mb-2">Preview (with current company data):</Label>
            <div className="bg-muted/30 border border-accent/20 rounded-lg p-4 mt-2">
              <p className="text-sm text-foreground leading-relaxed">
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
