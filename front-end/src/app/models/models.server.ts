import { FieldData, RecordCell } from "./models.datastore";


export interface APIServerResponse<T> {
	action: string;
	successStatus: boolean;
	message: string;
	sessionKey: string;
	errorCode: number;
	jsonBody: T
}

export interface RequestDataCreateRecordResponse {
	RecordGUID: string
	Cells: RecordCell[]
}
