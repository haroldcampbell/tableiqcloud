from __future__ import annotations
from pydantic import BaseModel,Field
from typing import List, Dict, Optional,Callable
import uuid
import logging

from .table_field import TableField, new_TableField
from .field_data import FieldData
from .field_meta_data import FieldMetaData
from .table_field_type import TableFieldType
from .record_cell import RecordCell


# logger = logging.getLogger(__name__)

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

    def create_table_field_by_name(self, field_name:str, ftype:TableFieldType, field_options:Optional[Dict[str, str]]=None) -> TableRecordData:
        field = new_TableField(self.GUID, field_name, ftype, field_options)
        field = self.add_table_field(field)

        return self.get_records_for_field(field)

    def find_table_field_by_guid(self, table_field_guid:str) -> tuple[int, Optional[TableField]]:
        for i, item in enumerate(self.Fields):
            if item.MetaData is None:
                continue

            if item.MetaData.FieldGUID == table_field_guid:
                return i, item

        return -1, None

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

    def update_table_field_meta_data(self, table_field_guid:str, field_name:str, ftype:TableFieldType):
        index, field = self.find_table_field_by_guid(table_field_guid)
        if index == -1 or field is None:
            raise ValueError(f"Table.update_table_field_meta_data. \n\tField not found. \n\tGUID: {table_field_guid}")

        if field.MetaData is None:
            raise ValueError(f"Table.update_table_field_meta_data. \n\tMetaData can't be None. \n\tfield: {field}")

        field.MetaData.FieldName = str.strip(field_name)
        field.MetaData.FieldType = ftype

        return field.MetaData

    def update_table_field_value(self, table_field_guid:str, field_data:FieldData) -> Optional[FieldData]:
        index, field = self.find_table_field_by_guid(table_field_guid)
        if index == -1 or field is None:
            raise ValueError(f"Table.update_table_field_value. \n\tField not found. \n\tGUID: {table_field_guid}")

        if field.MetaData is None:
            raise ValueError(f"Table.update_table_field_value. \n\tMetaData can't be None. \n\tfield: {field}")

        for d in field.FieldData:
            if d.RecordGUID == field_data.RecordGUID and d.CellGUID == field_data.CellGUID:
                d.DataValue = field_data.DataValue
                return d

        return None

    def create_new_record_GUID(self) -> str:
        self._lastRecordGUID = str(uuid.uuid4()).upper()

        return self._lastRecordGUID

    def append_record(self) -> str:
        record_guid = self.create_new_record_GUID()

        self.RecordGUIDs.append(record_guid)

        return record_guid

    def get_record_by_guid(self, record_guid: str) -> Optional[List[RecordCell]]:
        # logger.debug("Looking up RecordGUID: %s", record_guid)

        if record_guid not in self.RecordGUIDs:
            # logger.warning("RecordGUID not found in RecordGUIDs: %s", record_guid)
            return None

        record_cells:List[RecordCell] = []

        for i, field in enumerate(self.Fields):
            if field.MetaData is None:
                # logger.error("MetaData is None for field index: %d", i)
                raise ValueError(
                    f"Table.get_record_by_guid. MetaData can't be None. \n\tfield: {field}"
                )

            if record_guid not in field.FieldDataGUIDMap:
                # logger.error("RecordGUID %s not found in FieldDataGUIDMap for field %d", record_guid, i)
                raise ValueError(
                    f"Table.get_record_by_guid. RecordGUID {record_guid} not found in FieldDataGUIDMap."
                )

            field_data = next(
                (fd for fd in field.FieldData if fd.RecordGUID == record_guid), None
            )

            if field_data is None:
                # logger.error("No matching FieldData found for RecordGUID %s in field %d", record_guid, i)
                raise ValueError(
                    f"Table.get_record_by_guid. FieldData for RecordGUID {record_guid} not found in FieldData."
                )

            # logger.debug("Appending RecordCell for field %d", i)
            record_cells.append(RecordCell(
                MetaData=field.MetaData,
                FieldData=field_data
            ))

        # logger.info("Successfully retrieved %d RecordCells for RecordGUID %s", len(record_cells), record_guid)
        return record_cells


    def create_table_record(self) -> tuple[str, List[RecordCell]]:
        record_guid = self.append_record()

        fields = self.Fields
        for f in fields:
            f.append_value(record_guid)

        result = self.get_record_by_guid(record_guid)

        if result is None:
            raise ValueError(f"Table.create_table_record. \n\tRecord with GUID {record_guid} not found after creation.")

        return record_guid, result

    def delete_table_record_by_record_guid(self, record_guid: str) -> bool:
        if record_guid not in self.RecordGUIDs:
            return False

        self.RecordGUIDs.remove(record_guid)

        for field in self.Fields:
            field.delete_record_by_record_guid(record_guid)

        return True