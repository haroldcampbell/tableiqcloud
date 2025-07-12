from __future__ import annotations
from pydantic import BaseModel
from typing import List, Dict, Optional
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