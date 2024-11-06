
export interface BoardInfo {
	AccountID: string;
	// BoardTeamMembers: BoardMemberInfo[];
	TeamID: string;
	TeamName: string;
	BoardID: string;
	BoardName: string;
	CreatedOnTimestamp: number;
	CreatedOn: Date; // Calculated
	IsPublicBoard: boolean;
}

export interface APIServerResponse<T> {
	action: string;
	successStatus: boolean;
	message: string;
	sessionKey: string;
	errorCode: number;
	jsonBody: T
}

export interface BoardAccessListData {
	BoardInfoList: BoardInfo[];
	PendingBoardInfoList: BoardInfo[];
}
