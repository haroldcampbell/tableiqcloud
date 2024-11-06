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
	field, _ := table.AddTableField(datastore.NewField("taskName", datastore.FieldTypeString))

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
	table.AddTableField(datastore.NewField("Title", datastore.FieldTypeString))
	table.AddTableField(datastore.NewField("Description", datastore.FieldTypeString))

	assert.Equal(t, 2, len(table.GetFields()), "AddTableField: should add correct number of fields")

	var data [][]string = [][]string{
		{"A1", "B1"},
		{"A2", "B2"},
		{"A3", "B3"},
	}

	for _, rowData := range data {
		table.AppendRecord(func(recordGUID string) {

			_, err1 := table.AppendFieldValuesByFieldName(recordGUID, "Title", rowData[0])
			_, err2 := table.AppendFieldValuesByFieldName(recordGUID, "Description", rowData[1])

			assert.NotEmpty(t, recordGUID, "0:AppendRecord should generate a recordGUID")
			assert.NoError(t, err1, "1:AppendFieldValuesByFieldName should not have erro")
			assert.NoError(t, err2, "2:AppendFieldValuesByFieldName should not have erro")
		})
	}

	fields := table.GetFields()
	column1 := []string{"A1", "A2", "A3"}
	cellValues := fields[0].GetValues()
	for index := range column1 {
		assert.Equal(t, column1[index], cellValues[index].DataValue, "1:should have correct values")
	}

	column2 := []string{"B1", "B2", "B3"}
	cellValues = fields[1].GetValues()
	for index := range column2 {
		assert.Equal(t, column2[index], cellValues[index].DataValue, "2:should have correct values")
	}
}

func Test_GetRecordByGUID(t *testing.T) {
	table1 := datastore.NewTable("Contacts")
	f1, _ := table1.AddTableField(datastore.NewField("Name", datastore.FieldTypeString))
	f2, _ := table1.AddTableField(datastore.NewField("Job Title", datastore.FieldTypeString))
	f3, _ := table1.AddTableField(datastore.NewField("Age", datastore.FieldTypeNumber))

	table1.AppendRecord(func(recordGUID string) {
		f1.AppendValue(recordGUID, "Mark Smith")
		f2.AppendValue(recordGUID, "Student")
		f3.AppendValue(recordGUID, "23")
	})

	var savedGUID string
	var d1, d2, d3 datastore.FieldData
	table1.AppendRecord(func(recordGUID string) {
		savedGUID = recordGUID
		d1 = f1.AppendValue(recordGUID, "Brad Jame")
		d2 = f2.AppendValue(recordGUID, "Banker")
		d3 = f3.AppendValue(recordGUID, "34")
	})

	table1.AppendRecord(func(recordGUID string) {
		f1.AppendValue(recordGUID, "Jill Gardener")
		f2.AppendValue(recordGUID, "CEO")
		f3.AppendValue(recordGUID, "47")
	})

	table1.AppendRecord(func(recordGUID string) {
		f1.AppendValue(recordGUID, "Sally Miracle")
		f2.AppendValue(recordGUID, "Doctor")
		f3.AppendValue(recordGUID, "35")
	})

	expected := []*datastore.RecordCell{
		{MetaData: f1.MetaData, FieldData: d1},
		{MetaData: f2.MetaData, FieldData: d2},
		{MetaData: f3.MetaData, FieldData: d3},
	}

	actual, _ := table1.GetRecordByGUID(savedGUID)
	assert.Equal(t, expected, actual, "GetRecordByGUID: should return a row of data")
}
