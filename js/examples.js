// Level-controlled examples for the 2025 HSK syllabus. Original examples and corpus attribution remain intact.
export function buildLevelExamples(vocab, exampleFiles, curated = {}) {
  const levels = new Map(), readings = new Map();
  for (const w of vocab) {
    levels.set(w.h, Math.min(w.l, levels.get(w.h) ?? Infinity));
    readings.set(w.h, (readings.get(w.h) || 0) + 1);
  }
  const seg = typeof Intl.Segmenter === 'function' ? new Intl.Segmenter('zh-CN', {granularity:'word'}) : null;
  const maxLen = Math.max(...Array.from(levels.keys(), x => x.length));
  const grammar = new Set(vocab.filter(w=>w.s?.some(p=>['particle','pronoun','numeral','measure word','preposition','conjunction','adverb','suffix','prefix'].includes(p))).map(w=>w.h));
  const cache = new Map();
  function analyze(zh) {
    if (cache.has(zh)) return cache.get(zh);
    if (!seg || typeof zh !== 'string') return null;
    const tokens = []; let level = 0;
    for (const chunk of zh.match(/\p{Script=Han}+|[^\p{Script=Han}]+/gu) || []) {
      if (!/^\p{Script=Han}/u.test(chunk)) {
        if (!/^[\p{P}\p{Z}\p{N}\s]+$/u.test(chunk)) { cache.set(zh,null); return null; }
        continue;
      }
      const parts = [...seg.segment(chunk)];
      // ICU sometimes groups several simple words together (我的, 一本书).
      // Scan known syllabus words greedily; never split a known harder word.
      // For an ICU segment not in the list, only accept a split if it has a
      // grammatical component, or is a normal number / classifier phrase.
      const local = [];
      for(let i=0;i<chunk.length;) {
        let hit = '';
        for(let end=Math.min(i+maxLen,chunk.length);end>i;end--) {
          const word=chunk.slice(i,end);
          if(levels.has(word)){hit=word;break;}
        }
        if(!hit){cache.set(zh,null);return null;}
        local.push({word:hit,start:i,end:i+hit.length}); i+=hit.length;
      }
      for(const part of parts) {
        if(levels.has(part.segment)) {
          level=Math.max(level,levels.get(part.segment));
          continue;
        }
        const overlap=local.filter(t=>t.start<part.index+part.segment.length && t.end>part.index);
        const grammatical=overlap.some(t=>grammar.has(t.word));
        const spans=overlap.some(t=>t.start<part.index || t.end>part.index+part.segment.length);
        if(!grammatical && !spans){cache.set(zh,null);return null;}
      }
      for(const t of local){tokens.push(t.word);level=Math.max(level,levels.get(t.word));}
    }
    const result = tokens.length ? {tokens,level} : null;
    cache.set(zh,result); return result;
  }
  const originals = new Map(exampleFiles.flatMap(f=>Object.entries(f || {})).map(([id,es])=>[Number(id),es]));
  const pool = new Map();
  const valid = e=>e && typeof e.zh==='string' && typeof e.en==='string' && e.en.trim() && e.zh.trim();
  for (const [id, examples] of originals) {
    if(!Array.isArray(examples)) continue;
    for(const e of examples) {
      if(!valid(e)) continue;
      const a=analyze(e.zh); if(!a) continue;
      // Reuse only sentences explicitly tagged for the word by the source,
      // not incidental substrings or unrelated uses of a homograph.
      for(const token of new Set(a.tokens)) {
        if(!e.headwords?.some(h=>h.simplified===token)) continue;
        if(!pool.has(token)) pool.set(token,new Map());
        const entries=pool.get(token); if(!entries.has(e.zh)) entries.set(e.zh,{e,a,id});
      }
    }
  }
  const result = new Map();
  for(const w of vocab) {
    const chosen = [], seen = new Set();
    const add = e=>{
      if(chosen.length>=3 || !valid(e) || seen.has(e.zh)) return;
      if (['也同学在这个学校学习。','那多的书看。','请不要与我的事情有关。','由于大，这个不好。','我通过了汉语课。'].includes(e.zh)) return;
      // Explicit boundaries are supplied only for authored examples; every token
      // must be in the same syllabus and reproduce the complete Chinese text.
      const explicit = e.source === 'original' && Array.isArray(e.verifiedTokens) ? e.verifiedTokens : null;
      const a = explicit && explicit.length && explicit.every(t => levels.has(t)) && explicit.join('') === e.zh.replace(/[\p{P}\s]/gu, '')
        ? {tokens:explicit,level:Math.max(...explicit.map(t=>levels.get(t)))}
        : analyze(e.zh);
      if(!a || a.level>w.l || !a.tokens.includes(w.h)) return;
      chosen.push({...e, tokens:a.tokens, maxLevel:a.level});seen.add(e.zh);
    };
    for(const e of curated[w.i] || []) add(e);
    const own = (originals.get(w.i)||[]).filter(valid).sort((a,b)=>(analyze(a.zh)?.level??99)-(analyze(b.zh)?.level??99)||a.zh.length-b.zh.length);
    for(const e of own) add(e);
    if(readings.get(w.h)===1) {
      const candidates=[...(pool.get(w.h)?.values()||[])].sort((a,b)=>a.a.level-b.a.level||a.e.zh.length-b.e.zh.length);
      for(const {e} of candidates) add(e);
    }
    result.set(w.i,chosen);
  }
  return result;
}
export const curatedExamples = {
  "1": [
    {
      "zh": "这是我的书。",
      "en": "This is my book.",
      "source": "original"
    },
    {
      "zh": "他是我的朋友。",
      "en": "He is my friend.",
      "source": "original"
    },
    {
      "zh": "红色的衣服很好看。",
      "en": "The red clothes look nice.",
      "source": "original"
    }
  ],
  "2": [
    {
      "zh": "我吃饭了。",
      "en": "I have eaten.",
      "source": "original"
    },
    {
      "zh": "他回家了。",
      "en": "He has gone home.",
      "source": "original"
    },
    {
      "zh": "下雨了。",
      "en": "It has started raining.",
      "source": "original"
    }
  ],
  "6": [
    {
      "zh": "我和他是朋友。",
      "en": "He and I are friends.",
      "source": "original"
    },
    {
      "zh": "我和妈妈去学校。",
      "en": "Mum and I are going to school.",
      "source": "original"
    },
    {
      "zh": "我喜欢茶和水。",
      "en": "I like tea and water.",
      "source": "original"
    }
  ],
  "7": [
    {
      "zh": "我有一本书。",
      "en": "I have a book.",
      "source": "original"
    },
    {
      "zh": "他有两个孩子。",
      "en": "He has two children.",
      "source": "original"
    },
    {
      "zh": "你有时间吗？",
      "en": "Do you have time?",
      "source": "original"
    }
  ],
  "9": [
    {
      "zh": "我有三个朋友。",
      "en": "I have three friends.",
      "source": "original"
    },
    {
      "zh": "这是一个问题。",
      "en": "This is a question.",
      "source": "original"
    },
    {
      "zh": "我买了两个苹果。",
      "en": "I bought two apples.",
      "source": "original"
    }
  ],
  "10": [
    {
      "zh": "我也喜欢吃饭。",
      "en": "I also like eating.",
      "source": "original"
    },
    {
      "zh": "他也去学校。",
      "en": "He is going to school too.",
      "source": "original"
    },
    {
      "zh": "我也是学生。",
      "en": "I am a student too.",
      "source": "original"
    }
  ],
  "12": [
    {
      "zh": "我不去。",
      "en": "I'm not going.",
      "source": "original"
    },
    {
      "zh": "他不喜欢茶。",
      "en": "He doesn't like tea.",
      "source": "original"
    },
    {
      "zh": "今天不冷。",
      "en": "It isn't cold today.",
      "source": "original"
    }
  ],
  "14": [
    {
      "zh": "书在桌子上。",
      "en": "The book is on the table.",
      "source": "original"
    },
    {
      "zh": "我八点上课。",
      "en": "I start class at eight.",
      "source": "original"
    },
    {
      "zh": "他上车了。",
      "en": "He got on the vehicle.",
      "source": "original"
    }
  ],
  "15": [
    {
      "zh": "这里有很多人。",
      "en": "There are many people here.",
      "source": "original"
    },
    {
      "zh": "他是中国人。",
      "en": "He is Chinese.",
      "source": "original"
    },
    {
      "zh": "今天有三个人来。",
      "en": "Three people are coming today.",
      "source": "original"
    }
  ],
  "16": [
    {
      "zh": "一年有十二个月。",
      "en": "A year has twelve months.",
      "source": "original"
    },
    {
      "zh": "我在这里住了三年。",
      "en": "I have lived here for three years.",
      "source": "original"
    },
    {
      "zh": "我学了两年中文。",
      "en": "I studied Chinese for two years.",
      "source": "original"
    }
  ],
  "17": [
    {
      "zh": "你说得对。",
      "en": "What you said is right.",
      "source": "original"
    },
    {
      "zh": "这个答案不对。",
      "en": "This answer is wrong.",
      "source": "original"
    },
    {
      "zh": "对，我是学生。",
      "en": "Yes, I am a student.",
      "source": "original"
    }
  ],
  "18": [
    {
      "zh": "你说什么？",
      "en": "What are you saying?",
      "source": "original"
    },
    {
      "zh": "他会说中文。",
      "en": "He can speak Chinese.",
      "source": "original"
    },
    {
      "zh": "请慢一点说。",
      "en": "Please speak a little more slowly.",
      "source": "original"
    }
  ],
  "19": [
    {
      "zh": "我们都喜欢中国。",
      "en": "We all like China.",
      "source": "original"
    },
    {
      "zh": "他们都是学生。",
      "en": "They are all students.",
      "source": "original"
    },
    {
      "zh": "这些书我都看了。",
      "en": "I have read all these books.",
      "source": "original"
    }
  ],
  "21": [
    {
      "zh": "我八点到学校。",
      "en": "I arrive at school at eight.",
      "source": "original"
    },
    {
      "zh": "他到家了。",
      "en": "He has arrived home.",
      "source": "original"
    },
    {
      "zh": "你几点到？",
      "en": "What time will you arrive?",
      "source": "original"
    }
  ],
  "22": [
    {
      "zh": "今天是五月一日。",
      "en": "Today is May 1.",
      "source": "original"
    },
    {
      "zh": "我六月十日去中国。",
      "en": "I am going to China on June 10.",
      "source": "original"
    },
    {
      "zh": "他七月三日回来。",
      "en": "He returns on July 3.",
      "source": "original"
    }
  ],
  "24": [
    {
      "zh": "今天天气很好。",
      "en": "The weather is good today.",
      "source": "original"
    },
    {
      "zh": "这本书很好。",
      "en": "This book is very good.",
      "source": "original"
    },
    {
      "zh": "好，我们走吧。",
      "en": "Okay, let's go.",
      "source": "original"
    }
  ],
  "25": [
    {
      "zh": "我五月去中国。",
      "en": "I'm going to China in May.",
      "source": "original"
    },
    {
      "zh": "这个月很忙。",
      "en": "This month is busy.",
      "source": "original"
    },
    {
      "zh": "我学了三个月。",
      "en": "I have studied for three months.",
      "source": "original"
    }
  ],
  "26": [
    {
      "zh": "我会说中文。",
      "en": "I can speak Chinese.",
      "source": "original"
    },
    {
      "zh": "你会写汉字吗？",
      "en": "Can you write Chinese characters?",
      "source": "original"
    },
    {
      "zh": "他明天会来。",
      "en": "He will come tomorrow.",
      "source": "original"
    }
  ],
  "27": [
    {
      "zh": "这个房间很大。",
      "en": "This room is big.",
      "source": "original"
    },
    {
      "zh": "他的家很大。",
      "en": "His home is big.",
      "source": "original"
    },
    {
      "zh": "我要一个大的。",
      "en": "I want a big one.",
      "source": "original"
    }
  ],
  "28": [
    {
      "zh": "你明天来吗？",
      "en": "Are you coming tomorrow?",
      "source": "original"
    },
    {
      "zh": "他来我家吃饭。",
      "en": "He comes to my home to eat.",
      "source": "original"
    },
    {
      "zh": "请来这里。",
      "en": "Please come here.",
      "source": "original"
    }
  ],
  "29": [
    {
      "zh": "我还想喝水。",
      "en": "I still want some water.",
      "source": "original"
    },
    {
      "zh": "他还在学校。",
      "en": "He is still at school.",
      "source": "original"
    },
    {
      "zh": "现在还早。",
      "en": "It's still early.",
      "source": "original"
    }
  ],
  "30": [
    {
      "zh": "下课后我回家。",
      "en": "I go home after class.",
      "source": "original"
    },
    {
      "zh": "饭后我们去学校。",
      "en": "After eating, we go to school.",
      "source": "original"
    },
    {
      "zh": "三天后他来。",
      "en": "He comes in three days.",
      "source": "original"
    }
  ],
  "31": [
    {
      "zh": "我有两本书。",
      "en": "I have two books.",
      "source": "original"
    },
    {
      "zh": "他买了两个苹果。",
      "en": "He bought two apples.",
      "source": "original"
    },
    {
      "zh": "我们有两个人。",
      "en": "There are two of us.",
      "source": "original"
    }
  ],
  "32": [
    {
      "zh": "我没有钱。",
      "en": "I have no money.",
      "source": "original"
    },
    {
      "zh": "今天没有课。",
      "en": "There is no class today.",
      "source": "original"
    },
    {
      "zh": "他没有时间。",
      "en": "He has no time.",
      "source": "original"
    }
  ],
  "35": [
    {
      "zh": "请给我一杯水。",
      "en": "Please give me a glass of water.",
      "source": "original"
    },
    {
      "zh": "我给他一本书。",
      "en": "I give him a book.",
      "source": "original"
    },
    {
      "zh": "他给妈妈买衣服。",
      "en": "He buys clothes for his mother.",
      "source": "original"
    }
  ],
  "36": [
    {
      "zh": "我是中国人。",
      "en": "I am Chinese.",
      "source": "original"
    },
    {
      "zh": "我想去中国。",
      "en": "I want to go to China.",
      "source": "original"
    },
    {
      "zh": "他在中国学习。",
      "en": "He studies in China.",
      "source": "original"
    }
  ],
  "37": [
    {
      "zh": "这本书十元。",
      "en": "This book costs ten yuan.",
      "source": "original"
    },
    {
      "zh": "一杯水五元。",
      "en": "A glass of water costs five yuan.",
      "source": "original"
    },
    {
      "zh": "我有二十元。",
      "en": "I have twenty yuan.",
      "source": "original"
    }
  ],
  "38": [
    {
      "zh": "我喜欢看书。",
      "en": "I like reading.",
      "source": "original"
    },
    {
      "zh": "你看这本书。",
      "en": "Look at this book.",
      "source": "original"
    },
    {
      "zh": "我们去看电影。",
      "en": "Let's go watch a movie.",
      "source": "original"
    }
  ],
  "39": [
    {
      "zh": "书在桌子下。",
      "en": "The book is under the table.",
      "source": "original"
    },
    {
      "zh": "我们下午下课。",
      "en": "We finish class in the afternoon.",
      "source": "original"
    },
    {
      "zh": "他下车了。",
      "en": "He got out of the vehicle.",
      "source": "original"
    }
  ],
  "40": [
    {
      "zh": "她是我妈妈。",
      "en": "She is my mother.",
      "source": "original"
    },
    {
      "zh": "她喜欢喝茶。",
      "en": "She likes drinking tea.",
      "source": "original"
    },
    {
      "zh": "她在学校。",
      "en": "She is at school.",
      "source": "original"
    }
  ],
  "43": [
    {
      "zh": "你能来吗？",
      "en": "Can you come?",
      "source": "original"
    },
    {
      "zh": "我能看这本书吗？",
      "en": "May I read this book?",
      "source": "original"
    },
    {
      "zh": "他今天不能去。",
      "en": "He cannot go today.",
      "source": "original"
    }
  ],
  "44": [
    {
      "zh": "他们是学生。",
      "en": "They are students.",
      "source": "original"
    },
    {
      "zh": "他们在学校。",
      "en": "They are at school.",
      "source": "original"
    },
    {
      "zh": "他们都喜欢中文。",
      "en": "They all like Chinese.",
      "source": "original"
    }
  ],
  "45": [
    {
      "zh": "你在做什么？",
      "en": "What are you doing?",
      "source": "original"
    },
    {
      "zh": "妈妈在做饭。",
      "en": "Mum is cooking.",
      "source": "original"
    },
    {
      "zh": "我明天做这个。",
      "en": "I'll do this tomorrow.",
      "source": "original"
    }
  ],
  "46": [
    {
      "zh": "我想喝水。",
      "en": "I want to drink water.",
      "source": "original"
    },
    {
      "zh": "他想去中国。",
      "en": "He wants to go to China.",
      "source": "original"
    },
    {
      "zh": "你想吃什么？",
      "en": "What do you want to eat?",
      "source": "original"
    }
  ],
  "47": [
    {
      "zh": "那是我的书。",
      "en": "That is my book.",
      "source": "original"
    },
    {
      "zh": "那个人是老师。",
      "en": "That person is a teacher.",
      "source": "original"
    },
    {
      "zh": "我想买那本书。",
      "en": "I want to buy that book.",
      "source": "original"
    }
  ],
  "48": [
    {
      "zh": "这是我的新书。",
      "en": "This is my new book.",
      "source": "original"
    },
    {
      "zh": "他有一件新衣服。",
      "en": "He has a new piece of clothing.",
      "source": "original"
    },
    {
      "zh": "这是新来的老师。",
      "en": "This is the new teacher.",
      "source": "original"
    }
  ],
  "49": [
    {
      "zh": "这件衣服太小了。",
      "en": "This piece of clothing is too small.",
      "source": "original"
    },
    {
      "zh": "我的房间很小。",
      "en": "My room is small.",
      "source": "original"
    },
    {
      "zh": "我想要一个小的。",
      "en": "I want a small one.",
      "source": "original"
    }
  ],
  "50": [
    {
      "zh": "我在这里住三天。",
      "en": "I am staying here for three days.",
      "source": "original"
    },
    {
      "zh": "一天有二十四个小时。",
      "en": "There are 24 hours in a day.",
      "source": "original"
    },
    {
      "zh": "今天是第三天。",
      "en": "Today is the third day.",
      "source": "original"
    }
  ],
  "51": [
    {
      "zh": "他在中国工作。",
      "en": "He works in China.",
      "source": "original"
    },
    {
      "zh": "我今天不工作。",
      "en": "I am not working today.",
      "source": "original"
    },
    {
      "zh": "你喜欢你的工作吗？",
      "en": "Do you like your job?",
      "source": "original"
    }
  ],
  "54": [
    {
      "zh": "我在这个公司工作。",
      "en": "I work at this company.",
      "source": "original"
    },
    {
      "zh": "他今天去公司。",
      "en": "He is going to the company today.",
      "source": "original"
    },
    {
      "zh": "这个公司很大。",
      "en": "This company is big.",
      "source": "original"
    }
  ],
  "55": [
    {
      "zh": "我有一个问题。",
      "en": "I have a question.",
      "source": "original"
    },
    {
      "zh": "这个问题很大。",
      "en": "This problem is big.",
      "source": "original"
    },
    {
      "zh": "你有什么问题？",
      "en": "What questions do you have?",
      "source": "original"
    }
  ],
  "56": [
    {
      "zh": "我想回家。",
      "en": "I want to go home.",
      "source": "original"
    },
    {
      "zh": "他今天在家。",
      "en": "He is at home today.",
      "source": "original"
    },
    {
      "zh": "这是我家。",
      "en": "This is my home.",
      "source": "original"
    }
  ],
  "57": [
    {
      "zh": "我们走吧。",
      "en": "Let's go.",
      "source": "original"
    },
    {
      "zh": "你坐吧。",
      "en": "Please sit.",
      "source": "original"
    },
    {
      "zh": "明天见吧。",
      "en": "Let's meet tomorrow.",
      "source": "original"
    }
  ],
  "60": [
    {
      "zh": "今天真冷。",
      "en": "It is really cold today.",
      "source": "original"
    },
    {
      "zh": "你真好。",
      "en": "You are really nice.",
      "source": "original"
    },
    {
      "zh": "这件衣服真漂亮。",
      "en": "This clothing is really pretty.",
      "source": "original"
    }
  ],
  "62": [
    {
      "zh": "太好了！",
      "en": "That's great!",
      "source": "original"
    },
    {
      "zh": "今天太热了。",
      "en": "Today is too hot.",
      "source": "original"
    },
    {
      "zh": "这本书太大了。",
      "en": "This book is too big.",
      "source": "original"
    }
  ],
  "63": [
    {
      "zh": "我们明天再见。",
      "en": "Let's meet again tomorrow.",
      "source": "original"
    },
    {
      "zh": "请再说一次。",
      "en": "Please say it again.",
      "source": "original"
    },
    {
      "zh": "我想再喝一杯水。",
      "en": "I want another glass of water.",
      "source": "original"
    }
  ],
  "64": [
    {
      "zh": "你有时间吗？",
      "en": "Do you have time?",
      "source": "original"
    },
    {
      "zh": "我今天没有时间。",
      "en": "I have no time today.",
      "source": "original"
    },
    {
      "zh": "现在还有时间。",
      "en": "There is still time now.",
      "source": "original"
    }
  ],
  "65": [
    {
      "zh": "我爱我的家。",
      "en": "I love my home.",
      "source": "original"
    },
    {
      "zh": "他爱他的妈妈。",
      "en": "He loves his mother.",
      "source": "original"
    },
    {
      "zh": "我爱中国。",
      "en": "I love China.",
      "source": "original"
    }
  ],
  "68": [
    {
      "zh": "你呢？",
      "en": "What about you?",
      "source": "original"
    },
    {
      "zh": "我的书呢？",
      "en": "Where is my book?",
      "source": "original"
    },
    {
      "zh": "他在做什么呢？",
      "en": "What is he doing?",
      "source": "original"
    }
  ],
  "71": [
    {
      "zh": "它很小。",
      "en": "It is small.",
      "source": "original"
    },
    {
      "zh": "它在这里。",
      "en": "It is here.",
      "source": "original"
    },
    {
      "zh": "我喜欢它。",
      "en": "I like it.",
      "source": "original"
    }
  ],
  "73": [
    {
      "zh": "我买了一些水果。",
      "en": "I bought some fruit.",
      "source": "original"
    },
    {
      "zh": "这里有一些书。",
      "en": "There are some books here.",
      "source": "original"
    },
    {
      "zh": "他想喝一些水。",
      "en": "He wants to drink some water.",
      "source": "original"
    }
  ],
  "74": [
    {
      "zh": "这些是我的书。",
      "en": "These are my books.",
      "source": "original"
    },
    {
      "zh": "这些人都是学生。",
      "en": "These people are all students.",
      "source": "original"
    },
    {
      "zh": "我喜欢这些衣服。",
      "en": "I like these clothes.",
      "source": "original"
    }
  ],
  "75": [
    {
      "zh": "大家好！",
      "en": "Hello, everyone!",
      "source": "original"
    },
    {
      "zh": "大家请坐。",
      "en": "Everyone, please sit.",
      "source": "original"
    },
    {
      "zh": "大家都来了。",
      "en": "Everyone has arrived.",
      "source": "original"
    }
  ],
  "600": [
    {
      "zh": "我去学校接孩子。",
      "en": "I'm going to school to pick up the child.",
      "source": "original"
    },
    {
      "zh": "请接电话。",
      "en": "Please answer the phone.",
      "source": "original"
    },
    {
      "zh": "我去机场接你。",
      "en": "I'll meet you at the airport.",
      "source": "original"
    }
  ],
  "633": [
    {
      "zh": "他收了这个礼物。",
      "en": "He accepted this gift.",
      "source": "original"
    },
    {
      "zh": "你收了多少钱？",
      "en": "How much money did you collect?",
      "source": "original"
    },
    {
      "zh": "我今天收了两封信。",
      "en": "I received two letters today.",
      "source": "original"
    }
  ],
  "995": [
    {
      "zh": "他昨天很晚才睡着。",
      "en": "He fell asleep very late yesterday.",
      "source": "original"
    },
    {
      "zh": "我一上车就睡着了。",
      "en": "I fell asleep as soon as I got in the vehicle.",
      "source": "original"
    },
    {
      "zh": "房子着火了。",
      "en": "The house caught fire.",
      "source": "original"
    }
  ],
  "996": [
    {
      "zh": "我与他是朋友。",
      "en": "He and I are friends.",
      "source": "original"
    },
    {
      "zh": "这与我无关。",
      "en": "This has nothing to do with me.",
      "source": "original"
    },
    {
      "zh": "我想与老师谈一谈。",
      "en": "I want to have a talk with the teacher.",
      "source": "original"
    }
  ],
  "997": [
    {
      "zh": "会议将于明天开始。",
      "en": "The meeting will start tomorrow.",
      "source": "original"
    },
    {
      "zh": "我将去中国学习。",
      "en": "I will go to China to study.",
      "source": "original"
    },
    {
      "zh": "我们将继续工作。",
      "en": "We will continue working.",
      "source": "original"
    }
  ],
  "998": [
    {
      "zh": "他喜欢茶，而我喜欢水。",
      "en": "He likes tea, while I like water.",
      "source": "original"
    },
    {
      "zh": "这本书又便宜而且好看。",
      "en": "This book is inexpensive and interesting.",
      "source": "original"
    },
    {
      "zh": "她没有生气，而是笑了。",
      "en": "She didn't get angry; instead, she smiled.",
      "source": "original"
    }
  ],
  "1002": [
    {
      "zh": "会议正在进行。",
      "en": "The meeting is in progress.",
      "source": "original"
    },
    {
      "zh": "比赛进行得很顺利。",
      "en": "The competition is going smoothly.",
      "source": "original"
    },
    {
      "zh": "我们正在进行研究。",
      "en": "We are conducting research.",
      "source": "original"
    }
  ],
  "1003": [
    {
      "zh": "他是一名记者。",
      "en": "He is a reporter.",
      "source": "original"
    },
    {
      "zh": "记者来了。",
      "en": "The reporter has arrived.",
      "source": "original"
    },
    {
      "zh": "记者问了我几个问题。",
      "en": "The reporter asked me a few questions.",
      "source": "original"
    }
  ],
  "1004": [
    {
      "zh": "他买了书，并买了衣服。",
      "en": "He bought books and clothes.",
      "source": "original"
    },
    {
      "zh": "我并不喜欢这个办法。",
      "en": "I don't really like this method.",
      "source": "original"
    },
    {
      "zh": "她并没有生气。",
      "en": "She wasn't angry at all.",
      "source": "original"
    }
  ],
  "1005": [
    {
      "zh": "会议已结束。",
      "en": "The meeting has already ended.",
      "source": "original"
    },
    {
      "zh": "他已到家。",
      "en": "He has already arrived home.",
      "source": "original"
    },
    {
      "zh": "我已完成工作。",
      "en": "I have already finished the work.",
      "source": "original"
    }
  ],
  "1006": [
    {
      "zh": "我去市场买菜。",
      "en": "I'm going to the market to buy vegetables.",
      "source": "original"
    },
    {
      "zh": "这个市场很大。",
      "en": "This market is large.",
      "source": "original"
    },
    {
      "zh": "市场里有很多人。",
      "en": "There are many people in the market.",
      "source": "original"
    }
  ],
  "1010": [
    {
      "zh": "我很忙，他却很有空。",
      "en": "I'm busy, but he has plenty of free time.",
      "source": "original"
    },
    {
      "zh": "他想去，却没有时间。",
      "en": "He wants to go but has no time.",
      "source": "original"
    },
    {
      "zh": "大家都来了，他却没来。",
      "en": "Everyone came, but he didn't.",
      "source": "original"
    }
  ],
  "1011": [
    {
      "zh": "经济发展很快。",
      "en": "The economy is developing rapidly.",
      "source": "original"
    },
    {
      "zh": "他学习经济。",
      "en": "He studies economics.",
      "source": "original"
    },
    {
      "zh": "这个国家的经济很好。",
      "en": "This country's economy is doing well.",
      "source": "original"
    }
  ],
  "1013": [
    {
      "zh": "目前我在中国工作。",
      "en": "I currently work in China.",
      "source": "original"
    },
    {
      "zh": "目前没有问题。",
      "en": "There are currently no problems.",
      "source": "original"
    },
    {
      "zh": "目前我们需要更多时间。",
      "en": "At present we need more time.",
      "source": "original"
    }
  ],
  "1014": [
    {
      "zh": "学校今天有活动。",
      "en": "The school has an activity today.",
      "source": "original"
    },
    {
      "zh": "我喜欢参加活动。",
      "en": "I like taking part in activities.",
      "source": "original"
    },
    {
      "zh": "这个活动很有意思。",
      "en": "This activity is interesting.",
      "source": "original"
    }
  ],
  "1015": [
    {
      "zh": "这个消息使我很高兴。",
      "en": "This news makes me very happy.",
      "source": "original"
    },
    {
      "zh": "运动使人健康。",
      "en": "Exercise makes people healthy.",
      "source": "original"
    },
    {
      "zh": "这件事使他很生气。",
      "en": "This matter made him very angry.",
      "source": "original"
    }
  ],
  "1016": [
    {
      "zh": "他负责管理公司。",
      "en": "He is responsible for managing the company.",
      "source": "original"
    },
    {
      "zh": "我在学习管理。",
      "en": "I'm studying management.",
      "source": "original"
    },
    {
      "zh": "这家店管理得很好。",
      "en": "This store is managed well.",
      "source": "original"
    }
  ],
  "1017": [
    {
      "zh": "我通过了考试。",
      "en": "I passed the exam.",
      "source": "original"
    },
    {
      "zh": "他通过努力找到了工作。",
      "en": "He found a job through hard work.",
      "source": "original"
    },
    {
      "zh": "我们通过电话联系。",
      "en": "We communicate by phone.",
      "source": "original"
    }
  ],
  "1019": [
    {
      "zh": "他表示同意。",
      "en": "He expressed agreement.",
      "source": "original"
    },
    {
      "zh": "我向你表示感谢。",
      "en": "I express my thanks to you.",
      "source": "original"
    },
    {
      "zh": "她表示不想去。",
      "en": "She said she didn't want to go.",
      "source": "original"
    }
  ],
  "1020": [
    {
      "zh": "现在情况怎么样？",
      "en": "How are things now?",
      "source": "original"
    },
    {
      "zh": "我不了解这里的情况。",
      "en": "I don't understand the situation here.",
      "source": "original"
    },
    {
      "zh": "情况比昨天好。",
      "en": "The situation is better than yesterday.",
      "source": "original"
    }
  ],
  "1023": [
    {
      "zh": "两个人同时到了。",
      "en": "Two people arrived at the same time.",
      "source": "original"
    },
    {
      "zh": "我不能同时做两件事。",
      "en": "I can't do two things at once.",
      "source": "original"
    },
    {
      "zh": "他们同时开始工作。",
      "en": "They started working at the same time.",
      "source": "original"
    }
  ],
  "1024": [
    {
      "zh": "他想成为老师。",
      "en": "He wants to become a teacher.",
      "source": "original"
    },
    {
      "zh": "她成为了医生。",
      "en": "She became a doctor.",
      "source": "original"
    },
    {
      "zh": "我们成为了好朋友。",
      "en": "We became good friends.",
      "source": "original"
    }
  ],
  "1025": [
    {
      "zh": "他学习电脑技术。",
      "en": "He studies computer technology.",
      "source": "original"
    },
    {
      "zh": "这项技术很好。",
      "en": "This technology is good.",
      "source": "original"
    },
    {
      "zh": "我们需要学习新的技术。",
      "en": "We need to learn new technology.",
      "source": "original"
    }
  ],
  "1027": [
    {
      "zh": "他突然出现了。",
      "en": "He suddenly appeared.",
      "source": "original"
    },
    {
      "zh": "电脑出现了问题。",
      "en": "The computer developed a problem.",
      "source": "original"
    },
    {
      "zh": "这种情况经常出现。",
      "en": "This situation often occurs.",
      "source": "original"
    }
  ],
  "1028": [
    {
      "zh": "由于下雨，我们没去。",
      "en": "Because it rained, we didn't go.",
      "source": "original"
    },
    {
      "zh": "由于时间不够，他没有完成工作。",
      "en": "Because there wasn't enough time, he didn't finish the work.",
      "source": "original"
    },
    {
      "zh": "由于身体不好，她今天没来。",
      "en": "Because she was unwell, she didn't come today.",
      "source": "original"
    }
  ],
  "1030": [
    {
      "zh": "这方面我不太了解。",
      "en": "I don't know much about this area.",
      "source": "original"
    },
    {
      "zh": "他在这方面很有经验。",
      "en": "He is experienced in this area.",
      "source": "original"
    },
    {
      "zh": "我想了解工作方面的问题。",
      "en": "I want to understand work-related problems.",
      "source": "original"
    }
  ],
  "1032": [
    {
      "zh": "这个价格太高了。",
      "en": "This price is too high.",
      "source": "original"
    },
    {
      "zh": "水果的价格变了。",
      "en": "The price of fruit changed.",
      "source": "original"
    },
    {
      "zh": "我们需要了解价格。",
      "en": "We need to find out the price.",
      "source": "original"
    }
  ],
  "1033": [
    {
      "zh": "他正在研究这个问题。",
      "en": "He is studying this problem.",
      "source": "original"
    },
    {
      "zh": "我想研究中国文化。",
      "en": "I want to research Chinese culture.",
      "source": "original"
    },
    {
      "zh": "我们一起做研究。",
      "en": "We do research together.",
      "source": "original"
    }
  ],
  "1126": [
    {
      "zh": "他学习很积极。",
      "en": "He studies actively.",
      "source": "original"
    },
    {
      "zh": "大家都积极参加活动。",
      "en": "Everyone actively participates in the activity.",
      "source": "original"
    },
    {
      "zh": "她对工作很积极。",
      "en": "She is enthusiastic about work.",
      "source": "original"
    }
  ],
  "1306": [
    {
      "zh": "他的态度很好。",
      "en": "His attitude is good.",
      "source": "original"
    },
    {
      "zh": "我不喜欢他的态度。",
      "en": "I don't like his attitude.",
      "source": "original"
    },
    {
      "zh": "请改变你的态度。",
      "en": "Please change your attitude.",
      "source": "original"
    }
  ],
  "1992": [
    {
      "zh": "他在一家企业工作。",
      "en": "He works for a company.",
      "source": "original"
    },
    {
      "zh": "这家企业很大。",
      "en": "This company is large.",
      "source": "original"
    },
    {
      "zh": "企业需要管理好员工。",
      "en": "Companies need to manage employees well.",
      "source": "original"
    }
  ],
  "1998": [
    {
      "zh": "我们正在建设新学校。",
      "en": "We are building a new school.",
      "source": "original"
    },
    {
      "zh": "这座城市正在建设新的医院。",
      "en": "This city is building a new hospital.",
      "source": "original"
    },
    {
      "zh": "他们一起建设自己的家。",
      "en": "They build their own home together.",
      "source": "original"
    }
  ],
  "1999": [
    {
      "zh": "政府公布了这个消息。",
      "en": "The government announced this news.",
      "source": "original"
    },
    {
      "zh": "政府希望帮助大家。",
      "en": "The government hopes to help everyone.",
      "source": "original"
    },
    {
      "zh": "政府正在解决这个问题。",
      "en": "The government is working to solve this problem.",
      "source": "original"
    }
  ],
  "2000": [
    {
      "zh": "这个产品很好用。",
      "en": "This product is easy to use.",
      "source": "original"
    },
    {
      "zh": "我们公司生产这种产品。",
      "en": "Our company produces this kind of product.",
      "source": "original"
    },
    {
      "zh": "这个产品的价格很低。",
      "en": "This product's price is low.",
      "source": "original"
    }
  ],
  "2002": [
    {
      "zh": "这家公司生产汽车。",
      "en": "This company manufactures cars.",
      "source": "original"
    },
    {
      "zh": "他们生产很多产品。",
      "en": "They produce many products.",
      "source": "original"
    },
    {
      "zh": "我们需要生产更多的产品。",
      "en": "We need to produce more products.",
      "source": "original"
    }
  ],
  "2004": [
    {
      "zh": "我买了书以及衣服。",
      "en": "I bought books as well as clothes.",
      "source": "original"
    },
    {
      "zh": "他介绍了自己以及家人。",
      "en": "He introduced himself and his family.",
      "source": "original"
    },
    {
      "zh": "我们需要时间以及帮助。",
      "en": "We need time as well as help.",
      "source": "original"
    }
  ],
  "2005": [
    {
      "zh": "学校组织了一次活动。",
      "en": "The school organized an activity.",
      "source": "original"
    },
    {
      "zh": "他负责组织会议。",
      "en": "He is responsible for organizing the meeting.",
      "source": "original"
    },
    {
      "zh": "我们一起组织这个活动。",
      "en": "We organized this activity together.",
      "source": "original"
    }
  ],
  "2007": [
    {
      "zh": "这个项目很重要。",
      "en": "This project is important.",
      "source": "original"
    },
    {
      "zh": "我们正在做一个新项目。",
      "en": "We are working on a new project.",
      "source": "original"
    },
    {
      "zh": "他负责这个项目。",
      "en": "He is responsible for this project.",
      "source": "original"
    }
  ],
  "2010": [
    {
      "zh": "这个系统很好用。",
      "en": "This system is easy to use.",
      "source": "original"
    },
    {
      "zh": "我们需要一个新的系统。",
      "en": "We need a new system.",
      "source": "original"
    },
    {
      "zh": "这个系统出了问题。",
      "en": "There is a problem with this system.",
      "source": "original"
    }
  ],
  "2013": [
    {
      "zh": "价格包括早饭。",
      "en": "The price includes breakfast.",
      "source": "original"
    },
    {
      "zh": "这个活动包括三个部分。",
      "en": "This activity includes three parts.",
      "source": "original"
    },
    {
      "zh": "我们买的东西包括水果和衣服。",
      "en": "The things we bought include fruit and clothes.",
      "source": "original"
    }
  ],
  "2014": [
    {
      "zh": "他是公司的领导。",
      "en": "He is a leader at the company.",
      "source": "original"
    },
    {
      "zh": "她领导这个项目。",
      "en": "She leads this project.",
      "source": "original"
    },
    {
      "zh": "领导同意了我们的计划。",
      "en": "The leader agreed to our plan.",
      "source": "original"
    }
  ],
  "2015": [
    {
      "zh": "他实现了自己的目标。",
      "en": "He achieved his goal.",
      "source": "original"
    },
    {
      "zh": "我想实现我的梦想。",
      "en": "I want to realize my dream.",
      "source": "original"
    },
    {
      "zh": "这个计划很难实现。",
      "en": "This plan is difficult to carry out.",
      "source": "original"
    }
  ],
  "2016": [
    {
      "zh": "人数已超一百。",
      "en": "The number of people has exceeded one hundred.",
      "source": "original"
    },
    {
      "zh": "价格超了我们的计划。",
      "en": "The price exceeded our planned amount.",
      "source": "original"
    },
    {
      "zh": "时间已超十分钟。",
      "en": "The time has exceeded ten minutes.",
      "source": "original"
    }
  ],
  "2018": [
    {
      "zh": "这张桌子占了很多地方。",
      "en": "This table takes up a lot of space.",
      "source": "original"
    },
    {
      "zh": "他占了两个位置。",
      "en": "He took up two places.",
      "source": "original"
    },
    {
      "zh": "工作占了我很多时间。",
      "en": "Work takes up a lot of my time.",
      "source": "original"
    }
  ],
  "2020": [
    {
      "zh": "她设计了一件衣服。",
      "en": "She designed a piece of clothing.",
      "source": "original"
    },
    {
      "zh": "我们正在设计新产品。",
      "en": "We are designing a new product.",
      "source": "original"
    },
    {
      "zh": "我喜欢这个设计。",
      "en": "I like this design.",
      "source": "original"
    }
  ],
  "2021": [
    {
      "zh": "这个问题还存在。",
      "en": "This problem still exists.",
      "source": "original"
    },
    {
      "zh": "这种情况一直存在。",
      "en": "This situation has always existed.",
      "source": "original"
    },
    {
      "zh": "两个办法都存在问题。",
      "en": "Both methods have problems.",
      "source": "original"
    }
  ],
  "2022": [
    {
      "zh": "公司正在开发新产品。",
      "en": "The company is developing new products.",
      "source": "original"
    },
    {
      "zh": "我们计划开发这个项目。",
      "en": "We plan to develop this project.",
      "source": "original"
    },
    {
      "zh": "他们开发了一种新技术。",
      "en": "They developed a new technology.",
      "source": "original"
    }
  ],
  "2023": [
    {
      "zh": "他具有丰富的经验。",
      "en": "He has extensive experience.",
      "source": "original"
    },
    {
      "zh": "这个产品具有很多优点。",
      "en": "This product has many advantages.",
      "source": "original"
    },
    {
      "zh": "这项技术具有很大的价值。",
      "en": "This technology has great value.",
      "source": "original"
    }
  ],
  "2024": [
    {
      "zh": "他在市中心工作。",
      "en": "He works in the city center.",
      "source": "original"
    },
    {
      "zh": "这里是活动中心。",
      "en": "This is the activity center.",
      "source": "original"
    },
    {
      "zh": "学校在城市的中心。",
      "en": "The school is in the center of the city.",
      "source": "original"
    }
  ],
  "2026": [
    {
      "zh": "这是我的个人意见。",
      "en": "This is my personal opinion.",
      "source": "original"
    },
    {
      "zh": "请注意个人信息。",
      "en": "Please pay attention to personal information.",
      "source": "original"
    },
    {
      "zh": "他有自己的个人计划。",
      "en": "He has his own personal plan.",
      "source": "original"
    }
  ],
  "2027": [
    {
      "zh": "我们可以一起合作。",
      "en": "We can work together.",
      "source": "original"
    },
    {
      "zh": "两家公司开始合作。",
      "en": "The two companies began cooperating.",
      "source": "original"
    },
    {
      "zh": "谢谢你和我们合作。",
      "en": "Thank you for cooperating with us.",
      "source": "original"
    }
  ],
  "2028": [
    {
      "zh": "我方同意这个计划。",
      "en": "Our side agrees to this plan.",
      "source": "original",
      "verifiedTokens": [
        "我",
        "方",
        "同意",
        "这个",
        "计划"
      ]
    },
    {
      "zh": "哪一方先开始？",
      "en": "Which side starts first?",
      "source": "original",
      "verifiedTokens": [
        "哪",
        "一",
        "方",
        "先",
        "开始"
      ]
    }
  ],
  "2029": [
    {
      "zh": "他代表公司参加会议。",
      "en": "He represents the company at the meeting.",
      "source": "original"
    },
    {
      "zh": "我是学校的代表。",
      "en": "I am the school's representative.",
      "source": "original"
    },
    {
      "zh": "这个颜色代表什么？",
      "en": "What does this color represent?",
      "source": "original"
    }
  ],
  "2031": [
    {
      "zh": "请随我来。",
      "en": "Please follow me.",
      "source": "original",
      "verifiedTokens": [
        "请",
        "随",
        "我",
        "来"
      ]
    },
    {
      "zh": "他随大家一起走。",
      "en": "He went along with everyone.",
      "source": "original",
      "verifiedTokens": [
        "他",
        "随",
        "大家",
        "一起",
        "走"
      ]
    }
  ],
  "2033": [
    {
      "zh": "这是一个新的机构。",
      "en": "This is a new organization.",
      "source": "original"
    },
    {
      "zh": "他在这个机构工作。",
      "en": "He works at this institution.",
      "source": "original"
    },
    {
      "zh": "这个机构帮助了很多人。",
      "en": "This organization helped many people.",
      "source": "original"
    }
  ],
  "2034": [
    {
      "zh": "我们需要更多资金。",
      "en": "We need more funds.",
      "source": "original"
    },
    {
      "zh": "这个项目没有足够的资金。",
      "en": "This project does not have enough funding.",
      "source": "original"
    },
    {
      "zh": "公司正在准备资金。",
      "en": "The company is preparing funds.",
      "source": "original"
    }
  ],
  "2036": [
    {
      "zh": "他用力推门。",
      "en": "He pushed the door with force.",
      "source": "original",
      "verifiedTokens": [
        "他",
        "用",
        "力",
        "推",
        "门"
      ]
    },
    {
      "zh": "我一点儿力也没有了。",
      "en": "I have no strength left.",
      "source": "original",
      "verifiedTokens": [
        "我",
        "一点儿",
        "力",
        "也",
        "没有",
        "了"
      ]
    }
  ],
  "2058": [
    {
      "zh": "我来处理这个问题。",
      "en": "I'll handle this problem.",
      "source": "original",
      "verifiedTokens": [
        "我",
        "来",
        "处理",
        "这个",
        "问题"
      ]
    },
    {
      "zh": "他正在处理文件。",
      "en": "He is dealing with the documents.",
      "source": "original",
      "verifiedTokens": [
        "他",
        "正在",
        "处理",
        "文件"
      ]
    },
    {
      "zh": "我们需要先处理这件事。",
      "en": "We need to deal with this matter first.",
      "source": "original",
      "verifiedTokens": [
        "我们",
        "需要",
        "先",
        "处理",
        "这",
        "件",
        "事"
      ]
    }
  ],
  "2088": [
    {
      "zh": "她看一眼就明白了。",
      "en": "She understood at a glance.",
      "source": "original",
      "verifiedTokens": [
        "她",
        "看",
        "一",
        "眼",
        "就",
        "明白",
        "了"
      ]
    }
  ],
  "2101": [
    {
      "zh": "请把书放回原处。",
      "en": "Please put the book back where it was.",
      "source": "original",
      "verifiedTokens": [
        "请",
        "把",
        "书",
        "放",
        "回",
        "原",
        "处"
      ]
    },
    {
      "zh": "原计划已经改变了。",
      "en": "The original plan has changed.",
      "source": "original",
      "verifiedTokens": [
        "原",
        "计划",
        "已经",
        "改变",
        "了"
      ]
    }
  ],
  "2114": [
    {
      "zh": "你有权选择。",
      "en": "You have the right to choose.",
      "source": "original",
      "verifiedTokens": [
        "你",
        "有",
        "权",
        "选择"
      ]
    },
    {
      "zh": "我无权改变这个规定。",
      "en": "I have no right to change this rule.",
      "source": "original",
      "verifiedTokens": [
        "我",
        "无",
        "权",
        "改变",
        "这个",
        "规定"
      ]
    }
  ],
  "2115": [
    {
      "zh": "她亲了孩子一下。",
      "en": "She kissed the child.",
      "source": "original",
      "verifiedTokens": [
        "她",
        "亲",
        "了",
        "孩子",
        "一",
        "下"
      ]
    },
    {
      "zh": "妈妈亲了我一下。",
      "en": "Mum gave me a kiss.",
      "source": "original",
      "verifiedTokens": [
        "妈妈",
        "亲",
        "了",
        "我",
        "一",
        "下"
      ]
    },
    {
      "zh": "孩子亲了爸爸的脸。",
      "en": "The child kissed Dad's face.",
      "source": "original",
      "verifiedTokens": [
        "孩子",
        "亲",
        "了",
        "爸爸",
        "的",
        "脸"
      ]
    }
  ],
  "2131": [
    {
      "zh": "这个计划有风险。",
      "en": "This plan has risks.",
      "source": "original",
      "verifiedTokens": [
        "这个",
        "计划",
        "有",
        "风险"
      ]
    },
    {
      "zh": "我们要降低风险。",
      "en": "We need to reduce risk.",
      "source": "original",
      "verifiedTokens": [
        "我们",
        "要",
        "降低",
        "风险"
      ]
    }
  ],
  "2146": [
    {
      "zh": "双方都同意了。",
      "en": "Both sides agreed.",
      "source": "original",
      "verifiedTokens": [
        "双方",
        "都",
        "同意",
        "了"
      ]
    },
    {
      "zh": "双方正在讨论价格。",
      "en": "Both sides are discussing the price.",
      "source": "original",
      "verifiedTokens": [
        "双方",
        "正在",
        "讨论",
        "价格"
      ]
    },
    {
      "zh": "我们希望双方都满意。",
      "en": "We hope both sides are satisfied.",
      "source": "original",
      "verifiedTokens": [
        "我们",
        "希望",
        "双方",
        "都",
        "满意"
      ]
    }
  ],
  "2153": [
    {
      "zh": "请给我两支笔。",
      "en": "Please give me two pens.",
      "source": "original",
      "verifiedTokens": [
        "请",
        "给",
        "我",
        "两",
        "支",
        "笔"
      ]
    },
    {
      "zh": "这支笔是你的吗？",
      "en": "Is this pen yours?",
      "source": "original",
      "verifiedTokens": [
        "这",
        "支",
        "笔",
        "是",
        "你",
        "的",
        "吗"
      ]
    }
  ],
  "2157": [
    {
      "zh": "这是一团纸。",
      "en": "This is a ball of paper.",
      "source": "original",
      "verifiedTokens": [
        "这",
        "是",
        "一",
        "团",
        "纸"
      ]
    }
  ],
  "2160": [
    {
      "zh": "他把球投了出去。",
      "en": "He threw the ball.",
      "source": "original",
      "verifiedTokens": [
        "他",
        "把",
        "球",
        "投",
        "了",
        "出去"
      ]
    },
    {
      "zh": "请把信投进去。",
      "en": "Please drop the letter inside.",
      "source": "original",
      "verifiedTokens": [
        "请",
        "把",
        "信",
        "投",
        "进去"
      ]
    },
    {
      "zh": "我想投他一票。",
      "en": "I want to vote for him.",
      "source": "original",
      "verifiedTokens": [
        "我",
        "想",
        "投",
        "他",
        "一",
        "票"
      ]
    }
  ],
  "2163": [
    {
      "zh": "公司派他去中国。",
      "en": "The company sent him to China.",
      "source": "original",
      "verifiedTokens": [
        "公司",
        "派",
        "他",
        "去",
        "中国"
      ]
    },
    {
      "zh": "学校派老师来帮助我们。",
      "en": "The school sent a teacher to help us.",
      "source": "original",
      "verifiedTokens": [
        "学校",
        "派",
        "老师",
        "来",
        "帮助",
        "我们"
      ]
    },
    {
      "zh": "他们派人来接我。",
      "en": "They sent someone to pick me up.",
      "source": "original",
      "verifiedTokens": [
        "他们",
        "派",
        "人",
        "来",
        "接",
        "我"
      ]
    }
  ],
  "2169": [
    {
      "zh": "我代老师给大家解释。",
      "en": "I'll explain on the teacher's behalf.",
      "source": "original",
      "verifiedTokens": [
        "我",
        "代",
        "老师",
        "给",
        "大家",
        "解释"
      ]
    },
    {
      "zh": "他代父亲签了名。",
      "en": "He signed on his father's behalf.",
      "source": "original",
      "verifiedTokens": [
        "他",
        "代",
        "父亲",
        "签",
        "了",
        "名"
      ]
    }
  ],
  "2187": [
    {
      "zh": "我们要保大家平安。",
      "en": "We need to keep everyone safe.",
      "source": "original",
      "verifiedTokens": [
        "我们",
        "要",
        "保",
        "大家",
        "平安"
      ]
    }
  ],
  "2207": [
    {
      "zh": "中国的龙很有名。",
      "en": "Chinese dragons are famous.",
      "source": "original",
      "verifiedTokens": [
        "中国",
        "的",
        "龙",
        "很",
        "有名"
      ]
    },
    {
      "zh": "这张画上有一条龙。",
      "en": "There is a dragon in this picture.",
      "source": "original",
      "verifiedTokens": [
        "这",
        "张",
        "画",
        "上",
        "有",
        "一",
        "条",
        "龙"
      ]
    },
    {
      "zh": "孩子喜欢龙的故事。",
      "en": "The child likes stories about dragons.",
      "source": "original",
      "verifiedTokens": [
        "孩子",
        "喜欢",
        "龙",
        "的",
        "故事"
      ]
    }
  ],
  "2212": [
    {
      "zh": "这个月的量太少。",
      "en": "The quantity this month is too small.",
      "source": "original",
      "verifiedTokens": [
        "这个",
        "月",
        "的",
        "量",
        "太",
        "少"
      ]
    }
  ],
  "2219": [
    {
      "zh": "他们要建一所学校。",
      "en": "They want to build a school.",
      "source": "original",
      "verifiedTokens": [
        "他们",
        "要",
        "建",
        "一",
        "所",
        "学校"
      ]
    },
    {
      "zh": "我们想在这里建房子。",
      "en": "We want to build a house here.",
      "source": "original",
      "verifiedTokens": [
        "我们",
        "想",
        "在",
        "这里",
        "建",
        "房子"
      ]
    },
    {
      "zh": "这家公司建了一个新工厂。",
      "en": "This company built a new factory.",
      "source": "original",
      "verifiedTokens": [
        "这",
        "家",
        "公司",
        "建",
        "了",
        "一",
        "个",
        "新",
        "工厂"
      ]
    }
  ],
  "2242": [
    {
      "zh": "那名男子是老师。",
      "en": "That man is a teacher.",
      "source": "original",
      "verifiedTokens": [
        "那",
        "名",
        "男子",
        "是",
        "老师"
      ]
    },
    {
      "zh": "两名男子在门口等。",
      "en": "Two men are waiting at the entrance.",
      "source": "original",
      "verifiedTokens": [
        "两",
        "名",
        "男子",
        "在",
        "门口",
        "等"
      ]
    }
  ],
  "2243": [
    {
      "zh": "昨天发生了事故。",
      "en": "An accident happened yesterday.",
      "source": "original"
    },
    {
      "zh": "这次事故没有人受伤。",
      "en": "No one was hurt in this accident.",
      "source": "original"
    },
    {
      "zh": "我们需要了解事故的原因。",
      "en": "We need to understand the cause of the accident.",
      "source": "original"
    }
  ],
  "2244": [
    {
      "zh": "请看一下这份合同。",
      "en": "Please look at this contract.",
      "source": "original",
      "verifiedTokens": [
        "请",
        "看",
        "一下",
        "这",
        "份",
        "合同"
      ]
    },
    {
      "zh": "双方已经签了合同。",
      "en": "Both sides have signed the contract.",
      "source": "original",
      "verifiedTokens": [
        "双方",
        "已经",
        "签",
        "了",
        "合同"
      ]
    },
    {
      "zh": "这份合同很重要。",
      "en": "This contract is important.",
      "source": "original",
      "verifiedTokens": [
        "这",
        "份",
        "合同",
        "很",
        "重要"
      ]
    }
  ],
  "2248": [
    {
      "zh": "他抓住了我的手。",
      "en": "He grabbed my hand.",
      "source": "original",
      "verifiedTokens": [
        "他",
        "抓",
        "住",
        "了",
        "我",
        "的",
        "手"
      ]
    },
    {
      "zh": "孩子想抓那条鱼。",
      "en": "The child wants to catch that fish.",
      "source": "original",
      "verifiedTokens": [
        "孩子",
        "想",
        "抓",
        "那",
        "条",
        "鱼"
      ]
    },
    {
      "zh": "请抓紧我的手。",
      "en": "Please hold my hand tightly.",
      "source": "original",
      "verifiedTokens": [
        "请",
        "抓",
        "紧",
        "我",
        "的",
        "手"
      ]
    }
  ],
  "2257": [
    {
      "zh": "下雨时要防水。",
      "en": "Keep water out when it rains.",
      "source": "original",
      "verifiedTokens": [
        "下雨",
        "时",
        "要",
        "防",
        "水"
      ]
    },
    {
      "zh": "出门要注意防火。",
      "en": "Pay attention to fire prevention when going out.",
      "source": "original",
      "verifiedTokens": [
        "出门",
        "要",
        "注意",
        "防",
        "火"
      ]
    },
    {
      "zh": "这样做是为了防病。",
      "en": "This is done to prevent illness.",
      "source": "original",
      "verifiedTokens": [
        "这样",
        "做",
        "是",
        "为了",
        "防",
        "病"
      ]
    }
  ],
  "2274": [
    {
      "zh": "我想去欧洲旅行。",
      "en": "I want to travel to Europe.",
      "source": "original",
      "verifiedTokens": [
        "我",
        "想",
        "去",
        "欧洲",
        "旅行"
      ]
    },
    {
      "zh": "他在欧洲工作。",
      "en": "He works in Europe.",
      "source": "original",
      "verifiedTokens": [
        "他",
        "在",
        "欧洲",
        "工作"
      ]
    }
  ],
  "2302": [
    {
      "zh": "这些货物明天运走。",
      "en": "These goods will be transported away tomorrow.",
      "source": "original",
      "verifiedTokens": [
        "这些",
        "货物",
        "明天",
        "运",
        "走"
      ]
    },
    {
      "zh": "请把书运到学校。",
      "en": "Please transport the books to the school.",
      "source": "original",
      "verifiedTokens": [
        "请",
        "把",
        "书",
        "运",
        "到",
        "学校"
      ]
    }
  ],
  "2304": [
    {
      "zh": "我们应当尊重别人。",
      "en": "We should respect others.",
      "source": "original",
      "verifiedTokens": [
        "我们",
        "应当",
        "尊重",
        "别人"
      ]
    },
    {
      "zh": "大家应当遵守规定。",
      "en": "Everyone should follow the rules.",
      "source": "original",
      "verifiedTokens": [
        "大家",
        "应当",
        "遵守",
        "规定"
      ]
    }
  ],
  "2310": [
    {
      "zh": "他先到，我随后就到。",
      "en": "He arrives first, and I arrive soon after.",
      "source": "original",
      "verifiedTokens": [
        "他",
        "先",
        "到",
        "我",
        "随后",
        "就",
        "到"
      ]
    },
    {
      "zh": "会议结束，大家随后离开。",
      "en": "The meeting ended, and everyone left afterward.",
      "source": "original",
      "verifiedTokens": [
        "会议",
        "结束",
        "大家",
        "随后",
        "离开"
      ]
    }
  ],
  "2325": [
    {
      "zh": "请把书合上。",
      "en": "Please close the book.",
      "source": "original",
      "verifiedTokens": [
        "请",
        "把",
        "书",
        "合",
        "上"
      ]
    },
    {
      "zh": "他合上了眼睛。",
      "en": "He closed his eyes.",
      "source": "original",
      "verifiedTokens": [
        "他",
        "合",
        "上",
        "了",
        "眼睛"
      ]
    },
    {
      "zh": "门没有合上。",
      "en": "The door has not closed.",
      "source": "original",
      "verifiedTokens": [
        "门",
        "没有",
        "合",
        "上"
      ]
    }
  ],
  "2350": [
    {
      "zh": "这个地方产茶。",
      "en": "This place produces tea.",
      "source": "original",
      "verifiedTokens": [
        "这个",
        "地方",
        "产",
        "茶"
      ]
    },
    {
      "zh": "这里产水果。",
      "en": "Fruit is produced here.",
      "source": "original",
      "verifiedTokens": [
        "这里",
        "产",
        "水果"
      ]
    }
  ],
  "2374": [
    {
      "zh": "他们正在找住房。",
      "en": "They are looking for housing.",
      "source": "original",
      "verifiedTokens": [
        "他们",
        "正在",
        "找",
        "住房"
      ]
    },
    {
      "zh": "这里的住房很贵。",
      "en": "Housing here is expensive.",
      "source": "original",
      "verifiedTokens": [
        "这里",
        "的",
        "住房",
        "很",
        "贵"
      ]
    },
    {
      "zh": "公司为员工提供住房。",
      "en": "The company provides housing for employees.",
      "source": "original",
      "verifiedTokens": [
        "公司",
        "为",
        "员工",
        "提供",
        "住房"
      ]
    }
  ],
  "2385": [
    {
      "zh": "这件衣服配那条裤子很好看。",
      "en": "This shirt looks good with those trousers.",
      "source": "original",
      "verifiedTokens": [
        "这",
        "件",
        "衣服",
        "配",
        "那",
        "条",
        "裤子",
        "很",
        "好看"
      ]
    },
    {
      "zh": "这个菜配米饭很好。",
      "en": "This dish goes well with rice.",
      "source": "original",
      "verifiedTokens": [
        "这个",
        "菜",
        "配",
        "米饭",
        "很",
        "好"
      ]
    },
    {
      "zh": "红色配白色很漂亮。",
      "en": "Red goes well with white.",
      "source": "original",
      "verifiedTokens": [
        "红色",
        "配",
        "白色",
        "很",
        "漂亮"
      ]
    }
  ],
  "2406": [
    {
      "zh": "这是集体的决定。",
      "en": "This is a collective decision.",
      "source": "original",
      "verifiedTokens": [
        "这",
        "是",
        "集体",
        "的",
        "决定"
      ]
    },
    {
      "zh": "我们都是这个集体的一部分。",
      "en": "We are all part of this group.",
      "source": "original",
      "verifiedTokens": [
        "我们",
        "都",
        "是",
        "这个",
        "集体",
        "的",
        "一",
        "部分"
      ]
    }
  ],
  "2435": [
    {
      "zh": "他用水冲了一下手。",
      "en": "He rinsed his hands with water.",
      "source": "original",
      "verifiedTokens": [
        "他",
        "用",
        "水",
        "冲",
        "了",
        "一下",
        "手"
      ]
    },
    {
      "zh": "孩子冲向妈妈。",
      "en": "The child rushed toward Mum.",
      "source": "original",
      "verifiedTokens": [
        "孩子",
        "冲",
        "向",
        "妈妈"
      ]
    }
  ],
  "2445": [
    {
      "zh": "这个苹果是青的。",
      "en": "This apple is green.",
      "source": "original",
      "verifiedTokens": [
        "这",
        "个",
        "苹果",
        "是",
        "青",
        "的"
      ]
    },
    {
      "zh": "山上的草还青。",
      "en": "The grass on the mountain is still green.",
      "source": "original",
      "verifiedTokens": [
        "山",
        "上",
        "的",
        "草",
        "还",
        "青"
      ]
    }
  ],
  "2469": [
    {
      "zh": "我想退这件衣服。",
      "en": "I want to return this garment.",
      "source": "original",
      "verifiedTokens": [
        "我",
        "想",
        "退",
        "这",
        "件",
        "衣服"
      ]
    },
    {
      "zh": "这张票可以退吗？",
      "en": "Can this ticket be refunded?",
      "source": "original",
      "verifiedTokens": [
        "这",
        "张",
        "票",
        "可以",
        "退",
        "吗"
      ]
    }
  ],
  "2472": [
    {
      "zh": "这双鞋太紧了。",
      "en": "These shoes are too tight.",
      "source": "original",
      "verifiedTokens": [
        "这",
        "双",
        "鞋",
        "太",
        "紧",
        "了"
      ]
    },
    {
      "zh": "请抓紧我的手。",
      "en": "Please hold my hand tightly.",
      "source": "original",
      "verifiedTokens": [
        "请",
        "抓",
        "紧",
        "我",
        "的",
        "手"
      ]
    },
    {
      "zh": "裤子有点儿紧。",
      "en": "The trousers are a little tight.",
      "source": "original",
      "verifiedTokens": [
        "裤子",
        "有点儿",
        "紧"
      ]
    }
  ],
  "2499": [
    {
      "zh": "这个福字真好看。",
      "en": "This character for good fortune looks nice.",
      "source": "original",
      "verifiedTokens": [
        "这",
        "个",
        "福",
        "字",
        "真",
        "好看"
      ]
    },
    {
      "zh": "我们祝大家有福。",
      "en": "We wish everyone good fortune.",
      "source": "original",
      "verifiedTokens": [
        "我们",
        "祝",
        "大家",
        "有",
        "福"
      ]
    },
    {
      "zh": "过年时，他写了一个福字。",
      "en": "At New Year, he wrote the character for good fortune.",
      "source": "original",
      "verifiedTokens": [
        "过年",
        "时",
        "他",
        "写",
        "了",
        "一",
        "个",
        "福",
        "字"
      ]
    }
  ],
  "2540": [
    {
      "zh": "这个汤太淡了。",
      "en": "This soup is too bland.",
      "source": "original",
      "verifiedTokens": [
        "这个",
        "汤",
        "太",
        "淡",
        "了"
      ]
    },
    {
      "zh": "这个颜色很淡。",
      "en": "This color is very light.",
      "source": "original",
      "verifiedTokens": [
        "这",
        "个",
        "颜色",
        "很",
        "淡"
      ]
    }
  ],
  "2554": [
    {
      "zh": "他救了我的命。",
      "en": "He saved my life.",
      "source": "original",
      "verifiedTokens": [
        "他",
        "救",
        "了",
        "我",
        "的",
        "命"
      ]
    },
    {
      "zh": "这条命很重要。",
      "en": "This life is precious.",
      "source": "original",
      "verifiedTokens": [
        "这",
        "条",
        "命",
        "很",
        "重要"
      ]
    },
    {
      "zh": "他相信这是命。",
      "en": "He believes this is fate.",
      "source": "original",
      "verifiedTokens": [
        "他",
        "相信",
        "这",
        "是",
        "命"
      ]
    }
  ],
  "2555": [
    {
      "zh": "这些生物需要水。",
      "en": "These organisms need water.",
      "source": "original",
      "verifiedTokens": [
        "这些",
        "生物",
        "需要",
        "水"
      ]
    },
    {
      "zh": "他喜欢研究生物。",
      "en": "He likes studying living things.",
      "source": "original",
      "verifiedTokens": [
        "他",
        "喜欢",
        "研究",
        "生物"
      ]
    }
  ],
  "2570": [
    {
      "zh": "他从乡下来。",
      "en": "He comes from the countryside.",
      "source": "original",
      "verifiedTokens": [
        "他",
        "从",
        "乡",
        "下",
        "来"
      ]
    },
    {
      "zh": "我父亲住在乡下。",
      "en": "My father lives in the countryside.",
      "source": "original",
      "verifiedTokens": [
        "我",
        "父亲",
        "住",
        "在",
        "乡",
        "下"
      ]
    }
  ],
  "2589": [
    {
      "zh": "运动可以预防疾病。",
      "en": "Exercise can prevent disease.",
      "source": "original",
      "verifiedTokens": [
        "运动",
        "可以",
        "预防",
        "疾病"
      ]
    },
    {
      "zh": "我们要预防事故。",
      "en": "We need to prevent accidents.",
      "source": "original",
      "verifiedTokens": [
        "我们",
        "要",
        "预防",
        "事故"
      ]
    },
    {
      "zh": "多洗手有助于预防感冒。",
      "en": "Washing hands often helps prevent colds.",
      "source": "original",
      "verifiedTokens": [
        "多",
        "洗",
        "手",
        "有助于",
        "预防",
        "感冒"
      ]
    }
  ],
  "2596": [
    {
      "zh": "他是足球迷。",
      "en": "He is a football fan.",
      "source": "original",
      "verifiedTokens": [
        "他",
        "是",
        "足球",
        "迷"
      ]
    },
    {
      "zh": "我爸爸是电影迷。",
      "en": "My father is a movie fan.",
      "source": "original",
      "verifiedTokens": [
        "我",
        "爸爸",
        "是",
        "电影",
        "迷"
      ]
    },
    {
      "zh": "她是音乐迷。",
      "en": "She is a music fan.",
      "source": "original",
      "verifiedTokens": [
        "她",
        "是",
        "音乐",
        "迷"
      ]
    }
  ],
  "2627": [
    {
      "zh": "我在人群中找他。",
      "en": "I look for him in the crowd.",
      "source": "original",
      "verifiedTokens": [
        "我",
        "在",
        "人群",
        "中",
        "找",
        "他"
      ]
    }
  ],
  "2642": [
    {
      "zh": "我的腰有点儿疼。",
      "en": "My lower back hurts a little.",
      "source": "original",
      "verifiedTokens": [
        "我",
        "的",
        "腰",
        "有点儿",
        "疼"
      ]
    },
    {
      "zh": "她把手放在腰上。",
      "en": "She placed her hands on her waist.",
      "source": "original",
      "verifiedTokens": [
        "她",
        "把",
        "手",
        "放",
        "在",
        "腰",
        "上"
      ]
    },
    {
      "zh": "他运动时伤了腰。",
      "en": "He hurt his lower back while exercising.",
      "source": "original",
      "verifiedTokens": [
        "他",
        "运动",
        "时",
        "伤",
        "了",
        "腰"
      ]
    }
  ],
  "2648": [
    {
      "zh": "你凭什么这么说？",
      "en": "On what grounds do you say that?",
      "source": "original",
      "verifiedTokens": [
        "你",
        "凭",
        "什么",
        "这么",
        "说"
      ]
    },
    {
      "zh": "我们凭票进入。",
      "en": "We enter using a ticket.",
      "source": "original",
      "verifiedTokens": [
        "我们",
        "凭",
        "票",
        "进入"
      ]
    }
  ],
  "2740": [
    {
      "zh": "一阵风吹过来。",
      "en": "A gust of wind blew over.",
      "source": "original",
      "verifiedTokens": [
        "一",
        "阵",
        "风",
        "吹",
        "过来"
      ]
    }
  ],
  "2760": [
    {
      "zh": "他摇了摇头。",
      "en": "He shook his head.",
      "source": "original",
      "verifiedTokens": [
        "他",
        "摇",
        "了",
        "摇",
        "头"
      ]
    },
    {
      "zh": "她摇手说不。",
      "en": "She waved her hand and said no.",
      "source": "original",
      "verifiedTokens": [
        "她",
        "摇",
        "手",
        "说",
        "不"
      ]
    },
    {
      "zh": "请不要摇这个桌子。",
      "en": "Please do not shake this table.",
      "source": "original",
      "verifiedTokens": [
        "请",
        "不要",
        "摇",
        "这个",
        "桌子"
      ]
    }
  ],
  "2763": [
    {
      "zh": "他忍着痛继续工作。",
      "en": "He endured the pain and kept working.",
      "source": "original",
      "verifiedTokens": [
        "他",
        "忍",
        "着",
        "痛",
        "继续",
        "工作"
      ]
    },
    {
      "zh": "她忍了很久。",
      "en": "She endured it for a long time.",
      "source": "original",
      "verifiedTokens": [
        "她",
        "忍",
        "了",
        "很",
        "久"
      ]
    }
  ],
  "2786": [
    {
      "zh": "两辆车撞在一起。",
      "en": "Two cars collided.",
      "source": "original",
      "verifiedTokens": [
        "两",
        "辆",
        "车",
        "撞",
        "在",
        "一起"
      ]
    },
    {
      "zh": "请小心，别撞到人。",
      "en": "Be careful not to bump into anyone.",
      "source": "original",
      "verifiedTokens": [
        "请",
        "小心",
        "别",
        "撞",
        "到",
        "人"
      ]
    }
  ],
  "2793": [
    {
      "zh": "未来有无限的可能。",
      "en": "The future has unlimited possibilities.",
      "source": "original",
      "verifiedTokens": [
        "未来",
        "有",
        "无限",
        "的",
        "可能"
      ]
    }
  ],
  "2801": [
    {
      "zh": "他守在门口。",
      "en": "He keeps watch at the entrance.",
      "source": "original",
      "verifiedTokens": [
        "他",
        "守",
        "在",
        "门口"
      ]
    },
    {
      "zh": "妈妈守着孩子。",
      "en": "Mum watches over the child.",
      "source": "original",
      "verifiedTokens": [
        "妈妈",
        "守",
        "着",
        "孩子"
      ]
    },
    {
      "zh": "请在这里守一会儿。",
      "en": "Please keep watch here for a while.",
      "source": "original",
      "verifiedTokens": [
        "请",
        "在",
        "这里",
        "守",
        "一会儿"
      ]
    }
  ],
  "2811": [
    {
      "zh": "请在这里签名。",
      "en": "Please sign your name here.",
      "source": "original",
      "verifiedTokens": [
        "请",
        "在",
        "这里",
        "签",
        "名"
      ]
    },
    {
      "zh": "我们昨天签了合同。",
      "en": "We signed the contract yesterday.",
      "source": "original",
      "verifiedTokens": [
        "我们",
        "昨天",
        "签",
        "了",
        "合同"
      ]
    }
  ],
  "2812": [
    {
      "zh": "球滚到桌子下面。",
      "en": "The ball rolled under the table.",
      "source": "original",
      "verifiedTokens": [
        "球",
        "滚",
        "到",
        "桌子",
        "下面"
      ]
    },
    {
      "zh": "石头从山上滚下来。",
      "en": "A rock rolled down the mountain.",
      "source": "original",
      "verifiedTokens": [
        "石头",
        "从",
        "山",
        "上",
        "滚",
        "下来"
      ]
    }
  ],
  "2814": [
    {
      "zh": "他把种子放进土里。",
      "en": "He put the seeds into the soil.",
      "source": "original",
      "verifiedTokens": [
        "他",
        "把",
        "种子",
        "放",
        "进",
        "土",
        "里"
      ]
    },
    {
      "zh": "种子需要水。",
      "en": "Seeds need water.",
      "source": "original",
      "verifiedTokens": [
        "种子",
        "需要",
        "水"
      ]
    }
  ],
  "2828": [
    {
      "zh": "他把椅子移开了。",
      "en": "He moved the chair away.",
      "source": "original",
      "verifiedTokens": [
        "他",
        "把",
        "椅子",
        "移",
        "开",
        "了"
      ]
    }
  ],
  "2838": [
    {
      "zh": "你违反了规定。",
      "en": "You broke the rules.",
      "source": "original",
      "verifiedTokens": [
        "你",
        "违反",
        "了",
        "规定"
      ]
    },
    {
      "zh": "我们不应当违反法律。",
      "en": "We should not break the law.",
      "source": "original",
      "verifiedTokens": [
        "我们",
        "不",
        "应当",
        "违反",
        "法律"
      ]
    },
    {
      "zh": "他因为违反规定被罚款。",
      "en": "He was fined for breaking the rules.",
      "source": "original",
      "verifiedTokens": [
        "他",
        "因为",
        "违反",
        "规定",
        "被",
        "罚款"
      ]
    }
  ],
  "2850": [
    {
      "zh": "今天的天空很蓝。",
      "en": "The sky is very blue today.",
      "source": "original",
      "verifiedTokens": [
        "今天",
        "的",
        "天空",
        "很",
        "蓝"
      ]
    },
    {
      "zh": "我喜欢看天空。",
      "en": "I like looking at the sky.",
      "source": "original",
      "verifiedTokens": [
        "我",
        "喜欢",
        "看",
        "天空"
      ]
    }
  ],
  "2884": [
    {
      "zh": "我们去机场迎接客人。",
      "en": "We are going to the airport to welcome guests.",
      "source": "original",
      "verifiedTokens": [
        "我们",
        "去",
        "机场",
        "迎接",
        "客人"
      ]
    },
    {
      "zh": "大家在门口迎接他。",
      "en": "Everyone is welcoming him at the entrance.",
      "source": "original",
      "verifiedTokens": [
        "大家",
        "在",
        "门口",
        "迎接",
        "他"
      ]
    },
    {
      "zh": "我们一起迎接新的一年。",
      "en": "We welcome the new year together.",
      "source": "original",
      "verifiedTokens": [
        "我们",
        "一起",
        "迎接",
        "新",
        "的",
        "一",
        "年"
      ]
    }
  ],
  "2887": [
    {
      "zh": "昨天发生了地震。",
      "en": "There was an earthquake yesterday.",
      "source": "original",
      "verifiedTokens": [
        "昨天",
        "发生",
        "了",
        "地震"
      ]
    },
    {
      "zh": "地震时要保持冷静。",
      "en": "Stay calm during an earthquake.",
      "source": "original",
      "verifiedTokens": [
        "地震",
        "时",
        "要",
        "保持",
        "冷静"
      ]
    },
    {
      "zh": "这次地震很严重。",
      "en": "This earthquake was serious.",
      "source": "original",
      "verifiedTokens": [
        "这",
        "次",
        "地震",
        "很",
        "严重"
      ]
    }
  ],
  "2889": [
    {
      "zh": "列车已经到达。",
      "en": "The train has arrived.",
      "source": "original",
      "verifiedTokens": [
        "列车",
        "已经",
        "到达"
      ]
    }
  ],
  "2899": [
    {
      "zh": "狗咬了他的手。",
      "en": "A dog bit his hand.",
      "source": "original",
      "verifiedTokens": [
        "狗",
        "咬",
        "了",
        "他",
        "的",
        "手"
      ]
    },
    {
      "zh": "请不要咬我。",
      "en": "Please don't bite me.",
      "source": "original",
      "verifiedTokens": [
        "请",
        "不要",
        "咬",
        "我"
      ]
    },
    {
      "zh": "她咬了一口苹果。",
      "en": "She took a bite of the apple.",
      "source": "original",
      "verifiedTokens": [
        "她",
        "咬",
        "了",
        "一",
        "口",
        "苹果"
      ]
    }
  ],
  "2902": [
    {
      "zh": "他正在拆信。",
      "en": "He is opening a letter.",
      "source": "original",
      "verifiedTokens": [
        "他",
        "正在",
        "拆",
        "信"
      ]
    },
    {
      "zh": "请把这个箱子拆开。",
      "en": "Please open this box.",
      "source": "original",
      "verifiedTokens": [
        "请",
        "把",
        "这个",
        "箱子",
        "拆",
        "开"
      ]
    },
    {
      "zh": "这座旧房子要拆了。",
      "en": "This old house is going to be demolished.",
      "source": "original",
      "verifiedTokens": [
        "这",
        "座",
        "旧",
        "房子",
        "要",
        "拆",
        "了"
      ]
    }
  ],
  "2910": [
    {
      "zh": "他向我挥了挥手。",
      "en": "He waved at me.",
      "source": "original",
      "verifiedTokens": [
        "他",
        "向",
        "我",
        "挥",
        "了",
        "挥",
        "手"
      ]
    },
    {
      "zh": "她挥手说再见。",
      "en": "She waved goodbye.",
      "source": "original",
      "verifiedTokens": [
        "她",
        "挥",
        "手",
        "说",
        "再见"
      ]
    },
    {
      "zh": "孩子高兴地挥着手。",
      "en": "The child waved happily.",
      "source": "original",
      "verifiedTokens": [
        "孩子",
        "高兴",
        "地",
        "挥",
        "着",
        "手"
      ]
    }
  ],
  "2929": [
    {
      "zh": "请给我两个电池。",
      "en": "Please give me two batteries.",
      "source": "original",
      "verifiedTokens": [
        "请",
        "给",
        "我",
        "两",
        "个",
        "电池"
      ]
    }
  ],
  "2942": [
    {
      "zh": "我们绕过这座山。",
      "en": "We went around this mountain.",
      "source": "original",
      "verifiedTokens": [
        "我们",
        "绕",
        "过",
        "这",
        "座",
        "山"
      ]
    },
    {
      "zh": "他绕着学校跑。",
      "en": "He runs around the school.",
      "source": "original",
      "verifiedTokens": [
        "他",
        "绕",
        "着",
        "学校",
        "跑"
      ]
    },
    {
      "zh": "请绕到房子后面。",
      "en": "Please go around to the back of the house.",
      "source": "original",
      "verifiedTokens": [
        "请",
        "绕",
        "到",
        "房子",
        "后面"
      ]
    }
  ],
  "2983": [
    {
      "zh": "我喜欢学地理。",
      "en": "I like studying geography.",
      "source": "original",
      "verifiedTokens": [
        "我",
        "喜欢",
        "学",
        "地理"
      ]
    },
    {
      "zh": "他是地理老师。",
      "en": "He is a geography teacher.",
      "source": "original",
      "verifiedTokens": [
        "他",
        "是",
        "地理",
        "老师"
      ]
    },
    {
      "zh": "这本地理书很有意思。",
      "en": "This geography book is interesting.",
      "source": "original",
      "verifiedTokens": [
        "这",
        "本",
        "地理",
        "书",
        "很",
        "有意思"
      ]
    }
  ],
  "2992": [
    {
      "zh": "他被罚款了。",
      "en": "He was fined.",
      "source": "original",
      "verifiedTokens": [
        "他",
        "被",
        "罚款",
        "了"
      ]
    },
    {
      "zh": "违反规定可能会被罚款。",
      "en": "Breaking the rules may result in a fine.",
      "source": "original",
      "verifiedTokens": [
        "违反",
        "规定",
        "可能",
        "会",
        "被",
        "罚款"
      ]
    }
  ],
  "2995": [
    {
      "zh": "我认得他。",
      "en": "I recognize him.",
      "source": "original",
      "verifiedTokens": [
        "我",
        "认",
        "得",
        "他"
      ]
    },
    {
      "zh": "你认得这个字吗？",
      "en": "Do you recognize this character?",
      "source": "original",
      "verifiedTokens": [
        "你",
        "认",
        "得",
        "这",
        "个",
        "字",
        "吗"
      ]
    }
  ],
  "3011": [
    {
      "zh": "她喜欢买名牌衣服。",
      "en": "She likes buying designer clothes.",
      "source": "original",
      "verifiedTokens": [
        "她",
        "喜欢",
        "买",
        "名牌",
        "衣服"
      ]
    },
    {
      "zh": "这个名牌很贵。",
      "en": "This famous brand is expensive.",
      "source": "original",
      "verifiedTokens": [
        "这",
        "个",
        "名牌",
        "很",
        "贵"
      ]
    }
  ],
  "3019": [
    {
      "zh": "这个池里有鱼。",
      "en": "There are fish in this pond.",
      "source": "original",
      "verifiedTokens": [
        "这",
        "个",
        "池",
        "里",
        "有",
        "鱼"
      ]
    },
    {
      "zh": "水从池里流出来。",
      "en": "Water flows out of the pool.",
      "source": "original",
      "verifiedTokens": [
        "水",
        "从",
        "池",
        "里",
        "流",
        "出来"
      ]
    },
    {
      "zh": "这个池很深。",
      "en": "This pool is deep.",
      "source": "original",
      "verifiedTokens": [
        "这个",
        "池",
        "很",
        "深"
      ]
    }
  ],
  "3031": [
    {
      "zh": "妈妈在炸鱼。",
      "en": "Mum is frying fish.",
      "source": "original",
      "verifiedTokens": [
        "妈妈",
        "在",
        "炸",
        "鱼"
      ]
    },
    {
      "zh": "他喜欢吃炸鸡。",
      "en": "He likes fried chicken.",
      "source": "original",
      "verifiedTokens": [
        "他",
        "喜欢",
        "吃",
        "炸",
        "鸡"
      ]
    },
    {
      "zh": "这个菜要用油炸。",
      "en": "This dish needs to be fried in oil.",
      "source": "original",
      "verifiedTokens": [
        "这",
        "个",
        "菜",
        "要",
        "用",
        "油",
        "炸"
      ]
    }
  ],
  "3033": [
    {
      "zh": "我看见一条蛇。",
      "en": "I saw a snake.",
      "source": "original",
      "verifiedTokens": [
        "我",
        "看见",
        "一",
        "条",
        "蛇"
      ]
    },
    {
      "zh": "他很怕蛇。",
      "en": "He is very afraid of snakes.",
      "source": "original",
      "verifiedTokens": [
        "他",
        "很",
        "怕",
        "蛇"
      ]
    },
    {
      "zh": "这条蛇很长。",
      "en": "This snake is long.",
      "source": "original",
      "verifiedTokens": [
        "这",
        "条",
        "蛇",
        "很",
        "长"
      ]
    }
  ],
  "3070": [
    {
      "zh": "我们明天运货物。",
      "en": "We will transport the goods tomorrow.",
      "source": "original",
      "verifiedTokens": [
        "我们",
        "明天",
        "运",
        "货物"
      ]
    },
    {
      "zh": "请检查这些货物。",
      "en": "Please inspect these goods.",
      "source": "original",
      "verifiedTokens": [
        "请",
        "检查",
        "这些",
        "货物"
      ]
    }
  ],
  "3072": [
    {
      "zh": "请给我一盆水。",
      "en": "Please give me a basin of water.",
      "source": "original",
      "verifiedTokens": [
        "请",
        "给",
        "我",
        "一",
        "盆",
        "水"
      ]
    },
    {
      "zh": "这个盆太小了。",
      "en": "This basin is too small.",
      "source": "original",
      "verifiedTokens": [
        "这",
        "个",
        "盆",
        "太",
        "小",
        "了"
      ]
    }
  ],
  "3076": [
    {
      "zh": "这个湖的深度是十米。",
      "en": "The depth of this lake is ten meters.",
      "source": "original",
      "verifiedTokens": [
        "这个",
        "湖",
        "的",
        "深度",
        "是",
        "十",
        "米"
      ]
    },
    {
      "zh": "这本书有一定的深度。",
      "en": "This book has a certain depth.",
      "source": "original",
      "verifiedTokens": [
        "这",
        "本",
        "书",
        "有",
        "一定",
        "的",
        "深度"
      ]
    }
  ],
  "3084": [
    {
      "zh": "大家要遵守规定。",
      "en": "Everyone must follow the rules.",
      "source": "original",
      "verifiedTokens": [
        "大家",
        "要",
        "遵守",
        "规定"
      ]
    },
    {
      "zh": "我们应当遵守法律。",
      "en": "We should obey the law.",
      "source": "original",
      "verifiedTokens": [
        "我们",
        "应当",
        "遵守",
        "法律"
      ]
    },
    {
      "zh": "他没有遵守合同。",
      "en": "He did not comply with the contract.",
      "source": "original",
      "verifiedTokens": [
        "他",
        "没有",
        "遵守",
        "合同"
      ]
    }
  ],
  "3153": [
    {
      "zh": "我想去博物馆。",
      "en": "I want to visit the museum.",
      "source": "original",
      "verifiedTokens": [
        "我",
        "想",
        "去",
        "博物馆"
      ]
    },
    {
      "zh": "这个博物馆很大。",
      "en": "This museum is large.",
      "source": "original",
      "verifiedTokens": [
        "这个",
        "博物馆",
        "很",
        "大"
      ]
    },
    {
      "zh": "我们明天参观博物馆。",
      "en": "We will visit the museum tomorrow.",
      "source": "original",
      "verifiedTokens": [
        "我们",
        "明天",
        "参观",
        "博物馆"
      ]
    }
  ],
  "3158": [
    {
      "zh": "我很想念我的亲人。",
      "en": "I miss my family very much.",
      "source": "original",
      "verifiedTokens": [
        "我",
        "很",
        "想念",
        "我",
        "的",
        "亲人"
      ]
    },
    {
      "zh": "他和亲人住在一起。",
      "en": "He lives with his relatives.",
      "source": "original",
      "verifiedTokens": [
        "他",
        "和",
        "亲人",
        "住",
        "在",
        "一起"
      ]
    },
    {
      "zh": "我们要多关心亲人。",
      "en": "We should care more about our loved ones.",
      "source": "original",
      "verifiedTokens": [
        "我们",
        "要",
        "多",
        "关心",
        "亲人"
      ]
    }
  ],
  "3169": [
    {
      "zh": "运动的乐趣很多。",
      "en": "Exercise offers a lot of enjoyment.",
      "source": "original",
      "verifiedTokens": [
        "运动",
        "的",
        "乐趣",
        "很",
        "多"
      ]
    }
  ],
  "3196": [
    {
      "zh": "请伸出你的手。",
      "en": "Please stretch out your hand.",
      "source": "original",
      "verifiedTokens": [
        "请",
        "伸",
        "出",
        "你",
        "的",
        "手"
      ]
    },
    {
      "zh": "他伸了伸腿。",
      "en": "He stretched his legs.",
      "source": "original",
      "verifiedTokens": [
        "他",
        "伸",
        "了",
        "伸",
        "腿"
      ]
    }
  ],
  "3217": [
    {
      "zh": "他业余时间学汉语。",
      "en": "He studies Chinese in his spare time.",
      "source": "original",
      "verifiedTokens": [
        "他",
        "业余",
        "时间",
        "学",
        "汉语"
      ]
    },
    {
      "zh": "我的业余生活很丰富。",
      "en": "My life outside work is rich.",
      "source": "original",
      "verifiedTokens": [
        "我",
        "的",
        "业余",
        "生活",
        "很",
        "丰富"
      ]
    },
    {
      "zh": "她是业余运动员。",
      "en": "She is an amateur athlete.",
      "source": "original",
      "verifiedTokens": [
        "她",
        "是",
        "业余",
        "运动员"
      ]
    }
  ],
  "3222": [
    {
      "zh": "开幕式明天开始。",
      "en": "The opening ceremony starts tomorrow.",
      "source": "original",
      "verifiedTokens": [
        "开幕式",
        "明天",
        "开始"
      ]
    },
    {
      "zh": "我们一起参加开幕式。",
      "en": "We attend the opening ceremony together.",
      "source": "original",
      "verifiedTokens": [
        "我们",
        "一起",
        "参加",
        "开幕式"
      ]
    },
    {
      "zh": "他在开幕式上发言。",
      "en": "He spoke at the opening ceremony.",
      "source": "original",
      "verifiedTokens": [
        "他",
        "在",
        "开幕式",
        "上",
        "发言"
      ]
    }
  ],
  "3240": [
    {
      "zh": "我们去摘苹果。",
      "en": "We are going to pick apples.",
      "source": "original",
      "verifiedTokens": [
        "我们",
        "去",
        "摘",
        "苹果"
      ]
    },
    {
      "zh": "她摘了一些花。",
      "en": "She picked some flowers.",
      "source": "original",
      "verifiedTokens": [
        "她",
        "摘",
        "了",
        "一些",
        "花"
      ]
    },
    {
      "zh": "请摘下你的帽子。",
      "en": "Please take off your hat.",
      "source": "original",
      "verifiedTokens": [
        "请",
        "摘",
        "下",
        "你",
        "的",
        "帽子"
      ]
    }
  ],
  "3256": [
    {
      "zh": "他的泪水流了下来。",
      "en": "His tears flowed down.",
      "source": "original",
      "verifiedTokens": [
        "他",
        "的",
        "泪水",
        "流",
        "了",
        "下来"
      ]
    }
  ],
  "3282": [
    {
      "zh": "我太太是老师。",
      "en": "My wife is a teacher.",
      "source": "original",
      "verifiedTokens": [
        "我",
        "太太",
        "是",
        "老师"
      ]
    },
    {
      "zh": "他和太太去旅行。",
      "en": "He and his wife went traveling.",
      "source": "original",
      "verifiedTokens": [
        "他",
        "和",
        "太太",
        "去",
        "旅行"
      ]
    },
    {
      "zh": "你太太在哪里工作？",
      "en": "Where does your wife work?",
      "source": "original",
      "verifiedTokens": [
        "你",
        "太太",
        "在",
        "哪里",
        "工作"
      ]
    }
  ],
  "3285": [
    {
      "zh": "他送我一束花。",
      "en": "He gave me a bouquet of flowers.",
      "source": "original",
      "verifiedTokens": [
        "他",
        "送",
        "我",
        "一",
        "束",
        "花"
      ]
    }
  ],
  "3287": [
    {
      "zh": "因为暴雨，我们没有出门。",
      "en": "Because of the rainstorm, we stayed in.",
      "source": "original",
      "verifiedTokens": [
        "因为",
        "暴雨",
        "我们",
        "没有",
        "出门"
      ]
    }
  ],
  "3301": [
    {
      "zh": "我想去赏花。",
      "en": "I want to go admire the flowers.",
      "source": "original",
      "verifiedTokens": [
        "我",
        "想",
        "去",
        "赏",
        "花"
      ]
    },
    {
      "zh": "大家一起赏月。",
      "en": "Everyone admires the moon together.",
      "source": "original",
      "verifiedTokens": [
        "大家",
        "一起",
        "赏",
        "月"
      ]
    }
  ],
  "3321": [
    {
      "zh": "请给我留言。",
      "en": "Please leave me a message.",
      "source": "original",
      "verifiedTokens": [
        "请",
        "给",
        "我",
        "留言"
      ]
    },
    {
      "zh": "他在网上留言。",
      "en": "He left a comment online.",
      "source": "original",
      "verifiedTokens": [
        "他",
        "在",
        "网上",
        "留言"
      ]
    }
  ],
  "3331": [
    {
      "zh": "小心，别把汤洒了。",
      "en": "Be careful not to spill the soup.",
      "source": "original",
      "verifiedTokens": [
        "小心",
        "别",
        "把",
        "汤",
        "洒",
        "了"
      ]
    }
  ],
  "3359": [
    {
      "zh": "花上有一只蝴蝶。",
      "en": "There is a butterfly on the flower.",
      "source": "original",
      "verifiedTokens": [
        "花",
        "上",
        "有",
        "一",
        "只",
        "蝴蝶"
      ]
    },
    {
      "zh": "孩子看见了一只蝴蝶。",
      "en": "The child saw a butterfly.",
      "source": "original",
      "verifiedTokens": [
        "孩子",
        "看见",
        "了",
        "一",
        "只",
        "蝴蝶"
      ]
    },
    {
      "zh": "这只蝴蝶很漂亮。",
      "en": "This butterfly is very beautiful.",
      "source": "original",
      "verifiedTokens": [
        "这",
        "只",
        "蝴蝶",
        "很",
        "漂亮"
      ]
    }
  ],
  "3379": [
    {
      "zh": "他刚刚进入职场。",
      "en": "He has just entered the workforce.",
      "source": "original",
      "verifiedTokens": [
        "他",
        "刚刚",
        "进入",
        "职场"
      ]
    },
    {
      "zh": "在职场中，沟通很重要。",
      "en": "Communication is important in the workplace.",
      "source": "original",
      "verifiedTokens": [
        "在",
        "职场",
        "中",
        "沟通",
        "很",
        "重要"
      ]
    }
  ],
  "3399": [
    {
      "zh": "这篇文章的标题很长。",
      "en": "The title of this article is long.",
      "source": "original",
      "verifiedTokens": [
        "这",
        "篇",
        "文章",
        "的",
        "标题",
        "很",
        "长"
      ]
    },
    {
      "zh": "请写上标题。",
      "en": "Please write the title.",
      "source": "original",
      "verifiedTokens": [
        "请",
        "写",
        "上",
        "标题"
      ]
    },
    {
      "zh": "我喜欢这个标题。",
      "en": "I like this title.",
      "source": "original",
      "verifiedTokens": [
        "我",
        "喜欢",
        "这个",
        "标题"
      ]
    }
  ],
  "3406": [
    {
      "zh": "这张邮票很漂亮。",
      "en": "This stamp is beautiful.",
      "source": "original",
      "verifiedTokens": [
        "这",
        "张",
        "邮票",
        "很",
        "漂亮"
      ]
    },
    {
      "zh": "他喜欢收集邮票。",
      "en": "He likes collecting stamps.",
      "source": "original",
      "verifiedTokens": [
        "他",
        "喜欢",
        "收集",
        "邮票"
      ]
    }
  ],
  "3415": [
    {
      "zh": "我喜欢喝开水。",
      "en": "I like drinking boiled water.",
      "source": "original",
      "verifiedTokens": [
        "我",
        "喜欢",
        "喝",
        "开水"
      ]
    },
    {
      "zh": "开水太热，小心。",
      "en": "The boiled water is too hot, be careful.",
      "source": "original",
      "verifiedTokens": [
        "开水",
        "太",
        "热",
        "小心"
      ]
    }
  ],
  "3424": [
    {
      "zh": "我喜欢和家人过除夕。",
      "en": "I like spending Lunar New Year's Eve with family.",
      "source": "original",
      "verifiedTokens": [
        "我",
        "喜欢",
        "和",
        "家人",
        "过",
        "除夕"
      ]
    }
  ],
  "3469": [
    {
      "zh": "这个气球是红色的。",
      "en": "This balloon is red.",
      "source": "original",
      "verifiedTokens": [
        "这",
        "个",
        "气球",
        "是",
        "红色",
        "的"
      ]
    },
    {
      "zh": "气球飞走了。",
      "en": "The balloon flew away.",
      "source": "original",
      "verifiedTokens": [
        "气球",
        "飞",
        "走",
        "了"
      ]
    }
  ],
  "3482": [
    {
      "zh": "请借我一把剪刀。",
      "en": "Please lend me a pair of scissors.",
      "source": "original",
      "verifiedTokens": [
        "请",
        "借",
        "我",
        "一",
        "把",
        "剪刀"
      ]
    },
    {
      "zh": "剪刀在桌子上。",
      "en": "The scissors are on the table.",
      "source": "original",
      "verifiedTokens": [
        "剪刀",
        "在",
        "桌子",
        "上"
      ]
    }
  ],
  "3484": [
    {
      "zh": "他住在这条胡同里。",
      "en": "He lives in this alley.",
      "source": "original",
      "verifiedTokens": [
        "他",
        "住",
        "在",
        "这",
        "条",
        "胡同",
        "里"
      ]
    }
  ],
  "3494": [
    {
      "zh": "请把信放进信封。",
      "en": "Please put the letter in the envelope.",
      "source": "original",
      "verifiedTokens": [
        "请",
        "把",
        "信",
        "放",
        "进",
        "信封"
      ]
    },
    {
      "zh": "我需要一个信封。",
      "en": "I need an envelope.",
      "source": "original",
      "verifiedTokens": [
        "我",
        "需要",
        "一",
        "个",
        "信封"
      ]
    },
    {
      "zh": "信封上有我的名字。",
      "en": "My name is on the envelope.",
      "source": "original",
      "verifiedTokens": [
        "信封",
        "上",
        "有",
        "我",
        "的",
        "名字"
      ]
    }
  ],
  "3500": [
    {
      "zh": "他的人际关系很好。",
      "en": "He has good interpersonal relationships.",
      "source": "original",
      "verifiedTokens": [
        "他",
        "的",
        "人际",
        "关系",
        "很",
        "好"
      ]
    },
    {
      "zh": "人际关系对工作很重要。",
      "en": "Interpersonal relationships are important at work.",
      "source": "original",
      "verifiedTokens": [
        "人际",
        "关系",
        "对",
        "工作",
        "很",
        "重要"
      ]
    },
    {
      "zh": "我们学习人际沟通。",
      "en": "We learn interpersonal communication.",
      "source": "original",
      "verifiedTokens": [
        "我们",
        "学习",
        "人际",
        "沟通"
      ]
    }
  ],
  "3502": [
    {
      "zh": "先了解问题的轻重。",
      "en": "First understand the severity of the problem.",
      "source": "original",
      "verifiedTokens": [
        "先",
        "了解",
        "问题",
        "的",
        "轻重"
      ]
    },
    {
      "zh": "医生根据病情的轻重作出决定。",
      "en": "The doctor decides based on the severity of the condition.",
      "source": "original",
      "verifiedTokens": [
        "医生",
        "根据",
        "病情",
        "的",
        "轻重",
        "作出",
        "决定"
      ]
    }
  ],
  "3507": [
    {
      "zh": "你有驾照吗？",
      "en": "Do you have a driver's license?",
      "source": "original",
      "verifiedTokens": [
        "你",
        "有",
        "驾照",
        "吗"
      ]
    },
    {
      "zh": "我想考驾照。",
      "en": "I want to get a driver's license.",
      "source": "original",
      "verifiedTokens": [
        "我",
        "想",
        "考",
        "驾照"
      ]
    }
  ],
  "3521": [
    {
      "zh": "外面有很大的响声。",
      "en": "There is a loud noise outside.",
      "source": "original",
      "verifiedTokens": [
        "外面",
        "有",
        "很",
        "大",
        "的",
        "响声"
      ]
    },
    {
      "zh": "这个响声是从哪里来的？",
      "en": "Where did this sound come from?",
      "source": "original",
      "verifiedTokens": [
        "这",
        "个",
        "响声",
        "是",
        "从",
        "哪里",
        "来",
        "的"
      ]
    }
  ],
  "3530": [
    {
      "zh": "这段历史很久远。",
      "en": "This history goes far back.",
      "source": "original",
      "verifiedTokens": [
        "这",
        "段",
        "历史",
        "很",
        "久远"
      ]
    },
    {
      "zh": "这个传统十分久远。",
      "en": "This tradition is very old.",
      "source": "original",
      "verifiedTokens": [
        "这个",
        "传统",
        "十分",
        "久远"
      ]
    }
  ],
  "3531": [
    {
      "zh": "窗台上有一盆花。",
      "en": "There is a pot of flowers on the windowsill.",
      "source": "original",
      "verifiedTokens": [
        "窗台",
        "上",
        "有",
        "一",
        "盆",
        "花"
      ]
    },
    {
      "zh": "他把书放在窗台上。",
      "en": "He put the book on the windowsill.",
      "source": "original",
      "verifiedTokens": [
        "他",
        "把",
        "书",
        "放",
        "在",
        "窗台",
        "上"
      ]
    },
    {
      "zh": "请打扫一下窗台。",
      "en": "Please clean the windowsill.",
      "source": "original",
      "verifiedTokens": [
        "请",
        "打扫",
        "一下",
        "窗台"
      ]
    }
  ],
  "3553": [
    {
      "zh": "请借我你的尺子。",
      "en": "Please lend me your ruler.",
      "source": "original",
      "verifiedTokens": [
        "请",
        "借",
        "我",
        "你",
        "的",
        "尺子"
      ]
    }
  ]
};
