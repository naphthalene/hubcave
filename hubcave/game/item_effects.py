"""
This is a hacky way of having items do arbitrary things
"""
from hubcave.game.models import InventoryItem, StackableInventoryItem

def add_to_inventory(ns, item):
    def check_size():
        if len(InventoryItem.objects.filter(inventory=ns.inventory)) > 9:
            raise Exception("Can't add any more")


    if not item.item.stackable:
        check_size()
        new_item = InventoryItem.objects.create(inventory=ns.inventory,
                                                item=item.item)
    else:
        try:
            new_item = StackableInventoryItem.objects.get(
                inventory=ns.inventory,
                item=item.item)
            new_item.count += 1
            new_item.save()
        except StackableInventoryItem.DoesNotExist:
            if len(InventoryItem.objects.filter(inventory=ns.inventory)) + 1 > 9:
                check_size()
                new_item = StackableInventoryItem.objects.create(
                    inventory=ns.inventory,
                    item=item.item,
                    count=1)
    print "Emitting inventory_add"
    ns.emit('inventory_add', {
        'items' : [{
            'id': new_item.id,
            'type': new_item.item.kind,
            'texture': new_item.item.texture_location,
            'stackable': new_item.item.stackable,
            'count': 1
        }]
    })


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
