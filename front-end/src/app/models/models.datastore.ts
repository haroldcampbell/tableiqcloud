

export interface TableInfo {
	GUID: string;
	Name: string;
	// CreatedOnTimestamp: number;
	// CreatedOn: Date; // Calculated
}


const iota = 0;

export enum TableFieldType {
	FieldTypeString = iota,
	FieldTypeNumber,
	FieldTypeDate,
	FieldTypeText, // To hold markdown data
	FieldTypeRelationship,
	FieldTypeOption, // For dropdowns
	FieldTypeYesNo,
	FieldTypeStar,
}

// TableFieldType as string
export enum StringifiedFieldType {
	FieldTypeString = "String",
	FieldTypeNumber = "Number",
	FieldTypeDate = "Date",
	FieldTypeOption = "Option",
	FieldTypeYesNo = "YesNo",
	FieldTypeStar = "Star",
	FieldTypeRelationship = "Relationship",

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

		case StringifiedFieldType.FieldTypeRelationship:
			return TableFieldType.FieldTypeRelationship;

		case StringifiedFieldType.FieldTypeOption:
			return TableFieldType.FieldTypeOption;

		case StringifiedFieldType.FieldTypeYesNo:
			return TableFieldType.FieldTypeYesNo;

		case StringifiedFieldType.FieldTypeStar:
			return TableFieldType.FieldTypeStar;

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

		case TableFieldType.FieldTypeOption:
			return StringifiedFieldType.FieldTypeOption;


		// case TableFieldType.FieldTypeText:
		// 	return StringifiedFieldType.FieldTypeString;

		case TableFieldType.FieldTypeRelationship:
			return StringifiedFieldType.FieldTypeRelationship;

	}

	return StringifiedFieldType.FieldTypeString
}


// ---- FieldParams code for FieldTypeOption
export const InfoKeyRelationship = "relationship"
export const InfoKeyOption = "option"

export function CreateFieldOptionAsSelect(items: FieldParamOptionInfo[]) {
	let options: FieldOptionsType = {}
	options[InfoKeyOption] = items;

	return options
}
export function GetFieldOptionAsSelect(FieldType: TableFieldType, fieldParams?: FieldParamOption): FieldParamOptionInfo[] {
	if (FieldType !== TableFieldType.FieldTypeOption) return [];

	return fieldParams?.ParamValues ?? [];
}

export interface FieldParamOptionInfo {
	OptionId: string;
	OptionIndex: number;
	OptionName: string;
	OptionMetaData: any; // Additional meta data
}

export const Key_FieldParamOptionInfo_OptionMetaDataColor = "itemColor";

export interface FieldParamOption {
	ParamKey: string;
	ParamValues: FieldParamOptionInfo[]
}

// ---- FieldParams code for FieldTypeRelationship
export function CreateFieldRelationshipAsSelect(items: FieldParamLinkedFieldInfo) {
	let options: FieldOptionsType = {}
	options[InfoKeyRelationship] = items;

	return options
}


export interface FieldParamLinkedFieldInfo {
	InfoId: string;
	ParentTableGUID: string;
	LinkedChildTableGUID: string;
	LinkedFieldGUID: string;
	AllowMultipleValues: boolean;
	AllowDuplicates: boolean; // Duplicates are only allowed if MultipleValues is true
}

export interface FieldParamRelationship {
	ParamKey: string;
	ParamValues: FieldParamLinkedFieldInfo
}

// ----
export interface FieldMetaData {
	TableGUID: string; // Guid for the parent table

	FieldGUID: string;
	FieldName: string;
	FieldType: TableFieldType;
	FieldTypeName: string;
	MetaAttributes: any;
	FieldParams: FieldParamOption | FieldParamRelationship | any; // For dropdowns, etc. This is a map of option names to values
}

export interface FieldData {
	CellGUID: string;
	RecordGUID: string;
	DataValue: any;
}

export type TableFieldArray = FieldData[];

export interface TableField {
	MetaData: FieldMetaData;
	// FieldData represents the actaul data values for the field. Each line represents a row of data.
	FieldData: TableFieldArray;
	FieldDataGUIDMap: { [CellGUID: string]: FieldData };
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

export interface TableFieldInfo {
	GUID: string;
	Name: string;
	FieldsMetaData: FieldMetaData[];
	FieldsNameIndex: { [Name: string]: number } // Maps the Name to the field Index
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

export type FieldOptionsType = { [key: string]: any };

//////////////////////////////////////////////////////////////////////////////////////////
export interface RequestDataCreateField {
	BaseGUID: string;
	TableGUID: string;
	FieldName: string;
	FieldType: StringifiedFieldType;
	FieldOptions?: FieldOptionsType; // For dropdowns, etc.
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
	FieldOptions?: FieldOptionsType; // For dropdowns, etc.
}

export interface RequestDataUpdateFieldResponse {
	FieldMetaData: FieldMetaData;
	FieldData: FieldData[];
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

export interface RequestDataUpdateFieldDataValue {
	BaseGUID: string;
	TableGUID: string;
	FieldGUID: string;
	FieldData: FieldData;
}

export interface RequestDataAddLinkedTableCellValue {
	BaseGUID: string;
	TableGUID: string;
	FieldGUID: string;
	RecordGUID: string;
	CellGUID: string;

	LinkedFielData: FieldData;
}

export interface RequestDataDeleteLinkedTableCellValue {
	BaseGUID: string;
	TableGUID: string;
	FieldGUID: string;
	CellGUID: string;
	LinkedTableRecordGUID: string;
	LinkedTableCellGUID: string;
}