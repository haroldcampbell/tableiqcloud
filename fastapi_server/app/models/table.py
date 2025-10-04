from __future__ import annotations
from pydantic import BaseModel,Field
from typing import cast, List, Dict, Optional,Callable, Any
import uuid
import logging
from pprint import pprint

from .table_field import TableField
from .field_data import FieldData
from .field_meta_data import FieldMetaData
from .table_field_type import TableFieldType
from .record_cell import RecordCell
from .field_param_relationship import FieldParamRelationship, FieldParamLinkedFieldInfo

# logger = logging.getLogger(__name__)

TableFieldGUID = str
TableFieldArray = List[FieldData]
class TableRecordData(BaseModel):
    GUID: str # Table GUID
    Name: str # Table Name
    RecordGUIDs: List[str]=Field(default_factory=list)
    FieldsMetaData: List[FieldMetaData]=Field(default_factory=list)
    ColumnValues: Dict[TableFieldGUID, TableFieldArray]=Field(default_factory=dict)

class TableFieldInfo(BaseModel):
    GUID: str
    Name: str
    FieldsMetaData: List[FieldMetaData]=Field(default_factory=list)
    FieldsNameIndex: Dict[str, int]  # Maps the Name to the field Index

class TableFieldRecords(BaseModel):
    Field: TableField
    Records: TableRecordData

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

    @classmethod
    def new_table(cls, table_name:str)->Table:
        if table_name is None or table_name.strip() == "":
            table_name = "Table_" + str(uuid.uuid4()).split("-")[1]

        guid = str(uuid.uuid4()).upper()
        table = Table(
            GUID=guid,
            Name=table_name,
            Fields=[],
            RecordGUIDs=[],
            FieldsNameIndex={},
            CreatedOnTimestamp=-1, # TODO: Set the date
            IsDeleted = False,
            DeletedOnTimestamp = -1
        )

        # create __ID TableField. This will be a hidden field
        table.create_table_field_by_name(TableField.REC_FIELD_NAME, TableFieldType.FieldTypeID)

        # create a default TableField
        table.create_table_field_by_name("Field A", TableFieldType.FieldTypeString)

        # add one record to the table
        table.create_table_record()

        return table

    def get_REC_ID_field(self) -> Optional[TableField]:
        index = self.FieldsNameIndex.get(TableField.REC_FIELD_NAME)
        if index is None or index < 0 or index >= len(self.Fields):
            raise ValueError(f"Table.get_REC_ID_field. \n\tField not found. \n\tGUID: {self.GUID}")

        return self.Fields[index]

    def get_table_field_info(self) -> TableFieldInfo:
        # collect the field meta data
        fields_meta_data = []
        for item in self.Fields:
            if item.MetaData == None:
                # This should never happen but just in case
                logging.warning(f"[Table.get_table_info] Field MetaData is None. \n\tTable: {self} \n\tField: {item}")
                continue

            fields_meta_data.append(item.MetaData)

        return TableFieldInfo(GUID=self.GUID,
                         Name=self.Name,
                         FieldsMetaData=fields_meta_data,
                         FieldsNameIndex=self.FieldsNameIndex)


    def _add_table_field(self, field:TableField)->TableField:
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

    def create_table_field_by_name(self, field_name:str, ftype:TableFieldType, field_params:Optional[Dict[str, str]]=None) -> TableFieldRecords:
        # TODO: Guard against users trying to add another field called TableField.ID_FIELD_NAME
        field = TableField.new_TableField(self.GUID, field_name, ftype, field_params)
        field = self._add_table_field(field)

        print(f"[Table.create_table_field_by_name]\n {field.model_dump_json(indent=2)}")

        return TableFieldRecords(Field=field, Records=self.get_records_for_field(field))

    def _create_dependent_field(self, parent_field:TableField, dependent_field_name:str):
        if parent_field.MetaData is None or parent_field.MetaData.FieldParams is None:
            raise ValueError(f"Table._create_dependent_field. \n\tMetaData or FieldParams can't be None. \n\tfield: {parent_field}")

        pass

    def get_table_field_by_guid(self, table_field_guid:str) -> Optional[TableField]:
        for i, item in enumerate(self.Fields):
            if item.MetaData is None:
                continue

            if item.MetaData.FieldGUID == table_field_guid:
                return item

        return None

    def find_table_field_by_guid(self, table_field_guid:str) -> tuple[int, Optional[TableField]]:
        for i, item in enumerate(self.Fields):
            if item.MetaData is None:
                continue

            if item.MetaData.FieldGUID == table_field_guid:
                return i, item

        return -1, None

    def find_table_field_meta_data_by_name(self, field_name:str) -> Optional[FieldMetaData]:
        table_field_info = self.get_table_field_info()
        field_gen = (f for f in table_field_info.FieldsMetaData if f.FieldName == field_name)
        return next(field_gen, None)

    def delete_table_field(self, table_field_guid:str):
        # TODO: protect against users deleting the TableField.ID_FIELD_NAME field
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

    def update_table_field_meta_data(self, table_field_guid:str, field_name:str, ftype:TableFieldType, field_options: Dict[str, Any]):
        index, field = self.find_table_field_by_guid(table_field_guid)
        if index == -1 or field is None:
            raise ValueError(f"Table.update_table_field_meta_data. \n\tField not found. \n\tGUID: {table_field_guid}")

        # print(f"[Table.update_table_field_meta_data] updating field meta data for field: {field} \n\t field_name:'{field_name}' \n\t ftype:'{ftype}' \n\t field_options:'{field_options}'")
        field.update_meta_data(field_name, ftype, field_options)

        # TODO:
        #    - Update the list of exizting value that's available in the UI
        #    - Show the Name in the dropdown even if we keeping the GUID as the Value


        return field.MetaData

    # Saves basic field data value changes. Does not handle complex field types like relationships
    def update_simple_data_value(self, table_field_guid:str, field_data:FieldData) -> Optional[FieldData]:
        index, field = self.find_table_field_by_guid(table_field_guid)
        if index == -1 or field is None:
            raise ValueError(f"Table.update_simple_data_value. \n\tField not found. \n\tGUID: {table_field_guid}")

        if field.MetaData is None:
            raise ValueError(f"Table.update_simple_data_value. \n\tMetaData can't be None. \n\tfield: {field}")

        for d in field.FieldData:
            if d.RecordGUID == field_data.RecordGUID and d.CellGUID == field_data.CellGUID:
                d.DataValue = field_data.DataValue
                return d

        return None

    def get_records(self) -> TableRecordData:
        records = TableRecordData(GUID=self.GUID, Name=self.Name, RecordGUIDs=self.RecordGUIDs)

        for item in self.Fields:
            if item.MetaData == None or item.MetaData.FieldGUID == None:
                continue

            records.FieldsMetaData.append(item.MetaData)
            records.ColumnValues[item.MetaData.FieldGUID] = item.FieldData

        return records

    def _create_new_record_GUID(self) -> str:
        self._lastRecordGUID = str(uuid.uuid4()).upper()

        return self._lastRecordGUID

    def _append_record(self) -> str:
        record_guid = self._create_new_record_GUID()

        self.RecordGUIDs.append(record_guid)

        return record_guid

    def _get_record_by_guid(self, record_guid: str) -> Optional[List[RecordCell]]:
        # logger.debug("Looking up RecordGUID: %s", record_guid)

        if record_guid not in self.RecordGUIDs:
            # logger.warning("RecordGUID not found in RecordGUIDs: %s", record_guid)
            return None

        record_cells:List[RecordCell] = []

        for i, field in enumerate(self.Fields):
            if field.MetaData is None:
                # logger.error("MetaData is None for field index: %d", i)
                raise ValueError(
                    f"Table._get_record_by_guid. MetaData can't be None. \n\tfield: {field}"
                )

            if record_guid not in field.FieldDataGUIDMap:
                # logger.error("RecordGUID %s not found in FieldDataGUIDMap for field %d", record_guid, i)
                raise ValueError(
                    f"Table._get_record_by_guid. RecordGUID {record_guid} not found in FieldDataGUIDMap."
                )

            field_data = next(
                (fd for fd in field.FieldData if fd.RecordGUID == record_guid), None
            )

            if field_data is None:
                # logger.error("No matching FieldData found for RecordGUID %s in field %d", record_guid, i)
                raise ValueError(
                    f"Table._get_record_by_guid. FieldData for RecordGUID {record_guid} not found in FieldData."
                )

            # logger.debug("Appending RecordCell for field %d", i)
            record_cells.append(RecordCell(
                MetaData=field.MetaData,
                FieldData=field_data
            ))

        # logger.info("Successfully retrieved %d RecordCells for RecordGUID %s", len(record_cells), record_guid)
        return record_cells

    def create_table_record(self) -> tuple[str, List[RecordCell]]:
        record_guid = self._append_record()

        fields = self.Fields
        for f in fields:
            f.append_value(record_guid)

        result = self._get_record_by_guid(record_guid)

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

    def get_linked_field_info_by_field_guid(self, field_guid: str) -> Optional[FieldParamLinkedFieldInfo]:
        index, field = self.find_table_field_by_guid(field_guid)
        if index == -1 or field is None:
            return None

        if field.MetaData is None:
            raise ValueError(f"Table.get_field_data_by_field_guid. \n\tMetaData can't be None. \n\tfield: {field}")

        if field.MetaData.FieldParams is None:
            raise ValueError(f"Table.get_field_data_by_field_guid. \n\tFieldParams can't be None. \n\tfield: {field}")

        if field.MetaData.FieldType != TableFieldType.FieldTypeRelationship :
            raise ValueError(f"Table.get_field_data_by_field_guid. \n\tFieldType must be Relationship. \n\tfield: {field}")

        if isinstance(field.MetaData.FieldParams, dict):
            # This is to handle the case where FieldParams is a dict (e.g., from JSON deserialization)
            field.MetaData.FieldParams = FieldParamRelationship(**field.MetaData.FieldParams)

        relationshipParam:FieldParamRelationship = cast(FieldParamRelationship, field.MetaData.FieldParams)

        return relationshipParam.ParamValues

    def get_field_data_by_field_guid(self, field_guid: str) -> Optional[List[FieldData]]:
        index, field = self.find_table_field_by_guid(field_guid)
        if index == -1 or field is None:
            return None

        if field.MetaData is None:
            raise ValueError(f"Table.get_field_data_by_field_guid. \n\tMetaData can't be None. \n\tfield: {field}")

        return field.FieldData

    def get_cell_data_by_cell_guid(self, field_guid: str, cell_guid:str) -> Optional[FieldData]:
        field_data_list = self.get_field_data_by_field_guid(field_guid)

        if field_data_list is None:
            return None

        target_field_data = None
        for data in field_data_list:
            if data.CellGUID == cell_guid:
                target_field_data = data

        return target_field_data


