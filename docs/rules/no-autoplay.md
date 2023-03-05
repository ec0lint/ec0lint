# no-autoplay

Disallows the `autoplay` property of YouTube videos embedded in your web application.

The `autoplay` parameter appended to a YouTube video’s URL makes a video start automatically. This behaviour forces to download the video before the website is being loaded.
On the other hand, when `autoplay` is not set to true, the only resource needed when the website is being loaded is the cover image of the video. The video itself is downloaded only if the user clicks on YouTube iframe element.

Autoplay property significantly increases the bandwidth needed to display a website as well as makes the page load much longer.

## CO2 reduction

By deleting the `autoplay=1` part of the YouTube video URL, the video is not downloaded when entering the website. Carbon emissions can be reduced by 99% if a user does not click on the video.
A sample YouTube video – Baby Shark which lasts only 2 minutes, in the resolution of 720p (HD), has the file size of 14.7 MB.  
To calculate the carbon footprint of a YouTube video file, we multiply the size of the video (14.7 MB) by the end-user traffic (0.81 kWh/ 1024 MB) and by the energy emissions (442 g/kWh), which sums up to 5.14 g of CO2.

## Rule details

The following patterns are considered problems:
```js
<iframe src="https://www.youtube.com/embed/tgbNymZ7mvqY?autoplay=1&mute=1"></iframe>
```
```js
<iframe src="https://www.youtube.com/embed/tgbNymZ7mvqY?mute=1&autoplay=1"></iframe>
```

The following pattern is _not_ considered as a problem:
```js
<iframe src="https://www.youtube.com/embed/tgbNymZ7mvqY"></iframe>
```
