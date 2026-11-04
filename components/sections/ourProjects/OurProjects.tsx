import IntroBanner from "@/components/ui/introBanner/IntroBanner";
import Link from "next/link";
import { client } from "@/sanity/lib/client";
import { urlFor } from "@/sanity/lib/image";
import ProjectsList from "./ProjectList";
import { Suspense } from "react";
import { Fact, Project } from "@/app/types/types";

type SanityImage = {
    _type: "image";
    asset: {
        _ref: string;
        _type: "reference";
    };
    alt?: string;
};

type SanityProject = {
	title: string;
	text: any[];
	facts?: Fact[];
	images: SanityImage[];
	status: "ongoing" | "done" | "planned";
	orderRank?: string;
	slug: { current: string };
	hasSubpage?: boolean;
	showInterestButton?: boolean;
	subpage?: { title?: string; textBlocks?: string[] };
};

type IntroBannerData = {
    title: string;
    texts: string[];
    image?: SanityImage;
};

type OurProjectsPageData = {
    introBanner: IntroBannerData;
    projects: Project[];
};

async function getOurProjectsPage(): Promise<OurProjectsPageData> {
    const data = await client.fetch(`
        *[_type == "projectsPage"][0]{
            introBanner {
                title,
                texts,
                image
            }
        }
    `, {}, { next: { revalidate: 0 }});

    // showInterestButton: a hidden Studio field keeps its stored value, so eligibility is
    // re-checked here. Same rule as the project list on /intresse (app/(main)/intresse/page.tsx)
    // and the field's hidden() in sanity/schemaTypes/schemas/estateProject.ts.
    const projects = await client.fetch(`
        *[_type == "estateProject"]
		| order(orderRank asc, _createdAt desc)
		{
            title,
            text,
            facts,
            images,
            status,
			orderRank,
			slug {
				current
			},
			hasSubpage,
			"showInterestButton": showInterestButton == true && hasSubpage != true && (
				((status == "ongoing" || status == "planned") && excludeFromInterestForm != true)
				|| showInInterestForm == true
			),
			subpage {
				title,
				textBlocks
			}
        }
    `, {}, { next: { revalidate: 0 }});

    const formattedProjects: Project[] = projects.map((project: SanityProject) => ({
        ...project,
		slug: project.slug?.current || "",
        imgUrls: project.images?.map((img: SanityImage) => 
			urlFor(img)
			.width(2000)
			.quality(90)
			.auto("format")
			.url()
		) ?? [],
    }));

    const introBanner: IntroBannerData = data?.introBanner || {
        title: "",
        texts: [],
    };

    return {
        introBanner,
        projects: formattedProjects,
    };
}

export default async function OurProjects() {
    const data = await getOurProjectsPage();

    return (
        <section>
			<div className="md:pt-36 lg:pt-16 xl:pt-6">
				<IntroBanner
					title={data.introBanner.title}
					texts={data.introBanner.texts}
					imgUrl={
						data.introBanner.image
							? urlFor(data.introBanner.image).width(2000)
							.quality(95)
							.auto("format")
							.url()
							: ""
					}
					imgAlt={data.introBanner.image?.alt || ""}
					screenReaderH1="Våra projekt - Reliwe bostadsprojekt"
					ctaNode={
						<p className="max-w-prose">
							<Link href="/intresse" className="underline underline-offset-2 hover:opacity-60 transition-opacity duration-200">
								Anmäl ditt intresse
							</Link>
							{" "}och bli först med att ta del av våra nya projekt och lediga hem.
						</p>
					}
				/>
			</div>
            <Suspense fallback={<div>Loading projects...</div>}>
				<ProjectsList projects={data.projects} />
			</Suspense>
        </section>
    );
}