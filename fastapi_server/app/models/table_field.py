from __future__ import annotations
from pydantic import BaseModel
from typing import List, Dict, Optional, Any

import time

from .field_meta_data import FieldMetaData, init_FieldMetaData
from .field_data import FieldData, FieldDataGUIDInfo
from .table_field_type import TableFieldType

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

    def append_value(self, recordGUID: str, newValue: Any=None) -> FieldData:
        if self.MetaData == None or self.MetaData.FieldGUID == None:
            raise ValueError("TableField.append_value. \n\tMetaData or FieldGUID can't be None.")

        field_data = FieldData.new_field_data(recordGUID, newValue)
        self.FieldData.append(field_data)
        self.FieldDataGUIDMap[recordGUID] = field_data.to_field_data_GUID_info()

        return field_data

    def delete_record_by_record_guid(self, recordGUID: str) -> bool:
        if self.MetaData == None or self.MetaData.FieldGUID == None:
            return False

        if recordGUID not in self.FieldDataGUIDMap:
            return False

        # Remove the field data for the record GUID
        del self.FieldDataGUIDMap[recordGUID]

        # Filter out the field data that matches the record GUID
        self.FieldData = [fd for fd in self.FieldData if fd.RecordGUID != recordGUID]

        return True

    def update_meta_data(self, field_name:str, ftype:TableFieldType, field_options:Dict[str, Any]):
        if self.MetaData is None:
            raise ValueError(f"TableField.update_table_field_meta_data. \n\tMetaData can't be None. \n\tfield: {self}")

        self.MetaData.update_meta_data(field_name, ftype, field_options)

        if ftype == TableFieldType.FieldTypeOption:
            deleted_ids = self.MetaData.update_meta_data_field_params(ftype, field_options)
            for data in self.FieldData:
                if data.DataValue in deleted_ids:
                    data.DataValue = ""


        return

def new_TableField(table_guid:str, field_name:str, field_type:TableFieldType, field_params:Optional[Dict[str, Any]] = None )->TableField:
    meta_data = init_FieldMetaData(table_guid, field_name=field_name, field_type=field_type, field_params=field_params)

    return TableField(
        MetaData=meta_data,
        FieldData=[],
        FieldDataGUIDMap={},
        IsDeleted=False,
        CreatedOnTimestamp= int(time.time()), #time.Now().Unix(),
        DeletedOnTimestamp=0
    )