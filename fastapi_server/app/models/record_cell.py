from __future__ import annotations
from pydantic import BaseModel

from .field_meta_data import FieldMetaData
from .field_data import FieldData

class RecordCell (BaseModel):
	MetaData:  FieldMetaData
	FieldData: FieldData