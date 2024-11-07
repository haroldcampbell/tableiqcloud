package main

import (
	"encoding/json"
	"fmt"
	"net/http"

	"airport-mode/datastore"

	"github.com/gin-gonic/gin"
	"github.com/haroldcampbell/go_utils/utils"
)

func initSampleDB() {
	// var field *datastore.TableField

	base := datastore.NewBase("core")
	table := datastore.NewTable("Tasks")
	base.AddTable(table)

	// field, _ =
	table.AddTableField(datastore.NewField("Title", datastore.FieldTypeString))

	// field, _=
	table.AddTableField(datastore.NewField("Description", datastore.FieldTypeString))

	var data [][]string = [][]string{
		{"Select trip", "Where do we want to go"},
		{"Do Purcahse", "Buy the ticket"},
		{"Enjoy vacation", "Go to the place and have fun"},
	}

	for _, rowData := range data {
		table.AppendRecord(func(recordGUID string) {
			fmt.Printf("[initSampleDB] recordGUID: %v\n", recordGUID)

			table.AppendFieldValuesByFieldName(recordGUID, "Title", rowData[0])
			table.AppendFieldValuesByFieldName(recordGUID, "Description", rowData[1])
		})
	}

	_, err := json.MarshalIndent(table, "", "  ")
	if err != nil {
		fmt.Printf("Unablet to unMarshal table. Error: %v\n", err)
		return
	}

	fmt.Printf("table: %v\n", utils.PrettyMongoString(table))
}

func GetList(c *gin.Context) {
	c.IndentedJSON(http.StatusOK, "test-utput")
	// task := datastore.NewTable("Tasks")

	// fmt.Printf("aaa: %v\n", task)
}

func main() {
	// initSampleDB()
	router := gin.Default()
	// router.Static("/assets", "./src/assets")
	// router.StaticFile("/", "./src/index.html")
	router.GET("/api/list", GetList)

	router.Run("localhost:8083")

	// fmt.Printf("field: %#v\n", field)
}
