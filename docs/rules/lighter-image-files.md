# lighter-image-files

Encourages to use WebP and SVG format of image files in React code.

Image files inside web application should be in WebP and SVG format. These formats can crunch large images down into more manageable file sizes. They are on average much smaller than GIF, JPEG, PNG, even at extremely high resolutions. We can achieve up to 75% reduction of file size using SVG instead of JPG and up to 95% in case of PNG. For WebP format we get up to 60% reduction of file size in case of converting from JPG and up to 93% for PNG.

# CO<sub>2</sub> reduction

Converting an exemplary image in 1800 x 1200 resolution from PNG to SVG format can reduce the carbon footprint by about 0.72 g CO<sub>2</sub> per website view.

The table below shows comparison between file sizes and CO<sub>2</sub> emission for exemplary image (displayed below) in 1800 x 1200 resolution for the most popular image formats.

![alt text](https://raw.githubusercontent.com/ec0lint/ec0lint/lighter-image-files/docs/exemplary_image.webp)

| File format | File size | CO<sub>2</sub> emission |
| ------------|-----------|-------------------------|
| AVIF        | 87 KB     | 0.03 g                  |
| SVG         | 126 KB    | 0.04 g                  |
| WebP        | 156 KB    | 0.05 g                  |
| JPG         | 249 KB    | 0.09 g                  |
| GIF         | 913 KB    | 0.31 g                  |
| PNG         | 2111 KB   | 0.72 g                  |
| PPM         | 6328 KB   | 2.16 g                  |
| TIFF        | 6328 KB   | 2.16 g                  |
| PSD         | 12698 KB  | 4.33 g                  |
| PS          | 13312 KB  | 4.55 g                  |



By multiplying the file size by the end-user traffic (0.81 kWh / 1024 MB) and by the energy emissions (442 g/kWh), the carbon footprint of the exemplary PNG file (2.1 MB) – sums up to 0.76 g. The same image in SVG format (126 kB) generates 0.04g CO<sub>2</sub>. So, by subtracting 0.04 g from 0.76 g we get 0.72g of savings. (95% less CO<sub>2</sub>).

For the same exemplary image in WebP (156 kB) the carbon footprint amounts to 0.05g. So, by subtracting 0.05 g from 0.76 g we get 0.71 g (93% less CO<sub>2</sub>).

Exemplary image was downloaded from https://wallpaperaccess.com/1800x1200-hd and converted to different formats using https://convertio.co and https://cloudconvert.com/

## examples

The following patterns are considered problems:
```js
import image from './image.gif';
```
```js
import image from './image.png';
```
```js
import image from './image.ppm';
```
```js
import {ReactComponent as image} from './image.ps';
```
```js
let Image = require('../src/image.rgb');
```

The following patterns are _not_ considered problems:
```js
import image from './image.avif';
```
```js
import image from './image.svg';
```
```js
import {ReactComponent as image} from './image.webp';
```
```js
let Image = require('../src/image.jpg');
```
