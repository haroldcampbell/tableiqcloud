package main

import (
	"airport-mode/datastore"
	"fmt"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/haroldcampbell/go_utils/utils"
)

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

func GetTables(base *datastore.Base) func(c *gin.Context) {
	return func(c *gin.Context) {
		c.IndentedJSON(http.StatusOK, OkResponse("get-tables", base.ListTables()))
	}
}

func GetTableByGUID(base *datastore.Base) func(c *gin.Context) {
	return func(c *gin.Context) {
		tableGUID := c.Param("tableGUID")
		fmt.Printf("[GetTableByGUID] tableGUID: %v\n", tableGUID)

		table, err := base.GetTableByGUID(tableGUID)
		if err != nil {
			// base.DumpTables()
			// fmt.Printf("[GetTableByGUID] base: %v\n", utils.PrettyMongoString(base))
			c.IndentedJSON(http.StatusNotFound, ErrResponse("get-table", 404, "Table not found"))
			return
		}

		records := table.GetRecords()
		fmt.Printf("[GetTableByGUID] records:%v\n", utils.PrettyMongoString(records))

		c.IndentedJSON(http.StatusOK, OkResponse("get-table", records))
	}
}
func main() {
	// base := NewMockDB()
	// base.DumpDataAsJSON()

	base, err := datastore.NewBaseFromJSON(func() (*datastore.Base, error) {
		base := NewMockDB()
		base.DumpDataAsJSON()

		return base, nil
	})
	if err != nil {
		fmt.Printf("Failed to load mock data")
		return
	}

	router := gin.Default()
	// router.Static("/assets", "./src/assets")
	// router.StaticFile("/", "./src/index.html")
	router.GET("/api/tables", GetTables(base))
	router.GET("/api/table/:tableGUID", GetTableByGUID(base))

	router.Run("localhost:8083")

	// fmt.Printf("field: %#v\n", field)
}
