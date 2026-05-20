"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLanguage } from "@/providers/language-provider";
import { needService } from "@/services/need.service";
import { Need } from "@/types/need";
import { ArrowLeft, ArrowRight, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
	Tabs,
	TabsContent,
	TabsList,
	TabsTrigger,
} from "@/components/ui/tabs";

interface NeedShowProps {
	needId: string;
	onBack: () => void;
}


// Define stages data
const stages = [
	{ label: "تم استلام الطلب", days: "2", user: "أحمد محمد", date: "2024-01-01" },
	{ label: "تم تقييم الطلب", days: "5", user: "محمد خالد", date: "2024-01-03" },
	{ label: "جاري التنفيذ", days: "10", user: "عبدالله محمد", date: "2024-01-08" },
	{ label: "تم الانتهاء", days: "15", user: "محمد أحمد", date: "2024-01-15" }
];

// Define the NeedInfo component
const NeedInfo = ({ need }: { need: Need }) => {
	console.log(need);
	return (
		<TabsContent value="info" className="rounded-b-lg p-6">
			<div className="grid grid-cols-3 gap-6">
				<div className="col-span-2">
					<div className="space-y-3">
						<Card>
							<CardHeader>
								<CardTitle className="text-lg font-semibold">بيانات الطلب</CardTitle>
							</CardHeader>
							<CardContent>
								<div className="space-y-2">
									<div className="flex justify-between">
										<span>أحمد محمد الحمدي (عميل)</span>
									</div>
									<div>
										<span dir="ltr">
											0507774032
											#
										</span>
									</div>
									<div >
										<span dir="ltr" >

											2500234784 <Phone className="inline-block w-4 h-4" />
										</span>
									</div>
									<div className="gap-2 flex">
										<Badge variant="secondary">كهرباء</Badge>
										<Badge variant="secondary">سباكة</Badge>
									</div>
									<div className="text-sm text-gray-600">
										يوجد تسريب في انابيب المطبخ الداخلية وتحتاج الى تغيير . أيضاً ، الثلاجة تحتاج الى تصليح التماس
										كهربائي . أيضاً شطافات الحمامات
									</div>
									<div className="flex items-center space-x-2 justify-end">
										<span className="text-sm text-gray-500">(4) طلبات مكررة</span>
										<Badge variant="secondary" className="bg-gray-200">
											4
										</Badge>
									</div>
								</div>
							</CardContent>
						</Card>
						<Card>
							<CardHeader>
								<CardTitle className="text-lg font-semibold">بيانات المقاول</CardTitle>
							</CardHeader>
							<CardContent>
								<div className="space-y-2">
									<div>شركة الحمدي للمقاولات</div>
									<div className="flex gap-2">
										<Badge variant="secondary">كهرباء</Badge>
										<Badge variant="secondary">سباكة</Badge>
									</div>
									<div className="text-sm">توريد وتركيب انابيب تغيير انابيب تركيب شطافات توريد وتركيب شطافات</div>
									<div className="flex justify-between items-center">
										<span>عرض السعر</span>
										<Badge variant="outline" className="text-green-600 flex items-center gap-1">
											12,093
											<SaudiRiyal className="h-4 w-4" />
											
										</Badge>
									</div>
								</div>
							</CardContent>
						</Card>
					</div>
				</div>
				<Card className="col-span-1">
					<CardHeader className="text-lg font-semibold mb-4">مراحل الطلب</CardHeader>
					<CardContent className="space-y-6">
						{stages.map((stage, index) => (
							<div key={index} className="flex items-center">
								<div className="relative">
									<div className="bg-blue-100 rounded-full w-12 h-12 flex items-center justify-center text-blue-600 font-semibold z-10 relative">
										{stage.days}
									</div>
									{index < stages.length - 1 && (
										<div className="absolute top-12 right-1/2 bottom-0 w-0.5 bg-gray-300 translate-x-1/2"></div>
									)}
								</div>
								<div className="relative flex items-end ms-4 bg-primary/10 p-3 rounded gap-2 flex-wrap">
									<div className="text-sm font-semibold">{stage.label}</div>
									<div className="w-full flex flex-nowrap justify-between">
										{stage.user && <div className="text-xs text-gray-500">{stage.user}</div>}
										{stage.date && <div className="text-xs text-gray-500">{stage.date}</div>}
									</div>
								</div>
							</div>
						))}
					</CardContent>
				</Card>
			</div>
		</TabsContent>
	);
};
import { SaudiRiyal } from "@/components/ui/saudi-riyal";

export function NeedShow({ needId, onBack }: NeedShowProps) {
	const { t, language } = useLanguage();
	const [isLoading, setIsLoading] = React.useState(true);
	const [needData, setNeedData] = React.useState<Need | null>(null);
	const [selectedTab, setSelectedTab] = React.useState<"info" | "priceOffers" | "donors" | "images" | "evaluation" | "eventLog">("info");

	React.useEffect(() => {
		const fetchNeed = async () => {
			try {
				setIsLoading(true);
				const { data: needData } = await needService.getNeed(needId);
				setNeedData(needData);
			} catch (error) {
				console.error('Error fetching need:', error);
			} finally {
				setIsLoading(false);
			}
		};
		fetchNeed();
	}, [needId]);

	if (isLoading) {
		return (
			<div className="flex items-center justify-center h-64">
				<div className="text-muted-foreground">{t("common.loading")}</div>
			</div>
		);
	}

	if (!needData) {
		return (
			<div className="flex items-center justify-center h-64">
				<div className="text-muted-foreground">{t("common.noResults")}</div>
			</div>
		);
	}

	const need = needData;

	return (
		<Tabs
			dir={language === "ar" ? "rtl" : "ltr"}
			value={selectedTab}
			onValueChange={(value) => {
				setSelectedTab(value as "info" | "priceOffers" | "donors" | "images" | "evaluation" | "eventLog");
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
					{language === "ar" ? <ArrowRight className="h-4 w-4" /> : <ArrowLeft className="h-4 w-4" />}
				</Button>
			</div>
			<TabsList className="grid w-fit grid-cols-6">
				<TabsTrigger value="info">{t("needs.tabs.info")}</TabsTrigger>
				<TabsTrigger value="priceOffers">{t("needs.tabs.priceOffers")}</TabsTrigger>
				<TabsTrigger value="donors">{t("needs.tabs.donors")}</TabsTrigger>
				<TabsTrigger value="images">{t("needs.tabs.images")}</TabsTrigger>
				<TabsTrigger value="evaluation">{t("needs.tabs.evaluation")}</TabsTrigger>
				<TabsTrigger value="eventLog">{t("needs.tabs.eventLog")}</TabsTrigger>
			</TabsList>

			<NeedInfo need={need} />


			<TabsContent value="priceOffers">
				<Card className="p-6">
					<div>{t("needs.tabs.priceOffersContent")}</div>
				</Card>
			</TabsContent>

			<TabsContent value="donors">
				<Card className="p-6">
					<div>{t("needs.tabs.donorsContent")}</div>
				</Card>
			</TabsContent>

			<TabsContent value="images">
				<Card className="p-6">
					<div>{t("needs.tabs.imagesContent")}</div>
				</Card>
			</TabsContent>

			<TabsContent value="evaluation">
				<Card className="p-6">
					<div>{t("needs.tabs.evaluationContent")}</div>
				</Card>
			</TabsContent>

			<TabsContent value="eventLog">
				<Card className="p-6">
					<div>{t("needs.tabs.eventLogContent")}</div>
				</Card>
			</TabsContent>
		</Tabs>
	);
}