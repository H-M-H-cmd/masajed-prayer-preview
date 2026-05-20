"use client";

import * as React from "react";
import { useLanguage } from "@/providers/language-provider";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { 
  MapPin, 
  Users, 
  Phone, 
  Mail,
  Calendar,
  Building2,
  ChevronRight,
  ChevronDown,
  BookOpen,
  Droplet,
  Camera,
  Lightbulb,
  Speaker,
  Star,
  HandHeart,
} from "lucide-react";
import { 
  IconPray,
  IconAirConditioning,
} from "@tabler/icons-react";
import Link from "next/link";
import { Carousel } from "@/components/ui/carousel";
import { motion, AnimatePresence } from "framer-motion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Pagination } from "@/components/ui/pagination";

// Update mock data with more members
const mockMosqueCommunity = {
  totalMembers: 25,
  members: [
    {
      id: 2,
      name: "عبدالرحمن محمد",
      role: "imam",
      image: "/assets/examples/avatar-2.jpg",
      memberSince: "2018",
      attendance: "الصلوات الخمس",
      bio: "إمام وخطيب المسجد",
    },
    {
      id: 1,
      name: "محمد العمري",
      role: "muezzin",
      image: "/assets/examples/avatar-1.jpg",
      memberSince: "2015",
      attendance: "الصلوات الخمس",
      bio: "مؤذن المسجد منذ أكثر من 8 سنوات",
    },
    {
      id: 3,
      name: "محمد الصادق",
      role: "worker",
      image: "/assets/examples/avatar-3.jpg",
      memberSince: "2019",
      attendance: "يومي",
      bio: "يقوم بخدمة المسجد والاهتمام بنظافته",
    },
    {
      id: 4,
      name: "أحمد العمري",
      role: "donor",
      image: "/assets/examples/avatar-4.jpg",
      memberSince: "2020",
      attendance: "أسبوعي",
      bio: "متبرع دائم للمسجد ويساهم في مشاريع التطوير",
    },
    {
      id: 5,
      name: "خالد السعيد",
      role: "teacher",
      image: "/assets/examples/avatar-5.jpg",
      memberSince: "2017",
      attendance: "يومي",
      bio: "يقدم دروس في الفقه والتفسير بعد صلاة العشاء",
    },
    {
      id: 6,
      name: "عمر الحسن",
      role: "volunteer",
      image: "/assets/examples/avatar-6.jpg",
      memberSince: "2021",
      attendance: "يومي",
      bio: "متطوع دائم في خدمة المسجد وتنظيم الفعاليات",
    },
    {
      id: 7,
      name: "سعد المالكي",
      role: "donor",
      image: "/assets/examples/avatar-7.jpg",
      memberSince: "2019",
      attendance: "شهري",
      bio: "يساهم في صيانة المسجد وتوفير احتياجاته",
    },
    {
      id: 8,
      name: "فهد القحطاني",
      role: "member",
      image: "/assets/examples/avatar-8.jpg",
      memberSince: "2022",
      attendance: "يومي",
      bio: "من المداومين على الصلوات الخمس",
    },
  ]
};

export default function MosqueInfoPage() {
  const { t, language } = useLanguage();
  const [showAllNeeds, setShowAllNeeds] = React.useState(false);
  const [accordionValue, setAccordionValue] = React.useState<string>("community");
  const [currentPage, setCurrentPage] = React.useState(1);
  const membersPerPage = 5;

  // Calculate pagination
  const totalPages = Math.ceil(mockMosqueCommunity.members.length / membersPerPage);
  const startIndex = (currentPage - 1) * membersPerPage;
  const endIndex = startIndex + membersPerPage;
  const currentMembers = mockMosqueCommunity.members.slice(startIndex, endIndex);

  const mosqueInfo = {
    name: "مسجد ابو بكر الصديق",
    rating: 4.8,
    images: [
      "/assets/examples/mosque.jpg",
      "/assets/examples/mosque-interior.jpg",
      "/assets/examples/mosque-courtyard.jpg",
      "/assets/examples/mosque-minaret.jpg",
    ],
    address: "شارع الملك فهد، حي الملز، الرياض",
    capacity: "5000",
    phone: "+966 11 123 4567",
    email: "info@kingkhalidmosque.sa",
    prayerTimes: {
      fajr: "04:52",
      dhuhr: "12:00",
      asr: "15:15",
      maghrib: "17:52",
      isha: "19:22"
    },
    weeklyLessons: "3",
    monthlyEvents: "5",
    currentNeeds: [
      {
        id: 1,
        title: "تجديد السجاد",
        description: "نحتاج إلى تجديد سجاد المسجد",
        progress: 60,
        icon: IconPray
      },
      {
        id: 2,
        title: "صيانة المكيفات",
        description: "صيانة دورية للمكيفات",
        progress: 30,
        icon: IconAirConditioning
      },
      {
        id: 3,
        title: "تجديد المصاحف",
        description: "استبدال المصاحف القديمة",
        progress: 45,
        icon: BookOpen
      },
      {
        id: 4,
        title: "صيانة دورات المياه",
        description: "إصلاحات وصيانة دورية",
        progress: 20,
        icon: Droplet
      },
      {
        id: 5,
        title: "تركيب كاميرات مراقبة",
        description: "تركيب نظام مراقبة جديد",
        progress: 15,
        icon: Camera
      },
      {
        id: 6,
        title: "تجديد الإضاءة",
        description: "استبدال الإضاءة بإضاءة LED موفرة",
        progress: 70,
        icon: Lightbulb
      },
      {
        id: 7,
        title: "صيانة مكبرات الصوت",
        description: "تحديث نظام الصوت",
        progress: 40,
        icon: Speaker
      }
    ]
  };

  const displayedNeeds = showAllNeeds 
    ? mosqueInfo.currentNeeds 
    : mosqueInfo.currentNeeds.slice(0, 2);

  const remainingNeeds = mosqueInfo.currentNeeds.length - 2;

  return (
    <div className="space-y-6">
      {/* Mosque Image Carousel with Rating */}
      <Card className="relative overflow-hidden">
        <Carousel 
          images={mosqueInfo.images}
          aspectRatio="video"
          className="rounded-none"
          variant="minimal"
          showOverlay
        />
        
        {/* Rating Container - Always Left */}
        <div className="absolute top-0 left-0 p-6 w-fit pointer-events-none">
          <div className="flex items-center gap-1">
            <Star className="h-4 w-4 fill-primary text-primary" />
            <span className="text-sm font-medium text-white">{mosqueInfo.rating}</span>
          </div>
        </div>
      </Card>

      {/* Quick Info Cards */}
      <div className="grid gap-4 grid-cols-2" dir={language === 'ar' ? 'rtl' : 'ltr'}>
        <Card className="p-4 flex items-center gap-3">
          <MapPin className="h-5 w-5 text-primary" />
          <p className="text-sm text-muted-foreground">{mosqueInfo.address}</p>
        </Card>

        <Card className="p-4 flex items-center gap-3">
          <Users className="h-5 w-5 text-primary" />
          <p className="text-sm text-muted-foreground">
            {t('prayer.info.capacityValue').replace('%{value}', mosqueInfo.capacity)}
          </p>
        </Card>
      </div>

      {/* Activity Stats */}
      <div className="grid gap-4 grid-cols-2"  dir={language === 'ar' ? 'rtl' : 'ltr'}>
        <Card className="p-4 text-center">
          <Calendar className="h-5 w-5 text-primary mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">{t('prayer.info.weeklyLessons')}</p>
          <p className="text-xl font-bold text-primary mt-1">{mosqueInfo.weeklyLessons}</p>
        </Card>

        <Card className="p-4 text-center">
          <Building2 className="h-5 w-5 text-primary mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">{t('prayer.info.monthlyEvents')}</p>
          <p className="text-xl font-bold text-primary mt-1">{mosqueInfo.monthlyEvents}</p>
        </Card>
      </div>

      {/* Contact Info */}
      <Card className="divide-y">
        <div className={cn(
          "p-4 flex items-center gap-3",
          language === 'ar' ? "flex-row-reverse" : "flex-row"
        )}>
          <Phone className="h-5 w-5 text-primary" />
          <div>
            <p className="text-sm text-muted-foreground">{mosqueInfo.phone}</p>
          </div>
        </div>
        <div className={cn(
          "p-4 flex items-center gap-3",
          language === 'ar' ? "flex-row-reverse" : "flex-row"
        )}>
          <Mail className="h-5 w-5 text-primary" />
          <div>
            <p className="text-sm text-muted-foreground">{mosqueInfo.email}</p>
          </div>
        </div>
      </Card>

      {/* Current Needs Section */}
      <Card className="p-6">
        <div className={cn(
          "flex items-center justify-between mb-4",
          language === 'ar' ? "flex-row-reverse" : "flex-row"
        )}>
          <h2 className="text-lg font-semibold">
            {t('prayer.needs.current')}
          </h2>
          <Link 
            href="/issues/create"
            className={cn(
              "text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-1",
              language === 'ar' ? "flex-row-reverse" : "flex-row"
            )}
          >
            {t('prayer.needs.addNeed')}
            <ChevronRight className={cn("h-4 w-4", language === 'ar' && "rotate-180")} />
          </Link>
        </div>
        {mosqueInfo.currentNeeds.length > 0 ? (
          <div className="space-y-4">
            <AnimatePresence mode="sync">
              {displayedNeeds.map((need, index) => {
                const NeedIcon = need.icon;
                return (
                  <motion.div
                    key={need.id}
                    initial={{ opacity: 0, height: 0, y: 20 }}
                    animate={{ opacity: 1, height: "auto", y: 0 }}
                    exit={{ opacity: 0, height: 0, y: -20 }}
                    transition={{
                      type: "spring",
                      stiffness: 500,
                      damping: 30,
                      mass: 1,
                      delay: index * 0.1
                    }}
                  >
                    <Card className="p-4">
                      <div className={cn(
                        "flex items-start gap-3",
                        language === 'ar' && "flex-row-reverse"
                      )}>
                        <NeedIcon className="h-5 w-5 text-primary mt-1" />
                        <div className="flex-1 space-y-1">
                          <div className={cn(
                            "flex items-start justify-between gap-4",
                            language === 'ar' && "flex-row-reverse"
                          )}>
                            <div dir={language === 'ar' ? 'rtl' : 'ltr'}>
                              <h3 className="font-medium">{need.title}</h3>
                              <p className="text-sm text-muted-foreground">{need.description}</p>
                            </div>
                            <Button 
                              size="sm" 
                              variant="outline"
                              className={cn(
                                "flex items-center gap-1 group",
                                language === 'ar' && "flex-row-reverse"
                              )}
                            >
                              <HandHeart className="h-4 w-4 transition-transform group-hover:scale-110" />
                              {t('prayer.needs.help')}
                            </Button>
                          </div>
                          <div className="w-full bg-muted rounded-full h-2 mt-2">
                            <motion.div 
                              className="bg-primary h-2 rounded-full"
                              initial={{ width: 0 }}
                              animate={{ width: `${need.progress}%` }}
                              transition={{ duration: 0.5, delay: index * 0.1 }}
                            />
                          </div>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                );
              })}
            </AnimatePresence>

            {mosqueInfo.currentNeeds.length > 2 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                <Button
                  variant="ghost"
                  className={cn(
                    "w-full mt-4 text-muted-foreground hover:text-primary",
                    "flex items-center justify-center gap-2",
                    language === 'ar' && "flex-row-reverse"
                  )}
                  onClick={() => setShowAllNeeds(!showAllNeeds)}
                >
                  <ChevronDown className={cn(
                    "h-4 w-4 transition-transform",
                    showAllNeeds && "rotate-180"
                  )} />
                  {showAllNeeds
                    ? t('prayer.needs.showLess')
                    : t('prayer.needs.showMore').replace('%{count}', remainingNeeds.toString())
                  }
                </Button>
              </motion.div>
            )}
          </div>
        ) : (
          <div className="text-center py-6 text-muted-foreground">
            {t('prayer.needs.noNeeds')}
          </div>
        )}
      </Card>

      {/* Mosque Community Section */}
      <Card className="p-6" dir={language === 'ar' ? 'rtl' : 'ltr'}>
        <Accordion 
          type="single" 
          collapsible 
          className="w-full"
          value={accordionValue}
          onValueChange={setAccordionValue}
          sidebarState={{ open: true }}
        >
          <AccordionItem value="community" className="border-none group">
            <AccordionTrigger 
              className={cn(
                "flex items-center py-2 hover:no-underline w-full",
                "text-neutral-700 dark:text-neutral-200",
                "data-[state=open]:text-primary"
              )}
            >
              <div className="flex items-center gap-3 flex-1">
                <Users className="h-6 w-6 text-primary" />
                <div>
                  <h2 className="font-semibold">{t('prayer.community.title')}</h2>
                  <p className="text-sm text-muted-foreground text-start">
                    {t('prayer.community.members').replace('%{count}', mockMosqueCommunity.totalMembers.toString())}
                  </p>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-4 pt-2">
                <p className="text-sm text-muted-foreground">
                  {t('prayer.community.description')}
                </p>
                {currentMembers.map((member) => (
                  <div
                    key={member.id}
                    className="flex items-start gap-4 p-4 rounded-lg bg-muted/50"
                  >
                    <Avatar className="h-12 w-12 border-2 border-muted-foreground/10">
                      <AvatarImage src={member.image} alt={member.name} />
                      <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex flex-col gap-1">
                        <span className="font-medium">{member.name}</span>
                        <Badge 
                          variant="secondary" 
                          className={cn(
                            "w-fit",
                            member.role === 'imam' && "bg-primary/10 text-primary hover:bg-primary/20",
                            member.role === 'muezzin' && "bg-blue-500/10 text-blue-500 hover:bg-blue-500/20",
                            member.role === 'worker' && "bg-orange-500/10 text-orange-500 hover:bg-orange-500/20",
                            member.role === 'donor' && "bg-green-500/10 text-green-500 hover:bg-green-500/20",
                            member.role === 'teacher' && "bg-purple-500/10 text-purple-500 hover:bg-purple-500/20",
                            member.role === 'volunteer' && "bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20",
                            member.role === 'member' && "bg-neutral-500/10 text-neutral-500 hover:bg-neutral-500/20"
                          )}
                        >
                          {t(`prayer.community.roles.${member.role}`)}
                        </Badge>
                      </div>
                      <div className="mt-2 space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-muted-foreground">
                            {t('prayer.community.memberSince')}:
                          </span>
                          <span className="text-sm">{member.memberSince}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-muted-foreground">
                            {t('prayer.community.attendance')}:
                          </span>
                          <span className="text-sm">{member.attendance}</span>
                        </div>
                        <p className="text-sm mt-2">{member.bio}</p>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Pagination */}
                {totalPages > 1 && (
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                    className="mt-4"
                  />
                )}
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </Card>
    </div>
  );
} 