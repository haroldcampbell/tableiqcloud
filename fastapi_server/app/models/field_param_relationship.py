from __future__ import annotations
from pydantic import BaseModel, Field
from typing import  ClassVar, Optional, Any, Dict

import uuid

class FieldParamLinkedFieldInfo(BaseModel):
    InfoId: str = Field(default_factory=lambda: str(uuid.uuid4()).upper())
    ParentTableGUID: str
    LinkedChildTableGUID: str
    LinkedFieldGUID: str

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

        return True

class FieldParamRelationship(BaseModel):
    _Key: ClassVar[str] = "relationship"

    ParamKey: str = _Key
    ParamValues: FieldParamLinkedFieldInfo | None = None

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

        # if not
        self.update_field_properties(new_fieldInfo)
            # raise ValueError(f"[FieldParamRelationship.update_field_type_relationship] Unable to update LinkedRelationship prperties. \n\texisting_field_params:'{self.ParamValues}'\n\tnew_fieldInfo:'{new_fieldInfo}'")

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
                LinkedFieldGUID=""
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
