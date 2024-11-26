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

type RequestDataCreateField struct {
	BaseGUID  string
	TableGUID string
	FieldName string
	FieldType string
}

func CreateTableField(d *datastore.Datastore) func(c *gin.Context) {
	return func(c *gin.Context) {
		var data RequestDataCreateField
		err := c.BindJSON(&data)

		if err != nil {
			c.IndentedJSON(http.StatusNotFound, ErrResponse("create-table-field", http.StatusBadRequest, "Invalid field data"))
			return
		}

		fieldType, err := datastore.StrToFieldType(data.FieldType)
		if err != nil {
			c.IndentedJSON(http.StatusNotFound, ErrResponse("create-table-field", http.StatusBadRequest, "Invalid field type"))
			return
		}

		base, err := d.GetBaseByGUID(data.BaseGUID)
		if err != nil {
			c.IndentedJSON(http.StatusNotFound, ErrResponse("create-table-field", http.StatusBadRequest, "Unknown base"))
			return
		}

		table, err := base.GetTableByGUID(data.TableGUID)
		if err != nil {
			c.IndentedJSON(http.StatusNotFound, ErrResponse("create-table-field", http.StatusBadRequest, "Unknown table"))
			return
		}

		// TODO: validate data.FieldType bounds

		fieldRecords, err := table.CreateTableFieldByName(data.FieldName, fieldType)
		if err != nil {
			c.IndentedJSON(http.StatusNotFound, ErrResponse("create-table-field", http.StatusBadRequest, err.Error()))
			return
		}

		fmt.Printf("[CreateTableField] data:%v fieldRecords:%v\n", data, fieldRecords)
		c.IndentedJSON(http.StatusOK, OkResponse("create-table-field", fieldRecords))

		// Save the changes
		base.DumpDataAsJSON(d)
	}
}

type ReqestDataDeleteField struct {
	BaseGUID       string
	TableGUID      string
	TableFieldGUID string
}

func DeleteTableField(d *datastore.Datastore) func(c *gin.Context) {
	return func(c *gin.Context) {
		var data ReqestDataDeleteField
		err := c.BindJSON(&data)

		fmt.Printf("[DeleteTableField] data:%#v\n", data)

		if err != nil {
			c.IndentedJSON(http.StatusNotFound, ErrResponse("delete-table-field", http.StatusBadRequest, "Invalid field data"))
			return
		}

		base, err := d.GetBaseByGUID(data.BaseGUID)
		if err != nil {
			c.IndentedJSON(http.StatusNotFound, ErrResponse("delete-table-field", http.StatusBadRequest, "Unknown base"))
			return
		}

		table, err := base.GetTableByGUID(data.TableGUID)
		if err != nil {
			c.IndentedJSON(http.StatusNotFound, ErrResponse("delete-table-field", http.StatusBadRequest, "Unknown table"))
			return
		}

		err = table.DeleteTableField(data.TableFieldGUID)
		if err != nil {
			c.IndentedJSON(http.StatusNotFound, ErrResponse("delete-table-field", http.StatusBadRequest, err.Error()))
			return
		}

		fmt.Printf("[DeleteTableField] data:%v \n", data)
		c.IndentedJSON(http.StatusOK, OkResponse("delete-table-field", data.TableFieldGUID))

		// Save the changes
		base.DumpDataAsJSON(d)
	}
}

type ReqestDataUpdateField struct {
	BaseGUID       string
	TableGUID      string
	TableFieldGUID string
	FieldName      string
	FieldType      datastore.TableFieldType
}

func UpdateTableField(d *datastore.Datastore) func(c *gin.Context) {
	return func(c *gin.Context) {
		var data ReqestDataUpdateField
		err := c.BindJSON(&data)

		fmt.Printf("[UpdateTableField] data:%#v\n", data)

		if err != nil {
			c.IndentedJSON(http.StatusNotFound, ErrResponse("update-table-field", http.StatusBadRequest, "Invalid field data"))
			return
		}

		base, err := d.GetBaseByGUID(data.BaseGUID)
		if err != nil {
			c.IndentedJSON(http.StatusNotFound, ErrResponse("update-table-field", http.StatusBadRequest, "Unknown base"))
			return
		}

		table, err := base.GetTableByGUID(data.TableGUID)
		if err != nil {
			c.IndentedJSON(http.StatusNotFound, ErrResponse("update-table-field", http.StatusBadRequest, "Unknown table"))
			return
		}

		rawWetaData := datastore.RawFieldMetaData{
			FieldName: data.FieldName,
			FieldType: data.FieldType,
		}

		fieldMetaData, err := table.UpdateTableFiledMetaData(data.TableFieldGUID, rawWetaData)

		if err != nil {
			c.IndentedJSON(http.StatusNotFound, ErrResponse("update-table-field", http.StatusBadRequest, err.Error()))
			return
		}

		fmt.Printf("[UpdateTableField] data:%v fieldMetaData: %v\n", data, fieldMetaData)
		c.IndentedJSON(http.StatusOK, OkResponse("update-table-field", fieldMetaData))

		// Save the changes
		base.DumpDataAsJSON(d)
	}
}
