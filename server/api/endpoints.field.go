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

type RequestDataUpdateFieldDataValue struct {
	BaseGUID  string
	TableGUID string
	FieldGUID string
	FieldData datastore.FieldData
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
		base.DumpDataAsJSON(d, false)
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
		base.SilentDumpDataAsJSON(d)
	}
}

// UpdateTableField updates the field information in a table
func UpdateTableFieldInfo(d *datastore.Datastore) func(c *gin.Context) {
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

		fieldMetaData, err := table.UpdateTableFieldMetaData(data.TableFieldGUID, rawWetaData)

		if err != nil {
			c.IndentedJSON(http.StatusNotFound, ErrResponse("update-table-field", http.StatusBadRequest, err.Error()))
			return
		}

		fmt.Printf("[UpdateTableField] data:%v fieldMetaData: %v\n", data, fieldMetaData)
		c.IndentedJSON(http.StatusOK, OkResponse("update-table-field", fieldMetaData))

		// Save the changes
		base.SilentDumpDataAsJSON(d)
	}
}

// UpdateTableFieldValue used to update a cell value in a table
func UpdateTableFieldValue(d *datastore.Datastore) func(c *gin.Context) {
	return func(c *gin.Context) {
		var data RequestDataUpdateFieldDataValue
		err := c.BindJSON(&data)
		slug := "update-table-field-value"

		// fmt.Printf("[UpdateTableFieldValue] data:%s\n", utils.PrettyPrintString(data))

		if err != nil {
			c.IndentedJSON(http.StatusNotFound, ErrResponse(slug, http.StatusBadRequest, "Invalid field data"))
			return
		}

		base, err := d.GetBaseByGUID(data.BaseGUID)
		if err != nil {
			c.IndentedJSON(http.StatusNotFound, ErrResponse(slug, http.StatusBadRequest, "Unknown base"))
			return
		}

		// TODO: check that the authenticated user has access to the base and table
		table, err := base.GetTableByGUID(data.TableGUID)
		if err != nil {
			c.IndentedJSON(http.StatusNotFound, ErrResponse(slug, http.StatusBadRequest, "Unknown table"))
			return
		}

		// Find the field by FieldGUID
		fieldGUID := data.FieldGUID
		cellGUID := data.FieldData.CellGUID
		recordGUID := data.FieldData.RecordGUID
		newValue := data.FieldData.DataValue

		newFieldData := datastore.FieldData{
			CellGUID:   cellGUID,
			RecordGUID: recordGUID,
			DataValue:  newValue,
		}

		// fmt.Printf("[UpdateTableFieldValue] \n\tfieldGUID: '%v' \n\trecordGUID: '%v' \n\tnewValue: '%v'\n", fieldGUID, recordGUID, newValue)

		updatedData, err := table.UpdateTableFieldValue(fieldGUID, cellGUID, recordGUID, newFieldData)
		if err != nil {
			fmt.Printf("[UpdateTableFieldValue] error: %v\n", err)
			c.IndentedJSON(http.StatusNotFound, ErrResponse(slug, http.StatusBadRequest, err.Error()))
			return
		}

		// fmt.Printf("[UpdateTableFieldValue] data:%v fieldMetaData: %v\n", data, fieldMetaData)
		// fmt.Printf("[UpdateTableFieldValue] updatedData:%s \n", utils.PrettyPrintString(updatedData))

		c.IndentedJSON(http.StatusOK, OkResponse(slug, updatedData))

		// Save the changes
		base.SilentDumpDataAsJSON(d)
	}
}
