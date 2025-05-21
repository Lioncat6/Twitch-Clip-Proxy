
## To Run:

`sudo apt install ffmpeg`

`npm install`

`npm start`

  
## Configuration:
Located at root:

`.env`:

```

SERVER_PORT=<Port>

SERVER_HTTPS=<1 or 0>

CLIP_DOWNLOAD_PATH=<Relative path towards clip folder>

TWTICH_CLIENT_ID=<Twitch application client ID>

TWITCH_CLIENT_SECRET=<Twitch application client Secret>

```

Example:

```

SERVER_PORT=8000

SERVER_HTTPS=0

CLIP_DOWNLOAD_PATH=./clips

TWTICH_CLIENT_ID=p****************************8

TWITCH_CLIENT_SECRET=n****************************m

```

  

## HTTPS:

HTTPS requires certificates at the root:
* `domain.key`
* `domain.crt`
* `ca_bundle.crt`

## Credits:
This repo contains binaries from: 
https://github.com/lay295/TwitchDownloader/