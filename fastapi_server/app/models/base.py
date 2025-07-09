from __future__ import annotations
from pydantic import BaseModel, Field
from typing import List, Dict, Optional, Any
from enum import IntEnum
import uuid
import time

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

field_type_str_map:Dict[str, TableFieldType] ={
   "String": TableFieldType.FieldTypeString,
   "Number": TableFieldType.FieldTypeNumber,
   "Date": TableFieldType.FieldTypeDate,
   "Text": TableFieldType.FieldTypeText,
   "Relationship": TableFieldType.FieldTypeRelationship,
}

def str_to_TableFieldType(field_type_str:str) -> TableFieldType:
    try:
        return field_type_str_map[field_type_str]
    except KeyError:
        raise ValueError(
            f"Invalid field type: '{field_type_str}'."
            f"Valid types are: {', '.join(field_type_str_map.keys())}"
        )

    return ftype
class FieldMetaData(BaseModel):
    TableGUID: str
    FieldGUID: str
    FieldName: str
    FieldType: TableFieldType
    FieldTypeName: Optional[str] = None
    MetaAttributes: Optional[Any] = None


def init_FieldMetaData(table_guid:str, field_name:str, field_type:TableFieldType)->FieldMetaData:
    guid = str(uuid.uuid4()).upper()
    return FieldMetaData(
        TableGUID=table_guid,
        FieldGUID=guid,
        FieldName=field_name,
        FieldType=field_type,
    )



## FieldDataGUIDInfo Keeps track of the GUIDs for the field, cell, and record.
class FieldDataGUIDInfo(BaseModel):
    CellGUID: str
    RecordGUID: str

class FieldData(BaseModel):
    CellGUID: str
    RecordGUID: str
    DataValue: Any

    @classmethod
    def new_field_data(cls, recordGUID:str, newValue:Any)->FieldData:
        guid = str(uuid.uuid4()).upper()
        return FieldData(
            CellGUID=guid,
            RecordGUID=recordGUID,
            DataValue=newValue,
        )

    def to_field_data_GUID_info(self) -> FieldDataGUIDInfo:
        return FieldDataGUIDInfo(
            CellGUID=self.CellGUID,
            RecordGUID=self.RecordGUID
        )

class TableField(BaseModel):
    MetaData: Optional[FieldMetaData]
    FieldData: List[FieldData]  # Each item represents a row of data
    FieldDataGUIDMap: Dict[str, FieldDataGUIDInfo]  # RecordGUID to FieldDataGUIDInfo
    IsDeleted: bool
    CreatedOnTimestamp: int
    DeletedOnTimestamp: int

    def init_field_with_record_GUIDs(self, RecordGUIDs: List[str]):
        # Initializes the field data
        self.FieldData = []
        self.FieldDataGUIDMap = {}

        # Create n cells and set the record guid for the cells

        for recordGUID in RecordGUIDs:
            data = FieldData.new_field_data(recordGUID, None)
            self.FieldData.append(data)
            self.FieldDataGUIDMap[recordGUID] = data.to_field_data_GUID_info()

def new_TableField(table_guid:str, field_name:str, field_type:TableFieldType)->TableField:
    meta_data = init_FieldMetaData(table_guid, field_name=field_name, field_type=field_type)

    return TableField(
        MetaData=meta_data,
        FieldData=[],
        FieldDataGUIDMap={},
        IsDeleted=False,
        CreatedOnTimestamp= int(time.time()), #time.Now().Unix(),
        DeletedOnTimestamp=0
    )

TableFieldGUID = str
TableFieldArray = List[FieldData]
class TableRecordData(BaseModel):
    GUID: str
    Name: str
    RecordGUIDs: List[str]=Field(default_factory=list)
    FieldsMetaData: List[FieldMetaData]=Field(default_factory=list)
    ColumnValues: Dict[TableFieldGUID, TableFieldArray]=Field(default_factory=dict)



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

    def GetRecords(self) -> TableRecordData:
        records = TableRecordData(GUID=self.GUID, Name=self.Name, RecordGUIDs=self.RecordGUIDs)

        for item in self.Fields:
            if item.MetaData == None or item.MetaData.FieldGUID == None:
                continue

            records.FieldsMetaData.append(item.MetaData)
            records.ColumnValues[item.MetaData.FieldGUID] = item.FieldData

        return records

    def add_table_field(self, field:TableField)->TableField:
        if field.MetaData == None:
            raise ValueError(f"Table.add_table_field. \n\tMetaData can't be None. \n\tfield: {field}")

        field.MetaData.FieldName = str.strip(field.MetaData.FieldName)

        if self.FieldsNameIndex.get(field.MetaData.FieldName) != None:
            raise ValueError(f"Table.add_table_field. \n\tDuplicate fieldname. \n\tfield: {field}")

        self.Fields.append(field)
        index = len(self.Fields) - 1
        self.FieldsNameIndex[field.MetaData.FieldName] = index

        field.init_field_with_record_GUIDs(self.RecordGUIDs)

        return field

    def get_records_for_field(self, field:TableField) -> TableRecordData:
        records = TableRecordData(GUID=self.GUID, Name=self.Name)

        if field.MetaData == None:
            raise ValueError(f"Table.get_records_for_field. \n\tMetaData can't be None. \n\tfield: {field}")

        records.FieldsMetaData.append(field.MetaData)
        records.ColumnValues[field.MetaData.FieldGUID] = field.FieldData

        return records

    def create_table_field_by_name(self, field_name:str, ftype:TableFieldType):
        field = new_TableField(self.GUID, field_name, ftype)
        field = self.add_table_field(field)

        return self.get_records_for_field(field)

    def delete_table_field(self, table_field_guid:str):
        field_name=None
        field_index=-1

        for i, item in enumerate(self.Fields):
            if item.MetaData is None:
                continue

            if item.MetaData.FieldGUID == table_field_guid:
                field_name = item.MetaData.FieldName
                field_index=i
                break

        # field not found in list of fields
        if field_index == -1 or field_name is None:
            return False

        # delete the record from the self.Fields
        del self.Fields[field_index]
        # delete the record from the self.FieldsNameIndex
        self.FieldsNameIndex.pop(field_name, None)

        return True



class RequestDataCreateField(BaseModel):
	BaseGUID: str
	TableGUID: str
	FieldName: str
	FieldType: str

class RequestDataDeleteField(BaseModel):
    BaseGUID: str
    TableGUID: str
    TableFieldGUID: str