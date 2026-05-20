"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/providers/language-provider";
import { useApi } from "@/hooks/use-api";
import { authService } from "@/services/auth.service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { cn, validateSaudiId } from "@/lib/utils";
import { showToast } from "@/lib/toast";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

type AuthType = 'phone' | 'id_number';

export function PhoneVerificationForm() {
  const { t } = useLanguage();
  const router = useRouter();
  const [authType, setAuthType] = useState<AuthType>('phone');
  const [identity, setIdentity] = useState("");
  const [formErrors, setFormErrors] = useState<{ identity?: string }>({});

  const { execute: sendOtp, isLoading, error } = useApi(
    () => {
      let cleanIdentity = identity.replace(/\s+/g, '');
      if (authType === 'phone') {
        cleanIdentity = "+966" + cleanIdentity;
      }
      return authService.sendOtp({ 
        identity: cleanIdentity,
        type: authType
      });
    },
    {
      onSuccess: (response) => {
        showToast.success(t('auth.otpSent'));
        const cleanIdentity = authType === 'phone' ? 
          "+966" + identity.replace(/\s+/g, '') : 
          identity.replace(/\s+/g, '');
        
        // Store all necessary data in session storage
        sessionStorage.setItem('verifyIdentity', cleanIdentity);
        sessionStorage.setItem('verifyType', authType);
        sessionStorage.setItem('verificationToken', response.data.token);
        sessionStorage.setItem('tokenExpiresAt', response.data.expires_at);
        
        router.push("/verify-otp");
      },
      onError: (error) => {
        showToast.error(error.message || t('auth.errors.otpSendFailed'));
      },
    }
  );

  const validateForm = (): boolean => {
    const errors: typeof formErrors = {};
    
    if (!identity) {
      errors.identity = authType === 'phone' ? 
        t('auth.errors.phoneRequired') : 
        t('auth.errors.idNumberRequired');
    } else if (authType === 'phone') {
      // Saudi Arabia phone number validation
      const saudiRegex = /^5[0-9]{8}$/;
      if (!saudiRegex.test(identity.replace(/\s+/g, ''))) {
        errors.identity = t('auth.errors.invalidPhone');
      }
    } else {
      // ID number validation
      if (!validateSaudiId(identity.replace(/\s+/g, ''))) {
        errors.identity = t('auth.errors.invalidIdNumber');
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleIdentityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;
    
    // Remove any non-digit characters
    value = value.replace(/\D/g, '');
    
    if (authType === 'phone') {
      // Remove leading 966 or 05 if present
      value = value.replace(/^(966|05)/, '');
      
      // Ensure starts with 5 if there are any digits
      if (value.length > 0 && !value.startsWith('5')) {
        value = '5' + value;
      }
      
      // Limit to 9 digits (5XXXXXXXX)
      value = value.slice(0, 9);
      
      // Format with spaces for readability (5X XXX XXXX)
      if (value.length > 0) {
        value = value.match(/.{1,1}|.+/g)!.join('') // First digit
        if (value.length > 1) {
          value = value.slice(0, 1) + ' ' + value.slice(1).match(/.{1,3}|.+/g)!.join(' ');
        }
      }
    } else {
      // Limit to 10 digits for ID number
      value = value.slice(0, 10);
    }
    
    setIdentity(value);
    if (formErrors.identity) {
      setFormErrors({});
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full space-y-6"
    >
      <div className="flex flex-col space-y-2 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">
          {t('auth.login')}
        </h1>
        <p className="text-sm text-muted-foreground">
          {t('auth.otpWillBeSent')}
        </p>
      </div>

      <Tabs
        value={authType}
        onValueChange={(value) => {
          setAuthType(value as AuthType);
          setIdentity('');
          setFormErrors({});
        }}
        className="w-full"
      >
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="phone">{t('auth.phoneNumber')}</TabsTrigger>
          <TabsTrigger value="id_number">{t('auth.idNumber')}</TabsTrigger>
        </TabsList>
      </Tabs>

      <AnimatePresence mode="wait">
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="rounded-md bg-destructive/15 p-3 text-sm text-destructive"
          >
            {error.message}
          </motion.div>
        )}
      </AnimatePresence>

      <form onSubmit={(e) => {
        e.preventDefault();
        if (validateForm()) {
          sendOtp();
        }
      }} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="identity">
            {authType === 'phone' ? t('auth.phoneNumber') : t('auth.idNumber')}
          </Label>
          <div className="relative">
            {authType === 'phone' && (
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground pointer-events-none">
                +966
              </div>
            )}
            <Input
              id="identity"
              type="tel"
              placeholder={authType === 'phone' ? "5X XXX XXXX" : "1XXXXXXXXX"}
              value={identity}
              onChange={handleIdentityChange}
              disabled={isLoading}
              className={cn(
                "transition-all duration-200 focus:ring-2 focus:ring-primary text-lg tracking-wide",
                authType === 'phone' && "pl-14",
                formErrors.identity && "border-destructive focus:ring-destructive"
              )}
              aria-invalid={!!formErrors.identity}
              aria-describedby={formErrors.identity ? "identity-error" : undefined}
              dir="ltr"
            />
          </div>
          {formErrors.identity && (
            <motion.p
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              id="identity-error"
              className="text-sm text-destructive mt-1"
            >
              {formErrors.identity}
            </motion.p>
          )}
        </div>

        <Button
          type="submit"
          className="w-full"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {t('auth.sendingOtp')}
            </>
          ) : (
            t('auth.sendOtp')
          )}
        </Button>
      </form>
    </motion.div>
  );
} 