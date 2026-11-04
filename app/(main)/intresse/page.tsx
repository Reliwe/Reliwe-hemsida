import { client } from "@/sanity/lib/client";
import IntressePageForm from "@/components/ui/forms/IntressePageForm";
import Footer from "@/components/ui/footer/Footer";
import { Metadata } from "next";

export const metadata: Metadata = {
	title: "Intresseanmälan - Reliwe",
	description: "Anmäl ditt intresse för Reliwes projekt och få mer information direkt till dig.",
};

export default async function IntressePage({
	searchParams,
}: {
	searchParams: Promise<{ projekt?: string | string[] }>;
}) {
	// Keep this eligibility rule in sync with showInterestButton in
	// components/sections/ourProjects/OurProjects.tsx and sanity/schemaTypes/schemas/estateProject.ts.
	const projects = await client.fetch<{ _id: string; title: string; slug: string | null }[]>(
		`*[_type=="estateProject" && (((status=="ongoing" || status=="planned") && excludeFromInterestForm!=true) || showInInterestForm==true)] | order(title asc) { _id, title, "slug": slug.current }`,
		{},
		{ next: { revalidate: 0 } }
	);

	// ?projekt=<slug> pre-selects that project, e.g. from the "Intresseanmälan" button in the project list.
	// Only projects the form actually lists can be pre-selected.
	const { projekt } = await searchParams;
	const preselectSlug = Array.isArray(projekt) ? projekt[0] : projekt;
	const preselected = preselectSlug ? projects.find((p) => p.slug === preselectSlug) : undefined;

	return (
		<>
			<main className="pt-32 pb-24 body-x-padding">
				<div className="xl:container mx-auto max-w-3xl">
					<IntressePageForm
						projects={projects}
						initialSelectedProjects={preselected ? [preselected.title] : []}
					/>
				</div>
			</main>
			<Footer />
		</>
	);
}
