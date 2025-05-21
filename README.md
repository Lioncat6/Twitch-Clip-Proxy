## Usage
Urls should be formatted as `http(s)://<root>/<twitch clip ID/twitch clip URL>`

### Examples:
*`https://cliparchive.example.com/https://www.twitch.tv/ivycomb/clip/AbnegateCrazyClipsdadKevinTurtle-vk_Spe6R93eXjdia`
*`https://cliparchive.example.com/AbnegateCrazyClipsdadKevinTurtle-vk_Spe6R93eXjdia`

### Functionality:
The proxy functions as follows:

* On Request:
  * Check twitch API for clip
    * Clip Exists:
       * Check archive for clip
         * **Not Found** | Archive clip & Redirect to Twitch (**The page will hang for up to a couple minutes while the clip archives**)
         * **Found** | Redirect to Twitch
    * Clip does not exist:
       * Check archive for clip
         * **Not Found** | Display error page
         * **Found** | Serve Video
### Issues:
* Lack of video download validation (Can lead to currupted downloads)
* Downloader binaries are embedded (Just... bad.)
* No status page while clip archives (Leads to the page just... hanging)
* Error pages are raw JSON responses (Looks bad)

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
* https://github.com/lay295/TwitchDownloader/
