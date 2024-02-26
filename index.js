const express = require("express");
const app = express();
const ytdl = require("ytdl-core");

app.listen(3000, () => {
  console.log("Server is running on http://localhost:3000");
});

app.set('view engine', 'ejs');
app.get("/", (req, res) => {
    res.render('index');
});

app.get("/download", (req, res) => {
    const url = req.query.url;
    if (ytdl.validateURL(url)) {
        ytdl.getInfo(url).then(info => {
            // Filter the formats to get the highest quality video
            const format = ytdl.chooseFormat(info.formats, { quality: 'highest' });
            if (format) {
                res.header('Content-Disposition', `attachment; filename="${info.videoDetails.title}.mp4"`);
                ytdl(url, { format: format }).pipe(res);
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
