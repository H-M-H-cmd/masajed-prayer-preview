"use client";

import * as React from "react";
import { Event } from "@/types/event";
import { Need } from "@/types/need";
import { Donation } from "@/types/donation";
import { VolunteerOpportunity } from "@/types/volunteer";

interface LayoutContextType {
	eventDrawerOpen: boolean;
	setEventDrawerOpen: (open: boolean) => void;
	selectedEvent: Event | null;
	setSelectedEvent: (event: Event | null) => void;
	volunteerDrawerOpen: boolean;
	setVolunteerDrawerOpen: (open: boolean) => void;
	selectedVolunteer: VolunteerOpportunity | null;
	setSelectedVolunteer: (volunteer: VolunteerOpportunity | null) => void;
	needDrawerOpen: boolean;
	setNeedDrawerOpen: (open: boolean) => void;
	selectedNeed: Need | null;
	setSelectedNeed: (need: Need | null) => void;
	selectedDonation: Donation | null;
	setSelectedDonation: (donation: Donation | null) => void;
}

const LayoutContext = React.createContext<LayoutContextType | undefined>(undefined);

export function LayoutProvider({ children }: { children: React.ReactNode }) {
	const [eventDrawerOpen, setEventDrawerOpen] = React.useState(false);
	const [selectedEvent, setSelectedEvent] = React.useState<Event | null>(null);
	const [volunteerDrawerOpen, setVolunteerDrawerOpen] = React.useState(false);
	const [selectedVolunteer, setSelectedVolunteer] = React.useState<VolunteerOpportunity | null>(null);
	const [needDrawerOpen, setNeedDrawerOpen] = React.useState(false);
	const [selectedNeed, setSelectedNeed] = React.useState<Need | null>(null);
	const [selectedDonation, setSelectedDonation] = React.useState<Donation | null>(null);

	return (
		<LayoutContext.Provider
			value={{
				eventDrawerOpen,
				setEventDrawerOpen,
				selectedEvent,
				setSelectedEvent,
				volunteerDrawerOpen,
				setVolunteerDrawerOpen,
				selectedVolunteer,
				setSelectedVolunteer,
				needDrawerOpen,
				setNeedDrawerOpen,
				selectedNeed,
				setSelectedNeed,
				selectedDonation,
				setSelectedDonation,
			}}
		>
			{children}
		</LayoutContext.Provider>
	);
}

export function useLayoutContext() {
	const context = React.useContext(LayoutContext);
	if (context === undefined) {
		throw new Error("useLayoutContext must be used within a LayoutProvider");
	}
	return context;
}