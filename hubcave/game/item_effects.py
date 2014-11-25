"""
This is a hacky way of having items do arbitrary things
"""
from hubcave.game.models import InventoryItem, StackableInventoryItem

def add_to_inventory(ns, item):
    if len(InventoryItem.objects.all()) <= 9:
        if not item.item.stackable:
            new_item = InventoryItem.objects.create(inventory=ns.inventory,
                                                    item=item.item)
        else:
            new_item, created = StackableInventoryItem.objects.get_or_create(
                inventory=ns.inventory,
                item=item.item,
                defaults={'count' : 1})
            if not created:
                new_item.count += 1
                new_item.save()
        ns.emit('inventory_add', {
            'items' : [{'id': new_item.id,
                        'type': new_item.item.kind,
                        'texture': new_item.item.texture_location,
                        'stackable': new_item.item.stackable}]
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
    'blue_pot' : add_to_inventory,
    'default' : lambda ns, item: None
}
