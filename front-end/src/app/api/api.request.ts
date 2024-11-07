import { HttpClient, HttpRequest } from "@angular/common/http";
import { EMPTY, map, of, tap } from "rxjs";
import { BoardInfo, BoardAccessListData, APIServerResponse } from "../models/models";

function infoToLocalDate(list: BoardInfo[]) {
	return list.map(info => {
		info.CreatedOn = new Date(info.CreatedOnTimestamp * 1000)
		return info
	});
}


export function provisionBoardAccessList(data: BoardAccessListData) {
	data.BoardInfoList = infoToLocalDate(data.BoardInfoList);
	data.PendingBoardInfoList = infoToLocalDate(data.PendingBoardInfoList);

	return data
}



export class APIRequests {
	private maxVotesPerUserPerBoard = new Map<string, number>();
	//private userTotalVotes = new Map<string, number>();
	constructor(private http: HttpClient) { }

	getList() {
		// return this.http.get<APIServerResponse<BoardAccessListData>>(`/api/list`)//, { params: params })
		return this.http.get<string>(`/api/list`)//, { params: params })
			.pipe(
				map(resp => {
					return resp
					// if (!resp.successStatus || resp.jsonBody === null) {
					// 	throw resp.message;
					// }

					// return resp.jsonBody;
					// return provisionBoardAccessList(resp.jsonBody)
				}),
			);
	}

}