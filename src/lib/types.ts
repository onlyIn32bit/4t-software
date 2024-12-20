export type DisplayObject = {
	screen: string;
	slide: string;
	question: number;
	numberOfQues: number;
};

export type QuestionObject = {
	content: string;
	type: 'text' | 'audio' | 'image';
};
