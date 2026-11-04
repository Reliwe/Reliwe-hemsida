import { ProjectItem } from "./ProjectRenderer";

export type ProjectCta = { href: string; label: string };

// Which call-to-action a project card shows: the subpage link takes precedence,
// otherwise the "Intresseanmälan" button linking to /intresse with the project pre-selected.
export function getProjectCta(project: ProjectItem): ProjectCta | null {
	if (!project.slug) return null;
	if (project.hasSubpage) {
		return { href: `/${project.slug}`, label: "Läs mer & anmäl intresse" };
	}
	if (project.showInterestButton) {
		return { href: `/intresse?projekt=${encodeURIComponent(project.slug)}`, label: "Intresseanmälan" };
	}
	return null;
}
