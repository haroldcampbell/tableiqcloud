package datastore

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

// type TableFieldRelationship struct {
// 	*TableField
// }

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
