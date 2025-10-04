from __future__ import annotations
from pydantic import BaseModel
from typing import Any
import uuid

import app.models as models

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

    def update_linked_data_value(self, linked_field_data:FieldData, allow_multiple_values:bool) -> FieldData:
        self.DataValue = self.DataValue if isinstance(self.DataValue, list) else [] # Ensure DataValue is a list

        print(f"[FieldData.update_linked_data_value] attempting to update value: \n\t allow_multiple_values:{allow_multiple_values}")
        if allow_multiple_values:
            self.DataValue.append(linked_field_data)
        else:
            self.DataValue = [linked_field_data]

        return self

