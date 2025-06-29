package datastore

import (
	"time"

	"github.com/haroldcampbell/go_utils/utils"
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
	// FieldGUID  string
	CellGUID   string
	RecordGUID string
	DataValue  interface{}
}

// FieldDataGUIDInfo Keeps track of the GUIDs for the field, cell, and record.
type FieldDataGUIDInfo struct {
	// FieldGUID  string
	CellGUID   string
	RecordGUID string
}

func (f *FieldData) toFieldDataGUIDInfo() FieldDataGUIDInfo {
	return FieldDataGUIDInfo{
		// FieldGUID:  f.FieldGUID,
		CellGUID:   f.CellGUID,
		RecordGUID: f.RecordGUID,
	}
}

func newFieldData(fieldGUID string, recordGUID string, newValue interface{}) *FieldData {
	return &FieldData{
		// FieldGUID:  fieldGUID,
		CellGUID:   utils.GenerateUUID(),
		RecordGUID: recordGUID,
		DataValue:  newValue,
	}
}

func NewFieldData(fieldGUID string, recordGUID string) *FieldData {
	return newFieldData(fieldGUID, recordGUID, nil)
}

type RecordGUID = string
type TableField struct {
	MetaData *FieldMetaData
	// FieldData represents the actaul data values for the field. Each line represents a row of data.
	FieldData          []*FieldData
	FieldDataGUIDMap   map[RecordGUID]FieldDataGUIDInfo
	CreatedOnTimestamp int64
	IsDeleted          bool
	DeletedOnTimestamp int64
}

func NewField(name string, fieldType TableFieldType) *TableField {
	metaData := initFieldMetaData(name, fieldType)

	return &TableField{
		MetaData:           metaData,
		FieldData:          make([]*FieldData, 0),
		FieldDataGUIDMap:   map[RecordGUID]FieldDataGUIDInfo{},
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
		FieldDataGUIDMap:   map[RecordGUID]FieldDataGUIDInfo{},
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

// InitFieldWithRecordGUIDs resets the Field's FieldData to n empty values and sets the
// recordGUID for each empty FieldData
func (f *TableField) InitFieldWithRecordGUIDs(recordGUIDs []string) {
	var nilValue interface{}

	f.FieldData = make([]*FieldData, 0)
	f.FieldDataGUIDMap = map[RecordGUID]FieldDataGUIDInfo{}

	for _, recordGUID := range recordGUIDs {
		data := newFieldData(f.MetaData.FieldGUID, recordGUID, nilValue)
		f.FieldData = append(f.FieldData, data)
		f.FieldDataGUIDMap[recordGUID] = data.toFieldDataGUIDInfo()
	}
}

func (f *TableField) InsertValueAtIndex(targetIndex int, recordGUID string, newValue interface{}) {
	data := newFieldData(f.MetaData.FieldGUID, recordGUID, newValue)
	f.FieldData = insertCellData(f.FieldData, data, targetIndex)
	f.FieldDataGUIDMap[recordGUID] = data.toFieldDataGUIDInfo()
}

func (f *TableField) AppendValue(recordGUID string, newValue interface{}) FieldData {
	data := newFieldData(f.MetaData.FieldGUID, recordGUID, newValue)
	f.FieldData = append(f.FieldData, data)
	f.FieldDataGUIDMap[recordGUID] = data.toFieldDataGUIDInfo()

	return *data
}

func (f *TableField) AppendChildRelation(recordGUID string, childRecordGUIDs []string) FieldData {
	cellValue := RelationshipChildData{
		ChildRecordGUIDs: childRecordGUIDs,
	}

	data := newFieldData(f.MetaData.FieldGUID, recordGUID, cellValue)
	f.FieldData = append(f.FieldData, data)
	f.FieldDataGUIDMap[recordGUID] = data.toFieldDataGUIDInfo()

	return *data
}

func (f *TableField) DeleteRecordByRecordGUID(recordGUID string) {
	if f.MetaData.FieldType == FieldTypeRelationship {
		//TODO deal with deleting relationships
		return
	}

	_, ok := f.FieldDataGUIDMap[recordGUID]
	if !ok {
		return
	}

	delete(f.FieldDataGUIDMap, recordGUID)
	for index, data := range f.FieldData {
		if data.RecordGUID == recordGUID {
			f.FieldData = removeIndex(f.FieldData, index)
			return
		}
	}
}
