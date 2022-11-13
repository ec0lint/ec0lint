# lighter-video-files

Encourages to use WebM video file format in React code.

Video files inside web applications should be in WebM format. It is an open, royalty-free media file format designed specifically for the web, hence it is supported by HTML and has a good compatibility with all modern browsers. Clips in the WebM format are on average much smaller than those in MP4 or OGG (other video formats supported by HTML). We can achieve even a 60% reduction of the file size using WebM instead of the popular MP4 format which quality is only slightly better.

# CO~2~ reduction

The table below shows the comparison between file sizes and CO~2~ emission for a short (23 s) exemplary video (in 1366 x 720 resolution).
Link to the exemplary video: https://www.pexels.com/video/alpaca-closeup-5795043/

![alt text](https://github.com/ec0lint/video_table.webp)
_Converting the exemplary video from MP4 to WebM format can reduce the carbon footprint by 1.15 g of CO~2~ per website view._

By multiplying the file size by the end-user traffic (0.81 kWh / GB) and by thy energy emissions (442 g / kWh), the carbon footprint of the exemplary video in MP4 sums up to 2.06 g. The same file in WebM format generates 0.91 g of CO~2~. So, by subtracting 0.91 g from 2.06 g, we get ==1.15 g (56% less CO~2~)==.

Exemplary video was downloaded from https://www.pexels.com/search/videos/ and converted to WebM online with https://www.veed.io/convert/video-converter.

# examples
### The following patterns are considered problems:

```js
import video from './video.ogg';
```
```js
import video from './video.mp4';
```
```js
import {ReactComponent as video} from './video.m4a';
```
```js
import {ReactComponent as video} from './video.m4p';
```
```js
let Video = require('../src/video.m4b');
```
```js
let Video = require('../src/video.m4r');
```
```js
let Video = require('../src/video.m4v');
```

### The following patterns are _not_ considered problems:
```js
import video from './video.webm';
```
```js
import {ReactComponent as video} from './video.webm';
```
```js
let Video = require('../src/video.webm');
```
