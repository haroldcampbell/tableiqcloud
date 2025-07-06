from pydantic import BaseModel
from typing import List, Dict, Optional, Any
from enum import IntEnum

class BaseInfo(BaseModel):
    GUID: str
    Name: str


class TableInfo(BaseModel):
    GUID: str
    Name: str

class BaseTableInfo(BaseModel):
	BaseInfo: BaseInfo
	TableInfoArray: List[TableInfo]

## -- Table specific models

class TableFieldType(IntEnum):
    FieldTypeString = 0  # default is string
    FieldTypeNumber = 1
    FieldTypeDate = 2
    FieldTypeText = 3    # To hold markdown data
    FieldTypeRelationship = 4

class FieldMetaData(BaseModel):
    TableGUID: str  # Guid for the parent table
    FieldGUID: str
    FieldName: str
    FieldType: TableFieldType
    FieldTypeName: str
    MetaAttributes: Optional[Any] = None

class FieldData(BaseModel):
    CellGUID: str
    RecordGUID: str
    DataValue: Any

## FieldDataGUIDInfo Keeps track of the GUIDs for the field, cell, and record.
class FieldDataGUIDInfo(BaseModel):
    CellGUID: str
    RecordGUID: str

class TableField(BaseModel):
    MetaData: Optional[FieldMetaData]
    FieldData: List[FieldData]  # Each item represents a row of data
    FieldDataGUIDMap: Dict[str, FieldDataGUIDInfo]  # RecordGUID to FieldDataGUIDInfo
    CreatedOnTimestamp: int
    IsDeleted: bool
    DeletedOnTimestamp: int

TableFieldGUID = str
TableFieldArray = List[FieldData]
class TableRecordData(BaseModel):
    GUID: str
    Name: str
    RecordGUIDs: List[str]
    FieldsMetaData: List[FieldMetaData]=[]
    ColumnValues: Dict[TableFieldGUID, TableFieldArray]={}

class Table(BaseModel):
    GUID: str
    Name: str
    Fields: List[TableField]
    RecordGUIDs: List[str]       # List of the record guids
    FieldsNameIndex: Dict[str, int]  # Maps the Name to the field Index
    CreatedOnTimestamp: int
    IsDeleted: bool
    DeletedOnTimestamp: int
    _lastRecordGUID: Optional[str] = None # Private/internal field, optional

    def GetRecords(self):
        records = TableRecordData(GUID=self.GUID, Name=self.Name, RecordGUIDs=self.RecordGUIDs)

        for item in self.Fields:
            if item.MetaData == None or item.MetaData.FieldGUID == None:
                continue

            records.FieldsMetaData.append(item.MetaData)
            records.ColumnValues[item.MetaData.FieldGUID] = item.FieldData


        return records
