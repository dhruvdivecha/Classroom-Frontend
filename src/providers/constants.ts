export const API_URL = "https://api.fake-rest.refine.dev";

export const MOCK_SUBJECTS = [
	{
		id: 1,
		code: "CS101",
		name: "Introduction to Computer Science",
		department: "CS",
		description:
			"Foundational concepts of programming, algorithms, and computer systems.",
		createdAt: "2024-08-15T10:00:00Z",
	},
	{
		id: 2,
		code: "MATH221",
		name: "Linear Algebra",
		department: "MATH",
		description: "Matrices, vector spaces, eigenvalues, and data science applications.",
		createdAt: "2024-08-18T10:00:00Z",
	},
	{
		id: 3,
		code: "ENG205",
		name: "Academic Writing",
		department: "IT",
		description:
			"Critical reading, research methods, and persuasive academic writing techniques.",
		createdAt: "2024-08-20T10:00:00Z",
	},
] as const;
