package datastore_test

import (
	"airport-mode/datastore"
	"testing"

	"github.com/stretchr/testify/assert"
)

func Test_CreateTable(t *testing.T) {
	table := datastore.NewTable("Tasks")

	assert.Equal(t, "Tasks", table.Name, "should set table Name")
}

func Test_updateTableName(t *testing.T) {
	table := datastore.NewTable("Tasks")
	table.UpdateTableName("NewName")

	assert.Equal(t, "NewName", table.Name, "should change table Name")
}

func Test_deleteTable(t *testing.T) {
	table := datastore.NewTable("Tasks")

	// Ensure default values
	assert.Falsef(t, table.IsDeleted, "should not be deleted by default")
	assert.Zero(t, table.DeletedOnTimestamp, "should not have a deletion timestamp")

	table.MarkTableForDeletion()

	// Post delete checks
	assert.True(t, table.IsDeleted, "should be flagged for deletion")
	assert.NotZero(t, table.DeletedOnTimestamp, "should have a deletion timestamp")
}

func Test_AddTableField(t *testing.T) {
	table := datastore.NewTable("Tasks")
	field := datastore.NewField(table.GUID, "taskName", datastore.FieldTypeString)

	fields := table.GetFields()
	assert.Zero(t, len(fields), "GetFields: should be zero initially")

	table.AddTableField(field)

	fields = table.GetFields()
	assert.Equal(t, 1, len(fields), "AddTableField: should add a field")
	//TODO: check that the correct field was returned
	// This will require adding a guid to table and field structs
}

func Test_AppendFieldValuesByFieldName(t *testing.T) {
	table := datastore.NewTable("Tasks")
	table.AddTableField(datastore.NewField(table.GUID, "Title", datastore.FieldTypeString))
	table.AddTableField(datastore.NewField(table.GUID, "Description", datastore.FieldTypeString))

	assert.Equal(t, 2, len(table.GetFields()), "AddTableField: should add correct number of fields")

	var data [][]string = [][]string{
		{"A1", "B1"},
		{"A2", "B2"},
		{"A3", "B3"},
	}

	for _, rowData := range data {
		err1 := table.AppendFieldValuesByFieldName("Title", rowData[0])
		err2 := table.AppendFieldValuesByFieldName("Description", rowData[1])

		assert.NoError(t, err1, "1:AppendFieldValuesByFieldName should not have erro")
		assert.NoError(t, err2, "2:AppendFieldValuesByFieldName should not have erro")
	}

	fields := table.GetFields()
	column1 := []string{"A1", "A2", "A3"}
	cellValues := fields[0].GetValues()
	for index := range column1 {
		assert.Equal(t, column1[index], cellValues[index], "1:should have correct values")
	}

	column2 := []string{"B1", "B2", "B3"}
	cellValues = fields[1].GetValues()
	for index := range column2 {
		assert.Equal(t, column2[index], cellValues[index], "2:should have correct values")
	}
}
