# lighter-image-formats

Encourages to use WebP and SVG format of image files in React code.

Image files inside web application should be in WebP and SVG format. These formats can crunch large images down into more manageable file sizes. They are on average much smaller than GIF, JPEG, PNG, even at extremely high resolutions. We can achieve up to 75% reduction of file size using SVG instead of JPG and up to 94% in case of PNG. For WebP format we get up to 60% reduction of file size in case of converting from JPG and up to 91% for PNG.

# CO<sub>2</sub> reduction

Converting an exemplary image in 1800 x 1200 resolution from PNG to SVG format can reduce the carbon footprint by about 0.72 g CO<sub>2</sub> per website view.

The table below shows comparison between file sizes and CO<sub>2</sub> emission for exemplary image (displayed below) in 1800 x 1200 resolution for the most popular image formats.

![alt text](https://github.com/ec0lint/ec0lint-style/blob/main/exemplary_image.webp)

| File format | File size | CO<sub>2</sub> emission |
| ------------|-----------|-------------------------|
| SVG         | 126 kB    | 0.04 g                  |
| WebP        | 200 kB    | 0.07 g                  |
| AVIF        | 231 kB    | 0.08 g                  |
| JPG         | 503 kB    | 0.18 g                  |
| GIF         | 913 kB    | 0.33 g                  |
| PNG         | 2111 kB   | 0.76 g                  |
| TIFF        | 6329 kB   | 2.27 g                  |
| PSD         | 12657 kB  | 4.53 g                  |
| PS          | 12825 kB  | 5.59 g                  |


By multiplying the file size by the end-user traffic (0.81 kWh / 1024 MB) and by the energy emissions (442 g/kWh), the carbon footprint of the exemplary PNG file (2.1 MB) – sums up to 0.76 g. The same image in SVG format (126 kB) generates 0.04g CO<sub>2</sub>. So, by subtracting 0.04 g from 0.76 g we get 0.72g of savings. (95% less CO<sub>2</sub>).

For the same exemplary image in WebP (200 kB) the carbon footprint amounts to 0.07g. So, by subtracting 0.07 g from 0.76 g we get 0.69 g (91% less CO<sub>2</sub>).

Exemplary image was downloaded from https://wallpaperaccess.com/1800x1200-hd and converted to different formats using https://cloudconvert.com/

## examples

The following patterns are considered problems:

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
import image from './image.svg';
```
```js
import {ReactComponent as image} from './image.webp';
```
```js
let Image = require('../src/image.jpg');
```
```js
import image from './image.gif';
```
