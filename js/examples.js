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
      if (['也同学在这个学校学习。','那多的书看。','请不要与我的事情有关。','由于大，这个不好。','我通过了汉语课。','他送我一个宝。','他用手墙住了我。','围经理今天下午有空吗？','安小姐昨天去医院看病了。','红经理已经出差回来了。','工人在录木头上的花。','我深刻地爱我的家。','他把握着那个杯子。','他们达成了这次任务。'].includes(e.zh)) return;
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
  "1012": [
    {
      "zh": "这件事由我负责。",
      "en": "I am responsible for this matter.",
      "source": "original",
      "verifiedTokens": [
        "这",
        "件",
        "事",
        "由",
        "我",
        "负责"
      ]
    },
    {
      "zh": "比赛由学校举行。",
      "en": "The competition is held by the school.",
      "source": "original",
      "verifiedTokens": [
        "比赛",
        "由",
        "学校",
        "举行"
      ]
    },
    {
      "zh": "这个问题由老师回答。",
      "en": "The teacher will answer this question.",
      "source": "original",
      "verifiedTokens": [
        "这个",
        "问题",
        "由",
        "老师",
        "回答"
      ]
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
  "1018": [
    {
      "zh": "我们生活在这个社会中。",
      "en": "We live in this society.",
      "source": "original",
      "verifiedTokens": [
        "我们",
        "生活",
        "在",
        "这个",
        "社会",
        "中"
      ]
    },
    {
      "zh": "社会在不断发展。",
      "en": "Society keeps developing.",
      "source": "original",
      "verifiedTokens": [
        "社会",
        "在",
        "不断",
        "发展"
      ]
    },
    {
      "zh": "教育对社会很重要。",
      "en": "Education is important to society.",
      "source": "original",
      "verifiedTokens": [
        "教育",
        "对",
        "社会",
        "很",
        "重要"
      ]
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
  "1022": [
    {
      "zh": "各组都要参加。",
      "en": "Each group must participate.",
      "source": "original",
      "verifiedTokens": [
        "各",
        "组",
        "都",
        "要",
        "参加"
      ]
    },
    {
      "zh": "各公司都有自己的计划。",
      "en": "Each company has its own plan.",
      "source": "original",
      "verifiedTokens": [
        "各",
        "公司",
        "都",
        "有",
        "自己",
        "的",
        "计划"
      ]
    },
    {
      "zh": "各国的情况不同。",
      "en": "The situation varies from country to country.",
      "source": "original",
      "verifiedTokens": [
        "各",
        "国",
        "的",
        "情况",
        "不同"
      ]
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
  "1038": [
    {
      "zh": "我们看了一场电影。",
      "en": "We watched a movie.",
      "source": "original",
      "verifiedTokens": [
        "我们",
        "看",
        "了",
        "一",
        "场",
        "电影"
      ]
    },
    {
      "zh": "昨天下了一场大雨。",
      "en": "There was a heavy rain yesterday.",
      "source": "original",
      "verifiedTokens": [
        "昨天",
        "下",
        "了",
        "一",
        "场",
        "大",
        "雨"
      ]
    },
    {
      "zh": "明天有一场比赛。",
      "en": "There is a competition tomorrow.",
      "source": "original",
      "verifiedTokens": [
        "明天",
        "有",
        "一",
        "场",
        "比赛"
      ]
    }
  ],
  "1045": [
    {
      "zh": "工作人员都到了。",
      "en": "The staff have all arrived.",
      "source": "original",
      "verifiedTokens": [
        "工作",
        "人员",
        "都",
        "到",
        "了"
      ]
    },
    {
      "zh": "所有人员都要参加会议。",
      "en": "All staff must attend the meeting.",
      "source": "original",
      "verifiedTokens": [
        "所有",
        "人员",
        "都",
        "要",
        "参加",
        "会议"
      ]
    },
    {
      "zh": "请所有人员来这里。",
      "en": "All personnel, please come here.",
      "source": "original",
      "verifiedTokens": [
        "请",
        "所有",
        "人员",
        "来",
        "这里"
      ]
    }
  ],
  "1051": [
    {
      "zh": "自今天起，我每天学习。",
      "en": "Starting today, I study every day.",
      "source": "original",
      "verifiedTokens": [
        "自",
        "今天",
        "起",
        "我",
        "每",
        "天",
        "学习"
      ]
    },
    {
      "zh": "他自去年起就在这里工作。",
      "en": "He has been working here since last year.",
      "source": "original",
      "verifiedTokens": [
        "他",
        "自",
        "去年",
        "起",
        "就",
        "在",
        "这里",
        "工作"
      ]
    },
    {
      "zh": "会议自九点开始。",
      "en": "The meeting starts at nine.",
      "source": "original",
      "verifiedTokens": [
        "会议",
        "自",
        "九",
        "点",
        "开始"
      ]
    }
  ],
  "1053": [
    {
      "zh": "每组有三个人。",
      "en": "There are three people in each group.",
      "source": "original",
      "verifiedTokens": [
        "每",
        "组",
        "有",
        "三",
        "个",
        "人"
      ]
    },
    {
      "zh": "我们是第一组。",
      "en": "We are group one.",
      "source": "original",
      "verifiedTokens": [
        "我们",
        "是",
        "第",
        "一",
        "组"
      ]
    },
    {
      "zh": "请大家分两组。",
      "en": "Everyone, please split into two groups.",
      "source": "original",
      "verifiedTokens": [
        "请",
        "大家",
        "分",
        "两",
        "组"
      ]
    }
  ],
  "1056": [
    {
      "zh": "请看这张图。",
      "en": "Please look at this diagram.",
      "source": "original",
      "verifiedTokens": [
        "请",
        "看",
        "这",
        "张",
        "图"
      ]
    },
    {
      "zh": "图上有三个人。",
      "en": "There are three people in the picture.",
      "source": "original",
      "verifiedTokens": [
        "图",
        "上",
        "有",
        "三",
        "个",
        "人"
      ]
    },
    {
      "zh": "这张图很清楚。",
      "en": "This diagram is clear.",
      "source": "original",
      "verifiedTokens": [
        "这",
        "张",
        "图",
        "很",
        "清楚"
      ]
    }
  ],
  "1059": [
    {
      "zh": "公司的收入不断增长。",
      "en": "The company's revenue keeps growing.",
      "source": "original",
      "verifiedTokens": [
        "公司",
        "的",
        "收入",
        "不断",
        "增长"
      ]
    },
    {
      "zh": "价格增长得很快。",
      "en": "Prices are growing quickly.",
      "source": "original",
      "verifiedTokens": [
        "价格",
        "增长",
        "得",
        "很",
        "快"
      ]
    },
    {
      "zh": "我们的收入增长了。",
      "en": "Our income grew.",
      "source": "original",
      "verifiedTokens": [
        "我们",
        "的",
        "收入",
        "增长",
        "了"
      ]
    }
  ],
  "1061": [
    {
      "zh": "我住在这个区。",
      "en": "I live in this district.",
      "source": "original",
      "verifiedTokens": [
        "我",
        "住",
        "在",
        "这个",
        "区"
      ]
    },
    {
      "zh": "各区的价格不同。",
      "en": "Prices vary by district.",
      "source": "original",
      "verifiedTokens": [
        "各",
        "区",
        "的",
        "价格",
        "不同"
      ]
    },
    {
      "zh": "这个区的人很多。",
      "en": "Many people live in this district.",
      "source": "original",
      "verifiedTokens": [
        "这个",
        "区",
        "的",
        "人",
        "很",
        "多"
      ]
    }
  ],
  "1066": [
    {
      "zh": "我们有一项新任务。",
      "en": "We have a new task.",
      "source": "original",
      "verifiedTokens": [
        "我们",
        "有",
        "一",
        "项",
        "新",
        "任务"
      ]
    },
    {
      "zh": "他参加了三项活动。",
      "en": "He took part in three activities.",
      "source": "original",
      "verifiedTokens": [
        "他",
        "参加",
        "了",
        "三",
        "项",
        "活动"
      ]
    },
    {
      "zh": "这项技术很重要。",
      "en": "This technology is important.",
      "source": "original",
      "verifiedTokens": [
        "这",
        "项",
        "技术",
        "很",
        "重要"
      ]
    }
  ],
  "1068": [
    {
      "zh": "这个药有什么作用？",
      "en": "What effect does this medicine have?",
      "source": "original",
      "verifiedTokens": [
        "这个",
        "药",
        "有",
        "什么",
        "作用"
      ]
    },
    {
      "zh": "教育有重要作用。",
      "en": "Education plays an important role.",
      "source": "original",
      "verifiedTokens": [
        "教育",
        "有",
        "重要",
        "作用"
      ]
    },
    {
      "zh": "这个办法起了作用。",
      "en": "This method worked.",
      "source": "original",
      "verifiedTokens": [
        "这个",
        "办法",
        "起",
        "了",
        "作用"
      ]
    }
  ],
  "1070": [
    {
      "zh": "请向左转。",
      "en": "Please turn left.",
      "source": "original",
      "verifiedTokens": [
        "请",
        "向",
        "左",
        "转"
      ]
    },
    {
      "zh": "他转过身来。",
      "en": "He turned around.",
      "source": "original",
      "verifiedTokens": [
        "他",
        "转",
        "过",
        "身",
        "来"
      ]
    },
    {
      "zh": "你在这里向右转。",
      "en": "Turn right here.",
      "source": "original",
      "verifiedTokens": [
        "你",
        "在",
        "这里",
        "向",
        "右",
        "转"
      ]
    }
  ],
  "1076": [
    {
      "zh": "连他都知道了。",
      "en": "Even he knows now.",
      "source": "original",
      "verifiedTokens": [
        "连",
        "他",
        "都",
        "知道",
        "了"
      ]
    },
    {
      "zh": "连老师也不知道。",
      "en": "Even the teacher does not know.",
      "source": "original",
      "verifiedTokens": [
        "连",
        "老师",
        "也",
        "不",
        "知道"
      ]
    },
    {
      "zh": "连孩子都会做。",
      "en": "Even children can do it.",
      "source": "original",
      "verifiedTokens": [
        "连",
        "孩子",
        "都",
        "会",
        "做"
      ]
    }
  ],
  "1082": [
    {
      "zh": "他提出了一个问题。",
      "en": "He raised a question.",
      "source": "original",
      "verifiedTokens": [
        "他",
        "提出",
        "了",
        "一",
        "个",
        "问题"
      ]
    },
    {
      "zh": "她提出了一个新办法。",
      "en": "She proposed a new method.",
      "source": "original",
      "verifiedTokens": [
        "她",
        "提出",
        "了",
        "一",
        "个",
        "新",
        "办法"
      ]
    },
    {
      "zh": "请提出你的意见。",
      "en": "Please offer your opinion.",
      "source": "original",
      "verifiedTokens": [
        "请",
        "提出",
        "你",
        "的",
        "意见"
      ]
    }
  ],
  "1084": [
    {
      "zh": "这里有各种水果。",
      "en": "There are all kinds of fruit here.",
      "source": "original",
      "verifiedTokens": [
        "这里",
        "有",
        "各种",
        "水果"
      ]
    },
    {
      "zh": "他喜欢各种运动。",
      "en": "He likes various sports.",
      "source": "original",
      "verifiedTokens": [
        "他",
        "喜欢",
        "各种",
        "运动"
      ]
    },
    {
      "zh": "商店里有各种衣服。",
      "en": "The shop has various clothes.",
      "source": "original",
      "verifiedTokens": [
        "商店",
        "里",
        "有",
        "各种",
        "衣服"
      ]
    }
  ],
  "1087": [
    {
      "zh": "请给我一片面包。",
      "en": "Please give me a slice of bread.",
      "source": "original",
      "verifiedTokens": [
        "请",
        "给",
        "我",
        "一",
        "片",
        "面包"
      ]
    },
    {
      "zh": "我吃了两片面包。",
      "en": "I ate two slices of bread.",
      "source": "original",
      "verifiedTokens": [
        "我",
        "吃",
        "了",
        "两",
        "片",
        "面包"
      ]
    },
    {
      "zh": "这一片地方很安静。",
      "en": "This area is very quiet.",
      "source": "original",
      "verifiedTokens": [
        "这",
        "一",
        "片",
        "地方",
        "很",
        "安静"
      ]
    }
  ],
  "1091": [
    {
      "zh": "我们要不断学习。",
      "en": "We must keep learning.",
      "source": "original",
      "verifiedTokens": [
        "我们",
        "要",
        "不断",
        "学习"
      ]
    },
    {
      "zh": "他不断提出新问题。",
      "en": "He keeps raising new questions.",
      "source": "original",
      "verifiedTokens": [
        "他",
        "不断",
        "提出",
        "新",
        "问题"
      ]
    },
    {
      "zh": "他不断努力。",
      "en": "He keeps trying.",
      "source": "original",
      "verifiedTokens": [
        "他",
        "不断",
        "努力"
      ]
    }
  ],
  "1098": [
    {
      "zh": "我接受你的意见。",
      "en": "I accept your opinion.",
      "source": "original",
      "verifiedTokens": [
        "我",
        "接受",
        "你",
        "的",
        "意见"
      ]
    },
    {
      "zh": "他接受了这个条件。",
      "en": "He accepted this condition.",
      "source": "original",
      "verifiedTokens": [
        "他",
        "接受",
        "了",
        "这个",
        "条件"
      ]
    },
    {
      "zh": "她接受了这个工作。",
      "en": "She accepted the job.",
      "source": "original",
      "verifiedTokens": [
        "她",
        "接受",
        "了",
        "这个",
        "工作"
      ]
    }
  ],
  "1104": [
    {
      "zh": "一切都很好。",
      "en": "Everything is fine.",
      "source": "original",
      "verifiedTokens": [
        "一切",
        "都",
        "很",
        "好"
      ]
    },
    {
      "zh": "一切都会好起来。",
      "en": "Everything will get better.",
      "source": "original",
      "verifiedTokens": [
        "一切",
        "都",
        "会",
        "好",
        "起来"
      ]
    },
    {
      "zh": "我们已经准备好一切。",
      "en": "We have prepared everything.",
      "source": "original",
      "verifiedTokens": [
        "我们",
        "已经",
        "准备",
        "好",
        "一切"
      ]
    }
  ],
  "1105": [
    {
      "zh": "今天仅有三个人来。",
      "en": "Only three people came today.",
      "source": "original",
      "verifiedTokens": [
        "今天",
        "仅",
        "有",
        "三",
        "个",
        "人",
        "来"
      ]
    },
    {
      "zh": "这本书仅十元。",
      "en": "This book costs only ten yuan.",
      "source": "original",
      "verifiedTokens": [
        "这",
        "本",
        "书",
        "仅",
        "十",
        "元"
      ]
    },
    {
      "zh": "这个活动仅有一天。",
      "en": "This activity lasts only one day.",
      "source": "original",
      "verifiedTokens": [
        "这个",
        "活动",
        "仅",
        "有",
        "一",
        "天"
      ]
    }
  ],
  "1106": [
    {
      "zh": "请按这个地方。",
      "en": "Please press here.",
      "source": "original",
      "verifiedTokens": [
        "请",
        "按",
        "这个",
        "地方"
      ]
    },
    {
      "zh": "我们按计划工作。",
      "en": "We work according to the plan.",
      "source": "original",
      "verifiedTokens": [
        "我们",
        "按",
        "计划",
        "工作"
      ]
    },
    {
      "zh": "请按时间来。",
      "en": "Please come according to the schedule.",
      "source": "original",
      "verifiedTokens": [
        "请",
        "按",
        "时间",
        "来"
      ]
    }
  ],
  "1111": [
    {
      "zh": "这是一座大山。",
      "en": "This is a large mountain.",
      "source": "original",
      "verifiedTokens": [
        "这",
        "是",
        "一",
        "座",
        "大",
        "山"
      ]
    },
    {
      "zh": "这里有两座桥。",
      "en": "There are two bridges here.",
      "source": "original",
      "verifiedTokens": [
        "这",
        "里",
        "有",
        "两",
        "座",
        "桥"
      ]
    },
    {
      "zh": "他住在一座城市。",
      "en": "He lives in a city.",
      "source": "original",
      "verifiedTokens": [
        "他",
        "住",
        "在",
        "一",
        "座",
        "城市"
      ]
    }
  ],
  "1113": [
    {
      "zh": "这里有许多人。",
      "en": "There are many people here.",
      "source": "original",
      "verifiedTokens": [
        "这里",
        "有",
        "许多",
        "人"
      ]
    },
    {
      "zh": "我有许多朋友。",
      "en": "I have many friends.",
      "source": "original",
      "verifiedTokens": [
        "我",
        "有",
        "许多",
        "朋友"
      ]
    },
    {
      "zh": "他学了许多新词。",
      "en": "He learned many new words.",
      "source": "original",
      "verifiedTokens": [
        "他",
        "学",
        "了",
        "许多",
        "新",
        "词"
      ]
    }
  ],
  "1120": [
    {
      "zh": "他还没有回复。",
      "en": "He has not replied yet.",
      "source": "original",
      "verifiedTokens": [
        "他",
        "还",
        "没有",
        "回复"
      ]
    },
    {
      "zh": "谢谢你的回复。",
      "en": "Thank you for your reply.",
      "source": "original",
      "verifiedTokens": [
        "谢谢",
        "你",
        "的",
        "回复"
      ]
    },
    {
      "zh": "请回复我。",
      "en": "Please reply to me.",
      "source": "original",
      "verifiedTokens": [
        "请",
        "回复",
        "我"
      ]
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
  "1129": [
    {
      "zh": "他进城买东西。",
      "en": "He went into town to buy things.",
      "source": "original",
      "verifiedTokens": [
        "他",
        "进",
        "城",
        "买",
        "东西"
      ]
    },
    {
      "zh": "这座城很大。",
      "en": "This city is large.",
      "source": "original",
      "verifiedTokens": [
        "这",
        "座",
        "城",
        "很",
        "大"
      ]
    },
    {
      "zh": "我们明天出城。",
      "en": "We leave the city tomorrow.",
      "source": "original",
      "verifiedTokens": [
        "我们",
        "明天",
        "出",
        "城"
      ]
    }
  ],
  "1133": [
    {
      "zh": "他是真正的朋友。",
      "en": "He is a true friend.",
      "source": "original",
      "verifiedTokens": [
        "他",
        "是",
        "真正",
        "的",
        "朋友"
      ]
    },
    {
      "zh": "这是真正的问题。",
      "en": "This is the real problem.",
      "source": "original",
      "verifiedTokens": [
        "这",
        "是",
        "真正",
        "的",
        "问题"
      ]
    },
    {
      "zh": "我想真正了解他。",
      "en": "I want to truly understand him.",
      "source": "original",
      "verifiedTokens": [
        "我",
        "想",
        "真正",
        "了解",
        "他"
      ]
    }
  ],
  "1138": [
    {
      "zh": "他仍在工作。",
      "en": "He is still working.",
      "source": "original",
      "verifiedTokens": [
        "他",
        "仍",
        "在",
        "工作"
      ]
    },
    {
      "zh": "我们仍需要帮助。",
      "en": "We still need help.",
      "source": "original",
      "verifiedTokens": [
        "我们",
        "仍",
        "需要",
        "帮助"
      ]
    },
    {
      "zh": "她仍没有回答。",
      "en": "She still has not answered.",
      "source": "original",
      "verifiedTokens": [
        "她",
        "仍",
        "没有",
        "回答"
      ]
    }
  ],
  "1145": [
    {
      "zh": "他拍了我的手。",
      "en": "He patted my hand.",
      "source": "original",
      "verifiedTokens": [
        "他",
        "拍",
        "了",
        "我",
        "的",
        "手"
      ]
    },
    {
      "zh": "我想拍一张照片。",
      "en": "I want to take a photo.",
      "source": "original",
      "verifiedTokens": [
        "我",
        "想",
        "拍",
        "一",
        "张",
        "照片"
      ]
    },
    {
      "zh": "请帮我拍照片。",
      "en": "Please help me take a photo.",
      "source": "original",
      "verifiedTokens": [
        "请",
        "帮",
        "我",
        "拍",
        "照片"
      ]
    }
  ],
  "1147": [
    {
      "zh": "我完成了任务。",
      "en": "I completed the task.",
      "source": "original",
      "verifiedTokens": [
        "我",
        "完成",
        "了",
        "任务"
      ]
    },
    {
      "zh": "这个任务很重要。",
      "en": "This task is important.",
      "source": "original",
      "verifiedTokens": [
        "这个",
        "任务",
        "很",
        "重要"
      ]
    },
    {
      "zh": "今天有三个任务。",
      "en": "There are three tasks today.",
      "source": "original",
      "verifiedTokens": [
        "今天",
        "有",
        "三",
        "个",
        "任务"
      ]
    }
  ],
  "1151": [
    {
      "zh": "两者都很重要。",
      "en": "Both are important.",
      "source": "original",
      "verifiedTokens": [
        "两",
        "者",
        "都",
        "很",
        "重要"
      ]
    },
    {
      "zh": "前者更好。",
      "en": "The former is better.",
      "source": "original",
      "verifiedTokens": [
        "前",
        "者",
        "更",
        "好"
      ]
    },
    {
      "zh": "前者是老师，后者是学生。",
      "en": "The former is a teacher and the latter is a student.",
      "source": "original",
      "verifiedTokens": [
        "前",
        "者",
        "是",
        "老师",
        "后",
        "者",
        "是",
        "学生"
      ]
    }
  ],
  "1153": [
    {
      "zh": "这是第一期。",
      "en": "This is the first phase.",
      "source": "original",
      "verifiedTokens": [
        "这",
        "是",
        "第",
        "一",
        "期"
      ]
    },
    {
      "zh": "我们看了第二期。",
      "en": "We watched the second episode.",
      "source": "original",
      "verifiedTokens": [
        "我们",
        "看",
        "了",
        "第",
        "二",
        "期"
      ]
    },
    {
      "zh": "下一期什么时候开始？",
      "en": "When does the next phase start?",
      "source": "original",
      "verifiedTokens": [
        "下",
        "一",
        "期",
        "什么",
        "时候",
        "开始"
      ]
    }
  ],
  "1154": [
    {
      "zh": "这件事由我管。",
      "en": "I'll take care of this matter.",
      "source": "original",
      "verifiedTokens": [
        "这",
        "件",
        "事",
        "由",
        "我",
        "管"
      ]
    },
    {
      "zh": "他管这家公司。",
      "en": "He runs this company.",
      "source": "original",
      "verifiedTokens": [
        "他",
        "管",
        "这",
        "家",
        "公司"
      ]
    },
    {
      "zh": "你不用管我。",
      "en": "You don't need to worry about me.",
      "source": "original",
      "verifiedTokens": [
        "你",
        "不用",
        "管",
        "我"
      ]
    }
  ],
  "1156": [
    {
      "zh": "他指向门口。",
      "en": "He pointed toward the entrance.",
      "source": "original",
      "verifiedTokens": [
        "他",
        "指",
        "向",
        "门口"
      ]
    },
    {
      "zh": "她用手指着那本书。",
      "en": "She pointed at that book.",
      "source": "original",
      "verifiedTokens": [
        "她",
        "用",
        "手",
        "指",
        "着",
        "那",
        "本",
        "书"
      ]
    },
    {
      "zh": "我指给你看。",
      "en": "I'll point it out to you.",
      "source": "original",
      "verifiedTokens": [
        "我",
        "指",
        "给",
        "你",
        "看"
      ]
    }
  ],
  "1164": [
    {
      "zh": "我买了五百克肉。",
      "en": "I bought 500 grams of meat.",
      "source": "original",
      "verifiedTokens": [
        "我",
        "买",
        "了",
        "五",
        "百",
        "克",
        "肉"
      ]
    },
    {
      "zh": "这有一百克糖。",
      "en": "There are 100 grams of sugar here.",
      "source": "original",
      "verifiedTokens": [
        "这",
        "有",
        "一",
        "百",
        "克",
        "糖"
      ]
    },
    {
      "zh": "请给我二百克。",
      "en": "Please give me 200 grams.",
      "source": "original",
      "verifiedTokens": [
        "请",
        "给",
        "我",
        "二",
        "百",
        "克"
      ]
    }
  ],
  "1165": [
    {
      "zh": "实际情况不一样。",
      "en": "The actual situation is different.",
      "source": "original",
      "verifiedTokens": [
        "实际",
        "情况",
        "不",
        "一样"
      ]
    },
    {
      "zh": "这是一个实际问题。",
      "en": "This is a practical problem.",
      "source": "original",
      "verifiedTokens": [
        "这",
        "是",
        "一",
        "个",
        "实际",
        "问题"
      ]
    },
    {
      "zh": "我们要了解实际情况。",
      "en": "We need to understand the actual situation.",
      "source": "original",
      "verifiedTokens": [
        "我们",
        "要",
        "了解",
        "实际",
        "情况"
      ]
    }
  ],
  "1168": [
    {
      "zh": "我想听一首歌。",
      "en": "I want to hear a song.",
      "source": "original",
      "verifiedTokens": [
        "我",
        "想",
        "听",
        "一",
        "首",
        "歌"
      ]
    },
    {
      "zh": "这首歌很好听。",
      "en": "This song sounds nice.",
      "source": "original",
      "verifiedTokens": [
        "这",
        "首",
        "歌",
        "很",
        "好听"
      ]
    },
    {
      "zh": "她唱了两首歌。",
      "en": "She sang two songs.",
      "source": "original",
      "verifiedTokens": [
        "她",
        "唱",
        "了",
        "两",
        "首",
        "歌"
      ]
    }
  ],
  "1171": [
    {
      "zh": "我喜欢学科学。",
      "en": "I like studying science.",
      "source": "original",
      "verifiedTokens": [
        "我",
        "喜欢",
        "学",
        "科学"
      ]
    },
    {
      "zh": "科学对生活很重要。",
      "en": "Science is important to daily life.",
      "source": "original",
      "verifiedTokens": [
        "科学",
        "对",
        "生活",
        "很",
        "重要"
      ]
    },
    {
      "zh": "他是科学老师。",
      "en": "He is a science teacher.",
      "source": "original",
      "verifiedTokens": [
        "他",
        "是",
        "科学",
        "老师"
      ]
    }
  ],
  "1174": [
    {
      "zh": "老师指出了我的问题。",
      "en": "The teacher pointed out my problem.",
      "source": "original",
      "verifiedTokens": [
        "老师",
        "指出",
        "了",
        "我",
        "的",
        "问题"
      ]
    },
    {
      "zh": "请指出错误。",
      "en": "Please point out the mistake.",
      "source": "original",
      "verifiedTokens": [
        "请",
        "指出",
        "错误"
      ]
    },
    {
      "zh": "请指出问题在哪里。",
      "en": "Please point out where the problem is.",
      "source": "original",
      "verifiedTokens": [
        "请",
        "指出",
        "问题",
        "在",
        "哪里"
      ]
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
  "1990": [
    {
      "zh": "请以这种方式回答。",
      "en": "Please answer in this way.",
      "source": "original",
      "verifiedTokens": [
        "请",
        "以",
        "这",
        "种",
        "方式",
        "回答"
      ]
    },
    {
      "zh": "我们以客户的需要为目标。",
      "en": "We take customers' needs as our goal.",
      "source": "original",
      "verifiedTokens": [
        "我们",
        "以",
        "客户",
        "的",
        "需要",
        "为",
        "目标"
      ]
    },
    {
      "zh": "他以书为礼物。",
      "en": "He gave a book as a gift.",
      "source": "original",
      "verifiedTokens": [
        "他",
        "以",
        "书",
        "为",
        "礼物"
      ]
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
  "1993": [
    {
      "zh": "这家公司及其产品很有名。",
      "en": "This company and its products are well known.",
      "source": "original",
      "verifiedTokens": [
        "这",
        "家",
        "公司",
        "及",
        "其",
        "产品",
        "很",
        "有名"
      ]
    },
    {
      "zh": "请了解其原因。",
      "en": "Please understand the reason for it.",
      "source": "original",
      "verifiedTokens": [
        "请",
        "了解",
        "其",
        "原因"
      ]
    }
  ],
  "1994": [
    {
      "zh": "这是我所需要的。",
      "en": "This is what I need.",
      "source": "original",
      "verifiedTokens": [
        "这",
        "是",
        "我",
        "所",
        "需要",
        "的"
      ]
    },
    {
      "zh": "他所说的都是事实。",
      "en": "Everything he said is true.",
      "source": "original",
      "verifiedTokens": [
        "他",
        "所",
        "说",
        "的",
        "都",
        "是",
        "事实"
      ]
    },
    {
      "zh": "请把你所知道的告诉我。",
      "en": "Please tell me what you know.",
      "source": "original",
      "verifiedTokens": [
        "请",
        "把",
        "你",
        "所",
        "知道",
        "的",
        "告诉",
        "我"
      ]
    }
  ],
  "1995": [
    {
      "zh": "请准备书及笔。",
      "en": "Please prepare books and pens.",
      "source": "original",
      "verifiedTokens": [
        "请",
        "准备",
        "书",
        "及",
        "笔"
      ]
    },
    {
      "zh": "我们讨论价格及质量。",
      "en": "We discuss price and quality.",
      "source": "original",
      "verifiedTokens": [
        "我们",
        "讨论",
        "价格",
        "及",
        "质量"
      ]
    },
    {
      "zh": "请写姓名及电话。",
      "en": "Please write your name and phone number.",
      "source": "original",
      "verifiedTokens": [
        "请",
        "写",
        "姓名",
        "及",
        "电话"
      ]
    }
  ],
  "1996": [
    {
      "zh": "据他说，明天有雨。",
      "en": "According to him, it will rain tomorrow.",
      "source": "original",
      "verifiedTokens": [
        "据",
        "他",
        "说",
        "明天",
        "有",
        "雨"
      ]
    },
    {
      "zh": "据报道，这里发生了地震。",
      "en": "According to reports, an earthquake occurred here.",
      "source": "original",
      "verifiedTokens": [
        "据",
        "报道",
        "这里",
        "发生",
        "了",
        "地震"
      ]
    },
    {
      "zh": "据老师说，考试不难。",
      "en": "According to the teacher, the exam is not difficult.",
      "source": "original",
      "verifiedTokens": [
        "据",
        "老师",
        "说",
        "考试",
        "不",
        "难"
      ]
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
  "2001": [
    {
      "zh": "会议从三点至五点。",
      "en": "The meeting runs from three to five.",
      "source": "original",
      "verifiedTokens": [
        "会议",
        "从",
        "三",
        "点",
        "至",
        "五",
        "点"
      ]
    },
    {
      "zh": "从今天至明天，我都在家。",
      "en": "I will be at home from today until tomorrow.",
      "source": "original",
      "verifiedTokens": [
        "从",
        "今天",
        "至",
        "明天",
        "我",
        "都",
        "在",
        "家"
      ]
    },
    {
      "zh": "从一月至三月，他都在中国。",
      "en": "He is in China from January to March.",
      "source": "original",
      "verifiedTokens": [
        "从",
        "一",
        "月",
        "至",
        "三",
        "月",
        "他",
        "都",
        "在",
        "中国"
      ]
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
  "2003": [
    {
      "zh": "如有问题，请联系我。",
      "en": "If there are any questions, please contact me.",
      "source": "original",
      "verifiedTokens": [
        "如",
        "有",
        "问题",
        "请",
        "联系",
        "我"
      ]
    },
    {
      "zh": "如需帮助，请告诉我。",
      "en": "If you need help, please tell me.",
      "source": "original",
      "verifiedTokens": [
        "如",
        "需",
        "帮助",
        "请",
        "告诉",
        "我"
      ]
    },
    {
      "zh": "情况正如你所说。",
      "en": "The situation is just as you said.",
      "source": "original",
      "verifiedTokens": [
        "情况",
        "正",
        "如",
        "你",
        "所",
        "说"
      ]
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
  "2012": [
    {
      "zh": "我坐在床头。",
      "en": "I sit at the head of the bed.",
      "source": "original",
      "verifiedTokens": [
        "我",
        "坐",
        "在",
        "床",
        "头"
      ]
    },
    {
      "zh": "他在村头等我。",
      "en": "He is waiting for me at the entrance to the village.",
      "source": "original",
      "verifiedTokens": [
        "他",
        "在",
        "村",
        "头",
        "等",
        "我"
      ]
    },
    {
      "zh": "请从这头开始。",
      "en": "Please start from this end.",
      "source": "original",
      "verifiedTokens": [
        "请",
        "从",
        "这",
        "头",
        "开始"
      ]
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
  "2017": [
    {
      "zh": "请称一下这些水果。",
      "en": "Please weigh this fruit.",
      "source": "original",
      "verifiedTokens": [
        "请",
        "称",
        "一下",
        "这些",
        "水果"
      ]
    },
    {
      "zh": "他正在称米。",
      "en": "He is weighing rice.",
      "source": "original",
      "verifiedTokens": [
        "他",
        "正在",
        "称",
        "米"
      ]
    },
    {
      "zh": "请帮我称一下。",
      "en": "Please help me weigh it.",
      "source": "original",
      "verifiedTokens": [
        "请",
        "帮",
        "我",
        "称",
        "一下"
      ]
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
  "2019": [
    {
      "zh": "请看第一行。",
      "en": "Please look at the first line.",
      "source": "original",
      "verifiedTokens": [
        "请",
        "看",
        "第",
        "一",
        "行"
      ]
    },
    {
      "zh": "他写了两行字。",
      "en": "He wrote two lines of characters.",
      "source": "original",
      "verifiedTokens": [
        "他",
        "写",
        "了",
        "两",
        "行",
        "字"
      ]
    },
    {
      "zh": "你做哪一行？",
      "en": "What line of work are you in?",
      "source": "original",
      "verifiedTokens": [
        "你",
        "做",
        "哪",
        "一",
        "行"
      ]
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
    },
    {
      "zh": "双方中哪一方同意？",
      "en": "Which of the two sides agrees?",
      "source": "original",
      "verifiedTokens": [
        "双方",
        "中",
        "哪",
        "一",
        "方",
        "同意"
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
  "2030": [
    {
      "zh": "你和他处得怎么样？",
      "en": "How do you get along with him?",
      "source": "original",
      "verifiedTokens": [
        "你",
        "和",
        "他",
        "处",
        "得",
        "怎么样"
      ]
    },
    {
      "zh": "他和我处得不错。",
      "en": "He and I get along quite well.",
      "source": "original",
      "verifiedTokens": [
        "他",
        "和",
        "我",
        "处",
        "得",
        "不错"
      ]
    },
    {
      "zh": "我们处得很好。",
      "en": "We get along very well.",
      "source": "original",
      "verifiedTokens": [
        "我们",
        "处",
        "得",
        "很",
        "好"
      ]
    },
    {
      "zh": "他与同事处得很好。",
      "en": "He gets along well with his colleagues.",
      "source": "original",
      "verifiedTokens": [
        "他",
        "与",
        "同事",
        "处",
        "得",
        "很",
        "好"
      ]
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
    },
    {
      "zh": "请随老师一起走。",
      "en": "Please go along with the teacher.",
      "source": "original",
      "verifiedTokens": [
        "请",
        "随",
        "老师",
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
    },
    {
      "zh": "请再加一点力。",
      "en": "Please apply a little more force.",
      "source": "original",
      "verifiedTokens": [
        "请",
        "再",
        "加",
        "一",
        "点",
        "力"
      ]
    }
  ],
  "2037": [
    {
      "zh": "我们要建立新的系统。",
      "en": "We need to establish a new system.",
      "source": "original",
      "verifiedTokens": [
        "我们",
        "要",
        "建立",
        "新",
        "的",
        "系统"
      ]
    },
    {
      "zh": "他们建立了一家公司。",
      "en": "They established a company.",
      "source": "original",
      "verifiedTokens": [
        "他们",
        "建立",
        "了",
        "一",
        "家",
        "公司"
      ]
    },
    {
      "zh": "我们建立了良好的关系。",
      "en": "We established a good relationship.",
      "source": "original",
      "verifiedTokens": [
        "我们",
        "建立",
        "了",
        "良好",
        "的",
        "关系"
      ]
    }
  ],
  "2044": [
    {
      "zh": "这个习惯已经形成了。",
      "en": "This habit has already formed.",
      "source": "original",
      "verifiedTokens": [
        "这个",
        "习惯",
        "已经",
        "形成",
        "了"
      ]
    },
    {
      "zh": "他们形成了新的计划。",
      "en": "They developed a new plan.",
      "source": "original",
      "verifiedTokens": [
        "他们",
        "形成",
        "了",
        "新",
        "的",
        "计划"
      ]
    },
    {
      "zh": "新的市场正在形成。",
      "en": "A new market is taking shape.",
      "source": "original",
      "verifiedTokens": [
        "新",
        "的",
        "市场",
        "正在",
        "形成"
      ]
    }
  ],
  "2045": [
    {
      "zh": "这里的网络很慢。",
      "en": "The Internet here is slow.",
      "source": "original",
      "verifiedTokens": [
        "这里",
        "的",
        "网络",
        "很",
        "慢"
      ]
    },
    {
      "zh": "我通过网络学习。",
      "en": "I study through the Internet.",
      "source": "original",
      "verifiedTokens": [
        "我",
        "通过",
        "网络",
        "学习"
      ]
    },
    {
      "zh": "我们需要更好的网络。",
      "en": "We need a better network.",
      "source": "original",
      "verifiedTokens": [
        "我们",
        "需要",
        "更",
        "好",
        "的",
        "网络"
      ]
    }
  ],
  "2046": [
    {
      "zh": "他比我高一级。",
      "en": "He is one level above me.",
      "source": "original",
      "verifiedTokens": [
        "他",
        "比",
        "我",
        "高",
        "一",
        "级"
      ]
    },
    {
      "zh": "这是第一级。",
      "en": "This is the first level.",
      "source": "original",
      "verifiedTokens": [
        "这",
        "是",
        "第",
        "一",
        "级"
      ]
    }
  ],
  "2050": [
    {
      "zh": "这个地区很安静。",
      "en": "This area is very quiet.",
      "source": "original",
      "verifiedTokens": [
        "这个",
        "地区",
        "很",
        "安静"
      ]
    },
    {
      "zh": "他来自北方地区。",
      "en": "He comes from the northern region.",
      "source": "original",
      "verifiedTokens": [
        "他",
        "来自",
        "北方",
        "地区"
      ]
    },
    {
      "zh": "这个地区有很多学校。",
      "en": "This area has many schools.",
      "source": "original",
      "verifiedTokens": [
        "这个",
        "地区",
        "有",
        "很",
        "多",
        "学校"
      ]
    }
  ],
  "2052": [
    {
      "zh": "他经营一家商店。",
      "en": "He runs a shop.",
      "source": "original",
      "verifiedTokens": [
        "他",
        "经营",
        "一",
        "家",
        "商店"
      ]
    },
    {
      "zh": "他们一起经营公司。",
      "en": "They run the company together.",
      "source": "original",
      "verifiedTokens": [
        "他们",
        "一起",
        "经营",
        "公司"
      ]
    },
    {
      "zh": "这家店经营得很好。",
      "en": "This shop is run very well.",
      "source": "original",
      "verifiedTokens": [
        "这",
        "家",
        "店",
        "经营",
        "得",
        "很",
        "好"
      ]
    }
  ],
  "2054": [
    {
      "zh": "我们需要进一步了解情况。",
      "en": "We need to understand the situation further.",
      "source": "original",
      "verifiedTokens": [
        "我们",
        "需要",
        "进一步",
        "了解",
        "情况"
      ]
    },
    {
      "zh": "请进一步说明这个问题。",
      "en": "Please explain this issue further.",
      "source": "original",
      "verifiedTokens": [
        "请",
        "进一步",
        "说明",
        "这个",
        "问题"
      ]
    },
    {
      "zh": "公司希望进一步发展。",
      "en": "The company hopes to develop further.",
      "source": "original",
      "verifiedTokens": [
        "公司",
        "希望",
        "进一步",
        "发展"
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
  "2062": [
    {
      "zh": "你在搞什么？",
      "en": "What are you doing?",
      "source": "original",
      "verifiedTokens": [
        "你",
        "在",
        "搞",
        "什么"
      ]
    },
    {
      "zh": "他们在搞研究。",
      "en": "They are doing research.",
      "source": "original",
      "verifiedTokens": [
        "他们",
        "在",
        "搞",
        "研究"
      ]
    },
    {
      "zh": "我们把这件事搞好。",
      "en": "Let's get this matter done well.",
      "source": "original",
      "verifiedTokens": [
        "我们",
        "把",
        "这",
        "件",
        "事",
        "搞",
        "好"
      ]
    }
  ],
  "2065": [
    {
      "zh": "他的思想很新。",
      "en": "His thinking is modern.",
      "source": "original",
      "verifiedTokens": [
        "他",
        "的",
        "思想",
        "很",
        "新"
      ]
    },
    {
      "zh": "这本书介绍了他的思想。",
      "en": "This book introduces his ideas.",
      "source": "original",
      "verifiedTokens": [
        "这",
        "本",
        "书",
        "介绍",
        "了",
        "他",
        "的",
        "思想"
      ]
    },
    {
      "zh": "我们应当交流思想。",
      "en": "We should exchange ideas.",
      "source": "original",
      "verifiedTokens": [
        "我们",
        "应当",
        "交流",
        "思想"
      ]
    }
  ],
  "2069": [
    {
      "zh": "她穿了红衣服。",
      "en": "She wore red clothes.",
      "source": "original",
      "verifiedTokens": [
        "她",
        "穿",
        "了",
        "红",
        "衣服"
      ]
    },
    {
      "zh": "他的脸很红。",
      "en": "His face is very red.",
      "source": "original",
      "verifiedTokens": [
        "他",
        "的",
        "脸",
        "很",
        "红"
      ]
    },
    {
      "zh": "这个歌手很红。",
      "en": "This singer is very popular.",
      "source": "original",
      "verifiedTokens": [
        "这个",
        "歌手",
        "很",
        "红"
      ]
    }
  ],
  "2071": [
    {
      "zh": "我没有想到会如此简单。",
      "en": "I did not expect it to be so simple.",
      "source": "original",
      "verifiedTokens": [
        "我",
        "没有",
        "想",
        "到",
        "会",
        "如此",
        "简单"
      ]
    },
    {
      "zh": "他为什么如此生气？",
      "en": "Why is he so angry?",
      "source": "original",
      "verifiedTokens": [
        "他",
        "为什么",
        "如此",
        "生气"
      ]
    },
    {
      "zh": "原来如此。",
      "en": "So that's how it is.",
      "source": "original",
      "verifiedTokens": [
        "原来",
        "如此"
      ]
    }
  ],
  "2072": [
    {
      "zh": "公司开始实施新计划。",
      "en": "The company began implementing the new plan.",
      "source": "original",
      "verifiedTokens": [
        "公司",
        "开始",
        "实施",
        "新",
        "计划"
      ]
    },
    {
      "zh": "这个规定明天实施。",
      "en": "This rule takes effect tomorrow.",
      "source": "original",
      "verifiedTokens": [
        "这个",
        "规定",
        "明天",
        "实施"
      ]
    },
    {
      "zh": "我们正在实施这个方案。",
      "en": "We are implementing this plan.",
      "source": "original",
      "verifiedTokens": [
        "我们",
        "正在",
        "实施",
        "这个",
        "方案"
      ]
    }
  ],
  "2073": [
    {
      "zh": "他决定重做。",
      "en": "He decided to do it again.",
      "source": "original",
      "verifiedTokens": [
        "他",
        "决定",
        "重",
        "做"
      ]
    },
    {
      "zh": "我们必须重来。",
      "en": "We must start again.",
      "source": "original",
      "verifiedTokens": [
        "我们",
        "必须",
        "重",
        "来"
      ]
    }
  ],
  "2074": [
    {
      "zh": "媒体报道了这件事。",
      "en": "The media reported this matter.",
      "source": "original",
      "verifiedTokens": [
        "媒体",
        "报道",
        "了",
        "这",
        "件",
        "事"
      ]
    },
    {
      "zh": "他在媒体工作。",
      "en": "He works in the media.",
      "source": "original",
      "verifiedTokens": [
        "他",
        "在",
        "媒体",
        "工作"
      ]
    },
    {
      "zh": "媒体对社会有影响。",
      "en": "The media influence society.",
      "source": "original",
      "verifiedTokens": [
        "媒体",
        "对",
        "社会",
        "有",
        "影响"
      ]
    }
  ],
  "2083": [
    {
      "zh": "他买了一套衣服。",
      "en": "He bought a set of clothes.",
      "source": "original",
      "verifiedTokens": [
        "他",
        "买",
        "了",
        "一",
        "套",
        "衣服"
      ]
    },
    {
      "zh": "我想买一套房子。",
      "en": "I want to buy an apartment.",
      "source": "original",
      "verifiedTokens": [
        "我",
        "想",
        "买",
        "一",
        "套",
        "房子"
      ]
    },
    {
      "zh": "这套书很有用。",
      "en": "This set of books is useful.",
      "source": "original",
      "verifiedTokens": [
        "这",
        "套",
        "书",
        "很",
        "有用"
      ]
    }
  ],
  "2085": [
    {
      "zh": "我们一起计划未来。",
      "en": "We plan the future together.",
      "source": "original",
      "verifiedTokens": [
        "我们",
        "一起",
        "计划",
        "未来"
      ]
    },
    {
      "zh": "他对未来很有信心。",
      "en": "He is confident about the future.",
      "source": "original",
      "verifiedTokens": [
        "他",
        "对",
        "未来",
        "很",
        "有",
        "信心"
      ]
    },
    {
      "zh": "未来的生活会更好。",
      "en": "Life will be better in the future.",
      "source": "original",
      "verifiedTokens": [
        "未来",
        "的",
        "生活",
        "会",
        "更",
        "好"
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
    },
    {
      "zh": "他看了我一眼。",
      "en": "He glanced at me.",
      "source": "original",
      "verifiedTokens": [
        "他",
        "看",
        "了",
        "我",
        "一",
        "眼"
      ]
    },
    {
      "zh": "我又看了一眼。",
      "en": "I took another look.",
      "source": "original",
      "verifiedTokens": [
        "我",
        "又",
        "看",
        "了",
        "一",
        "眼"
      ]
    }
  ],
  "2092": [
    {
      "zh": "这类产品很便宜。",
      "en": "Products of this kind are inexpensive.",
      "source": "original",
      "verifiedTokens": [
        "这",
        "类",
        "产品",
        "很",
        "便宜"
      ]
    },
    {
      "zh": "我喜欢这类书。",
      "en": "I like this kind of book.",
      "source": "original",
      "verifiedTokens": [
        "我",
        "喜欢",
        "这",
        "类",
        "书"
      ]
    }
  ],
  "2096": [
    {
      "zh": "他靠着门站。",
      "en": "He stands leaning against the door.",
      "source": "original",
      "verifiedTokens": [
        "他",
        "靠",
        "着",
        "门",
        "站"
      ]
    },
    {
      "zh": "我靠自己生活。",
      "en": "I support myself.",
      "source": "original",
      "verifiedTokens": [
        "我",
        "靠",
        "自己",
        "生活"
      ]
    },
    {
      "zh": "请把椅子靠墙放。",
      "en": "Please put the chair against the wall.",
      "source": "original",
      "verifiedTokens": [
        "请",
        "把",
        "椅子",
        "靠",
        "墙",
        "放"
      ]
    }
  ],
  "2098": [
    {
      "zh": "学校开展了新活动。",
      "en": "The school launched a new activity.",
      "source": "original",
      "verifiedTokens": [
        "学校",
        "开展",
        "了",
        "新",
        "活动"
      ]
    },
    {
      "zh": "我们正在开展调查。",
      "en": "We are carrying out an investigation.",
      "source": "original",
      "verifiedTokens": [
        "我们",
        "正在",
        "开展",
        "调查"
      ]
    },
    {
      "zh": "公司准备开展新业务。",
      "en": "The company is preparing to start new business activities.",
      "source": "original",
      "verifiedTokens": [
        "公司",
        "准备",
        "开展",
        "新",
        "业务"
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
    },
    {
      "zh": "他的原计划是去中国。",
      "en": "His original plan was to go to China.",
      "source": "original",
      "verifiedTokens": [
        "他",
        "的",
        "原",
        "计划",
        "是",
        "去",
        "中国"
      ]
    }
  ],
  "2104": [
    {
      "zh": "这个词有什么意义？",
      "en": "What does this word mean?",
      "source": "original",
      "verifiedTokens": [
        "这个",
        "词",
        "有",
        "什么",
        "意义"
      ]
    },
    {
      "zh": "这件事很有意义。",
      "en": "This matter is very meaningful.",
      "source": "original",
      "verifiedTokens": [
        "这",
        "件",
        "事",
        "很",
        "有",
        "意义"
      ]
    },
    {
      "zh": "他明白了学习的意义。",
      "en": "He understood the meaning of studying.",
      "source": "original",
      "verifiedTokens": [
        "他",
        "明白",
        "了",
        "学习",
        "的",
        "意义"
      ]
    }
  ],
  "2108": [
    {
      "zh": "我喜欢黑衣服。",
      "en": "I like black clothes.",
      "source": "original",
      "verifiedTokens": [
        "我",
        "喜欢",
        "黑",
        "衣服"
      ]
    },
    {
      "zh": "天已经黑了。",
      "en": "It has already become dark.",
      "source": "original",
      "verifiedTokens": [
        "天",
        "已经",
        "黑",
        "了"
      ]
    },
    {
      "zh": "这里太黑了。",
      "en": "It is too dark here.",
      "source": "original",
      "verifiedTokens": [
        "这里",
        "太",
        "黑",
        "了"
      ]
    }
  ],
  "2111": [
    {
      "zh": "我不知道问题的严重程度。",
      "en": "I don't know how serious the problem is.",
      "source": "original",
      "verifiedTokens": [
        "我",
        "不",
        "知道",
        "问题",
        "的",
        "严重",
        "程度"
      ]
    },
    {
      "zh": "他的汉语已经达到这个程度。",
      "en": "His Chinese has already reached this level.",
      "source": "original",
      "verifiedTokens": [
        "他",
        "的",
        "汉语",
        "已经",
        "达到",
        "这个",
        "程度"
      ]
    },
    {
      "zh": "我们要了解受伤的程度。",
      "en": "We need to understand the extent of the injury.",
      "source": "original",
      "verifiedTokens": [
        "我们",
        "要",
        "了解",
        "受伤",
        "的",
        "程度"
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
    },
    {
      "zh": "你有权拒绝。",
      "en": "You have the right to refuse.",
      "source": "original",
      "verifiedTokens": [
        "你",
        "有",
        "权",
        "拒绝"
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
  "2116": [
    {
      "zh": "大雨导致比赛取消。",
      "en": "Heavy rain caused the competition to be canceled.",
      "source": "original",
      "verifiedTokens": [
        "大",
        "雨",
        "导致",
        "比赛",
        "取消"
      ]
    },
    {
      "zh": "这个错误导致了事故。",
      "en": "This mistake led to an accident.",
      "source": "original",
      "verifiedTokens": [
        "这个",
        "错误",
        "导致",
        "了",
        "事故"
      ]
    },
    {
      "zh": "这些问题导致成本增加。",
      "en": "These problems caused costs to increase.",
      "source": "original",
      "verifiedTokens": [
        "这些",
        "问题",
        "导致",
        "成本",
        "增加"
      ]
    }
  ],
  "2117": [
    {
      "zh": "这辆车能运两吨货物。",
      "en": "This vehicle can transport two tonnes of goods.",
      "source": "original",
      "verifiedTokens": [
        "这",
        "辆",
        "车",
        "能",
        "运",
        "两",
        "吨",
        "货物"
      ]
    },
    {
      "zh": "我们买了一吨米。",
      "en": "We bought a tonne of rice.",
      "source": "original",
      "verifiedTokens": [
        "我们",
        "买",
        "了",
        "一",
        "吨",
        "米"
      ]
    },
    {
      "zh": "这里每天生产三吨产品。",
      "en": "Three tonnes of products are produced here every day.",
      "source": "original",
      "verifiedTokens": [
        "这里",
        "每",
        "天",
        "生产",
        "三",
        "吨",
        "产品"
      ]
    }
  ],
  "2118": [
    {
      "zh": "我们把学习和工作结合起来。",
      "en": "We combine studying and working.",
      "source": "original",
      "verifiedTokens": [
        "我们",
        "把",
        "学习",
        "和",
        "工作",
        "结合",
        "起来"
      ]
    },
    {
      "zh": "他将两种方法结合起来。",
      "en": "He combined the two methods.",
      "source": "original",
      "verifiedTokens": [
        "他",
        "将",
        "两",
        "种",
        "方法",
        "结合",
        "起来"
      ]
    }
  ],
  "2124": [
    {
      "zh": "运动可以促进健康。",
      "en": "Exercise can promote health.",
      "source": "original",
      "verifiedTokens": [
        "运动",
        "可以",
        "促进",
        "健康"
      ]
    },
    {
      "zh": "这个活动促进了交流。",
      "en": "This activity promoted communication.",
      "source": "original",
      "verifiedTokens": [
        "这个",
        "活动",
        "促进",
        "了",
        "交流"
      ]
    },
    {
      "zh": "新技术促进了经济发展。",
      "en": "New technology promoted economic development.",
      "source": "original",
      "verifiedTokens": [
        "新",
        "技术",
        "促进",
        "了",
        "经济",
        "发展"
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
    },
    {
      "zh": "他不想承担这个风险。",
      "en": "He doesn't want to take this risk.",
      "source": "original",
      "verifiedTokens": [
        "他",
        "不",
        "想",
        "承担",
        "这个",
        "风险"
      ]
    }
  ],
  "2133": [
    {
      "zh": "大家的力量很大。",
      "en": "The strength of everyone together is great.",
      "source": "original",
      "verifiedTokens": [
        "大家",
        "的",
        "力量",
        "很",
        "大"
      ]
    },
    {
      "zh": "他已经没有力量了。",
      "en": "He has no strength left.",
      "source": "original",
      "verifiedTokens": [
        "他",
        "已经",
        "没有",
        "力量",
        "了"
      ]
    },
    {
      "zh": "我们需要更多力量。",
      "en": "We need more strength.",
      "source": "original",
      "verifiedTokens": [
        "我们",
        "需要",
        "更",
        "多",
        "力量"
      ]
    }
  ],
  "2134": [
    {
      "zh": "他发表了一篇文章。",
      "en": "He published an article.",
      "source": "original",
      "verifiedTokens": [
        "他",
        "发表",
        "了",
        "一",
        "篇",
        "文章"
      ]
    },
    {
      "zh": "请发表你的意见。",
      "en": "Please express your opinion.",
      "source": "original",
      "verifiedTokens": [
        "请",
        "发表",
        "你",
        "的",
        "意见"
      ]
    },
    {
      "zh": "她在网上发表了自己的看法。",
      "en": "She published her views online.",
      "source": "original",
      "verifiedTokens": [
        "她",
        "在",
        "网上",
        "发表",
        "了",
        "自己",
        "的",
        "看法"
      ]
    }
  ],
  "2140": [
    {
      "zh": "我曾经在中国工作。",
      "en": "I once worked in China.",
      "source": "original",
      "verifiedTokens": [
        "我",
        "曾经",
        "在",
        "中国",
        "工作"
      ]
    },
    {
      "zh": "他曾经是老师。",
      "en": "He was once a teacher.",
      "source": "original",
      "verifiedTokens": [
        "他",
        "曾经",
        "是",
        "老师"
      ]
    },
    {
      "zh": "这里曾经有一家商店。",
      "en": "There was once a shop here.",
      "source": "original",
      "verifiedTokens": [
        "这里",
        "曾经",
        "有",
        "一",
        "家",
        "商店"
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
    },
    {
      "zh": "我买了一支笔。",
      "en": "I bought a pen.",
      "source": "original",
      "verifiedTokens": [
        "我",
        "买",
        "了",
        "一",
        "支",
        "笔"
      ]
    }
  ],
  "2154": [
    {
      "zh": "公司要降低成本。",
      "en": "The company needs to reduce costs.",
      "source": "original",
      "verifiedTokens": [
        "公司",
        "要",
        "降低",
        "成本"
      ]
    },
    {
      "zh": "这个产品的成本很高。",
      "en": "The cost of this product is high.",
      "source": "original",
      "verifiedTokens": [
        "这个",
        "产品",
        "的",
        "成本",
        "很",
        "高"
      ]
    },
    {
      "zh": "我们正在计算成本。",
      "en": "We are calculating the costs.",
      "source": "original",
      "verifiedTokens": [
        "我们",
        "正在",
        "计算",
        "成本"
      ]
    }
  ],
  "2156": [
    {
      "zh": "这是我最喜欢的宝。",
      "en": "This is my favorite treasure.",
      "source": "original",
      "verifiedTokens": [
        "这",
        "是",
        "我",
        "最",
        "喜欢",
        "的",
        "宝"
      ]
    },
    {
      "zh": "孩子是我们家的宝。",
      "en": "The child is our family's treasure.",
      "source": "original",
      "verifiedTokens": [
        "孩子",
        "是",
        "我们",
        "家",
        "的",
        "宝"
      ]
    },
    {
      "zh": "这可是个宝。",
      "en": "This really is a treasure.",
      "source": "original",
      "verifiedTokens": [
        "这",
        "可",
        "是",
        "个",
        "宝"
      ]
    },
    {
      "zh": "这本书是我的宝。",
      "en": "This book is my treasure.",
      "source": "original",
      "verifiedTokens": [
        "这",
        "本",
        "书",
        "是",
        "我",
        "的",
        "宝"
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
    },
    {
      "zh": "天上有一团云。",
      "en": "There is a mass of cloud in the sky.",
      "source": "original",
      "verifiedTokens": [
        "天上",
        "有",
        "一",
        "团",
        "云"
      ]
    },
    {
      "zh": "她手里拿着一团纸。",
      "en": "She is holding a ball of paper.",
      "source": "original",
      "verifiedTokens": [
        "她",
        "手",
        "里",
        "拿",
        "着",
        "一",
        "团",
        "纸"
      ]
    }
  ],
  "2159": [
    {
      "zh": "这种现象很常见。",
      "en": "This phenomenon is common.",
      "source": "original",
      "verifiedTokens": [
        "这",
        "种",
        "现象",
        "很",
        "常见"
      ]
    },
    {
      "zh": "他解释了这种现象。",
      "en": "He explained this phenomenon.",
      "source": "original",
      "verifiedTokens": [
        "他",
        "解释",
        "了",
        "这",
        "种",
        "现象"
      ]
    },
    {
      "zh": "我们要研究这个现象。",
      "en": "We need to study this phenomenon.",
      "source": "original",
      "verifiedTokens": [
        "我们",
        "要",
        "研究",
        "这个",
        "现象"
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
    },
    {
      "zh": "请代我谢谢他。",
      "en": "Please thank him on my behalf.",
      "source": "original",
      "verifiedTokens": [
        "请",
        "代",
        "我",
        "谢谢",
        "他"
      ]
    }
  ],
  "2171": [
    {
      "zh": "他们正在宣传新产品。",
      "en": "They are promoting a new product.",
      "source": "original",
      "verifiedTokens": [
        "他们",
        "正在",
        "宣传",
        "新",
        "产品"
      ]
    },
    {
      "zh": "学校宣传健康知识。",
      "en": "The school promotes health knowledge.",
      "source": "original",
      "verifiedTokens": [
        "学校",
        "宣传",
        "健康",
        "知识"
      ]
    }
  ],
  "2175": [
    {
      "zh": "请明确你的目标。",
      "en": "Please clarify your goal.",
      "source": "original",
      "verifiedTokens": [
        "请",
        "明确",
        "你",
        "的",
        "目标"
      ]
    },
    {
      "zh": "他的意思很明确。",
      "en": "His meaning is very clear.",
      "source": "original",
      "verifiedTokens": [
        "他",
        "的",
        "意思",
        "很",
        "明确"
      ]
    },
    {
      "zh": "我们有明确的计划。",
      "en": "We have a clear plan.",
      "source": "original",
      "verifiedTokens": [
        "我们",
        "有",
        "明确",
        "的",
        "计划"
      ]
    }
  ],
  "2178": [
    {
      "zh": "学校实行新的规定。",
      "en": "The school implements new rules.",
      "source": "original",
      "verifiedTokens": [
        "学校",
        "实行",
        "新",
        "的",
        "规定"
      ]
    },
    {
      "zh": "公司开始实行新制度。",
      "en": "The company began implementing a new system.",
      "source": "original",
      "verifiedTokens": [
        "公司",
        "开始",
        "实行",
        "新",
        "制度"
      ]
    }
  ],
  "2180": [
    {
      "zh": "我们需要长期合作。",
      "en": "We need long-term cooperation.",
      "source": "original",
      "verifiedTokens": [
        "我们",
        "需要",
        "长期",
        "合作"
      ]
    },
    {
      "zh": "这是长期计划。",
      "en": "This is a long-term plan.",
      "source": "original",
      "verifiedTokens": [
        "这",
        "是",
        "长期",
        "计划"
      ]
    }
  ],
  "2184": [
    {
      "zh": "他的心理压力很大。",
      "en": "He is under great psychological pressure.",
      "source": "original",
      "verifiedTokens": [
        "他",
        "的",
        "心理",
        "压力",
        "很",
        "大"
      ]
    },
    {
      "zh": "我们要注意心理健康。",
      "en": "We should pay attention to mental health.",
      "source": "original",
      "verifiedTokens": [
        "我们",
        "要",
        "注意",
        "心理",
        "健康"
      ]
    },
    {
      "zh": "她对心理问题很感兴趣。",
      "en": "She is interested in psychological issues.",
      "source": "original",
      "verifiedTokens": [
        "她",
        "对",
        "心理",
        "问题",
        "很",
        "感兴趣"
      ]
    }
  ],
  "2185": [
    {
      "zh": "他热爱自己的事业。",
      "en": "He loves his career.",
      "source": "original",
      "verifiedTokens": [
        "他",
        "热爱",
        "自己",
        "的",
        "事业"
      ]
    },
    {
      "zh": "她的事业很成功。",
      "en": "Her career is successful.",
      "source": "original",
      "verifiedTokens": [
        "她",
        "的",
        "事业",
        "很",
        "成功"
      ]
    },
    {
      "zh": "我们希望发展自己的事业。",
      "en": "We hope to develop our own careers.",
      "source": "original",
      "verifiedTokens": [
        "我们",
        "希望",
        "发展",
        "自己",
        "的",
        "事业"
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
    },
    {
      "zh": "这些钱能保他一年的生活。",
      "en": "This money can cover his living expenses for a year.",
      "source": "original",
      "verifiedTokens": [
        "这",
        "些",
        "钱",
        "能",
        "保",
        "他",
        "一",
        "年",
        "的",
        "生活"
      ]
    },
    {
      "zh": "我不敢保他一定成功。",
      "en": "I cannot guarantee that he will succeed.",
      "source": "original",
      "verifiedTokens": [
        "我",
        "不",
        "敢",
        "保",
        "他",
        "一定",
        "成功"
      ]
    }
  ],
  "2188": [
    {
      "zh": "市民可以免费参加。",
      "en": "City residents can participate for free.",
      "source": "original",
      "verifiedTokens": [
        "市民",
        "可以",
        "免费",
        "参加"
      ]
    },
    {
      "zh": "很多市民来这里运动。",
      "en": "Many residents come here to exercise.",
      "source": "original",
      "verifiedTokens": [
        "很",
        "多",
        "市民",
        "来",
        "这里",
        "运动"
      ]
    }
  ],
  "2189": [
    {
      "zh": "大家集中在门口。",
      "en": "Everyone gathered at the entrance.",
      "source": "original",
      "verifiedTokens": [
        "大家",
        "集中",
        "在",
        "门口"
      ]
    },
    {
      "zh": "我们集中时间处理这个问题。",
      "en": "We concentrate our time on dealing with this problem.",
      "source": "original",
      "verifiedTokens": [
        "我们",
        "集中",
        "时间",
        "处理",
        "这个",
        "问题"
      ]
    }
  ],
  "2194": [
    {
      "zh": "这本书属于我。",
      "en": "This book belongs to me.",
      "source": "original",
      "verifiedTokens": [
        "这",
        "本",
        "书",
        "属于",
        "我"
      ]
    },
    {
      "zh": "这里属于学校。",
      "en": "This place belongs to the school.",
      "source": "original",
      "verifiedTokens": [
        "这里",
        "属于",
        "学校"
      ]
    }
  ],
  "2195": [
    {
      "zh": "他投入了很多时间。",
      "en": "He invested a lot of time.",
      "source": "original",
      "verifiedTokens": [
        "他",
        "投入",
        "了",
        "很",
        "多",
        "时间"
      ]
    },
    {
      "zh": "公司投入了大量资金。",
      "en": "The company invested a large amount of money.",
      "source": "original",
      "verifiedTokens": [
        "公司",
        "投入",
        "了",
        "大量",
        "资金"
      ]
    },
    {
      "zh": "她很投入地工作。",
      "en": "She works with great dedication.",
      "source": "original",
      "verifiedTokens": [
        "她",
        "很",
        "投入",
        "地",
        "工作"
      ]
    }
  ],
  "2200": [
    {
      "zh": "这个消息令我高兴。",
      "en": "This news makes me happy.",
      "source": "original",
      "verifiedTokens": [
        "这个",
        "消息",
        "令",
        "我",
        "高兴"
      ]
    },
    {
      "zh": "这件事令他失望。",
      "en": "This matter disappointed him.",
      "source": "original",
      "verifiedTokens": [
        "这",
        "件",
        "事",
        "令",
        "他",
        "失望"
      ]
    },
    {
      "zh": "这个结果令大家满意。",
      "en": "This result satisfies everyone.",
      "source": "original",
      "verifiedTokens": [
        "这个",
        "结果",
        "令",
        "大家",
        "满意"
      ]
    }
  ],
  "2201": [
    {
      "zh": "他似乎不太高兴。",
      "en": "He seems not very happy.",
      "source": "original",
      "verifiedTokens": [
        "他",
        "似乎",
        "不",
        "太",
        "高兴"
      ]
    },
    {
      "zh": "这个办法似乎有用。",
      "en": "This method seems useful.",
      "source": "original",
      "verifiedTokens": [
        "这个",
        "办法",
        "似乎",
        "有用"
      ]
    },
    {
      "zh": "她似乎已经知道了。",
      "en": "She seems to already know.",
      "source": "original",
      "verifiedTokens": [
        "她",
        "似乎",
        "已经",
        "知道",
        "了"
      ]
    }
  ],
  "2202": [
    {
      "zh": "我在年初去了中国。",
      "en": "I went to China at the start of the year.",
      "source": "original",
      "verifiedTokens": [
        "我",
        "在",
        "年",
        "初",
        "去",
        "了",
        "中国"
      ]
    },
    {
      "zh": "会议在月初举行。",
      "en": "The meeting is held at the beginning of the month.",
      "source": "original",
      "verifiedTokens": [
        "会议",
        "在",
        "月",
        "初",
        "举行"
      ]
    },
    {
      "zh": "今年年初很冷。",
      "en": "It was cold at the beginning of this year.",
      "source": "original",
      "verifiedTokens": [
        "今年",
        "年",
        "初",
        "很",
        "冷"
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
  "2209": [
    {
      "zh": "他迅速离开了。",
      "en": "He left quickly.",
      "source": "original",
      "verifiedTokens": [
        "他",
        "迅速",
        "离开",
        "了"
      ]
    },
    {
      "zh": "公司正在迅速发展。",
      "en": "The company is developing rapidly.",
      "source": "original",
      "verifiedTokens": [
        "公司",
        "正在",
        "迅速",
        "发展"
      ]
    },
    {
      "zh": "请迅速处理这个问题。",
      "en": "Please deal with this problem quickly.",
      "source": "original",
      "verifiedTokens": [
        "请",
        "迅速",
        "处理",
        "这个",
        "问题"
      ]
    }
  ],
  "2211": [
    {
      "zh": "这里是商业中心。",
      "en": "This is a commercial center.",
      "source": "original",
      "verifiedTokens": [
        "这里",
        "是",
        "商业",
        "中心"
      ]
    },
    {
      "zh": "他对商业很感兴趣。",
      "en": "He is interested in business.",
      "source": "original",
      "verifiedTokens": [
        "他",
        "对",
        "商业",
        "很",
        "感兴趣"
      ]
    },
    {
      "zh": "这是一个商业项目。",
      "en": "This is a commercial project.",
      "source": "original",
      "verifiedTokens": [
        "这",
        "是",
        "一",
        "个",
        "商业",
        "项目"
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
    },
    {
      "zh": "我们要控制水的量。",
      "en": "We need to control the quantity of water.",
      "source": "original",
      "verifiedTokens": [
        "我们",
        "要",
        "控制",
        "水",
        "的",
        "量"
      ]
    },
    {
      "zh": "每天吃的量不一样。",
      "en": "The amount eaten each day varies.",
      "source": "original",
      "verifiedTokens": [
        "每",
        "天",
        "吃",
        "的",
        "量",
        "不",
        "一样"
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
  "2220": [
    {
      "zh": "我买了两升牛奶。",
      "en": "I bought two liters of milk.",
      "source": "original",
      "verifiedTokens": [
        "我",
        "买",
        "了",
        "两",
        "升",
        "牛奶"
      ]
    },
    {
      "zh": "这个箱子能装五升水。",
      "en": "This container can hold five liters of water.",
      "source": "original",
      "verifiedTokens": [
        "这个",
        "箱子",
        "能",
        "装",
        "五",
        "升",
        "水"
      ]
    },
    {
      "zh": "请给我一升水。",
      "en": "Please give me one liter of water.",
      "source": "original",
      "verifiedTokens": [
        "请",
        "给",
        "我",
        "一",
        "升",
        "水"
      ]
    }
  ],
  "2221": [
    {
      "zh": "孩子们在抢玩具。",
      "en": "The children are fighting over toys.",
      "source": "original",
      "verifiedTokens": [
        "孩子",
        "们",
        "在",
        "抢",
        "玩具"
      ]
    },
    {
      "zh": "请不要抢。",
      "en": "Please don't grab things.",
      "source": "original",
      "verifiedTokens": [
        "请",
        "不要",
        "抢"
      ]
    },
    {
      "zh": "他抢了我的座位。",
      "en": "He took my seat.",
      "source": "original",
      "verifiedTokens": [
        "他",
        "抢",
        "了",
        "我",
        "的",
        "座位"
      ]
    }
  ],
  "2222": [
    {
      "zh": "职工正在开会。",
      "en": "The workers are attending a meeting.",
      "source": "original",
      "verifiedTokens": [
        "职工",
        "正在",
        "开会"
      ]
    },
    {
      "zh": "公司有一百名职工。",
      "en": "The company has one hundred employees.",
      "source": "original",
      "verifiedTokens": [
        "公司",
        "有",
        "一",
        "百",
        "名",
        "职工"
      ]
    },
    {
      "zh": "学校职工今天休息。",
      "en": "School employees are resting today.",
      "source": "original",
      "verifiedTokens": [
        "学校",
        "职工",
        "今天",
        "休息"
      ]
    }
  ],
  "2224": [
    {
      "zh": "他对这个消息没有反应。",
      "en": "He had no reaction to the news.",
      "source": "original",
      "verifiedTokens": [
        "他",
        "对",
        "这个",
        "消息",
        "没有",
        "反应"
      ]
    },
    {
      "zh": "她的反应很快。",
      "en": "Her reaction is quick.",
      "source": "original",
      "verifiedTokens": [
        "她",
        "的",
        "反应",
        "很",
        "快"
      ]
    },
    {
      "zh": "我想知道大家的反应。",
      "en": "I want to know everyone's reaction.",
      "source": "original",
      "verifiedTokens": [
        "我",
        "想",
        "知道",
        "大家",
        "的",
        "反应"
      ]
    }
  ],
  "2226": [
    {
      "zh": "公司发布了新产品。",
      "en": "The company released a new product.",
      "source": "original",
      "verifiedTokens": [
        "公司",
        "发布",
        "了",
        "新",
        "产品"
      ]
    },
    {
      "zh": "学校发布了新消息。",
      "en": "The school issued new information.",
      "source": "original",
      "verifiedTokens": [
        "学校",
        "发布",
        "了",
        "新",
        "消息"
      ]
    },
    {
      "zh": "政府明天发布报告。",
      "en": "The government will release a report tomorrow.",
      "source": "original",
      "verifiedTokens": [
        "政府",
        "明天",
        "发布",
        "报告"
      ]
    }
  ],
  "2230": [
    {
      "zh": "请立即回答。",
      "en": "Please answer immediately.",
      "source": "original",
      "verifiedTokens": [
        "请",
        "立即",
        "回答"
      ]
    },
    {
      "zh": "他立即离开了。",
      "en": "He left immediately.",
      "source": "original",
      "verifiedTokens": [
        "他",
        "立即",
        "离开",
        "了"
      ]
    },
    {
      "zh": "我们应当立即行动。",
      "en": "We should act immediately.",
      "source": "original",
      "verifiedTokens": [
        "我们",
        "应当",
        "立即",
        "行动"
      ]
    }
  ],
  "2231": [
    {
      "zh": "请翻到第三页。",
      "en": "Please turn to page three.",
      "source": "original",
      "verifiedTokens": [
        "请",
        "翻",
        "到",
        "第",
        "三",
        "页"
      ]
    },
    {
      "zh": "他翻了翻这本书。",
      "en": "He flipped through the book.",
      "source": "original",
      "verifiedTokens": [
        "他",
        "翻",
        "了",
        "翻",
        "这",
        "本",
        "书"
      ]
    },
    {
      "zh": "请把鱼翻过来。",
      "en": "Please turn the fish over.",
      "source": "original",
      "verifiedTokens": [
        "请",
        "把",
        "鱼",
        "翻",
        "过来"
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
    },
    {
      "zh": "一名男子走了进来。",
      "en": "A man walked in.",
      "source": "original",
      "verifiedTokens": [
        "一",
        "名",
        "男子",
        "走",
        "了",
        "进来"
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
  "2245": [
    {
      "zh": "我们要完善这个系统。",
      "en": "We need to improve this system.",
      "source": "original",
      "verifiedTokens": [
        "我们",
        "要",
        "完善",
        "这个",
        "系统"
      ]
    },
    {
      "zh": "这个制度很完善。",
      "en": "This system is well developed.",
      "source": "original",
      "verifiedTokens": [
        "这个",
        "制度",
        "很",
        "完善"
      ]
    },
    {
      "zh": "学校正在完善管理制度。",
      "en": "The school is improving its management system.",
      "source": "original",
      "verifiedTokens": [
        "学校",
        "正在",
        "完善",
        "管理",
        "制度"
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
  "2250": [
    {
      "zh": "老师强调要认真学习。",
      "en": "The teacher stressed the need to study seriously.",
      "source": "original",
      "verifiedTokens": [
        "老师",
        "强调",
        "要",
        "认真",
        "学习"
      ]
    },
    {
      "zh": "经理再次强调这个问题。",
      "en": "The manager emphasized this issue again.",
      "source": "original",
      "verifiedTokens": [
        "经理",
        "再次",
        "强调",
        "这个",
        "问题"
      ]
    }
  ],
  "2252": [
    {
      "zh": "这次比赛谁胜了？",
      "en": "Who won this competition?",
      "source": "original",
      "verifiedTokens": [
        "这",
        "次",
        "比赛",
        "谁",
        "胜",
        "了"
      ]
    },
    {
      "zh": "我们的队昨天胜了。",
      "en": "Our team won yesterday.",
      "source": "original",
      "verifiedTokens": [
        "我们",
        "的",
        "队",
        "昨天",
        "胜",
        "了"
      ]
    },
    {
      "zh": "我们的队以三比一取胜。",
      "en": "Our team won three to one.",
      "source": "original",
      "verifiedTokens": [
        "我们",
        "的",
        "队",
        "以",
        "三",
        "比",
        "一",
        "取",
        "胜"
      ]
    },
    {
      "zh": "他在比赛中取胜。",
      "en": "He won the competition.",
      "source": "original",
      "verifiedTokens": [
        "他",
        "在",
        "比赛",
        "中",
        "取",
        "胜"
      ]
    }
  ],
  "2254": [
    {
      "zh": "她是一名年轻的选手。",
      "en": "She is a young contestant.",
      "source": "original",
      "verifiedTokens": [
        "她",
        "是",
        "一",
        "名",
        "年轻",
        "的",
        "选手"
      ]
    },
    {
      "zh": "每名选手都很努力。",
      "en": "Every contestant works hard.",
      "source": "original",
      "verifiedTokens": [
        "每",
        "名",
        "选手",
        "都",
        "很",
        "努力"
      ]
    },
    {
      "zh": "这位选手得了第一名。",
      "en": "This contestant came first.",
      "source": "original",
      "verifiedTokens": [
        "这",
        "位",
        "选手",
        "得",
        "了",
        "第",
        "一",
        "名"
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
  "2258": [
    {
      "zh": "我喜欢享受生活。",
      "en": "I like enjoying life.",
      "source": "original",
      "verifiedTokens": [
        "我",
        "喜欢",
        "享受",
        "生活"
      ]
    },
    {
      "zh": "请享受这段时间。",
      "en": "Please enjoy this time.",
      "source": "original",
      "verifiedTokens": [
        "请",
        "享受",
        "这",
        "段",
        "时间"
      ]
    },
    {
      "zh": "他正在享受假期。",
      "en": "He is enjoying his holiday.",
      "source": "original",
      "verifiedTokens": [
        "他",
        "正在",
        "享受",
        "假期"
      ]
    }
  ],
  "2259": [
    {
      "zh": "这个价格很合理。",
      "en": "This price is reasonable.",
      "source": "original",
      "verifiedTokens": [
        "这个",
        "价格",
        "很",
        "合理"
      ]
    },
    {
      "zh": "你的要求很合理。",
      "en": "Your request is reasonable.",
      "source": "original",
      "verifiedTokens": [
        "你",
        "的",
        "要求",
        "很",
        "合理"
      ]
    },
    {
      "zh": "我们需要合理安排时间。",
      "en": "We need to arrange our time reasonably.",
      "source": "original",
      "verifiedTokens": [
        "我们",
        "需要",
        "合理",
        "安排",
        "时间"
      ]
    }
  ],
  "2265": [
    {
      "zh": "新技术推动了经济发展。",
      "en": "New technology drove economic development.",
      "source": "original",
      "verifiedTokens": [
        "新",
        "技术",
        "推动",
        "了",
        "经济",
        "发展"
      ]
    },
    {
      "zh": "我们要推动这个项目。",
      "en": "We need to advance this project.",
      "source": "original",
      "verifiedTokens": [
        "我们",
        "要",
        "推动",
        "这个",
        "项目"
      ]
    },
    {
      "zh": "公司正在推动合作。",
      "en": "The company is promoting cooperation.",
      "source": "original",
      "verifiedTokens": [
        "公司",
        "正在",
        "推动",
        "合作"
      ]
    }
  ],
  "2266": [
    {
      "zh": "请把消息传给他。",
      "en": "Please pass the news on to him.",
      "source": "original",
      "verifiedTokens": [
        "请",
        "把",
        "消息",
        "传",
        "给",
        "他"
      ]
    },
    {
      "zh": "他把文件传给我。",
      "en": "He sent the document to me.",
      "source": "original",
      "verifiedTokens": [
        "他",
        "把",
        "文件",
        "传",
        "给",
        "我"
      ]
    },
    {
      "zh": "这个故事传了很久。",
      "en": "This story has been passed down for a long time.",
      "source": "original",
      "verifiedTokens": [
        "这个",
        "故事",
        "传",
        "了",
        "很",
        "久"
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
    },
    {
      "zh": "她去过欧洲吗？",
      "en": "Has she been to Europe?",
      "source": "original",
      "verifiedTokens": [
        "她",
        "去",
        "过",
        "欧洲",
        "吗"
      ]
    }
  ],
  "2276": [
    {
      "zh": "请把腿伸直。",
      "en": "Please straighten your legs.",
      "source": "original",
      "verifiedTokens": [
        "请",
        "把",
        "腿",
        "伸",
        "直"
      ]
    },
    {
      "zh": "这条路很直。",
      "en": "This road is straight.",
      "source": "original",
      "verifiedTokens": [
        "这",
        "条",
        "路",
        "很",
        "直"
      ]
    },
    {
      "zh": "你说话很直。",
      "en": "You speak very directly.",
      "source": "original",
      "verifiedTokens": [
        "你",
        "说话",
        "很",
        "直"
      ]
    }
  ],
  "2277": [
    {
      "zh": "我买了保险。",
      "en": "I bought insurance.",
      "source": "original",
      "verifiedTokens": [
        "我",
        "买",
        "了",
        "保险"
      ]
    },
    {
      "zh": "这个保险很贵。",
      "en": "This insurance is expensive.",
      "source": "original",
      "verifiedTokens": [
        "这个",
        "保险",
        "很",
        "贵"
      ]
    },
    {
      "zh": "出门旅行前，我们要买保险。",
      "en": "We should buy insurance before traveling.",
      "source": "original",
      "verifiedTokens": [
        "出门",
        "旅行",
        "前",
        "我们",
        "要",
        "买",
        "保险"
      ]
    }
  ],
  "2282": [
    {
      "zh": "一群孩子在玩。",
      "en": "A group of children are playing.",
      "source": "original",
      "verifiedTokens": [
        "一",
        "群",
        "孩子",
        "在",
        "玩"
      ]
    },
    {
      "zh": "一群人走了进来。",
      "en": "A group of people walked in.",
      "source": "original",
      "verifiedTokens": [
        "一",
        "群",
        "人",
        "走",
        "了",
        "进来"
      ]
    },
    {
      "zh": "他加入了我们的群。",
      "en": "He joined our group.",
      "source": "original",
      "verifiedTokens": [
        "他",
        "加入",
        "了",
        "我们",
        "的",
        "群"
      ]
    }
  ],
  "2283": [
    {
      "zh": "我们要推进这个计划。",
      "en": "We need to advance this plan.",
      "source": "original",
      "verifiedTokens": [
        "我们",
        "要",
        "推进",
        "这个",
        "计划"
      ]
    },
    {
      "zh": "项目正在推进。",
      "en": "The project is moving forward.",
      "source": "original",
      "verifiedTokens": [
        "项目",
        "正在",
        "推进"
      ]
    },
    {
      "zh": "双方一起推进合作。",
      "en": "Both sides are advancing cooperation together.",
      "source": "original",
      "verifiedTokens": [
        "双方",
        "一起",
        "推进",
        "合作"
      ]
    }
  ],
  "2288": [
    {
      "zh": "这体现了他的能力。",
      "en": "This reflects his ability.",
      "source": "original",
      "verifiedTokens": [
        "这",
        "体现",
        "了",
        "他",
        "的",
        "能力"
      ]
    },
    {
      "zh": "这个设计体现了中国文化。",
      "en": "This design reflects Chinese culture.",
      "source": "original",
      "verifiedTokens": [
        "这个",
        "设计",
        "体现",
        "了",
        "中国",
        "文化"
      ]
    },
    {
      "zh": "他的行动体现了爱。",
      "en": "His actions reflect love.",
      "source": "original",
      "verifiedTokens": [
        "他",
        "的",
        "行动",
        "体现",
        "了",
        "爱"
      ]
    }
  ],
  "2289": [
    {
      "zh": "近日天气很好。",
      "en": "The weather has been good recently.",
      "source": "original",
      "verifiedTokens": [
        "近日",
        "天气",
        "很",
        "好"
      ]
    },
    {
      "zh": "公司近日发布了消息。",
      "en": "The company recently released news.",
      "source": "original",
      "verifiedTokens": [
        "公司",
        "近日",
        "发布",
        "了",
        "消息"
      ]
    },
    {
      "zh": "他近日会来中国。",
      "en": "He will come to China in the next few days.",
      "source": "original",
      "verifiedTokens": [
        "他",
        "近日",
        "会",
        "来",
        "中国"
      ]
    }
  ],
  "2290": [
    {
      "zh": "我们有选择的自由。",
      "en": "We have freedom of choice.",
      "source": "original",
      "verifiedTokens": [
        "我们",
        "有",
        "选择",
        "的",
        "自由"
      ]
    },
    {
      "zh": "我喜欢自由的生活。",
      "en": "I like a life of freedom.",
      "source": "original",
      "verifiedTokens": [
        "我",
        "喜欢",
        "自由",
        "的",
        "生活"
      ]
    },
    {
      "zh": "你可以自由选择。",
      "en": "You can choose freely.",
      "source": "original",
      "verifiedTokens": [
        "你",
        "可以",
        "自由",
        "选择"
      ]
    }
  ],
  "2295": [
    {
      "zh": "他是会议的主席。",
      "en": "He is the chairperson of the meeting.",
      "source": "original",
      "verifiedTokens": [
        "他",
        "是",
        "会议",
        "的",
        "主席"
      ]
    },
    {
      "zh": "主席正在发言。",
      "en": "The chairperson is speaking.",
      "source": "original",
      "verifiedTokens": [
        "主席",
        "正在",
        "发言"
      ]
    },
    {
      "zh": "请主席先介绍情况。",
      "en": "Please let the chairperson introduce the situation first.",
      "source": "original",
      "verifiedTokens": [
        "请",
        "主席",
        "先",
        "介绍",
        "情况"
      ]
    }
  ],
  "2298": [
    {
      "zh": "这是我首次来中国。",
      "en": "This is my first visit to China.",
      "source": "original",
      "verifiedTokens": [
        "这",
        "是",
        "我",
        "首次",
        "来",
        "中国"
      ]
    },
    {
      "zh": "他首次参加这个比赛。",
      "en": "He entered this competition for the first time.",
      "source": "original",
      "verifiedTokens": [
        "他",
        "首次",
        "参加",
        "这个",
        "比赛"
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
    },
    {
      "zh": "他们把水果运到中国。",
      "en": "They transport fruit to China.",
      "source": "original",
      "verifiedTokens": [
        "他们",
        "把",
        "水果",
        "运",
        "到",
        "中国"
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
    },
    {
      "zh": "你应当早一点儿休息。",
      "en": "You should rest a bit earlier.",
      "source": "original",
      "verifiedTokens": [
        "你",
        "应当",
        "早",
        "一点儿",
        "休息"
      ]
    }
  ],
  "2308": [
    {
      "zh": "总统正在发言。",
      "en": "The president is speaking.",
      "source": "original",
      "verifiedTokens": [
        "总统",
        "正在",
        "发言"
      ]
    },
    {
      "zh": "总统明天到达。",
      "en": "The president arrives tomorrow.",
      "source": "original",
      "verifiedTokens": [
        "总统",
        "明天",
        "到达"
      ]
    },
    {
      "zh": "他想成为总统。",
      "en": "He wants to become president.",
      "source": "original",
      "verifiedTokens": [
        "他",
        "想",
        "成为",
        "总统"
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
    },
    {
      "zh": "她吃了饭，随后出门。",
      "en": "She ate and then went out.",
      "source": "original",
      "verifiedTokens": [
        "她",
        "吃",
        "了",
        "饭",
        "随后",
        "出门"
      ]
    }
  ],
  "2312": [
    {
      "zh": "这个词难以理解。",
      "en": "This word is difficult to understand.",
      "source": "original",
      "verifiedTokens": [
        "这个",
        "词",
        "难以",
        "理解"
      ]
    },
    {
      "zh": "我难以接受这个结果。",
      "en": "I find it hard to accept this result.",
      "source": "original",
      "verifiedTokens": [
        "我",
        "难以",
        "接受",
        "这个",
        "结果"
      ]
    }
  ],
  "2313": [
    {
      "zh": "公司人员增至一百人。",
      "en": "The company's staff increased to one hundred.",
      "source": "original",
      "verifiedTokens": [
        "公司",
        "人员",
        "增",
        "至",
        "一",
        "百",
        "人"
      ]
    },
    {
      "zh": "价格增了五元。",
      "en": "The price increased by five yuan.",
      "source": "original",
      "verifiedTokens": [
        "价格",
        "增",
        "了",
        "五",
        "元"
      ]
    }
  ],
  "2320": [
    {
      "zh": "我要找老板。",
      "en": "I need to see the boss.",
      "source": "original",
      "verifiedTokens": [
        "我",
        "要",
        "找",
        "老板"
      ]
    },
    {
      "zh": "她是这家店的老板。",
      "en": "She owns this shop.",
      "source": "original",
      "verifiedTokens": [
        "她",
        "是",
        "这",
        "家",
        "店",
        "的",
        "老板"
      ]
    },
    {
      "zh": "老板同意了我的计划。",
      "en": "The boss agreed to my plan.",
      "source": "original",
      "verifiedTokens": [
        "老板",
        "同意",
        "了",
        "我",
        "的",
        "计划"
      ]
    }
  ],
  "2321": [
    {
      "zh": "他把心安下来。",
      "en": "He settled his mind.",
      "source": "original",
      "verifiedTokens": [
        "他",
        "把",
        "心",
        "安",
        "下来"
      ]
    },
    {
      "zh": "你安的是什么心？",
      "en": "What are your intentions?",
      "source": "original",
      "verifiedTokens": [
        "你",
        "安",
        "的",
        "是",
        "什么",
        "心"
      ]
    },
    {
      "zh": "请把门安好。",
      "en": "Please install the door properly.",
      "source": "original",
      "verifiedTokens": [
        "请",
        "把",
        "门",
        "安",
        "好"
      ]
    }
  ],
  "2323": [
    {
      "zh": "这种饮料含糖。",
      "en": "This drink contains sugar.",
      "source": "original",
      "verifiedTokens": [
        "这",
        "种",
        "饮料",
        "含",
        "糖"
      ]
    },
    {
      "zh": "价格不含运费。",
      "en": "The price does not include shipping.",
      "source": "original",
      "verifiedTokens": [
        "价格",
        "不",
        "含",
        "运费"
      ]
    },
    {
      "zh": "他嘴里含着糖。",
      "en": "He has candy in his mouth.",
      "source": "original",
      "verifiedTokens": [
        "他",
        "嘴",
        "里",
        "含",
        "着",
        "糖"
      ]
    }
  ],
  "2324": [
    {
      "zh": "树的根很长。",
      "en": "The roots of the tree are long.",
      "source": "original",
      "verifiedTokens": [
        "树",
        "的",
        "根",
        "很",
        "长"
      ]
    },
    {
      "zh": "我买了一根香蕉。",
      "en": "I bought a banana.",
      "source": "original",
      "verifiedTokens": [
        "我",
        "买",
        "了",
        "一",
        "根",
        "香蕉"
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
  "2327": [
    {
      "zh": "天上有一架飞机。",
      "en": "There is an airplane in the sky.",
      "source": "original",
      "verifiedTokens": [
        "天上",
        "有",
        "一",
        "架",
        "飞机"
      ]
    },
    {
      "zh": "他们买了一架飞机。",
      "en": "They bought an airplane.",
      "source": "original",
      "verifiedTokens": [
        "他们",
        "买",
        "了",
        "一",
        "架",
        "飞机"
      ]
    },
    {
      "zh": "这架飞机很大。",
      "en": "This airplane is large.",
      "source": "original",
      "verifiedTokens": [
        "这",
        "架",
        "飞机",
        "很",
        "大"
      ]
    }
  ],
  "2328": [
    {
      "zh": "学校位于城市中心。",
      "en": "The school is located in the city center.",
      "source": "original",
      "verifiedTokens": [
        "学校",
        "位于",
        "城市",
        "中心"
      ]
    },
    {
      "zh": "这家店位于一楼。",
      "en": "This shop is located on the first floor.",
      "source": "original",
      "verifiedTokens": [
        "这",
        "家",
        "店",
        "位于",
        "一",
        "楼"
      ]
    },
    {
      "zh": "公司位于中国南方。",
      "en": "The company is located in southern China.",
      "source": "original",
      "verifiedTokens": [
        "公司",
        "位于",
        "中国",
        "南方"
      ]
    }
  ],
  "2330": [
    {
      "zh": "甲方同意了。",
      "en": "Party A agreed.",
      "source": "original",
      "verifiedTokens": [
        "甲",
        "方",
        "同意",
        "了"
      ]
    },
    {
      "zh": "甲和乙都有责任。",
      "en": "Both A and B are responsible.",
      "source": "original",
      "verifiedTokens": [
        "甲",
        "和",
        "乙",
        "都",
        "有",
        "责任"
      ]
    },
    {
      "zh": "这题选甲。",
      "en": "Choose A for this question.",
      "source": "original",
      "verifiedTokens": [
        "这",
        "题",
        "选",
        "甲"
      ]
    }
  ],
  "2333": [
    {
      "zh": "他在追那辆车。",
      "en": "He is chasing that car.",
      "source": "original",
      "verifiedTokens": [
        "他",
        "在",
        "追",
        "那",
        "辆",
        "车"
      ]
    },
    {
      "zh": "狗正在追猫。",
      "en": "The dog is chasing the cat.",
      "source": "original",
      "verifiedTokens": [
        "狗",
        "正在",
        "追",
        "猫"
      ]
    },
    {
      "zh": "我们要追上前面的人。",
      "en": "We need to catch up with the person ahead.",
      "source": "original",
      "verifiedTokens": [
        "我们",
        "要",
        "追",
        "上",
        "前面",
        "的",
        "人"
      ]
    }
  ],
  "2337": [
    {
      "zh": "他要解决自身的问题。",
      "en": "He needs to solve his own problems.",
      "source": "original",
      "verifiedTokens": [
        "他",
        "要",
        "解决",
        "自身",
        "的",
        "问题"
      ]
    },
    {
      "zh": "这是产品自身的问题。",
      "en": "This is a problem with the product itself.",
      "source": "original",
      "verifiedTokens": [
        "这",
        "是",
        "产品",
        "自身",
        "的",
        "问题"
      ]
    },
    {
      "zh": "我们要提高自身能力。",
      "en": "We need to improve our own abilities.",
      "source": "original",
      "verifiedTokens": [
        "我们",
        "要",
        "提高",
        "自身",
        "能力"
      ]
    }
  ],
  "2343": [
    {
      "zh": "她的表现很突出。",
      "en": "Her performance is outstanding.",
      "source": "original",
      "verifiedTokens": [
        "她",
        "的",
        "表现",
        "很",
        "突出"
      ]
    },
    {
      "zh": "这个产品的优点很突出。",
      "en": "The advantages of this product are prominent.",
      "source": "original",
      "verifiedTokens": [
        "这个",
        "产品",
        "的",
        "优点",
        "很",
        "突出"
      ]
    },
    {
      "zh": "他的能力很突出。",
      "en": "His ability is outstanding.",
      "source": "original",
      "verifiedTokens": [
        "他",
        "的",
        "能力",
        "很",
        "突出"
      ]
    }
  ],
  "2349": [
    {
      "zh": "这是事实。",
      "en": "This is a fact.",
      "source": "original",
      "verifiedTokens": [
        "这",
        "是",
        "事实"
      ]
    },
    {
      "zh": "我们应当接受事实。",
      "en": "We should accept the facts.",
      "source": "original",
      "verifiedTokens": [
        "我们",
        "应当",
        "接受",
        "事实"
      ]
    },
    {
      "zh": "事实与他说的不同。",
      "en": "The facts differ from what he said.",
      "source": "original",
      "verifiedTokens": [
        "事实",
        "与",
        "他",
        "说",
        "的",
        "不同"
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
    },
    {
      "zh": "中国很多地方产米。",
      "en": "Many places in China produce rice.",
      "source": "original",
      "verifiedTokens": [
        "中国",
        "很",
        "多",
        "地方",
        "产",
        "米"
      ]
    }
  ],
  "2354": [
    {
      "zh": "他领我去学校。",
      "en": "He led me to school.",
      "source": "original",
      "verifiedTokens": [
        "他",
        "领",
        "我",
        "去",
        "学校"
      ]
    },
    {
      "zh": "请领大家进去。",
      "en": "Please lead everyone inside.",
      "source": "original",
      "verifiedTokens": [
        "请",
        "领",
        "大家",
        "进去"
      ]
    },
    {
      "zh": "我去领工资。",
      "en": "I am going to collect my wages.",
      "source": "original",
      "verifiedTokens": [
        "我",
        "去",
        "领",
        "工资"
      ]
    }
  ],
  "2359": [
    {
      "zh": "天气逐渐变冷。",
      "en": "The weather gradually gets colder.",
      "source": "original",
      "verifiedTokens": [
        "天气",
        "逐渐",
        "变",
        "冷"
      ]
    },
    {
      "zh": "他逐渐习惯了这里的生活。",
      "en": "He gradually got used to life here.",
      "source": "original",
      "verifiedTokens": [
        "他",
        "逐渐",
        "习惯",
        "了",
        "这里",
        "的",
        "生活"
      ]
    },
    {
      "zh": "情况正在逐渐好转。",
      "en": "The situation is gradually improving.",
      "source": "original",
      "verifiedTokens": [
        "情况",
        "正在",
        "逐渐",
        "好",
        "转"
      ]
    }
  ],
  "2362": [
    {
      "zh": "他缺乏经验。",
      "en": "He lacks experience.",
      "source": "original",
      "verifiedTokens": [
        "他",
        "缺乏",
        "经验"
      ]
    },
    {
      "zh": "这里缺乏水。",
      "en": "There is a shortage of water here.",
      "source": "original",
      "verifiedTokens": [
        "这里",
        "缺乏",
        "水"
      ]
    },
    {
      "zh": "孩子缺乏运动。",
      "en": "The child lacks exercise.",
      "source": "original",
      "verifiedTokens": [
        "孩子",
        "缺乏",
        "运动"
      ]
    }
  ],
  "2370": [
    {
      "zh": "我吃了一颗糖。",
      "en": "I ate a piece of candy.",
      "source": "original",
      "verifiedTokens": [
        "我",
        "吃",
        "了",
        "一",
        "颗",
        "糖"
      ]
    },
    {
      "zh": "他掉了一颗牙。",
      "en": "He lost a tooth.",
      "source": "original",
      "verifiedTokens": [
        "他",
        "掉",
        "了",
        "一",
        "颗",
        "牙"
      ]
    },
    {
      "zh": "天上有一颗星星。",
      "en": "There is a star in the sky.",
      "source": "original",
      "verifiedTokens": [
        "天上",
        "有",
        "一",
        "颗",
        "星星"
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
  "2375": [
    {
      "zh": "他有强烈的愿望。",
      "en": "He has a strong desire.",
      "source": "original",
      "verifiedTokens": [
        "他",
        "有",
        "强烈",
        "的",
        "愿望"
      ]
    },
    {
      "zh": "大家的反应很强烈。",
      "en": "Everyone's reaction was strong.",
      "source": "original",
      "verifiedTokens": [
        "大家",
        "的",
        "反应",
        "很",
        "强烈"
      ]
    },
    {
      "zh": "我对此有强烈的感受。",
      "en": "I have strong feelings about this.",
      "source": "original",
      "verifiedTokens": [
        "我",
        "对",
        "此",
        "有",
        "强烈",
        "的",
        "感受"
      ]
    }
  ],
  "2383": [
    {
      "zh": "请看第一集。",
      "en": "Please watch the first episode.",
      "source": "original",
      "verifiedTokens": [
        "请",
        "看",
        "第",
        "一",
        "集"
      ]
    },
    {
      "zh": "我看了两集。",
      "en": "I watched two episodes.",
      "source": "original",
      "verifiedTokens": [
        "我",
        "看",
        "了",
        "两",
        "集"
      ]
    },
    {
      "zh": "这部电视剧有十集。",
      "en": "This TV series has ten episodes.",
      "source": "original",
      "verifiedTokens": [
        "这",
        "部",
        "电视剧",
        "有",
        "十",
        "集"
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
  "2390": [
    {
      "zh": "他追求自由。",
      "en": "He pursues freedom.",
      "source": "original",
      "verifiedTokens": [
        "他",
        "追求",
        "自由"
      ]
    },
    {
      "zh": "我们追求更好的生活。",
      "en": "We pursue a better life.",
      "source": "original",
      "verifiedTokens": [
        "我们",
        "追求",
        "更",
        "好",
        "的",
        "生活"
      ]
    },
    {
      "zh": "公司追求高质量。",
      "en": "The company pursues high quality.",
      "source": "original",
      "verifiedTokens": [
        "公司",
        "追求",
        "高",
        "质量"
      ]
    }
  ],
  "2395": [
    {
      "zh": "这届比赛在中国举行。",
      "en": "This edition of the competition is held in China.",
      "source": "original",
      "verifiedTokens": [
        "这",
        "届",
        "比赛",
        "在",
        "中国",
        "举行"
      ]
    },
    {
      "zh": "他参加了上一届比赛。",
      "en": "He took part in the previous competition.",
      "source": "original",
      "verifiedTokens": [
        "他",
        "参加",
        "了",
        "上",
        "一",
        "届",
        "比赛"
      ]
    }
  ],
  "2398": [
    {
      "zh": "请把画贴在墙上。",
      "en": "Please stick the picture on the wall.",
      "source": "original",
      "verifiedTokens": [
        "请",
        "把",
        "画",
        "贴",
        "在",
        "墙",
        "上"
      ]
    },
    {
      "zh": "他贴了一张邮票。",
      "en": "He attached a postage stamp.",
      "source": "original",
      "verifiedTokens": [
        "他",
        "贴",
        "了",
        "一",
        "张",
        "邮票"
      ]
    },
    {
      "zh": "请把名字贴在书上。",
      "en": "Please stick your name on the book.",
      "source": "original",
      "verifiedTokens": [
        "请",
        "把",
        "名字",
        "贴",
        "在",
        "书",
        "上"
      ]
    }
  ],
  "2399": [
    {
      "zh": "请按程序做。",
      "en": "Please follow the procedure.",
      "source": "original",
      "verifiedTokens": [
        "请",
        "按",
        "程序",
        "做"
      ]
    },
    {
      "zh": "这个程序很简单。",
      "en": "This procedure is simple.",
      "source": "original",
      "verifiedTokens": [
        "这个",
        "程序",
        "很",
        "简单"
      ]
    },
    {
      "zh": "我正在写电脑程序。",
      "en": "I am writing a computer program.",
      "source": "original",
      "verifiedTokens": [
        "我",
        "正在",
        "写",
        "电脑",
        "程序"
      ]
    }
  ],
  "2405": [
    {
      "zh": "雪已经化了。",
      "en": "The snow has melted.",
      "source": "original",
      "verifiedTokens": [
        "雪",
        "已经",
        "化",
        "了"
      ]
    },
    {
      "zh": "糖在水里化了。",
      "en": "The sugar dissolved in the water.",
      "source": "original",
      "verifiedTokens": [
        "糖",
        "在",
        "水",
        "里",
        "化",
        "了"
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
    },
    {
      "zh": "学校有很多集体活动。",
      "en": "The school has many group activities.",
      "source": "original",
      "verifiedTokens": [
        "学校",
        "有",
        "很",
        "多",
        "集体",
        "活动"
      ]
    }
  ],
  "2407": [
    {
      "zh": "此时他正在工作。",
      "en": "At this moment, he is working.",
      "source": "original",
      "verifiedTokens": [
        "此时",
        "他",
        "正在",
        "工作"
      ]
    },
    {
      "zh": "此时外面正在下雨。",
      "en": "It is raining outside at this moment.",
      "source": "original",
      "verifiedTokens": [
        "此时",
        "外面",
        "正在",
        "下雨"
      ]
    },
    {
      "zh": "我此时很高兴。",
      "en": "I am happy at this moment.",
      "source": "original",
      "verifiedTokens": [
        "我",
        "此时",
        "很",
        "高兴"
      ]
    }
  ],
  "2411": [
    {
      "zh": "这里不允许车辆进入。",
      "en": "Vehicles are not allowed to enter here.",
      "source": "original",
      "verifiedTokens": [
        "这里",
        "不",
        "允许",
        "车辆",
        "进入"
      ]
    },
    {
      "zh": "路上的车辆很多。",
      "en": "There are many vehicles on the road.",
      "source": "original",
      "verifiedTokens": [
        "路上",
        "的",
        "车辆",
        "很",
        "多"
      ]
    }
  ],
  "2412": [
    {
      "zh": "这是一个新挑战。",
      "en": "This is a new challenge.",
      "source": "original",
      "verifiedTokens": [
        "这",
        "是",
        "一",
        "个",
        "新",
        "挑战"
      ]
    },
    {
      "zh": "他喜欢挑战自己。",
      "en": "He likes to challenge himself.",
      "source": "original",
      "verifiedTokens": [
        "他",
        "喜欢",
        "挑战",
        "自己"
      ]
    },
    {
      "zh": "我们要面对这个挑战。",
      "en": "We must face this challenge.",
      "source": "original",
      "verifiedTokens": [
        "我们",
        "要",
        "面对",
        "这个",
        "挑战"
      ]
    }
  ],
  "2416": [
    {
      "zh": "我想体验中国的生活。",
      "en": "I want to experience life in China.",
      "source": "original",
      "verifiedTokens": [
        "我",
        "想",
        "体验",
        "中国",
        "的",
        "生活"
      ]
    },
    {
      "zh": "这是一次很好的体验。",
      "en": "This is a very good experience.",
      "source": "original",
      "verifiedTokens": [
        "这",
        "是",
        "一",
        "次",
        "很",
        "好",
        "的",
        "体验"
      ]
    },
    {
      "zh": "你可以体验新技术。",
      "en": "You can experience the new technology.",
      "source": "original",
      "verifiedTokens": [
        "你",
        "可以",
        "体验",
        "新",
        "技术"
      ]
    }
  ],
  "2423": [
    {
      "zh": "请换一个角度看。",
      "en": "Please look at it from another angle.",
      "source": "original",
      "verifiedTokens": [
        "请",
        "换",
        "一",
        "个",
        "角度",
        "看"
      ]
    },
    {
      "zh": "我们从不同角度看问题。",
      "en": "We look at the problem from different angles.",
      "source": "original",
      "verifiedTokens": [
        "我们",
        "从",
        "不同",
        "角度",
        "看",
        "问题"
      ]
    },
    {
      "zh": "这个角度很好。",
      "en": "This angle is good.",
      "source": "original",
      "verifiedTokens": [
        "这个",
        "角度",
        "很",
        "好"
      ]
    }
  ],
  "2424": [
    {
      "zh": "大家纷纷表示同意。",
      "en": "Everyone expressed agreement one after another.",
      "source": "original",
      "verifiedTokens": [
        "大家",
        "纷纷",
        "表示",
        "同意"
      ]
    },
    {
      "zh": "孩子们纷纷跑了出去。",
      "en": "The children ran out one after another.",
      "source": "original",
      "verifiedTokens": [
        "孩子",
        "们",
        "纷纷",
        "跑",
        "了",
        "出去"
      ]
    },
    {
      "zh": "客人纷纷离开。",
      "en": "The guests left one after another.",
      "source": "original",
      "verifiedTokens": [
        "客人",
        "纷纷",
        "离开"
      ]
    }
  ],
  "2426": [
    {
      "zh": "他正在寻找工作。",
      "en": "He is looking for a job.",
      "source": "original",
      "verifiedTokens": [
        "他",
        "正在",
        "寻找",
        "工作"
      ]
    },
    {
      "zh": "我们要寻找新办法。",
      "en": "We need to look for a new method.",
      "source": "original",
      "verifiedTokens": [
        "我们",
        "要",
        "寻找",
        "新",
        "办法"
      ]
    },
    {
      "zh": "她在寻找自己的亲人。",
      "en": "She is looking for her relatives.",
      "source": "original",
      "verifiedTokens": [
        "她",
        "在",
        "寻找",
        "自己",
        "的",
        "亲人"
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
    },
    {
      "zh": "我给你冲茶。",
      "en": "I'll make you some tea.",
      "source": "original",
      "verifiedTokens": [
        "我",
        "给",
        "你",
        "冲",
        "茶"
      ]
    }
  ],
  "2440": [
    {
      "zh": "请抽一张纸。",
      "en": "Please pull out a sheet of paper.",
      "source": "original",
      "verifiedTokens": [
        "请",
        "抽",
        "一",
        "张",
        "纸"
      ]
    },
    {
      "zh": "他抽了一根烟。",
      "en": "He smoked a cigarette.",
      "source": "original",
      "verifiedTokens": [
        "他",
        "抽",
        "了",
        "一",
        "根",
        "烟"
      ]
    },
    {
      "zh": "我要抽时间学习。",
      "en": "I need to make time to study.",
      "source": "original",
      "verifiedTokens": [
        "我",
        "要",
        "抽",
        "时间",
        "学习"
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
    },
    {
      "zh": "这些苹果还是青的。",
      "en": "These apples are still green.",
      "source": "original",
      "verifiedTokens": [
        "这些",
        "苹果",
        "还",
        "是",
        "青",
        "的"
      ]
    }
  ],
  "2446": [
    {
      "zh": "努力学习，必有收获。",
      "en": "Study hard and you will surely gain something.",
      "source": "original",
      "verifiedTokens": [
        "努力",
        "学习",
        "必",
        "有",
        "收获"
      ]
    },
    {
      "zh": "他必能成功。",
      "en": "He will surely succeed.",
      "source": "original",
      "verifiedTokens": [
        "他",
        "必",
        "能",
        "成功"
      ]
    }
  ],
  "2449": [
    {
      "zh": "请不要破坏环境。",
      "en": "Please do not damage the environment.",
      "source": "original",
      "verifiedTokens": [
        "请",
        "不要",
        "破坏",
        "环境"
      ]
    },
    {
      "zh": "他破坏了这个计划。",
      "en": "He ruined this plan.",
      "source": "original",
      "verifiedTokens": [
        "他",
        "破坏",
        "了",
        "这个",
        "计划"
      ]
    },
    {
      "zh": "这样会破坏我们的关系。",
      "en": "This will damage our relationship.",
      "source": "original",
      "verifiedTokens": [
        "这样",
        "会",
        "破坏",
        "我们",
        "的",
        "关系"
      ]
    }
  ],
  "2453": [
    {
      "zh": "请不要靠墙。",
      "en": "Please do not lean against the wall.",
      "source": "original",
      "verifiedTokens": [
        "请",
        "不要",
        "靠",
        "墙"
      ]
    },
    {
      "zh": "墙上有一张照片。",
      "en": "There is a photo on the wall.",
      "source": "original",
      "verifiedTokens": [
        "墙",
        "上",
        "有",
        "一",
        "张",
        "照片"
      ]
    },
    {
      "zh": "这面墙很高。",
      "en": "This wall is high.",
      "source": "original",
      "verifiedTokens": [
        "这",
        "面",
        "墙",
        "很",
        "高"
      ]
    }
  ],
  "2454": [
    {
      "zh": "她是高级经理。",
      "en": "She is a senior manager.",
      "source": "original",
      "verifiedTokens": [
        "她",
        "是",
        "高级",
        "经理"
      ]
    },
    {
      "zh": "这是高级课程。",
      "en": "This is an advanced course.",
      "source": "original",
      "verifiedTokens": [
        "这",
        "是",
        "高级",
        "课程"
      ]
    },
    {
      "zh": "他在学习高级汉语。",
      "en": "He is studying advanced Chinese.",
      "source": "original",
      "verifiedTokens": [
        "他",
        "在",
        "学习",
        "高级",
        "汉语"
      ]
    }
  ],
  "2456": [
    {
      "zh": "工厂加工水果。",
      "en": "The factory processes fruit.",
      "source": "original",
      "verifiedTokens": [
        "工厂",
        "加工",
        "水果"
      ]
    },
    {
      "zh": "这些食品需要加工。",
      "en": "These foods need processing.",
      "source": "original",
      "verifiedTokens": [
        "这些",
        "食品",
        "需要",
        "加工"
      ]
    },
    {
      "zh": "我们在这里加工产品。",
      "en": "We process products here.",
      "source": "original",
      "verifiedTokens": [
        "我们",
        "在",
        "这里",
        "加工",
        "产品"
      ]
    }
  ],
  "2458": [
    {
      "zh": "他果然来了。",
      "en": "Sure enough, he came.",
      "source": "original",
      "verifiedTokens": [
        "他",
        "果然",
        "来",
        "了"
      ]
    },
    {
      "zh": "天气果然变好了。",
      "en": "Sure enough, the weather improved.",
      "source": "original",
      "verifiedTokens": [
        "天气",
        "果然",
        "变",
        "好",
        "了"
      ]
    },
    {
      "zh": "你说得对，果然如此。",
      "en": "You were right; it turned out just like that.",
      "source": "original",
      "verifiedTokens": [
        "你",
        "说",
        "得",
        "对",
        "果然",
        "如此"
      ]
    }
  ],
  "2462": [
    {
      "zh": "请把水果切开。",
      "en": "Please cut the fruit open.",
      "source": "original",
      "verifiedTokens": [
        "请",
        "把",
        "水果",
        "切",
        "开"
      ]
    },
    {
      "zh": "他正在切肉。",
      "en": "He is cutting meat.",
      "source": "original",
      "verifiedTokens": [
        "他",
        "正在",
        "切",
        "肉"
      ]
    }
  ],
  "2467": [
    {
      "zh": "他在烧水。",
      "en": "He is boiling water.",
      "source": "original",
      "verifiedTokens": [
        "他",
        "在",
        "烧",
        "水"
      ]
    },
    {
      "zh": "这张纸烧了。",
      "en": "This piece of paper burned.",
      "source": "original",
      "verifiedTokens": [
        "这",
        "张",
        "纸",
        "烧",
        "了"
      ]
    },
    {
      "zh": "房子被烧了。",
      "en": "The house was burned.",
      "source": "original",
      "verifiedTokens": [
        "房子",
        "被",
        "烧",
        "了"
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
    },
    {
      "zh": "请向后退一步。",
      "en": "Please take one step back.",
      "source": "original",
      "verifiedTokens": [
        "请",
        "向",
        "后",
        "退",
        "一",
        "步"
      ]
    }
  ],
  "2470": [
    {
      "zh": "今天的阳光很温暖。",
      "en": "Today's sunshine is warm.",
      "source": "original",
      "verifiedTokens": [
        "今天",
        "的",
        "阳光",
        "很",
        "温暖"
      ]
    },
    {
      "zh": "这个房间很温暖。",
      "en": "This room is warm.",
      "source": "original",
      "verifiedTokens": [
        "这个",
        "房间",
        "很",
        "温暖"
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
  "2475": [
    {
      "zh": "医生正在治病。",
      "en": "The doctor is treating an illness.",
      "source": "original",
      "verifiedTokens": [
        "医生",
        "正在",
        "治",
        "病"
      ]
    },
    {
      "zh": "这种病很难治。",
      "en": "This disease is hard to treat.",
      "source": "original",
      "verifiedTokens": [
        "这",
        "种",
        "病",
        "很",
        "难",
        "治"
      ]
    },
    {
      "zh": "这个药能治什么病？",
      "en": "What disease can this medicine treat?",
      "source": "original",
      "verifiedTokens": [
        "这个",
        "药",
        "能",
        "治",
        "什么",
        "病"
      ]
    }
  ],
  "2479": [
    {
      "zh": "我们要交税。",
      "en": "We need to pay taxes.",
      "source": "original",
      "verifiedTokens": [
        "我们",
        "要",
        "交",
        "税"
      ]
    },
    {
      "zh": "这个价格包括税吗？",
      "en": "Does this price include tax?",
      "source": "original",
      "verifiedTokens": [
        "这",
        "个",
        "价格",
        "包括",
        "税",
        "吗"
      ]
    },
    {
      "zh": "公司每年交很多税。",
      "en": "The company pays a lot of tax each year.",
      "source": "original",
      "verifiedTokens": [
        "公司",
        "每",
        "年",
        "交",
        "很",
        "多",
        "税"
      ]
    }
  ],
  "2481": [
    {
      "zh": "医生还没有作出诊断。",
      "en": "The doctor has not made a diagnosis yet.",
      "source": "original",
      "verifiedTokens": [
        "医生",
        "还",
        "没有",
        "作出",
        "诊断"
      ]
    },
    {
      "zh": "这个病很难诊断。",
      "en": "This disease is difficult to diagnose.",
      "source": "original",
      "verifiedTokens": [
        "这个",
        "病",
        "很",
        "难",
        "诊断"
      ]
    },
    {
      "zh": "我相信医生的诊断。",
      "en": "I trust the doctor's diagnosis.",
      "source": "original",
      "verifiedTokens": [
        "我",
        "相信",
        "医生",
        "的",
        "诊断"
      ]
    }
  ],
  "2482": [
    {
      "zh": "这个消息刺激了他。",
      "en": "This news upset him.",
      "source": "original",
      "verifiedTokens": [
        "这个",
        "消息",
        "刺激",
        "了",
        "他"
      ]
    },
    {
      "zh": "这部电影很刺激。",
      "en": "This film is exciting.",
      "source": "original",
      "verifiedTokens": [
        "这",
        "部",
        "电影",
        "很",
        "刺激"
      ]
    }
  ],
  "2487": [
    {
      "zh": "请帮我测一下长度。",
      "en": "Please help me measure the length.",
      "source": "original",
      "verifiedTokens": [
        "请",
        "帮",
        "我",
        "测",
        "一下",
        "长度"
      ]
    },
    {
      "zh": "他正在测温度。",
      "en": "He is measuring the temperature.",
      "source": "original",
      "verifiedTokens": [
        "他",
        "正在",
        "测",
        "温度"
      ]
    },
    {
      "zh": "我们先测一下速度。",
      "en": "Let's measure the speed first.",
      "source": "original",
      "verifiedTokens": [
        "我们",
        "先",
        "测",
        "一下",
        "速度"
      ]
    }
  ],
  "2488": [
    {
      "zh": "医生救了他。",
      "en": "The doctor saved him.",
      "source": "original",
      "verifiedTokens": [
        "医生",
        "救",
        "了",
        "他"
      ]
    },
    {
      "zh": "请去救那个孩子。",
      "en": "Please go and save that child.",
      "source": "original",
      "verifiedTokens": [
        "请",
        "去",
        "救",
        "那个",
        "孩子"
      ]
    },
    {
      "zh": "他想救自己的朋友。",
      "en": "He wants to save his friend.",
      "source": "original",
      "verifiedTokens": [
        "他",
        "想",
        "救",
        "自己",
        "的",
        "朋友"
      ]
    }
  ],
  "2492": [
    {
      "zh": "公司设立了新部门。",
      "en": "The company established a new department.",
      "source": "original",
      "verifiedTokens": [
        "公司",
        "设立",
        "了",
        "新",
        "部门"
      ]
    },
    {
      "zh": "学校设立了新课程。",
      "en": "The school established a new course.",
      "source": "original",
      "verifiedTokens": [
        "学校",
        "设立",
        "了",
        "新",
        "课程"
      ]
    },
    {
      "zh": "我们计划设立一个中心。",
      "en": "We plan to set up a center.",
      "source": "original",
      "verifiedTokens": [
        "我们",
        "计划",
        "设立",
        "一",
        "个",
        "中心"
      ]
    }
  ],
  "2496": [
    {
      "zh": "或许他不知道。",
      "en": "Perhaps he does not know.",
      "source": "original",
      "verifiedTokens": [
        "或许",
        "他",
        "不",
        "知道"
      ]
    },
    {
      "zh": "或许明天会下雨。",
      "en": "Perhaps it will rain tomorrow.",
      "source": "original",
      "verifiedTokens": [
        "或许",
        "明天",
        "会",
        "下雨"
      ]
    },
    {
      "zh": "这或许是最好的办法。",
      "en": "This may be the best method.",
      "source": "original",
      "verifiedTokens": [
        "这",
        "或许",
        "是",
        "最",
        "好",
        "的",
        "办法"
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
  "2500": [
    {
      "zh": "我们要维持正常生活。",
      "en": "We need to maintain a normal life.",
      "source": "original",
      "verifiedTokens": [
        "我们",
        "要",
        "维持",
        "正常",
        "生活"
      ]
    },
    {
      "zh": "他努力维持这个家。",
      "en": "He works hard to support this family.",
      "source": "original",
      "verifiedTokens": [
        "他",
        "努力",
        "维持",
        "这个",
        "家"
      ]
    },
    {
      "zh": "我们需要维持这个关系。",
      "en": "We need to maintain this relationship.",
      "source": "original",
      "verifiedTokens": [
        "我们",
        "需要",
        "维持",
        "这个",
        "关系"
      ]
    }
  ],
  "2505": [
    {
      "zh": "这辆车负责运输水果。",
      "en": "This vehicle is responsible for transporting fruit.",
      "source": "original",
      "verifiedTokens": [
        "这",
        "辆",
        "车",
        "负责",
        "运输",
        "水果"
      ]
    },
    {
      "zh": "货物正在运输中。",
      "en": "The goods are in transit.",
      "source": "original",
      "verifiedTokens": [
        "货物",
        "正在",
        "运输",
        "中"
      ]
    },
    {
      "zh": "运输成本很高。",
      "en": "Transportation costs are high.",
      "source": "original",
      "verifiedTokens": [
        "运输",
        "成本",
        "很",
        "高"
      ]
    }
  ],
  "2511": [
    {
      "zh": "他把我当成敌人。",
      "en": "He treats me as an enemy.",
      "source": "original",
      "verifiedTokens": [
        "他",
        "把",
        "我",
        "当成",
        "敌人"
      ]
    },
    {
      "zh": "他们不是我们的敌人。",
      "en": "They are not our enemies.",
      "source": "original",
      "verifiedTokens": [
        "他们",
        "不",
        "是",
        "我们",
        "的",
        "敌人"
      ]
    },
    {
      "zh": "敌人已经离开了。",
      "en": "The enemy has already left.",
      "source": "original",
      "verifiedTokens": [
        "敌人",
        "已经",
        "离开",
        "了"
      ]
    }
  ],
  "2512": [
    {
      "zh": "请设置新密码。",
      "en": "Please set a new password.",
      "source": "original",
      "verifiedTokens": [
        "请",
        "设置",
        "新",
        "密码"
      ]
    },
    {
      "zh": "我正在设置手机。",
      "en": "I am setting up my phone.",
      "source": "original",
      "verifiedTokens": [
        "我",
        "正在",
        "设置",
        "手机"
      ]
    },
    {
      "zh": "学校设置了新的课程。",
      "en": "The school set up new courses.",
      "source": "original",
      "verifiedTokens": [
        "学校",
        "设置",
        "了",
        "新",
        "的",
        "课程"
      ]
    }
  ],
  "2514": [
    {
      "zh": "我想去看戏。",
      "en": "I want to go watch a play.",
      "source": "original",
      "verifiedTokens": [
        "我",
        "想",
        "去",
        "看",
        "戏"
      ]
    },
    {
      "zh": "这部戏很有意思。",
      "en": "This play is interesting.",
      "source": "original",
      "verifiedTokens": [
        "这",
        "部",
        "戏",
        "很",
        "有意思"
      ]
    },
    {
      "zh": "他在戏里是老师。",
      "en": "He plays a teacher in the play.",
      "source": "original",
      "verifiedTokens": [
        "他",
        "在",
        "戏",
        "里",
        "是",
        "老师"
      ]
    }
  ],
  "2515": [
    {
      "zh": "我们正在接近目标。",
      "en": "We are approaching our goal.",
      "source": "original",
      "verifiedTokens": [
        "我们",
        "正在",
        "接近",
        "目标"
      ]
    },
    {
      "zh": "现在已经接近晚上了。",
      "en": "It is almost evening now.",
      "source": "original",
      "verifiedTokens": [
        "现在",
        "已经",
        "接近",
        "晚上",
        "了"
      ]
    },
    {
      "zh": "两家店的价格很接近。",
      "en": "The prices of the two shops are close.",
      "source": "original",
      "verifiedTokens": [
        "两",
        "家",
        "店",
        "的",
        "价格",
        "很",
        "接近"
      ]
    }
  ],
  "2521": [
    {
      "zh": "我喜欢这个角色。",
      "en": "I like this character.",
      "source": "original",
      "verifiedTokens": [
        "我",
        "喜欢",
        "这个",
        "角色"
      ]
    },
    {
      "zh": "每个人都有自己的角色。",
      "en": "Everyone has their own role.",
      "source": "original",
      "verifiedTokens": [
        "每",
        "个",
        "人",
        "都",
        "有",
        "自己",
        "的",
        "角色"
      ]
    }
  ],
  "2526": [
    {
      "zh": "我们很难预测未来。",
      "en": "It is hard for us to predict the future.",
      "source": "original",
      "verifiedTokens": [
        "我们",
        "很",
        "难",
        "预测",
        "未来"
      ]
    },
    {
      "zh": "他预测明天会下雨。",
      "en": "He predicts that it will rain tomorrow.",
      "source": "original",
      "verifiedTokens": [
        "他",
        "预测",
        "明天",
        "会",
        "下雨"
      ]
    },
    {
      "zh": "请预测下个月的销售。",
      "en": "Please forecast next month's sales.",
      "source": "original",
      "verifiedTokens": [
        "请",
        "预测",
        "下",
        "个",
        "月",
        "的",
        "销售"
      ]
    }
  ],
  "2529": [
    {
      "zh": "请告诉我路线。",
      "en": "Please tell me the route.",
      "source": "original",
      "verifiedTokens": [
        "请",
        "告诉",
        "我",
        "路线"
      ]
    },
    {
      "zh": "这条路线很短。",
      "en": "This route is short.",
      "source": "original",
      "verifiedTokens": [
        "这",
        "条",
        "路线",
        "很",
        "短"
      ]
    },
    {
      "zh": "我们要改变旅行路线。",
      "en": "We need to change our travel route.",
      "source": "original",
      "verifiedTokens": [
        "我们",
        "要",
        "改变",
        "旅行",
        "路线"
      ]
    }
  ],
  "2530": [
    {
      "zh": "他的腿断了。",
      "en": "His leg is broken.",
      "source": "original",
      "verifiedTokens": [
        "他",
        "的",
        "腿",
        "断",
        "了"
      ]
    },
    {
      "zh": "这根笔断了。",
      "en": "This pen broke.",
      "source": "original",
      "verifiedTokens": [
        "这",
        "根",
        "笔",
        "断",
        "了"
      ]
    }
  ],
  "2533": [
    {
      "zh": "这个湖很大。",
      "en": "This lake is large.",
      "source": "original",
      "verifiedTokens": [
        "这个",
        "湖",
        "很",
        "大"
      ]
    },
    {
      "zh": "我们在湖边散步。",
      "en": "We walked by the lake.",
      "source": "original",
      "verifiedTokens": [
        "我们",
        "在",
        "湖",
        "边",
        "散步"
      ]
    },
    {
      "zh": "湖里有很多鱼。",
      "en": "There are many fish in the lake.",
      "source": "original",
      "verifiedTokens": [
        "湖",
        "里",
        "有",
        "很",
        "多",
        "鱼"
      ]
    }
  ],
  "2534": [
    {
      "zh": "孩子围着老师。",
      "en": "The children gathered around the teacher.",
      "source": "original",
      "verifiedTokens": [
        "孩子",
        "围",
        "着",
        "老师"
      ]
    },
    {
      "zh": "大家围着桌子坐。",
      "en": "Everyone sits around the table.",
      "source": "original",
      "verifiedTokens": [
        "大家",
        "围",
        "着",
        "桌子",
        "坐"
      ]
    },
    {
      "zh": "他们把房子围了起来。",
      "en": "They surrounded the house.",
      "source": "original",
      "verifiedTokens": [
        "他们",
        "把",
        "房子",
        "围",
        "了",
        "起来"
      ]
    }
  ],
  "2536": [
    {
      "zh": "他有参加比赛的资格。",
      "en": "He is qualified to enter the competition.",
      "source": "original",
      "verifiedTokens": [
        "他",
        "有",
        "参加",
        "比赛",
        "的",
        "资格"
      ]
    },
    {
      "zh": "你有这个资格吗？",
      "en": "Do you have this qualification?",
      "source": "original",
      "verifiedTokens": [
        "你",
        "有",
        "这个",
        "资格",
        "吗"
      ]
    },
    {
      "zh": "我没有申请的资格。",
      "en": "I am not eligible to apply.",
      "source": "original",
      "verifiedTokens": [
        "我",
        "没有",
        "申请",
        "的",
        "资格"
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
    },
    {
      "zh": "我喜欢喝淡茶。",
      "en": "I like weak tea.",
      "source": "original",
      "verifiedTokens": [
        "我",
        "喜欢",
        "喝",
        "淡",
        "茶"
      ]
    }
  ],
  "2545": [
    {
      "zh": "这个标志是什么意思？",
      "en": "What does this sign mean?",
      "source": "original",
      "verifiedTokens": [
        "这个",
        "标志",
        "是",
        "什么",
        "意思"
      ]
    },
    {
      "zh": "请注意路上的标志。",
      "en": "Please pay attention to road signs.",
      "source": "original",
      "verifiedTokens": [
        "请",
        "注意",
        "路上",
        "的",
        "标志"
      ]
    }
  ],
  "2546": [
    {
      "zh": "这条路很宽。",
      "en": "This road is wide.",
      "source": "original",
      "verifiedTokens": [
        "这",
        "条",
        "路",
        "很",
        "宽"
      ]
    },
    {
      "zh": "这张床不够宽。",
      "en": "This bed is not wide enough.",
      "source": "original",
      "verifiedTokens": [
        "这",
        "张",
        "床",
        "不",
        "够",
        "宽"
      ]
    },
    {
      "zh": "这个房间有多宽？",
      "en": "How wide is this room?",
      "source": "original",
      "verifiedTokens": [
        "这个",
        "房间",
        "有",
        "多",
        "宽"
      ]
    }
  ],
  "2552": [
    {
      "zh": "我老婆在中国工作。",
      "en": "My wife works in China.",
      "source": "original",
      "verifiedTokens": [
        "我",
        "老婆",
        "在",
        "中国",
        "工作"
      ]
    },
    {
      "zh": "你老婆喜欢什么？",
      "en": "What does your wife like?",
      "source": "original",
      "verifiedTokens": [
        "你",
        "老婆",
        "喜欢",
        "什么"
      ]
    }
  ],
  "2553": [
    {
      "zh": "请帮我安装这个软件。",
      "en": "Please help me install this software.",
      "source": "original",
      "verifiedTokens": [
        "请",
        "帮",
        "我",
        "安装",
        "这个",
        "软件"
      ]
    },
    {
      "zh": "他们正在安装设备。",
      "en": "They are installing equipment.",
      "source": "original",
      "verifiedTokens": [
        "他们",
        "正在",
        "安装",
        "设备"
      ]
    },
    {
      "zh": "我们已经安装完了。",
      "en": "We have finished installing it.",
      "source": "original",
      "verifiedTokens": [
        "我们",
        "已经",
        "安装",
        "完",
        "了"
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
    },
    {
      "zh": "海里有很多生物。",
      "en": "There are many organisms in the sea.",
      "source": "original",
      "verifiedTokens": [
        "海",
        "里",
        "有",
        "很",
        "多",
        "生物"
      ]
    }
  ],
  "2558": [
    {
      "zh": "我们明天前往中国。",
      "en": "We will head to China tomorrow.",
      "source": "original",
      "verifiedTokens": [
        "我们",
        "明天",
        "前往",
        "中国"
      ]
    },
    {
      "zh": "他正在前往机场。",
      "en": "He is on his way to the airport.",
      "source": "original",
      "verifiedTokens": [
        "他",
        "正在",
        "前往",
        "机场"
      ]
    }
  ],
  "2559": [
    {
      "zh": "我们领先三分。",
      "en": "We are ahead by three points.",
      "source": "original",
      "verifiedTokens": [
        "我们",
        "领先",
        "三",
        "分"
      ]
    },
    {
      "zh": "这个公司在行业中领先。",
      "en": "This company leads its industry.",
      "source": "original",
      "verifiedTokens": [
        "这个",
        "公司",
        "在",
        "行业",
        "中",
        "领先"
      ]
    },
    {
      "zh": "他一直领先。",
      "en": "He has been in the lead all along.",
      "source": "original",
      "verifiedTokens": [
        "他",
        "一直",
        "领先"
      ]
    }
  ],
  "2570": [
    {
      "zh": "这个乡有很多人。",
      "en": "Many people live in this township.",
      "source": "original",
      "verifiedTokens": [
        "这",
        "个",
        "乡",
        "有",
        "很",
        "多",
        "人"
      ]
    },
    {
      "zh": "他是这个乡的医生。",
      "en": "He is a doctor in this township.",
      "source": "original",
      "verifiedTokens": [
        "他",
        "是",
        "这个",
        "乡",
        "的",
        "医生"
      ]
    },
    {
      "zh": "我们来到了一个小乡。",
      "en": "We arrived in a small rural township.",
      "source": "original",
      "verifiedTokens": [
        "我们",
        "来",
        "到",
        "了",
        "一",
        "个",
        "小",
        "乡"
      ]
    }
  ],
  "2573": [
    {
      "zh": "他把钱藏起来了。",
      "en": "He hid the money.",
      "source": "original",
      "verifiedTokens": [
        "他",
        "把",
        "钱",
        "藏",
        "起来",
        "了"
      ]
    },
    {
      "zh": "孩子藏在门后。",
      "en": "The child hid behind the door.",
      "source": "original",
      "verifiedTokens": [
        "孩子",
        "藏",
        "在",
        "门",
        "后"
      ]
    },
    {
      "zh": "你把书藏在哪里了？",
      "en": "Where did you hide the book?",
      "source": "original",
      "verifiedTokens": [
        "你",
        "把",
        "书",
        "藏",
        "在",
        "哪里",
        "了"
      ]
    }
  ],
  "2574": [
    {
      "zh": "具体情况如下。",
      "en": "The details are as follows.",
      "source": "original",
      "verifiedTokens": [
        "具体",
        "情况",
        "如下"
      ]
    },
    {
      "zh": "请注意以下内容，具体规定如下。",
      "en": "Please note the following; the specific rules are as follows.",
      "source": "original",
      "verifiedTokens": [
        "请",
        "注意",
        "以下",
        "内容",
        "具体",
        "规定",
        "如下"
      ]
    },
    {
      "zh": "我的计划如下。",
      "en": "My plan is as follows.",
      "source": "original",
      "verifiedTokens": [
        "我",
        "的",
        "计划",
        "如下"
      ]
    }
  ],
  "2575": [
    {
      "zh": "我们需要多沟通。",
      "en": "We need to communicate more.",
      "source": "original",
      "verifiedTokens": [
        "我们",
        "需要",
        "多",
        "沟通"
      ]
    },
    {
      "zh": "他很会跟客户沟通。",
      "en": "He is good at communicating with customers.",
      "source": "original",
      "verifiedTokens": [
        "他",
        "很",
        "会",
        "跟",
        "客户",
        "沟通"
      ]
    },
    {
      "zh": "沟通可以解决很多问题。",
      "en": "Communication can solve many problems.",
      "source": "original",
      "verifiedTokens": [
        "沟通",
        "可以",
        "解决",
        "很",
        "多",
        "问题"
      ]
    }
  ],
  "2580": [
    {
      "zh": "这两个问题很类似。",
      "en": "These two problems are very similar.",
      "source": "original",
      "verifiedTokens": [
        "这",
        "两",
        "个",
        "问题",
        "很",
        "类似"
      ]
    },
    {
      "zh": "我有类似的经验。",
      "en": "I have similar experience.",
      "source": "original",
      "verifiedTokens": [
        "我",
        "有",
        "类似",
        "的",
        "经验"
      ]
    },
    {
      "zh": "这种方法和我们的类似。",
      "en": "This method is similar to ours.",
      "source": "original",
      "verifiedTokens": [
        "这",
        "种",
        "方法",
        "和",
        "我们",
        "的",
        "类似"
      ]
    }
  ],
  "2582": [
    {
      "zh": "请把盖打开。",
      "en": "Please open the lid.",
      "source": "original",
      "verifiedTokens": [
        "请",
        "把",
        "盖",
        "打开"
      ]
    },
    {
      "zh": "他们在盖房子。",
      "en": "They are building a house.",
      "source": "original",
      "verifiedTokens": [
        "他们",
        "在",
        "盖",
        "房子"
      ]
    },
    {
      "zh": "请盖好锅。",
      "en": "Please cover the pot.",
      "source": "original",
      "verifiedTokens": [
        "请",
        "盖",
        "好",
        "锅"
      ]
    }
  ],
  "2585": [
    {
      "zh": "这次经历给我留下了深刻的印象。",
      "en": "This experience left a deep impression on me.",
      "source": "original",
      "verifiedTokens": [
        "这",
        "次",
        "经历",
        "给",
        "我",
        "留下",
        "了",
        "深刻",
        "的",
        "印象"
      ]
    },
    {
      "zh": "他对这个问题有深刻的理解。",
      "en": "He has a deep understanding of this issue.",
      "source": "original",
      "verifiedTokens": [
        "他",
        "对",
        "这个",
        "问题",
        "有",
        "深刻",
        "的",
        "理解"
      ]
    },
    {
      "zh": "这个故事的意义很深刻。",
      "en": "This story has a profound meaning.",
      "source": "original",
      "verifiedTokens": [
        "这个",
        "故事",
        "的",
        "意义",
        "很",
        "深刻"
      ]
    }
  ],
  "2586": [
    {
      "zh": "请把握这个机会。",
      "en": "Please seize this opportunity.",
      "source": "original",
      "verifiedTokens": [
        "请",
        "把握",
        "这个",
        "机会"
      ]
    },
    {
      "zh": "我对这次考试有把握。",
      "en": "I am confident about this exam.",
      "source": "original",
      "verifiedTokens": [
        "我",
        "对",
        "这",
        "次",
        "考试",
        "有",
        "把握"
      ]
    },
    {
      "zh": "他没有把握做好这件事。",
      "en": "He is not confident about doing this well.",
      "source": "original",
      "verifiedTokens": [
        "他",
        "没有",
        "把握",
        "做",
        "好",
        "这",
        "件",
        "事"
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
  "2594": [
    {
      "zh": "这里出售服装。",
      "en": "Clothes are sold here.",
      "source": "original",
      "verifiedTokens": [
        "这里",
        "出售",
        "服装"
      ]
    },
    {
      "zh": "她喜欢设计服装。",
      "en": "She likes designing clothes.",
      "source": "original",
      "verifiedTokens": [
        "她",
        "喜欢",
        "设计",
        "服装"
      ]
    },
    {
      "zh": "这家店的服装很漂亮。",
      "en": "The clothing in this shop is beautiful.",
      "source": "original",
      "verifiedTokens": [
        "这",
        "家",
        "店",
        "的",
        "服装",
        "很",
        "漂亮"
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
  "2599": [
    {
      "zh": "比赛非常激烈。",
      "en": "The competition is very intense.",
      "source": "original",
      "verifiedTokens": [
        "比赛",
        "非常",
        "激烈"
      ]
    },
    {
      "zh": "他们进行了激烈的讨论。",
      "en": "They had a heated discussion.",
      "source": "original",
      "verifiedTokens": [
        "他们",
        "进行",
        "了",
        "激烈",
        "的",
        "讨论"
      ]
    },
    {
      "zh": "市场竞争很激烈。",
      "en": "Market competition is intense.",
      "source": "original",
      "verifiedTokens": [
        "市场",
        "竞争",
        "很",
        "激烈"
      ]
    }
  ],
  "2601": [
    {
      "zh": "他不生气，反而很高兴。",
      "en": "He wasn't angry; instead, he was happy.",
      "source": "original",
      "verifiedTokens": [
        "他",
        "不",
        "生气",
        "反而",
        "很",
        "高兴"
      ]
    },
    {
      "zh": "我帮了他，他反而怪我。",
      "en": "I helped him, but he blamed me instead.",
      "source": "original",
      "verifiedTokens": [
        "我",
        "帮",
        "了",
        "他",
        "他",
        "反而",
        "怪",
        "我"
      ]
    },
    {
      "zh": "天气冷，我反而更想出门。",
      "en": "It is cold, but I actually want to go out more.",
      "source": "original",
      "verifiedTokens": [
        "天气",
        "冷",
        "我",
        "反而",
        "更",
        "想",
        "出门"
      ]
    }
  ],
  "2603": [
    {
      "zh": "锅里有水。",
      "en": "There is water in the pot.",
      "source": "original",
      "verifiedTokens": [
        "锅",
        "里",
        "有",
        "水"
      ]
    },
    {
      "zh": "妈妈用锅做饭。",
      "en": "Mum cooks using a pot.",
      "source": "original",
      "verifiedTokens": [
        "妈妈",
        "用",
        "锅",
        "做",
        "饭"
      ]
    },
    {
      "zh": "这口锅很大。",
      "en": "This pot is large.",
      "source": "original",
      "verifiedTokens": [
        "这",
        "口",
        "锅",
        "很",
        "大"
      ]
    }
  ],
  "2616": [
    {
      "zh": "这幅画的色彩很美。",
      "en": "The colors in this painting are beautiful.",
      "source": "original",
      "verifiedTokens": [
        "这",
        "幅",
        "画",
        "的",
        "色彩",
        "很",
        "美"
      ]
    },
    {
      "zh": "我喜欢这种色彩。",
      "en": "I like this kind of coloring.",
      "source": "original",
      "verifiedTokens": [
        "我",
        "喜欢",
        "这",
        "种",
        "色彩"
      ]
    },
    {
      "zh": "这个故事有个人色彩。",
      "en": "This story has a personal tone.",
      "source": "original",
      "verifiedTokens": [
        "这个",
        "故事",
        "有",
        "个人",
        "色彩"
      ]
    }
  ],
  "2621": [
    {
      "zh": "玻璃碎了。",
      "en": "The glass shattered.",
      "source": "original",
      "verifiedTokens": [
        "玻璃",
        "碎",
        "了"
      ]
    },
    {
      "zh": "请把这些东西切碎。",
      "en": "Please chop these things into small pieces.",
      "source": "original",
      "verifiedTokens": [
        "请",
        "把",
        "这些",
        "东西",
        "切",
        "碎"
      ]
    },
    {
      "zh": "这个碗摔碎了。",
      "en": "This bowl fell and broke into pieces.",
      "source": "original",
      "verifiedTokens": [
        "这个",
        "碗",
        "摔",
        "碎",
        "了"
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
    },
    {
      "zh": "他走进人群。",
      "en": "He walked into the crowd.",
      "source": "original",
      "verifiedTokens": [
        "他",
        "走",
        "进",
        "人群"
      ]
    },
    {
      "zh": "人群开始离开。",
      "en": "The crowd began to leave.",
      "source": "original",
      "verifiedTokens": [
        "人群",
        "开始",
        "离开"
      ]
    }
  ],
  "2632": [
    {
      "zh": "广场上有很多人。",
      "en": "There are many people in the square.",
      "source": "original",
      "verifiedTokens": [
        "广场",
        "上",
        "有",
        "很",
        "多",
        "人"
      ]
    },
    {
      "zh": "我们在广场见面。",
      "en": "We meet in the square.",
      "source": "original",
      "verifiedTokens": [
        "我们",
        "在",
        "广场",
        "见面"
      ]
    },
    {
      "zh": "这个广场很大。",
      "en": "This square is large.",
      "source": "original",
      "verifiedTokens": [
        "这个",
        "广场",
        "很",
        "大"
      ]
    }
  ],
  "2635": [
    {
      "zh": "这部影片很有意思。",
      "en": "This film is interesting.",
      "source": "original",
      "verifiedTokens": [
        "这",
        "部",
        "影片",
        "很",
        "有意思"
      ]
    },
    {
      "zh": "我们一起看影片。",
      "en": "Let's watch a film together.",
      "source": "original",
      "verifiedTokens": [
        "我们",
        "一起",
        "看",
        "影片"
      ]
    },
    {
      "zh": "他正在制作一部影片。",
      "en": "He is making a film.",
      "source": "original",
      "verifiedTokens": [
        "他",
        "正在",
        "制作",
        "一",
        "部",
        "影片"
      ]
    }
  ],
  "2639": [
    {
      "zh": "桌子上有灰。",
      "en": "There is dust on the table.",
      "source": "original",
      "verifiedTokens": [
        "桌子",
        "上",
        "有",
        "灰"
      ]
    },
    {
      "zh": "他穿着一件灰衣服。",
      "en": "He is wearing gray clothes.",
      "source": "original",
      "verifiedTokens": [
        "他",
        "穿",
        "着",
        "一",
        "件",
        "灰",
        "衣服"
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
  "2647": [
    {
      "zh": "他走上舞台。",
      "en": "He walked onto the stage.",
      "source": "original",
      "verifiedTokens": [
        "他",
        "走",
        "上",
        "舞台"
      ]
    },
    {
      "zh": "她在舞台上唱歌。",
      "en": "She sings on the stage.",
      "source": "original",
      "verifiedTokens": [
        "她",
        "在",
        "舞台",
        "上",
        "唱",
        "歌"
      ]
    },
    {
      "zh": "这个舞台很大。",
      "en": "This stage is large.",
      "source": "original",
      "verifiedTokens": [
        "这个",
        "舞台",
        "很",
        "大"
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
    },
    {
      "zh": "他凭自己的能力找到了工作。",
      "en": "He found work through his own ability.",
      "source": "original",
      "verifiedTokens": [
        "他",
        "凭",
        "自己",
        "的",
        "能力",
        "找",
        "到",
        "了",
        "工作"
      ]
    },
    {
      "zh": "她凭经验作出了决定。",
      "en": "She made a decision based on experience.",
      "source": "original",
      "verifiedTokens": [
        "她",
        "凭",
        "经验",
        "作出",
        "了",
        "决定"
      ]
    }
  ],
  "2649": [
    {
      "zh": "我很欣赏他的能力。",
      "en": "I really admire his ability.",
      "source": "original",
      "verifiedTokens": [
        "我",
        "很",
        "欣赏",
        "他",
        "的",
        "能力"
      ]
    },
    {
      "zh": "我们一起欣赏音乐。",
      "en": "We enjoy music together.",
      "source": "original",
      "verifiedTokens": [
        "我们",
        "一起",
        "欣赏",
        "音乐"
      ]
    },
    {
      "zh": "我欣赏你的工作态度。",
      "en": "I admire your work attitude.",
      "source": "original",
      "verifiedTokens": [
        "我",
        "欣赏",
        "你",
        "的",
        "工作",
        "态度"
      ]
    }
  ],
  "2655": [
    {
      "zh": "我早已知道了。",
      "en": "I have known for a long time.",
      "source": "original",
      "verifiedTokens": [
        "我",
        "早已",
        "知道",
        "了"
      ]
    },
    {
      "zh": "他早已离开这里。",
      "en": "He left here long ago.",
      "source": "original",
      "verifiedTokens": [
        "他",
        "早已",
        "离开",
        "这里"
      ]
    },
    {
      "zh": "我们早已做好准备。",
      "en": "We have long been ready.",
      "source": "original",
      "verifiedTokens": [
        "我们",
        "早已",
        "做",
        "好",
        "准备"
      ]
    }
  ],
  "2657": [
    {
      "zh": "他疯狂地跑。",
      "en": "He ran wildly.",
      "source": "original",
      "verifiedTokens": [
        "他",
        "疯狂",
        "地",
        "跑"
      ]
    },
    {
      "zh": "这个想法太疯狂了。",
      "en": "This idea is too crazy.",
      "source": "original",
      "verifiedTokens": [
        "这",
        "个",
        "想法",
        "太",
        "疯狂",
        "了"
      ]
    },
    {
      "zh": "他们疯狂地买东西。",
      "en": "They went on a shopping frenzy.",
      "source": "original",
      "verifiedTokens": [
        "他们",
        "疯狂",
        "地",
        "买",
        "东西"
      ]
    }
  ],
  "2661": [
    {
      "zh": "她很有个性。",
      "en": "She has a lot of personality.",
      "source": "original",
      "verifiedTokens": [
        "她",
        "很",
        "有",
        "个性"
      ]
    },
    {
      "zh": "每个人的个性不同。",
      "en": "Everyone has a different personality.",
      "source": "original",
      "verifiedTokens": [
        "每",
        "个",
        "人",
        "的",
        "个性",
        "不同"
      ]
    },
    {
      "zh": "这种设计很有个性。",
      "en": "This design has a lot of personality.",
      "source": "original",
      "verifiedTokens": [
        "这",
        "种",
        "设计",
        "很",
        "有",
        "个性"
      ]
    }
  ],
  "2662": [
    {
      "zh": "我的胃不舒服。",
      "en": "My stomach feels uncomfortable.",
      "source": "original",
      "verifiedTokens": [
        "我",
        "的",
        "胃",
        "不",
        "舒服"
      ]
    },
    {
      "zh": "他的胃很疼。",
      "en": "His stomach hurts.",
      "source": "original",
      "verifiedTokens": [
        "他",
        "的",
        "胃",
        "很",
        "疼"
      ]
    },
    {
      "zh": "吃太多对胃不好。",
      "en": "Eating too much is bad for the stomach.",
      "source": "original",
      "verifiedTokens": [
        "吃",
        "太",
        "多",
        "对",
        "胃",
        "不",
        "好"
      ]
    }
  ],
  "2665": [
    {
      "zh": "双方达成了协议。",
      "en": "Both sides reached an agreement.",
      "source": "original",
      "verifiedTokens": [
        "双方",
        "达成",
        "了",
        "协议"
      ]
    },
    {
      "zh": "我们希望达成目标。",
      "en": "We hope to reach our goal.",
      "source": "original",
      "verifiedTokens": [
        "我们",
        "希望",
        "达成",
        "目标"
      ]
    },
    {
      "zh": "他们终于达成了一致。",
      "en": "They finally reached a consensus.",
      "source": "original",
      "verifiedTokens": [
        "他们",
        "终于",
        "达成",
        "了",
        "一致"
      ]
    }
  ],
  "2667": [
    {
      "zh": "我在煮饭。",
      "en": "I am cooking rice.",
      "source": "original",
      "verifiedTokens": [
        "我",
        "在",
        "煮",
        "饭"
      ]
    },
    {
      "zh": "请把鸡蛋煮熟。",
      "en": "Please boil the egg until cooked.",
      "source": "original",
      "verifiedTokens": [
        "请",
        "把",
        "鸡蛋",
        "煮",
        "熟"
      ]
    }
  ],
  "2671": [
    {
      "zh": "今天是公司成立十周年。",
      "en": "Today is the tenth anniversary of the company's founding.",
      "source": "original",
      "verifiedTokens": [
        "今天",
        "是",
        "公司",
        "成立",
        "十",
        "周年"
      ]
    },
    {
      "zh": "我们庆祝结婚五周年。",
      "en": "We celebrate our fifth wedding anniversary.",
      "source": "original",
      "verifiedTokens": [
        "我们",
        "庆祝",
        "结婚",
        "五",
        "周年"
      ]
    }
  ],
  "2673": [
    {
      "zh": "这种行为是合法的。",
      "en": "This behavior is legal.",
      "source": "original",
      "verifiedTokens": [
        "这",
        "种",
        "行为",
        "是",
        "合法",
        "的"
      ]
    },
    {
      "zh": "他有合法的身份。",
      "en": "He has legal status.",
      "source": "original",
      "verifiedTokens": [
        "他",
        "有",
        "合法",
        "的",
        "身份"
      ]
    },
    {
      "zh": "我们要合法经营。",
      "en": "We must operate legally.",
      "source": "original",
      "verifiedTokens": [
        "我们",
        "要",
        "合法",
        "经营"
      ]
    }
  ],
  "2674": [
    {
      "zh": "这个面包太硬了。",
      "en": "This bread is too hard.",
      "source": "original",
      "verifiedTokens": [
        "这个",
        "面包",
        "太",
        "硬",
        "了"
      ]
    },
    {
      "zh": "这张床很硬。",
      "en": "This bed is hard.",
      "source": "original",
      "verifiedTokens": [
        "这",
        "张",
        "床",
        "很",
        "硬"
      ]
    },
    {
      "zh": "这块石头很硬。",
      "en": "This stone is hard.",
      "source": "original",
      "verifiedTokens": [
        "这",
        "块",
        "石头",
        "很",
        "硬"
      ]
    }
  ],
  "2675": [
    {
      "zh": "请画一个圆。",
      "en": "Please draw a circle.",
      "source": "original",
      "verifiedTokens": [
        "请",
        "画",
        "一",
        "个",
        "圆"
      ]
    },
    {
      "zh": "这张桌子是圆的。",
      "en": "This table is round.",
      "source": "original",
      "verifiedTokens": [
        "这",
        "张",
        "桌子",
        "是",
        "圆",
        "的"
      ]
    },
    {
      "zh": "月亮又大又圆。",
      "en": "The moon is big and round.",
      "source": "original",
      "verifiedTokens": [
        "月亮",
        "又",
        "大",
        "又",
        "圆"
      ]
    }
  ],
  "2681": [
    {
      "zh": "墙上有一个洞。",
      "en": "There is a hole in the wall.",
      "source": "original",
      "verifiedTokens": [
        "墙",
        "上",
        "有",
        "一",
        "个",
        "洞"
      ]
    },
    {
      "zh": "这条路上有很大的洞。",
      "en": "There is a large hole in this road.",
      "source": "original",
      "verifiedTokens": [
        "这",
        "条",
        "路",
        "上",
        "有",
        "很",
        "大",
        "的",
        "洞"
      ]
    }
  ],
  "2682": [
    {
      "zh": "他取得了很大的成就。",
      "en": "He achieved great accomplishments.",
      "source": "original",
      "verifiedTokens": [
        "他",
        "取得",
        "了",
        "很",
        "大",
        "的",
        "成就"
      ]
    },
    {
      "zh": "我为你的成就高兴。",
      "en": "I am happy about your achievements.",
      "source": "original",
      "verifiedTokens": [
        "我",
        "为",
        "你",
        "的",
        "成就",
        "高兴"
      ]
    }
  ],
  "2684": [
    {
      "zh": "他学习计算机。",
      "en": "He studies computing.",
      "source": "original",
      "verifiedTokens": [
        "他",
        "学习",
        "计算机"
      ]
    },
    {
      "zh": "这台计算机很快。",
      "en": "This computer is fast.",
      "source": "original",
      "verifiedTokens": [
        "这",
        "台",
        "计算机",
        "很",
        "快"
      ]
    },
    {
      "zh": "我用计算机工作。",
      "en": "I work using a computer.",
      "source": "original",
      "verifiedTokens": [
        "我",
        "用",
        "计算机",
        "工作"
      ]
    }
  ],
  "2694": [
    {
      "zh": "我们举行活动纪念他。",
      "en": "We hold an event to commemorate him.",
      "source": "original",
      "verifiedTokens": [
        "我们",
        "举行",
        "活动",
        "纪念",
        "他"
      ]
    },
    {
      "zh": "这张照片很有纪念意义。",
      "en": "This photo has great commemorative meaning.",
      "source": "original",
      "verifiedTokens": [
        "这",
        "张",
        "照片",
        "很",
        "有",
        "纪念",
        "意义"
      ]
    }
  ],
  "2699": [
    {
      "zh": "我们已经到达中国。",
      "en": "We have arrived in China.",
      "source": "original",
      "verifiedTokens": [
        "我们",
        "已经",
        "到达",
        "中国"
      ]
    },
    {
      "zh": "飞机下午到达。",
      "en": "The plane arrives in the afternoon.",
      "source": "original",
      "verifiedTokens": [
        "飞机",
        "下午",
        "到达"
      ]
    },
    {
      "zh": "他什么时候到达学校？",
      "en": "When will he arrive at school?",
      "source": "original",
      "verifiedTokens": [
        "他",
        "什么",
        "时候",
        "到达",
        "学校"
      ]
    }
  ],
  "2700": [
    {
      "zh": "请念这个字。",
      "en": "Please read this character aloud.",
      "source": "original",
      "verifiedTokens": [
        "请",
        "念",
        "这个",
        "字"
      ]
    },
    {
      "zh": "老师念了一篇文章。",
      "en": "The teacher read an article aloud.",
      "source": "original",
      "verifiedTokens": [
        "老师",
        "念",
        "了",
        "一",
        "篇",
        "文章"
      ]
    },
    {
      "zh": "他在中国念大学。",
      "en": "He attends university in China.",
      "source": "original",
      "verifiedTokens": [
        "他",
        "在",
        "中国",
        "念",
        "大学"
      ]
    }
  ],
  "2702": [
    {
      "zh": "请把货物放进库里。",
      "en": "Please put the goods into the warehouse.",
      "source": "original",
      "verifiedTokens": [
        "请",
        "把",
        "货物",
        "放",
        "进",
        "库",
        "里"
      ]
    },
    {
      "zh": "货物还没有出库。",
      "en": "The goods have not left the warehouse yet.",
      "source": "original",
      "verifiedTokens": [
        "货物",
        "还",
        "没有",
        "出",
        "库"
      ]
    },
    {
      "zh": "今天有新货入库。",
      "en": "New goods entered the warehouse today.",
      "source": "original",
      "verifiedTokens": [
        "今天",
        "有",
        "新",
        "货",
        "入",
        "库"
      ]
    }
  ],
  "2704": [
    {
      "zh": "请录下这个节目。",
      "en": "Please record this program.",
      "source": "original",
      "verifiedTokens": [
        "请",
        "录",
        "下",
        "这个",
        "节目"
      ]
    },
    {
      "zh": "我想录一个视频。",
      "en": "I want to record a video.",
      "source": "original",
      "verifiedTokens": [
        "我",
        "想",
        "录",
        "一",
        "个",
        "视频"
      ]
    },
    {
      "zh": "他正在录节目。",
      "en": "He is recording a program.",
      "source": "original",
      "verifiedTokens": [
        "他",
        "正在",
        "录",
        "节目"
      ]
    }
  ],
  "2707": [
    {
      "zh": "我们换一个话题吧。",
      "en": "Let's change the subject.",
      "source": "original",
      "verifiedTokens": [
        "我们",
        "换",
        "一",
        "个",
        "话题",
        "吧"
      ]
    },
    {
      "zh": "这是很有意思的话题。",
      "en": "This is an interesting topic.",
      "source": "original",
      "verifiedTokens": [
        "这",
        "是",
        "很",
        "有意思",
        "的",
        "话题"
      ]
    },
    {
      "zh": "大家在讨论这个话题。",
      "en": "Everyone is discussing this topic.",
      "source": "original",
      "verifiedTokens": [
        "大家",
        "在",
        "讨论",
        "这个",
        "话题"
      ]
    }
  ],
  "2709": [
    {
      "zh": "请把手上下移动。",
      "en": "Please move your hand up and down.",
      "source": "original",
      "verifiedTokens": [
        "请",
        "把",
        "手",
        "上下",
        "移动"
      ]
    },
    {
      "zh": "公司上下都很忙。",
      "en": "Everyone in the company is busy.",
      "source": "original",
      "verifiedTokens": [
        "公司",
        "上下",
        "都",
        "很",
        "忙"
      ]
    },
    {
      "zh": "他上下看了我一眼。",
      "en": "He looked me up and down.",
      "source": "original",
      "verifiedTokens": [
        "他",
        "上下",
        "看",
        "了",
        "我",
        "一",
        "眼"
      ]
    }
  ],
  "2710": [
    {
      "zh": "请替我谢谢他。",
      "en": "Please thank him for me.",
      "source": "original",
      "verifiedTokens": [
        "请",
        "替",
        "我",
        "谢谢",
        "他"
      ]
    },
    {
      "zh": "我替你买票。",
      "en": "I will buy a ticket for you.",
      "source": "original",
      "verifiedTokens": [
        "我",
        "替",
        "你",
        "买",
        "票"
      ]
    },
    {
      "zh": "她替我完成了任务。",
      "en": "She completed the task for me.",
      "source": "original",
      "verifiedTokens": [
        "她",
        "替",
        "我",
        "完成",
        "了",
        "任务"
      ]
    }
  ],
  "2712": [
    {
      "zh": "他亲自来了。",
      "en": "He came personally.",
      "source": "original",
      "verifiedTokens": [
        "他",
        "亲自",
        "来",
        "了"
      ]
    },
    {
      "zh": "经理亲自检查产品。",
      "en": "The manager personally inspected the products.",
      "source": "original",
      "verifiedTokens": [
        "经理",
        "亲自",
        "检查",
        "产品"
      ]
    },
    {
      "zh": "我要亲自告诉你。",
      "en": "I want to tell you in person.",
      "source": "original",
      "verifiedTokens": [
        "我",
        "要",
        "亲自",
        "告诉",
        "你"
      ]
    }
  ],
  "2719": [
    {
      "zh": "我们可以改变自己的命运。",
      "en": "We can change our own destiny.",
      "source": "original",
      "verifiedTokens": [
        "我们",
        "可以",
        "改变",
        "自己",
        "的",
        "命运"
      ]
    },
    {
      "zh": "这是他的命运。",
      "en": "This is his fate.",
      "source": "original",
      "verifiedTokens": [
        "这",
        "是",
        "他",
        "的",
        "命运"
      ]
    },
    {
      "zh": "他不相信命运。",
      "en": "He does not believe in fate.",
      "source": "original",
      "verifiedTokens": [
        "他",
        "不",
        "相信",
        "命运"
      ]
    }
  ],
  "2720": [
    {
      "zh": "他们拼了一辆车。",
      "en": "They shared a ride.",
      "source": "original",
      "verifiedTokens": [
        "他们",
        "拼",
        "了",
        "一",
        "辆",
        "车"
      ]
    },
    {
      "zh": "请把这两块拼在一起。",
      "en": "Please join these two pieces together.",
      "source": "original",
      "verifiedTokens": [
        "请",
        "把",
        "这",
        "两",
        "块",
        "拼",
        "在",
        "一起"
      ]
    },
    {
      "zh": "大家为目标一起拼。",
      "en": "Everyone strives together for the goal.",
      "source": "original",
      "verifiedTokens": [
        "大家",
        "为",
        "目标",
        "一起",
        "拼"
      ]
    }
  ],
  "2723": [
    {
      "zh": "我有一个愿望。",
      "en": "I have a wish.",
      "source": "original",
      "verifiedTokens": [
        "我",
        "有",
        "一",
        "个",
        "愿望"
      ]
    },
    {
      "zh": "他的愿望实现了。",
      "en": "His wish came true.",
      "source": "original",
      "verifiedTokens": [
        "他",
        "的",
        "愿望",
        "实现",
        "了"
      ]
    },
    {
      "zh": "你最大的愿望是什么？",
      "en": "What is your greatest wish?",
      "source": "original",
      "verifiedTokens": [
        "你",
        "最",
        "大",
        "的",
        "愿望",
        "是",
        "什么"
      ]
    }
  ],
  "2725": [
    {
      "zh": "你要坚强。",
      "en": "You must be strong.",
      "source": "original",
      "verifiedTokens": [
        "你",
        "要",
        "坚强"
      ]
    },
    {
      "zh": "她是一个坚强的人。",
      "en": "She is a strong person.",
      "source": "original",
      "verifiedTokens": [
        "她",
        "是",
        "一",
        "个",
        "坚强",
        "的",
        "人"
      ]
    },
    {
      "zh": "他变得更坚强了。",
      "en": "He became stronger.",
      "source": "original",
      "verifiedTokens": [
        "他",
        "变",
        "得",
        "更",
        "坚强",
        "了"
      ]
    }
  ],
  "2726": [
    {
      "zh": "请看屏幕。",
      "en": "Please look at the screen.",
      "source": "original",
      "verifiedTokens": [
        "请",
        "看",
        "屏幕"
      ]
    },
    {
      "zh": "手机屏幕太小了。",
      "en": "The phone screen is too small.",
      "source": "original",
      "verifiedTokens": [
        "手机",
        "屏幕",
        "太",
        "小",
        "了"
      ]
    },
    {
      "zh": "屏幕上有一行字。",
      "en": "There is a line of characters on the screen.",
      "source": "original",
      "verifiedTokens": [
        "屏幕",
        "上",
        "有",
        "一",
        "行",
        "字"
      ]
    }
  ],
  "2727": [
    {
      "zh": "这简直太好了！",
      "en": "This is simply wonderful!",
      "source": "original",
      "verifiedTokens": [
        "这",
        "简直",
        "太",
        "好",
        "了"
      ]
    },
    {
      "zh": "我简直不敢相信。",
      "en": "I simply cannot believe it.",
      "source": "original",
      "verifiedTokens": [
        "我",
        "简直",
        "不",
        "敢",
        "相信"
      ]
    },
    {
      "zh": "他简直像个孩子。",
      "en": "He is just like a child.",
      "source": "original",
      "verifiedTokens": [
        "他",
        "简直",
        "像",
        "个",
        "孩子"
      ]
    }
  ],
  "2731": [
    {
      "zh": "这个群体很年轻。",
      "en": "This group is young.",
      "source": "original",
      "verifiedTokens": [
        "这",
        "个",
        "群体",
        "很",
        "年轻"
      ]
    },
    {
      "zh": "不同群体有不同的需要。",
      "en": "Different groups have different needs.",
      "source": "original",
      "verifiedTokens": [
        "不同",
        "群体",
        "有",
        "不同",
        "的",
        "需要"
      ]
    },
    {
      "zh": "我们要了解这个群体。",
      "en": "We need to understand this group.",
      "source": "original",
      "verifiedTokens": [
        "我们",
        "要",
        "了解",
        "这个",
        "群体"
      ]
    }
  ],
  "2735": [
    {
      "zh": "这本书很薄。",
      "en": "This book is thin.",
      "source": "original",
      "verifiedTokens": [
        "这",
        "本",
        "书",
        "很",
        "薄"
      ]
    },
    {
      "zh": "这件衣服太薄了。",
      "en": "This garment is too thin.",
      "source": "original",
      "verifiedTokens": [
        "这",
        "件",
        "衣服",
        "太",
        "薄",
        "了"
      ]
    },
    {
      "zh": "请给我一张薄纸。",
      "en": "Please give me a thin sheet of paper.",
      "source": "original",
      "verifiedTokens": [
        "请",
        "给",
        "我",
        "一",
        "张",
        "薄",
        "纸"
      ]
    }
  ],
  "2736": [
    {
      "zh": "她流下了眼泪。",
      "en": "She shed tears.",
      "source": "original",
      "verifiedTokens": [
        "她",
        "流",
        "下",
        "了",
        "眼泪"
      ]
    },
    {
      "zh": "他的眼泪掉了下来。",
      "en": "His tears fell.",
      "source": "original",
      "verifiedTokens": [
        "他",
        "的",
        "眼泪",
        "掉",
        "了",
        "下来"
      ]
    },
    {
      "zh": "请擦一下眼泪。",
      "en": "Please wipe away your tears.",
      "source": "original",
      "verifiedTokens": [
        "请",
        "擦",
        "一下",
        "眼泪"
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
    },
    {
      "zh": "外面下了一阵雨。",
      "en": "It rained outside for a while.",
      "source": "original",
      "verifiedTokens": [
        "外面",
        "下",
        "了",
        "一",
        "阵",
        "雨"
      ]
    },
    {
      "zh": "外面有一阵响声。",
      "en": "There was a burst of noise outside.",
      "source": "original",
      "verifiedTokens": [
        "外面",
        "有",
        "一",
        "阵",
        "响声"
      ]
    }
  ],
  "2742": [
    {
      "zh": "请挑一个你喜欢的。",
      "en": "Please pick one you like.",
      "source": "original",
      "verifiedTokens": [
        "请",
        "挑",
        "一",
        "个",
        "你",
        "喜欢",
        "的"
      ]
    },
    {
      "zh": "她正在挑衣服。",
      "en": "She is choosing clothes.",
      "source": "original",
      "verifiedTokens": [
        "她",
        "正在",
        "挑",
        "衣服"
      ]
    },
    {
      "zh": "我挑了两个苹果。",
      "en": "I picked two apples.",
      "source": "original",
      "verifiedTokens": [
        "我",
        "挑",
        "了",
        "两",
        "个",
        "苹果"
      ]
    }
  ],
  "2743": [
    {
      "zh": "他有无数个问题。",
      "en": "He has countless questions.",
      "source": "original",
      "verifiedTokens": [
        "他",
        "有",
        "无数",
        "个",
        "问题"
      ]
    },
    {
      "zh": "天上有无数颗星星。",
      "en": "There are countless stars in the sky.",
      "source": "original",
      "verifiedTokens": [
        "天",
        "上",
        "有",
        "无数",
        "颗",
        "星星"
      ]
    },
    {
      "zh": "我试过无数次。",
      "en": "I have tried countless times.",
      "source": "original",
      "verifiedTokens": [
        "我",
        "试",
        "过",
        "无数",
        "次"
      ]
    }
  ],
  "2744": [
    {
      "zh": "我们需要证据。",
      "en": "We need evidence.",
      "source": "original",
      "verifiedTokens": [
        "我们",
        "需要",
        "证据"
      ]
    },
    {
      "zh": "他没有证据。",
      "en": "He has no evidence.",
      "source": "original",
      "verifiedTokens": [
        "他",
        "没有",
        "证据"
      ]
    },
    {
      "zh": "这张照片就是证据。",
      "en": "This photo is the evidence.",
      "source": "original",
      "verifiedTokens": [
        "这",
        "张",
        "照片",
        "就",
        "是",
        "证据"
      ]
    }
  ],
  "2752": [
    {
      "zh": "水对人体很重要。",
      "en": "Water is important for the human body.",
      "source": "original",
      "verifiedTokens": [
        "水",
        "对",
        "人体",
        "很",
        "重要"
      ]
    },
    {
      "zh": "运动对人体有好处。",
      "en": "Exercise is good for the human body.",
      "source": "original",
      "verifiedTokens": [
        "运动",
        "对",
        "人体",
        "有",
        "好处"
      ]
    },
    {
      "zh": "他正在研究人体。",
      "en": "He is studying the human body.",
      "source": "original",
      "verifiedTokens": [
        "他",
        "正在",
        "研究",
        "人体"
      ]
    }
  ],
  "2753": [
    {
      "zh": "这朵花是紫的。",
      "en": "This flower is purple.",
      "source": "original",
      "verifiedTokens": [
        "这",
        "朵",
        "花",
        "是",
        "紫",
        "的"
      ]
    },
    {
      "zh": "她穿了紫衣服。",
      "en": "She wore purple clothes.",
      "source": "original",
      "verifiedTokens": [
        "她",
        "穿",
        "了",
        "紫",
        "衣服"
      ]
    },
    {
      "zh": "这个颜色有点儿紫。",
      "en": "This color is somewhat purple.",
      "source": "original",
      "verifiedTokens": [
        "这个",
        "颜色",
        "有点儿",
        "紫"
      ]
    }
  ],
  "2755": [
    {
      "zh": "这个项目带动了经济发展。",
      "en": "This project drove economic development.",
      "source": "original",
      "verifiedTokens": [
        "这个",
        "项目",
        "带动",
        "了",
        "经济",
        "发展"
      ]
    },
    {
      "zh": "新产品带动了销售。",
      "en": "The new product boosted sales.",
      "source": "original",
      "verifiedTokens": [
        "新",
        "产品",
        "带动",
        "了",
        "销售"
      ]
    },
    {
      "zh": "他带动大家一起学习。",
      "en": "He motivated everyone to study together.",
      "source": "original",
      "verifiedTokens": [
        "他",
        "带动",
        "大家",
        "一起",
        "学习"
      ]
    }
  ],
  "2756": [
    {
      "zh": "大众对这件事很感兴趣。",
      "en": "The general public is interested in this matter.",
      "source": "original",
      "verifiedTokens": [
        "大众",
        "对",
        "这",
        "件",
        "事",
        "很",
        "感兴趣"
      ]
    },
    {
      "zh": "这个产品受到大众欢迎。",
      "en": "This product is popular with the public.",
      "source": "original",
      "verifiedTokens": [
        "这个",
        "产品",
        "受到",
        "大众",
        "欢迎"
      ]
    },
    {
      "zh": "这是为大众提供的服务。",
      "en": "This is a service provided to the public.",
      "source": "original",
      "verifiedTokens": [
        "这",
        "是",
        "为",
        "大众",
        "提供",
        "的",
        "服务"
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
    },
    {
      "zh": "我不能再忍了。",
      "en": "I can't stand it anymore.",
      "source": "original",
      "verifiedTokens": [
        "我",
        "不",
        "能",
        "再",
        "忍",
        "了"
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
    },
    {
      "zh": "他撞了门。",
      "en": "He bumped into the door.",
      "source": "original",
      "verifiedTokens": [
        "他",
        "撞",
        "了",
        "门"
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
    },
    {
      "zh": "时间不是无限的。",
      "en": "Time is not unlimited.",
      "source": "original",
      "verifiedTokens": [
        "时间",
        "不",
        "是",
        "无限",
        "的"
      ]
    },
    {
      "zh": "这里的空间不是无限的。",
      "en": "The space here is not unlimited.",
      "source": "original",
      "verifiedTokens": [
        "这里",
        "的",
        "空间",
        "不",
        "是",
        "无限",
        "的"
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
    },
    {
      "zh": "这份文件还没有签。",
      "en": "This document has not been signed yet.",
      "source": "original",
      "verifiedTokens": [
        "这",
        "份",
        "文件",
        "还",
        "没有",
        "签"
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
    },
    {
      "zh": "苹果滚到地上了。",
      "en": "The apple rolled onto the ground.",
      "source": "original",
      "verifiedTokens": [
        "苹果",
        "滚",
        "到",
        "地",
        "上",
        "了"
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
    },
    {
      "zh": "我买了一些种子。",
      "en": "I bought some seeds.",
      "source": "original",
      "verifiedTokens": [
        "我",
        "买",
        "了",
        "一些",
        "种子"
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
    },
    {
      "zh": "请把桌子移到这里。",
      "en": "Please move the table here.",
      "source": "original",
      "verifiedTokens": [
        "请",
        "把",
        "桌子",
        "移",
        "到",
        "这里"
      ]
    },
    {
      "zh": "请向左移一点儿。",
      "en": "Please move a little to the left.",
      "source": "original",
      "verifiedTokens": [
        "请",
        "向",
        "左",
        "移",
        "一点儿"
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
    },
    {
      "zh": "天空中有很多云。",
      "en": "There are many clouds in the sky.",
      "source": "original",
      "verifiedTokens": [
        "天空",
        "中",
        "有",
        "很",
        "多",
        "云"
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
    },
    {
      "zh": "我们在等下一辆列车。",
      "en": "We are waiting for the next train.",
      "source": "original",
      "verifiedTokens": [
        "我们",
        "在",
        "等",
        "下",
        "一",
        "辆",
        "列车"
      ]
    },
    {
      "zh": "这辆列车很快。",
      "en": "This train is fast.",
      "source": "original",
      "verifiedTokens": [
        "这",
        "辆",
        "列车",
        "很",
        "快"
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
    },
    {
      "zh": "这个电池没有电了。",
      "en": "This battery is dead.",
      "source": "original",
      "verifiedTokens": [
        "这个",
        "电池",
        "没有",
        "电",
        "了"
      ]
    },
    {
      "zh": "我需要换一个电池。",
      "en": "I need to replace a battery.",
      "source": "original",
      "verifiedTokens": [
        "我",
        "需要",
        "换",
        "一",
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
    },
    {
      "zh": "这次罚款是一百元。",
      "en": "This fine is one hundred yuan.",
      "source": "original",
      "verifiedTokens": [
        "这",
        "次",
        "罚款",
        "是",
        "一",
        "百",
        "元"
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
    },
    {
      "zh": "我认错人了。",
      "en": "I mistook someone for another person.",
      "source": "original",
      "verifiedTokens": [
        "我",
        "认",
        "错",
        "人",
        "了"
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
    },
    {
      "zh": "我不一定要买名牌。",
      "en": "I don't necessarily need to buy famous brands.",
      "source": "original",
      "verifiedTokens": [
        "我",
        "不",
        "一定",
        "要",
        "买",
        "名牌"
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
    },
    {
      "zh": "货物已经到了。",
      "en": "The goods have arrived.",
      "source": "original",
      "verifiedTokens": [
        "货物",
        "已经",
        "到",
        "了"
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
    },
    {
      "zh": "他买了一盆花。",
      "en": "He bought a pot of flowers.",
      "source": "original",
      "verifiedTokens": [
        "他",
        "买",
        "了",
        "一",
        "盆",
        "花"
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
    },
    {
      "zh": "我们不知道这里的深度。",
      "en": "We don't know the depth here.",
      "source": "original",
      "verifiedTokens": [
        "我们",
        "不",
        "知道",
        "这里",
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
    },
    {
      "zh": "学习有很多乐趣。",
      "en": "Studying is a lot of fun.",
      "source": "original",
      "verifiedTokens": [
        "学习",
        "有",
        "很",
        "多",
        "乐趣"
      ]
    },
    {
      "zh": "我在工作中感受到了乐趣。",
      "en": "I experienced enjoyment in my work.",
      "source": "original",
      "verifiedTokens": [
        "我",
        "在",
        "工作",
        "中",
        "感受",
        "到",
        "了",
        "乐趣"
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
    },
    {
      "zh": "请伸出你的腿。",
      "en": "Please extend your leg.",
      "source": "original",
      "verifiedTokens": [
        "请",
        "伸",
        "出",
        "你",
        "的",
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
    },
    {
      "zh": "她的眼睛里有泪水。",
      "en": "There were tears in her eyes.",
      "source": "original",
      "verifiedTokens": [
        "她",
        "的",
        "眼睛",
        "里",
        "有",
        "泪水"
      ]
    },
    {
      "zh": "她用手擦去泪水。",
      "en": "She wiped away her tears with her hand.",
      "source": "original",
      "verifiedTokens": [
        "她",
        "用",
        "手",
        "擦",
        "去",
        "泪水"
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
    },
    {
      "zh": "桌子上有一束花。",
      "en": "There is a bouquet on the table.",
      "source": "original",
      "verifiedTokens": [
        "桌子",
        "上",
        "有",
        "一",
        "束",
        "花"
      ]
    },
    {
      "zh": "我买了两束花。",
      "en": "I bought two bouquets.",
      "source": "original",
      "verifiedTokens": [
        "我",
        "买",
        "了",
        "两",
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
    },
    {
      "zh": "昨天下了暴雨。",
      "en": "There was a rainstorm yesterday.",
      "source": "original",
      "verifiedTokens": [
        "昨天",
        "下",
        "了",
        "暴雨"
      ]
    },
    {
      "zh": "暴雨很快就过去了。",
      "en": "The rainstorm passed quickly.",
      "source": "original",
      "verifiedTokens": [
        "暴雨",
        "很",
        "快",
        "就",
        "过去",
        "了"
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
    },
    {
      "zh": "我们春天去公园赏花。",
      "en": "In spring we go to the park to admire flowers.",
      "source": "original",
      "verifiedTokens": [
        "我们",
        "春天",
        "去",
        "公园",
        "赏",
        "花"
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
    },
    {
      "zh": "我看到了你的留言。",
      "en": "I saw your message.",
      "source": "original",
      "verifiedTokens": [
        "我",
        "看",
        "到",
        "了",
        "你",
        "的",
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
    },
    {
      "zh": "他把水洒在地上。",
      "en": "He spilled water on the ground.",
      "source": "original",
      "verifiedTokens": [
        "他",
        "把",
        "水",
        "洒",
        "在",
        "地",
        "上"
      ]
    },
    {
      "zh": "她在花上洒了一些水。",
      "en": "She sprinkled some water on the flowers.",
      "source": "original",
      "verifiedTokens": [
        "她",
        "在",
        "花",
        "上",
        "洒",
        "了",
        "一些",
        "水"
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
    },
    {
      "zh": "她有很多职场经验。",
      "en": "She has lots of workplace experience.",
      "source": "original",
      "verifiedTokens": [
        "她",
        "有",
        "很",
        "多",
        "职场",
        "经验"
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
    },
    {
      "zh": "我买了几张邮票。",
      "en": "I bought several stamps.",
      "source": "original",
      "verifiedTokens": [
        "我",
        "买",
        "了",
        "几",
        "张",
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
    },
    {
      "zh": "这里有开水吗？",
      "en": "Is there boiled water here?",
      "source": "original",
      "verifiedTokens": [
        "这里",
        "有",
        "开水",
        "吗"
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
    },
    {
      "zh": "除夕我们一起吃饭。",
      "en": "We eat together on Lunar New Year's Eve.",
      "source": "original",
      "verifiedTokens": [
        "除夕",
        "我们",
        "一起",
        "吃",
        "饭"
      ]
    },
    {
      "zh": "除夕晚上他回家了。",
      "en": "He returned home on Lunar New Year's Eve.",
      "source": "original",
      "verifiedTokens": [
        "除夕",
        "晚上",
        "他",
        "回",
        "家",
        "了"
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
    },
    {
      "zh": "孩子买了一个气球。",
      "en": "The child bought a balloon.",
      "source": "original",
      "verifiedTokens": [
        "孩子",
        "买",
        "了",
        "一",
        "个",
        "气球"
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
    },
    {
      "zh": "这把剪刀很好用。",
      "en": "These scissors are easy to use.",
      "source": "original",
      "verifiedTokens": [
        "这",
        "把",
        "剪刀",
        "很",
        "好",
        "用"
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
    },
    {
      "zh": "中国有很多胡同。",
      "en": "China has many hutongs.",
      "source": "original",
      "verifiedTokens": [
        "中国",
        "有",
        "很",
        "多",
        "胡同"
      ]
    },
    {
      "zh": "我们走进一条胡同。",
      "en": "We walked into an alley.",
      "source": "original",
      "verifiedTokens": [
        "我们",
        "走",
        "进",
        "一",
        "条",
        "胡同"
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
    },
    {
      "zh": "他不了解事情的轻重。",
      "en": "He does not understand how serious the matter is.",
      "source": "original",
      "verifiedTokens": [
        "他",
        "不",
        "了解",
        "事情",
        "的",
        "轻重"
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
    },
    {
      "zh": "他拿到了驾照。",
      "en": "He got his driver's license.",
      "source": "original",
      "verifiedTokens": [
        "他",
        "拿",
        "到",
        "了",
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
    },
    {
      "zh": "他听到了响声。",
      "en": "He heard a noise.",
      "source": "original",
      "verifiedTokens": [
        "他",
        "听",
        "到",
        "了",
        "响声"
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
    },
    {
      "zh": "这是一个久远的故事。",
      "en": "This is a story from long ago.",
      "source": "original",
      "verifiedTokens": [
        "这",
        "是",
        "一",
        "个",
        "久远",
        "的",
        "故事"
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
    },
    {
      "zh": "我买了一把尺子。",
      "en": "I bought a ruler.",
      "source": "original",
      "verifiedTokens": [
        "我",
        "买",
        "了",
        "一",
        "把",
        "尺子"
      ]
    },
    {
      "zh": "这把尺子有二十厘米长。",
      "en": "This ruler is twenty centimeters long.",
      "source": "original",
      "verifiedTokens": [
        "这",
        "把",
        "尺子",
        "有",
        "二",
        "十",
        "厘米",
        "长"
      ]
    }
  ]
};
