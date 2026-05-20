"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/providers/language-provider";
import { useApi } from "@/hooks/use-api";
import { authService } from "@/services/auth.service";
import { Label } from "@/components/ui/label";
import { Loader2, Timer } from "lucide-react";
import { REGEXP_ONLY_DIGITS } from "input-otp";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp"
import { showToast } from "@/lib/toast";
import { cn } from "@/lib/utils";
import moment from 'moment';
import { useUser } from "@/stores/user.store";

interface VerificationState {
  identity: string;
  identityType: 'phone' | 'id_number';
  token: string;
}

export function OtpVerificationForm() {
  const { t } = useLanguage();
  const router = useRouter();
  const [otp, setOtp] = useState("");
  const [verificationState, setVerificationState] = useState<VerificationState>({
    identity: '',
    identityType: 'phone',
    token: ''
  });
  const [formErrors, setFormErrors] = useState<{ otp?: string }>({});
  const [countdown, setCountdown] = useState(30); // 30 seconds countdown
  const [canResend, setCanResend] = useState(false);

  useEffect(() => {
    const storedIdentity = sessionStorage.getItem('verifyIdentity');
    const storedType = sessionStorage.getItem('verifyType');
    const storedToken = sessionStorage.getItem('verificationToken');
    const expiresAt = sessionStorage.getItem('tokenExpiresAt');
    
    if (!storedIdentity || !storedToken || !storedType) {
      router.replace('/login');
      return;
    }
    
    setVerificationState({
      identity: storedIdentity,
      identityType: storedType as 'phone' | 'id_number',
      token: storedToken
    });

    // Calculate remaining time using moment
    if (expiresAt) {
      const expirationMoment = moment(expiresAt);
      const currentMoment = moment();
      const remainingSeconds = Math.max(0, expirationMoment.diff(currentMoment, 'seconds'));
      
      if (remainingSeconds > 0) {
        setCountdown(remainingSeconds);
        setCanResend(false);
      } else {
        setCountdown(0);
        setCanResend(true);
      }
    }
  }, [router]);

  // Countdown timer effect
  useEffect(() => {
    if (countdown > 0) {
      const timer = setInterval(() => {
        setCountdown(prev => {
          const newCount = prev - 1;
          if (newCount <= 0) {
            setCanResend(true);
            return 0;
          }
          return newCount;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [countdown]);

  // Format countdown time to display minutes and seconds
  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const { execute: verifyOtp, isLoading, error } = useApi(
    () => authService.verifyOtp({ 
      token: verificationState.token,
      code: otp 
    }),
    {
      onSuccess: async (response) => {
        try {
          // Store the token
          const token = response.data.data;
          document.cookie = `token=${token}; path=/; max-age=31536000`; // 1 year expiry
          
          // Fetch user data immediately after successful verification
          const meResponse = await authService.me();
          // Update user in the store
          useUser.getState().setUser(meResponse.data);
          
          showToast.success(t('auth.verificationSuccess'));
          
          // Clear verification data
          sessionStorage.removeItem('verifyIdentity');
          sessionStorage.removeItem('verifyType');
          sessionStorage.removeItem('verificationToken');
          sessionStorage.removeItem('tokenExpiresAt');
          
          router.push("/dashboard");
        } catch (error) {
          console.log(error)
          showToast.error(t('auth.errors.userDataFetchFailed'));
        }
      },
      onError: (error) => {
        showToast.error(error.message || t('auth.errors.verificationFailed'));
        setOtp(""); // Clear the OTP on error
        setFormErrors({ otp: error.message || t('auth.errors.verificationFailed') });
      },
    }
  );

  const handleOtpChange = (value: string) => {
    const digitsOnly = value.replace(/\D/g, '');
    setOtp(digitsOnly);
    
    // Clear any existing errors when user starts typing again
    if (formErrors.otp) {
      setFormErrors({});
    }
  };

  // Updated complete handler with validation
  const handleComplete = (value: string) => {
    // Clear any existing errors first
    setFormErrors({});

    // Validate OTP format
    if (!/^\d{4}$/.test(value)) {
      setFormErrors({ otp: t('auth.errors.invalidOtp') });
      return;
    }

    // Only proceed if we're not already loading and have no errors
    if (!isLoading && !formErrors.otp) {
      try {
        verifyOtp();
      } catch (err) {
        // This catch block handles any synchronous errors
        console.error('OTP verification error:', err);
        setFormErrors({ otp: t('auth.errors.verificationFailed') });
      }
    }
  };

  const handleResendOtp = async () => {
    if (!canResend) return;
    
    try {
      const response = await authService.resendOtp({ 
        token: verificationState.token
      });

      // Update with new token and expiration using moment
      const { token, expires_at } = response.data;
      sessionStorage.setItem('verificationToken', token);
      sessionStorage.setItem('tokenExpiresAt', expires_at);
      setVerificationState(prev => ({ ...prev, token }));
      setOtp("");

      // Reset countdown based on new expiration time using moment
      const expirationMoment = moment(expires_at);
      const currentMoment = moment();
      const remainingSeconds = Math.max(0, expirationMoment.diff(currentMoment, 'seconds'));
      setCountdown(remainingSeconds);
      setCanResend(false);

      showToast.success(t('auth.toasts.otpResent'));
    } catch (error: unknown) {
      const errorMessage = error instanceof Error 
        ? error.message 
        : t('auth.errors.otpResendFailed');
      showToast.error(errorMessage);
    }
  };

  const handleBackToLogin = () => {
    // Clear all verification related storage
    sessionStorage.removeItem('verifyIdentity');
    sessionStorage.removeItem('verifyType');
    sessionStorage.removeItem('verificationToken');
    sessionStorage.removeItem('tokenExpiresAt');
    router.push('/login');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-md mx-auto space-y-8 p-4"
    >
      <div className="flex flex-col space-y-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="space-y-2"
        >
          <h1 className="text-2xl font-bold tracking-tight">
            {t('auth.verifyOtp')}
          </h1>
          <p className="text-sm text-muted-foreground/80">
            {t('auth.otpSentTo')}
          </p>
          <p className="text-base font-medium text-foreground bg-muted/50 py-1 px-3 rounded-md inline-block" dir="ltr">
            {verificationState.identity}
          </p>
        </motion.div>
      </div>

      <AnimatePresence mode="wait">
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="rounded-lg bg-destructive/10 border border-destructive/20 p-4 text-sm text-destructive text-center shadow-sm"
          >
            <div className="flex items-center justify-center gap-2">
              <div className="h-1.5 w-1.5 rounded-full bg-destructive animate-pulse" />
              {error.message}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <form className="space-y-8">
        <div className="space-y-6">
          <Label htmlFor="otp" className="text-center block text-base font-medium">
            {t('auth.enterOtp')}
          </Label>
          <div className="flex justify-center" dir="ltr">
            <InputOTP
              maxLength={4}
              value={otp}
              onChange={handleOtpChange}
              onComplete={handleComplete}
              pattern={REGEXP_ONLY_DIGITS}
              className="gap-3"
              inputMode="numeric"
              autoComplete="one-time-code"
              disabled={isLoading}
            >
              <InputOTPGroup>
                {Array.from({ length: 4 }).map((_, idx) => (
                  <InputOTPSlot
                    key={idx}
                    index={idx}
                    className={cn(
                      "w-14 h-14", // Increased size
                      "text-center text-2xl font-bold",
                      "border-2 rounded-xl",
                      "bg-background/50",
                      "transition-all duration-200",
                      "focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/30",
                      "hover:border-primary/50",
                      isLoading && "opacity-50 cursor-not-allowed",
                      formErrors.otp && "border-destructive focus-within:ring-destructive/30",
                    )}
                  />
                ))}
              </InputOTPGroup>
            </InputOTP>
          </div>
          {formErrors.otp && (
            <motion.p
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              id="otp-error"
              className="text-sm text-destructive mt-1 text-center"
            >
              {formErrors.otp}
            </motion.p>
          )}
        </div>

        <div className="space-y-4">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-muted-foreground/20" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground/60">
                {t('auth.orContinueWith')}
              </span>
            </div>
          </div>

          <div className="flex flex-col items-center gap-3">
            <motion.button
              type="button"
              onClick={handleResendOtp}
              whileHover={{ scale: canResend ? 1.02 : 1 }}
              whileTap={{ scale: canResend ? 0.98 : 1 }}
              className={cn(
                "flex items-center gap-2 px-6 py-2.5 rounded-lg transition-all",
                "text-sm font-medium",
                "border border-transparent",
                canResend
                  ? "text-primary hover:bg-primary/5 hover:border-primary/20"
                  : "text-muted-foreground/60 cursor-not-allowed"
              )}
              disabled={!canResend || isLoading}
            >
              {canResend ? (
                t('auth.resendOtp')
              ) : (
                <div className="flex items-center gap-2">
                  <Timer className="h-4 w-4 animate-pulse" />
                  <span className="tabular-nums font-medium">
                    {formatTime(countdown)}
                  </span>
                </div>
              )}
            </motion.button>

            <button
              type="button"
              onClick={handleBackToLogin}
              className="text-sm text-muted-foreground/60 hover:text-foreground transition-colors underline-offset-4 hover:underline"
            >
              {t('auth.tryDifferentLogin')}
            </button>
          </div>
        </div>
      </form>

      {isLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center justify-center gap-2 text-sm text-muted-foreground/80 bg-muted/30 py-2 px-4 rounded-lg shadow-sm"
        >
          <Loader2 className="h-4 w-4 animate-spin" />
          {t('auth.verifying')}
        </motion.div>
      )}
    </motion.div>
  );
} 