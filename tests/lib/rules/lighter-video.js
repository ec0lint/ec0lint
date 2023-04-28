'use strict';

const { RuleTester } = require("../../../lib/rule-tester");

const rule = require( '../../../lib/rules/lighter-video' );

const ruleTester = new RuleTester({
  parserOptions: {
    ecmaVersion: 2021,
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true
    }
  }
});


ruleTester.run('lighter-video', rule, {
  valid: [
  
    {
      code: "console.log('Hello, world!');",
    },

    {
      code: "player.playVideo();",
    },
  
    {
      code: "player.loadVideoByUrl('https://www.youtube.com/watch?v=dQw4w9WgXcQ');",
    },
    {
      code: "player.loadVideoById('abcdefg');",
    },
 
    {
      code: "player.loadVideoById({videoId:'abcdefg', startSeconds: 0});",
  
    },
  ],

  invalid: [
    {
      code: "player.cueVideoById({ videoId: 'abcdefg', startSeconds: 0, endSeconds: 60, suggestedQuality: 'large'});",
      errors: [
        {
          message: "This video emits 1.2 grams of CO2 per minute of playback. Consider reducing the quality to reduce emissions.",
        },
      ],
    },
    {
      code: "player.loadVideoById({videoId:'abcdefg',startSeconds: 0, endSeconds: 60, suggestedQuality: 'large'});",
      errors: [
        {
          message: "This video emits 1.2 grams of CO2 per minute of playback. Consider reducing the quality to reduce emissions.",
        },
      ],
    },
    {
      code: "player.loadVideoByUrl({mediaContentUrl:'https://www.youtube.com/watch?v=dQw4w9WgXcQ', startSeconds: 0, endSeconds: 60, suggestedQuality: 'large'});",
      errors: [
        {
          message: "This video emits 1.2 grams of CO2 per minute of playback. Consider reducing the quality to reduce emissions.",
        },
      ],
    },
  
    {
      code: "player.loadVideoById({ videoId: 'abcdefg', startSeconds: 0, endSeconds: 90, suggestedQuality: 'highres'});",
      errors: [
        {
          message: "This video emits 3.75 grams of CO2 per minute of playback. Consider reducing the quality to reduce emissions.",
        },
      ],
    },
   
    {
      code: "player.loadVideoById('abcdefg',0,60,'medium');",
      errors: [
        {
          message: "This video emits 1 grams of CO2 per minute of playback.",
        },
      ],
    },
   
    {
      code: "player.loadVideoById({videoId:'abcdefg',suggestedQuality: 'large'});",
      errors: [
        {
          message: "This video emits 1.2 grams of CO2 per minute of playback.",
        },
      ],
    },
   
    {
      code: "player.cueVideoById('abcdefg',0,60,'hd1080');",
      errors: [
        {
          message: "This video emits 2 grams of CO2 per minute of playback. Consider reducing the quality to reduce emissions.",
        },
      ],
    },
    
    {
      code: "player.loadVideoById('abcdefg',60,120,'medium');",
      errors: [
        {
          message: "This video emits 1 grams of CO2 per minute of playback.",
        },
      ],
    },
  ]
})