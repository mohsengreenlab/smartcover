import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Wand2, RefreshCw, Copy, ExternalLink, ArrowRight, Eye, EyeOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";

interface Company {
  id: string;
  name: string;
  applicationLink: string;
  jobDescription: string;
  jobTitle: string;
}

interface CoverLetterGeneratorProps {
  company: Company;
  promptTemplate: string;
  geminiApiKey: string;
  onApiKeyChange: (apiKey: string) => void;
  onNextCompany: () => void;
}

export default function CoverLetterGenerator({ 
  company, 
  promptTemplate, 
  geminiApiKey, 
  onApiKeyChange, 
  onNextCompany 
}: CoverLetterGeneratorProps) {
  const { toast } = useToast();
  const [generatedContent, setGeneratedContent] = useState("");
  const [showApiKey, setShowApiKey] = useState(false);

  const generateMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/generate-cover-letter", {
        companyId: company.id,
      });
      return response.json();
    },
    onSuccess: (data) => {
      setGeneratedContent(data.content);
      toast({
        title: "Success",
        description: "Cover letter generated successfully!",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to generate cover letter",
        variant: "destructive",
      });
    },
  });

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(generatedContent);
      toast({
        title: "Success",
        description: "Cover letter copied to clipboard!",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy to clipboard",
        variant: "destructive",
      });
    }
  };

  const openApplicationLink = () => {
    window.open(company.applicationLink, '_blank');
  };

  return (
    <div className="space-y-8">
      {/* API Configuration Section */}
      <Card>
        <div className="p-6 border-b border-slate-200">
          <h3 className="text-lg font-semibold text-slate-900">AI Configuration</h3>
          <p className="text-sm text-slate-600 mt-1">Configure your Gemini AI API settings</p>
        </div>
        
        <CardContent className="p-6">
          <div className="max-w-md">
            <Label htmlFor="apiKey" className="text-sm font-medium text-slate-700 mb-2">
              Gemini API Key
            </Label>
            <div className="relative mt-2">
              <Input 
                id="apiKey"
                type={showApiKey ? "text" : "password"}
                className="pr-10" 
                placeholder="Enter your Gemini API key..."
                value={geminiApiKey}
                onChange={(e) => onApiKeyChange(e.target.value)}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 p-0"
                onClick={() => setShowApiKey(!showApiKey)}
              >
                {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
            <p className="text-xs text-slate-500 mt-2">Your API key is stored securely and never shared</p>
          </div>
        </CardContent>
      </Card>

      {/* AI Generation Section */}
      <Card>
        <div className="p-6 border-b border-slate-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-slate-900">Generated Cover Letter</h3>
            <div className="flex items-center space-x-3">
              <Button 
                onClick={() => generateMutation.mutate()}
                disabled={generateMutation.isPending || !promptTemplate}
                className="bg-primary hover:bg-blue-700"
              >
                <Wand2 className="w-4 h-4 mr-2" />
                Generate
              </Button>
              <Button 
                variant="outline"
                onClick={() => generateMutation.mutate()}
                disabled={generateMutation.isPending || !generatedContent}
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Regenerate
              </Button>
            </div>
          </div>
        </div>
        
        <CardContent className="p-6">
          {/* Loading State */}
          {generateMutation.isPending && (
            <div className="text-center py-12">
              <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-slate-600">Generating your personalized cover letter...</p>
            </div>
          )}

          {/* Generated Content */}
          {generatedContent && !generateMutation.isPending && (
            <div className="space-y-4">
              <div className="bg-slate-50 rounded-lg p-6 border-l-4 border-primary">
                <div className="prose prose-sm max-w-none">
                  <div className="text-slate-800 leading-relaxed whitespace-pre-line">
                    {generatedContent}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-4">
                <div className="flex items-center space-x-3">
                  <Button 
                    onClick={copyToClipboard}
                    className="bg-success hover:bg-green-700"
                  >
                    <Copy className="w-4 h-4 mr-2" />
                    Copy to Clipboard
                  </Button>
                  
                  <Button 
                    variant="outline"
                    onClick={openApplicationLink}
                    className="border-primary text-primary hover:bg-blue-50"
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Apply Now
                  </Button>
                </div>

                <Button 
                  onClick={onNextCompany}
                  className="bg-slate-600 hover:bg-slate-700"
                >
                  Next Company
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          )}

          {/* Empty State */}
          {!generatedContent && !generateMutation.isPending && (
            <div className="text-center py-12 text-slate-500">
              <Wand2 className="w-12 h-12 mx-auto mb-4 text-slate-300" />
              <p>Click "Generate" to create your personalized cover letter</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
