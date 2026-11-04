import ImagesDisplay from "./ImagesDisplay";
import ImageDisplay from "./ImageDisplay";
import ProjectCardMulti from "./ProjectCardMulti";
import ProjectCardSingle from "./ProjectCardSingle";
import { Fact } from "@/app/types/types";

export type SubPage = {
	title: string;
	textBlocks: string[];
}

export type ProjectItem = {
	title: string;
	text: any[];
	facts?: Fact[];
	status: "ongoing" | "done" | "planned";
	imgUrls: string[];
	hasSubpage?: boolean;
	showInterestButton?: boolean;
	slug: string;
}

interface ProjectRendererProps {
	project: ProjectItem;
	index: number;
}

export default function ProjectRenderer({ project, index }: ProjectRendererProps) {
	const hasMultipleImages = project.imgUrls.length > 1;

	return (
		<>
			{hasMultipleImages ? (
				<ProjectCardMulti project={project} index={index}/>
			): (
				<ProjectCardSingle project={project} index={index}/>
			)}
		</>
	);
};