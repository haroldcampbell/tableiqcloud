package datastore

import (
	"encoding/json"
	"errors"
	"fmt"
	"os"

	"github.com/haroldcampbell/go_utils/utils"
)

type Base struct {
	GUID         string
	Name         string
	Tables       []*Table
	TableGUIDMap map[string]*Table
	TableNameMap map[string]*Table
}

type TableInfo struct {
	GUID string
	Name string
}

func NewBase(name string) *Base {
	return &Base{
		GUID:         utils.GenerateUUID(),
		Name:         name,
		Tables:       make([]*Table, 0),
		TableGUIDMap: map[string]*Table{},
		TableNameMap: map[string]*Table{},
	}
}

func (b *Base) TableCount() int {
	return len(b.Tables)
}

func (b *Base) AddTable(table *Table) error {
	_, ok := b.TableGUIDMap[table.GUID]
	if ok {
		return errors.New("duplicate table GUID")
	}

	_, ok = b.TableNameMap[table.Name]
	if ok {
		return errors.New("duplicate table Name")
	}

	b.TableGUIDMap[table.GUID] = table
	b.TableNameMap[table.Name] = table
	b.Tables = append(b.Tables, table)

	return nil
}

func (b *Base) ListTables() []TableInfo {
	list := make([]TableInfo, len(b.Tables))

	for index, table := range b.Tables {
		list[index] = TableInfo{
			GUID: table.GUID,
			Name: table.Name,
		}
	}
	return list
}

func (b *Base) GetTableByGUID(guid string) (*Table, error) {
	table, ok := b.TableGUIDMap[guid]

	if !ok {
		return nil, errors.New("Invalid guid. Table not found")
	}

	return table, nil
}

// ExpandChildRelationships used to show the default value for the child records
func (b *Base) ExpandChildRelationships(recs []*RecordCell) []*RecordCell {

	for _, rec := range recs {
		if rec.MetaData.FieldType != FieldTypeRelationship {
			continue
		}

		relationship := rec.MetaData.MetaAttributes.(*MetaFieldTypeRelationship)
		childRecordCells := []*RecordCell{}

		cellValue := rec.FieldData.DataValue.(RelationshipChildData)

		for _, childRecGUID := range cellValue.ChildRecordGUIDs {
			childTable, _ := b.GetTableByGUID(relationship.ChildTableGUID)
			childRecCells, _ := childTable.GetRecordByGUID(childRecGUID)

			expandedCell := &RecordCell{
				MetaData:  childRecCells[0].MetaData,
				FieldData: childRecCells[0].FieldData,
			}
			childRecordCells = append(childRecordCells, expandedCell)
		}

		rec.FieldData.DataValue = HydratedRelationshipChildData{
			ChildRecordGUIDs:    cellValue.ChildRecordGUIDs,
			HydratedRecordCells: childRecordCells,
		}
	}

	return recs
}

const jsonDumpFile = "output.json"

func (b *Base) DumpDataAsJSON() {
	fmt.Printf("[DumpDataAsJSON] tables: %v\n", utils.PrettyMongoString(b.Tables))

	jsonData, _ := json.Marshal(b)
	err := os.WriteFile(jsonDumpFile, jsonData, 0644)
	if err != nil {
		fmt.Printf("[DumpDataAsJSON] error saving json data. Err: %v\n", err)
		return
	}
	fmt.Printf("%+v", b)
}

func NewBaseFromJSON(handler func() (*Base, error)) (*Base, error) {
	jsonData, err := os.ReadFile(jsonDumpFile)
	if os.IsNotExist(err) {
		fmt.Printf("[NewBaseFromJSON] Attempting to create JSON store.\n")
		return handler()
	}

	if err != nil {
		fmt.Printf("[NewBaseFromJSON] error reading json data. Err: %v\n", err)
		return nil, err
	}

	fmt.Printf("[NewBaseFromJSON] Attempting to load existing JSON store.\n")
	b := &Base{}
	json.Unmarshal(jsonData, b)
	fmt.Printf("[NewBaseFromJSON] JSON store loaded successfully.\n")

	return b, nil
}
