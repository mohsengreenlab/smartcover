import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { FileText, User, LogOut } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import FileUpload from "@/components/file-upload";
import ProgressIndicator from "@/components/progress-indicator";
import CompanyCard from "@/components/company-card";
import PromptEditor from "@/components/prompt-editor";
import CoverLetterGenerator from "@/components/cover-letter-generator";

interface Company {
  id: string;
  name: string;
  applicationLink: string;
  jobDescription: string;
  jobTitle: string;
  rowIndex: number;
}

interface CompaniesData {
  companies: Company[];
  currentIndex: number;
  promptTemplate: string;
}

export default function Home() {
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [promptTemplate, setPromptTemplate] = useState("");

  // Fetch companies data
  const { data: companiesData, isLoading } = useQuery<CompaniesData>({
    queryKey: ["/api/companies"],
  });

  // Update user session mutation
  const updateSessionMutation = useMutation({
    mutationFn: async (data: { currentCompanyIndex?: number; promptTemplate?: string }) => {
      const response = await apiRequest("PATCH", "/api/user-session", data);
      return response.json();
    },
    onError: (error: Error) => {
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
    },
  });

  // Initialize prompt template when data loads
  useEffect(() => {
    if (companiesData?.promptTemplate && !promptTemplate) {
      setPromptTemplate(companiesData.promptTemplate);
    }
  }, [companiesData, promptTemplate]);

  const handleLogout = async () => {
    try {
      await logout();
      toast({
        title: "Success",
        description: "Logged out successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to log out",
        variant: "destructive",
      });
    }
  };

  const handleFileUpload = () => {
    queryClient.invalidateQueries({ queryKey: ["/api/companies"] });
    toast({
      title: "Success",
      description: "Excel file uploaded successfully",
    });
  };

  const handleNextCompany = () => {
    if (companiesData && companiesData.currentIndex < companiesData.companies.length - 1) {
      const newIndex = companiesData.currentIndex + 1;
      updateSessionMutation.mutate(
        { currentCompanyIndex: newIndex },
        {
          onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/companies"] });
            toast({
              title: "Success",
              description: `Moved to company ${newIndex + 1} of ${companiesData.companies.length}`,
            });
          },
          onError: (error) => {
            toast({
              title: "Error",
              description: "Failed to move to next company",
              variant: "destructive",
            });
          }
        }
      );
    } else {
      toast({
        title: "Completed",
        description: "All applications completed!",
      });
    }
  };

  const handlePromptTemplateChange = (newTemplate: string) => {
    setPromptTemplate(newTemplate);
  };

  const handleSavePromptTemplate = (template: string) => {
    updateSessionMutation.mutate({ promptTemplate: template }, {
      onSuccess: () => {
        toast({
          title: "Success",
          description: "Custom prompt template saved successfully",
        });
      },
      onError: () => {
        toast({
          title: "Error",
          description: "Failed to save prompt template",
          variant: "destructive",
        });
      }
    });
  };

  const handlePreviousCompany = () => {
    if (companiesData && companiesData.currentIndex > 0) {
      const newIndex = companiesData.currentIndex - 1;
      updateSessionMutation.mutate(
        { currentCompanyIndex: newIndex },
        {
          onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/companies"] });
            toast({
              title: "Success",
              description: `Moved to company ${newIndex + 1} of ${companiesData.companies.length}`,
            });
          }
        }
      );
    }
  };

  const handleGoToCompany = (index: number) => {
    if (companiesData && index >= 0 && index < companiesData.companies.length) {
      updateSessionMutation.mutate(
        { currentCompanyIndex: index },
        {
          onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/companies"] });
            toast({
              title: "Success",
              description: `Moved to company ${index + 1} of ${companiesData.companies.length}`,
            });
          }
        }
      );
    }
  };

  const currentCompany = companiesData?.companies[companiesData.currentIndex];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-slate-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Navigation Header */}
      <nav className="bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <FileText className="text-white w-4 h-4" />
              </div>
              <h1 className="text-xl font-semibold text-slate-900">CoverLetter AI</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center">
                  <User className="text-slate-600 w-4 h-4" />
                </div>
                <span className="text-sm text-slate-700">{user?.name || 'User'}</span>
              </div>
              <Button variant="ghost" onClick={handleLogout}>
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* File Upload Section */}
        <FileUpload onFileUpload={handleFileUpload} />

        {/* Main Workflow Section */}
        {companiesData?.companies && companiesData.companies.length > 0 && (
          <div className="space-y-8">
            {/* Progress Indicator */}
            <ProgressIndicator 
              currentIndex={companiesData.currentIndex}
              totalCompanies={companiesData.companies.length}
              onPreviousCompany={handlePreviousCompany}
              onNextCompany={handleNextCompany}
            />

            {/* Current Company Information */}
            {currentCompany && (
              <CompanyCard company={currentCompany} />
            )}

            {/* Prompt Template Section */}
            <PromptEditor 
              template={promptTemplate}
              onTemplateChange={handlePromptTemplateChange}
              onSaveTemplate={handleSavePromptTemplate}
              company={currentCompany}
              isSaving={updateSessionMutation.isPending}
            />

            {/* AI Generation Section */}
            {currentCompany && (
              <CoverLetterGenerator 
                company={currentCompany}
                promptTemplate={promptTemplate}
                onNextCompany={handleNextCompany}
              />
            )}
          </div>
        )}
      </main>
    </div>
  );
}
