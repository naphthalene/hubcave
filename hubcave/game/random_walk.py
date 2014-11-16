from random import random
from math import floor

MAP_SIZE = 30
FLOOR_COVERAGE = 35.0 # %
INITIAL_BUFFER = 5.0 # % border

# 0 -> wall
# 1 -> floor

def random_walk(map_size=MAP_SIZE, floor_coverage=FLOOR_COVERAGE, init_buffer=INITIAL_BUFFER):
    initial_map = [[0 for j in range(map_size)] for i in range(map_size)]

    # Generate initial pos
    offset = int(map_size * (init_buffer / 100.0))
    current_position = (offset + int(floor(random() * (map_size - 2 * offset))),
                        offset + int(floor(random() * (map_size - 2 * offset))))
    original_position = current_position
    # Fill in first floor tile
    floor_tile_count = 1
    initial_map[current_position[0]][current_position[1]] = 1
    while (floor_tile_count < floor((floor_coverage / 100.0) *
                                    (map_size ** 2))):
        positions = {
            0: (current_position[0],
                current_position[1] - 1), # up
            1: (current_position[0] + 1,
                current_position[1]),     # right
            2: (current_position[0],
                current_position[1] + 1), # down,
            3: (current_position[0] - 1,
                current_position[1]),     # left
        }
        new_position = None
        while new_position is None:
            new_position = positions[floor(random() * 4)]
            if (new_position[0] <= offset or
                new_position[1] <= offset or
                new_position[0] >= map_size - offset or
                new_position[1] >= map_size - offset):
                new_position = None
        current_position = new_position
        if initial_map[current_position[0]][current_position[1]] == 0:
            initial_map[current_position[0]][current_position[1]] = 1
            floor_tile_count += 1

    return (original_position, initial_map)

def show(m):
    for i in m:
        for j in i:
            print "{}".format('#' if j == 0 else '_'),
        print ''
