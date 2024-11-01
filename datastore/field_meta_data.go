package datastore

type TableFieldType int

const (
	FieldTypeString TableFieldType = iota // default is string
	FieldTypeNumber
	FieldTypeDate
	FieldTypeText // To hold markdown data

	FieldTypeLinkedTable
)

// FieldTypeAttribute keeps the meta data for the field
//
// Examples
//
//	A String-type would have the following
//
//	 AttributeName: "maximum string lenght",
//	 AttributeValue: 64, //the actual maximum string length
type FieldTypeAttribute struct {
	AttributeName  string
	AttributeValue interface{}
}

type FieldMetaData struct {
	FieldType       TableFieldType
	FieldTypeName   string
	FieldAttributes map[string]*FieldTypeAttribute
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
	case FieldTypeLinkedTable:
		metaData.FieldTypeName = "FieldTypeLinkedTable"
	}

	return metaData
}

type FieldMetaDataLinkedTable struct {
	TargetTableGUID string // the GUID for the table we are connecting to
	SourceTableGUID string // the GUID from were the link is originating
}
