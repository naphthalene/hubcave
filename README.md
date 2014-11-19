hubcave
=======

[Play on hubcave.net!](http://hubcave.net)

# Github repository <--> cave exploration game #

Players authorize using their Github credentials. For each repository
that is neither private or a fork, terrain and a chat room are
generated.

Fight each other or solve quests for trophies (coming soon!).
Your trophies will be displayed on your profile page for glory and nerd
cred.

Your dashboard will show you the current popular games and allow you to
edit your repos.

## Current State ##

- Multiplayer works!
- Chat works, but there might be some bugs. Please report any that you
  find.
- It is very hackable, need to run it through js uglification and just
  better javascript practices in general.
- An inventory/item system is in progress.
- When you refresh the page, your HP and ammo will be reset.
- Only shooting arrows is supported at this time.
- By default the game room is public for anyone to join, private rooms are
  on the roadmap.
- Clicking the gear on the side of your repo allows you to change the
  type of terrain from a cave (random walk) to a maze (min cost spanning
  tree) and/or regenerate it.


There are also a number of issues that can be viewed
[here](https://github.com/naphthalene/hubcave/issues). Feel free to take
a stab at any of them.


# Contributing #

If you want to hack on this, pull requests are most welcome, and once
it's approved and merged I will push your contributions to
http://hubcave.net

To get a local instance of the dev server running you need to take the
following steps:

1. Fork the repo, clone it locally
2. [Create an application on github](https://github.com/settings/applications/new)
   Make sure to set the following:
   - Homepage URL: http://localhost:8000 (or your chosen port)
   - Auth callback URL: http://localhost:8000/complete/github

3. Install virtualenv and
   [virtualenvwrapper](http://virtualenvwrapper.readthedocs.org/en/latest/)

4. Create a virtualenv and activate it
5. From the cloned repo, run ```python setup.py install```. This will
   create an alias called 'hubcave'
6. Run ```hubcave init``` to generate a ```~/.hubcave/settings.py```
   file. Here you will need to enter the OAuth key/secret you got from
   step 2.
7. Run ```hubcave syncdb``` (do create superuser) followed by ```hubcave
   migrate``` and ```hubcave collectstatic --noinput```
8. You should now be able to run your dev server using ```hubcave
   runserver_socketio```
