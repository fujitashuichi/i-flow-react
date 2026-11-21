export interface TimelineEntry<TInput = any, TOutput = any> {
	stepId: string;
	input: TInput;
	output?: TOutput;
	timestamp: number;
}
