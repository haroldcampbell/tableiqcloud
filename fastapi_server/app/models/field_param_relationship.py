from __future__ import annotations
from pydantic import BaseModel, Field
from typing import  ClassVar, Optional, Any, Dict

import uuid

class FieldParamLinkedFieldInfo(BaseModel):
    InfoId: str = Field(default_factory=lambda: str(uuid.uuid4()).upper())
    ParentTableGUID: str
    LinkedChildTableGUID: str
    LinkedFieldGUID: str


class FieldParamRelationship(BaseModel):
    _Key: ClassVar[str] = "relationship"

    ParamKey: str = _Key
    ParamValues: FieldParamLinkedFieldInfo | None = None

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
