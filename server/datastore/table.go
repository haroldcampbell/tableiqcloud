package datastore

import (
	"errors"
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
		GUID:               utils.GenerateUUID(),
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
	t._lastRecordGUID = utils.GenerateUUID()

	return t._lastRecordGUID
}

func (t *Table) GeLastCreatedRecordGUID() string {
	if t._lastRecordGUID == "" {
		return t.createNewRecordGUID()
	}

	return t._lastRecordGUID
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

func (t *Table) AddTableField(field *TableField) (*TableField, error) {
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

func (t *Table) GetRecordCount() int {
	return len(t.RecordGUIDs)
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

// GetRecords returns a slice of records
func (t *Table) GetRecords() TableRecordData {
	records := TableRecordData{
		GUID:           t.GUID,
		Name:           t.Name,
		RecordGUIDs:    []string{},
		FieldsMetaData: []*FieldMetaData{},
		ColumnValues:   map[TableFieldGUID]TableFieldArray{},
	}

	// recordCount := len(t.RecordGUIDs)
	// targetSize := startIndex + count
	// if targetSize <= recordCount {
	// 	records.RecordGUIDs = t.RecordGUIDs[targetSize:]
	// } else {
	// 	//Fix this	``
	// }

	// Returns the meta data
	for _, f := range t.Fields {
		records.FieldsMetaData = append(records.FieldsMetaData, f.MetaData)
		records.ColumnValues[f.MetaData.FieldGUID] = f.FieldData
	}

	// TODO: Implement paging
	// Grab all of the record GUIDs.
	records.RecordGUIDs = t.RecordGUIDs

	return records
}
