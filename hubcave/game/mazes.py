# Copyright (c) 2011 Brian Gordon
#
# Permission is hereby granted, free of charge, to any person obtaining a copy
# of this software and associated documentation files (the "Software"), to deal
# in the Software without restriction, including without limitation the rights
# to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
# copies of the Software, and to permit persons to whom the Software is
# furnished to do so, subject to the following conditions:
#
# The above copyright notice and this permission notice shall be included in
# all copies or substantial portions of the Software.
#
# THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
# IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
# FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
# AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
# LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
# OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
# THE SOFTWARE.

import random, heapq

class undirected_graph(dict):
    """A dictionary of unordered pairs."""
    def __setitem__(self, key, value):
        super(undirected_graph, self).__setitem__(tuple(sorted(key)), value)

    def __getitem__(self, key):
        return super(undirected_graph, self).__getitem__(tuple(sorted(key)))

    def __has_key__(self, key):
        return super(undirected_graph, self).__has_key__(tuple(sorted(key)))

def min_cost_spanning_tree(height, width):
    def grid_adjacent(vertex):
        """
        Return all grid vertices adjacent to the given point.
        """
        x, y = vertex
        adj = []

        if x > 0:
            adj.append((x-1, y))
        if x < width - 1:
            adj.append((x+1, y))
        if y > 0:
            adj.append((x, y-1))
        if y < height - 1:
            adj.append((x, y+1))

        return adj

    def make_grid():
        """
        Makes a grid of random weights
        """
        weights = undirected_graph()
        for x in xrange(width):
            for y in xrange(height):
                vertex = (x,y)
                for neighbor in grid_adjacent(vertex):
                    weights[(vertex,neighbor)] = random.random()

        return weights

    spanning = undirected_graph()
    weights = make_grid()

    closed = set([(0,0)])
    heap = []
    for neighbor in grid_adjacent((0,0)):
        cost = weights[(0,0),neighbor]
        heapq.heappush(heap, (cost, (0,0), neighbor))

    while heap:
        cost, v1, v2 = heapq.heappop(heap)

        # v1 is the vertex already in the spanning tree
        # it's possible that we've already added v2 to the spanning tree
        if v2 in closed:
            continue

        # add v2 to the closed set
        closed.add(v2)

        # add v2's neighbors to the heap
        for neighbor in grid_adjacent(v2):
            if neighbor not in closed:
                cost = weights[v2, neighbor]
                heapq.heappush(heap, (cost, v2, neighbor))

        # update the spanning tree
        spanning[(v1,v2)] = True
    return draw_tree(spanning, height, width)

def draw_tree(spanning, height, width):
    # Create a big array of 0s and 1s for pypng

    pixels = []

    # Add a row of off pixels for the top
    pixels.append([0] + [1] + ([0] * (img_width-2)))

    for y in xrange(height):
        # Row containing nodes
        row = [0] # First column is off
        for x in xrange(width):
            row.append(1)
            if x < width-1:
                row.append( int(((x,y),(x+1,y)) in spanning) )
        row.append(0) # Last column is off
        pixels.append(row)

        if y < height-1:
            # Row containing vertical connections between nodes
            row = [0] # First column is off
            for x in xrange(width):
                row.append( int(((x,y),(x,y+1)) in spanning) )
                row.append(0)
            row.append(0) # Last column is off
            pixels.append(row)

    # Add a row of off pixels for the bottom
    pixels.append(([0] * (img_width-2)) + [1] + [0])

    return pixels
