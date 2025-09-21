import { HttpClient, HttpRequest } from "@angular/common/http";
import { EMPTY, map, of, tap } from "rxjs";
import { APIServerResponse, RequestDataCreateRecordResponse } from "../models/models.server";
import { Base, BaseTableInfo, FieldData, FieldMetaData, FieldParamLinkedFieldInfo, ReqestDataDeleteField, RequestDataAddLinkedTableCellValue, RequestDataCreateField, RequestDataCreateRecord, RequestDataDeleteLinkedTableCellValue, RequestDataDeleteRecord, RequestDataUpdateField, RequestDataUpdateFieldDataValue, RequestDataUpdateFieldResponse, TableFieldInfo, TableInfo, TableRecordData } from "../models/models.datastore";


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

	getTableFieldInfoByGUID(baseGUID: string, tableGUID: string) {
		return this.http.get<APIServerResponse<TableFieldInfo>>(`/api/table/${baseGUID}/${tableGUID}/info`)
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

	updateTableFieldInfo(data: RequestDataUpdateField) {
		return this.http.post<APIServerResponse<RequestDataUpdateFieldResponse>>(`/api/field/update-info`, data)
			.pipe(
				map(resp => {
					if (!resp.successStatus || resp.jsonBody === null) {
						throw resp.message;
					}

					return resp.jsonBody;
				}),
			);
	}

	updateTableFieldDataValue(data: RequestDataUpdateFieldDataValue) {
		return this.postRequest<RequestDataUpdateFieldDataValue, FieldData>(`/api/field/update-value`, data)
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

	deleteTableRecord(data: RequestDataDeleteRecord) {
		return this.postRequest<RequestDataDeleteRecord, string>(`/api/table-record/delete`, data)
	}


	getLikedTableDataOptions(baseGUID: string, tableGUID: string, fieldGUID: string) {
		const url = `/api/linked-relationship/${baseGUID}/${tableGUID}/${fieldGUID}/data-values`;
		return this.http.get<APIServerResponse<FieldData[]>>(url)
			.pipe(
				map(resp => {
					if (!resp.successStatus || resp.jsonBody === null) {
						throw resp.message;
					}

					return resp.jsonBody;
				}),
			);
	}

	addLikedTableDataCellvalue(data: RequestDataAddLinkedTableCellValue) {
		return this.http.post<APIServerResponse<FieldData>>(`/api/linked-relationship/new-data-value`, data)
			.pipe(
				map(resp => {
					if (!resp.successStatus || resp.jsonBody === null) {
						throw resp.message;
					}

					return resp.jsonBody;
				}),
			);
	}

	deleteLinkedTableDataCellvalue(data: RequestDataDeleteLinkedTableCellValue) {
		return this.http.post<APIServerResponse<FieldData>>(`/api/linked-relationship/delete-data-value`, data)
			.pipe(
				map(resp => {
					if (!resp.successStatus || resp.jsonBody === null) {
						throw resp.message;
					}

					return resp.jsonBody;
				}),
			);
	}

	private postRequest<Request, Response>(action: string, data: Request) {
		return this.http.post<APIServerResponse<Response>>(action, data)
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