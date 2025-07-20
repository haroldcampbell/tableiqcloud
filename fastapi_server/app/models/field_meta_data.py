from __future__ import annotations
from pydantic import BaseModel, Field
from typing import  Optional, Any, Dict, List, ClassVar
import uuid

from .table_field_type import TableFieldType
from .field_param_option import FieldParamOption

class FieldMetaData(BaseModel):
    TableGUID: str
    FieldGUID: str
    FieldName: str
    FieldType: TableFieldType
    FieldTypeName: Optional[str] = None
    MetaAttributes: Optional[Any] = None
    FieldParams: Optional[Any] = None  # Optional field for additional options

def init_FieldMetaData(table_guid:str, field_name:str, field_type:TableFieldType,field_params:Optional[Dict[str, Any]] = None )->FieldMetaData:
    guid = str(uuid.uuid4()).upper()
    params = init_field_params(field_type, field_params)

    print("[init_FieldMetaData] params: ", params)

    return FieldMetaData(
        TableGUID=table_guid,
        FieldGUID=guid,
        FieldName=field_name,
        FieldType=field_type,
        FieldParams=params,
    )

def init_field_params(field_type:TableFieldType, field_params: Optional[Dict[str, Any]]) -> Optional[Any]:
    if field_params is None:
        return None

    if field_type == TableFieldType.FieldTypeOption:
        if FieldParamOption._Key not in field_params:
            # raise ValueError(f"Field type '{field_type.name}' requires '{FieldParamOption.ParamKey}' in field_params.")
            return FieldParamOption.nil_field_param_option()

        # Ensure the value is a list of FieldParamOptionInfo
        if not isinstance(field_params[FieldParamOption._Key], list):
            # raise ValueError(f"Field type '{field_type.name}' expects a list for '{FieldParamOption.ParamKey}'.")
            return FieldParamOption.nil_field_param_option()

        return FieldParamOption.new_field_param_option(field_params[FieldParamOption._Key])

    return None


