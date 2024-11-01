package datastore_test

import (
	"airport-mode/datastore"
	"testing"
)

func Test_CreateLinkedField(t *testing.T) {
	table1 := datastore.NewTable("Contacts")
	table1.AddTableField(datastore.NewField(table1.GUID, "Name", datastore.FieldTypeString))
	table1.AddTableField(datastore.NewField(table1.GUID, "Job Title", datastore.FieldTypeString))

	table2 := datastore.NewTable("Trips")
	table2.AddTableField(datastore.NewField(table2.GUID, "Destination", datastore.FieldTypeString))
	// linkedFiled, _ := table2.AddTableField(datastore.NewField(table2.GUID,
	// 	"Members",
	// 	datastore.FieldTypeLinkedTable))

}
