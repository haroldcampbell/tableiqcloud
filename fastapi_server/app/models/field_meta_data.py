from __future__ import annotations
from pydantic import BaseModel
from typing import  Optional, Any
import uuid

from .table_field_type import TableFieldType

class FieldMetaData(BaseModel):
    TableGUID: str
    FieldGUID: str
    FieldName: str
    FieldType: TableFieldType
    FieldTypeName: Optional[str] = None
    MetaAttributes: Optional[Any] = None


def init_FieldMetaData(table_guid:str, field_name:str, field_type:TableFieldType)->FieldMetaData:
    guid = str(uuid.uuid4()).upper()
    return FieldMetaData(
        TableGUID=table_guid,
        FieldGUID=guid,
        FieldName=field_name,
        FieldType=field_type,
    )

