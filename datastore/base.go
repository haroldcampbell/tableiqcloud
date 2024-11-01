package datastore

import (
	"errors"

	"github.com/haroldcampbell/go_utils/utils"
)

type Base struct {
	GUID         string
	Name         string
	tables       []*Table
	tableGUIDMap map[string]*Table
	tableNameMap map[string]*Table
}

type TableInfo struct {
	GUID string
	Name string
}

func NewBase(name string) *Base {
	return &Base{
		GUID:         utils.GenerateUUID(),
		Name:         name,
		tables:       make([]*Table, 0),
		tableGUIDMap: map[string]*Table{},
		tableNameMap: map[string]*Table{},
	}
}

func (b *Base) TableCount() int {
	return len(b.tables)
}

func (b *Base) AddTable(table *Table) error {
	_, ok := b.tableGUIDMap[table.GUID]
	if ok {
		return errors.New("duplicate table GUID")
	}

	_, ok = b.tableNameMap[table.Name]
	if ok {
		return errors.New("duplicate table Name")
	}

	b.tableGUIDMap[table.GUID] = table
	b.tableNameMap[table.Name] = table
	b.tables = append(b.tables, table)

	return nil
}

func (b *Base) ListTables() []TableInfo {
	list := make([]TableInfo, len(b.tables))

	for index, table := range b.tables {
		list[index] = TableInfo{
			GUID: table.GUID,
			Name: table.Name,
		}
	}
	return list
}
