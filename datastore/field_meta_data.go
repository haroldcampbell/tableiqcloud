package datastore

import "github.com/haroldcampbell/go_utils/utils"

type TableFieldType int

const (
	FieldTypeString TableFieldType = iota // default is string
	FieldTypeNumber
	FieldTypeDate
	FieldTypeText // To hold markdown data

	// FieldTypeLinkedTable
	FieldTypeRelationship
)

type MetaFieldTypeString struct {
	maxStrLength int
}

type MetaFieldTypeRelationship struct {
	ParentTableGUID       string // Linking the children to the parent.
	ChildTableGUID        string // The linked Child Table
	DefaultChildFieldGUID string // The default child field to show
}

type FieldMetaData struct {
	tableGUID string // Guid for the parent table

	GUID           string
	FieldName      string
	FieldType      TableFieldType
	FieldTypeName  string
	MetaAttributes interface{}
}

func initFieldMetaData(fieldName string, fieldType TableFieldType) *FieldMetaData {
	metaData := &FieldMetaData{
		GUID: utils.GenerateUUID(),
		// TableGUID: tableGUID,
		FieldName: fieldName,
		FieldType: fieldType,
	}

	switch fieldType {
	case FieldTypeString:
		metaData.FieldTypeName = "FieldTypeString"
		// This can be optimized and initialized with a constant
		metaData.MetaAttributes = &MetaFieldTypeString{maxStrLength: 32}
	case FieldTypeNumber:
		metaData.FieldTypeName = "FieldTypeNumber"
	case FieldTypeDate:
		metaData.FieldTypeName = "FieldTypeDate"
	case FieldTypeText:
		metaData.FieldTypeName = "FieldTypeText"
	case FieldTypeRelationship:
		metaData.FieldTypeName = "FieldTypeRelationship"
		metaData.MetaAttributes = &MetaFieldTypeRelationship{}
	}

	return metaData
}

func (m *FieldMetaData) SetTableGUID(tableGUID string) {
	m.tableGUID = tableGUID
	if m.FieldType == FieldTypeRelationship {
		relationship := m.MetaAttributes.(*MetaFieldTypeRelationship)
		relationship.ParentTableGUID = tableGUID
	}
}

func (m *FieldMetaData) GetTableGUID() string {
	return m.tableGUID
}
