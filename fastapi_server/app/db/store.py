from typing import cast, List

import app.db.mockdb as mockdb

import app.models as models
import app.api as api

def getBases()->List[models.BaseInfo]:
    return mockdb.mock_bases

def getBaseTableInfo(base_guid:str)->models.BaseTableInfo:
    #TODO: add error check. check if base_guid is found
    info:models.BaseTableInfo = mockdb.mock_base_table_info_guid[base_guid]

    return info

def get_table_field_info_by_guid(base_guid:str, table_guid:str) -> models.table.TableFieldInfo | None:
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

    return table.get_table_field_info()

def getTableByGUID(base_guid:str, table_guid:str) -> models.Table | None:
    #TODO: add error check.
    base_table_info = mockdb.mock_base_table_info_guid[base_guid]
    guids = [item.GUID for item in base_table_info.TableInfoArray]

    if table_guid not in guids:
        print(f"[getTableByGUID] table_guid not found: `{table_guid}`")
        return None # the base doesn't contain the table guid so return

    result = list(filter((lambda item: item.GUID == table_guid), mockdb.mock_table))
    if len(result) == 0:
        print(f"[getTableByGUID] table_guid not found in mockdb.mock_table: {table_guid}")
        return None

    table = result[0]

    return table

def get_table_field_by_guid(base_guid:str, table_guid:str, table_field_guid:str) -> models.TableField | None:
    table = getTableByGUID(base_guid, table_guid)
    if table is None:
        return None

    return table.get_table_field_by_guid(table_field_guid)

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

def update_table_field_value(
        table: models.Table,
        table_field_guid:str,
        cellGUID:str,
        linked_table: models.Table,
        linked_field_info: models.FieldParamLinkedFieldInfo,
        linked_fiel_data:models.FieldData) -> models.FieldData:

    target_field_data = table.get_cell_data_by_cell_guid(table_field_guid, cellGUID)

    if target_field_data is None:
        raise ValueError(f"Store.update_table_field_value. \n\tFieldData not found. \n\tcellGUID: {cellGUID}")

    # Get the cell data from the linked child table
    linked_field_data = linked_table.get_cell_data_by_cell_guid(linked_field_info.LinkedFieldGUID, linked_fiel_data.CellGUID)
    if linked_field_data is None:
        raise ValueError(f"Store.update_table_field_value. \n\tFieldData not found. \n\tLinkedFieldGUID: {linked_field_info.LinkedFieldGUID}\n\tlinked_fiel_data.cellGUID: {linked_fiel_data.CellGUID}")

    if target_field_data.DataValue is None:
        target_field_data.DataValue = []

    print(f"[update_table_field_value] attempting to update value: \n\t linked_field_info.AllowMultipleValues:{linked_field_info.AllowMultipleValues}")
    if linked_field_info.AllowMultipleValues:
        target_field_data.DataValue.append(linked_field_data)
    else:
        target_field_data.DataValue = [linked_field_data]

    print(f"[update_table_field_value] \n\t target_field_data.DataValue:{target_field_data.DataValue}");
    return target_field_data


def remove_linked_table_field_value(
        table: models.Table,
        table_field_guid:str,
        cellGUID:str,
        linked_table: models.Table,
        linked_field_GUID: str,
        linked_table_cell_GUID: str) -> models.FieldData:

    target_field_data = table.get_cell_data_by_cell_guid(table_field_guid, cellGUID)

    if target_field_data is None:
        raise ValueError(f"Store.update_table_field_value. \n\tFieldData not found. \n\tcellGUID: {cellGUID}")

    # Get the cell data from the linked child table
    linked_field_data = linked_table.get_cell_data_by_cell_guid(linked_field_GUID, linked_table_cell_GUID)
    if linked_field_data is None:
        raise ValueError(f"Store.update_table_field_value. \n\tFieldData not found. \n\tlinked_field_GUID: {linked_field_GUID}\n\tlinked_table_cell_GUID: {linked_table_cell_GUID}")

    # This should never happen but just in case
    if target_field_data.DataValue is None:
        target_field_data.DataValue = []

    linked_data_values: List[models.FieldData] = [
        item if isinstance(item, models.FieldData) else models.FieldData(**item) for item in target_field_data.DataValue
    ]

    # Remove at most one linked field data from the target field data
    for d in linked_data_values:
        if not isinstance(d, models.FieldData):
            d = models.FieldData(**d)

        if d.CellGUID == linked_table_cell_GUID:
            linked_data_values.remove(d)
            break

    target_field_data.DataValue = linked_data_values

    return target_field_data


def save_mock_bases():
    mockdb.save_mock_bases()
    return None