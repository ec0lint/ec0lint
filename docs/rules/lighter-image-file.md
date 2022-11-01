# lighter-image-file

Encourages to use WebP and SVG format of image files in CSS code.

Image files inside web application should be in WebP and SVG format. These formats can crunch large images down into more manageable file sizes. They are on average much smaller than GIF, JPEG, PNG, even at extremely high resolutions. We can achieve up to 82% reduction of file size using SVG instead of JPG and up to 95% in case of PNG. For WebP format we get up to 60% reduction of file size in case of converting from JPG and up to 91% for PNG.

# CO2 reduction

Convertion of an exemplary image in 1800 x 1200 resolution from PNG to SVG format can reduce the carbon footprint by about 5.79 g per website view.

The table below shows comparison between file sizes and CO2 emission for exemplary image (displayed below) in 1800 x 1200 resolution for the most popular image formats.

![alt text](https://github.com/ec0lint/ec0lint-style/blob/main/exemplary_image.webp)

![alt text](https://github.com/ec0lint/ec0lint-style/blob/main/image_table.webp)

By multiplying the file size by the end-user traffic (0.81 kWh / 1000 Mb) and by the energy emissions (442 g/kWh), the carbon footprint of the exemplary PNG file (16.89 Mb) – sums up to 6.05 g. The same image in SVG format (1.01 Mb) generates 0.26g CO2. So, by substracting 0.26 g from 6.05 g we get 5.79g. (95% less CO2).

For the same exemplary image in WebP (1.6 Mb) the carbon footprint amounts to 0.57g. So, by subtracting 0.57 g from 6.05 g we get 5.48 g (91% less CO2).

Exemplary image was downloaded from https://wallpaperaccess.com/1800x1200-hd and converted to different formats using https://cloudconvert.com/

# examples
### The following patterns are considered problems:

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

### The following patterns are _not_ considered problems:
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
