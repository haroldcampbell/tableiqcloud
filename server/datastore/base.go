package datastore

import (
	"encoding/json"
	"errors"
	"fmt"
	"os"

	"github.com/haroldcampbell/go_utils/utils"
)

type TableInfo struct {
	GUID string
	Name string
}

type BaseInfo struct {
	GUID string
	Name string
}

type BaseTableInfo struct {
	BaseInfo
	TableInfoArray []TableInfo
}

type Base struct {
	BaseGUID     string
	Name         string
	Tables       []*Table
	TableGUIDMap map[string]*Table `json:"-"`
	TableNameMap map[string]*Table `json:"-"`
}

func NewBase(name string) *Base {
	b := &Base{
		BaseGUID: utils.GenerateSLUG(),
		Name:     name,
		Tables:   make([]*Table, 0),
	}

	b.HydrateBase()

	return b
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

func (b *Base) ListTables() BaseTableInfo {
	info := BaseTableInfo{
		BaseInfo: BaseInfo{
			GUID: b.BaseGUID,
			Name: b.Name,
		},
		TableInfoArray: make([]TableInfo, len(b.Tables)),
	}

	for index, table := range b.Tables {
		info.TableInfoArray[index] = TableInfo{
			GUID: table.GUID,
			Name: table.Name,
		}
	}

	return info
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

func (b *Base) HydrateBase() {
	b.TableGUIDMap = map[string]*Table{}
	b.TableNameMap = map[string]*Table{}

	for _, t := range b.Tables {
		b.TableGUIDMap[t.GUID] = t
		b.TableNameMap[t.Name] = t
	}
}

const jsonDumpFile = "output.%v.json"

func (b *Base) DumpDataAsJSON(store *Datastore, isSilent bool) error {
	if !isSilent {
		fmt.Printf("[DumpDataAsJSON] tables: %v\n", utils.PrettyMongoString(b.Tables))
	}

	jsonData, _ := json.Marshal(b)
	err := os.WriteFile(fmt.Sprintf(jsonDumpFile, b.Name), jsonData, 0644)
	if err != nil {
		fmt.Printf("[DumpDataAsJSON] error saving json data. Err: %v\n", err)
		return err
	}

	if !isSilent {
		fmt.Printf("%+v", b)
	}

	store.RegisterBase(b)

	return nil
}

func (b *Base) SilentDumpDataAsJSON(store *Datastore) error {
	return b.DumpDataAsJSON(store, true)
}

func NewBaseFromJSON(store *Datastore, baseName string, handler func(base *Base)) error {
	jsonData, err := os.ReadFile(fmt.Sprintf(jsonDumpFile, baseName))
	if os.IsNotExist(err) {
		fmt.Printf("[NewBaseFromJSON] Attempting to create JSON store.\n")
		base := NewBase(baseName)
		handler(base)

		return base.DumpDataAsJSON(store, false)
	}

	if err != nil {
		fmt.Printf("[NewBaseFromJSON] error reading json data. Err: %v\n", err)
		return err
	}

	fmt.Printf("[NewBaseFromJSON] Attempting to load existing JSON store.\n")
	b := &Base{}
	json.Unmarshal(jsonData, b)
	fmt.Printf("[NewBaseFromJSON] JSON store loaded successfully.\n")

	b.HydrateBase()
	store.RegisterBase(b)

	return nil
}
