# lighter-image-files 
Encourages to avoid heavy image files in the JavaScript code. 
Image files inside web applications should not be heavy. The image file can weigh less if an optimal file format is chosen. For logos, favicons and other simple graphics we recommend using SVG format (vector image format) and for photographs and other more complex graphics, the best format is WebP (raster image format). 
 
### How do we calculate if an image is heavy

We use the following formula to calculate weight to size ratio:

_Image File Ratio = Image File Size / (Image Width * Image Height)_
 
In which: 
- Image File Size = Size of the image file in bytes 
- Image Width = Width of the image in px 
- Image Height = Height of the image in px 
 
The _Image File Ratio_ is a metric that allows us to evaluate the efficiency of images by calculating the number of bytes per square pixel. By using this ratio, we can rate images based on their specific characteristics and determine if they are actually heavy considering its dimensions. 

Images with the _Image File Ratio_ greater than 0.25 are considered as __heavy__.

This number is based on research and calculations, considering various image types (such as photographs and logos), file formats, and resolutions. For most files in formats recommended by ec0lint (light formats: SVG, WebP, AVIF, and JPG), the calculated _Image File Ratio_ is __less than 0.25__. The only exception could be a JPG image file that is not compressed well. In such cases, we recommend converting the file to WebP. 
 
Converting a heavy image to a recommended format (SVG or WebP) should make it fit the range. 

## CO2 reduction 

This table shows comparison between file sizes and CO2 emission for an exemplary image (displayed below) in 1800 x 1200 resolution for the most popular image formats. 

| File format | File size | CO<sub>2</sub> emission | Image File Ratio | Is valid? |
| ------------|-----------|-------------------------|------------------|-----------|
| SVG         | 126 kB    | 0.04 g                  | 0.06             | Y         |
| WebP        | 200 kB    | 0.07 g                  | 0.09             | Y         |
| AVIF        | 231 kB    | 0.08 g                  | 0.11             | Y         |
| JPG         | 503 kB    | 0.18 g                  | 0.24             | Y         |
| GIF         | 913 kB    | 0.33 g                  | 0.43             | N         |
| PNG         | 2111 kB   | 0.76 g                  | 1.00             | N         |
| TIFF        | 6329 kB   | 2.27 g                  | 3.00             | N         |
| PSD         | 12657 kB  | 4.53 g                  | 6.00             | N         |
| PS          | 12825 kB  | 5.59 g                  | 6.08             | N         |

  
By multiplying the file size by the end-user traffic (0.81 kWh / 1024 MB) and by the energy emissions (442 g/kWh), the carbon footprint of the exemplary PNG file (2.1 MB) – sums up to 0.76 g. The same image in SVG format (126 kB) generates 0.04g CO2. By subtracting 0.04 g from 0.76 g we get 0.72 g of savings - 95% less CO2. For WebP the savings are equal to 0.69 g (91% less CO2). 

Exemplary image was downloaded from https://wallpaperaccess.com/1800x1200-hd and converted to different formats using https://cloudconvert.com/ 
 
## examples 

__Calculating _Image File Ratio_ for the exemplary image (displayed in CO2 reduction section) in 1200 x 1800 resolution in the JPG format:__

Image File Size = 503 KB = (503 * 1024) B = 515072 B

Image Width = 1200 px

Image Height = 1800 px 

Size to Dimensions Ratio = 515072 / (1200 * 1800) ≈ 0.2385   < 0.25        `` -> image file is valid``

--------------------------------------------
 
__The following pattern is considered a problem:__

(a) 

```js
import image from './image.png'; 
       ↑        
   "Image file is too heavy. Try converting it to WebP or SVG."
   
```
     
If the Size to Dimensions Ratio of ‘image.png’ file is greater than 0.25, user gets the message above. 



__The following pattern is not considered a problem:__

(a)
```js
import image from './image.webp';
```
If the Size to Dimensions Ratio of ‘image.webp’ file is smaller or equal to 0.25, user gets no message. 
