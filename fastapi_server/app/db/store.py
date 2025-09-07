from typing import List

import app.db.mockdb as mockdb

import app.models as models
import app.api as api

def getBases()->List[models.BaseInfo]:
    return mockdb.mock_bases

def getBaseTableInfo(base_guid:str)->models.BaseTableInfo:
    #TODO: add error check. check if base_guid is found
    info:models.BaseTableInfo = mockdb.mock_base_table_info_guid[base_guid]

    return info

def getTableByGUID(base_guid:str, table_guid:str):
    #TODO: add error check.
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

    return table


def create_table_field(req:api.RequestDataCreateField):
    try:
        ftype = models.TableFieldType.str_to_TableFieldType(req.FieldType)
    except ValueError as e:
        raise e
    #TODO: check if BaseGUID exists first

    table = getTableByGUID(req.BaseGUID, req.TableGUID)
    if table == None:
        raise ValueError(f"Unable to create table field. Table not found. \n\treq.BaseGUID: '{req.BaseGUID}'\n\treq.TableGUID: '{req.TableGUID}'")

    rec_data = table.create_table_field_by_name(req.FieldName, ftype, req.FieldOptions)

    return rec_data

def save_mock_bases():
    mockdb.save_mock_bases()
    return None