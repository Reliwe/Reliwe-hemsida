import { defineType, defineField } from "sanity";

export const estateProject = defineType({
    name: "estateProject",
    title: "Fastighetsprojekt",
    type: "document",
    fields: [
        defineField({
            name: "title",
            title: "Projekttitel",
            type: "string",
            validation: Rule => Rule.required().error("Projekttitel krävs"),
            description: "t.ex. 'Ekängen, Lidköping'"
        }),
        defineField({
            name: "text",
            title: "Beskrivning",
            type: "array",
            of: [
                {
                    type: "block",
                    styles: [{ title: "Normal", value: "normal" }],
                    lists: [],
                    marks: {
                        decorators: [
                            { title: "Fet", value: "strong" },
                            { title: "Kursiv", value: "em" },
                        ],
                        annotations: [
                            {
                                name: "link",
                                type: "object",
                                title: "Länk",
                                fields: [
                                    {
                                        name: "href",
                                        type: "url",
                                        title: "URL",
                                        validation: Rule => Rule.uri({ allowRelative: true })
                                    }
                                ]
                            }
                        ]
                    }
                }
            ],
            validation: Rule => Rule.required().error("Beskrivning krävs")
        }),
        defineField({
            name: "facts",
            title: "Fakta",
            type: "array",
            description: "Visas i projektlistan och i faktakortet på undersidan, t.ex. Byggstart: 2026",
            of: [
                {
                    type: "object",
                    title: "Rad",
                    fields: [
                        {
                            name: "label",
                            title: "Titel",
                            type: "string",
                            description: "t.ex. Byggstart",
                            validation: Rule => Rule.required().error("Titel krävs")
                        },
                        {
                            name: "value",
                            title: "Värde",
                            type: "string",
                            description: "t.ex. 2026",
                            validation: Rule => Rule.required().error("Värde krävs")
                        }
                    ],
                    preview: {
                        select: { title: "label", subtitle: "value" }
                    }
                }
            ]
        }),
        defineField({
            name: "images",
            title: "Projektbilder",
            type: "array",
            of: [{ 
                type: "image",
                options: {
                    hotspot: true
                },
                fields: [
                    {
                        name: "alt",
                        type: "string",
                        title: "Alternativ text",
                        description: "Beskrivning av bilden för sökmotorer och tillgänglighet"
                    }
                ]
            }],
            validation: Rule => Rule.required().error("Minst en bild krävs")
        }),
        defineField({
            name: "status",
            title: "Projekt Status",
            type: "string",
            options: {
                list: [
                    { title: "Pågående", value: "ongoing" },
                    { title: "Planerade", value: "planned" },
                    { title: "Genomförda", value: "done" },
                ],
                layout: "radio",
            },
            validation: (Rule) => Rule.required().error("Projektstatus krävs.")
        }),
        defineField({
            name: "showInInterestForm",
            title: "Visa i intresseanmälan",
            type: "boolean",
            description: "Bocka i för att visa detta projekt som valbar i intresseanmälan på andra projektsidor (används för ej pågående projekt).",
            initialValue: false,
        }),
        defineField({
            name: "excludeFromInterestForm",
            title: "Exkludera från intresseanmälan",
            type: "boolean",
            description: "Bocka i för att dölja detta pågående eller planerade projekt från intresseanmälan.",
            initialValue: false,
        }),
        defineField({
            name: "orderRank",
            type: "string",
            hidden: true,
        }),
        defineField({
            name: "hasSubpage",
            title: "Har undersida?",
            type: "boolean",
            initialValue: false
        }),
        defineField({
            name: "showInterestButton",
            title: "Visa knapp för intresseanmälan",
            type: "boolean",
            description: "Visar knappen \"Intresseanmälan\" i projektlistan. Knappen leder till den allmänna intresseanmälan med projektet förvalt. Valet finns bara för projekt utan undersida som visas i intresseanmälan.",
            initialValue: false,
            // Same eligibility rule as the project list on /intresse.
            // Keep in sync with the GROQ in components/sections/ourProjects/OurProjects.tsx.
            hidden: ({ document }) => {
                if (document?.hasSubpage) return true;
                const listedByStatus =
                    (document?.status === "ongoing" || document?.status === "planned") &&
                    document?.excludeFromInterestForm !== true;
                return !(listedByStatus || document?.showInInterestForm === true);
            },
        }),
        defineField({
            name: "slug",
            title: "Slug",
            type: "slug",
            options: { 
                source: "title",
                slugify: (input) =>
                    input
                        .toLowerCase()
                        .replace(/å/g, "a")
                        .replace(/ä/g, "a")
                        .replace(/ö/g, "o")
                        .replace(/[^a-z0-9]+/g, "-")
                        .replace(/(^-|-$)+/g, "")
            },
            validation: Rule => Rule.required()
        }),
        defineField({
            name: "subpage",
            title: "Undersida",
            type: "object",
            description: "Valfri undersida med extra information",
            hidden: ({ document }) => !document?.hasSubpage,
            fields: [
                {
                    name: "heroImage",
                    title: "Hero-bild",
                    type: "image",
                    options: { hotspot: true },
                    fields: [
                        {
                            name: "alt",
                            title: "Alternativ text",
                            type: "string"
                        }
                    ]
                },
				{
					name: "intro",
					title: "Introduktionssektion",
					type: "object",
					fields: [
						{
							name: "title",
							title: "Undersidans titel",
							type: "string",
							description: "Om tom används projekttitel"
						},
						{
							name: "image",
							title: "Bild",
							type: "image",
							options: { hotspot: true },
							fields: [
								{
									name: "alt",
									title: "Alternativ text",
									type: "string"
								}
							]
						},
						{
							name: "text",
							title: "Textblock",
							type: "text",
							rows: 4
						}
					]
				},
				{
					name: "factCard",
					title: "Faktakort",
					description: "Kortet bredvid introduktionen. Raderna hämtas från projektets Fakta.",
					type: "object",
					options: { collapsible: true, collapsed: false },
					fields: [
						{
							name: "title",
							title: "Rubrik",
							type: "string",
							description: "Om tom visas \"Fakta om projektet\""
						}
					]
				},
                {
                    name: "sections",
                    title: "Sektioner",
                    type: "array",
                    of: [
                        {
                            type: "object",
                            title: "Sektion",
                            fields: [
                                {
                                    name: "title",
                                    title: "Rubrik",
                                    type: "string"
                                },
                                {
                                    name: "content",
                                    title: "Innehåll",
                                    description: "Blanda rubriker, underrubriker och stycken fritt. Markera text för att göra den fet, kursiv eller till en länk.",
                                    type: "array",
                                    of: [
                                        {
                                            type: "block",
                                            styles: [
                                                { title: "Normal", value: "normal" },
                                                { title: "Rubrik", value: "h3" },
                                                { title: "Underrubrik", value: "h4" },
                                            ],
                                            lists: [
                                                { title: "Punktlista", value: "bullet" },
                                                { title: "Numrerad lista", value: "number" },
                                            ],
                                            marks: {
                                                decorators: [
                                                    { title: "Fet", value: "strong" },
                                                    { title: "Kursiv", value: "em" },
                                                ],
                                                annotations: [
                                                    {
                                                        name: "link",
                                                        type: "object",
                                                        title: "Länk",
                                                        fields: [
                                                            {
                                                                name: "href",
                                                                type: "url",
                                                                title: "URL",
                                                                validation: Rule => Rule.uri({ allowRelative: true, scheme: ["http", "https", "mailto", "tel"] })
                                                            }
                                                        ]
                                                    }
                                                ]
                                            }
                                        }
                                    ],
                                    validation: Rule => Rule.required().error("Innehåll krävs")
                                },
                                {
                                    name: "image",
                                    title: "Bild",
                                    type: "image",
                                    options: { hotspot: true },
                                    fields: [
                                        {
                                            name: "alt",
                                            title: "Alternativ text",
                                            type: "string"
                                        }
                                    ]
                                },
								{
									name: "imagePosition",
									title: "Bildposition",
									type: "string",
									options: {
										list: [
											{ title: "Vänster", value: "left" },
											{ title: "Höger", value: "right" },
										],
										layout: "radio"
									},
									initialValue: "right",
									hidden: ({ parent }) => !parent?.image
								}
                            ],
                            preview: {
                                select: { title: "title", content: "content", media: "image" },
                                prepare({ title, content, media }) {
                                    const firstBlock = content?.find((block: { _type: string }) => block._type === "block");
                                    const preview: string = firstBlock?.children?.map((child: { text?: string }) => child.text ?? "").join("") || "";
                                    return {
                                        title: title || "Namnlös sektion",
                                        subtitle: preview.slice(0, 60) + (preview.length > 60 ? "…" : ""),
                                        media
                                    }
                                }
                            }
                        }
                    ]
                },
				{
					name: "gallery",
					title: "Bildgalleri",
					type: "array",
					of: [{
						type: "image",
						options: { hotspot: true },
						fields: [
							{
								name: "alt",
								title: "Alternativ text",
								type: "string",
								description: "Beskrivning av bilden för tillgänglighet"
							}
						]
					}],
					options: {
						layout: "grid"
					},
					description: "Bilder som visas i ett galleri på undersidan"
				},
				{
					name: "availableHousingTypes",
					title: "Upplåtelseformer",
					type: "array",
					of: [{ type: "string" }],
					options: {
						list: [
							{ title: "Bostadsrätt", value: "bostadsratt" },
							{ title: "Hyresrätt", value: "hyresratt" },
						],
						layout: "grid"
					},
					description: "Välj vilka upplåtelseformer som ska visas i intresseanmälan. Lämna tomt för att dölja fältet."
				},
				{
					name: "availableRooms",
					title: "Tillgängliga rumsalternativ",
					type: "array",
					of: [{ type: "number" }],
					options: {
						list: [
							{ title: "1 rok", value: 1 },
							{ title: "2 rok", value: 2 },
							{ title: "3 rok", value: 3 },
							{ title: "4 rok", value: 4 },
            				{ title: "5 rok eller mer", value: 5 },
						],
						layout: "grid"
					},
					description: "Välj vilka rumsalternativ som ska visas som valbara knappar i intresseanmälningsformuläret",
					validation: Rule => Rule.required().min(1).error("Minst ett rumsalternativ krävs")
				},
            ]
        }),
    ],
    preview: {
        select: {
            title: "title",
            factLabel: "facts.0.label",
            factValue: "facts.0.value",
            media: "images.0"
        },
        prepare(selection) {
            const { title, factLabel, factValue, media } = selection
            return {
                title: title,
                subtitle: factLabel && factValue ? `${factLabel}: ${factValue}` : "Ingen fakta angiven",
                media: media
            }
        }
    }
})