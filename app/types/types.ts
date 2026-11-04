import { SanityImageSource } from "@sanity/image-url/lib/types/types";
import { PortableTextBlock } from "@portabletext/react";

type SanityImage = {
    asset: SanityImageSource;
    alt?: string;
};

export type Fact = {
    _key?: string;
    label?: string;
    value?: string;
};

export type Project = {
    title: string;
    text: any[];
    facts?: Fact[];
    imgUrls: string[];
    images?: SanityImage[];
    status: "ongoing" | "done" | "planned";
    slug: string;
    hasSubpage?: boolean;
    showInterestButton?: boolean;
};

type FactCard = {
    title?: string;
};

type IntroSection = {
    title?: string;
    image?: SanityImage;
    text?: string;
};

type Section = {
    title?: string;
    content?: PortableTextBlock[];
    image?: SanityImage;
    imagePosition: "left" | "right";
};

export type ProjectWithSubpage = Project & {
    hasSubpage: true;
    subpage: {
        title?: string;
        heroImage?: SanityImage;
        availableRooms?: number[];
        availableHousingTypes?: string[];
        intro?: IntroSection;
        factCard?: FactCard;
        sections?: Section[];
		gallery?: SanityImage[];
    };
};