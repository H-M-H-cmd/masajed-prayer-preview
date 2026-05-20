"use client";

import * as React from "react";
import { useLanguage } from "@/providers/language-provider";
import { donationService } from "@/services/donation.service";
import { Donation } from "@/types/donation";
import { ArrowLeft, ArrowRight, Copy, Download, Printer, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { SaudiRiyal } from "@/components/ui/saudi-riyal";
interface DonationShowProps {
  donationId: string;
  onBack: () => void;
}

export function DonationShow({ donationId, onBack }: DonationShowProps) {
  const { t, language } = useLanguage();
  const [isLoading, setIsLoading] = React.useState(true);
  const [donationData, setDonationData] = React.useState<Donation | null>(null);

  React.useEffect(() => {
    const fetchDonation = async () => {
      try {
        setIsLoading(true);
        const { data } = await donationService.getDonation(donationId);
        setDonationData(data);
      } catch (error) {
        console.error('Error fetching donation:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchDonation();
  }, [donationId]);

  const handleCopyReference = async () => {
    try {
      await navigator.clipboard.writeText(donation?.referenceNumber || '');
      toast({
        description: t("common.copied"),
      });
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handlePrint = () => {
    window.print();
    toast({
      description: t("donations.messages.printSuccess"),
    });
  };

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: t("donations.receipt.title"),
          text: `${t("donations.amount")}: ${donation?.amount} ${t("common.currency")}`,
          url: window.location.href,
        });
      }
    } catch (err) {
      console.error('Failed to share:', err);
    }
  };

  const handleDownload = () => {
    // Implement PDF download logic here
    toast({
      description: t("donations.messages.downloadSuccess"),
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">{t("common.loading")}</div>
      </div>
    );
  }

  if (!donationData) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">{t("common.noResults")}</div>
      </div>
    );
  }

  const donation = donationData;

  return (
    <div className="space-y-6">
      {/* Header with Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={onBack}>
            {language === "ar" ? <ArrowRight className="h-4 w-4" /> : <ArrowLeft className="h-4 w-4" />}
          </Button>
          <div>
            <h2 className="text-2xl font-semibold text-foreground flex items-center gap-1">{donation.amount} 
                <SaudiRiyal className="h-4 w-4" />
              
            </h2>
            <p className="text-sm text-muted-foreground">{format(new Date(donation.date), "PPP", { locale: language === "ar" ? ar : undefined })}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handlePrint}>
            <Printer className="h-4 w-4 mr-2" />
            {t("donations.actions.print")}
          </Button>
          <Button variant="outline" size="sm" onClick={handleShare}>
            <Share2 className="h-4 w-4 mr-2" />
            {t("donations.actions.share")}
          </Button>
          <Button variant="outline" size="sm" onClick={handleDownload}>
            <Download className="h-4 w-4 mr-2" />
            {t("donations.actions.download")}
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Donor Information */}
        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-foreground">{t("donations.donorInfo")}</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">{t("donations.donor")}</span>
              <span>{donation.donor.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">{t("donations.phone")}</span>
              <span>{donation.donor.phone}</span>
            </div>
          </div>
        </div>

        {/* Payment Information */}
        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-foreground">{t("donations.paymentInfo")}</h3>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">{t("donations.paymentMethod")}</span>
              <div className="flex items-center gap-2">
                <Badge variant="outline">
                  {t(`donations.paymentMethods.${donation.paymentMethod}`)}
                </Badge>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">{t("donations.transactionId")}</span>
              <div className="flex items-center gap-2">
                <span className="font-mono">{donation.transactionId}</span>
                <Button variant="ghost" size="icon" onClick={handleCopyReference}>
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">{t("donations.referenceNumber")}</span>
              <span className="font-mono">SFASF4353ERF43534ØFED</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">{t("donations.accountNumber")}</span>
              <span className="font-mono">093459830945034S</span>
            </div>
          </div>
        </div>  
      </div>

      {/* Usage Details */}
      <div className="space-y-2">
        <h3 className="text-lg font-semibold text-foreground">{t("donations.usageDetails")}</h3>
        <div className="rounded-lg border">
            <div className={cn(
              "grid grid-cols-3 text-sm font-medium p-3",
              "bg-muted text-muted-foreground"
            )}>
              <div>{t("donations.columns.date")}</div>
              <div>{t("donations.columns.usage")}</div>
              <div className="text-end">{t("donations.columns.amount")}</div>
            </div>
            <div className="divide-y divide-border">
              {[
                { date: "2025-10-25", usage: "تغطية احتياج / تغيير نشاطات", amount: 50 },
                { date: "2025-10-25", usage: "تغطية احتياج / تغيير نشاطات", amount: 15 },
                { date: "2025-10-25", usage: "تغطية احتياج / تغيير نشاطات", amount: 1000 },
                { date: "2025-10-25", usage: "تغطية احتياج / تغيير نشاطات", amount: 40 },
                { date: "2025-10-25", usage: "تغطية احتياج / تركيب كاميرات", amount: 450 },
              ].map((item, index) => (
                <div key={index} className="grid grid-cols-3 text-sm p-3 text-foreground hover:bg-muted/50">
                  <div>{format(new Date(item.date), "yyyy-MM-dd")}</div>
                  <div>{item.usage}</div>
                  <div className="text-end">{item.amount}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
  );
}
