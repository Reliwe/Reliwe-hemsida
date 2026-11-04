import { colorScheme } from "./colorScheme";
import ImageDisplay from "./ImageDisplay";
import { ProjectItem } from "./ProjectRenderer";
import ProjectStats from "./ProjectStats";
import Link from "next/link";
import ButtonAnimationWrapper from "../buttons/newButtons/ButtonAnimationWrapper";
import ButtonBackground from "../buttons/newButtons/ButtonBackground";
import ProjectText from "./ProjectText";
import { getProjectCta } from "./projectCta";

interface ProjectCardSingleProps {
	project: ProjectItem;
	index: number;
}

export default function ProjectCardSingle({ project, index }: ProjectCardSingleProps) {
	const clampedIndex = index % colorScheme.length;
	const cta = getProjectCta(project);

	return (
		<>
			<article
				id={project.slug || undefined}
				className="w-full min-h-[calc(100vh)] scroll-mt-[84px] body-x-padding section-y-padding flex flex-col items-vertical-gap"
				style={{ backgroundColor: colorScheme[clampedIndex].backgroundColor }}
			>
				<div>
					<h2 className="heading text-center md:text-start">
						{project.title}
					</h2>
				</div>
				<div className="flex flex-1 items-end">
					<div className="w-full flex flex-col md:flex-row justify-between items-vertical-gap">
						<div className="max-w-prose flex flex-col justify-between items-vertical-gap">
							<div className="flex flex-col gap-12">
								<ProjectText text={project.text} />
								{cta && (
									<Link href={cta.href} className="hidden md:block">
										<ButtonAnimationWrapper hasMaxWidth={false} >
											<ButtonBackground label={cta.label} />
										</ButtonAnimationWrapper>
									</Link>
								)}
							</div>
							<ProjectStats project={project} />

						</div>
						<div className="relative w-full md:max-w-[45vw]">
							<ImageDisplay imgUrls={project.imgUrls} projectName={project.title} />
						</div>
					</div>
				</div>
				{cta && (
						<div className="flex flex-row justify-center md:hidden">
							<Link href={cta.href}>
								<ButtonAnimationWrapper>
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