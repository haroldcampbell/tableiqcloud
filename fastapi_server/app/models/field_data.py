from __future__ import annotations
from pydantic import BaseModel
from typing import Any
import uuid

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

