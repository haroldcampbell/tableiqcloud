package datastore_test

import (
	"airport-mode/datastore"

	"testing"

	"github.com/stretchr/testify/assert"
)

func Test_TableField(t *testing.T) {
	createTableFieldTest(t)
	// deleteTableFieldTest(t)
	// updateTableFieldTest(t)
}

func createTableFieldTest(t *testing.T) {
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
	field := datastore.NewField(table.GUID, fieldName, fieldType)

	assert.Equalf(t, fieldName, field.FieldName, "should set field Name")
	assert.Equal(t, fieldType, field.MetaData.FieldType, "should set field type")
	assert.Equal(t, fieldTypeName, field.MetaData.FieldTypeName, "should set field type name")
}

// Test adding values to a field
func Test_InsertFieldValues(t *testing.T) {
	table := datastore.NewTable("Tasks")

	setValuesStringTest(t, table)
	insertValuesStringTest(t, table)
	appendValuesStringToEndTest(t, table)
}

func setValuesStringTest(t *testing.T, table *datastore.Table) {
	values := []interface{}{"hat", "are", "great", "in", "summer"}
	field := datastore.NewField(table.GUID, "taskName", datastore.FieldTypeString)

	field.CountValues()
	assert.Zero(t, field.CountValues(), "CountValues: should not have values")

	field.SetValues(values)
	assert.Equal(t, len(values), field.CountValues(), "SetValues: should have correct number of values")

	fieldValues := field.GetValues()
	for index := range values {
		cellValue := fieldValues[index]
		assert.Equal(t, values[index], cellValue, "GetValues: should have correct cell value")
	}
}

func insertValuesStringTest(t *testing.T, table *datastore.Table) {
	values := []interface{}{"hat", "are", "great", "in", "summer"}
	field := datastore.NewField(table.GUID, "taskName", datastore.FieldTypeString)

	insertedValue := "some"
	field.SetValues(values)
	field.InsertValueAtIndex(0, insertedValue)

	newLen := len(values) + 1
	assert.Equal(t, newLen, field.CountValues(), "InsertValueAtIndex: should increase the number of values")

	fieldValues := field.GetValues()
	// fmt.Printf("fieldValues: %v\n", fieldValues)
	assert.Equal(t, insertedValue, fieldValues[0], "InsertValueAtIndex: should insert are correct location")
	for index := range values {
		assert.Equal(t, values[index], fieldValues[index+1], "InsertValueAtIndex: should offset values")
	}
}

func appendValuesStringToEndTest(t *testing.T, table *datastore.Table) {
	values := []interface{}{"hat", "are", "great", "in", "summer"}
	field := datastore.NewField(table.GUID, "taskName", datastore.FieldTypeString)

	insertedValue := "some"
	field.SetValues(values)
	field.AppendValue(insertedValue)

	newLen := len(values) + 1
	assert.Equal(t, newLen, field.CountValues(), "AppendValue: should increase the number of values")

	fieldValues := field.GetValues()

	for index := range values {
		assert.Equal(t, values[index], fieldValues[index], "AppendValue: should not offset values")
	}

	lastIndex := len(fieldValues) - 1
	assert.Equal(t, insertedValue, fieldValues[lastIndex], "AppendValue: should insert are correct location")

}
