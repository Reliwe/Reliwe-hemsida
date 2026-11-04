"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Input from "../inputs/Input";
import TextArea from "../inputs/TextArea";
import PillSelect from "../inputs/PillSelect";
import CheckboxGroup from "../inputs/CheckboxGroup";
import ButtonAnimationWrapper from "../buttons/newButtons/ButtonAnimationWrapper";
import ButtonBackground from "../buttons/newButtons/ButtonBackground";

interface Project {
	_id: string;
	title: string;
	slug: string | null;
}

interface FormFields {
	selectedProjects: string[];
	firstName: string;
	lastName: string;
	email: string;
	phone: string;
	rooms: string[];
	extras: string[];
	message: string;
}

interface FormErrors {
	selectedProjects?: string;
	firstName?: string;
	lastName?: string;
	email?: string;
	phone?: string;
	rooms?: string;
	extras?: string;
	message?: string;
}

const NAME_RE = /^[\p{L}\s'\-]{2,100}$/u;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE_RE = /^(\+46|0)\d[\d\s\-]{6,14}$/;

const EXTRAS_OPTIONS = [
	{ label: "Bostadsrätt", value: "bostadsratt" },
	{ label: "Hyresrätt", value: "hyresratt" },
];

const ROOM_OPTIONS = ["1 rok", "2 rok", "3 rok", "4 rok", "5+ rok"];

function validateClient(fields: FormFields): FormErrors {
	const errors: FormErrors = {};
	if (fields.selectedProjects.length === 0) {
		errors.selectedProjects = "Välj minst ett projekt.";
	}
	if (!NAME_RE.test(fields.firstName.trim())) {
		errors.firstName = "Ange ett giltigt förnamn (2–100 tecken).";
	}
	if (!NAME_RE.test(fields.lastName.trim())) {
		errors.lastName = "Ange ett giltigt efternamn (2–100 tecken).";
	}
	if (!EMAIL_RE.test(fields.email.trim())) {
		errors.email = "Ange en giltig e-postadress.";
	}
	if (!PHONE_RE.test(fields.phone.replace(/\s/g, ""))) {
		errors.phone = "Ange ett giltigt telefonnummer (t.ex. 070-123 45 67).";
	}
	if (fields.rooms.length === 0) {
		errors.rooms = "Välj minst ett antal rum.";
	}
	if (fields.message.length > 1000) {
		errors.message = "Meddelandet får vara max 1 000 tecken.";
	}
	return errors;
}

function SuccessState() {
	return (
		<div className="flex flex-col items-center gap-6 text-center py-16">
			<div className="w-20 h-20 rounded-full bg-[var(--reliwe-green-accent)] flex items-center justify-center">
				<svg className="w-10 h-10 text-[var(--reliwe-green)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
					<path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
				</svg>
			</div>
			<div className="flex flex-col gap-2">
				<h2 className="font-extrabold text-3xl">Tack för din intresseanmälan!</h2>
				<p className="text-gray-500 max-w-prose mx-auto">Vi har tagit emot dina uppgifter och återkommer med mer information om de projekt du valt.</p>
			</div>
			<Link href="/projekt">
				<ButtonAnimationWrapper hasMaxWidth={false}>
					<ButtonBackground label="Se alla projekt" />
				</ButtonAnimationWrapper>
			</Link>
		</div>
	);
}

export default function IntressePageForm({
	projects,
	initialSelectedProjects = [],
}: {
	projects: Project[];
	initialSelectedProjects?: string[];
}) {
	const [fields, setFields] = useState<FormFields>({
		selectedProjects: initialSelectedProjects,
		firstName: "",
		lastName: "",
		email: "",
		phone: "",
		rooms: [],
		extras: [],
		message: "",
	});
	const [errors, setErrors] = useState<FormErrors>({});
	const [touched, setTouched] = useState<Partial<Record<keyof FormFields, boolean>>>({});
	const [submitError, setSubmitError] = useState<string | null>(null);
	const [loading, setLoading] = useState(false);
	const [submitted, setSubmitted] = useState(false);
	const successRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (submitted) {
			successRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
		}
	}, [submitted]);

	const setField = <K extends keyof FormFields>(key: K, value: FormFields[K]) => {
		setFields((prev) => ({ ...prev, [key]: value }));
		if (touched[key]) {
			const next = { ...fields, [key]: value };
			const nextErrors = validateClient(next);
			setErrors((prev) => ({ ...prev, [key]: nextErrors[key] }));
		}
	};

	const markTouched = (key: keyof FormFields) => {
		setTouched((prev) => ({ ...prev, [key]: true }));
		const nextErrors = validateClient(fields);
		setErrors((prev) => ({ ...prev, [key]: nextErrors[key] }));
	};

	const toggleProject = (title: string) => {
		const next = fields.selectedProjects.includes(title)
			? fields.selectedProjects.filter((p) => p !== title)
			: [...fields.selectedProjects, title];
		setField("selectedProjects", next);
		setTouched((prev) => ({ ...prev, selectedProjects: true }));
	};

	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		setSubmitError(null);

		const clientErrors = validateClient(fields);
		if (Object.keys(clientErrors).length > 0) {
			setErrors(clientErrors);
			setTouched({
				selectedProjects: true,
				firstName: true,
				lastName: true,
				email: true,
				phone: true,
				rooms: true,
				extras: true,
				message: true,
			});
			return;
		}

		setLoading(true);
		try {
			const res = await fetch("/api/intresse", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(fields),
			});

			if (res.ok) {
				setSubmitted(true);
				return;
			}

			const data = await res.json();
			if (res.status === 422 && data.errors) {
				setErrors(data.errors as FormErrors);
				setTouched({
					selectedProjects: true,
					firstName: true,
					lastName: true,
					email: true,
					phone: true,
					rooms: true,
					extras: true,
					message: true,
				});
			} else if (res.status === 429) {
				setSubmitError(data.error ?? "För många försök. Vänta en stund och försök igen.");
			} else {
				setSubmitError("Något gick fel. Kontrollera dina uppgifter och försök igen.");
			}
		} catch {
			setSubmitError("Kunde inte nå servern. Kontrollera din internetanslutning och försök igen.");
		} finally {
			setLoading(false);
		}
	};

	if (submitted) {
		return <div ref={successRef}><SuccessState /></div>;
	}

	return (
		<form className="flex flex-col gap-8" onSubmit={handleSubmit} noValidate>
			<div className="flex flex-col gap-3">
				<p className="font-light tracking-wider text-[var(--reliwe-green)]">INTRESSEANMÄLAN</p>
				<h1 className="font-extrabold text-4xl md:text-5xl">Var med från start</h1>
				<p className="max-w-prose text-gray-600">
					Anmäl ditt intresse och få mer information om våra projekt. Detta är ingen köplats, utan ett sätt för oss att dela mer information och få en bild av intresset.
				</p>
			</div>

			<div className="border border-[var(--reliwe-green-accent)] rounded-2xl p-6 md:p-10 flex flex-col gap-8">

				{/* Project selection */}
				<div className="flex flex-col gap-3">
					<div className="flex flex-col gap-1">
						<label className="font-semibold text-base pl-1">
							Vilket projekt intresserar dig?
							<span className="text-[var(--reliwe-green)] text-lg"> *</span>
						</label>
						<p className="text-sm text-gray-500 pl-1">Du kan välja flera projekt.</p>
					</div>
					{projects.length > 0 ? (
						<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
							{projects.map((project) => {
								const selected = fields.selectedProjects.includes(project.title);
								return (
									<button
										key={project._id}
										type="button"
										onClick={() => toggleProject(project.title)}
										aria-pressed={selected}
										className={`
											flex items-center gap-3 px-5 py-4 rounded-xl border text-left transition-colors cursor-pointer
											${selected
												? "border-[var(--reliwe-green)] bg-[var(--reliwe-green)] text-white"
												: "border-[var(--reliwe-green-accent)] bg-[var(--reliwe-green-accent)] hover:bg-[var(--reliwe-green-accent2)] hover:border-[var(--reliwe-green-accent2)]"
											}
										`}
									>
										<span className={`w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-colors ${selected ? "border-white bg-white" : "border-current"}`}>
											{selected && (
												<svg className="w-3 h-3 text-[var(--reliwe-green)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
													<path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
												</svg>
											)}
										</span>
										<span className="font-medium text-sm">{project.title}</span>
									</button>
								);
							})}
						</div>
					) : (
						<p className="text-sm text-gray-400 pl-1">Inga projekt tillgängliga just nu.</p>
					)}
					{touched.selectedProjects && errors.selectedProjects && (
						<p className="pl-1 text-sm text-red-500">{errors.selectedProjects}</p>
					)}
					<p className="pl-1 text-sm text-gray-500">
						Fundrar du över något annat projekt?{" "}
						<a href="mailto:info@reliwe.se" className="text-[var(--reliwe-green)] font-medium hover:underline">
							Kontakta oss gärna på info@reliwe.se
						</a>
					</p>
				</div>

				<div className="border-t border-[var(--reliwe-green-accent)]" />

				{/* Personal details */}
				<div className="flex flex-col gap-4">
					<p className="font-semibold text-base pl-1">Dina uppgifter</p>
					<div className="flex flex-col md:flex-row gap-4 md:gap-6">
						<Input
							label="Förnamn"
							placeholder="Erik"
							required
							value={fields.firstName}
							onChange={(e) => setField("firstName", e.target.value)}
							error={touched.firstName ? errors.firstName : undefined}
							autoComplete="given-name"
							onBlur={() => markTouched("firstName")}
						/>
						<Input
							label="Efternamn"
							placeholder="Andersson"
							required
							value={fields.lastName}
							onChange={(e) => setField("lastName", e.target.value)}
							error={touched.lastName ? errors.lastName : undefined}
							autoComplete="family-name"
							onBlur={() => markTouched("lastName")}
						/>
					</div>
					<div className="flex flex-col md:flex-row gap-4 md:gap-6">
						<Input
							label="E-post"
							placeholder="erik.andersson@mail.se"
							required
							type="email"
							value={fields.email}
							onChange={(e) => setField("email", e.target.value)}
							error={touched.email ? errors.email : undefined}
							autoComplete="email"
							onBlur={() => markTouched("email")}
						/>
						<Input
							label="Telefon"
							placeholder="070-123 45 67"
							required
							type="tel"
							value={fields.phone}
							onChange={(e) => setField("phone", e.target.value)}
							error={touched.phone ? errors.phone : undefined}
							autoComplete="tel"
							onBlur={() => markTouched("phone")}
						/>
					</div>
				</div>

				<div className="border-t border-[var(--reliwe-green-accent)]" />

				{/* Preferences */}
				<div className="flex flex-col gap-6">
					<p className="font-semibold text-base pl-1">Önskemål</p>
					<PillSelect
						options={ROOM_OPTIONS}
						value={fields.rooms}
						onToggle={(option) => {
							const rooms = fields.rooms.includes(option)
								? fields.rooms.filter((r) => r !== option)
								: [...fields.rooms, option];
							setField("rooms", rooms);
							setTouched((prev) => ({ ...prev, rooms: true }));
						}}
						error={touched.rooms ? errors.rooms : undefined}
						required
					/>
					<CheckboxGroup
						name="extras"
						label="Upplåtelseform"
						options={EXTRAS_OPTIONS}
						value={fields.extras}
						onChange={(v) => setField("extras", v)}
					/>
				</div>

				<div className="border-t border-[var(--reliwe-green-accent)]" />

				{/* Message */}
				<TextArea
					value={fields.message}
					onChange={(e) => setField("message", e.target.value)}
					error={touched.message ? errors.message : undefined}
					maxLength={1000}
					onBlur={() => markTouched("message")}
				/>

				{submitError && (
					<p className="text-sm text-red-500 text-center">{submitError}</p>
				)}

				<ButtonAnimationWrapper hasMaxWidth={false}>
					<ButtonBackground label={loading ? "Skickar..." : "Skicka intresseanmälan"} disabled={loading} />
				</ButtonAnimationWrapper>

				<p className="text-center text-xs text-gray-500">
					Genom att skicka in formuläret godkänner du vår{" "}
					<Link href="/integritetspolicy" className="underline">
						integritetspolicy
					</Link>
					.
				</p>
			</div>
		</form>
	);
}
