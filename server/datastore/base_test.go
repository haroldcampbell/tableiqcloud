package datastore_test

import (
	"airport-mode/datastore"
	"testing"

	"github.com/stretchr/testify/assert"
)

func Test_CreateBase(t *testing.T) {
	base := datastore.NewBase("core")

	assert.NotEmpty(t, base.GUID, "NewBase: should set base GUID")
	assert.Equal(t, "core", base.Name, "NewBase: should set base Name")
	assert.Zero(t, base.TableCount(), "NewBase: should not create any tables")
}

func Test_AddTableToBase(t *testing.T) {
	base := datastore.NewBase("core")

	table := datastore.NewTable("Tasks")
	base.AddTable(table)

	count := base.TableCount()
	assert.Equal(t, 1, count, "AddTable: should add a table")
}

func Test_ListTables(t *testing.T) {
	tableNames := []string{"Tasks", "Events", "Invoices"}
	base := datastore.NewBase("core")

	base.AddTable(datastore.NewTable(tableNames[0]))
	base.AddTable(datastore.NewTable(tableNames[1]))
	base.AddTable(datastore.NewTable(tableNames[2]))

	count := base.TableCount()
	assert.Equal(t, 3, count, "AddTable: should add tables")

	list := base.ListTables()
	assert.Equal(t, count, len(list), "ListTables: should return list of table info")

	for index, tableName := range tableNames {
		assert.Equal(t, tableName, list[index].Name, "ListTables: TableInfo should have correct table name")
		assert.NotEmpty(t, list[index].GUID, "ListTables: TableInfo  should have guid")
	}
}

// func Test_RemoveTableInBaseByGUID(t *testing.T) {
// }
// func Test_FindTableInBaseByGUID(t *testing.T) {
// }
