from __future__ import annotations
from pydantic import BaseModel, Field
from typing import  ClassVar, Optional, Any, Dict

import uuid

# PullOperation where we read data from
class PullOperation(BaseModel):
    DataFromTableGUID: str = "" # Which table are we getting the data
    DataFromFieldGUID: str = "" # Which field in the ChildTable are we going to pull data

    DataToTableGUID: str = ""
    DataToFieldGUID: str = "" # Which field in the parent table are we going to put the linked child data

    SyncToTableGUID: str = ""
    SyncToFieldGUID: str = ""
    SyncFromTableGUID: str = ""
    SyncFromFieldGUID: str = ""

# PushOperation how we make the linked data
class PushOperation(BaseModel):
    DataFromTableGUID: str = ""
    DataFromFieldGUID: str = ""
    DataFromRecordGUID: str = ""
    # DataFromCellGUID: str = ""
    # DataFromRecID: str = "" # From which Record did we get the data

    DataToTableGUID: str = ""
    DataToFieldGUID: str = ""
    # DataToRecordGUID: str = ""
    # DataToCellGUID: str = ""

# LinkedFieldInfo is the parent object that contains the relationship information
class FieldParamLinkedFieldInfo(BaseModel):
    InfoId: str = Field(default_factory=lambda: str(uuid.uuid4()).upper())
    AllowMultipleValues: bool=False
    AllowDuplicates: bool=False # Duplicates are only allowed if MultipleValues is true

    HasPairedDependentField: bool=True # Indicates if a dependent linked field has been created for this relationship
    SyncFieldGUID: Optional[str]=None # When HasPairedDependentField is true, this is the FieldGUID that connects the two tables

    PullOperation: PullOperation
    PushOperation: PushOperation

    def _has_validGUIDs(self, updatedInfo:FieldParamLinkedFieldInfo)->bool:
        if (self.PullOperation.DataToTableGUID == updatedInfo.PullOperation.DataToTableGUID
            and self.PullOperation.DataFromTableGUID == updatedInfo.PullOperation.DataFromTableGUID
            and self.PullOperation.DataFromFieldGUID == updatedInfo.PullOperation.DataFromFieldGUID):
            return True
        return False

    def update_field_properties(self, updatedInfo:FieldParamLinkedFieldInfo)->bool:
        if not self._has_validGUIDs(updatedInfo):
            raise ValueError(f"[FieldParamLinkedFieldInfo.update_field_properties] Can't update properties. Guids don't match. \n\tself:'{self}'\n\tupdatedInfo:'{updatedInfo}'")

        # TODO: update future fields that aren't GUID related
        self.AllowMultipleValues = updatedInfo.AllowMultipleValues

        # Duplicates are only allowed if MultipleValues is true
        if not self.AllowMultipleValues:
            self.AllowDuplicates = False
        else:
            self.AllowDuplicates = updatedInfo.AllowDuplicates

        # print(f"[FieldParamLinkedFieldInfo.update_field_properties] updated to: \n\t AllowMultipleValues:'{self.AllowMultipleValues}'\n\t AllowDuplicates:'{self.AllowDuplicates}' \n\t updatedInfo:'{updatedInfo}'")
        return True

    def to_dicto_id(self, info_id:str|None=None, pull_operation:PullOperation|None=None, push_operation:PushOperation|None=None):
        return {
            "InfoId": self.InfoId if info_id is None else info_id,
            "AllowMultipleValues": self.AllowMultipleValues,
            "AllowDuplicates": self.AllowDuplicates,
            "HasPairedDependentField": self.HasPairedDependentField,
            "SyncFieldGUID": self.SyncFieldGUID,
            "PullOperation": self.PullOperation.model_dump() if pull_operation is None else pull_operation.model_dump(),
            "PushOperation": self.PushOperation.model_dump() if push_operation is None else push_operation.model_dump(),
        }

    @classmethod
    def to_empty_dict(cls) -> Dict[str, Any]:
        return FieldParamLinkedFieldInfo(
            InfoId = "",
            PullOperation= PullOperation(),
            PushOperation= PushOperation(),
        ).model_dump()

    @classmethod
    def init(cls, field_guid:str, options: Optional[Dict[str, Any]]) -> FieldParamLinkedFieldInfo:
        info_id = str(uuid.uuid4()).upper()

        if options is None:
            return cls(
                InfoId = info_id,
                PushOperation= PushOperation(),
                PullOperation= PullOperation(),
            )

        param_values = cls(**options)
        param_values.InfoId = info_id # set a new InfoId
        param_values.PullOperation.DataToFieldGUID = field_guid

        return param_values


class FieldParamRelationship(BaseModel):
    _Key: ClassVar[str] = "relationship"

    ParamKey: str = _Key
    ParamValues: Optional[FieldParamLinkedFieldInfo] = None

    def update_field_properties(self, updatedInfo:FieldParamLinkedFieldInfo)->bool:
        if self.ParamValues == None:
            raise ValueError(f"[FieldParamRelationship.update_field_properties] ParamValues shouldn't be Non. \n\tParamValues:'{self.ParamValues}'\n\tupdatedInfoo:'{updatedInfo}'")

        return self.ParamValues.update_field_properties(updatedInfo)

    def has_matching_InfoId(self, new_field_Info_ID):
        return (new_field_Info_ID != ""
                and self.ParamValues != None
                and self.ParamValues.InfoId == new_field_Info_ID)

    def update_field_type_relationship(self, field_guid:str, new_fieldInfo:FieldParamLinkedFieldInfo):
        # if InfoId is blank or different, then generate a new FieldParamRelationship
        if not self.has_matching_InfoId(new_fieldInfo.InfoId):
            return FieldParamRelationship.init(field_guid, {FieldParamRelationship._Key:new_fieldInfo.model_dump()})

        self.update_field_properties(new_fieldInfo)

        return self

    def to_dict(self):
        params = self.ParamValues.model_dump() if self.ParamValues else None

        return { self._Key: params }

    @classmethod
    def to_empty_dict(cls) -> Dict[str, Any]:
        return { cls._Key: FieldParamLinkedFieldInfo.to_empty_dict() }

    # SECURITY-WARN: TODO: add security checks to ensure that users can only point to their own tables/fields
    @classmethod
    def init(cls, field_guid:str, field_params: dict[str, Any]):
        options = field_params.get(FieldParamRelationship._Key)
        param_values = FieldParamLinkedFieldInfo.init(field_guid, options)

        return cls(ParamKey=cls._Key, ParamValues=param_values)

