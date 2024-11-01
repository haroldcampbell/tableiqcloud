package datastore

type TableFieldType int

const (
	FieldTypeString TableFieldType = iota // default is string
	FieldTypeNumber
	FieldTypeDate
	FieldTypeText // To hold markdown data
)

// FieldTypeAttribute keeps the meta data for the field
// example: String-type
//
//	{
//		AttributeName: "maximum string lenght",
//		AttributeValue: 64, //the actual maximum string length
//	}
type FieldTypeAttribute struct {
	AttributeName  string
	AttributeValue interface{}
}

type FieldMetaData struct {
	FieldType       TableFieldType
	FieldTypeName   string
	FieldAttributes map[string]*FieldTypeAttribute
}

type TableField struct {
	GUID      string
	TableGUID string // Guid for the parent table
	FieldName string
	MetaData  *FieldMetaData
	// FieldData represents the actaul data values for the field. Each line represents a row of data.
	FieldData          []interface{}
	CreatedOnTimestamp int64
	IsDeleted          bool
	DeletedOnTimestamp int64
}

func initFieldMetaData(fieldType TableFieldType) *FieldMetaData {
	metaData := &FieldMetaData{
		FieldType: fieldType,
	}

	switch fieldType {
	case FieldTypeString:
		metaData.FieldTypeName = "FieldTypeString"
	case FieldTypeNumber:
		metaData.FieldTypeName = "FieldTypeNumber"
	case FieldTypeDate:
		metaData.FieldTypeName = "FieldTypeDate"
	case FieldTypeText:
		metaData.FieldTypeName = "FieldTypeText"
	}

	return metaData
}

func (f *TableField) CountValues() int {
	return len(f.FieldData)
}

func (f *TableField) SetValues(values []interface{}) {

	f.FieldData = make([]interface{}, len(values))
	copy(f.FieldData, values)
}

func (f *TableField) GetValues() []interface{} {
	return f.FieldData
}

// FIXME: This is not efficient
func (f *TableField) InsertValueAtIndex(targetIndex int, newValue interface{}) {
	newValues := make([]interface{}, len(f.FieldData)+1)

	cellIndex := 0
	for index := range f.FieldData {

		if index == targetIndex {
			newValues[targetIndex] = newValue
			cellIndex++
			newValues[cellIndex] = f.FieldData[index]
		} else {
			newValues[cellIndex] = f.FieldData[index]
		}
		cellIndex++
	}

	f.FieldData = newValues
}

func (f *TableField) AppendValue(newValue interface{}) {
	f.FieldData = append(f.FieldData, newValue)
}
