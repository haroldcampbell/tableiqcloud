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
	tableGUID: string // Guid for the parent table

	FieldGUID: string
	FieldName: string
	FieldType: TableFieldType
	FieldTypeName: string
	MetaAttributes: any
}

export interface FieldData {
	RecordGUID: string
	DataValue: any
}

type TableFieldArray = FieldData[];
export interface TableRecordData {
	GUID: string;
	Name: string;
	RecordGUIDs: string[];
	FieldsMetaData: FieldMetaData[];
	ColumnValues: { [TableFieldGUID: string]: TableFieldArray };
	// ColumnValues   map[TableFieldGUID]TableFieldArray // TableField.GUID -> []FieldData
}