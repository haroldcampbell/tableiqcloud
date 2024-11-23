package datastore

import (
	"errors"
	"fmt"
	"strings"
	"time"

	"github.com/haroldcampbell/go_utils/utils"
)

type Table struct {
	GUID               string
	Name               string
	Fields             []*TableField
	RecordGUIDs        []string       // List of the record guids
	FieldsNameIndex    map[string]int // Maps the Name to the field Index
	CreatedOnTimestamp int64
	IsDeleted          bool
	DeletedOnTimestamp int64

	_lastRecordGUID string
}

type RecordCell struct {
	MetaData  *FieldMetaData
	FieldData FieldData
}

func NewTable(name string) *Table {
	return &Table{
		GUID:               utils.GenerateSLUG(),
		Name:               name,
		Fields:             make([]*TableField, 0),
		RecordGUIDs:        []string{},
		FieldsNameIndex:    map[string]int{},
		CreatedOnTimestamp: time.Now().Unix(),
		IsDeleted:          false,
		DeletedOnTimestamp: 0,
	}
}

func (t *Table) createNewRecordGUID() string {
	t._lastRecordGUID = utils.GenerateSLUG()

	return t._lastRecordGUID
}

func (t *Table) GeLastCreatedRecordGUID() string {
	if t._lastRecordGUID == "" {
		return t.createNewRecordGUID()
	}

	return t._lastRecordGUID
}

func (t *Table) getRecordGUIDs() []string {
	return t.RecordGUIDs
}

func (t *Table) GetRecordCount() int {
	return len(t.RecordGUIDs)
}

func (t *Table) UpdateTableName(name string) {
	t.Name = name
}

func (t *Table) MarkTableForDeletion() {
	if t.IsDeleted {
		// exit if table already marked for deletion
		return
	}
	t.DeletedOnTimestamp = time.Now().Unix()
	t.IsDeleted = true
}

func (t *Table) CreateTableFieldByName(fieldName string, fieldType TableFieldType) (TableRecordData, error) {
	f, err := t.AddTableField(NewField(fieldName, fieldType))
	if err != nil {
		return TableRecordData{}, err
	}

	return t.GetRecordsForField(f), nil
}

func (t *Table) AddTableField(field *TableField) (*TableField, error) {
	// TODO: Validate the string name and lenght
	field.MetaData.FieldName = strings.TrimSpace(field.MetaData.FieldName)
	if field.MetaData.FieldName == "" {
		field.MetaData.FieldName = fmt.Sprintf("Column_%d", len(t.FieldsNameIndex)+1)
	}

	// TODO: Ensure that field names are unique
	_, ok := t.FieldsNameIndex[field.MetaData.FieldName]
	if ok {
		return nil, errors.New("duplicate field name")
	}

	field.MetaData.SetTableGUID(t.GUID)

	// TODO: Fix this so that it can work when fields are added at other locations
	// apart from the end of the list
	t.Fields = append(t.Fields, field)
	index := len(t.Fields) - 1
	t.FieldsNameIndex[field.MetaData.FieldName] = index

	// TODO: this is not efficient
	// Initialize the records to nil values
	field.InitFieldWithRecordGUIDs(t.RecordGUIDs)

	return field, nil
}

func (t *Table) GetFields() []*TableField {
	return t.Fields
}

func (t *Table) AppendFieldValuesByFieldName(recordGUID string, fieldName string, fieldValue interface{}) (*TableField, error) {
	fieldIndex, ok := t.FieldsNameIndex[fieldName]

	if !ok {
		return nil, errors.New("field name not found")
	}

	field := t.Fields[fieldIndex]
	field.AppendValue(recordGUID, fieldValue)

	return field, nil
}

func (t *Table) AppendRecord(newRecordHandler func(recordGUID string)) {
	recordGUID := t.createNewRecordGUID()
	newRecordHandler(recordGUID)
	t.RecordGUIDs = append(t.RecordGUIDs, recordGUID)
}

func (t *Table) GetRecordByGUID(recordGUID string) ([]*RecordCell, error) {
	recordCells := make([]*RecordCell, 0)

	for _, field := range t.Fields {
		result, ok := field.FieldDataGUIDMap[recordGUID]
		if !ok {
			return nil, errors.New("GetRecordByGUID failed. Can't find recordGUID")
		}
		cell := &RecordCell{
			MetaData:  field.MetaData,
			FieldData: *result,
		}

		recordCells = append(recordCells, cell)
	}
	return recordCells, nil
}

type TableFieldGUID = string
type TableFieldArray = []*FieldData
type TableRecordData struct {
	GUID           string
	Name           string
	RecordGUIDs    []string
	FieldsMetaData []*FieldMetaData
	ColumnValues   map[TableFieldGUID]TableFieldArray // TableField.GUID -> []FieldData
}

func (t *Table) NewTableRecordData() TableRecordData {
	return TableRecordData{
		GUID:           t.GUID,
		Name:           t.Name,
		RecordGUIDs:    t.RecordGUIDs, // Grab all of the record GUIDs.
		FieldsMetaData: []*FieldMetaData{},
		ColumnValues:   map[TableFieldGUID]TableFieldArray{},
	}
}

// GetRecords returns a slice of records
func (t *Table) GetRecords() TableRecordData {
	records := t.NewTableRecordData()

	// Returns the meta data
	for _, f := range t.Fields {
		fmt.Printf("[GetRecords] f.MetaData: %#v\n", f.MetaData)
		records.FieldsMetaData = append(records.FieldsMetaData, f.MetaData)
		records.ColumnValues[f.MetaData.FieldGUID] = f.FieldData
	}

	return records
}

// GetRecords returns a slice of records
func (t *Table) GetRecordsForField(f *TableField) TableRecordData {
	records := t.NewTableRecordData()

	// Returns the meta data
	records.FieldsMetaData = append(records.FieldsMetaData, f.MetaData)
	records.ColumnValues[f.MetaData.FieldGUID] = f.FieldData

	return records
}
