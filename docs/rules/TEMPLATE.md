General rules: 

formal style – no contractions (short forms), like do not instead of don’t  

american english – e.g., behavior and color instead of behaviour and colour 

all links should be displayed in a human-readable form 

pay attention to units, e.g., MB or Mb, there’s always a space between the value and the unit (exception: 720p) 
# rule name
Two sentences with a short summary  

- what the rule does -> *Disallows importing web fonts by @import and @font-face CSS rules.*

- what is recommended by us, a better approach ->*We recommend using system or locally hosted fonts.* 

More details on the rule, e.g.:  

- introduction, a fact about the rule -> *System fonts are automatically installed in every operating system of any device, which is used to display a website.* 

- what a user can do to make it better (a measurement of the improvement, e.g., up to 70% size reduction, can be bolded) -> *Even if you do not like system fonts, you can add a static font file we recommend WOFF2, see: no-ttf-font-files to your website.*

- why it is recommended -> *All additional server requests and data transfer related to fonts can be saved.* 

**Packages:** ec0lint-style (what repositories the rule sits in) 

## CO2 reduction

Why there is a CO2 reduction -> *By using system fonts or fonts hosted locally, you do not import any data from an external server.*

Example of size reduction -> *A sample YouTube video – Baby Shark which lasts only 2 minutes, in the resolution of 720p (HD), has the file size of 14.7 MB.*   

How to calculate CO2, with bolded CO2 value -> *To calculate the carbon footprint of a YouTube video file, we multiply the size of the video (14.7 MB) by the end-user traffic (0.81 kWh/1 GB) and by the energy emissions (442 g/kWh), which sums up to 5.14 g of CO2.* 

More examples (optional, but nice to have) -> *In the table below we show carbon footprint emissions depending on file format for 10 popular fonts used on websites.*

More details (optional) – where the values where taken from/what is the sample -> *Exemplary video was downloaded from Pexels and converted to WebM online with Veed.io.*

### Examples

The following patterns are considered problems: 

(a) 

(b) 

(c) 

The following patterns are not considered problems: 

(a) 

(b) 

(c) 

