package datastore_test

import (
	"airport-mode/datastore"

	"testing"

	"github.com/stretchr/testify/assert"
)

func Test_CreateTableField(t *testing.T) {
	table := datastore.NewTable("Tasks")

	fieldTypes := []datastore.TableFieldType{
		datastore.FieldTypeString,
		datastore.FieldTypeNumber,
		datastore.FieldTypeDate,
		datastore.FieldTypeText,
	}

	fieldTypesNames := []string{
		"FieldTypeString",
		"FieldTypeNumber",
		"FieldTypeDate",
		"FieldTypeText",
	}

	for index := range fieldTypes {
		testCreateFieldWithType(t, table, "TaskName", fieldTypes[index], fieldTypesNames[index])
	}
}

// helper to test field type
func testCreateFieldWithType(t *testing.T, table *datastore.Table, fieldName string, fieldType datastore.TableFieldType, fieldTypeName string) {
	field := datastore.NewField(fieldName, fieldType)

	assert.Equalf(t, fieldName, field.MetaData.FieldName, "should set field Name")
	assert.Equal(t, fieldType, field.MetaData.FieldType, "should set field type")
	assert.Equal(t, fieldTypeName, field.MetaData.FieldTypeName, "should set field type name")
}

func Test_AppendValuesStringToEnd(t *testing.T) {
	table := datastore.NewTable("Tasks")
	values := []interface{}{"hat", "are", "great", "in", "summer"}
	field, _ := table.AddTableField(datastore.NewField("taskName", datastore.FieldTypeString))

	recordGUIDs := []string{}
	for index := range values {
		table.AppendRecord(func(recordGUID string) {
			field.AppendValue(recordGUID, values[index])
			recordGUIDs = append(recordGUIDs, recordGUID)
		})
	}

	insertedValue := "some"
	table.AppendRecord(func(recordGUID string) {
		field.AppendValue(recordGUID, insertedValue)
	})

	newLen := len(values) + 1
	assert.Equal(t, newLen, field.CountValues(), "AppendValue: should increase the number of values")

	fieldValues := field.GetValues()

	for index := range values {
		assert.Equal(t, values[index], fieldValues[index].DataValue, "AppendValue: should not offset values")
		assert.Equal(t, recordGUIDs[index], fieldValues[index].RecordGUID, "AppendValue: should update recordGUIDs")
	}

	lastIndex := len(fieldValues) - 1
	assert.Equal(t, insertedValue, fieldValues[lastIndex].DataValue, "AppendValue: should insert are correct location")

}

func Test_InsertStringValue(t *testing.T) {
	table := datastore.NewTable("Tasks")
	values := []interface{}{"hat", "are", "great", "in", "summer"}
	field, _ := table.AddTableField(datastore.NewField("taskName", datastore.FieldTypeString))

	for index := range values {
		table.AppendRecord(func(recordGUID string) {
			field.AppendValue(recordGUID, values[index])
		})
	}
	assert.Equal(t, len(values), field.CountValues(), "AppendRecord+AppendValue: should add records correctly")

	insertedValue := "some"
	table.AppendRecord(func(recordGUID string) {
		field.InsertValueAtIndex(0, recordGUID, insertedValue)
	})

	newLen := len(values) + 1
	assert.Equal(t, newLen, field.CountValues(), "InsertValueAtIndex: should increase the number of values")

	fieldValues := field.GetValues()

	assert.Equal(t, insertedValue, fieldValues[0].DataValue, "InsertValueAtIndex: should insert are correct location")
	for index := range values {
		assert.Equal(t, values[index], fieldValues[index+1].DataValue, "InsertValueAtIndex: should offset values")
	}
}
