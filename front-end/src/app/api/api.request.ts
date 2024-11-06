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



export class APIBoardRequests {
	private maxVotesPerUserPerBoard = new Map<string, number>();
	//private userTotalVotes = new Map<string, number>();
	constructor(private http: HttpClient) { }

	getUserBoardAccessList() {
		return this.http.get<APIServerResponse<BoardAccessListData>>(`/api/user-board-access-list`)//, { params: params })
			.pipe(
				map(resp => {
					if (!resp.successStatus || resp.jsonBody === null) {
						throw resp.message
					}

					return provisionBoardAccessList(resp.jsonBody)
				}),
			);
	}

}