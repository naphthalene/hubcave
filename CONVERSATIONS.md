# Adam #
(11:53:26 AM) Pasha: found this http://www.inkwellideas.com/roleplaying_tools/random_city/
(11:53:30 AM) Pasha: going to use it my game
(11:53:47 AM) Adam Wigmore: Yeah we should sit down and chat about that because I am actually interested
(11:53:53 AM) Adam Wigmore: I just was in the middle of kegerator cleaning
(11:54:05 AM) Pasha: the way the servers will work is: there will be one central registry for login via github, news and friend lists (just a django app)
(11:54:09 AM) Pasha: haha ok!
(11:54:21 AM) Pasha: if you've ever played minecraft, its in the same style where anyone can host a world server
(11:54:26 AM) Pasha: i was going to write it in Go
(11:54:48 AM) Pasha: people can join world servers and optionally add their own cities to the global map
(11:55:12 AM) Pasha: alternatively, each city generated will have portals you can use to jump to other player's cities
(11:55:48 AM) Pasha: the client code itself will be downloaded from the central servers as a javascript/HTML5 app
(11:55:53 AM) Pasha: using pixi.js
(11:55:59 AM) Pasha: which supports really fast 2d drawing
(11:56:36 AM) Adam Wigmore: cool! so it's going to be a 2D rendering or basic level 3D?
(11:56:39 AM) Pasha: that way the client is always up to date
(11:56:43 AM) Pasha: no, i was going to stick to 2d
(11:56:52 AM) Pasha: since i need this to be completeable this semester haha
(11:56:56 AM) Pasha: to some extent at least
(11:57:08 AM) Pasha: (maybe without a central server app)
(11:57:33 AM) Adam Wigmore: hmm ok, so what're you thinking games wise?
(11:57:37 AM) Adam Wigmore: Are they just going to be fun
(11:57:47 AM) Adam Wigmore: or have a utility to better the worlds code base?
(11:57:56 AM) Pasha: if you commit code to the repo, the city grows
(11:58:00 AM) Pasha: you get additional levels to play
(11:58:10 AM) Pasha: using a cave generator
(11:58:15 AM) Pasha: in terms of the game itself
(11:58:28 AM) Pasha: i was thinking of making it based on collecting artifacts that improve your stats
(11:58:35 AM) Pasha: or are just rare collectibles
(11:58:40 AM) Pasha: that are shown off on the main site
(11:59:08 AM) Adam Wigmore: ok, you could also take it in the approach of farmville and replace pay to win with code to win
(11:59:09 AM) Pasha: but there should be some combat
(11:59:15 AM) Pasha: i was thinking that
(11:59:22 AM) Pasha: but that complicates things a lot
(11:59:35 AM) Pasha: i was considering gamifying fixing issues and committing pull requests
(11:59:36 AM) Pasha: getting stars
(11:59:53 AM) Pasha: but the easiest way to make it actually fun is to just grow the cities when you commit code/fix things
(12:00:01 PM) Pasha: that way you can collect more artifacts
(12:00:09 PM) Adam Wigmore: hmm well if you didn't do a "building" phase but a repo age as the time piece to increase the size
(12:00:20 PM) Adam Wigmore: exactly
(12:00:25 PM) Adam Wigmore: more code means immediate pay off
(12:00:29 PM) Pasha: right
(12:00:35 PM) Adam Wigmore: you could even create clans for open source projects :P
(12:00:36 PM) Pasha: and artifacts mean you can show off
(12:00:40 PM) Pasha: indeed :D
(12:00:57 PM) Adam Wigmore: That actually sounds like shit tons fun
(12:01:02 PM) Pasha: agreed :D :D
(12:01:07 PM) Pasha: oh and the best part
(12:01:19 PM) Pasha: you can make the central server component also have SSH access
(12:01:28 PM) Pasha: so you can ssh in to a simple curses UI
(12:01:29 PM) Pasha: with news
(12:01:31 PM) Pasha: when you're coding
(12:01:37 PM) Pasha: maybe even integrate it with IRC channels
(12:02:25 PM) Adam Wigmore: hmm
(12:02:35 PM) Pasha: i can see this game being a hit if the dynamics are made well
(12:03:08 PM) Adam Wigmore: yes definitely.  You might want to figure out what you see as the core of the game first
(12:03:20 PM) Adam Wigmore: and then have everything else as features to implement later
(12:03:31 PM) Adam Wigmore: You might've done that already
(12:03:38 PM) Pasha: well, i was thinking of making it class based
(12:03:42 PM) Pasha: three simple classes at first
(12:03:44 PM) Pasha: or maybe even one
(12:03:51 PM) Adam Wigmore: but I can't keep everything that is necessary and everything that is cool sepearate haha
(12:03:54 PM) Pasha: range attacker, mage or warrior
(12:04:27 PM) Pasha: cavehub could be a name :P
