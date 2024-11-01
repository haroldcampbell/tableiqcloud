package datastore

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
	GUID      string
	TableGUID string // Guid for the parent table
	FieldName string
	MetaData  *FieldMetaData
	// FieldData represents the actaul data values for the field. Each line represents a row of data.
	FieldData          []*FieldData
	CreatedOnTimestamp int64
	IsDeleted          bool
	DeletedOnTimestamp int64
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

func (f *TableField) InsertValueAtIndex(targetIndex int, recordGUID string, newValue interface{}) {
	data := &FieldData{
		RecordGUID: recordGUID,
		DataValue:  newValue,
	}

	f.FieldData = insertCellData(f.FieldData, data, targetIndex)
}

func (f *TableField) AppendValue(recordGUID string, newValue interface{}) {
	data := &FieldData{
		RecordGUID: recordGUID,
		DataValue:  newValue,
	}

	f.FieldData = append(f.FieldData, data)
}
