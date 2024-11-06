import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { APIBoardRequests } from "../api/api.request";
import { AuthService } from "./auth.service";

@Injectable({
	providedIn: 'root'
})
export class TeamService {
	// private peopleRequests: APIPeopleRequests;
	// private clientsRequests: APIClientsRequests;
	// private projectRequests: APIProjectRequests;

	boardRequests: APIBoardRequests;
	// teamRequests: APITeamRequests;
	// cardRequests: APICardRequests;
	// accessRequest: APIAccessRequests;

	// private roadmapRequests: APITeamsInitiatives;

	constructor(private http: HttpClient, private authService: AuthService) {
		this.boardRequests = new APIBoardRequests(http);
		// this.teamRequests = new APITeamRequests(http);
		// this.cardRequests = new APICardRequests(http);
		// this.accessRequest = new APIAccessRequests(http);
		// this.roadmapRequests = new APITeamsInitiatives(http);
		// this.peopleRequests = new APIPeopleRequests(http);
		// this.clientsRequests = new APIClientsRequests(http);
		// this.projectRequests = new APIProjectRequests(http);
	}
}
