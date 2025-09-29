import React, { useState, useRef, useEffect } from 'react';

interface LoginPageProps {
  onLoginSuccess: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState<string[]>(['', '', '', '']);
  const [generatedCode, setGeneratedCode] = useState<string | null>(null);
  const [step, setStep] = useState<'phone' | 'code'>('phone');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const codeInputsRef = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (step === 'code') {
      codeInputsRef.current[0]?.focus();
    }
  }, [step]);

  const handlePhoneSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^\d{11}$/.test(phone)) {
      setError('يرجى إدخال رقم هاتف صحيح مكون من 11 رقمًا.');
      return;
    }
    setError('');
    setIsLoading(true);

    const randomCode = Math.floor(1000 + Math.random() * 9000).toString();
    setGeneratedCode(randomCode);

    // Simulate sending for a moment to provide feedback
    setTimeout(() => {
      const message = `كود الدخول لتطبيق الفادي: ${randomCode}`;
      const url = `https://wa.me/2${phone}?text=${encodeURIComponent(message)}`;
      window.open(url, '_blank');
      
      setIsLoading(false);
      setStep('code');
    }, 1000);
  };

  const handleCodeChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return; // Only allow digits

    const newCode = [...code];
    newCode[index] = value.slice(-1); // Only take the last digit
    setCode(newCode);

    // Move to next input
    if (value && index < 3) {
      codeInputsRef.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      codeInputsRef.current[index - 1]?.focus();
    }
  };

  const handleCodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const enteredCode = code.join('');
    if (enteredCode.length !== 4) {
      setError('يرجى إدخال الكود المكون من 4 أرقام.');
      return;
    }

    if (enteredCode === generatedCode) {
      setError('');
      onLoginSuccess();
    } else {
      setError('الكود الذي أدخلته غير صحيح. يرجى المحاولة مرة أخرى.');
    }
  };

  const handleResendCode = () => {
    setCode(['', '', '', '']);
    setStep('phone');
    setError('');
    setGeneratedCode(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center p-4">
      <div className="max-w-md w-full bg-white shadow-xl rounded-2xl p-8 space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-blue-600 mb-2">دفتر حسابات الفادي</h1>
          <p className="text-gray-500">مرحباً بك! يرجى تسجيل الدخول للمتابعة.</p>
        </div>

        {step === 'phone' && (
          <form onSubmit={handlePhoneSubmit} className="space-y-6 animate-fade-in">
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                رقم التليفون (واتساب)
              </label>
              <input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-lg text-center tracking-widest"
                placeholder="01xxxxxxxxx"
                required
                pattern="\d{11}"
                maxLength={11}
              />
            </div>
            {error && <p className="text-red-500 text-sm text-center">{error}</p>}
            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-lg font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-300 transition-colors"
              >
                {isLoading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : (
                  'إرسال كود الدخول'
                )}
              </button>
            </div>
          </form>
        )}

        {step === 'code' && (
          <form onSubmit={handleCodeSubmit} className="space-y-6 animate-fade-in">
            <div className="text-center">
                <p className="text-gray-600">تم إرسال كود من 4 أرقام إلى واتساب على الرقم:</p>
                <p className="font-bold text-lg text-gray-800" dir="ltr">{phone}</p>
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 text-center mb-2">
                    أدخل الكود
                </label>
                <div className="flex justify-center gap-2" dir="ltr">
                {code.map((digit, index) => (
                    <input
                    key={index}
// FIX: Changed the ref callback from an implicit return to a block statement to ensure it returns void, resolving the TypeScript type error.
                    ref={(el) => { codeInputsRef.current[index] = el; }}
                    type="tel"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleCodeChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    className="w-16 h-16 text-center text-3xl font-bold border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                    />
                ))}
                </div>
            </div>
            {error && <p className="text-red-500 text-sm text-center">{error}</p>}
            <div>
              <button
                type="submit"
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-lg font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
              >
                تسجيل الدخول
              </button>
            </div>
            <div className="text-center">
                <button type="button" onClick={handleResendCode} className="text-sm text-blue-600 hover:underline">
                    لم تستلم الكود؟ إرسال مرة أخرى أو تغيير الرقم
                </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
