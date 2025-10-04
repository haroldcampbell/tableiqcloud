from __future__ import annotations
from pydantic import BaseModel
from typing import ClassVar, List, Dict, Optional, Any

from collections.abc import Iterable

import time

from .field_meta_data import FieldMetaData
from .field_data import FieldData, FieldDataGUIDInfo
from .table_field_type import TableFieldType
from .field_param_relationship import FieldParamRelationship, FieldParamLinkedFieldInfo


class TableField(BaseModel):
    MetaData: Optional[FieldMetaData]
    FieldData: List[FieldData]  # Each item represents a row of data
    FieldDataGUIDMap: Dict[str, FieldDataGUIDInfo]  # RecordGUID to FieldDataGUIDInfo
    IsDeleted: bool
    CreatedOnTimestamp: int
    DeletedOnTimestamp: int

    REC_FIELD_NAME: ClassVar["str"] = "__REC"

    def init_field_with_record_GUIDs(self, RecordGUIDs: List[str]):
        # Initializes the field data
        self.FieldData = []
        self.FieldDataGUIDMap = {}


        # Create n cells and set the record guid for the cells
        for recordGUID in RecordGUIDs:
            data = FieldData.new_field_data(recordGUID, None)
            self.FieldData.append(data)
            self.FieldDataGUIDMap[recordGUID] = data.to_field_data_GUID_info()

    def get_cell_guid_info_by_record_guid(self, recordGUID: str) -> Optional[FieldDataGUIDInfo]:
        if recordGUID in self.FieldDataGUIDMap:
            return self.FieldDataGUIDMap[recordGUID]
        return None

    def get_field_data_by_record_guid(self, record_guid:str) -> Optional[FieldData]:
        for f in self.FieldData:
            if record_guid == f.RecordGUID:
                return f

        return None

    def append_value(self, recordGUID: str, newValue: Any=None) -> FieldData:
        if self.MetaData == None or self.MetaData.FieldGUID == None:
            raise ValueError("TableField.append_value. \n\tMetaData or FieldGUID can't be None.")

        if self.MetaData.FieldName == TableField.REC_FIELD_NAME:
            field_data = FieldData.new_field_data(recordGUID, recordGUID)
        else:
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

    def _enforce_field_data_contraints(self, ftype:TableFieldType):
        # match ftype:
        #     case TableFieldType.FieldTypeOption:
        #     case TableFieldType.FieldTypeRelationship:
        if ftype == TableFieldType.FieldTypeRelationship:
            if self.MetaData is None or self.MetaData.FieldParams is None or not isinstance(self.MetaData.FieldParams, FieldParamRelationship) or self.MetaData.FieldParams.ParamValues is None:
                raise ValueError(f"TableField._enforce_field_data_contraints. \n\tMetaData or FieldParams can't be None. \n\tfield: {self}")

            # FieldParamRelationship, FieldParamLinkedFieldInfo
            relationship_info:FieldParamLinkedFieldInfo = self.MetaData.FieldParams.ParamValues
            # Helper function to get the GUID from FieldData or dict
            def guid(it) -> str | None:
                return it.CellGUID if isinstance(it, FieldData) else it.get("CellGUID")

            for data in self.FieldData:
                if data.DataValue is None:
                    data.DataValue = []
                    continue

                # Ensure DataValue is a list
                if not isinstance(data.DataValue, list):
                    data.DataValue = [data.DataValue]

                # Enforce single value if AllowMultipleValues is false
                if not relationship_info.AllowMultipleValues and len(data.DataValue) > 1:
                    data.DataValue = [data.DataValue[0]]

                # Remove duplicates if not allowed
                if not relationship_info.AllowDuplicates:
                    # Build a mapping of CellGUID → item; keeps the *first* occurrence
                    unique_by_guid = {}
                    for item in data.DataValue:
                        g = guid(item)
                        if g and g not in unique_by_guid:
                            unique_by_guid[g] = item

                    data.DataValue = list(unique_by_guid.values())


        return

    def update_meta_data(self, field_name:str, ftype:TableFieldType, field_options:Dict[str, Any]):
        if self.MetaData is None:
            raise ValueError(f"TableField.update_table_field_meta_data. \n\tMetaData can't be None. \n\tfield: {self}")

        self.MetaData.update_meta_data(field_name, ftype, field_options)

        match ftype:
            case TableFieldType.FieldTypeOption:
                deleted_ids = self.MetaData.update_meta_data_field_params(ftype, field_options)
                for data in self.FieldData:
                    if data.DataValue in deleted_ids:
                        data.DataValue = ""

            case TableFieldType.FieldTypeRelationship:
                info_id_result = self.MetaData.update_meta_data_field_params(ftype, field_options)
                # print("[info_id_result] info_id_result:", info_id_result)

                if info_id_result["old_info_id"] != info_id_result["new_info_id"]:
                    for d in self.FieldData:
                        d.DataValue = []
                    # TODO: remove old relationships and clean up old linked data
                else:
                    self._enforce_field_data_contraints(ftype)
                    print("[update_meta_data] ensure data values")


        return

    @classmethod
    def new_TableField(cls, table_guid:str, field_name:str, field_type:TableFieldType, field_params:Optional[Dict[str, Any]] = None )->TableField:
        meta_data = FieldMetaData.init_FieldMetaData(table_guid, field_name=field_name, field_type=field_type, field_params=field_params)

        return TableField(
            MetaData=meta_data,
            FieldData=[],
            FieldDataGUIDMap={},
            IsDeleted=False,
            CreatedOnTimestamp= int(time.time()), #time.Now().Unix(),
            DeletedOnTimestamp=0
        )