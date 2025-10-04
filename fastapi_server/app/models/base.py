from __future__ import annotations
from pydantic import BaseModel
from typing import List

class BaseInfo(BaseModel):
    GUID: str
    Name: str


class TableInfo(BaseModel):
    GUID: str
    Name: str

class BaseTableInfo(BaseModel):
	BaseInfo: BaseInfo
	TableInfoArray: List[TableInfo]

