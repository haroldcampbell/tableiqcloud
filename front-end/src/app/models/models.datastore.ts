

export interface TableInfo {
	GUID: string;
	Name: string;
	// CreatedOnTimestamp: number;
	// CreatedOn: Date; // Calculated
}


// function infoToLocalDate(list: BoardInfo[]) {
// 	return list.map(info => {
// 		info.CreatedOn = new Date(info.CreatedOnTimestamp * 1000)
// 		return info
// 	});
// }

// export function provisionBoardAccessList(data: BoardAccessListData) {
// 	data.BoardInfoList = infoToLocalDate(data.BoardInfoList);
// 	data.PendingBoardInfoList = infoToLocalDate(data.PendingBoardInfoList);
// 	return data
// }

export enum TableFieldType {
	FieldTypeString = 1,
	FieldTypeNumber,
	FieldTypeDate,
	FieldTypeText, // To hold markdown data
	FieldTypeRelationship
}

export interface FieldMetaData {
	tableGUID: string; // Guid for the parent table

	FieldGUID: string;
	FieldName: string;
	FieldType: TableFieldType;
	FieldTypeName: string;
	MetaAttributes: any;
}

export interface FieldData {
	RecordGUID: string;
	DataValue: any;
}

type TableFieldArray = FieldData[];

export interface TableField {
	MetaData: FieldMetaData;
	// FieldData represents the actaul data values for the field. Each line represents a row of data.
	FieldData: TableFieldArray;
	FieldDataGUIDMap: { [GUID: string]: FieldData };
	CreatedOnTimestamp: number;
	IsDeleted: boolean;
	DeletedOnTimestamp: number;
}

export interface TableRecordData {
	GUID: string;
	Name: string;
	RecordGUIDs: string[];
	FieldsMetaData: FieldMetaData[];
	ColumnValues: { [TableFieldGUID: string]: TableFieldArray };
}


export interface Table {
	GUID: string;
	Name: string;
	Fields: TableField[];
	RecordGUIDs: string[]       // List of the record guids
	FieldsNameIndex: { [Name: string]: number } // Maps the Name to the field Index
	CreatedOnTimestamp: number;
	IsDeleted: boolean;
	DeletedOnTimestamp: number;
}

//////////////////////////////////////////////////////////////////////////////////////////
// Base
export interface Base {
	GUID: string;
	Name: string;
	Tables: Table[];
	TableGUIDMap: { [GUID: string]: Table };
	TableNameMap: { [Name: string]: Table };
}

export interface BaseInfo {
	GUID: string;
	Name: string;
}


export interface BaseTableInfo {
	GUID: string;
	Name: string;
	TableInfoArray: TableInfo[];
}
