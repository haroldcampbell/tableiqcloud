package datastore

// See article: https://antonio-velazquez-bustamante.medium.com/inserting-an-element-into-a-slice-in-go-golang-97c7120ca7ca
func insertCellData(list []*FieldData, cell *FieldData, index int) []*FieldData {
	return append(list[:index],
		append([]*FieldData{cell}, list[index:]...)...)
}

// See implications here: https://stackoverflow.com/questions/37334119/how-to-delete-an-element-from-a-slice-in-golang
// This updates and returns the reference.
func removeIndex[T any](slice []T, indexToDelete int) []T {
	return append(slice[:indexToDelete], slice[indexToDelete+1:]...)
}
