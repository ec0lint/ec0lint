/**
 * @fileoverview Rule to avoid video 
 * @author Aleksandra Borowska
 */


//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------

/** @type {import('../shared/types').Rule} */
module.exports = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Calculate carbon emissions and video duration for embedded YouTube videos',
      recommended: true,
      url: "https://ecolint.org/docs/rules/lighter-video"
    },
    schema: [

    ]
  },
  create: function (context) {

    const emissionsPerMinute = {
      small: 0.8,
      medium: 1.0,
      large: 1.2,
      hd720: 1.5,
      hd1080: 2.0,
      highres: 2.5,
    };

    function getPropertyValue(obj, property) {
      const prop = obj.properties.find(prop => prop.key.name === property);
      return prop ? prop.value.value : null;
    }

    function calculateCarbonEmissions(quality, playbackTime) {
    
      const emissionsPerSecond = emissionsPerMinute[quality] / 60;
      const carbonEmissions = emissionsPerSecond * playbackTime;

      return { carbonEmissions};
    }

    return {
      "CallExpression[callee.type='MemberExpression'][callee.property.name=/cueVideoById|loadVideoById|loadVideoByUrl/][arguments.length>0]": function (node) {
        const methods = ["cueVideoById", "loadVideoById", "loadVideoByUrl"];
        const { callee, arguments: args } = node;
        if (
          (callee.type === "MemberExpression" &&
          callee.property &&
          methods.includes(callee.property.name) &&
          args.length > 0) ||
          (callee.type === "Identifier" &&
          args.length > 0 &&
          args[0].type === "ObjectExpression" &&
          args[0].properties.find(prop => prop.key.name === "videoId"))
          
        ) {
        
          let startSeconds = null;
          let endSeconds = null;
          let suggestedQuality = null;
          let videoId=null;
          

          if (args[0]) {
            
            if (args[0].type === "ObjectExpression") {
              if (callee.property.name === "loadVideoByUrl") {
                videoId = getPropertyValue(args[0], "mediaContentUrl");
              } else {
                videoId = getPropertyValue(args[0], "videoId");
              }
        
              startSeconds = getPropertyValue(args[0], "startSeconds");
              endSeconds = getPropertyValue(args[0], "endSeconds");
              suggestedQuality = getPropertyValue(args[0], "suggestedQuality");
            } else {
              videoId = args[0] ? args[0].value : null;
              startSeconds = args[1] ? args[1].value : null;
              endSeconds = args[2] ? args[2].value : null;
              suggestedQuality = args[3] ? args[3].value : null;
            }
          
          
            if(videoId!==null){
              let message='';
              if (startSeconds !== null && endSeconds !== null && suggestedQuality!== null) {
                const duration = endSeconds - startSeconds;
                
                const { carbonEmissions } = calculateCarbonEmissions(
                    suggestedQuality,
                    duration
                  );
                  if (["large","hd720", "hd1080", "highres"].includes(suggestedQuality)) {
                        message = `This video emits ${carbonEmissions} grams of CO2 per minute of playback. Consider reducing the quality to reduce emissions.`;
                      } else {
                        message = `This video emits ${carbonEmissions} grams of CO2 per minute of playback.`;
                      }
              }
              
              else if((startSeconds === null || endSeconds === null) && suggestedQuality!== null){
                
                carbonEmissions=emissionsPerMinute[suggestedQuality]
                message = `This video emits ${carbonEmissions} grams of CO2 per minute of playback.`;

                }
              else return
              context.report({
                node,
                message: message,
              });
            }
            
          }
           
        }
      }
    }
  }
}





