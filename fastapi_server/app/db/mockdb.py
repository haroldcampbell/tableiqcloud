import json
from pathlib import Path
from typing import Dict

import app.models as models

def json_load_data(filename:str):
    file_path = Path(__file__).parent / filename
    with open(file_path, "r") as f:
        return json.load(f)
    return None

def save_json_data(filename:str, data):
    file_path = Path(__file__).parent / filename
    with open(file_path, "w") as f:
        json.dump(data, f, indent=4)
    return None

def save_mock_bases():
    data = [item.model_dump() for item in mock_bases]
    save_json_data("mock_bases.json", data)

    data = [item.model_dump() for item in mock_table]
    save_json_data("mock_table.json", data)

    data = [item.model_dump() for item in mock_base_table_info_list]
    save_json_data("mock_base_table_info_list.json", data)


# load mock bases
bases_data = json_load_data("mock_bases.json")
mock_bases = [models.BaseInfo(**item) for item in bases_data]

# load mock tables
table_data = json_load_data("mock_table.json")
mock_table = [models.Table(**item) for item in table_data]

# generate table_info list
mock_table_info = [
    models.TableInfo(GUID=item.GUID, Name=item.Name) for item in mock_table
]

# list of BaseTableInfo
data = json_load_data("mock_base_table_info_list.json")
mock_base_table_info_list = [models.BaseTableInfo(**item) for item in data]

# dictionary baseGUID: list of BaseTableInfo
mock_base_table_info_guid: Dict[str, models.BaseTableInfo] = {
    item.BaseInfo.GUID: item for item in mock_base_table_info_list
}
