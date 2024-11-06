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

// Move the NewField so that the tests would pass. It wasn't finding the Table struct when it was in the field.go file
func NewField(name string, fieldType TableFieldType) *TableField {
	metaData := initFieldMetaData(name, fieldType)

	return &TableField{
		MetaData:           metaData,
		FieldData:          make([]*FieldData, 0),
		FieldDataGUIDMap:   map[string]*FieldData{},
		IsDeleted:          false,
		CreatedOnTimestamp: time.Now().Unix(),
		DeletedOnTimestamp: 0,
	}
}

// NewRelationshipField creates a field that is linked to, and pulling data from a childTable
// @fieldName the name of the field
// @childTableGuid the source table where the data will be coming from
// @defaultChildFieldGUID the field(s) from the source table that will be shown in this field
func NewRelationshipField(fieldName string, childTableGUID, defaultChildFieldGUID string) *TableField {
	metaData := initFieldMetaData(fieldName, FieldTypeRelationship)

	relationship := metaData.MetaAttributes.(*MetaFieldTypeRelationship)
	relationship.ChildTableGUID = childTableGUID
	relationship.DefaultChildFieldGUID = defaultChildFieldGUID

	return &TableField{
		MetaData:           metaData,
		FieldData:          make([]*FieldData, 0),
		FieldDataGUIDMap:   map[string]*FieldData{},
		IsDeleted:          false,
		CreatedOnTimestamp: time.Now().Unix(),
		DeletedOnTimestamp: 0,
	}
}
