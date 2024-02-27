// /index.js

const express = require("express");
const app = express();
const ytdl = require("ytdl-core");
const ffmpeg = require('fluent-ffmpeg');
const fs = require('fs');

app.listen(3000, () => {
  console.log("Server is running on http://localhost:3000");
});
app.use(express.static('public'));

app.set('view engine', 'ejs');
app.get("/", (req, res) => {
    res.render('index');
});

app.get("/fetch-info", (req, res) => {
    const url = req.query.url;
    if (ytdl.validateURL(url)) {
        ytdl.getInfo(url).then(info => {
            // Prepare video information and thumbnails
            const videoInfo = {
                title: info.videoDetails.title,
                thumbnails: info.videoDetails.thumbnails,
                formats: info.formats
            };
            res.json(videoInfo);
        }).catch(err => {
            res.status(500).send('Failed to get video information');
        });
    } else {
        res.status(400).send('Invalid YouTube URL');
    }
});

app.get("/download", (req, res) => {
    const url = req.query.url;
    const quality = req.query.quality; // Get the selected quality
    if (ytdl.validateURL(url)) {
        ytdl.getInfo(url).then(info => {
            let format;
            // Logic to select format based on quality
            // This is a simplified example, you might need to adjust based on actual format IDs
            if (quality === '4k') {
                format = info.formats.find(f => f.qualityLabel === '4K');
            } else if (quality === '1080p') {
                format = info.formats.find(f => f.qualityLabel === '1080p');
            } else if (quality === '720p') {
                format = info.formats.find(f => f.qualityLabel === '720p');
            } else if (quality === '480p') {
                format = info.formats.find(f => f.qualityLabel === '480p');
            } else {
                format = ytdl.chooseFormat(info.formats, { quality: 'lowest' });
            }
            if (format) {
                res.header('Content-Disposition', `attachment; filename="${info.videoDetails.title}.mp4"`);
                const videoStream = ytdl.downloadFromInfo(info, { format: format });
                
                // Check if the chosen quality is  720p or above
                if (quality === '480p' || quality === '720p' || quality === '1080p' || quality === '4k') {
                    // If so, use ffmpeg to merge video and audio streams
                    const audioStream = ytdl.downloadFromInfo(info, { format: format });
                    ffmpeg()
                        .input(videoStream)
                        .input(audioStream)
                        .on('error', (err) => {
                            console.error('An error occurred: ' + err.message);
                            res.status(500).send('An error occurred while processing the video.');
                        })
                        .on('end', () => {
                            console.log('Merging finished !');
                        })
                        .mergeToFile('output.mp4', './tempDir', (err, output) => {
                            if (err) {
                                console.error('An error occurred while merging:', err);
                                res.status(500).send('An error occurred while merging the video and audio streams.');
                                return;
                            }
                            // Stream the merged file back to the client
                            fs.createReadStream('./tempDir/output.mp4').pipe(res);
                        });
                } else {
                    // If not, directly pipe the video stream to the response
                    videoStream.pipe(res);
                }
            } else {
                res.status(404).send('No video found');
            }
        }).catch(err => {
            res.status(500).send('Failed to get video information');
        });
    } else {
        res.status(400).send('Invalid YouTube URL');
    }
});
