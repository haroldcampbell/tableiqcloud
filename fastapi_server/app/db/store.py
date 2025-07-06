import app.models.base as base
import app.db.mockdb as mockdb
from typing import List, Dict

def getBases()->List[base.BaseInfo]:
    return mockdb.mock_bases

def getBaseTableInfo(base_guid:str)->base.BaseTableInfo:
    info:base.BaseTableInfo = mockdb.mock_base_table_info_guid[base_guid]
    return info

def getTableByGUID(base_guid:str, table_guid:str):
    base_table_info = mockdb.mock_base_table_info_guid[base_guid]
    guids = [item.GUID for item in base_table_info.TableInfoArray]

    if table_guid not in guids:
        print(f"[getTableByGUID] table_guid not found: {table_guid}")
        return None # the base doesn't contain the table guid so return

    result = list(filter((lambda item: item.GUID == table_guid), mockdb.mock_table))
    if len(result) == 0:
        print(f"[getTableByGUID] table_guid not found in mockdb.mock_table: {table_guid}")
        return None

    table = result[0]

    records = table.GetRecords()

    return records
