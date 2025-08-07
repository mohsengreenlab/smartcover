import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { FileText, Zap, Target, Shield } from "lucide-react";
import { Link } from "wouter";

export default function Landing() {
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
              <Link href="/login">
                <Button variant="ghost">Sign In</Button>
              </Link>
              <Link href="/register">
                <Button>Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-bold text-slate-900 mb-6">
            Personalized Cover Letters
            <span className="text-primary block">Powered by AI</span>
          </h1>
          <p className="text-xl text-slate-600 mb-8 max-w-3xl mx-auto">
            Upload your job application data and let our AI generate customized cover letters for each company. 
            Save time while maintaining personal touch in every application.
          </p>
          <Link href="/register">
            <Button size="lg" className="bg-primary hover:bg-blue-700">
              Start Creating Cover Letters
            </Button>
          </Link>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          <Card>
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                <FileText className="text-primary w-6 h-6" />
              </div>
              <h3 className="font-semibold text-slate-900 mb-2">Excel Upload</h3>
              <p className="text-sm text-slate-600">Simply upload your Excel file with company data and job details</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Zap className="text-primary w-6 h-6" />
              </div>
              <h3 className="font-semibold text-slate-900 mb-2">AI Generation</h3>
              <p className="text-sm text-slate-600">Powered by Google Gemini AI for high-quality, personalized content</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Target className="text-primary w-6 h-6" />
              </div>
              <h3 className="font-semibold text-slate-900 mb-2">Customizable</h3>
              <p className="text-sm text-slate-600">Edit prompt templates to match your experience and style</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Shield className="text-primary w-6 h-6" />
              </div>
              <h3 className="font-semibold text-slate-900 mb-2">Secure</h3>
              <p className="text-sm text-slate-600">Your data is encrypted and secure with captcha protection</p>
            </CardContent>
          </Card>
        </div>

        {/* How it works */}
        <div className="text-center">
          <h2 className="text-3xl font-bold text-slate-900 mb-12">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="space-y-4">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto text-white text-xl font-bold">1</div>
              <h3 className="text-xl font-semibold text-slate-900">Upload Excel File</h3>
              <p className="text-slate-600">Upload your company data with job descriptions and application links</p>
            </div>
            <div className="space-y-4">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto text-white text-xl font-bold">2</div>
              <h3 className="text-xl font-semibold text-slate-900">Generate Cover Letters</h3>
              <p className="text-slate-600">Our AI creates personalized cover letters for each company</p>
            </div>
            <div className="space-y-4">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto text-white text-xl font-bold">3</div>
              <h3 className="text-xl font-semibold text-slate-900">Apply & Track</h3>
              <p className="text-slate-600">Copy your cover letter and apply directly through company links</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
