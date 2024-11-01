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

func (t *Table) AddTableField(field *TableField) error {
	// TODO: Ensur that field names are unique
	_, ok := t.FieldsNameIndex[field.FieldName]
	if ok {
		return errors.New("duplicate field name")
	}

	// TODO: Fix this so that it can work when fields are added at other locations
	// apart from the end of the list
	t.Fields = append(t.Fields, field)
	index := len(t.Fields) - 1
	t.FieldsNameIndex[field.FieldName] = index

	return nil
}

func (t *Table) GetFields() []*TableField {
	return t.Fields
}

func (t *Table) AppendFieldValuesByFieldName(fieldName string, fieldValue interface{}) error {
	fieldIndex, ok := t.FieldsNameIndex[fieldName]

	if !ok {
		return errors.New("field name not found")
	}

	field := t.Fields[fieldIndex]
	field.AppendValue(fieldValue)

	return nil
}

// Move the NewField so that the tests would pass. It wasn't finding the Table struct when it was in the field.go file
func NewField(tableGUID string, name string, fieldType TableFieldType) *TableField {
	metaData := initFieldMetaData(fieldType)

	return &TableField{
		GUID:               utils.GenerateUUID(),
		TableGUID:          tableGUID,
		FieldName:          name,
		MetaData:           metaData,
		IsDeleted:          false,
		CreatedOnTimestamp: time.Now().Unix(),
		DeletedOnTimestamp: 0,
	}
}
