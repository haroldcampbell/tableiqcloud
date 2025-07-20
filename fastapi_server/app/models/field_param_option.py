from __future__ import annotations
from pydantic import BaseModel, Field, ConfigDict
from typing import  List, ClassVar, Optional, Any, Dict, Final

import uuid

class FieldParamOptionInfo(BaseModel):
    OptionId: str
    OptionIndex: int
    OptionName: str

class FieldParamOption(BaseModel):
    model_config = ConfigDict(frozen=True)
    _Key: ClassVar[str] = "option"

    ParamKey: str = _Key
    ParamValues: List[FieldParamOptionInfo] = Field(default_factory=list)

    @classmethod
    def new_field_param_option(
        cls,
        options: Optional[List[Dict[str, Any]]] = None
    ) -> FieldParamOption:
        cleaned_values = [
            FieldParamOptionInfo(
              OptionId = str(uuid.uuid4()).upper() ,
              OptionIndex = i,
              OptionName = o.get("OptionName", "").strip()
            )
            for i, o in enumerate(options or [])
        ]

        return cls(ParamKey=cls._Key, ParamValues=cleaned_values)

    @classmethod
    def nil_field_param_option(cls)-> FieldParamOption:
        return cls.new_field_param_option([])