from random import random
from math import floor

MAP_SIZE = 30
FLOOR_COVERAGE = 40.0 # %
INITIAL_BUFFER = 30.0 # % border

# 0 -> wall
# 1 -> floor

def main():
    initial_map = [[0 for j in range(MAP_SIZE)] for i in range(MAP_SIZE)]

    # Generate initial pos
    offset = int(MAP_SIZE * (INITIAL_BUFFER / 100.0))
    current_position = (offset + int(floor(random() * (MAP_SIZE - 2 * offset))),
                        offset + int(floor(random() * (MAP_SIZE - 2 * offset))))
    print current_position
    # Fill in first floor tile
    floor_tile_count = 1
    initial_map[current_position[0]][current_position[1]] = 1
    while (floor_tile_count < floor((FLOOR_COVERAGE / 100.0) *
                                    (MAP_SIZE ** 2))):
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
            if (new_position[0] < 0 or
                new_position[1] < 0 or
                new_position[0] >= MAP_SIZE or
                new_position[1] >= MAP_SIZE):
                new_position = None
        current_position = new_position
        if initial_map[current_position[0]][current_position[1]] == 0:
            initial_map[current_position[0]][current_position[1]] = 1
            floor_tile_count += 1

    show(initial_map)

def show(m):
    for i in m:
        for j in i:
            print "{}".format('#' if j == 0 else '_'),
        print ''


if __name__ == "__main__":
    main()
