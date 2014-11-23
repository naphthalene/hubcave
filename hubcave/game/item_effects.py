"""
This is a hacky way of having items do arbitrary things
"""
from hubcave.game.models import InventoryItem

def add_to_inventory(ns, item):
    if len(InventoryItem.objects.all()) <= 9:
        new_item = InventoryItem.objects.create(inventory=ns.inventory,
                                                item=item.item)
        ns.emit('inventory_add', {
            'items' : [{'id': new_item.id,
                        'type': new_item.item.kind,
                        'texture': new_item.item.texture_location}]
        })
    else:
        raise Exception("Can't add any more")

def gold(ns, item):
    ns.profile.gold += 1
    ns.profile.save()
    ns.emit('add_gold', 1)

actions = {
    'bow' : add_to_inventory,
    'gold' : gold,
    'default' : lambda ns, item: None
}
