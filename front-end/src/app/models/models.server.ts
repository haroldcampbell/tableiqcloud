

export interface APIServerResponse<T> {
	action: string;
	successStatus: boolean;
	message: string;
	sessionKey: string;
	errorCode: number;
	jsonBody: T
}
