package api

import (
	"fmt"
	"net/http"
	"tableiq/datastore"

	"github.com/gin-gonic/gin"
)

type RequestDataCreateField struct {
	BaseGUID  string
	TableGUID string
	FieldName string
	FieldType string
}

type ReqestDataDeleteField struct {
	BaseGUID       string
	TableGUID      string
	TableFieldGUID string
}

type ReqestDataUpdateField struct {
	BaseGUID       string
	TableGUID      string
	TableFieldGUID string
	FieldName      string
	FieldType      datastore.TableFieldType
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
