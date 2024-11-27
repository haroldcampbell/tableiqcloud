package api

import (
	"fmt"
	"net/http"
	"tableiq/datastore"

	"github.com/gin-gonic/gin"
	"github.com/haroldcampbell/go_utils/utils"
)

func GetBases(d *datastore.Datastore) func(c *gin.Context) {
	return func(c *gin.Context) {
		c.IndentedJSON(http.StatusOK, OkResponse("get-bases", d.GetBases()))
	}
}

func GetTables(d *datastore.Datastore) func(c *gin.Context) {

	return func(c *gin.Context) {
		baseGUID := c.Param("baseGUID")
		base, err := d.GetBaseByGUID(baseGUID)

		fmt.Printf("[GetTables] baseGUID:%v\n", baseGUID)

		if err != nil {
			c.IndentedJSON(http.StatusNotFound, ErrResponse("get-tables", 404, "Table not found in base"))
			return
		}

		c.IndentedJSON(http.StatusOK, OkResponse("get-tables", base.ListTables()))
	}
}

// Continue from here.
// figure out why the FieldType is not being set
func GetTableByGUID(d *datastore.Datastore) func(c *gin.Context) {
	return func(c *gin.Context) {
		baseGUID := c.Param("baseGUID")
		tableGUID := c.Param("tableGUID")
		fmt.Printf("[GetTableByGUID] baseGUID:%v tableGUID: %v\n", baseGUID, tableGUID)

		base, err := d.GetBaseByGUID(baseGUID)
		if err != nil {
			c.IndentedJSON(http.StatusNotFound, ErrResponse("get-table", 404, "Table not found in base"))
			return
		}

		table, err := base.GetTableByGUID(tableGUID)
		if err != nil {
			c.IndentedJSON(http.StatusNotFound, ErrResponse("get-table", 404, "Table not found"))
			return
		}

		records := table.GetRecords()
		fmt.Printf("[GetTableByGUID] records:%v\n", utils.PrettyMongoString(records))

		c.IndentedJSON(http.StatusOK, OkResponse("get-table", records))
	}
}
