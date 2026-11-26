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
      const a=analyze(e.zh);
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
  ]
};
