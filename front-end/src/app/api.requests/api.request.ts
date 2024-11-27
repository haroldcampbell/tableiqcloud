import { HttpClient, HttpRequest } from "@angular/common/http";
import { EMPTY, map, of, tap } from "rxjs";
import { APIServerResponse, RequestDataCreateRecordResponse } from "../models/models.server";
import { Base, BaseTableInfo, FieldMetaData, RecordCell, ReqestDataDeleteField, RequestDataCreateField, RequestDataCreateRecord, RequestDataUpdateField, TableInfo, TableRecordData } from "../models/models.datastore";


export class APIRequests {
	constructor(private http: HttpClient) { }

	getBases() {
		return this.http.get<APIServerResponse<Base[]>>(`/api/bases`)
			.pipe(
				map(resp => {
					if (!resp.successStatus || resp.jsonBody === null) {
						throw resp.message;
					}

					return resp.jsonBody;
				}),
			);
	}

	// getBaseByGUID(baseGUID: string) {
	// 	return this.http.get<APIServerResponse<Base>>(`/api/base/${baseGUID}`)
	// 		.pipe(
	// 			map(resp => {
	// 				if (!resp.successStatus || resp.jsonBody === null) {
	// 					throw resp.message;
	// 				}

	// 				return resp.jsonBody;
	// 			}),
	// 		);
	// }

	getTables(baseGUID: string) {
		return this.http.get<APIServerResponse<BaseTableInfo>>(`/api/base/${baseGUID}`)
			.pipe(
				map(resp => {
					if (!resp.successStatus || resp.jsonBody === null) {
						throw resp.message;
					}

					return resp.jsonBody;
				}),
			);
	}

	getTableByGUID(baseGUID: string, tableGUID: string) {
		return this.http.get<APIServerResponse<TableRecordData>>(`/api/table/${baseGUID}/${tableGUID}`)
			.pipe(
				map(resp => {
					if (!resp.successStatus || resp.jsonBody === null) {
						throw resp.message;
					}

					return resp.jsonBody;
				}),
			);
	}

	createTableField(data: RequestDataCreateField) {
		return this.http.post<APIServerResponse<TableRecordData>>(`/api/field/new`, data)
			.pipe(
				map(resp => {
					if (!resp.successStatus || resp.jsonBody === null) {
						throw resp.message;
					}

					return resp.jsonBody;
				}),
			);
	}

	deleteTableField(data: ReqestDataDeleteField) {
		return this.http.post<APIServerResponse<string>>(`/api/field/delete`, data)
			.pipe(
				map(resp => {
					if (!resp.successStatus || resp.jsonBody === null) {
						throw resp.message;
					}

					return resp.jsonBody;
				}),
			);
	}

	updateTableField(data: RequestDataUpdateField) {
		return this.http.post<APIServerResponse<FieldMetaData>>(`/api/field/update`, data)
			.pipe(
				map(resp => {
					if (!resp.successStatus || resp.jsonBody === null) {
						throw resp.message;
					}

					return resp.jsonBody;
				}),
			);
	}

	createTableRecord(data: RequestDataCreateRecord) {
		return this.http.post<APIServerResponse<RequestDataCreateRecordResponse>>(`/api/table-record/new`, data)
			.pipe(
				map(resp => {
					if (!resp.successStatus || resp.jsonBody === null) {
						throw resp.message;
					}

					return resp.jsonBody;
				}),
			);
	}
}