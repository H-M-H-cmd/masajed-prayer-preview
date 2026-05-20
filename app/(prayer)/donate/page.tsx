"use client";

import * as React from "react";
import { useLanguage } from "@/providers/language-provider";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { donationService, DonationData } from "@/services/v-2/prayer/donation.service";
import {
  Target,
  Wrench,
  Share2,
  Clock,
  AlertTriangle,
  ArrowRight,
  HandHeart,
  Loader2,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useCallback, useEffect, useState } from "react";
import { Progress } from "@/components/ui/progress";
import { formatCurrency } from "@/lib/format";
import { showToast } from "@/lib/toast";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import Link from "next/link";
import Image from "next/image";
import { SaudiRiyal } from "@/components/ui/saudi-riyal";

// Update the QUICK_AMOUNTS definition and its type
interface QuickAmount {
  amount: number;
  label: string;
}

// Add this component for the donation form
const DonationForm = ({
  amount,
  setAmount,
  message,
  setMessage,
  isAnonymous,
  setIsAnonymous,
  quickAmounts,
  selectedQuickAmount,
  setSelectedQuickAmount,
  isSubmitting,
  onSubmit,
  onClose,
  title,
  description,
  showProgress,
  currentAmount,
  targetAmount,
}: {
  amount: number;
  setAmount: (amount: number) => void;
  message: string;
  setMessage: (message: string) => void;
  isAnonymous: boolean;
  setIsAnonymous: (isAnonymous: boolean) => void;
  quickAmounts: QuickAmount[];
  selectedQuickAmount: number | null;
  setSelectedQuickAmount: (amount: number | null) => void;
  isSubmitting: boolean;
  onSubmit: () => void;
  onClose: () => void;
  title: string;
  description: string;
  showProgress?: boolean;
  currentAmount?: number;
  targetAmount?: number;
}) => {
  const { t, language } = useLanguage();

  return (
    <div className="mx-auto w-full max-w-lg flex flex-col h-full">
      <DrawerHeader>
        <DrawerTitle>{title}</DrawerTitle>
        <DrawerDescription>{description}</DrawerDescription>
      </DrawerHeader>

      <div className="flex-1 overflow-y-auto px-4">
        <div className="space-y-6 pb-6">
          {/* Progress Section (if applicable) */}
          {showProgress && currentAmount !== undefined && targetAmount !== undefined && (
            <div className="space-y-2 p-4 bg-muted rounded-lg">
              <div className="flex items-center justify-between text-sm">
                <span>{t('prayer.donate.progress')}</span>
                <span>{Math.round((currentAmount / targetAmount) * 100)}%</span>
              </div>
              <Progress value={(currentAmount / targetAmount) * 100} className="h-2" />
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>{formatCurrency(currentAmount, 'SAR', language)}</span>
                <span>{formatCurrency(targetAmount, 'SAR', language)}</span>
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                {formatCurrency(targetAmount - currentAmount, 'SAR', language)} {t('prayer.donate.remainingTarget')}
              </p>
            </div>
          )}

          {/* Amount Selection */}
          <div className="space-y-4">
            <Label>{t('prayer.donate.supportAmount')}</Label>
            <div className="grid grid-cols-2 gap-2">
              {quickAmounts.map(({ amount: quickAmount, label }) => (
                <Button
                  key={quickAmount}
                  variant={selectedQuickAmount === quickAmount ? "default" : "outline"}
                  onClick={() => {
                    setSelectedQuickAmount(quickAmount);
                    setAmount(quickAmount);
                  }}
                  className="w-full relative overflow-hidden group"
                >
                  <span className="relative z-10">{label}</span>
                  <div className={cn(
                    "absolute inset-0 bg-primary/10 transform transition-transform duration-200",
                    selectedQuickAmount === quickAmount ? "scale-100" : "scale-0 group-hover:scale-100"
                  )} />
                </Button>
              ))}
            </div>
            <div className="relative">
              <Button
                variant={!selectedQuickAmount ? "default" : "outline"}
                onClick={() => {
                  setSelectedQuickAmount(null);
                  setAmount(0);
                }}
                className="w-full mb-2"
              >
                {t('prayer.donate.customAmount')}
              </Button>
              {!selectedQuickAmount && (
                <div className="space-y-2">
                  <Input
                    type="number"
                    min="1"
                    value={amount || ''}
                    onChange={(e) => setAmount(Number(e.target.value))}
                    placeholder="0.00"
                    className="text-lg font-medium"
                  />
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    {t('prayer.donate.minimumAmount')}
                    <SaudiRiyal className="h-4 w-4 inline-block" />
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Message Section */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>{t('prayer.donate.addMessage')}</Label>
              <span className="text-xs text-muted-foreground">
                {t('prayer.donate.messageOptional')}
              </span>
            </div>
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={t('prayer.donate.messagePlaceholder')}
              className="min-h-[100px] resize-none"
            />
          </div>

          {/* Anonymous Option */}
          <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
            <div className="space-y-1">
              <Label>{t('prayer.donate.supportAnonymously')}</Label>
              <p className="text-sm text-muted-foreground">
                {t('prayer.donate.supporterWillNotBeShown')}
              </p>
            </div>
            <Switch
              checked={isAnonymous}
              onCheckedChange={setIsAnonymous}
            />
          </div>
        </div>
      </div>

      <DrawerFooter className="mt-auto border-t bg-background">
        <Button
          onClick={onSubmit}
          disabled={amount <= 0 || isSubmitting}
          className="w-full"
        >
          {isSubmitting ? (
            <div className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              {t('prayer.donate.processing')}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <HandHeart className="h-4 w-4" />
              {t('prayer.donate.confirm')} - {formatCurrency(amount, 'SAR', language)}
            </div>
          )}
        </Button>
        <DrawerClose asChild onClick={onClose}>
          <Button variant="outline" className="w-full">
            {t('common.cancel')}
          </Button>
        </DrawerClose>
      </DrawerFooter>
    </div>
  );
};

export default function DonatePage() {
  const { t, language } = useLanguage();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [donations, setDonations] = useState<DonationData[]>([]);
  const [selectedItem, setSelectedItem] = useState<DonationData | null>(null);
  const [donationAmount, setDonationAmount] = useState<number>(0);
  const [donationMessage, setDonationMessage] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedQuickAmount, setSelectedQuickAmount] = useState<number | null>(null);
  const [showGeneralDonation, setShowGeneralDonation] = useState(false);

  // Update the QUICK_AMOUNTS definition and its type
  const QUICK_AMOUNTS: QuickAmount[] = [
    { amount: 100, label: t('prayer.donate.quickAmounts.low') },
    { amount: 500, label: t('prayer.donate.quickAmounts.medium') },
    { amount: 1000, label: t('prayer.donate.quickAmounts.high') },
    { amount: 5000, label: t('prayer.donate.quickAmounts.veryHigh') }
  ];

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await donationService.getDonations();
      setDonations(response.data);
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleDonate = async () => {
    if (!selectedItem || donationAmount <= 0) return;

    try {
      setIsSubmitting(true);
      await donationService.createDonation({
        amount: donationAmount,
        mosque_id: selectedItem.mosque.id,
        order_id: selectedItem.order_id,
        anonymous: isAnonymous,
        message: donationMessage,
      });

      showToast.success(t('prayer.donate.success'));
      setSelectedItem(null);
      setDonationAmount(0);
      setDonationMessage("");
      setIsAnonymous(false);
      fetchData(); // Refresh the list
    } catch (error) {
      console.error(error);
      showToast.error(t('prayer.donate.error'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const getPriorityBadge = (priority: DonationData['priority']) => {
    switch (priority) {
      case 'urgent':
        return {
          icon: AlertTriangle,
          className: "bg-red-500/10 text-red-500",
          text: t('prayer.donate.urgent')
        };
      case 'priority':
        return {
          icon: Clock,
          className: "bg-orange-500/10 text-orange-500",
          text: t('prayer.donate.priority')
        };
      default:
        return {
          icon: Wrench,
          className: "bg-blue-500/10 text-blue-500",
          text: t('prayer.donate.regular')
        };
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-32" />
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="p-6">
              <div className="space-y-4">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-2 w-full" />
                <div className="flex justify-between">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-20" />
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    showToast.error(error.message || t('prayer.donate.error'));
    return;
  }

  return (
    <div className="space-y-6" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">
          {t('prayer.donate.title')}
        </h2>
        <Button
          variant="outline"
          className="gap-2"
          onClick={() => {
            setShowGeneralDonation(true);
            setSelectedItem(null);
          }}
        >
          <HandHeart className="h-4 w-4" />
          {t('prayer.donate.generalDonation')}
        </Button>
      </div>

      {/* Maintenance Donations List */}
      <div className="space-y-4">
        {donations.length === 0 ? (
          <Card className="p-6 text-center text-muted-foreground">
            <Target className="h-8 w-8 mx-auto mb-2" />
            <p>{t('prayer.donate.noItems')}</p>
          </Card>
        ) : (
          donations.map((donation) => {
            const progress = (donation.current_amount / donation.target_amount) * 100;
            const priority = getPriorityBadge(donation.priority);
            const PriorityIcon = priority.icon;

            return (
              <Card key={donation.id} className="p-6 space-y-4">
                {donation.image && (
                  <div className="aspect-video rounded-lg overflow-hidden relative">
                    <Image
                      src={donation.image}
                      alt={donation.title}
                      fill
                      className="object-cover"
                    />
                    {donation.remaining_days && (
                      <div className="absolute top-2 right-2 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
                        {donation.remaining_days} {t('prayer.donate.days')}
                      </div>
                    )}
                  </div>
                )}

                <div className="space-y-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <h3 className="font-medium">{donation.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        {donation.description}
                      </p>
                    </div>
                    <Badge 
                      variant="secondary" 
                      className={cn(
                        "flex items-center gap-1",
                        priority.className
                      )}
                    >
                      <PriorityIcon className="h-3 w-3" />
                      {priority.text}
                    </Badge>
                  </div>

                  <div className="space-y-2">
                    <Progress value={progress} className="h-2" />
                    <div className={cn("flex items-center justify-between text-sm", language === 'ar' ? "flex-row-reverse" : "flex-row")}>
                      <span className="text-muted-foreground" >
                        {formatCurrency(donation.current_amount, 'SAR', language)} / {formatCurrency(donation.target_amount, 'SAR', language)}
                      </span>
                      <span className="text-muted-foreground">
                        {Math.round(progress)}%
                      </span>
                    </div>
                  </div>

                  {donation.recent_donors && donation.recent_donors.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-sm font-medium">
                        {t('prayer.donate.recentDonors')}
                      </p>
                      <div className="space-y-2">
                        {donation.recent_donors.map((donor, index) => (
                          <div 
                            key={index}
                            className="flex items-center justify-between text-sm"
                          >
                            <span className="text-muted-foreground">
                              {donor.is_anonymous ? t('prayer.donate.anonymous') : donor.name}
                            </span>
                            <span className="font-medium">
                              {formatCurrency(donor.amount, 'SAR', language)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Button 
                      className="flex-1"
                      onClick={() => setSelectedItem(donation)}
                    >
                      {t('prayer.donate.donateNow')}
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => {/* Handle share */}}
                    >
                      <Share2 className="h-4 w-4" />
                    </Button>
                    <Link href={`/issues/${donation.order_id}`}>
                      <Button
                        variant="outline"
                        size="icon"
                      >
                        <ArrowRight className={cn(
                          "h-4 w-4",
                          language === 'ar' && "rotate-180"
                        )} />
                      </Button>
                    </Link>
                  </div>
                </div>
              </Card>
            );
          })
        )}
      </div>

      {/* General Donation Drawer */}
      <Drawer 
        open={showGeneralDonation} 
        onOpenChange={setShowGeneralDonation}
      >
        <DrawerContent className="h-[90vh] flex flex-col">
          <DonationForm
            amount={donationAmount}
            setAmount={setDonationAmount}
            message={donationMessage}
            setMessage={setDonationMessage}
            isAnonymous={isAnonymous}
            setIsAnonymous={setIsAnonymous}
            quickAmounts={QUICK_AMOUNTS}
            selectedQuickAmount={selectedQuickAmount}
            setSelectedQuickAmount={setSelectedQuickAmount}
            isSubmitting={isSubmitting}
            onSubmit={async () => {
              try {
                setIsSubmitting(true);
                await donationService.createDonation({
                  amount: donationAmount,
                  mosque_id: "1",
                  order_id: "general",
                  anonymous: isAnonymous,
                  message: donationMessage,
                });
                showToast.success(t('prayer.donate.generalSuccess'));
                setShowGeneralDonation(false);
                setDonationAmount(0);
                setDonationMessage("");
                setIsAnonymous(false);
              } catch (error) {
                console.error(error);
                showToast.error(t('prayer.donate.error'));
              } finally {
                setIsSubmitting(false);
              }
            }}
            onClose={() => setShowGeneralDonation(false)}
            title={t('prayer.donate.generalDonation')}
            description={t('prayer.donate.generalDonationDescription')}
          />
        </DrawerContent>
      </Drawer>

      {/* Specific Donation Drawer */}
      <Drawer 
        open={!!selectedItem} 
        onOpenChange={(open) => {
          if (!open) {
            setSelectedItem(null);
            setSelectedQuickAmount(null);
            setDonationAmount(0);
          }
        }}
      >
        <DrawerContent className="h-[90vh] flex flex-col">
          <DonationForm
            amount={donationAmount}
            setAmount={setDonationAmount}
            message={donationMessage}
            setMessage={setDonationMessage}
            isAnonymous={isAnonymous}
            setIsAnonymous={setIsAnonymous}
            quickAmounts={QUICK_AMOUNTS}
            selectedQuickAmount={selectedQuickAmount}
            setSelectedQuickAmount={setSelectedQuickAmount}
            isSubmitting={isSubmitting}
            onSubmit={handleDonate}
            onClose={() => setSelectedItem(null)}
            title={t('prayer.donate.makeDonation')}
            description={selectedItem?.title || ''}
            showProgress={true}
            currentAmount={selectedItem?.current_amount}
            targetAmount={selectedItem?.target_amount}
          />
        </DrawerContent>
      </Drawer>
    </div>
  );
} 