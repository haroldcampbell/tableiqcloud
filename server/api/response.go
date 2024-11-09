package api

type APIServerResponse struct {
	Action        string `json:"action"`
	SuccessStatus bool   `json:"successStatus"`
	Message       string `json:"message"`
	SessionKey    string `json:"sessionKey"`
	ErrorCode     int    `json:"errorCode"`
	JSONBody      any    `json:"jsonBody"`
}

func OkResponse(action string, obj any) APIServerResponse {
	return APIServerResponse{
		Action:        action,
		SuccessStatus: true,
		ErrorCode:     -1,
		JSONBody:      obj,
	}
}

func ErrResponse(action string, errCode int, message string) APIServerResponse {
	return APIServerResponse{
		Action:        action,
		SuccessStatus: false,
		ErrorCode:     errCode,
		Message:       message,
	}
}
