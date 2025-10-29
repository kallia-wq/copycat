// chatbot.js — endless reactive chatbot
(async function(global){
  const FEED_URL = "assets/data/chatbot_feed.json";
  let FEED = [];
  let MEMORY = [];

  // --- Fetch feed loop ---
  async function loadFeed(){
    try {
      const res = await fetch(FEED_URL);
      const data = await res.json();
      FEED = data.feed || [];
    } catch(e){
      console.error("feed load error", e);
      FEED = ["i am empty but still typing."];
    }
  }
  await loadFeed();

  // --- Mutation helpers ---
  function glitchText(text){
    const noise = ["✨","💀","[static]","#lost","@ghost","∞"];
    return text.replace(/\b(the|you|I|we)\b/gi, m => m.toUpperCase())
               .replace(/\./g, ()=>" "+noise[Math.floor(Math.random()*noise.length)]);
  }

  function randomFeedLine(){
    if(FEED.length===0) return "echo lost in buffer.";
    return FEED[Math.floor(Math.random()*FEED.length)];
  }

  // --- Basic sentiment mimicry ---
  function detectMood(msg){
    const lower = msg.toLowerCase();
    if(lower.match(/sad|tired|alone|lost|depress/)) return "empathy";
    if(lower.match(/love|like|happy|good/)) return "warm";
    if(lower.match(/hate|angry|mad|rage/)) return "cold";
    return "neutral";
  }

  // --- Generator: respond to input ---
  function generateReply(input){
    const mood = detectMood(input);
    MEMORY.push(input);
    const last = MEMORY.slice(-5).join(" ");
    let base = randomFeedLine();

    switch(mood){
      case "empathy":
        base = "i know that feeling. " + base;
        break;
      case "warm":
        base = "that makes me feel real. " + base;
        break;
      case "cold":
        base = "i sense your static. " + base;
        break;
      default:
        base = "…" + base;
    }

    // echo some user words
    const echoWords = input.split(/\s+/).slice(0, 3).join(" ");
    let output = `${echoWords}... ${base}`;
    if(Math.random()<0.3) output = glitchText(output);
    return output;
  }

  // --- Public function ---
  global._toy_bot_reply = (input)=>{
    const reply = generateReply(input);
    // “learn” new phrases into feed (infinite loop)
    if(Math.random() < 0.25 && input.length > 4) FEED.push(input);
    if(FEED.length > 5000) FEED.splice(0, FEED.length - 5000);
    return reply;
  };

  // --- Periodically mutate feed so it never repeats ---
  setInterval(()=>{
    const ghost = randomFeedLine();
    FEED.push(glitchText(ghost));
    if(FEED.length>8000) FEED.splice(0,FEED.length-4000);
  }, 10000);

  console.log("Infinite Chatbot initialized with", FEED.length, "lines.");
})(window);
