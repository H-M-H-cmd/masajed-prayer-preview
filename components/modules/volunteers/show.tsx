"use client";

import * as React from "react";
import { Card } from "@/components/ui/card";
import { useLanguage } from "@/providers/language-provider";
import { volunteerService } from "@/services/volunteer.service";
import { VolunteerOpportunity } from "@/types/volunteer";
import { format, parseISO } from "date-fns";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ar } from "date-fns/locale";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { VisuallyHidden } from "@/components/ui/visually-hidden";
import { Carousel } from "@/components/ui/carousel";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { DataTable } from "@/components/ui/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { SaudiRiyal } from "@/components/ui/saudi-riyal";

// Mock data for applicants
const mockApplicants = [
  {
    id: "1",
    name: "Ahmed Ali",
    email: "ahmed@example.com",
    phone: "+966500000000",
    status: "pending",
    applied_at: new Date().toISOString(),
  },
  {
    id: "2",
    name: "Mohammed Hassan",
    email: "mohammed@example.com",
    phone: "+966500000001",
    status: "accepted",
    applied_at: new Date().toISOString(),
  },
];

interface VolunteerShowProps {
  volunteerId: string;
  onBack: () => void;
}

export function VolunteerShow({ volunteerId, onBack }: VolunteerShowProps) {
  const { t, language } = useLanguage();
  const [selectedTab, setSelectedTab] = React.useState<"details" | "applicants">("details");
  const [isLoading, setIsLoading] = React.useState(true);
  const [volunteerData, setVolunteerData] = React.useState<VolunteerOpportunity | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = React.useState<number | null>(null);

  React.useEffect(() => {
    const fetchVolunteer = async () => {
      try {
        setIsLoading(true);
        const { data: volunteerData } = await volunteerService.getVolunteer(volunteerId);
        setVolunteerData(volunteerData);
      } catch (error) {
        console.error('Error fetching volunteer:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchVolunteer();
  }, [volunteerId]);

  const formatDateTime = (dateString: string) => {
    const date = parseISO(dateString);
    return {
      date: format(date, "yyyy-M-dd"),
      time: format(date, "hh:mm", { locale: ar }) + " " + (format(date, "a").toLowerCase() === "am" ? "ص" : "م")
    };
  };

  const applicantsColumns: ColumnDef<typeof mockApplicants[0]>[] = [
    {
      accessorKey: "name",
      header: t("common.name"),
    },
    {
      accessorKey: "email",
      header: t("common.email"),
    },
    {
      accessorKey: "phone",
      header: t("common.phone"),
    },
    {
      accessorKey: "status",
      header: t("common.status"),
      cell: ({ row }) => (
        <Badge variant={row.original.status === "accepted" ? "default" : "secondary"}>
          {t(`volunteers.applicants.status.${row.original.status}`)}
        </Badge>
      ),
    },
    {
      accessorKey: "applied_at",
      header: t("volunteers.applicants.appliedAt"),
      cell: ({ row }) => formatDateTime(row.original.applied_at).date,
    },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">{t("common.loading")}</div>
      </div>
    );
  }

  if (!volunteerData) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">{t("common.noResults")}</div>
      </div>
    );
  }

  const volunteer = volunteerData;

  return (
    <Tabs
      dir={language === "ar" ? "rtl" : "ltr"}
      value={selectedTab}
      onValueChange={(value) => {
        setSelectedTab(value as "details" | "applicants");
      }}
      className="w-full relative"
    >
      {/* Header */}
      <div className={"flex items-center gap-4 absolute top-0 " + (language === "ar" ? "left-0" : "right-0")}>
        <Button
          variant="secondary"
          onClick={onBack}
          className="shrink-0"
        >
          <span>{t("common.back")}</span>
          {language === "ar" ? <ArrowLeft className="h-4 w-4" /> : <ArrowRight className="h-4 w-4" />}
        </Button>
      </div>
      <TabsList className="grid w-fit mx-auto grid-cols-2">
        <TabsTrigger value="details">{t("volunteers.form.details")}</TabsTrigger>
        <TabsTrigger value="applicants">{t("volunteers.applicants.title")}</TabsTrigger>
      </TabsList>

      <TabsContent value="details">
        <div className="space-y-6">
          <Card className="p-6 grid grid-cols-8 gap-4">
            <div className="col-span-5 space-y-4">
              <div className="flex-1 min-w-0">
                <h1 className="text-2xl font-bold truncate">{volunteer.title}</h1>
              </div>
              {/* Description */}
              {volunteer.description && (
                <div className="prose dark:prose-invert">
                  <div className="whitespace-pre-wrap">{volunteer.description}</div>
                </div>
              )}
              {/* Requirements */}
              {volunteer.requirements && (
                <div className="space-y-2">
                  <h3 className="font-semibold">{t("volunteers.form.requirements")}</h3>
                  <div className="prose dark:prose-invert">
                    <div className="whitespace-pre-wrap">{volunteer.requirements}</div>
                  </div>
                </div>
              )}
              {/* Skills */}
              {volunteer.skills && volunteer.skills.length > 0 && (
                <div className="space-y-2">
                  <h3 className="font-semibold">{t("volunteers.form.skills")}</h3>
                  <div className="flex flex-wrap gap-2">
                    {volunteer.skills.map((skill, index) => (
                      <Badge key={index} variant="outline">{skill}</Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="col-span-3 border-s-2 border-muted-foreground ps-4 space-y-4">
              {/* Status Badge */}
              <div className="flex items-center gap-2">
                <Badge variant="secondary">
                  {t(`volunteers.status.${volunteer.status}`)}
                </Badge>
              </div>

              {/* Type */}
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">
                  {t("volunteers.form.type")}:
                </span>
                <span className="text-sm">{t(`volunteers.types.${volunteer.type}`)}</span>
              </div>

              {/* Dates */}
              <div className="space-y-2">
                <div className="flex flex-nowrap items-center gap-2 w-full">
                  <span className="text-muted-foreground">{t("volunteers.form.startAt")}:</span>
                  <div className="flex flex-nowrap items-center justify-between gap-2 text-sm w-full">
                    <span className="whitespace-nowrap" dir="ltr">{formatDateTime(volunteer.start_at).date}</span>
                    <span className="whitespace-nowrap" dir="rtl">{formatDateTime(volunteer.start_at).time}</span>
                  </div>
                </div>
                {volunteer.end_at && (
                  <div className="flex flex-nowrap items-center gap-2 w-full">
                    <span className="text-muted-foreground">{t("volunteers.form.endAt")}:</span>
                    <div className="flex flex-nowrap items-center justify-between gap-2 text-sm">
                      <span className="whitespace-nowrap" dir="ltr">{formatDateTime(volunteer.end_at).date}</span>
                      <span className="whitespace-nowrap" dir="rtl">{formatDateTime(volunteer.end_at).time}</span>
                    </div>
                  </div>
                )}
                {volunteer.application_deadline && (
                  <div className="flex flex-nowrap items-center gap-2 w-full">
                    <span className="text-muted-foreground">{t("volunteers.form.applicationDeadline")}:</span>
                    <div className="flex flex-nowrap items-center justify-between gap-2 text-sm">
                      <span className="whitespace-nowrap" dir="ltr">{formatDateTime(volunteer.application_deadline).date}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Additional Info */}
              <div className="space-y-2">
                {volunteer.capacity && (
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">{t("volunteers.form.capacity")}:</span>
                    <span className="text-sm">{volunteer.capacity}</span>
                  </div>
                )}
                {volunteer.gender && (
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">{t("volunteers.form.gender")}:</span>
                    <span className="text-sm">{t(`volunteers.gender.${volunteer.gender}`)}</span>
                  </div>
                )}
                {(volunteer.age_from || volunteer.age_to) && (
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">{t("volunteers.form.ageRange")}:</span>
                    <span className="text-sm">
                      {volunteer.age_from && volunteer.age_to 
                        ? `${volunteer.age_from} - ${volunteer.age_to}`
                        : volunteer.age_from
                          ? `${t("common.from")} ${volunteer.age_from}`
                          : `${t("common.upTo")} ${volunteer.age_to}`
                      }
                    </span>
                  </div>
                )}
              </div>

                {/* Rewards */}
                <div className="space-y-2">
                {volunteer.has_financial_reward && (
                  <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-green-500 flex items-center gap-1">
                    {t("volunteers.form.hasFinancialReward")}
                    {volunteer.reward_amount && `: ${volunteer.reward_amount}`}
                    <SaudiRiyal className="h-4 w-4" />
                  </Badge>
                  </div>
                )}
                {volunteer.has_certificate_reward && (
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{t("volunteers.form.hasCertificateReward")}</Badge>
                  </div>
                )}
                {volunteer.has_hours_reward && (
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">
                      {t("volunteers.form.hasHoursReward")}
                      {volunteer.volunteer_hours && `: ${volunteer.volunteer_hours} ${t("common.hours")}`}
                    </Badge>
                  </div>
                )}
              </div>
            </div>
          </Card>

          {/* Image Dialog with Carousel */}
          <Dialog
            open={selectedImageIndex !== null}
            onOpenChange={() => setSelectedImageIndex(null)}
          >
            <DialogContent className="max-w-7xl p-0 overflow-hidden bg-background/95 border-0">
              <VisuallyHidden>
                <DialogTitle>{t("volunteers.imageViewer")}</DialogTitle>
              </VisuallyHidden>
              {selectedImageIndex !== null && volunteer.attachments && (
                <Carousel
                  images={volunteer.attachments.map(a => a.url)}
                  currentIndex={selectedImageIndex}
                  variant="default"
                  aspectRatio="video"
                  contain={true}
                  showDots={true}
                  autoPlay={false}
                  showOverlay={false}
                  hideLockIcon={true}
                  className="w-full"
                />
              )}
            </DialogContent>
          </Dialog>
        </div>
      </TabsContent>

      <TabsContent value="applicants">
        <Card className="p-6">
          <DataTable
            data={mockApplicants}
            columns={applicantsColumns}
            searchPlaceholder={t("volunteers.applicants.searchPlaceholder")}
          />
        </Card>
      </TabsContent>
    </Tabs>
  );
}
