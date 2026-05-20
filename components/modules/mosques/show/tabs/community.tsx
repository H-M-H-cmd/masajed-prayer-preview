"use client";

import * as React from "react";
import { useLanguage } from "@/providers/language-provider";
import { DataTable } from "@/components/ui/data-table";
import { useToast } from "@/hooks/use-toast";
import { MosqueMember } from "@/types/mosque-member";
import { Card } from "@/components/ui/card";
import { mosqueService } from "@/services/mosque.service";
import { mosqueMemberService } from "@/services/mosque-member.service";
import { Mosque } from "@/types/mosque";
import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useMediaQuery } from "@/hooks/use-media-query";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { memberFormSchema, MemberFormValues } from "@/types/mosque-member";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";

const errorAnimation = {
	initial: {
		opacity: 0,
		height: 0,
		marginTop: 0
	},
	animate: {
		opacity: 1,
		height: "auto",
		marginTop: 8,
		transition: {
			height: {
				type: "spring",
				stiffness: 500,
				damping: 30
			},
			opacity: {
				duration: 0.2
			}
		}
	},
	exit: {
		opacity: 0,
		height: 0,
		marginTop: 0,
		transition: {
			height: {
				duration: 0.2
			},
			opacity: {
				duration: 0.1
			}
		}
	}
};

const MemberForm = ({ onSubmit, isSubmitting, t, selectedMember }: { onSubmit: (values: MemberFormValues) => Promise<void>; isSubmitting: boolean; t: (key: string) => string; selectedMember?: MosqueMember | null }) => {
	const form = useForm<MemberFormValues>({
		resolver: zodResolver(memberFormSchema(t)),
		defaultValues: React.useMemo(() => ({
			name: selectedMember?.name || "",
			phone: selectedMember?.phone || "+966",
			id_number: selectedMember?.id_number?.toString() || "",
			membership: selectedMember?.membership || "volunteer",
		}), [selectedMember]),
	});

	const handleSubmit = async (values: MemberFormValues) => {
		await onSubmit(values);
		form.reset();
	};

	const formatPhoneNumber = (value: string): string => {
		// Remove any non-digit characters
		value = value.replace(/\D/g, '');

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

		return value;
	};

	const handleMemberPhoneChange = (
		e: React.ChangeEvent<HTMLInputElement>,
		form: ReturnType<typeof useForm<MemberFormValues>>
	) => {
		const formattedValue = formatPhoneNumber(e.target.value);
		form.setValue('phone', '+966' + formattedValue.replace(/\s/g, ''));
	};

	const formatIdNumber = (value: string | number | null | undefined): string => {
		if (value === null || value === undefined) return '';

		// Convert to string if it's a number
		const stringValue = value.toString();

		// Remove any non-digit characters
		const cleanValue = stringValue.replace(/\D/g, '');

		// Limit to 10 digits
		return cleanValue.slice(0, 10);
	};

	const handleMemberIdNumberChange = (
		e: React.ChangeEvent<HTMLInputElement>,
		form: ReturnType<typeof useForm<MemberFormValues>>
	) => {
		const formattedValue = formatIdNumber(e.target.value);
		form.setValue('id_number', formattedValue || '');
	};

	const renderMemberFormField = (
		form: ReturnType<typeof useForm<MemberFormValues>>,
		name: keyof MemberFormValues,
		placeholder: string,
		isDisabled = false,
		type: 'text' | 'phone' | 'id_number' = 'text'
	) => (
		<FormField
			control={form.control}
			name={name}
			render={({ field, fieldState }) => (
				<FormItem className="flex-1 h-[50px]">
					<div className="relative">
						<FormControl>
							{type === 'phone' ? (
								<div className="relative">
									<div className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground pointer-events-none">
										+966
									</div>
									<Input
										{...field}
										disabled={isDisabled}
										value={field.value.replace('+966', '').replace(/(\d{1})(\d{3})(\d{4})/, '$1 $2 $3')}
										onChange={(e) => handleMemberPhoneChange(e, form)}
										placeholder="5X XXX XXXX"
										className={cn(
											"pl-14 transition-all duration-200 text-lg tracking-wide h-10",
											fieldState.error && "border-destructive focus-visible:ring-destructive"
										)}
										dir="ltr"
									/>
								</div>
							) : type === 'id_number' ? (
								<Input
									{...field}
									disabled={isDisabled}
									value={formatIdNumber(field.value) || ''}
									onChange={(e) => handleMemberIdNumberChange(e, form)}
									placeholder={placeholder}
									className={cn(
										"h-10",
										fieldState.error && "border-destructive focus-visible:ring-destructive"
									)}
									maxLength={10}
								/>
							) : (
								<Input
									{...field}
									disabled={isDisabled}
									placeholder={placeholder}
									className={cn(
										"h-10",
										fieldState.error && "border-destructive focus-visible:ring-destructive"
									)}
								/>
							)}
						</FormControl>
						<AnimatePresence mode="wait">
							{fieldState.error && (
								<motion.div
									variants={errorAnimation}
									initial="initial"
									animate="animate"
									exit="exit"
									className="text-destructive text-sm absolute w-full"
								>
									{fieldState.error.message}
								</motion.div>
							)}
						</AnimatePresence>
					</div>
				</FormItem>
			)}
		/>
	);

	return (
		<Form {...form}>
			<form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
				{renderMemberFormField(form, 'name', t('mosques.form.members.name'))}
				{renderMemberFormField(form, 'phone', '', false, 'phone')}
				{renderMemberFormField(form, 'id_number', t('mosques.form.members.idNumber'), false, 'id_number')}
				<FormField
					control={form.control}
					name="membership"
					render={({ field }) => (
						<FormItem>
							<FormLabel>{t("mosques.form.members.membership")}</FormLabel>
							<FormControl>
								<Select onValueChange={field.onChange} defaultValue={field.value}>
									<SelectTrigger>
										<SelectValue placeholder={t("mosques.form.members.selectMembership")} />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="imam">{t("mosques.form.members.memberships.imam")}</SelectItem>
										<SelectItem value="muathen">{t("mosques.form.members.memberships.muathen")}</SelectItem>
										<SelectItem value="nazir1">{t("mosques.form.members.memberships.nazir1")}</SelectItem>
										<SelectItem value="nazir2">{t("mosques.form.members.memberships.nazir2")}</SelectItem>
										<SelectItem value="volunteer">{t("mosques.form.members.memberships.volunteer")}</SelectItem>
										<SelectItem value="permanent_volunteer">{t("mosques.form.members.memberships.permanent_volunteer")}</SelectItem>
									</SelectContent>
								</Select>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
				<Button type="submit" disabled={isSubmitting}>
					{isSubmitting ? "Loading..." : t("common.submit")}
				</Button>
			</form>
		</Form>
	);
};

interface CommunityTabProps {
	mosqueId: string;
}

export function CommunityTab({ mosqueId }: CommunityTabProps) {
	const { t, direction } = useLanguage();
	const { toast } = useToast();
	const [mosque, setMosque] = React.useState<Mosque | null>(null);
	const [drawerOpen, setDrawerOpen] = React.useState(false);
	const [selectedMember, setSelectedMember] = React.useState<MosqueMember | null>(null);
	const [isSubmitting, setIsSubmitting] = React.useState(false);
	const isDesktop = useMediaQuery("(min-width: 768px)");

	React.useEffect(() => {
		const fetchMosque = async () => {
			try {
				const response = await mosqueService.getMosque(mosqueId);
				setMosque(response.data);
			} catch (error) {
				console.error('Error fetching mosque:', error);
			}
		};

		fetchMosque();
	}, [mosqueId]);

	const columns = React.useMemo<ColumnDef<MosqueMember>[]>(
		() => [
			{
				accessorKey: "name",
				header: t("mosques.form.members.name"),
			},
			{
				accessorKey: "phone",
				header: t("mosques.form.members.phone"),
			},
			{
				accessorKey: "id_number",
				header: t("mosques.form.members.idNumber"),
			},
			{
				accessorKey: "membership",
				header: t("mosques.form.members.membership"),
				cell: ({ row }) => (
					<Badge>
						{t(`mosques.form.members.memberships.${row.original.membership}`)}
					</Badge>
				),
			},
			{
				id: "actions",
				cell: ({ row }) => (
					<div className="flex items-center gap-2">
						<Button
							variant="outline"
							size="sm"
							onClick={() => {
								setSelectedMember(row.original);
								setDrawerOpen(true);
							}}
						>
							{t("common.edit")}
						</Button>
					</div>
				),
			},
		],
		[t]
	);

	const DrawerComponent = isDesktop ? Sheet : Drawer;
	const DrawerContentComponent = isDesktop ? SheetContent : DrawerContent;
	const DrawerHeaderComponent = isDesktop ? SheetHeader : DrawerHeader;
	const DrawerTitleComponent = isDesktop ? SheetTitle : DrawerTitle;

	const onSubmit = async (values: MemberFormValues) => {
		try {
			setIsSubmitting(true);
			let response;
			if (selectedMember) {
				// Update existing member
				response = await mosqueMemberService.updateMember(selectedMember.id, {
					...values,
					mosque_id: mosqueId,
					gender: 'male',
					is_active: true,
				});
			} else {
				// Create new member
				response = await mosqueMemberService.createMember({
					...values,
					mosque_id: mosqueId,
					gender: 'male',
					is_active: true,
				});
			}

			if (!response) {
				throw new Error(t("common.error"));
			}

			// Refresh mosque data
			const updatedMosqueResponse = await mosqueService.getMosque(mosqueId);
			setMosque(updatedMosqueResponse.data);

			toast({
				title: t("common.success"),
			});
			setIsSubmitting(false)
			setDrawerOpen(false)
			setSelectedMember(null)

		} catch (error) {
			toast({
				title: t("common.error"),
				description: (error as Error).message,
				variant: "destructive",
			});
		} finally {
			setIsSubmitting(false);
			// setDrawerOpen(false);
			// setSelectedMember(undefined);
		}
	};

	if (!mosque) {
		return null;
	}

	return (
		<div className="space-y-4">
			<div className="flex justify-between items-center">
				<h2 className="text-2xl font-bold">{t("mosques.form.members.title")}</h2>
				<Button onClick={() => { setSelectedMember(null); setDrawerOpen(true); }} className="flex items-center gap-2">
					<Plus className="h-4 w-4" />
					{t("mosques.form.members.addMember")}
				</Button>
			</div>

			<Card className="p-6">
				<DataTable
					data={mosque.prayers || []}
					columns={columns}
					searchPlaceholder={t("members.searchPlaceholder")}
				/>
			</Card>

			<DrawerComponent open={drawerOpen} onOpenChange={setDrawerOpen}>
				<DrawerContentComponent 
					side={direction === 'rtl' ? 'left' : 'right'} 
					className="w-full sm:max-w-xl overflow-y-auto"
				>
					<DrawerHeaderComponent>
						<DrawerTitleComponent>
							{selectedMember ? t("members.editMember") : t("members.addMember")}
						</DrawerTitleComponent>
					</DrawerHeaderComponent>
					<div className="mt-4 px-4">
						<MemberForm onSubmit={onSubmit} isSubmitting={isSubmitting} t={t} selectedMember={selectedMember} />
					</div>

				</DrawerContentComponent>
			</DrawerComponent>
		</div>
	);
}