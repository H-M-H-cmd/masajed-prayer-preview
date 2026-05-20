"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { useLanguage } from "@/providers/language-provider";
import { Loader2 } from "lucide-react";
import { Need, CreateNeedData } from "@/types/need";

const needSchema = z.object({
	title: z.string().min(1, "Title is required"),
	status: z.enum(["new", "progress", "completed", "cancelled"]),
	date: z.string(),
	contractor_id: z.string(),
	cost: z.number().min(0),
});

interface UpdateCreateFormProps {
	need?: Need;
	onSubmit: (data: CreateNeedData) => Promise<void>;
	isLoading?: boolean;
}

// Mock contractors data
const mockContractors = [
	{ id: "tewt3234", name: "احمد محمد" },
	{ id: "tewt3235", name: "محمد احمد" },
	{ id: "tewt3236", name: "خالد محمد" },
];

export function UpdateCreateForm({ need, onSubmit, isLoading }: UpdateCreateFormProps) {
	const { t } = useLanguage();

	const form = useForm<CreateNeedData>({
		resolver: zodResolver(needSchema),
		defaultValues: {
			title: need?.title || "",
			status: need?.status || "new",
			date: need?.date || new Date().toISOString().split('T')[0],
			contractor_id: need?.contractor?.id || "",
			cost: need?.cost || 0,
		},
	});

	return (
		<Form {...form}>
			<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
				<FormField
					control={form.control}
					name="title"
					render={({ field }) => (
						<FormItem>
							<FormLabel>{t("needs.title")}</FormLabel>
							<FormControl>
								<Input {...field} />
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

				<FormField
					control={form.control}
					name="status"
					render={({ field }) => (
						<FormItem>
							<FormLabel>{t("needs.status")}</FormLabel>
							<Select onValueChange={field.onChange} defaultValue={field.value}>
								<FormControl>
									<SelectTrigger>
										<SelectValue placeholder={t("needs.selectStatus")} />
									</SelectTrigger>
								</FormControl>
								<SelectContent>
									{["new", "progress", "completed", "cancelled"].map((status) => (
										<SelectItem key={status} value={status}>
											{t(`needs.statuses.${status}`)}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
							<FormMessage />
						</FormItem>
					)}
				/>

				<FormField
					control={form.control}
					name="date"
					render={({ field }) => (
						<FormItem>
							<FormLabel>{t("needs.date")}</FormLabel>
							<FormControl>
								<Input type="date" {...field} />
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

				<FormField
					control={form.control}
					name="contractor_id"
					render={({ field }) => (
						<FormItem>
							<FormLabel>{t("needs.contractor")}</FormLabel>
							<Select onValueChange={field.onChange} defaultValue={field.value}>
								<FormControl>
									<SelectTrigger>
										<SelectValue placeholder={t("needs.selectContractor")} />
									</SelectTrigger>
								</FormControl>
								<SelectContent>
									{mockContractors.map((contractor) => (
										<SelectItem key={contractor.id} value={contractor.id}>
											{contractor.name}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
							<FormMessage />
						</FormItem>
					)}
				/>

				<FormField
					control={form.control}
					name="cost"
					render={({ field }) => (
						<FormItem>
							<FormLabel>{t("needs.cost")}</FormLabel>
							<FormControl>
								<Input
									type="number"
									{...field}
									onChange={(e) => field.onChange(Number(e.target.value))}
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

				<div className="flex justify-end">
					<Button type="submit" disabled={isLoading}>
						{isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
						{need ? t("common.save") : t("common.create")}
					</Button>
				</div>
			</form>
		</Form>
	);
}