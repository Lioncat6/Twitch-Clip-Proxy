const http = require("http");
const https = require("https");
const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const fs = require('fs');
const axios = require("axios");
const { exec } = require('child_process');


const clientId = process.env.TWTICH_CLIENT_ID;
const clientSecret = process.env.TWITCH_CLIENT_SECRET;
const clipPath = process.env.CLIP_DOWNLOAD_PATH;

failedAuth = false;
token = null;
tokenExpiration = null;

async function checkToken() {
    if (token && tokenExpiration) {
        const currentTime = Math.floor(Date.now() / 1000);
        if (currentTime < tokenExpiration) {
            return token;
        }
    }

    try {
        const response = await refreshToken();
        token = response.data.access_token;
        tokenExpiration = Math.floor(Date.now() / 1000) + response.data.expires_in - 60; // Subtract 60 seconds for safety
        return token;
    } catch (error) {
        throw new Error(`Error fetching access token: ${error.message}`);
    }
}

async function refreshToken() {
    try {
        const response = await axios.post(
            'https://id.twitch.tv/oauth2/token',
            `client_id=${clientId}&client_secret=${clientSecret}&grant_type=client_credentials`,
            {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
            }
        );

        if (response.status === 200) {
            token = response.data.access_token;
            tokenExpiration = Math.floor(Date.now() / 1000) + response.data.expires_in;
            console.log("Refreshed Access token:", token);
        } else {
            throw new Error(`Error fetching access token: ${response.statusText}`);
        }
    } catch (error) {
        throw new Error(`Error fetching access token: ${error.message}`);
    }
    return token;
}

app.use(bodyParser.json());

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    next();
});

//Obligatory ping
app.get('/ping', (req, res) => {
    res.status(200).send('pong');
});

app.get('/{*any}', async (request, response, next) => {
    const urlPath = request.url;
    try {
        if (urlPath === "/") {
            response.status(400).send(JSON.stringify({ error: "Please provide a twitch Clip URL" }));
        } else {
            await checkToken();

            const clipUrl = urlPath.replace(/^\/https:\/\/www\.twitch\.tv\/[^/]+\/clip\//, '').replace("/", "");
            
            const twitchApiUrl = `https://api.twitch.tv/helix/clips?id=${clipUrl}`;

            const headers = {
                'Client-ID': clientId,
                'Authorization': `Bearer ${token}`
            };

            const twitchResponse = await axios.get(twitchApiUrl, { headers });
            const clipData = twitchResponse.data;
            const outputFilePath = `${clipPath}/${clipUrl}.mp4`;

            if (twitchResponse.status != 200 && twitchResponse.status != 400) {
                console.error("Error fetching clip data:", twitchResponse.statusText);
                response.status(500).send(JSON.stringify({ error: "Failed to fetch clip data" }));
                return;
            }
            if (clipData.data && clipData.data.length > 0) {
                const clipThumbnailUrl = clipData.data[0].thumbnail_url;
                const url = clipData.data[0].url;
                console.log("Clip found, proceeding...");

                if (fs.existsSync(outputFilePath)) {
                    console.log("Clip already exists, skipping download...");
                    response.redirect(url);
                    return;
                }

                const command = `./TwitchDownloader/TwitchDownloaderCLI clipdownload --id ${clipUrl} -o ${outputFilePath}`;

                exec(command, (error, stdout, stderr) => {
                    if (error) {
                        console.error(`Error executing command: ${error.message}`);
                        response.status(500).send(JSON.stringify({ error: "Failed to download clip" }));
                        return;
                    }

                    if (stderr) {
                        console.error(`Error output: ${stderr}`);
                    }

                    console.log(`Command output: ${stdout}`);
                    console.log("Clip downloaded successfully:", outputFilePath);
                    // response.status(200).send(JSON.stringify({ message: "Clip downloaded successfully", path: outputFilePath }));
                    response.redirect(url);
                });
            } else {
                if (fs.existsSync(outputFilePath)) {
                    console.log("Serving Clip...");
                    const absolutePath = require('path').resolve(outputFilePath);
                    response.status(200).sendFile(absolutePath, { headers: { 'Content-Type': 'video/mp4' } });
                    return;
                } else {
                    response.status(404).send(JSON.stringify({ error: "Clip not found" }));
                }
            }
        }
    } catch (error) {
        console.error('Error:', error);
        response.status(500).send('Internal Server Error');
    }
});

async function startServer() {
    port = process.env.SERVER_PORT
    useHttps = process.env.USE_HTTPS == 1;

    retryInterval = 5 * 60 * 1000;

    async function tryRefreshToken() {
        try {
            failedAuth = false
            await refreshToken();
        } catch (error) {
            failedAuth = true
            console.error("Error refreshing token. Retrying in 5 minutes...", error);
            setTimeout(tryRefreshToken, retryInterval);
        }
    }

    await tryRefreshToken();

    console.log(useHttps ? "Https Enabled" : "Https Disabled");

    if (useHttps) {
        let options;
        try {
            options = {
                key: fs.readFileSync('domain.key'),
                cert: fs.readFileSync('domain.crt'),
                ca: [
                    fs.readFileSync('ca_bundle.crt')
                ]
            };
        } catch (e) {
            console.error(String(e))
        }

        https.createServer(options, app).listen(port, () => {
            console.log(`Server is running at port ${port} (HTTPS)`);
        });
    } else {
        http.createServer(app).listen(port, () => {
            console.log(`Server is running at port ${port} (HTTP)`);
        });
    }
}

startServer();
