package datastore_test

import (
	"tableiq/datastore"
	"testing"

	"github.com/haroldcampbell/go_utils/utils"
	"github.com/stretchr/testify/assert"
)

func Test_CreateLinkedField(t *testing.T) {
	var r1, r2 string
	var defaultChildValue datastore.FieldData

	table1 := datastore.NewTable("Contacts")
	f1, _ := table1.AddTableField(datastore.NewField("Name", datastore.FieldTypeString))
	f2, _ := table1.AddTableField(datastore.NewField("Job Title", datastore.FieldTypeString))
	table1.AppendRecord(func(recordGUID string) {
		r1 = recordGUID
		defaultChildValue = f1.AppendValue(recordGUID, "Mark Smith")
		f2.AppendValue(recordGUID, "Student")
	})
	table1.AppendRecord(func(recordGUID string) {
		r2 = recordGUID
		f1.AppendValue(recordGUID, "Brad Jame")
		f2.AppendValue(recordGUID, "Banker")
	})

	table2 := datastore.NewTable("Stores")
	ff1, _ := table2.AddTableField(datastore.NewField("Destination", datastore.FieldTypeString))

	lf := datastore.NewRelationshipField(
		"Managers",
		table1.GUID,
		f1.MetaData.FieldGUID,
	)
	table2.AddTableField(lf)

	base := datastore.NewBase("core")
	base.AddTable(table1)
	base.AddTable(table2)

	var recGUID string
	var fd1, fd2 datastore.FieldData
	table2.AppendRecord(func(recordGUID string) {
		recGUID = recordGUID
		fd1 = ff1.AppendValue(recordGUID, "Portland")
		fd2 = lf.AppendChildRelation(recordGUID, []string{r1})
	})

	table2.AppendRecord(func(recordGUID string) {
		ff1.AppendValue(recordGUID, "Portmore")
		lf.AppendChildRelation(recordGUID, []string{r1, r2})
	})

	expectedRecord := []*datastore.RecordCell{
		{
			MetaData:  ff1.MetaData,
			FieldData: fd1,
		},
		{
			MetaData:  lf.MetaData,
			FieldData: fd2,
		},
	}
	actual, _ := table2.GetRecordByGUID(recGUID)
	assert.Equal(t, expectedRecord, actual, "GetRecordByGUID: should show child relationship")

	expectedChildFields := expectedRecord
	expectedChildFields[1].FieldData = datastore.FieldData{
		CellGUID:   utils.GenerateUUID(),
		RecordGUID: fd2.RecordGUID,
		DataValue: datastore.HydratedRelationshipChildData{
			ChildRecordGUIDs: fd2.DataValue.(datastore.RelationshipChildData).ChildRecordGUIDs,
			HydratedRecordCells: []*datastore.RecordCell{
				{
					MetaData:  f1.MetaData,
					FieldData: defaultChildValue,
				},
			},
		},
	}
	actual = base.ExpandChildRelationships(actual)
	assert.Equal(t, expectedChildFields, actual, "ExpandChildRelationships: should show default child values")
}
