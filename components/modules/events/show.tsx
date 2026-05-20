"use client";

import * as React from "react";
import { Card } from "@/components/ui/card";
import { useLanguage } from "@/providers/language-provider";
import { eventService } from "@/services/event.service";
import { Event } from "@/types/event";
import { format, parseISO } from "date-fns";
import { ArrowLeft, ArrowRight, Expand, EyeOff, Reply } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { statuses } from "./data";
import Image from "next/image";
import { ar } from "date-fns/locale";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { VisuallyHidden } from "@/components/ui/visually-hidden";
import { Carousel } from "@/components/ui/carousel";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
const mockReplies = [
    {
        id: "1",
        user: {
            name: "أحمد علي",
            avatar: "https://github.com/shadcn.png"
        },
        content: "شكرًا على المشاركة الرائعة! هل يمكنك توضيح النقطة الثانية أكثر؟",
        created_at: new Date().toISOString(),
        children: [
            {
                id: "1.1",
                user: {
                    name: "محمد حسن",
                    avatar: "https://github.com/shadcn.png"
                },
                content: "بالطبع! النقطة الثانية تتعلق بكيفية تحسين الأداء باستخدام الأدوات الحديثة.",
                created_at: new Date().toISOString(),
                hide: false
            },
            {
                id: "1.2",
                user: {
                    name: "فاطمة خالد",
                    avatar: "https://github.com/shadcn.png"
                },
                content: "أتفق مع محمد، وأضيف أن التوثيق الجيد مهم أيضًا.",
                created_at: new Date().toISOString(),
                hide: false
            },
        ],
        hide: false
    },
    {
        id: "2",
        user: {
            name: "ليلى محمد",
            avatar: "https://github.com/shadcn.png"
        },
        content: "أحببت فكرة المقال، خاصة الجزء الخاص بالتخطيط الاستراتيجي.",
        created_at: new Date().toISOString(),
        children: [],
        hide: false
    },
    {
        id: "3",
        user: {
            name: "عمر سعيد",
            avatar: "https://github.com/shadcn.png"
        },
        content: "هل لديكم توصيات لكتب تتحدث عن هذا الموضوع؟",
        created_at: new Date().toISOString(),
        children: [
            {
                id: "3.1",
                user: {
                    name: "سارة علي",
                    avatar: "https://github.com/shadcn.png"
                },
                content: "نعم، أنصح بكتاب 'فن الإدارة الحديثة' للدكتور خالد عبدالله.",
                created_at: new Date().toISOString(),
                hide: false
            },
            {
                id: "3.2",
                user: {
                    name: "ناصر أحمد",
                    avatar: "https://github.com/shadcn.png"
                },
                content: "أضيف أيضًا كتاب 'التخطيط الاستراتيجي في القرن الحادي والعشرين'.",
                created_at: new Date().toISOString(),
                hide: false
            },
        ],
        hide: false
    },
    {
        id: "4",
        user: {
            name: "نورا عبدالله",
            avatar: "https://github.com/shadcn.png"
        },
        content: "المقال رائع، لكن أتمنى لو كان هناك أمثلة عملية أكثر.",
        created_at: new Date().toISOString(),
        children: [],
        hide: false
    },
    {
        id: "5",
        user: {
            name: "خالد فؤاد",
            avatar: "https://github.com/shadcn.png"
        },
        content: "شكرًا على المجهود الكبير! هل يمكن مشاركة المصادر التي استعنت بها؟",
        created_at: new Date().toISOString(),
        children: [
            {
                id: "5.1",
                user: {
                    name: "أحمد علي",
                    avatar: "https://github.com/shadcn.png"
                },
                content: "بالطبع، سأقوم بإضافة المصادر في التعليقات قريبًا.",
                created_at: new Date().toISOString(),
                hide: false
            }
        ],
        hide: false
    },
    {
        id: "6",
        user: {
            name: "ريم أحمد",
            avatar: "https://github.com/shadcn.png"
        },
        content: "أعتقد أن الموضوع يحتاج إلى مزيد من التفصيل في الجزء الأخير.",
        created_at: new Date().toISOString(),
        children: [],
        hide: false
    }
];
interface EventShowProps {
    eventId: string;
    onBack: () => void;
    onEdit?: (event: Event) => void;
}

export function EventShow({ eventId, onBack, onEdit }: EventShowProps) {
    const { t, language } = useLanguage();
    const [selectedTab, setSelectedTab] = React.useState<"details" | "replies">("details");
    const [isLoading, setIsLoading] = React.useState(true);
    const [eventData, setEventData] = React.useState<Event | null>(null);
    const [selectedImageIndex, setSelectedImageIndex] = React.useState<number | null>(null);

    React.useEffect(() => {
        const fetchEvent = async () => {
            try {
                setIsLoading(true);
                const { data: eventData } = await eventService.getEvent(eventId);
                setEventData(eventData);
            } catch (error) {
                console.error('Error fetching event:', error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchEvent();
    }, [eventId]);

    const formatDateTime = (dateString: string) => {
        const date = parseISO(dateString);
        return {
            date: format(date, "yyyy-M-dd"),
            time: format(date, "hh:mm", { locale: ar }) + " " + (format(date, "a").toLowerCase() === "am" ? "ص" : "م")
        };
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-muted-foreground">{t("common.loading")}</div>
            </div>
        );
    }

    if (!eventData) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-muted-foreground">{t("common.noResults")}</div>
            </div>
        );
    }

    const event = eventData;
    const status = statuses.find((s) => s.value === event.status);

    return (
        <Tabs
            dir={language === "ar" ? "rtl" : "ltr"}
            value={selectedTab}
            onValueChange={(value) => {
                setSelectedTab(value as "details" | "replies");
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
                {onEdit && eventData && (
                    <Button
                        variant="outline"
                        onClick={() => onEdit(eventData)}
                        className="shrink-0"
                    >
                        <span>{t("common.edit")}</span>
                    </Button>
                )}
            </div>
            <TabsList className="grid w-fit mx-auto grid-cols-2">
                <TabsTrigger value="details">{t("events.form.details")}</TabsTrigger>
                <TabsTrigger value="replies">{t("events.form.replies")}</TabsTrigger>
            </TabsList>

            <TabsContent value="details">
                <div className="space-y-6">
                    <Card className="p-6 grid grid-cols-8 gap-4">
                        <div className="col-span-5 space-y-4">
                            <div className="flex-1 min-w-0">
                                <h1 className="text-2xl font-bold truncate">{event.title}</h1>
                            </div>
                            {/* Description */}
                            {event.description && (
                                <div className="prose dark:prose-invert">
                                    <div className="whitespace-pre-wrap">{event.description}</div>
                                </div>
                            )}

                            {/* Updated Attachments section */}
                            {event.attachments && event.attachments.length > 0 && (
                                <div>
                                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                        {event.attachments.map((attachment, index) => (
                                            <div
                                                key={index}
                                                className="relative aspect-square rounded-lg overflow-hidden border bg-muted group cursor-pointer"
                                                onClick={() => setSelectedImageIndex(index)}
                                            >
                                                <Image
                                                    src={attachment.url}
                                                    alt={attachment.file_name}
                                                    fill
                                                    className="object-cover transition-transform group-hover:scale-105"
                                                />
                                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                    <Expand className="w-6 h-6 text-white" />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="col-span-3 border-s-2 border-muted-foreground ps-4">
                            {/* Status Badge */}
                            {status && (
                                <div className="flex items-center gap-2">
                                    {status.icon && <status.icon className="h-4 w-4" />}
                                    <Badge variant="secondary">
                                        {t(`events.statuses.${status.value}`)}
                                    </Badge>
                                </div>
                            )}

                            {/* Updated Date and Time section */}
                            <div className="space-y-2 mt-3">
                                <div className="flex items-center gap-2 ">
                                    <span className="text-muted-foreground">
                                        {t("events.form.type")}:
                                    </span>
                                    <span className="text-sm">{t(`events.types.${event.type}`)}</span>
                                </div>

                                <div>
                                    <div className="flex items-start gap-2">
                                        <div className="space-y-2">
                                            <div className="flex flex-nowrap items-center gap-2 w-full">
                                                <span className="text-muted-foreground">{t("events.form.startAt")}:</span>
                                                <div className="flex flex-nowrap items-center justify-between gap-2 text-sm w-full">
                                                    <span className="whitespace-nowrap" dir="ltr">{formatDateTime(event.start_at).date}</span>
                                                    <span className="whitespace-nowrap" dir="rtl">{formatDateTime(event.start_at).time}</span>
                                                </div>
                                            </div>
                                            {event.end_at && (
                                                <div className="flex flex-nowrap items-center gap-2 w-full">
                                                    <span className="text-muted-foreground">{t("events.form.endAt")}:</span>
                                                    <div className="flex flex-nowrap items-center justify-between gap-2 text-sm">
                                                        <span className="whitespace-nowrap" dir="ltr">{formatDateTime(event.end_at).date}</span>
                                                        <span className="whitespace-nowrap" dir="rtl">{formatDateTime(event.end_at).time}</span>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-muted-foreground">
                                            {t("events.form.replies")}:
                                        </span>
                                        <span className="text-sm">12</span>
                                    </div>
                                </div>

                            </div>

                        </div>
                    </Card>

                    {/* Updated Image Dialog with Carousel */}
                    <Dialog
                        open={selectedImageIndex !== null}
                        onOpenChange={() => setSelectedImageIndex(null)}
                    >
                        <DialogContent className="max-w-7xl p-0 overflow-hidden bg-background/95 border-0">
                            <VisuallyHidden>
                                <DialogTitle>{t("events.imageViewer")}</DialogTitle>
                            </VisuallyHidden>
                            {selectedImageIndex !== null && event.attachments && (
                                <Carousel
                                    images={event.attachments.map(a => a.url)}
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

            <TabsContent value="replies">
                <ScrollArea dir={language === "ar" ? "rtl" : "ltr"} className="h-[calc(100vh-22rem)]">
                    {mockReplies.map((reply) => (
                        <div key={reply.id}>
                            <Card className="py-2 px-4 max-w-md mx-auto my-3">
                                <div className="flex items-center justify-between gap-2">
                                    <span className="text-sm text-muted-foreground">{reply.user.name}</span>
                                    <span dir="ltr">{format(parseISO(reply.created_at), "hh:mm a")}</span>
                                </div>
                                <div className="grid grid-cols-12 prose dark:prose-invert mt-4">
                                    <div className="whitespace-pre-wrap col-span-10">{reply.content}</div>
                                    {/* Reply Actions */}
                                    <div className="col-span-2 flex items-center gap-2">
                                        <Button variant="ghost" size="icon">
                                            <EyeOff className="h-4 w-4" />
                                        </Button>
                                        <Button variant="ghost" size="icon">
                                            <Reply className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                                {reply.children.length > 0 && (
                                    <div>
                                        {reply.children.map((child) => (
                                            <Card key={child.id} className="py-2 px-4 max-w-md mx-auto my-3">
                                                <div className="flex items-center justify-between gap-2">
                                                    <span className="text-sm text-muted-foreground">{child.user.name}</span>
                                                    <span dir="ltr">{format(parseISO(child.created_at), "hh:mm a")}</span>
                                                </div>
                                                <div className="grid grid-cols-12 prose dark:prose-invert mt-4">
                                                    <div className="whitespace-pre-wrap col-span-10">{reply.content}</div>
                                                    {/* Reply Actions */}
                                                    <div className="col-span-2 flex items-center gap-2">
                                                        <Button variant="ghost" size="icon">
                                                            <EyeOff className="h-4 w-4" />
                                                        </Button>
                                                        <Button variant="ghost" size="icon">
                                                            <Reply className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            </Card>
                                        ))}
                                    </div>
                                )}
                            </Card>

                        </div>
                    ))}
                </ScrollArea>
            </TabsContent>
        </Tabs>
    );
}