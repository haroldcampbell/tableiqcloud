package datastore

import "errors"

type Datastore struct {
	BaseGUIDList []string
	BaseGUIDMap  map[string]Base
	// TableGUIDMap map[string]string // Maps TableGUID to BaseGUID
}

func NewDatastore() *Datastore {
	return &Datastore{
		BaseGUIDList: make([]string, 0),
		BaseGUIDMap:  map[string]Base{},
		// TableGUIDMap: map[string]string{},
	}
}

func (d *Datastore) GetBases() []BaseInfo {
	list := []BaseInfo{}

	for _, GUID := range d.BaseGUIDList {
		info := BaseInfo{
			GUID: GUID,
			Name: d.BaseGUIDMap[GUID].Name,
		}
		list = append(list, info)
	}

	return list
}

func (d *Datastore) GetBaseByGUID(GUID string) (Base, error) {
	base, ok := d.BaseGUIDMap[GUID]

	if !ok {
		return Base{}, errors.New("guid not found for base")
	}

	return base, nil
}

func (d *Datastore) RegisterBase(b *Base) {
	d.BaseGUIDMap[b.GUID] = *b
	d.BaseGUIDList = append(d.BaseGUIDList, b.GUID)
}
