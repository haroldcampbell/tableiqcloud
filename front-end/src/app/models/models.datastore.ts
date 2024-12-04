

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

const iota = 0;

export enum TableFieldType {
	FieldTypeString = iota,
	FieldTypeNumber,
	FieldTypeDate,
	FieldTypeText, // To hold markdown data
	FieldTypeRelationship
}

// TableFieldType as string
export enum StringifiedFieldType {
	FieldTypeString = "String",
	FieldTypeNumber = "Number",
	FieldTypeDate = "Date"
}


// TODO: Optimize this so that we can rely on typescript to make this conversion automatically
export function StringifiedFieldTypeToType(s: StringifiedFieldType): TableFieldType {
	switch (s) {
		case StringifiedFieldType.FieldTypeString:
			return TableFieldType.FieldTypeString;

		case StringifiedFieldType.FieldTypeNumber:
			return TableFieldType.FieldTypeNumber;

		case StringifiedFieldType.FieldTypeDate:
			return TableFieldType.FieldTypeDate;

		// case StringifiedFieldType.FieldTypeDate:
		// 	return TableFieldType.FieldTypeText;

		// case StringifiedFieldType.FieldTypeDate:
		// 	return TableFieldType.FieldTypeRelationship;

	}
	return TableFieldType.FieldTypeString
}

export function FieldTypeToStringifiedFieldType(t: TableFieldType): StringifiedFieldType {
	switch (t) {
		case TableFieldType.FieldTypeDate:
			return StringifiedFieldType.FieldTypeDate;

		case TableFieldType.FieldTypeNumber:
			return StringifiedFieldType.FieldTypeNumber;

		case TableFieldType.FieldTypeString:
			return StringifiedFieldType.FieldTypeString;

		// case TableFieldType.FieldTypeText:
		// 	return StringifiedFieldType.FieldTypeString;

		// case TableFieldType.FieldTypeRelationship:
		// 	return StringifiedFieldType.FieldTypeString;

	}

	return StringifiedFieldType.FieldTypeString
}

export interface FieldMetaData {
	TableGUID: string; // Guid for the parent table

	FieldGUID: string;
	FieldName: string;
	FieldType: TableFieldType;
	FieldTypeName: string;
	MetaAttributes: any;
}

export interface FieldData {
	GUID: string;
	RecordGUID: string;
	DataValue: any;
}

export type TableFieldArray = FieldData[];

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


export interface RecordCell {
	MetaData: FieldMetaData;
	FieldData: FieldData;
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


//////////////////////////////////////////////////////////////////////////////////////////
export interface RequestDataCreateField {
	BaseGUID: string;
	TableGUID: string;
	FieldName: string;
	FieldType: StringifiedFieldType;
}

export interface ReqestDataDeleteField {
	BaseGUID: string;
	TableGUID: string;
	TableFieldGUID: string;
}

export interface RequestDataUpdateField {
	BaseGUID: string;
	TableGUID: string;
	TableFieldGUID: string;

	FieldName: string;
	FieldType: TableFieldType;
}

export interface RequestDataCreateRecord {
	BaseGUID: string
	TableGUID: string
}

export interface RequestDataDeleteRecord {
	BaseGUID: string;
	TableGUID: string;
	RecordGUID: string;
}