package main

import (
	"airport-mode/datastore"
	"fmt"
)

func MockStore() *datastore.Datastore {
	store := datastore.NewDatastore()

	err := datastore.NewBaseFromJSON(store, "core", func(base *datastore.Base) {
		CreateMockTasks(base)
		CreateMockContacts(base)
		CreateMockAccounts(base)
	})
	if err != nil {
		fmt.Printf("Failed to load mock data")
		return nil
	}

	datastore.NewBaseFromJSON(store, "CRM", func(base *datastore.Base) {})
	datastore.NewBaseFromJSON(store, "Deliveries", func(base *datastore.Base) {})

	return store
}

func createModelData(base *datastore.Base, tableName string, fieldNames []string, data [][]string) {
	table := datastore.NewTable(tableName)

	for _, name := range fieldNames {
		table.AddTableField(datastore.NewField(name, datastore.FieldTypeString))
	}

	for _, rowData := range data {
		table.AppendRecord(func(recordGUID string) {
			for fieldIndex, name := range fieldNames {
				table.AppendFieldValuesByFieldName(recordGUID, name, rowData[fieldIndex])
			}
		})
	}

	base.AddTable(table)
}

func CreateMockAccounts(base *datastore.Base) {
	fieldNames := []string{"Company", "Address", "Country", "Industry"}
	data := [][]string{
		{"UWI Mona", "Mona, Kingston", "Jamaica", "University"},
		{"Grace Science Lab", "15 Abby Rd, Bookfield", "Turkey", "Medical Research"},
		{"Heart Trust", "Apt 22, Court Lane, 9982-1129", "Canada", "GeoScience"},
	}

	createModelData(base, "Accounts", fieldNames, data)
}

func CreateMockContacts(base *datastore.Base) {
	fieldNames := []string{"Name", "Company", "City", "Country", "Phone 1", "Phone 2", "Email", "DOB", "Website"}
	data := [][]string{
		{"John Snow", "Amazon.com", "The Wall", "Northlands", "", "", "", "1950/12/03", ""},
		{"Rick Adison", "Bank of Turkey", "15 Abby Rd, Bookfield", "Turkey", "", "", "", "1983/09/23", ""},
		{"Joy Springland", "Happy Books", "Apt 22, Court Lane, 9982-1129", "Canada", "", "", "", "1995/07/07", ""},
		{"Sheryl Baxter", "Rasmussen Group", "East Leonard", "Chile", "229.077.5154", "397.884.0519x718", "zunigavanessa@smith.info", "24/08/2020", "http://www.stephenson.com/"},
		{"Preston Lozano", "Vega-Gentry", "East Jimmychester", "Djibouti", "5153435776", "686-620-1820x944", "vmata@colon.com", "23/04/2021", "http://www.hobbs.com/"},
		{"Roy Berry", "	Murillo-Perry", "Isabelborough", "Antigua and Barbuda", "-1199", "(496)978-3969x58947", "beckycarr@hogan.com", "25/03/2020", "http://www.lawrence.com/"},
		{"Linda	Olsen ", "Dominguez, Mcmillan and Donovan", "Bensonview", "Dominican Republic", "001-808-617-6467x12895", "-9892", "stanleyblackwell@benson.org", "02/06/2020", "http://www.good-lyons.com/"},
		{"Joanna Bender", "Martin, Lang and Andrade", "West Priscilla", "Slovakia (Slovak Republic)", "001-234-203-0635x76146", "001-199-446-3860x3486", "colinalvarado@miles.net", "17/04/2021", "https://goodwin-ingram.com/"},
		{"Aimee	Downs", "Steele Group", "Chavezborough", "Bosnia and Herzegovina", "(283)437-3886x88321", "999-728-1637", "louis27@gilbert.com", "25/02/2020", "http://www.berger.net/"},
		{"Darren Peck", "Lester, Woodard and Mitchell", "Lake Ana", "Pitcairn Islands", "(496)452-6181x3291", "+1-247-266-0963x4995", "tgates@cantrell.com", "24/08/2021", "https://www.le.com/"},
	}

	createModelData(base, "Contacts", fieldNames, data)
}

func CreateMockTasks(base *datastore.Base) {
	fieldNames := []string{"Title", "Description"}
	var data [][]string = [][]string{
		{"Select trip", "Where do we want to go"},
		{"Do Purcahse", "Buy the ticket"},
		{"Enjoy vacation", "Go to the place and have fun"},
	}

	createModelData(base, "Tasks", fieldNames, data)
}
