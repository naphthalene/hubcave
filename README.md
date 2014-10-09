hubcave
=======

# Flow #

User logs in via GitHub OAuth, gets shown a dashboard with any news,
achievements from friends, and servers to connect to (including local if
its started). Clicking on a server opens a page with the pixi.js game
along with info about the user, an auth token for API access (if you
want to get updates about repos).

The app is downloaded from the central server. That way the client is
always up to date. Should have a selector to open up a certain version
to match the server (or it will be automatically selected based on
compatible game server versions). There will be controls on the page to
open up web IRC, switch worlds and get news updates, with the same
dashboard widgets as the home page. In addition controls for uploading
save files to the world. This can only be done once, as once you upload
your world it will mutate based on the repository information by making
additions only.

A server hosts a world state. The world state changes as you play the
game. The game itself will query the central server via JS with
information about what kind of artifacts to seed the new map parts with,
but can fallback to generating non-display artifacts (maybe just call
them items) like health, potions, weapons. Display artifacts are only
seeded into games when a connection to the central server exists. This
allows us to control new artifact releases and 'rare' items (keep rare
item chances in line with the entire universe of hubcave).

The game will download world info from the server along with other
players information (identity, location), as well as central server info
directly via JSON in the HTML5 app.

# Server #

## Central server ##

Manages:

   - User's friends
   - User's servers
   - User's item collection

## Game server ##

Individuals can host a game server (like minecraft). Any user can upload
a saved world of theirs to a game server permitted the server allows for
it. The cities are merged, either via portals present in every city or
by roads.

### API ###

   - Player state
   - Other players state
   - 

# Items/Artifacts #

Two classes: public and private. Private items are only available in the
world they were found. Public items are available for retrieval in any
world, but they must be kept at a bank.

## Banks ##


# Tech #

## Frontend ##

   - pixi.js
   - Express
   - socket.io

   - Express
   - socket.io
   - node.js
