package datastore

import (
	"time"
)

type RelationshipChildData struct {
	// AllowMultipleRecords bool // Allow 1-to-many
	ChildRecordGUIDs []string
}

type HydratedRelationshipChildData struct {
	ChildRecordGUIDs    []string
	HydratedRecordCells []*RecordCell
}

type FieldData struct {
	RecordGUID string
	DataValue  interface{}
}

func NewFieldData(recordGUID string) *FieldData {
	return &FieldData{
		RecordGUID: recordGUID,
		DataValue:  nil,
	}
}

type TableField struct {
	MetaData *FieldMetaData
	// FieldData represents the actaul data values for the field. Each line represents a row of data.
	FieldData          []*FieldData
	FieldDataGUIDMap   map[string]*FieldData
	CreatedOnTimestamp int64
	IsDeleted          bool
	DeletedOnTimestamp int64
}

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

func (f *TableField) CountValues() int {
	return len(f.FieldData)
}

func (f *TableField) GetValues() []*FieldData {
	return f.FieldData
}

// See article: https://antonio-velazquez-bustamante.medium.com/inserting-an-element-into-a-slice-in-go-golang-97c7120ca7ca
func insertCellData(list []*FieldData, cell *FieldData, index int) []*FieldData {
	return append(list[:index],
		append([]*FieldData{cell}, list[index:]...)...)
}

func newFieldData(recordGUID string, newValue interface{}) *FieldData {
	return &FieldData{
		RecordGUID: recordGUID,
		DataValue:  newValue,
	}
}

func (f *TableField) InsertValueAtIndex(targetIndex int, recordGUID string, newValue interface{}) {
	data := newFieldData(recordGUID, newValue)
	f.FieldData = insertCellData(f.FieldData, data, targetIndex)
	f.FieldDataGUIDMap[recordGUID] = data
}

func (f *TableField) AppendValue(recordGUID string, newValue interface{}) FieldData {
	data := newFieldData(recordGUID, newValue)
	f.FieldData = append(f.FieldData, data)
	f.FieldDataGUIDMap[recordGUID] = data

	return *data
}

func (f *TableField) AppendChildRelation(recordGUID string, childRecordGUIDs []string) FieldData {
	cellValue := RelationshipChildData{
		ChildRecordGUIDs: childRecordGUIDs,
	}

	data := newFieldData(recordGUID, cellValue)
	f.FieldData = append(f.FieldData, data)
	f.FieldDataGUIDMap[recordGUID] = data

	return *data
}
