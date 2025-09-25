from __future__ import annotations
from pydantic import BaseModel, Field
from typing import  ClassVar, Optional, Any, Dict

import uuid

class FieldParamLinkedFieldInfo(BaseModel):
    InfoId: str = Field(default_factory=lambda: str(uuid.uuid4()).upper())
    ParentTableGUID: str
    LinkedChildTableGUID: str
    LinkedFieldGUID: str
    AllowMultipleValues: bool=False
    AllowDuplicates: bool=False # Duplicates are only allowed if MultipleValues is true


    def _has_validGUIDs(self, updatedInfo:FieldParamLinkedFieldInfo)->bool:
        if (self.ParentTableGUID == updatedInfo.ParentTableGUID
            and self.LinkedChildTableGUID == updatedInfo.LinkedChildTableGUID
            and self.LinkedFieldGUID == updatedInfo.LinkedFieldGUID):
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

    def update_field_type_relationship(self, new_fieldInfo:FieldParamLinkedFieldInfo):
        # if InfoId is blank or different, then generate a new FieldParamRelationship
        if not self.has_matching_InfoId(new_fieldInfo.InfoId):
            return FieldParamRelationship.init({FieldParamRelationship._Key:new_fieldInfo.model_dump()})

        self.update_field_properties(new_fieldInfo)

        return self


    @classmethod
    def _new_field_param(
        cls,
        options: Optional[Dict[str, Any]] = None
    ) -> FieldParamRelationship:

        if options is None:
            info = FieldParamLinkedFieldInfo(
                ParentTableGUID="",
                LinkedChildTableGUID="",
                LinkedFieldGUID="",
            )
        else:
            info = FieldParamLinkedFieldInfo(**options)

        # set a new InfoId
        info.InfoId = str(uuid.uuid4()).upper()

        # SECURITY-WARN: TODO: add security checks to ensure that users can only point to their own tables/fields

        return cls(ParamKey=cls._Key, ParamValues=info)


    @classmethod
    def init(cls, field_params: dict[str, Any]):
        if FieldParamRelationship._Key not in field_params:
            return FieldParamRelationship._new_field_param()

        return FieldParamRelationship._new_field_param(field_params[FieldParamRelationship._Key])
