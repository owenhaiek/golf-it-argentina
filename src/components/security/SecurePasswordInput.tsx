
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { validatePassword } from '@/utils/security';
import { Eye, EyeOff, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SecurePasswordInputProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
  showStrengthIndicator?: boolean;
  required?: boolean;
}

export const SecurePasswordInput = ({
  value,
  onChange,
  label = "Password",
  placeholder = "Enter password",
  showStrengthIndicator = true,
  required = false
}: SecurePasswordInputProps) => {
  const [showPassword, setShowPassword] = useState(false);
  const passwordValidation = validatePassword(value);

  const getStrengthColor = () => {
    if (value.length === 0) return 'bg-gray-200';
    if (passwordValidation.isValid) return 'bg-green-500';
    if (value.length >= 6) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getStrengthText = () => {
    if (value.length === 0) return '';
    if (passwordValidation.isValid) return 'Strong';
    if (value.length >= 6) return 'Medium';
    return 'Weak';
  };

  return (
    <div className="space-y-2">
      <Label htmlFor="password">{label}{required && ' *'}</Label>
      <div className="relative">
        <Input
          id="password"
          type={showPassword ? 'text' : 'password'}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          required={required}
          className="pr-10"
        />
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
          onClick={() => setShowPassword(!showPassword)}
        >
          {showPassword ? (
            <EyeOff className="h-4 w-4" />
          ) : (
            <Eye className="h-4 w-4" />
          )}
        </Button>
      </div>
      
      {showStrengthIndicator && value.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className={`h-full transition-all duration-300 ${getStrengthColor()}`}
                style={{ 
                  width: passwordValidation.isValid ? '100%' : 
                         value.length >= 6 ? '66%' : 
                         value.length >= 3 ? '33%' : '0%' 
                }}
              />
            </div>
            <span className="text-sm font-medium">{getStrengthText()}</span>
          </div>
          
          {!passwordValidation.isValid && (
            <div className="space-y-1">
              {passwordValidation.errors.map((error, index) => (
                <div key={index} className="flex items-center gap-2 text-sm">
                  <X className="h-3 w-3 text-red-500" />
                  <span className="text-red-600">{error}</span>
                </div>
              ))}
            </div>
          )}
          
          {passwordValidation.isValid && (
            <div className="flex items-center gap-2 text-sm">
              <Check className="h-3 w-3 text-green-500" />
              <span className="text-green-600">Password meets all requirements</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
