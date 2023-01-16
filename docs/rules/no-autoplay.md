# no-autoplay

Disallows the `autoplay` property of YouTube videos embedded in your web application.
We recommend deleting "autoplay=1" from the video's URL.

## CO2 reduction


## Rule details

The following patterns are considered problems:
```js
<iframe src="https://www.youtube.com/embed/tgbNymZ7mvqY?autoplay=1&mute=1"></iframe>
```
```js
<iframe src="https://www.youtube.com/embed/tgbNymZ7mvqY?autoplay=1"></iframe>
```

The following pattern is not considered as a problem:
```js
<iframe src="https://www.youtube.com/embed/tgbNymZ7mvqY"></iframe>
```
