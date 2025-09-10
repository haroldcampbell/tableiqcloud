from __future__ import annotations
from pydantic import BaseModel, Field, ConfigDict
from typing import  List, ClassVar, Optional, Any, Dict, Final

import uuid

class FieldParamOptionInfo(BaseModel):
    OptionId: str
    OptionIndex: int
    OptionName: str
    OptionMetaData: Any #Additional meta data

class FieldParamOption(BaseModel):
    model_config = ConfigDict(frozen=True)
    _Key: ClassVar[str] = "option"

    ParamKey: str = _Key
    ParamValues: List[FieldParamOptionInfo] = Field(default_factory=list)

    @classmethod
    def _new_field_param(
        cls,
        options: Optional[List[Dict[str, Any]]] = None
    ) -> FieldParamOption:
        cleaned_values = [
            FieldParamOptionInfo(
              OptionId = str(uuid.uuid4()).upper() ,
              OptionIndex = i,
              OptionName = o.get("OptionName", "").strip(),
              OptionMetaData = {}
            )
            for i, o in enumerate(options or [])
        ]

        return cls(ParamKey=cls._Key, ParamValues=cleaned_values)


    @classmethod
    def init(cls, field_params: Dict[str, Any]):
        if FieldParamOption._Key not in field_params:
            return FieldParamOption._new_field_param([])

        # Ensure the value is a list of FieldParamOptionInfo
        if not isinstance(field_params[FieldParamOption._Key], list):
            return FieldParamOption._new_field_param([])

        return FieldParamOption._new_field_param(field_params[FieldParamOption._Key])
