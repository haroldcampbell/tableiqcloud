package main

import (
	"encoding/json"
	"fmt"

	"airport-mode/datastore"

	"github.com/haroldcampbell/go_utils/utils"
)

// func GetIssueCards(c *gin.Context) {
// 	c.IndentedJSON(http.StatusOK, "test-utput")
// 	task := datastore.NewTable("Tasks")

// 	fmt.Printf("aaa: %v\n", task)
// }

func initSampleDB() {
	var field *datastore.TableField

	base := datastore.NewBase("core")
	table := datastore.NewTable("Tasks")
	base.AddTable(table)

	field = datastore.NewField(table.GUID, "Title", datastore.FieldTypeString)
	table.AddTableField(field)

	field = datastore.NewField(table.GUID, "Description", datastore.FieldTypeString)
	table.AddTableField(field)

	var data [][]string = [][]string{
		{"Select trip", "Where do we want to go"},
		{"Do Purcahse", "Buy the ticket"},
		{"Enjoy vacation", "Go to the place and have fun"},
	}

	for _, rowData := range data {
		table.AppendFieldValuesByFieldName("Title", rowData[0])
		table.AppendFieldValuesByFieldName("Description", rowData[1])
	}

	_, err := json.MarshalIndent(table, "", "  ")
	if err != nil {
		fmt.Printf("Unablet to unMarshal table. Error: %v\n", err)
		return
	}

	fmt.Printf("table: %v\n", utils.PrettyMongoString(table))
}

func main() {
	initSampleDB()
	// router := gin.Default()
	// router.Static("/assets", "./src/assets")
	// router.StaticFile("/", "./src/index.html")
	// // router.GET("/project", GetIssueCards)

	// router.Run("localhost:8099")

	// fmt.Printf("field: %#v\n", field)
}
