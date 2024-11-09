import { HttpClient, HttpRequest } from "@angular/common/http";
import { EMPTY, map, of, tap } from "rxjs";
import { APIServerResponse } from "../models/models.server";
import { TableInfo, TableRecordData } from "../models/models.datastore";


export class APIRequests {
	constructor(private http: HttpClient) { }

	getTables() {
		return this.http.get<APIServerResponse<TableInfo[]>>(`/api/tables`)//, { params: params })
			.pipe(
				map(resp => {
					if (!resp.successStatus || resp.jsonBody === null) {
						throw resp.message;
					}

					return resp.jsonBody;
				}),
			);
	}

	getTableByGUID(tableGUID: string) {
		return this.http.get<APIServerResponse<TableRecordData>>(`/api/table/${tableGUID}`)
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