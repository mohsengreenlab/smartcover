import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CloudUpload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";

interface FileUploadProps {
  onFileUpload: () => void;
}

export default function FileUpload({ onFileUpload }: FileUploadProps) {
  const { toast } = useToast();
  const [isDragOver, setIsDragOver] = useState(false);

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch('/api/upload-excel', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Upload failed');
      }

      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Success",
        description: `Successfully uploaded ${data.totalCompanies} companies`,
      });
      onFileUpload();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Upload failed",
        variant: "destructive",
      });
    },
  });

  const handleFileSelect = (file: File) => {
    if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
      toast({
        title: "Error",
        description: "Please select an Excel file (.xlsx or .xls)",
        variant: "destructive",
      });
      return;
    }

    uploadMutation.mutate(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  return (
    <Card className="mb-8">
      <div className="p-6 border-b border-slate-200">
        <h2 className="text-lg font-semibold text-slate-900 mb-2">Upload Company Data</h2>
        <p className="text-sm text-slate-600">Upload an Excel file (.xlsx) with company information for personalized cover letters</p>
      </div>
      
      <CardContent className="p-6">
        <div 
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            isDragOver ? 'border-primary bg-primary/5' : 'border-slate-300 hover:border-primary'
          }`}
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          onDragEnter={() => setIsDragOver(true)}
          onDragLeave={() => setIsDragOver(false)}
        >
          <CloudUpload className="text-slate-400 w-12 h-12 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-900 mb-2">Drop your Excel file here</h3>
          <p className="text-sm text-slate-600 mb-4">or click to browse</p>
          <input 
            type="file" 
            accept=".xlsx,.xls" 
            className="hidden" 
            id="fileInput"
            onChange={handleFileInputChange}
          />
          <Button 
            onClick={() => document.getElementById('fileInput')?.click()}
            disabled={uploadMutation.isPending}
          >
            {uploadMutation.isPending ? "Uploading..." : "Choose File"}
          </Button>
        </div>

        {/* File format requirements */}
        <div className="mt-6 bg-slate-50 rounded-lg p-4">
          <h4 className="font-medium text-slate-900 mb-3">Required Excel Format:</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 bg-green-100 text-green-600 rounded flex items-center justify-center text-xs font-mono">A</div>
              <span className="text-slate-600">Company Name</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded flex items-center justify-center text-xs font-mono">B</div>
              <span className="text-slate-600">Application Link</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 bg-purple-100 text-purple-600 rounded flex items-center justify-center text-xs font-mono">C</div>
              <span className="text-slate-600">Job Description</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 bg-orange-100 text-orange-600 rounded flex items-center justify-center text-xs font-mono">D</div>
              <span className="text-slate-600">Job Title</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
