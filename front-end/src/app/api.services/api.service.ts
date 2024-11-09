import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { APIRequests } from "../api.requests/api.request";

@Injectable({
	providedIn: 'root'
})
export class APIService {
	// private peopleRequests: APIPeopleRequests;
	// private clientsRequests: APIClientsRequests;
	// private projectRequests: APIProjectRequests;

	apiRequests: APIRequests;
	// teamRequests: APITeamRequests;
	// cardRequests: APICardRequests;
	// accessRequest: APIAccessRequests;

	// private roadmapRequests: APITeamsInitiatives;

	constructor(private http: HttpClient) {
		this.apiRequests = new APIRequests(http);
		// this.teamRequests = new APITeamRequests(http);
		// this.cardRequests = new APICardRequests(http);
		// this.accessRequest = new APIAccessRequests(http);
		// this.roadmapRequests = new APITeamsInitiatives(http);
		// this.peopleRequests = new APIPeopleRequests(http);
		// this.clientsRequests = new APIClientsRequests(http);
		// this.projectRequests = new APIProjectRequests(http);
	}
}
