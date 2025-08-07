import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UserPlus, Eye, EyeOff, Shield, RefreshCw } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

export default function Register() {
  const [, setLocation] = useLocation();
  const { register, isRegisterPending } = useAuth();
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
  });
  const [captcha, setCaptcha] = useState({ num1: 0, num2: 0, answer: 0 });
  const [captchaInput, setCaptchaInput] = useState("");
  const [captchaValid, setCaptchaValid] = useState(false);

  // Generate new captcha
  const generateCaptcha = () => {
    const num1 = Math.floor(Math.random() * 10) + 1;
    const num2 = Math.floor(Math.random() * 10) + 1;
    const answer = num1 + num2;
    setCaptcha({ num1, num2, answer });
    setCaptchaInput("");
    setCaptchaValid(false);
  };

  // Initialize captcha on component mount
  useEffect(() => {
    generateCaptcha();
  }, []);

  // Validate captcha input
  useEffect(() => {
    const inputNumber = parseInt(captchaInput);
    setCaptchaValid(!isNaN(inputNumber) && inputNumber === captcha.answer);
  }, [captchaInput, captcha.answer]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate captcha before proceeding
    if (!captchaValid) {
      toast({
        title: "Captcha Error",
        description: "Please solve the captcha correctly",
        variant: "destructive",
      });
      generateCaptcha(); // Generate new captcha on failure
      return;
    }

    try {
      await register(formData);
      toast({
        title: "Success",
        description: "Account created successfully!",
      });
      setLocation("/");
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Registration failed",
        variant: "destructive",
      });
      generateCaptcha(); // Generate new captcha on registration failure
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardContent className="p-8">
          <div className="text-center mb-8">
            <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center mx-auto mb-4">
              <UserPlus className="text-white w-6 h-6" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Create Account</h2>
            <p className="text-slate-600">Get started with your personalized cover letters</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="name" className="text-sm font-medium text-slate-700">Full Name</Label>
              <Input
                id="name"
                name="name"
                type="text"
                required
                className="mt-2"
                placeholder="John Doe"
                value={formData.name}
                onChange={handleInputChange}
              />
            </div>

            <div>
              <Label htmlFor="email" className="text-sm font-medium text-slate-700">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                required
                className="mt-2"
                placeholder="your@email.com"
                value={formData.email}
                onChange={handleInputChange}
              />
            </div>

            <div>
              <Label htmlFor="phone" className="text-sm font-medium text-slate-700">Phone Number</Label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                className="mt-2"
                placeholder="+1 (555) 000-0000"
                value={formData.phone}
                onChange={handleInputChange}
              />
            </div>
            
            <div>
              <Label htmlFor="password" className="text-sm font-medium text-slate-700">Password</Label>
              <div className="relative mt-2">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleInputChange}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 p-0"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            {/* Captcha verification */}
            <div className="space-y-2">
              <Label htmlFor="captcha" className="text-sm font-medium text-foreground">
                Security Verification
              </Label>
              <div className="bg-muted/30 border-2 border-accent/20 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <Shield className="text-primary w-5 h-5" />
                    <span className="text-lg font-mono font-semibold text-foreground">
                      {captcha.num1} + {captcha.num2} = ?
                    </span>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={generateCaptcha}
                    className="h-8 w-8 p-0"
                  >
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                </div>
                <Input
                  id="captcha"
                  type="number"
                  placeholder="Enter the sum"
                  value={captchaInput}
                  onChange={(e) => setCaptchaInput(e.target.value)}
                  className={`${
                    captchaInput && (captchaValid ? "border-green-500" : "border-red-500")
                  }`}
                />
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full bg-primary hover:bg-blue-700"
              disabled={isRegisterPending || !captchaValid}
            >
              {isRegisterPending ? "Creating Account..." : "Create Account"}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <Link href="/login">
              <Button variant="link" className="text-primary hover:text-blue-700">
                Already have an account? Sign in
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
