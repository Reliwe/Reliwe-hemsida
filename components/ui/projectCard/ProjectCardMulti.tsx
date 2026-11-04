import { colorScheme } from "./colorScheme";
import ImagesDisplay from "./ImagesDisplay";
import { ProjectItem } from "./ProjectRenderer";
import ProjectStats from "./ProjectStats";
import Link from "next/link";
import ButtonAnimationWrapper from "../buttons/newButtons/ButtonAnimationWrapper";
import ButtonBackground from "../buttons/newButtons/ButtonBackground";
import ProjectText from "./ProjectText";
import { getProjectCta } from "./projectCta";

interface ProjectCardMultiProps {
	project: ProjectItem;
	index: number;
}

export default function ProjectCardMulti({ project, index }: ProjectCardMultiProps) {
	const clampedIndex = index % colorScheme.length;
	const cta = getProjectCta(project);

	return (
		<>
			<article
				id={project.slug || undefined}
				className="w-full scroll-mt-[84px] body-x-padding section-y-padding flex flex-col items-vertical-gap md:gap-24"
				style={{ backgroundColor: colorScheme[clampedIndex].backgroundColor }}
			>
				<div className="flex flex-col md:flex-row items-vertical-gap">
					<div className="w-full md:w-1/2 flex flex-col justify-between">
						<h2 className="heading text-center md:text-start">
							{project.title}
						</h2>
						{cta && (
							<Link href={cta.href} className="hidden md:block">
								<ButtonAnimationWrapper>
									<ButtonBackground label={cta.label} />
								</ButtonAnimationWrapper>
							</Link>
						)}
					</div>
					<div className="w-full md:w-1/2 flex flex-col items-vertical-gap">
						<ProjectText text={project.text} />
						{/* md:pr-4 matches the image carousel's slide padding so the right edges line up */}
						<ProjectStats project={project} className="md:pr-4" />
					</div>
				</div>
				<div>
					<ImagesDisplay imgUrls={project.imgUrls} projectName={project.title} clampedIndex={clampedIndex} />
				</div>
				{cta && (
					<div className="flex flex-row justify-center">
						<Link href={cta.href} className="md:hidden">
							<ButtonAnimationWrapper hasMaxWidth={false} >
								<ButtonBackground label={cta.label} />
							</ButtonAnimationWrapper>
						</Link>
					</div>
				)}
			</article>

			<div className="h-20 w-full" style={{ backgroundColor: colorScheme[clampedIndex].backgroundColor }} />
		</>
	);
};
