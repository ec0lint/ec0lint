**lighter-video**

The rule is used to calculate the carbon dioxide (CO2) emissions resulting from the duration of quality videos embedded on websites using the YouTube platform. The rule is intended to raise user awareness of the environmental impact of watching videos.

This lighter-video rule works by looking up the cueVideoById, loadVideoById, loadVideoByUrl functions and analyzing their arguments to extract the video ID, suggested quality and duration of the video. Then, based on these parameters, it calculates the CO2 emissions in grams per minute of video playback. In each case, the user is informed of the CO2 emissions, and in cases where the quality of the video is higher than 'large', then a quality reduction is suggested to reduce the emissions.

Ec0lint also offers other video rules like no-autoplay, lighter-video-formats. 

**Packages**: ec0lint

**CO2 reduction**

The video element on the page emits the most carbon dioxide of all other elements. For this reason, it is worth considering reducing the carbon footprint. Table 1 presents the relationship between the amount of CO2 emitted and the quality of the video.


Tabel 1 - CO2 emissions per minute of playback (in grams).

|**Video quality**|**CO2 emissions per minute of playback (in grams)**|**Description**|
| :-: | :-: | :-: |
|small|0\.8 g|The height of the player is 240 pixels and the dimensions of the player for the 4:3 aspect ratio are at least 320 by 240 pixels.|
|medium|1\.0 g|The height of the player is 360 pixels and the dimensions of the player are 640 by 360 pixels (at a 16:9 aspect ratio) or 480 by 360 pixels (at a 4:3 aspect ratio).|
|large|1\.2 g|The height of the player is 480 pixels and the dimensions of the player are 853 by 480 pixels (for a 16:9 aspect ratio) or 640 by 480 pixels (for a 4:3 aspect ratio).|
|hd720|1\.5 g|The height of the player is 720 pixels and the dimensions of the player are 1280 by 720 pixels (for a 16:9 aspect ratio) or 960 by 720 pixels (for a 4:3 aspect ratio). |
|hd1080|2\.0 g|Player height is 1080 pixels and player dimensions are 1920 by 1080 pixels (16:9 aspect ratio) or 1440 by 1080 pixels (4:3 aspect ratio). |
|highres|2\.5g |The height of the player exceeds 1080 pixels, which means the aspect ratio of the player is greater than 1920 by 1080 pixels. |

Downsizing a video from HD1080 to Medium saves 1 gram of CO2 per minute of playback, while downsizing a video from HD1080 to Small saves 1.2 grams of CO2 per minute of playback.

If you want to learn more about C02 emissions while watching video take a look at the following articles https://www.carbontrust.com/our-work-and-impact/guides-reports-and-tools/carbon-impact-of-video-streaming, https://www.researchgate.net/publication/348414802_The_overlooked_environmental_footprint_of_increasing_Internet_use, https://www.mdpi.com/2071-1050/14/4/2195?fbclid=IwAR2vyTaSof3uezYGXDHxfESKxJluI8fuzPq66o4y9JZE-wwXjenXu0j-Yeg#

# **examples**
The following patterns are considered problems:

(a)  player.cueVideoById({ videoId: 'abcdefg', startSeconds: 0, endSeconds: 60, suggestedQuality: 'large'})

(b)   player.loadVideoById({videoId:'abcdefg',startSeconds: 0, endSeconds: 60, suggestedQuality: 'large'})

(c)  player.loadVideoByUrl({mediaContentUrl:'https://www.youtube.com/watch?v=dQw4w9WgXcQ', startSeconds: 0, endSeconds: 60, suggestedQuality: 'large'})

(d) player.loadVideoById({ videoId: 'abcdefg', startSeconds: 0, endSeconds: 90, suggestedQuality: 'highres'})

(e) player.loadVideoById('abcdefg',0,60,'medium')

(f)  player.loadVideoById({videoId:'abcdefg',suggestedQuality: 'large'})

(g)  player.cueVideoById('abcdefg',0,60,'hd1080')

The following patterns are **not** considered problems:

(a)  player.loadVideoByUrl('https://www.youtube.com/watch?v=dQw4w9WgXcQ')

(b)  player.loadVideoById('abcdefg')

(c)  player.loadVideoById({videoId:'abcdefg', startSeconds: 0})