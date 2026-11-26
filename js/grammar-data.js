// Original grammar examples; explicit syllabus token boundaries.
export const GRAMMAR = [
  {
    "id": "wei-beneficiary",
    "word": "为",
    "level": 3,
    "pattern": "为 + person + action",
    "meaning": "wèi · for someone",
    "explain": "为 introduces the beneficiary or person concerned. 为了 introduces a purpose.",
    "distractors": [
      "从",
      "对"
    ],
    "contrast": "For whom is the action done?",
    "examples": [
      {
        "zh": "我为你感到高兴。",
        "en": "I am happy for you.",
        "tokens": [
          "我",
          "为",
          "你",
          "感到",
          "高兴"
        ]
      },
      {
        "zh": "他为孩子买了书。",
        "en": "He bought books for his child.",
        "tokens": [
          "他",
          "为",
          "孩子",
          "买",
          "了",
          "书"
        ]
      },
      {
        "zh": "她为大家服务。",
        "en": "She serves everyone.",
        "tokens": [
          "她",
          "为",
          "大家",
          "服务"
        ]
      }
    ]
  },
  {
    "id": "wei-purpose",
    "word": "为了",
    "level": 3,
    "pattern": "为了 + goal，action",
    "meaning": "wèi le · in order to",
    "explain": "为了 marks a goal, not a cause that has already occurred. Compare 因为 (because).",
    "distractors": [
      "因为",
      "除了"
    ],
    "contrast": "What is the purpose of the action?",
    "examples": [
      {
        "zh": "为了学好汉语，我每天练习。",
        "en": "I practise every day to learn Chinese well.",
        "tokens": [
          "为了",
          "学",
          "好",
          "汉语",
          "我",
          "每",
          "天",
          "练习"
        ]
      },
      {
        "zh": "为了买书，他去了学校。",
        "en": "He went to school to buy books.",
        "tokens": [
          "为了",
          "买",
          "书",
          "他",
          "去",
          "了",
          "学校"
        ]
      },
      {
        "zh": "为了身体好，她每天运动。",
        "en": "She exercises every day for her health.",
        "tokens": [
          "为了",
          "身体",
          "好",
          "她",
          "每",
          "天",
          "运动"
        ]
      }
    ]
  },
  {
    "id": "er-contrast",
    "word": "而",
    "level": 4,
    "pattern": "A，而 B",
    "meaning": "ér · whereas",
    "explain": "而 connects contrasting facts, often in written Chinese. 而且 adds information.",
    "distractors": [
      "与",
      "为"
    ],
    "contrast": "Which word marks a contrast between two facts?",
    "examples": [
      {
        "zh": "他喜欢茶，而我喜欢水。",
        "en": "He likes tea, whereas I like water.",
        "tokens": [
          "他",
          "喜欢",
          "茶",
          "而",
          "我",
          "喜欢",
          "水"
        ]
      },
      {
        "zh": "我想去，而他不想去。",
        "en": "I want to go, whereas he does not.",
        "tokens": [
          "我",
          "想",
          "去",
          "而",
          "他",
          "不",
          "想",
          "去"
        ]
      },
      {
        "zh": "她很忙，而我很有时间。",
        "en": "She is busy, whereas I have plenty of time.",
        "tokens": [
          "她",
          "很",
          "忙",
          "而",
          "我",
          "很",
          "有",
          "时间"
        ]
      }
    ]
  },
  {
    "id": "er-correction",
    "word": "而",
    "level": 4,
    "pattern": "不是 A，而是 B",
    "meaning": "ér · but rather",
    "explain": "The first explanation is rejected and replaced by the second. 但是 does not form this fixed correction pattern.",
    "distractors": [
      "与",
      "由"
    ],
    "contrast": "Which structure rejects A and replaces it with B?",
    "examples": [
      {
        "zh": "这不是钱的问题，而是时间的问题。",
        "en": "It is not a question of money, but of time.",
        "tokens": [
          "这",
          "不",
          "是",
          "钱",
          "的",
          "问题",
          "而",
          "是",
          "时间",
          "的",
          "问题"
        ]
      },
      {
        "zh": "我不是不想去，而是没有时间。",
        "en": "It is not that I do not want to go; I have no time.",
        "tokens": [
          "我",
          "不",
          "是",
          "不",
          "想",
          "去",
          "而",
          "是",
          "没有",
          "时间"
        ]
      },
      {
        "zh": "他不是老师，而是医生。",
        "en": "He is not a teacher but a doctor.",
        "tokens": [
          "他",
          "不",
          "是",
          "老师",
          "而",
          "是",
          "医生"
        ]
      }
    ]
  },
  {
    "id": "er-quality",
    "word": "而",
    "level": 4,
    "pattern": "adjective + 而 + adjective",
    "meaning": "ér · and",
    "explain": "而 can join two descriptive qualities in concise written Chinese.",
    "distractors": [
      "为",
      "由"
    ],
    "contrast": "Which connector links two descriptive qualities?",
    "examples": [
      {
        "zh": "房间简单而漂亮。",
        "en": "The room is simple and beautiful.",
        "tokens": [
          "房间",
          "简单",
          "而",
          "漂亮"
        ]
      },
      {
        "zh": "这里安静而干净。",
        "en": "It is quiet and clean here.",
        "tokens": [
          "这里",
          "安静",
          "而",
          "干净"
        ]
      },
      {
        "zh": "她说话简单而清楚。",
        "en": "She speaks simply and clearly.",
        "tokens": [
          "她",
          "说话",
          "简单",
          "而",
          "清楚"
        ]
      }
    ]
  },
  {
    "id": "yu-link",
    "word": "与",
    "level": 4,
    "pattern": "A 与 B / 与 + person + action",
    "meaning": "yǔ · and / with",
    "explain": "与 is more formal than 和 or 跟. It links nouns or introduces a person involved.",
    "distractors": [
      "而",
      "由"
    ],
    "contrast": "Which word can formally mean and or with?",
    "examples": [
      {
        "zh": "工作与生活都很重要。",
        "en": "Work and life are both important.",
        "tokens": [
          "工作",
          "与",
          "生活",
          "都",
          "很",
          "重要"
        ]
      },
      {
        "zh": "我想与你一起工作。",
        "en": "I want to work with you.",
        "tokens": [
          "我",
          "想",
          "与",
          "你",
          "一起",
          "工作"
        ]
      },
      {
        "zh": "这件事与我有关。",
        "en": "This matter concerns me.",
        "tokens": [
          "这",
          "件",
          "事",
          "与",
          "我",
          "有关"
        ]
      }
    ]
  },
  {
    "id": "you-agent",
    "word": "由",
    "level": 4,
    "pattern": "事情 + 由 + person + action",
    "meaning": "yóu · by / assigned to",
    "explain": "由 introduces the person responsible for an action. 与 introduces a companion.",
    "distractors": [
      "与",
      "而"
    ],
    "contrast": "Which word introduces the person responsible?",
    "examples": [
      {
        "zh": "这件事由我负责。",
        "en": "I am responsible for this matter.",
        "tokens": [
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
        "en": "The school holds the competition.",
        "tokens": [
          "比赛",
          "由",
          "学校",
          "举行"
        ]
      },
      {
        "zh": "这个问题由老师回答。",
        "en": "The teacher will answer this question.",
        "tokens": [
          "这",
          "个",
          "问题",
          "由",
          "老师",
          "回答"
        ]
      }
    ]
  },
  {
    "id": "yi-means",
    "word": "以",
    "level": 5,
    "pattern": "以 + means / standard + action",
    "meaning": "yǐ · by means of / using",
    "explain": "以 is a formal way to express method or standard. 用 is often the conversational equivalent.",
    "distractors": [
      "与",
      "而"
    ],
    "contrast": "Which formal word introduces a method or standard?",
    "examples": [
      {
        "zh": "请以这种方式回答。",
        "en": "Please answer in this way.",
        "tokens": [
          "请",
          "以",
          "这",
          "种",
          "方式",
          "回答"
        ]
      },
      {
        "zh": "价格以人民币表示。",
        "en": "Prices are expressed in renminbi.",
        "tokens": [
          "价格",
          "以",
          "人民币",
          "表示"
        ]
      },
      {
        "zh": "我们以客户的需要为目标。",
        "en": "We take customers’ needs as our goal.",
        "tokens": [
          "我们",
          "以",
          "客户",
          "的",
          "需要",
          "为",
          "目标"
        ]
      }
    ]
  },
  {
    "id": "ji-list",
    "word": "及",
    "level": 5,
    "pattern": "A 及 B",
    "meaning": "jí · and",
    "explain": "及 joins nouns in formal lists, unlike 而, which often connects clauses or descriptions.",
    "distractors": [
      "而",
      "由"
    ],
    "contrast": "Which connector is commonly used in formal lists?",
    "examples": [
      {
        "zh": "请准备书及笔。",
        "en": "Please prepare books and pens.",
        "tokens": [
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
        "tokens": [
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
        "tokens": [
          "请",
          "写",
          "姓名",
          "及",
          "电话"
        ]
      }
    ]
  },
  {
    "id": "jiran",
    "word": "既然",
    "level": 4,
    "pattern": "既然 A，就 B",
    "meaning": "jì rán · since",
    "explain": "既然 accepts an established fact and uses it as the basis for a decision. 即使 introduces a hypothetical obstacle.",
    "distractors": [
      "即使",
      "不管"
    ],
    "contrast": "Which word assumes A is already true?",
    "examples": [
      {
        "zh": "既然你来了，就一起吃饭吧。",
        "en": "Since you are here, let us eat together.",
        "tokens": [
          "既然",
          "你",
          "来",
          "了",
          "就",
          "一起",
          "吃",
          "饭",
          "吧"
        ]
      },
      {
        "zh": "既然下雨了，我们就不去了。",
        "en": "Since it is raining, we will not go.",
        "tokens": [
          "既然",
          "下雨",
          "了",
          "我们",
          "就",
          "不",
          "去",
          "了"
        ]
      },
      {
        "zh": "既然你不知道，就问老师吧。",
        "en": "Since you do not know, ask the teacher.",
        "tokens": [
          "既然",
          "你",
          "不",
          "知道",
          "就",
          "问",
          "老师",
          "吧"
        ]
      }
    ]
  },
  {
    "id": "buguan",
    "word": "不管",
    "level": 4,
    "pattern": "不管 A，都 B",
    "meaning": "bù guǎn · no matter",
    "explain": "不管 introduces alternatives or uncertainty; the result stays the same. 既然 starts from an established fact.",
    "distractors": [
      "既然",
      "由于"
    ],
    "contrast": "Which word means no matter what?",
    "examples": [
      {
        "zh": "不管天气怎么样，我都去。",
        "en": "No matter what the weather is like, I will go.",
        "tokens": [
          "不管",
          "天气",
          "怎么样",
          "我",
          "都",
          "去"
        ]
      },
      {
        "zh": "不管多忙，他都会学习。",
        "en": "No matter how busy he is, he studies.",
        "tokens": [
          "不管",
          "多",
          "忙",
          "他",
          "都",
          "会",
          "学习"
        ]
      },
      {
        "zh": "不管你怎么说，我都不去。",
        "en": "Whatever you say, I will not go.",
        "tokens": [
          "不管",
          "你",
          "怎么",
          "说",
          "我",
          "都",
          "不",
          "去"
        ]
      }
    ]
  },
  {
    "id": "jishi",
    "word": "即使",
    "level": 4,
    "pattern": "即使 A，也 B",
    "meaning": "jí shǐ · even if",
    "explain": "即使 presents a hypothetical obstacle. 尽管 usually acknowledges a real situation.",
    "distractors": [
      "由于",
      "既然"
    ],
    "contrast": "Which word introduces a hypothetical obstacle?",
    "examples": [
      {
        "zh": "即使下雨，我也要去。",
        "en": "Even if it rains, I will go.",
        "tokens": [
          "即使",
          "下雨",
          "我",
          "也",
          "要",
          "去"
        ]
      },
      {
        "zh": "即使很难，我也不放弃。",
        "en": "Even if it is difficult, I will not give up.",
        "tokens": [
          "即使",
          "很",
          "难",
          "我",
          "也",
          "不",
          "放弃"
        ]
      },
      {
        "zh": "即使他不来，我们也会开始。",
        "en": "Even if he does not come, we will start.",
        "tokens": [
          "即使",
          "他",
          "不",
          "来",
          "我们",
          "也",
          "会",
          "开始"
        ]
      }
    ]
  },
  {
    "id": "jinguan",
    "word": "尽管",
    "level": 4,
    "pattern": "尽管 A，B",
    "meaning": "jǐn guǎn · although",
    "explain": "尽管 acknowledges an actual fact despite which B is true. 即使 is usually hypothetical.",
    "distractors": [
      "因此",
      "于是"
    ],
    "contrast": "Which word acknowledges a real obstacle?",
    "examples": [
      {
        "zh": "尽管他很忙，还是来了。",
        "en": "Although he was busy, he still came.",
        "tokens": [
          "尽管",
          "他",
          "很",
          "忙",
          "还是",
          "来",
          "了"
        ]
      },
      {
        "zh": "尽管天气很冷，我们还是出门了。",
        "en": "Although it was cold, we still went out.",
        "tokens": [
          "尽管",
          "天气",
          "很",
          "冷",
          "我们",
          "还是",
          "出门",
          "了"
        ]
      },
      {
        "zh": "尽管很累，她还是在学习。",
        "en": "Although she is tired, she is still studying.",
        "tokens": [
          "尽管",
          "很",
          "累",
          "她",
          "还是",
          "在",
          "学习"
        ]
      }
    ]
  },
  {
    "id": "zhiyao",
    "word": "只要",
    "level": 3,
    "pattern": "只要 A，就 B",
    "meaning": "zhǐ yào · as long as",
    "explain": "A is enough for B. Compare 只有 A 才 B, where A is necessary.",
    "distractors": [
      "只有",
      "除了"
    ],
    "contrast": "Which word introduces a sufficient condition?",
    "examples": [
      {
        "zh": "只要你来，我就高兴。",
        "en": "As long as you come, I am happy.",
        "tokens": [
          "只要",
          "你",
          "来",
          "我",
          "就",
          "高兴"
        ]
      },
      {
        "zh": "只要有时间，我就去。",
        "en": "As long as I have time, I will go.",
        "tokens": [
          "只要",
          "有",
          "时间",
          "我",
          "就",
          "去"
        ]
      },
      {
        "zh": "只要每天练习，就能学好。",
        "en": "As long as you practise daily, you can learn well.",
        "tokens": [
          "只要",
          "每",
          "天",
          "练习",
          "就",
          "能",
          "学",
          "好"
        ]
      }
    ]
  },
  {
    "id": "zhiyou",
    "word": "只有",
    "level": 3,
    "pattern": "只有 A，才 B",
    "meaning": "zhǐ yǒu · only if",
    "explain": "A is necessary for B. Compare 只要 A 就 B, where A is sufficient.",
    "distractors": [
      "只要",
      "除了"
    ],
    "contrast": "Which word introduces a necessary condition?",
    "examples": [
      {
        "zh": "只有努力，才能学好汉语。",
        "en": "Only by working hard can you learn Chinese well.",
        "tokens": [
          "只有",
          "努力",
          "才",
          "能",
          "学",
          "好",
          "汉语"
        ]
      },
      {
        "zh": "只有你来，我才去。",
        "en": "I will go only if you come.",
        "tokens": [
          "只有",
          "你",
          "来",
          "我",
          "才",
          "去"
        ]
      },
      {
        "zh": "只有有时间，我才能帮你。",
        "en": "Only if I have time can I help you.",
        "tokens": [
          "只有",
          "有",
          "时间",
          "我",
          "才",
          "能",
          "帮",
          "你"
        ]
      }
    ]
  },
  {
    "id": "faner",
    "word": "反而",
    "level": 5,
    "pattern": "A，反而 B",
    "meaning": "fǎn ér · on the contrary",
    "explain": "反而 signals a result opposite to what one would expect. 因此 is a normal consequence.",
    "distractors": [
      "因此",
      "而且"
    ],
    "contrast": "Which word marks an unexpected opposite result?",
    "examples": [
      {
        "zh": "我帮了他，他反而生气了。",
        "en": "I helped him, but he got angry instead.",
        "tokens": [
          "我",
          "帮",
          "了",
          "他",
          "他",
          "反而",
          "生气",
          "了"
        ]
      },
      {
        "zh": "天气冷了，客人反而多了。",
        "en": "The weather got colder, but there were more customers instead.",
        "tokens": [
          "天气",
          "冷",
          "了",
          "客人",
          "反而",
          "多",
          "了"
        ]
      },
      {
        "zh": "我休息了一天，反而更累了。",
        "en": "I rested for a day, but felt even more tired.",
        "tokens": [
          "我",
          "休息",
          "了",
          "一",
          "天",
          "反而",
          "更",
          "累",
          "了"
        ]
      }
    ]
  },
  {
    "id": "notonly",
    "word": "不仅",
    "level": 4,
    "pattern": "不仅 A，而且 B",
    "meaning": "bù jǐn · not only",
    "explain": "不仅 introduces the first point; 而且 adds another. Both statements are true.",
    "distractors": [
      "只有",
      "除了"
    ],
    "contrast": "Which word introduces the first of two additional points?",
    "examples": [
      {
        "zh": "他不仅会写，而且会说。",
        "en": "He can not only write but also speak.",
        "tokens": [
          "他",
          "不仅",
          "会",
          "写",
          "而且",
          "会",
          "说"
        ]
      },
      {
        "zh": "这本书不仅便宜，而且有意思。",
        "en": "This book is not only cheap but also interesting.",
        "tokens": [
          "这",
          "本",
          "书",
          "不仅",
          "便宜",
          "而且",
          "有意思"
        ]
      },
      {
        "zh": "她不仅学习好，而且很努力。",
        "en": "She not only studies well but also works hard.",
        "tokens": [
          "她",
          "不仅",
          "学习",
          "好",
          "而且",
          "很",
          "努力"
        ]
      }
    ]
  },
  {
    "id": "guanyu",
    "word": "关于",
    "level": 3,
    "pattern": "关于 + topic",
    "meaning": "guān yú · about",
    "explain": "关于 introduces a topic of discussion. 对于 introduces the object of an attitude or evaluation.",
    "distractors": [
      "根据",
      "除了"
    ],
    "contrast": "Which word introduces what a discussion is about?",
    "examples": [
      {
        "zh": "我想问一个关于学习的问题。",
        "en": "I want to ask a question about studying.",
        "tokens": [
          "我",
          "想",
          "问",
          "一",
          "个",
          "关于",
          "学习",
          "的",
          "问题"
        ]
      },
      {
        "zh": "这是一本关于中国的书。",
        "en": "This is a book about China.",
        "tokens": [
          "这",
          "是",
          "一",
          "本",
          "关于",
          "中国",
          "的",
          "书"
        ]
      },
      {
        "zh": "关于这件事，我想说一点。",
        "en": "About this matter, I want to say a little.",
        "tokens": [
          "关于",
          "这",
          "件",
          "事",
          "我",
          "想",
          "说",
          "一",
          "点"
        ]
      }
    ]
  },
  {
    "id": "genju",
    "word": "根据",
    "level": 3,
    "pattern": "根据 + information + action",
    "meaning": "gēn jù · based on",
    "explain": "根据 introduces evidence or information used as a basis. 关于 introduces a topic.",
    "distractors": [
      "关于",
      "为了"
    ],
    "contrast": "Which word introduces the basis for a decision?",
    "examples": [
      {
        "zh": "根据他说的，我们明天去。",
        "en": "Based on what he said, we will go tomorrow.",
        "tokens": [
          "根据",
          "他",
          "说",
          "的",
          "我们",
          "明天",
          "去"
        ]
      },
      {
        "zh": "根据这张地图，学校在左边。",
        "en": "According to this map, the school is on the left.",
        "tokens": [
          "根据",
          "这",
          "张",
          "地图",
          "学校",
          "在",
          "左边"
        ]
      },
      {
        "zh": "根据今天的天气，我们可以出去。",
        "en": "Based on today's weather, we can go out.",
        "tokens": [
          "根据",
          "今天",
          "的",
          "天气",
          "我们",
          "可以",
          "出去"
        ]
      }
    ]
  },
  {
    "id": "tongguo",
    "word": "通过",
    "level": 4,
    "pattern": "通过 + method，result",
    "meaning": "tōng guò · through / by",
    "explain": "通过 expresses a method or process used to reach a result.",
    "distractors": [
      "由于",
      "对于"
    ],
    "contrast": "Which word introduces a method used to achieve a result?",
    "examples": [
      {
        "zh": "通过学习，我了解了中国。",
        "en": "Through studying, I learned about China.",
        "tokens": [
          "通过",
          "学习",
          "我",
          "了解",
          "了",
          "中国"
        ]
      },
      {
        "zh": "通过练习，他的汉语越来越好。",
        "en": "Through practice, his Chinese got better and better.",
        "tokens": [
          "通过",
          "练习",
          "他",
          "的",
          "汉语",
          "越",
          "来",
          "越",
          "好"
        ]
      },
      {
        "zh": "我们通过电话联系。",
        "en": "We communicate by telephone.",
        "tokens": [
          "我们",
          "通过",
          "电话",
          "联系"
        ]
      }
    ]
  },
  {
    "id": "suizhe",
    "word": "随着",
    "level": 4,
    "pattern": "随着 A 的变化，B",
    "meaning": "suí zhe · as / along with",
    "explain": "随着 connects an ongoing change with another development.",
    "distractors": [
      "由于",
      "对于"
    ],
    "contrast": "Which word expresses two developments changing together?",
    "examples": [
      {
        "zh": "随着时间的变化，我们的生活也变了。",
        "en": "As time passes, our lives also change.",
        "tokens": [
          "随着",
          "时间",
          "的",
          "变化",
          "我们",
          "的",
          "生活",
          "也",
          "变",
          "了"
        ]
      },
      {
        "zh": "随着天气变热，客人多了。",
        "en": "As the weather got hotter, there were more customers.",
        "tokens": [
          "随着",
          "天气",
          "变",
          "热",
          "客人",
          "多",
          "了"
        ]
      },
      {
        "zh": "随着天气变冷，衣服穿得更多了。",
        "en": "As the weather gets colder, people wear more clothes.",
        "tokens": [
          "随着",
          "天气",
          "变",
          "冷",
          "衣服",
          "穿",
          "得",
          "更",
          "多",
          "了"
        ]
      }
    ]
  },
  {
    "id": "shifou",
    "word": "是否",
    "level": 4,
    "pattern": "whether + proposition",
    "meaning": "shì fǒu · whether or not",
    "explain": "是否 introduces a yes-or-no uncertainty. 能否 specifically asks whether something is possible.",
    "distractors": [
      "由于",
      "因此"
    ],
    "contrast": "Which word introduces a yes-or-no uncertainty?",
    "examples": [
      {
        "zh": "我不知道他是否来。",
        "en": "I do not know whether he will come.",
        "tokens": [
          "我",
          "不",
          "知道",
          "他",
          "是否",
          "来"
        ]
      },
      {
        "zh": "请告诉我你是否同意。",
        "en": "Please tell me whether you agree.",
        "tokens": [
          "请",
          "告诉",
          "我",
          "你",
          "是否",
          "同意"
        ]
      },
      {
        "zh": "我想知道这是否正确。",
        "en": "I want to know whether this is correct.",
        "tokens": [
          "我",
          "想",
          "知道",
          "这",
          "是否",
          "正确"
        ]
      }
    ]
  },
  {
    "id": "yidan",
    "word": "一旦",
    "level": 5,
    "pattern": "一旦 A，就 B",
    "meaning": "yí dàn · once",
    "explain": "一旦 highlights the moment a condition occurs and the consequence that follows.",
    "distractors": [
      "尽管",
      "由于"
    ],
    "contrast": "Which word highlights the moment a condition occurs?",
    "examples": [
      {
        "zh": "一旦开始，就不要停止。",
        "en": "Once you start, do not stop.",
        "tokens": [
          "一旦",
          "开始",
          "就",
          "不",
          "要",
          "停止"
        ]
      },
      {
        "zh": "一旦发现问题，就告诉我。",
        "en": "Once you discover a problem, tell me.",
        "tokens": [
          "一旦",
          "发现",
          "问题",
          "就",
          "告诉",
          "我"
        ]
      },
      {
        "zh": "一旦决定了，就不要改变。",
        "en": "Once you have decided, do not change it.",
        "tokens": [
          "一旦",
          "决定",
          "了",
          "就",
          "不",
          "要",
          "改变"
        ]
      }
    ]
  },
  {
    "id": "fouze",
    "word": "否则",
    "level": 4,
    "pattern": "action，否则 + consequence",
    "meaning": "fǒu zé · otherwise",
    "explain": "否则 warns what happens if an instruction or condition is not met.",
    "distractors": [
      "而且",
      "因此"
    ],
    "contrast": "Which word introduces what happens otherwise?",
    "examples": [
      {
        "zh": "快一点，否则就晚了。",
        "en": "Hurry up, otherwise it will be too late.",
        "tokens": [
          "快",
          "一",
          "点",
          "否则",
          "就",
          "晚",
          "了"
        ]
      },
      {
        "zh": "请早一点睡，否则明天会很累。",
        "en": "Go to bed a little earlier, otherwise you will be tired tomorrow.",
        "tokens": [
          "请",
          "早",
          "一",
          "点",
          "睡",
          "否则",
          "明天",
          "会",
          "很",
          "累"
        ]
      },
      {
        "zh": "你要学习，否则考试会有问题。",
        "en": "You must study, otherwise you will have problems in the exam.",
        "tokens": [
          "你",
          "要",
          "学习",
          "否则",
          "考试",
          "会",
          "有",
          "问题"
        ]
      }
    ]
  },
  {
    "id": "youyu",
    "word": "由于",
    "level": 4,
    "pattern": "由于 + cause，result",
    "meaning": "yóu yú · due to",
    "explain": "由于 introduces a cause, often in formal writing. 因此 introduces the consequence.",
    "distractors": [
      "因此",
      "于是"
    ],
    "contrast": "Which word introduces the cause rather than the result?",
    "examples": [
      {
        "zh": "由于下雨，比赛停止了。",
        "en": "Due to rain, the match stopped.",
        "tokens": [
          "由于",
          "下雨",
          "比赛",
          "停止",
          "了"
        ]
      },
      {
        "zh": "由于时间不够，我们先回家了。",
        "en": "Because time was insufficient, we went home first.",
        "tokens": [
          "由于",
          "时间",
          "不",
          "够",
          "我们",
          "先",
          "回",
          "家",
          "了"
        ]
      },
      {
        "zh": "由于身体不好，他没有来。",
        "en": "Because he was unwell, he did not come.",
        "tokens": [
          "由于",
          "身体",
          "不",
          "好",
          "他",
          "没有",
          "来"
        ]
      }
    ]
  },
  {
    "id": "yinci",
    "word": "因此",
    "level": 4,
    "pattern": "cause，因此 + result",
    "meaning": "yīn cǐ · therefore",
    "explain": "因此 expresses a logical result. 由于 introduces the cause instead.",
    "distractors": [
      "由于",
      "尽管"
    ],
    "contrast": "Which word introduces a logical consequence?",
    "examples": [
      {
        "zh": "他生病了，因此没有来。",
        "en": "He was ill; therefore he did not come.",
        "tokens": [
          "他",
          "生病",
          "了",
          "因此",
          "没有",
          "来"
        ]
      },
      {
        "zh": "今天下雨，因此我们不去了。",
        "en": "It is raining today, so we will not go.",
        "tokens": [
          "今天",
          "下雨",
          "因此",
          "我们",
          "不",
          "去",
          "了"
        ]
      },
      {
        "zh": "他很努力，因此取得了好成绩。",
        "en": "He worked hard and therefore got good results.",
        "tokens": [
          "他",
          "很",
          "努力",
          "因此",
          "取得",
          "了",
          "好",
          "成绩"
        ]
      }
    ]
  },
  {
    "id": "yushi",
    "word": "于是",
    "level": 4,
    "pattern": "situation，于是 + next action",
    "meaning": "yú shì · so / thereupon",
    "explain": "于是 describes a subsequent action prompted by the situation. 因此 emphasizes logical consequence.",
    "distractors": [
      "由于",
      "尽管"
    ],
    "contrast": "Which word introduces the next action in a narrative?",
    "examples": [
      {
        "zh": "我饿了，于是去吃饭。",
        "en": "I was hungry, so I went to eat.",
        "tokens": [
          "我",
          "饿",
          "了",
          "于是",
          "去",
          "吃",
          "饭"
        ]
      },
      {
        "zh": "他没有带钱，于是回家了。",
        "en": "He had not brought money, so he went home.",
        "tokens": [
          "他",
          "没有",
          "带",
          "钱",
          "于是",
          "回",
          "家",
          "了"
        ]
      },
      {
        "zh": "她看见了我，于是走了过来。",
        "en": "She saw me and then walked over.",
        "tokens": [
          "她",
          "看见",
          "了",
          "我",
          "于是",
          "走",
          "了",
          "过来"
        ]
      }
    ]
  },
  {
    "id": "lian",
    "word": "连",
    "level": 4,
    "pattern": "连 A 都 / 也 B",
    "meaning": "lián · even",
    "explain": "连 highlights an extreme or surprising case. 都 or 也 normally follows it.",
    "distractors": [
      "由",
      "与"
    ],
    "contrast": "Which word highlights an especially surprising case?",
    "examples": [
      {
        "zh": "连孩子都知道。",
        "en": "Even children know.",
        "tokens": [
          "连",
          "孩子",
          "都",
          "知道"
        ]
      },
      {
        "zh": "连我都不知道。",
        "en": "Even I do not know.",
        "tokens": [
          "连",
          "我",
          "都",
          "不",
          "知道"
        ]
      },
      {
        "zh": "他连水都不喝。",
        "en": "He does not even drink water.",
        "tokens": [
          "他",
          "连",
          "水",
          "都",
          "不",
          "喝"
        ]
      }
    ]
  },
  {
    "id": "duiyu",
    "word": "对于",
    "level": 4,
    "pattern": "对于 + object，opinion",
    "meaning": "duì yú · regarding",
    "explain": "对于 sets the object of an opinion, reaction or evaluation. 关于 primarily introduces a topic.",
    "distractors": [
      "由于",
      "否则"
    ],
    "contrast": "Which word sets the object of an opinion?",
    "examples": [
      {
        "zh": "对于这个问题，我有不同的意见。",
        "en": "I have a different opinion on this question.",
        "tokens": [
          "对于",
          "这个",
          "问题",
          "我",
          "有",
          "不同",
          "的",
          "意见"
        ]
      },
      {
        "zh": "对于这件事，我很担心。",
        "en": "I am very worried about this matter.",
        "tokens": [
          "对于",
          "这",
          "件",
          "事",
          "我",
          "很",
          "担心"
        ]
      },
      {
        "zh": "对于这个结果，我很满意。",
        "en": "I am very satisfied with this result.",
        "tokens": [
          "对于",
          "这个",
          "结果",
          "我",
          "很",
          "满意"
        ]
      }
    ]
  },
  {
    "id": "yu-related",
    "word": "与",
    "level": 4,
    "pattern": "与 A 有关",
    "meaning": "yǔ · be related to",
    "explain": "与 introduces the entity to which something is related. In everyday speech, 和 is common.",
    "distractors": [
      "由",
      "而"
    ],
    "contrast": "Which formal preposition links something to 有关?",
    "examples": [
      {
        "zh": "这件事与我有关。",
        "en": "This matter concerns me.",
        "tokens": [
          "这",
          "件",
          "事",
          "与",
          "我",
          "有关"
        ]
      },
      {
        "zh": "这个问题与钱有关。",
        "en": "This question is related to money.",
        "tokens": [
          "这",
          "个",
          "问题",
          "与",
          "钱",
          "有关"
        ]
      },
      {
        "zh": "这个故事与他的生活有关。",
        "en": "This story is related to his life.",
        "tokens": [
          "这个",
          "故事",
          "与",
          "他",
          "的",
          "生活",
          "有关"
        ]
      }
    ]
  },
  {
    "id": "yi-wei",
    "word": "以",
    "level": 5,
    "pattern": "以 A 为 B",
    "meaning": "yǐ … wéi … · take A as B",
    "explain": "以 introduces the thing being used as a standard, and 为 introduces its role.",
    "distractors": [
      "及",
      "而"
    ],
    "contrast": "Which word starts the structure ___ A 为 B?",
    "examples": [
      {
        "zh": "我们以客户的需要为目标。",
        "en": "We take customers’ needs as our goal.",
        "tokens": [
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
        "en": "He gives a book as a gift.",
        "tokens": [
          "他",
          "以",
          "书",
          "为",
          "礼物"
        ]
      },
      {
        "zh": "我们以质量为标准。",
        "en": "We take quality as our standard.",
        "tokens": [
          "我们",
          "以",
          "质量",
          "为",
          "标准"
        ]
      }
    ]
  },
  {
    "id": "queshi",
    "word": "却",
    "level": 4,
    "pattern": "A，却 B",
    "meaning": "què · yet",
    "explain": "却 signals a result that contrasts with the previous fact or expectation. It usually comes before the verb or adjective.",
    "distractors": [
      "由于",
      "与"
    ],
    "contrast": "Which word means yet, before a contrasting predicate?",
    "examples": [
      {
        "zh": "他很累，却不想休息。",
        "en": "He is tired, yet does not want to rest.",
        "tokens": [
          "他",
          "很",
          "累",
          "却",
          "不",
          "想",
          "休息"
        ]
      },
      {
        "zh": "我认识他，他却不认识我。",
        "en": "I know him, but he does not know me.",
        "tokens": [
          "我",
          "认识",
          "他",
          "他",
          "却",
          "不",
          "认识",
          "我"
        ]
      },
      {
        "zh": "天气很好，她却不想出去。",
        "en": "The weather is nice, yet she does not want to go out.",
        "tokens": [
          "天气",
          "很",
          "好",
          "她",
          "却",
          "不",
          "想",
          "出去"
        ]
      }
    ]
  },
  {
    "id": "wu-lun",
    "word": "无论",
    "level": 4,
    "pattern": "无论 A，都 B",
    "meaning": "wú lùn · regardless of",
    "explain": "无论 introduces alternatives; the result is unchanged. It is more formal than 不管.",
    "distractors": [
      "既然",
      "由于"
    ],
    "contrast": "Which word formally means regardless of?",
    "examples": [
      {
        "zh": "无论你去哪里，我都跟你去。",
        "en": "Wherever you go, I will go with you.",
        "tokens": [
          "无论",
          "你",
          "去",
          "哪里",
          "我",
          "都",
          "跟",
          "你",
          "去"
        ]
      },
      {
        "zh": "无论多难，我都不放弃。",
        "en": "However difficult it is, I will not give up.",
        "tokens": [
          "无论",
          "多",
          "难",
          "我",
          "都",
          "不",
          "放弃"
        ]
      },
      {
        "zh": "无论谁来，都可以参加。",
        "en": "Whoever comes can participate.",
        "tokens": [
          "无论",
          "谁",
          "来",
          "都",
          "可以",
          "参加"
        ]
      }
    ]
  },
  {
    "id": "bing",
    "word": "并",
    "level": 4,
    "pattern": "并 + verb / 并不 + adjective",
    "meaning": "bìng · and / not actually",
    "explain": "并 can link actions or emphasize a negation in 并不 or 并没有. It often corrects an assumption.",
    "distractors": [
      "与",
      "由"
    ],
    "contrast": "Which adverb can emphasize a negation in ___ 不?",
    "examples": [
      {
        "zh": "这件事并不难。",
        "en": "This matter is not actually difficult.",
        "tokens": [
          "这",
          "件",
          "事",
          "并",
          "不",
          "难"
        ]
      },
      {
        "zh": "我并不同意。",
        "en": "I do not actually agree.",
        "tokens": [
          "我",
          "并",
          "不",
          "同意"
        ]
      },
      {
        "zh": "他并没有生气。",
        "en": "He was not angry after all.",
        "tokens": [
          "他",
          "并",
          "没有",
          "生气"
        ]
      }
    ]
  },
  {
    "id": "bq",
    "word": "并且",
    "level": 4,
    "pattern": "A，并且 B",
    "meaning": "bìng qiě · and also",
    "explain": "并且 adds another action or fact to the previous one.",
    "distractors": [
      "否则",
      "因此"
    ],
    "contrast": "Which word adds another fact?",
    "examples": [
      {
        "zh": "他同意了，并且愿意帮忙。",
        "en": "He agreed and was also willing to help.",
        "tokens": [
          "他",
          "同意",
          "了",
          "并且",
          "愿意",
          "帮忙"
        ]
      },
      {
        "zh": "她会说汉语，并且会写汉字。",
        "en": "She speaks Chinese and can also write Chinese characters.",
        "tokens": [
          "她",
          "会",
          "说",
          "汉语",
          "并且",
          "会",
          "写",
          "汉字"
        ]
      },
      {
        "zh": "请看这本书，并且回答问题。",
        "en": "Please read this book and answer the questions.",
        "tokens": [
          "请",
          "看",
          "这",
          "本",
          "书",
          "并且",
          "回答",
          "问题"
        ]
      }
    ]
  },
  {
    "id": "jiyou",
    "word": "既",
    "level": 4,
    "pattern": "既 A，又 B",
    "meaning": "jì … yòu … · both A and B",
    "explain": "既 and 又 present two simultaneous qualities or conditions.",
    "distractors": [
      "与",
      "由"
    ],
    "contrast": "Which word begins the paired structure ___ A 又 B?",
    "examples": [
      {
        "zh": "这个房间既大又漂亮。",
        "en": "This room is both big and beautiful.",
        "tokens": [
          "这个",
          "房间",
          "既",
          "大",
          "又",
          "漂亮"
        ]
      },
      {
        "zh": "这本书既便宜又有意思。",
        "en": "This book is both cheap and interesting.",
        "tokens": [
          "这",
          "本",
          "书",
          "既",
          "便宜",
          "又",
          "有意思"
        ]
      },
      {
        "zh": "她既聪明又努力。",
        "en": "She is both clever and hardworking.",
        "tokens": [
          "她",
          "既",
          "聪明",
          "又",
          "努力"
        ]
      }
    ]
  },
  {
    "id": "shenzhi",
    "word": "甚至",
    "level": 4,
    "pattern": "A，甚至 B",
    "meaning": "shèn zhì · even",
    "explain": "甚至 introduces a stronger or more surprising example.",
    "distractors": [
      "因此",
      "由于"
    ],
    "contrast": "Which word introduces a stronger, surprising case?",
    "examples": [
      {
        "zh": "他很忙，甚至没有时间吃饭。",
        "en": "He is so busy he does not even have time to eat.",
        "tokens": [
          "他",
          "很",
          "忙",
          "甚至",
          "没有",
          "时间",
          "吃",
          "饭"
        ]
      },
      {
        "zh": "我太累了，甚至不想说话。",
        "en": "I am so tired I do not even want to talk.",
        "tokens": [
          "我",
          "太",
          "累",
          "了",
          "甚至",
          "不",
          "想",
          "说话"
        ]
      },
      {
        "zh": "她很高兴，甚至哭了。",
        "en": "She was so happy she even cried.",
        "tokens": [
          "她",
          "很",
          "高兴",
          "甚至",
          "哭",
          "了"
        ]
      }
    ]
  },
  {
    "id": "anzhao",
    "word": "按照",
    "level": 4,
    "pattern": "按照 + rule / plan + action",
    "meaning": "àn zhào · according to",
    "explain": "按照 indicates following a rule, method or plan. 根据 often points to the information behind a decision.",
    "distractors": [
      "关于",
      "由于"
    ],
    "contrast": "Which word means following a rule or plan?",
    "examples": [
      {
        "zh": "请按照计划工作。",
        "en": "Please work according to the plan.",
        "tokens": [
          "请",
          "按照",
          "计划",
          "工作"
        ]
      },
      {
        "zh": "我们按照老师的要求做。",
        "en": "We do as the teacher requires.",
        "tokens": [
          "我们",
          "按照",
          "老师",
          "的",
          "要求",
          "做"
        ]
      },
      {
        "zh": "他按照这个方法学习。",
        "en": "He studies according to this method.",
        "tokens": [
          "他",
          "按照",
          "这个",
          "方法",
          "学习"
        ]
      }
    ]
  },
  {
    "id": "rengran",
    "word": "仍然",
    "level": 4,
    "pattern": "仍然 + verb / adjective",
    "meaning": "réng rán · still",
    "explain": "仍然 shows that a state continues despite time passing or changed circumstances.",
    "distractors": [
      "因此",
      "否则"
    ],
    "contrast": "Which word indicates that a state continues?",
    "examples": [
      {
        "zh": "他仍然在学习。",
        "en": "He is still studying.",
        "tokens": [
          "他",
          "仍然",
          "在",
          "学习"
        ]
      },
      {
        "zh": "天气仍然很冷。",
        "en": "The weather is still cold.",
        "tokens": [
          "天气",
          "仍然",
          "很",
          "冷"
        ]
      },
      {
        "zh": "她仍然记得我。",
        "en": "She still remembers me.",
        "tokens": [
          "她",
          "仍然",
          "记得",
          "我"
        ]
      }
    ]
  },
  {
    "id": "nengfou",
    "word": "能否",
    "level": 4,
    "pattern": "能否 + verb",
    "meaning": "néng fǒu · whether one can",
    "explain": "能否 asks about possibility or ability. 是否 is a more general yes-or-no question.",
    "distractors": [
      "由于",
      "仍然"
    ],
    "contrast": "Which word asks whether something is possible?",
    "examples": [
      {
        "zh": "请问您能否帮我？",
        "en": "May I ask whether you can help me?",
        "tokens": [
          "请",
          "问",
          "您",
          "能否",
          "帮",
          "我"
        ]
      },
      {
        "zh": "我不知道他能否来。",
        "en": "I do not know whether he can come.",
        "tokens": [
          "我",
          "不",
          "知道",
          "他",
          "能否",
          "来"
        ]
      },
      {
        "zh": "你能否再说一次？",
        "en": "Could you say it again?",
        "tokens": [
          "你",
          "能否",
          "再",
          "说",
          "一",
          "次"
        ]
      }
    ]
  },
  {
    "id": "yilai",
    "word": "以来",
    "level": 5,
    "pattern": "time / event + 以来",
    "meaning": "yǐ lái · since",
    "explain": "以来 marks the period from a past time or event up to now. Place it after the starting point.",
    "distractors": [
      "以前",
      "以后"
    ],
    "contrast": "Which word marks a period continuing from the past until now?",
    "examples": [
      {
        "zh": "去年以来，我一直在学汉语。",
        "en": "I have been learning Chinese since last year.",
        "tokens": [
          "去年",
          "以来",
          "我",
          "一直",
          "在",
          "学",
          "汉语"
        ]
      },
      {
        "zh": "三年以来，他一直在这里工作。",
        "en": "He has worked here for the past three years.",
        "tokens": [
          "三",
          "年",
          "以来",
          "他",
          "一直",
          "在",
          "这里",
          "工作"
        ]
      },
      {
        "zh": "从那天以来，我们常常联系。",
        "en": "Since that day, we have often been in touch.",
        "tokens": [
          "从",
          "那",
          "天",
          "以来",
          "我们",
          "常常",
          "联系"
        ]
      }
    ]
  },
  {
    "id": "wei-er-purpose",
    "word": "为",
    "level": 4,
    "pattern": "为 A 而 B",
    "meaning": "wèi … ér … · for a purpose",
    "explain": "为 introduces the purpose; 而 links it to the action. More formal than 为了.",
    "distractors": [
      "由",
      "与"
    ],
    "contrast": "Which word introduces a purpose in the structure ___ A 而 B?",
    "examples": [
      {
        "zh": "我们为生活而工作。",
        "en": "We work to make a living.",
        "tokens": [
          "我们",
          "为",
          "生活",
          "而",
          "工作"
        ]
      },
      {
        "zh": "他为自己的梦想而努力。",
        "en": "He works hard for his dream.",
        "tokens": [
          "他",
          "为",
          "自己",
          "的",
          "梦想",
          "而",
          "努力"
        ]
      },
      {
        "zh": "她为孩子而努力。",
        "en": "She works hard for her child.",
        "tokens": [
          "她",
          "为",
          "孩子",
          "而",
          "努力"
        ]
      }
    ]
  },
  {
    "id": "chule",
    "word": "除了",
    "level": 3,
    "pattern": "除了 A，(还 / 都) B",
    "meaning": "chú le · besides / except",
    "explain": "With 还 or 也, 除了 often adds A to another item. With 都, it can exclude A.",
    "distractors": [
      "根据",
      "为了"
    ],
    "contrast": "Which word can introduce an exception or additional item?",
    "examples": [
      {
        "zh": "除了我，大家都来了。",
        "en": "Everyone except me came.",
        "tokens": [
          "除了",
          "我",
          "大家",
          "都",
          "来",
          "了"
        ]
      },
      {
        "zh": "除了汉语，他还学数学。",
        "en": "Besides Chinese, he studies mathematics.",
        "tokens": [
          "除了",
          "汉语",
          "他",
          "还",
          "学",
          "数学"
        ]
      },
      {
        "zh": "除了今天，我每天都有时间。",
        "en": "I have time every day except today.",
        "tokens": [
          "除了",
          "今天",
          "我",
          "每",
          "天",
          "都",
          "有",
          "时间"
        ]
      }
    ]
  },
  {
    "id": "yiwai",
    "word": "以外",
    "level": 3,
    "pattern": "除了 A 以外，B",
    "meaning": "yǐ wài · apart from",
    "explain": "以外 follows the item being excluded. It is often paired with 除了.",
    "distractors": [
      "以前",
      "以后"
    ],
    "contrast": "Which word means apart from in 除了 A ___?",
    "examples": [
      {
        "zh": "除了他以外，大家都来了。",
        "en": "Everyone except him came.",
        "tokens": [
          "除了",
          "他",
          "以外",
          "大家",
          "都",
          "来",
          "了"
        ]
      },
      {
        "zh": "除了这本书以外，我都看过。",
        "en": "I have read all of them except this book.",
        "tokens": [
          "除了",
          "这",
          "本",
          "书",
          "以外",
          "我",
          "都",
          "看",
          "过"
        ]
      },
      {
        "zh": "汉语以外，他还学数学。",
        "en": "Besides Chinese, he also studies mathematics.",
        "tokens": [
          "汉语",
          "以外",
          "他",
          "还",
          "学",
          "数学"
        ]
      }
    ]
  },
  {
    "id": "conger",
    "word": "从而",
    "level": 5,
    "pattern": "A，从而 B",
    "meaning": "cóng ér · thereby",
    "explain": "从而 expresses a result achieved through the preceding action or change.",
    "distractors": [
      "尽管",
      "由于"
    ],
    "contrast": "Which connector means thereby, introducing an achieved result?",
    "examples": [
      {
        "zh": "我们改变方法，从而提高了工作效率。",
        "en": "We changed our method, thereby improving efficiency.",
        "tokens": [
          "我们",
          "改变",
          "方法",
          "从而",
          "提高",
          "了",
          "工作",
          "效率"
        ]
      },
      {
        "zh": "他每天练习，从而提高了水平。",
        "en": "He practised daily, thereby improving his level.",
        "tokens": [
          "他",
          "每",
          "天",
          "练习",
          "从而",
          "提高",
          "了",
          "水平"
        ]
      },
      {
        "zh": "我们减少成本，从而增加收入。",
        "en": "We reduced costs, thereby increasing revenue.",
        "tokens": [
          "我们",
          "减少",
          "成本",
          "从而",
          "增加",
          "收入"
        ]
      }
    ]
  },
  {
    "id": "zhi",
    "word": "之",
    "level": 4,
    "pattern": "A 之 B",
    "meaning": "zhī · of / between",
    "explain": "之 is a formal linking element, often in fixed expressions. 的 is the everyday possessive.",
    "distractors": [
      "与",
      "由"
    ],
    "contrast": "Which formal linker is used in 三人 ___ 中?",
    "examples": [
      {
        "zh": "三人之中，他最高。",
        "en": "Among three people, he is tallest.",
        "tokens": [
          "三",
          "人",
          "之",
          "中",
          "他",
          "最",
          "高"
        ]
      },
      {
        "zh": "一年之中，我最喜欢春天。",
        "en": "Of the seasons in a year, I like spring most.",
        "tokens": [
          "一",
          "年",
          "之",
          "中",
          "我",
          "最",
          "喜欢",
          "春天"
        ]
      },
      {
        "zh": "两国之间有很多不同。",
        "en": "There are many differences between the two countries.",
        "tokens": [
          "两",
          "国",
          "之",
          "间",
          "有",
          "很",
          "多",
          "不同"
        ]
      }
    ]
  },
  {
    "id": "zhishao",
    "word": "至少",
    "level": 4,
    "pattern": "至少 + quantity / action",
    "meaning": "zhì shǎo · at least",
    "explain": "至少 indicates a minimum quantity or requirement, not a maximum.",
    "distractors": [
      "因此",
      "仍然"
    ],
    "contrast": "Which word expresses a minimum?",
    "examples": [
      {
        "zh": "你至少要等三天。",
        "en": "You must wait at least three days.",
        "tokens": [
          "你",
          "至少",
          "要",
          "等",
          "三",
          "天"
        ]
      },
      {
        "zh": "我每天至少学两小时。",
        "en": "I study at least two hours each day.",
        "tokens": [
          "我",
          "每",
          "天",
          "至少",
          "学",
          "两",
          "小时"
        ]
      },
      {
        "zh": "这里至少有十个人。",
        "en": "There are at least ten people here.",
        "tokens": [
          "这里",
          "至少",
          "有",
          "十",
          "个",
          "人"
        ]
      }
    ]
  },
  {
    "id": "nandao",
    "word": "难道",
    "level": 4,
    "pattern": "难道……吗？",
    "meaning": "nán dào · could it really be that…?",
    "explain": "难道 introduces a rhetorical question, often expecting the opposite of the literal statement.",
    "distractors": [
      "因此",
      "仍然"
    ],
    "contrast": "Which word marks a rhetorical question?",
    "examples": [
      {
        "zh": "难道你不知道吗？",
        "en": "Surely you know?",
        "tokens": [
          "难道",
          "你",
          "不",
          "知道",
          "吗"
        ]
      },
      {
        "zh": "难道这不对吗？",
        "en": "Isn't this right?",
        "tokens": [
          "难道",
          "这",
          "不",
          "对",
          "吗"
        ]
      },
      {
        "zh": "难道他不想去吗？",
        "en": "Doesn't he want to go?",
        "tokens": [
          "难道",
          "他",
          "不",
          "想",
          "去",
          "吗"
        ]
      }
    ]
  },
  {
    "id": "buru",
    "word": "不如",
    "level": 4,
    "pattern": "A 不如 B",
    "meaning": "bù rú · not as good as / might as well",
    "explain": "不如 compares A unfavourably with B or suggests a better alternative.",
    "distractors": [
      "由于",
      "因此"
    ],
    "contrast": "Which word means not as good as?",
    "examples": [
      {
        "zh": "我的汉语不如他的好。",
        "en": "My Chinese is not as good as his.",
        "tokens": [
          "我",
          "的",
          "汉语",
          "不如",
          "他",
          "的",
          "好"
        ]
      },
      {
        "zh": "这里的茶不如那里的好。",
        "en": "The tea here is not as good as the tea there.",
        "tokens": [
          "这里",
          "的",
          "茶",
          "不如",
          "那里",
          "的",
          "好"
        ]
      },
      {
        "zh": "坐车不如走路。",
        "en": "Walking is better than taking a vehicle.",
        "tokens": [
          "坐",
          "车",
          "不如",
          "走",
          "路"
        ]
      }
    ]
  },
  {
    "id": "suo",
    "word": "所",
    "level": 5,
    "pattern": "所 + verb + 的 + noun",
    "meaning": "suǒ · what is / was done",
    "explain": "所 marks a relative expression, often referring to what someone does, knows, or needs.",
    "distractors": [
      "与",
      "由"
    ],
    "contrast": "Which word forms a relative expression before a verb?",
    "examples": [
      {
        "zh": "这是我所需要的东西。",
        "en": "This is what I need.",
        "tokens": [
          "这",
          "是",
          "我",
          "所",
          "需要",
          "的",
          "东西"
        ]
      },
      {
        "zh": "他所说的都对。",
        "en": "Everything he said is right.",
        "tokens": [
          "他",
          "所",
          "说",
          "的",
          "都",
          "对"
        ]
      },
      {
        "zh": "我所知道的不多。",
        "en": "I do not know much.",
        "tokens": [
          "我",
          "所",
          "知道",
          "的",
          "不",
          "多"
        ]
      }
    ]
  },
  {
    "id": "de-possessive",
    "word": "的",
    "level": 1,
    "pattern": "A 的 B",
    "meaning": "de · possession",
    "explain": "的 links an owner or modifier to a noun.",
    "distractors": [
      "了",
      "吗"
    ],
    "contrast": "Which particle connects an owner to a noun?",
    "examples": [
      {
        "zh": "这是我的书。",
        "en": "This is my book.",
        "tokens": [
          "这",
          "是",
          "我",
          "的",
          "书"
        ]
      },
      {
        "zh": "他是我的朋友。",
        "en": "He is my friend.",
        "tokens": [
          "他",
          "是",
          "我",
          "的",
          "朋友"
        ]
      },
      {
        "zh": "我喜欢你的衣服。",
        "en": "I like your clothes.",
        "tokens": [
          "我",
          "喜欢",
          "你",
          "的",
          "衣服"
        ]
      }
    ]
  },
  {
    "id": "le-completed",
    "word": "了",
    "level": 1,
    "pattern": "verb + 了 + object",
    "meaning": "le · completed action",
    "explain": "了 after a verb marks an event viewed as completed. It is not simply a past-tense marker.",
    "distractors": [
      "的",
      "吗"
    ],
    "contrast": "Which particle marks a completed event?",
    "examples": [
      {
        "zh": "我买了一本书。",
        "en": "I bought a book.",
        "tokens": [
          "我",
          "买",
          "了",
          "一",
          "本",
          "书"
        ]
      },
      {
        "zh": "他吃了三个苹果。",
        "en": "He ate three apples.",
        "tokens": [
          "他",
          "吃",
          "了",
          "三",
          "个",
          "苹果"
        ]
      },
      {
        "zh": "我写了两个字。",
        "en": "I wrote two characters.",
        "tokens": [
          "我",
          "写",
          "了",
          "两",
          "个",
          "字"
        ]
      }
    ]
  },
  {
    "id": "le-change",
    "word": "了",
    "level": 1,
    "pattern": "clause + 了",
    "meaning": "le · changed situation",
    "explain": "At the end of a clause, 了 marks a new situation or change.",
    "distractors": [
      "的",
      "呢"
    ],
    "contrast": "Which particle at the end signals a new situation?",
    "examples": [
      {
        "zh": "下雨了。",
        "en": "It has started raining.",
        "tokens": [
          "下雨",
          "了"
        ]
      },
      {
        "zh": "我不想去了。",
        "en": "I no longer want to go.",
        "tokens": [
          "我",
          "不",
          "想",
          "去",
          "了"
        ]
      },
      {
        "zh": "天气好了。",
        "en": "The weather has improved.",
        "tokens": [
          "天气",
          "好",
          "了"
        ]
      }
    ]
  },
  {
    "id": "ma-question",
    "word": "吗",
    "level": 1,
    "pattern": "statement + 吗？",
    "meaning": "ma · yes/no question",
    "explain": "吗 turns a statement into a yes/no question; do not add it to a normal question-word question.",
    "distractors": [
      "呢",
      "吧"
    ],
    "contrast": "Which particle asks a neutral yes/no question?",
    "examples": [
      {
        "zh": "你是老师吗？",
        "en": "Are you a teacher?",
        "tokens": [
          "你",
          "是",
          "老师",
          "吗"
        ]
      },
      {
        "zh": "你喜欢茶吗？",
        "en": "Do you like tea?",
        "tokens": [
          "你",
          "喜欢",
          "茶",
          "吗"
        ]
      },
      {
        "zh": "你明天来吗？",
        "en": "Are you coming tomorrow?",
        "tokens": [
          "你",
          "明天",
          "来",
          "吗"
        ]
      }
    ]
  },
  {
    "id": "ne-return",
    "word": "呢",
    "level": 1,
    "pattern": "noun / pronoun + 呢？",
    "meaning": "ne · return a question",
    "explain": "呢 can return a question to another person or ask about someone's whereabouts.",
    "distractors": [
      "吗",
      "了"
    ],
    "contrast": "Which particle means what about someone?",
    "examples": [
      {
        "zh": "我很好，你呢？",
        "en": "I am fine; what about you?",
        "tokens": [
          "我",
          "很",
          "好",
          "你",
          "呢"
        ]
      },
      {
        "zh": "我要茶，你呢？",
        "en": "I want tea; what about you?",
        "tokens": [
          "我",
          "要",
          "茶",
          "你",
          "呢"
        ]
      },
      {
        "zh": "妈妈呢？",
        "en": "Where is Mum?",
        "tokens": [
          "妈妈",
          "呢"
        ]
      }
    ]
  },
  {
    "id": "zai-progress",
    "word": "在",
    "level": 1,
    "pattern": "在 + verb",
    "meaning": "zài · action in progress",
    "explain": "在 before a verb marks an ongoing action, unlike 在 followed by a place.",
    "distractors": [
      "了",
      "的"
    ],
    "contrast": "Which word before a verb indicates an action is happening now?",
    "examples": [
      {
        "zh": "我在看书。",
        "en": "I am reading a book.",
        "tokens": [
          "我",
          "在",
          "看",
          "书"
        ]
      },
      {
        "zh": "他在吃饭。",
        "en": "He is eating.",
        "tokens": [
          "他",
          "在",
          "吃",
          "饭"
        ]
      },
      {
        "zh": "妈妈在写字。",
        "en": "Mum is writing characters.",
        "tokens": [
          "妈妈",
          "在",
          "写",
          "字"
        ]
      }
    ]
  },
  {
    "id": "ye-also",
    "word": "也",
    "level": 1,
    "pattern": "subject + 也 + predicate",
    "meaning": "yě · also",
    "explain": "也 comes before the predicate to indicate that another person or thing shares a property.",
    "distractors": [
      "的",
      "吗"
    ],
    "contrast": "Which adverb means also?",
    "examples": [
      {
        "zh": "我也喜欢茶。",
        "en": "I like tea too.",
        "tokens": [
          "我",
          "也",
          "喜欢",
          "茶"
        ]
      },
      {
        "zh": "他也是学生。",
        "en": "He is also a student.",
        "tokens": [
          "他",
          "也",
          "是",
          "学生"
        ]
      },
      {
        "zh": "我也想去。",
        "en": "I want to go too.",
        "tokens": [
          "我",
          "也",
          "想",
          "去"
        ]
      }
    ]
  },
  {
    "id": "dou-all",
    "word": "都",
    "level": 1,
    "pattern": "plural subject + 都 + predicate",
    "meaning": "dōu · all / both",
    "explain": "都 comes before a predicate and covers all members of a group.",
    "distractors": [
      "的",
      "吗"
    ],
    "contrast": "Which word indicates all members of a group?",
    "examples": [
      {
        "zh": "我们都是学生。",
        "en": "We are all students.",
        "tokens": [
          "我们",
          "都",
          "是",
          "学生"
        ]
      },
      {
        "zh": "他们都喜欢茶。",
        "en": "They all like tea.",
        "tokens": [
          "他们",
          "都",
          "喜欢",
          "茶"
        ]
      },
      {
        "zh": "爸爸和妈妈都在家。",
        "en": "Dad and Mum are both at home.",
        "tokens": [
          "爸爸",
          "和",
          "妈妈",
          "都",
          "在",
          "家"
        ]
      }
    ]
  },
  {
    "id": "dui-towards",
    "word": "对",
    "level": 1,
    "pattern": "对 + person + adjective",
    "meaning": "duì · towards / to",
    "explain": "对 introduces the person toward whom a quality or attitude is directed.",
    "distractors": [
      "也",
      "都"
    ],
    "contrast": "Which word introduces the person towards whom an attitude is directed?",
    "examples": [
      {
        "zh": "他对我很好。",
        "en": "He is very kind to me.",
        "tokens": [
          "他",
          "对",
          "我",
          "很",
          "好"
        ]
      },
      {
        "zh": "老师对我们很好。",
        "en": "The teacher is very kind to us.",
        "tokens": [
          "老师",
          "对",
          "我们",
          "很",
          "好"
        ]
      },
      {
        "zh": "妈妈对孩子很好。",
        "en": "Mum is very kind to the child.",
        "tokens": [
          "妈妈",
          "对",
          "孩子",
          "很",
          "好"
        ]
      }
    ]
  },
  {
    "id": "hai-still",
    "word": "还",
    "level": 1,
    "pattern": "还 + verb / adjective",
    "meaning": "hái · still",
    "explain": "还 marks a state or action that continues.",
    "distractors": [
      "的",
      "吗"
    ],
    "contrast": "Which adverb expresses that something still holds?",
    "examples": [
      {
        "zh": "他还在家。",
        "en": "He is still at home.",
        "tokens": [
          "他",
          "还",
          "在",
          "家"
        ]
      },
      {
        "zh": "我还想喝水。",
        "en": "I still want to drink water.",
        "tokens": [
          "我",
          "还",
          "想",
          "喝",
          "水"
        ]
      },
      {
        "zh": "现在还早。",
        "en": "It is still early.",
        "tokens": [
          "现在",
          "还",
          "早"
        ]
      }
    ]
  },
  {
    "id": "zhengzai",
    "word": "正在",
    "level": 1,
    "pattern": "正在 + verb",
    "meaning": "zhèng zài · right now",
    "explain": "正在 emphasizes that an action is in progress right now.",
    "distractors": [
      "也",
      "都"
    ],
    "contrast": "Which word emphasizes an action happening right now?",
    "examples": [
      {
        "zh": "我正在看书。",
        "en": "I am reading a book right now.",
        "tokens": [
          "我",
          "正在",
          "看",
          "书"
        ]
      },
      {
        "zh": "他正在写字。",
        "en": "He is writing characters right now.",
        "tokens": [
          "他",
          "正在",
          "写",
          "字"
        ]
      },
      {
        "zh": "妈妈正在做饭。",
        "en": "Mum is cooking right now.",
        "tokens": [
          "妈妈",
          "正在",
          "做",
          "饭"
        ]
      }
    ]
  },
  {
    "id": "zhe-state",
    "word": "着",
    "level": 2,
    "pattern": "verb + 着",
    "meaning": "zhe · continuing state",
    "explain": "着 after a verb describes a continuing state. It is pronounced with a neutral tone.",
    "distractors": [
      "了",
      "得"
    ],
    "contrast": "Which particle describes a state that continues?",
    "examples": [
      {
        "zh": "门开着。",
        "en": "The door is open.",
        "tokens": [
          "门",
          "开",
          "着"
        ]
      },
      {
        "zh": "他穿着白色的衣服。",
        "en": "He is wearing white clothes.",
        "tokens": [
          "他",
          "穿",
          "着",
          "白色",
          "的",
          "衣服"
        ]
      },
      {
        "zh": "她坐着。",
        "en": "She is sitting.",
        "tokens": [
          "她",
          "坐",
          "着"
        ]
      }
    ]
  },
  {
    "id": "zhe-manner",
    "word": "着",
    "level": 2,
    "pattern": "verb 1 + 着 + verb 2",
    "meaning": "zhe · accompanying action",
    "explain": "着 marks the ongoing action or manner that accompanies another action.",
    "distractors": [
      "了",
      "得"
    ],
    "contrast": "Which particle marks the action accompanying another action?",
    "examples": [
      {
        "zh": "他笑着说。",
        "en": "He says it with a smile.",
        "tokens": [
          "他",
          "笑",
          "着",
          "说"
        ]
      },
      {
        "zh": "她坐着看书。",
        "en": "She reads while sitting.",
        "tokens": [
          "她",
          "坐",
          "着",
          "看",
          "书"
        ]
      },
      {
        "zh": "他站着吃饭。",
        "en": "He eats while standing.",
        "tokens": [
          "他",
          "站",
          "着",
          "吃",
          "饭"
        ]
      }
    ]
  },
  {
    "id": "zhao-result",
    "word": "着",
    "level": 4,
    "pattern": "verb + 着 (zháo)",
    "meaning": "zháo · successful result",
    "explain": "着 pronounced zháo is a result complement. It indicates reaching a result, not a continuing state.",
    "distractors": [
      "了",
      "过"
    ],
    "contrast": "Which complement, pronounced zháo, indicates reaching a result?",
    "examples": [
      {
        "zh": "孩子睡着了。",
        "en": "The child fell asleep.",
        "tokens": [
          "孩子",
          "睡",
          "着",
          "了"
        ]
      },
      {
        "zh": "我找着了。",
        "en": "I found it.",
        "tokens": [
          "我",
          "找",
          "着",
          "了"
        ]
      },
      {
        "zh": "他买着了。",
        "en": "He managed to buy it.",
        "tokens": [
          "他",
          "买",
          "着",
          "了"
        ]
      }
    ]
  },
  {
    "id": "de-degree",
    "word": "得",
    "level": 2,
    "pattern": "verb + 得 + description",
    "meaning": "de · degree / manner complement",
    "explain": "得 connects an action to a following description of how well or how much it occurs.",
    "distractors": [
      "的",
      "地"
    ],
    "contrast": "Which structural particle comes after the verb and before a description?",
    "examples": [
      {
        "zh": "他写得很好。",
        "en": "He writes very well.",
        "tokens": [
          "他",
          "写",
          "得",
          "很",
          "好"
        ]
      },
      {
        "zh": "她跑得很快。",
        "en": "She runs very fast.",
        "tokens": [
          "她",
          "跑",
          "得",
          "很",
          "快"
        ]
      },
      {
        "zh": "你说得很好。",
        "en": "You speak very well.",
        "tokens": [
          "你",
          "说",
          "得",
          "很",
          "好"
        ]
      }
    ]
  },
  {
    "id": "guo-experience",
    "word": "过",
    "level": 2,
    "pattern": "verb + 过",
    "meaning": "guò · past experience",
    "explain": "过 after a verb means having experienced something before, rather than simply completing a specific event.",
    "distractors": [
      "了",
      "着"
    ],
    "contrast": "Which particle indicates past experience?",
    "examples": [
      {
        "zh": "我去过中国。",
        "en": "I have been to China.",
        "tokens": [
          "我",
          "去",
          "过",
          "中国"
        ]
      },
      {
        "zh": "我看过这本书。",
        "en": "I have read this book before.",
        "tokens": [
          "我",
          "看",
          "过",
          "这",
          "本",
          "书"
        ]
      },
      {
        "zh": "他吃过这个。",
        "en": "He has eaten this before.",
        "tokens": [
          "他",
          "吃",
          "过",
          "这个"
        ]
      }
    ]
  },
  {
    "id": "cong-origin",
    "word": "从",
    "level": 2,
    "pattern": "从 + place / time + action",
    "meaning": "cóng · from",
    "explain": "从 introduces a starting point in place or time.",
    "distractors": [
      "比",
      "给"
    ],
    "contrast": "Which word introduces a starting point?",
    "examples": [
      {
        "zh": "我从家来。",
        "en": "I came from home.",
        "tokens": [
          "我",
          "从",
          "家",
          "来"
        ]
      },
      {
        "zh": "他从学校回家。",
        "en": "He goes home from school.",
        "tokens": [
          "他",
          "从",
          "学校",
          "回",
          "家"
        ]
      },
      {
        "zh": "我从今天开始学习。",
        "en": "I start studying from today.",
        "tokens": [
          "我",
          "从",
          "今天",
          "开始",
          "学习"
        ]
      }
    ]
  },
  {
    "id": "bi-compare",
    "word": "比",
    "level": 2,
    "pattern": "A 比 B + adjective",
    "meaning": "bǐ · comparison",
    "explain": "比 marks the standard of comparison; the adjective follows B.",
    "distractors": [
      "从",
      "给"
    ],
    "contrast": "Which word introduces the standard of a comparison?",
    "examples": [
      {
        "zh": "他比我高。",
        "en": "He is taller than me.",
        "tokens": [
          "他",
          "比",
          "我",
          "高"
        ]
      },
      {
        "zh": "今天比昨天冷。",
        "en": "Today is colder than yesterday.",
        "tokens": [
          "今天",
          "比",
          "昨天",
          "冷"
        ]
      },
      {
        "zh": "这本书比那本贵。",
        "en": "This book is more expensive than that one.",
        "tokens": [
          "这",
          "本",
          "书",
          "比",
          "那",
          "本",
          "贵"
        ]
      }
    ]
  },
  {
    "id": "rang-cause",
    "word": "让",
    "level": 2,
    "pattern": "让 + person + action",
    "meaning": "ràng · let / make",
    "explain": "让 introduces the person who is allowed or caused to do something.",
    "distractors": [
      "从",
      "比"
    ],
    "contrast": "Which word means let or cause someone to do something?",
    "examples": [
      {
        "zh": "妈妈让我吃饭。",
        "en": "Mum tells me to eat.",
        "tokens": [
          "妈妈",
          "让",
          "我",
          "吃",
          "饭"
        ]
      },
      {
        "zh": "老师让他写字。",
        "en": "The teacher asks him to write characters.",
        "tokens": [
          "老师",
          "让",
          "他",
          "写",
          "字"
        ]
      },
      {
        "zh": "请让我看一下。",
        "en": "Please let me take a look.",
        "tokens": [
          "请",
          "让",
          "我",
          "看",
          "一",
          "下"
        ]
      }
    ]
  },
  {
    "id": "jiu-then",
    "word": "就",
    "level": 2,
    "pattern": "condition + 就 + result",
    "meaning": "jiù · then / soon after",
    "explain": "就 marks a prompt consequence or something happening immediately after a condition.",
    "distractors": [
      "比",
      "从"
    ],
    "contrast": "Which word indicates an immediate consequence?",
    "examples": [
      {
        "zh": "你来，我就去。",
        "en": "If you come, I will go.",
        "tokens": [
          "你",
          "来",
          "我",
          "就",
          "去"
        ]
      },
      {
        "zh": "我吃完饭就走。",
        "en": "I will leave as soon as I finish eating.",
        "tokens": [
          "我",
          "吃",
          "完",
          "饭",
          "就",
          "走"
        ]
      },
      {
        "zh": "他一到家就睡觉。",
        "en": "As soon as he gets home, he goes to sleep.",
        "tokens": [
          "他",
          "一",
          "到",
          "家",
          "就",
          "睡觉"
        ]
      }
    ]
  },
  {
    "id": "yinwei",
    "word": "因为",
    "level": 2,
    "pattern": "因为 A，所以 B",
    "meaning": "yīn wèi · because",
    "explain": "因为 introduces a reason; 所以 introduces its result.",
    "distractors": [
      "所以",
      "但是"
    ],
    "contrast": "Which word introduces a reason?",
    "examples": [
      {
        "zh": "因为下雨，我不去。",
        "en": "Because it is raining, I am not going.",
        "tokens": [
          "因为",
          "下雨",
          "我",
          "不",
          "去"
        ]
      },
      {
        "zh": "因为他很忙，所以没有来。",
        "en": "Because he is busy, he did not come.",
        "tokens": [
          "因为",
          "他",
          "很",
          "忙",
          "所以",
          "没有",
          "来"
        ]
      },
      {
        "zh": "我高兴，因为你来了。",
        "en": "I am happy because you came.",
        "tokens": [
          "我",
          "高兴",
          "因为",
          "你",
          "来",
          "了"
        ]
      }
    ]
  },
  {
    "id": "suoyi",
    "word": "所以",
    "level": 2,
    "pattern": "reason，所以 + result",
    "meaning": "suǒ yǐ · so",
    "explain": "所以 introduces the consequence of a reason, not the reason itself.",
    "distractors": [
      "因为",
      "但是"
    ],
    "contrast": "Which word introduces a consequence?",
    "examples": [
      {
        "zh": "我很累，所以想睡觉。",
        "en": "I am tired, so I want to sleep.",
        "tokens": [
          "我",
          "很",
          "累",
          "所以",
          "想",
          "睡觉"
        ]
      },
      {
        "zh": "今天下雨，所以我不去。",
        "en": "It is raining, so I will not go.",
        "tokens": [
          "今天",
          "下雨",
          "所以",
          "我",
          "不",
          "去"
        ]
      },
      {
        "zh": "他很忙，所以没有来。",
        "en": "He is busy, so he did not come.",
        "tokens": [
          "他",
          "很",
          "忙",
          "所以",
          "没有",
          "来"
        ]
      }
    ]
  },
  {
    "id": "suiran",
    "word": "虽然",
    "level": 2,
    "pattern": "虽然 A，但是 B",
    "meaning": "suī rán · although",
    "explain": "虽然 introduces a fact that contrasts with the following main clause.",
    "distractors": [
      "因为",
      "所以"
    ],
    "contrast": "Which word introduces a concessive fact?",
    "examples": [
      {
        "zh": "虽然很累，他还在工作。",
        "en": "Although tired, he is still working.",
        "tokens": [
          "虽然",
          "很",
          "累",
          "他",
          "还",
          "在",
          "工作"
        ]
      },
      {
        "zh": "虽然下雨，我们还是去了。",
        "en": "Although it rained, we still went.",
        "tokens": [
          "虽然",
          "下雨",
          "我们",
          "还是",
          "去",
          "了"
        ]
      },
      {
        "zh": "虽然很冷，但是我很高兴。",
        "en": "Although it is cold, I am happy.",
        "tokens": [
          "虽然",
          "很",
          "冷",
          "但是",
          "我",
          "很",
          "高兴"
        ]
      }
    ]
  },
  {
    "id": "danshi",
    "word": "但是",
    "level": 2,
    "pattern": "A，但是 B",
    "meaning": "dàn shì · but",
    "explain": "但是 joins two contrasting clauses. It often follows 虽然.",
    "distractors": [
      "所以",
      "因为"
    ],
    "contrast": "Which conjunction introduces a contrast?",
    "examples": [
      {
        "zh": "我想去，但是没有时间。",
        "en": "I want to go, but I have no time.",
        "tokens": [
          "我",
          "想",
          "去",
          "但是",
          "没有",
          "时间"
        ]
      },
      {
        "zh": "这本书很好，但是很贵。",
        "en": "This book is good but expensive.",
        "tokens": [
          "这",
          "本",
          "书",
          "很",
          "好",
          "但是",
          "很",
          "贵"
        ]
      },
      {
        "zh": "他很累，但是还在工作。",
        "en": "He is tired but still working.",
        "tokens": [
          "他",
          "很",
          "累",
          "但是",
          "还",
          "在",
          "工作"
        ]
      }
    ]
  },
  {
    "id": "haishi-choice",
    "word": "还是",
    "level": 2,
    "pattern": "A 还是 B？",
    "meaning": "hái shi · or (question)",
    "explain": "还是 offers alternatives in a question. 或者 is generally used for alternatives in statements.",
    "distractors": [
      "因为",
      "所以"
    ],
    "contrast": "Which word offers a choice in a question?",
    "examples": [
      {
        "zh": "你要茶还是水？",
        "en": "Do you want tea or water?",
        "tokens": [
          "你",
          "要",
          "茶",
          "还是",
          "水"
        ]
      },
      {
        "zh": "你今天来还是明天来？",
        "en": "Will you come today or tomorrow?",
        "tokens": [
          "你",
          "今天",
          "来",
          "还是",
          "明天",
          "来"
        ]
      },
      {
        "zh": "你去学校还是回家？",
        "en": "Are you going to school or home?",
        "tokens": [
          "你",
          "去",
          "学校",
          "还是",
          "回",
          "家"
        ]
      }
    ]
  },
  {
    "id": "haishi-still",
    "word": "还是",
    "level": 2,
    "pattern": "A，还是 B",
    "meaning": "hái shi · still / nevertheless",
    "explain": "还是 can indicate that a decision or condition remains unchanged despite something else.",
    "distractors": [
      "所以",
      "因为"
    ],
    "contrast": "Which word indicates that a decision remains unchanged?",
    "examples": [
      {
        "zh": "虽然下雨，我还是去了。",
        "en": "Although it rained, I still went.",
        "tokens": [
          "虽然",
          "下雨",
          "我",
          "还是",
          "去",
          "了"
        ]
      },
      {
        "zh": "他很累，还是来了。",
        "en": "He was tired but came anyway.",
        "tokens": [
          "他",
          "很",
          "累",
          "还是",
          "来",
          "了"
        ]
      },
      {
        "zh": "我想了想，还是不去了。",
        "en": "I thought about it and decided not to go after all.",
        "tokens": [
          "我",
          "想",
          "了",
          "想",
          "还是",
          "不",
          "去",
          "了"
        ]
      }
    ]
  },
  {
    "id": "ba-disposal",
    "word": "把",
    "level": 3,
    "pattern": "把 + object + verb + result",
    "meaning": "bǎ · disposal",
    "explain": "把 moves a specific object before an action that affects it. A result, direction or other complement normally follows the verb.",
    "distractors": [
      "被",
      "从"
    ],
    "contrast": "Which word moves an affected object before the verb?",
    "examples": [
      {
        "zh": "请把门打开。",
        "en": "Please open the door.",
        "tokens": [
          "请",
          "把",
          "门",
          "打开"
        ]
      },
      {
        "zh": "我把书放在桌子上。",
        "en": "I put the book on the table.",
        "tokens": [
          "我",
          "把",
          "书",
          "放",
          "在",
          "桌子",
          "上"
        ]
      },
      {
        "zh": "他把饭吃完了。",
        "en": "He finished eating his meal.",
        "tokens": [
          "他",
          "把",
          "饭",
          "吃",
          "完",
          "了"
        ]
      }
    ]
  },
  {
    "id": "ruguo",
    "word": "如果",
    "level": 3,
    "pattern": "如果 A，就 B",
    "meaning": "rú guǒ · if",
    "explain": "如果 introduces a hypothetical condition; 就 often introduces the result.",
    "distractors": [
      "因为",
      "所以"
    ],
    "contrast": "Which word introduces a hypothetical condition?",
    "examples": [
      {
        "zh": "如果下雨，我就不去。",
        "en": "If it rains, I will not go.",
        "tokens": [
          "如果",
          "下雨",
          "我",
          "就",
          "不",
          "去"
        ]
      },
      {
        "zh": "如果有时间，就来我家。",
        "en": "If you have time, come to my home.",
        "tokens": [
          "如果",
          "有",
          "时间",
          "就",
          "来",
          "我",
          "家"
        ]
      },
      {
        "zh": "如果你不知道，可以问我。",
        "en": "If you do not know, you can ask me.",
        "tokens": [
          "如果",
          "你",
          "不",
          "知道",
          "可以",
          "问",
          "我"
        ]
      }
    ]
  },
  {
    "id": "cai-late",
    "word": "才",
    "level": 3,
    "pattern": "time + 才 + verb",
    "meaning": "cái · only then / late",
    "explain": "才 signals that an action happened later than expected or only when a condition was met.",
    "distractors": [
      "从",
      "被"
    ],
    "contrast": "Which word signals that an event happened later than expected?",
    "examples": [
      {
        "zh": "他十点才来。",
        "en": "He did not come until ten.",
        "tokens": [
          "他",
          "十",
          "点",
          "才",
          "来"
        ]
      },
      {
        "zh": "我今天才知道。",
        "en": "I only found out today.",
        "tokens": [
          "我",
          "今天",
          "才",
          "知道"
        ]
      },
      {
        "zh": "她昨天才回家。",
        "en": "She did not return home until yesterday.",
        "tokens": [
          "她",
          "昨天",
          "才",
          "回",
          "家"
        ]
      }
    ]
  },
  {
    "id": "you-again",
    "word": "又",
    "level": 3,
    "pattern": "又 + verb",
    "meaning": "yòu · again (already happened)",
    "explain": "又 often marks repetition that has occurred or is occurring. 再 commonly marks a future repetition.",
    "distractors": [
      "把",
      "被"
    ],
    "contrast": "Which word commonly marks a repetition that has already happened?",
    "examples": [
      {
        "zh": "他又来了。",
        "en": "He came again.",
        "tokens": [
          "他",
          "又",
          "来",
          "了"
        ]
      },
      {
        "zh": "今天又下雨了。",
        "en": "It is raining again today.",
        "tokens": [
          "今天",
          "又",
          "下雨",
          "了"
        ]
      },
      {
        "zh": "我又看了一次。",
        "en": "I watched it again.",
        "tokens": [
          "我",
          "又",
          "看",
          "了",
          "一",
          "次"
        ]
      }
    ]
  },
  {
    "id": "huozhe",
    "word": "或者",
    "level": 3,
    "pattern": "A 或者 B",
    "meaning": "huò zhě · or (statement)",
    "explain": "或者 presents alternatives in a statement. 还是 commonly presents a choice in a question.",
    "distractors": [
      "所以",
      "因为"
    ],
    "contrast": "Which word generally offers alternatives in a statement?",
    "examples": [
      {
        "zh": "我可以喝茶或者水。",
        "en": "I can drink tea or water.",
        "tokens": [
          "我",
          "可以",
          "喝",
          "茶",
          "或者",
          "水"
        ]
      },
      {
        "zh": "今天或者明天都可以。",
        "en": "Today or tomorrow is fine.",
        "tokens": [
          "今天",
          "或者",
          "明天",
          "都",
          "可以"
        ]
      },
      {
        "zh": "你可以坐车或者走路。",
        "en": "You can take a vehicle or walk.",
        "tokens": [
          "你",
          "可以",
          "坐",
          "车",
          "或者",
          "走",
          "路"
        ]
      }
    ]
  },
  {
    "id": "erqie",
    "word": "而且",
    "level": 3,
    "pattern": "A，而且 B",
    "meaning": "ér qiě · moreover",
    "explain": "而且 adds another fact, often in the pattern 不但……而且…….",
    "distractors": [
      "但是",
      "所以"
    ],
    "contrast": "Which word adds a further fact?",
    "examples": [
      {
        "zh": "这本书很便宜，而且很好看。",
        "en": "This book is cheap and also looks good.",
        "tokens": [
          "这",
          "本",
          "书",
          "很",
          "便宜",
          "而且",
          "很",
          "好看"
        ]
      },
      {
        "zh": "他不但会写，而且会说。",
        "en": "He can not only write but also speak.",
        "tokens": [
          "他",
          "不但",
          "会",
          "写",
          "而且",
          "会",
          "说"
        ]
      },
      {
        "zh": "她很聪明，而且很努力。",
        "en": "She is clever and hardworking too.",
        "tokens": [
          "她",
          "很",
          "聪明",
          "而且",
          "很",
          "努力"
        ]
      }
    ]
  },
  {
    "id": "budan",
    "word": "不但",
    "level": 3,
    "pattern": "不但 A，而且 B",
    "meaning": "bú dàn · not only",
    "explain": "不但 introduces the first of two true points. 而且 introduces the second.",
    "distractors": [
      "如果",
      "所以"
    ],
    "contrast": "Which word starts the not-only construction?",
    "examples": [
      {
        "zh": "他不但会写，而且会说。",
        "en": "He can not only write but also speak.",
        "tokens": [
          "他",
          "不但",
          "会",
          "写",
          "而且",
          "会",
          "说"
        ]
      },
      {
        "zh": "这里不但安静，而且漂亮。",
        "en": "It is not only quiet here but also beautiful.",
        "tokens": [
          "这里",
          "不但",
          "安静",
          "而且",
          "漂亮"
        ]
      },
      {
        "zh": "她不但学习好，而且很努力。",
        "en": "She not only studies well but also works hard.",
        "tokens": [
          "她",
          "不但",
          "学习",
          "好",
          "而且",
          "很",
          "努力"
        ]
      }
    ]
  },
  {
    "id": "yibian",
    "word": "一边",
    "level": 3,
    "pattern": "一边 A，一边 B",
    "meaning": "yì biān · while doing",
    "explain": "一边 repeated before two actions shows they take place at the same time.",
    "distractors": [
      "所以",
      "因为"
    ],
    "contrast": "Which word repeats to indicate simultaneous actions?",
    "examples": [
      {
        "zh": "他一边吃饭，一边看电视。",
        "en": "He eats while watching television.",
        "tokens": [
          "他",
          "一边",
          "吃",
          "饭",
          "一边",
          "看",
          "电视"
        ]
      },
      {
        "zh": "她一边走，一边说话。",
        "en": "She talks while walking.",
        "tokens": [
          "她",
          "一边",
          "走",
          "一边",
          "说话"
        ]
      },
      {
        "zh": "我一边看书，一边听音乐。",
        "en": "I read while listening to music.",
        "tokens": [
          "我",
          "一边",
          "看",
          "书",
          "一边",
          "听",
          "音乐"
        ]
      }
    ]
  },
  {
    "id": "yue-compare",
    "word": "越",
    "level": 3,
    "pattern": "越 A，越 B",
    "meaning": "yuè · increasing degree",
    "explain": "Repeated 越 connects two increasing or decreasing degrees.",
    "distractors": [
      "又",
      "才"
    ],
    "contrast": "Which word is repeated to link two changing degrees?",
    "examples": [
      {
        "zh": "越学越有意思。",
        "en": "The more I study, the more interesting it becomes.",
        "tokens": [
          "越",
          "学",
          "越",
          "有意思"
        ]
      },
      {
        "zh": "越多越好。",
        "en": "The more, the better.",
        "tokens": [
          "越",
          "多",
          "越",
          "好"
        ]
      },
      {
        "zh": "天气越来越冷。",
        "en": "The weather is getting colder and colder.",
        "tokens": [
          "天气",
          "越",
          "来",
          "越",
          "冷"
        ]
      }
    ]
  },
  {
    "id": "de-modifier",
    "word": "的",
    "level": 1,
    "pattern": "description + 的 + noun",
    "meaning": "de · describing a noun",
    "explain": "的 links a description to a noun, including a phrase that describes it.",
    "distractors": [
      "了",
      "吗"
    ],
    "contrast": "Which particle comes after a description and before a noun?",
    "examples": [
      {
        "zh": "我喜欢大的房间。",
        "en": "I like big rooms.",
        "tokens": [
          "我",
          "喜欢",
          "大",
          "的",
          "房间"
        ]
      },
      {
        "zh": "这是他买的书。",
        "en": "This is the book he bought.",
        "tokens": [
          "这",
          "是",
          "他",
          "买",
          "的",
          "书"
        ]
      },
      {
        "zh": "我喜欢新的衣服。",
        "en": "I like new clothes.",
        "tokens": [
          "我",
          "喜欢",
          "新",
          "的",
          "衣服"
        ]
      }
    ]
  },
  {
    "id": "de-nominal",
    "word": "的",
    "level": 1,
    "pattern": "description + 的",
    "meaning": "de · noun omitted",
    "explain": "的 allows a known noun to be omitted: the one that is described.",
    "distractors": [
      "了",
      "吗"
    ],
    "contrast": "Which particle lets a description stand for a noun?",
    "examples": [
      {
        "zh": "我要大的。",
        "en": "I want the big one.",
        "tokens": [
          "我",
          "要",
          "大",
          "的"
        ]
      },
      {
        "zh": "这本书是我的。",
        "en": "This book is mine.",
        "tokens": [
          "这",
          "本",
          "书",
          "是",
          "我",
          "的"
        ]
      },
      {
        "zh": "我要小的。",
        "en": "I want the small one.",
        "tokens": [
          "我",
          "要",
          "小",
          "的"
        ]
      }
    ]
  },
  {
    "id": "ba-suggest",
    "word": "吧",
    "level": 1,
    "pattern": "proposal + 吧",
    "meaning": "ba · suggestion",
    "explain": "吧 softens a suggestion or invitation rather than asking a neutral yes/no question.",
    "distractors": [
      "吗",
      "的"
    ],
    "contrast": "Which particle softens a suggestion?",
    "examples": [
      {
        "zh": "我们去吧。",
        "en": "Let's go.",
        "tokens": [
          "我们",
          "去",
          "吧"
        ]
      },
      {
        "zh": "你来我家吧。",
        "en": "Come to my home.",
        "tokens": [
          "你",
          "来",
          "我",
          "家",
          "吧"
        ]
      },
      {
        "zh": "我们喝茶吧。",
        "en": "Let's drink tea.",
        "tokens": [
          "我们",
          "喝",
          "茶",
          "吧"
        ]
      }
    ]
  },
  {
    "id": "he-and",
    "word": "和",
    "level": 1,
    "pattern": "noun + 和 + noun",
    "meaning": "hé · and",
    "explain": "和 joins nouns and noun phrases. It does not normally connect complete sentences.",
    "distractors": [
      "也",
      "都"
    ],
    "contrast": "Which word joins two nouns?",
    "examples": [
      {
        "zh": "我喜欢茶和水。",
        "en": "I like tea and water.",
        "tokens": [
          "我",
          "喜欢",
          "茶",
          "和",
          "水"
        ]
      },
      {
        "zh": "爸爸和妈妈都在家。",
        "en": "Dad and Mum are both at home.",
        "tokens": [
          "爸爸",
          "和",
          "妈妈",
          "都",
          "在",
          "家"
        ]
      },
      {
        "zh": "我买了苹果和书。",
        "en": "I bought apples and books.",
        "tokens": [
          "我",
          "买",
          "了",
          "苹果",
          "和",
          "书"
        ]
      }
    ]
  },
  {
    "id": "he-with",
    "word": "和",
    "level": 1,
    "pattern": "和 + person + action",
    "meaning": "hé · with",
    "explain": "和 introduces a companion participating in an action.",
    "distractors": [
      "也",
      "都"
    ],
    "contrast": "Which word introduces the person you do an action with?",
    "examples": [
      {
        "zh": "我和他去学校。",
        "en": "I go to school with him.",
        "tokens": [
          "我",
          "和",
          "他",
          "去",
          "学校"
        ]
      },
      {
        "zh": "我和妈妈去买书。",
        "en": "I go to buy books with Mum.",
        "tokens": [
          "我",
          "和",
          "妈妈",
          "去",
          "买",
          "书"
        ]
      },
      {
        "zh": "他和我都在工作。",
        "en": "He and I are both working.",
        "tokens": [
          "他",
          "和",
          "我",
          "都",
          "在",
          "工作"
        ]
      }
    ]
  },
  {
    "id": "gei-benefit",
    "word": "给",
    "level": 1,
    "pattern": "给 + person + action",
    "meaning": "gěi · for / to someone",
    "explain": "给 can introduce the recipient or beneficiary before an action, rather than being the main verb give.",
    "distractors": [
      "也",
      "都"
    ],
    "contrast": "Which word introduces the recipient of an action?",
    "examples": [
      {
        "zh": "我给他买书。",
        "en": "I buy books for him.",
        "tokens": [
          "我",
          "给",
          "他",
          "买",
          "书"
        ]
      },
      {
        "zh": "妈妈给我做饭。",
        "en": "Mum cooks for me.",
        "tokens": [
          "妈妈",
          "给",
          "我",
          "做",
          "饭"
        ]
      },
      {
        "zh": "我给你写字。",
        "en": "I write characters for you.",
        "tokens": [
          "我",
          "给",
          "你",
          "写",
          "字"
        ]
      }
    ]
  },
  {
    "id": "zai-again",
    "word": "再",
    "level": 1,
    "pattern": "再 + verb",
    "meaning": "zài · again / then",
    "explain": "再 often describes a future repetition or the next action, not an already completed repetition.",
    "distractors": [
      "的",
      "吗"
    ],
    "contrast": "Which word marks a future repetition?",
    "examples": [
      {
        "zh": "请再说。",
        "en": "Please say it again.",
        "tokens": [
          "请",
          "再",
          "说"
        ]
      },
      {
        "zh": "明天再来。",
        "en": "Come again tomorrow.",
        "tokens": [
          "明天",
          "再",
          "来"
        ]
      },
      {
        "zh": "我想再看。",
        "en": "I want to watch it again.",
        "tokens": [
          "我",
          "想",
          "再",
          "看"
        ]
      }
    ]
  },
  {
    "id": "bei-passive",
    "word": "被",
    "level": 3,
    "pattern": "patient + 被 + agent + action",
    "meaning": "bèi · passive",
    "explain": "被 introduces the doer in a passive sentence, or marks a passive action when the doer is omitted.",
    "distractors": [
      "把",
      "从"
    ],
    "contrast": "Which word marks the passive construction?",
    "examples": [
      {
        "zh": "我的书被他拿走了。",
        "en": "My book was taken away by him.",
        "tokens": [
          "我",
          "的",
          "书",
          "被",
          "他",
          "拿",
          "走",
          "了"
        ]
      },
      {
        "zh": "门被打开了。",
        "en": "The door was opened.",
        "tokens": [
          "门",
          "被",
          "打开",
          "了"
        ]
      },
      {
        "zh": "苹果被他吃了。",
        "en": "The apple was eaten by him.",
        "tokens": [
          "苹果",
          "被",
          "他",
          "吃",
          "了"
        ]
      }
    ]
  },
  {
    "id": "de-adverb",
    "word": "地",
    "level": 2,
    "pattern": "adjective + 地 + verb",
    "meaning": "de · manner marker",
    "explain": "地 links a description of manner to the action. It comes before the verb.",
    "distractors": [
      "的",
      "得"
    ],
    "contrast": "Which structural particle links manner to the following verb?",
    "examples": [
      {
        "zh": "他高兴地笑了。",
        "en": "He smiled happily.",
        "tokens": [
          "他",
          "高兴",
          "地",
          "笑",
          "了"
        ]
      },
      {
        "zh": "她慢地走。",
        "en": "She walks slowly.",
        "tokens": [
          "她",
          "慢",
          "地",
          "走"
        ]
      },
      {
        "zh": "他高兴地回家了。",
        "en": "He went home happily.",
        "tokens": [
          "他",
          "高兴",
          "地",
          "回",
          "家",
          "了"
        ]
      }
    ]
  },
  {
    "id": "men-plural",
    "word": "们",
    "level": 1,
    "pattern": "pronoun / person + 们",
    "meaning": "men · plural marker",
    "explain": "们 marks a group of people. It is common with personal pronouns; normally do not add it after a specific number.",
    "distractors": [
      "的",
      "了"
    ],
    "contrast": "Which suffix marks a group of people?",
    "examples": [
      {
        "zh": "我们是学生。",
        "en": "We are students.",
        "tokens": [
          "我",
          "们",
          "是",
          "学生"
        ]
      },
      {
        "zh": "你们去哪里？",
        "en": "Where are you all going?",
        "tokens": [
          "你",
          "们",
          "去",
          "哪里"
        ]
      },
      {
        "zh": "他们都在家。",
        "en": "They are all at home.",
        "tokens": [
          "他",
          "们",
          "都",
          "在",
          "家"
        ]
      }
    ]
  },
  {
    "id": "di-ordinal",
    "word": "第",
    "level": 1,
    "pattern": "第 + number + measure word",
    "meaning": "dì · ordinal marker",
    "explain": "第 makes a number ordinal: first, second, third.",
    "distractors": [
      "的",
      "也"
    ],
    "contrast": "Which prefix turns a number into an ordinal?",
    "examples": [
      {
        "zh": "我要第一个。",
        "en": "I want the first one.",
        "tokens": [
          "我",
          "要",
          "第",
          "一",
          "个"
        ]
      },
      {
        "zh": "他在第二个房间。",
        "en": "He is in the second room.",
        "tokens": [
          "他",
          "在",
          "第",
          "二",
          "个",
          "房间"
        ]
      },
      {
        "zh": "这是第三本书。",
        "en": "This is the third book.",
        "tokens": [
          "这",
          "是",
          "第",
          "三",
          "本",
          "书"
        ]
      }
    ]
  },
  {
    "id": "a-exclaim",
    "word": "啊",
    "level": 2,
    "pattern": "clause + 啊",
    "meaning": "a · emotional particle",
    "explain": "啊 can soften a statement or add emotion at the end of a sentence.",
    "distractors": [
      "的",
      "得"
    ],
    "contrast": "Which sentence-final particle adds emotion?",
    "examples": [
      {
        "zh": "你来了啊！",
        "en": "Oh, you have arrived!",
        "tokens": [
          "你",
          "来",
          "了",
          "啊"
        ]
      },
      {
        "zh": "真好看啊！",
        "en": "How pretty!",
        "tokens": [
          "真",
          "好看",
          "啊"
        ]
      },
      {
        "zh": "今天真冷啊！",
        "en": "It is really cold today!",
        "tokens": [
          "今天",
          "真",
          "冷",
          "啊"
        ]
      }
    ]
  },
  {
    "id": "dan",
    "word": "但",
    "level": 2,
    "pattern": "A，但 B",
    "meaning": "dàn · but",
    "explain": "但 introduces a contrasting clause, like 但是 but often more concise.",
    "distractors": [
      "因为",
      "所以"
    ],
    "contrast": "Which short conjunction introduces a contrast?",
    "examples": [
      {
        "zh": "我想去，但没有时间。",
        "en": "I want to go but have no time.",
        "tokens": [
          "我",
          "想",
          "去",
          "但",
          "没有",
          "时间"
        ]
      },
      {
        "zh": "他很累，但还在工作。",
        "en": "He is tired but still working.",
        "tokens": [
          "他",
          "很",
          "累",
          "但",
          "还",
          "在",
          "工作"
        ]
      },
      {
        "zh": "这本书很好，但很贵。",
        "en": "This book is good but expensive.",
        "tokens": [
          "这",
          "本",
          "书",
          "很",
          "好",
          "但",
          "很",
          "贵"
        ]
      }
    ]
  },
  {
    "id": "gen-with",
    "word": "跟",
    "level": 2,
    "pattern": "跟 + person + action",
    "meaning": "gēn · with",
    "explain": "跟 introduces a companion in everyday speech. 与 is the formal alternative.",
    "distractors": [
      "从",
      "比"
    ],
    "contrast": "Which preposition introduces a companion?",
    "examples": [
      {
        "zh": "我跟他去学校。",
        "en": "I go to school with him.",
        "tokens": [
          "我",
          "跟",
          "他",
          "去",
          "学校"
        ]
      },
      {
        "zh": "她跟我一起工作。",
        "en": "She works with me.",
        "tokens": [
          "她",
          "跟",
          "我",
          "一起",
          "工作"
        ]
      },
      {
        "zh": "你想跟谁去？",
        "en": "Who do you want to go with?",
        "tokens": [
          "你",
          "想",
          "跟",
          "谁",
          "去"
        ]
      }
    ]
  },
  {
    "id": "wang-direction",
    "word": "往",
    "level": 2,
    "pattern": "往 + direction + action",
    "meaning": "wǎng · towards",
    "explain": "往 introduces a direction in which someone or something moves.",
    "distractors": [
      "从",
      "比"
    ],
    "contrast": "Which preposition indicates the direction of movement?",
    "examples": [
      {
        "zh": "请往左走。",
        "en": "Please walk to the left.",
        "tokens": [
          "请",
          "往",
          "左",
          "走"
        ]
      },
      {
        "zh": "我们往前走。",
        "en": "We walk forward.",
        "tokens": [
          "我们",
          "往",
          "前",
          "走"
        ]
      },
      {
        "zh": "他往家走。",
        "en": "He walks toward home.",
        "tokens": [
          "他",
          "往",
          "家",
          "走"
        ]
      }
    ]
  },
  {
    "id": "xiang-direction",
    "word": "向",
    "level": 3,
    "pattern": "向 + person / direction + action",
    "meaning": "xiàng · towards",
    "explain": "向 introduces a direction or the recipient of an action such as asking or learning.",
    "distractors": [
      "把",
      "被"
    ],
    "contrast": "Which preposition introduces a recipient or direction?",
    "examples": [
      {
        "zh": "我向老师学习。",
        "en": "I learn from the teacher.",
        "tokens": [
          "我",
          "向",
          "老师",
          "学习"
        ]
      },
      {
        "zh": "他向我走来。",
        "en": "He walked towards me.",
        "tokens": [
          "他",
          "向",
          "我",
          "走",
          "来"
        ]
      },
      {
        "zh": "请向左走。",
        "en": "Please walk to the left.",
        "tokens": [
          "请",
          "向",
          "左",
          "走"
        ]
      }
    ]
  },
  {
    "id": "ranhou",
    "word": "然后",
    "level": 3,
    "pattern": "A，然后 B",
    "meaning": "rán hòu · then",
    "explain": "然后 marks a subsequent event or action in sequence.",
    "distractors": [
      "因为",
      "但是"
    ],
    "contrast": "Which word introduces the next event in a sequence?",
    "examples": [
      {
        "zh": "我先吃饭，然后看书。",
        "en": "I eat first, then read.",
        "tokens": [
          "我",
          "先",
          "吃",
          "饭",
          "然后",
          "看",
          "书"
        ]
      },
      {
        "zh": "他先写字，然后休息。",
        "en": "He writes first, then rests.",
        "tokens": [
          "他",
          "先",
          "写",
          "字",
          "然后",
          "休息"
        ]
      },
      {
        "zh": "先买书，然后回家。",
        "en": "Buy books first, then go home.",
        "tokens": [
          "先",
          "买",
          "书",
          "然后",
          "回",
          "家"
        ]
      }
    ]
  },
  {
    "id": "keshi",
    "word": "可是",
    "level": 3,
    "pattern": "A，可是 B",
    "meaning": "kě shì · but",
    "explain": "可是 introduces a contrast, commonly in conversation.",
    "distractors": [
      "因为",
      "所以"
    ],
    "contrast": "Which conjunction introduces a contrasting clause?",
    "examples": [
      {
        "zh": "我想去，可是没有时间。",
        "en": "I want to go but have no time.",
        "tokens": [
          "我",
          "想",
          "去",
          "可是",
          "没有",
          "时间"
        ]
      },
      {
        "zh": "我很累，可是还要工作。",
        "en": "I am tired but still have to work.",
        "tokens": [
          "我",
          "很",
          "累",
          "可是",
          "还",
          "要",
          "工作"
        ]
      },
      {
        "zh": "这本书很好，可是太贵了。",
        "en": "This book is good but too expensive.",
        "tokens": [
          "这",
          "本",
          "书",
          "很",
          "好",
          "可是",
          "太",
          "贵",
          "了"
        ]
      }
    ]
  },
  {
    "id": "yaoshi",
    "word": "要是",
    "level": 4,
    "pattern": "要是 A，就 B",
    "meaning": "yào shi · if",
    "explain": "要是 introduces a hypothetical condition in everyday conversation, like 如果.",
    "distractors": [
      "因为",
      "所以"
    ],
    "contrast": "Which colloquial conjunction introduces a hypothetical condition?",
    "examples": [
      {
        "zh": "要是下雨，我就不去。",
        "en": "If it rains, I will not go.",
        "tokens": [
          "要是",
          "下雨",
          "我",
          "就",
          "不",
          "去"
        ]
      },
      {
        "zh": "要是有时间，就来我家。",
        "en": "If you have time, come to my home.",
        "tokens": [
          "要是",
          "有",
          "时间",
          "就",
          "来",
          "我",
          "家"
        ]
      },
      {
        "zh": "要是你不知道，就问我。",
        "en": "If you do not know, ask me.",
        "tokens": [
          "要是",
          "你",
          "不",
          "知道",
          "就",
          "问",
          "我"
        ]
      }
    ]
  },
  {
    "id": "wei-formal",
    "word": "为",
    "level": 4,
    "pattern": "A 为 B",
    "meaning": "wéi · formal is / equals",
    "explain": "为 pronounced wéi can function as a formal verb meaning is or equals, especially with values or classifications.",
    "distractors": [
      "由",
      "与"
    ],
    "contrast": "Which formal verb, pronounced wéi, can mean equals?",
    "examples": [
      {
        "zh": "这次比赛的时间为三天。",
        "en": "The duration of this competition is three days.",
        "tokens": [
          "这",
          "次",
          "比赛",
          "的",
          "时间",
          "为",
          "三",
          "天"
        ]
      },
      {
        "zh": "每人的费用为一百元。",
        "en": "The fee per person is one hundred yuan.",
        "tokens": [
          "每",
          "人",
          "的",
          "费用",
          "为",
          "一",
          "百",
          "元"
        ]
      },
      {
        "zh": "正确的答案为三。",
        "en": "The correct answer is three.",
        "tokens": [
          "正确",
          "的",
          "答案",
          "为",
          "三"
        ]
      }
    ]
  },
  {
    "id": "ya-exclaim",
    "word": "呀",
    "level": 5,
    "pattern": "clause + 呀",
    "meaning": "yā · expressive particle",
    "explain": "呀 is an expressive sentence-final particle; it can soften a question or add emotion.",
    "distractors": [
      "的",
      "得"
    ],
    "contrast": "Which sentence-final particle adds friendly emotion?",
    "examples": [
      {
        "zh": "你怎么在这儿呀？",
        "en": "How come you are here?",
        "tokens": [
          "你",
          "怎么",
          "在",
          "这儿",
          "呀"
        ]
      },
      {
        "zh": "真好看呀！",
        "en": "How pretty!",
        "tokens": [
          "真",
          "好看",
          "呀"
        ]
      },
      {
        "zh": "你去哪里呀？",
        "en": "Where are you going?",
        "tokens": [
          "你",
          "去",
          "哪里",
          "呀"
        ]
      }
    ]
  },
  {
    "id": "de-emphasis",
    "word": "的",
    "level": 1,
    "pattern": "是……的 / sentence-final 的",
    "meaning": "de · assurance",
    "explain": "的 can end a statement to express assurance or emphasize a fact, often with 是.",
    "distractors": [
      "吗",
      "呢"
    ],
    "contrast": "Which particle can end a statement of assurance?",
    "examples": [
      {
        "zh": "我会来的。",
        "en": "I will come, I assure you.",
        "tokens": [
          "我",
          "会",
          "来",
          "的"
        ]
      },
      {
        "zh": "他会知道的。",
        "en": "He will know.",
        "tokens": [
          "他",
          "会",
          "知道",
          "的"
        ]
      },
      {
        "zh": "这是真的。",
        "en": "This is true.",
        "tokens": [
          "这",
          "是",
          "真",
          "的"
        ]
      }
    ]
  },
  {
    "id": "w47-then",
    "word": "那",
    "level": 1,
    "pattern": "那，B",
    "meaning": "nà · then / in that case",
    "explain": "那 introduces a response or decision based on the preceding situation.",
    "distractors": [
      "也",
      "都"
    ],
    "contrast": "Which word fits this function: then / in that case?",
    "examples": [
      {
        "zh": "那我不去了。",
        "en": "In that case, I will not go.",
        "tokens": [
          "那",
          "我",
          "不",
          "去",
          "了"
        ]
      },
      {
        "zh": "那我们明天见。",
        "en": "Then see you tomorrow.",
        "tokens": [
          "那",
          "我们",
          "明天",
          "见"
        ]
      },
      {
        "zh": "那你呢？",
        "en": "Then what about you?",
        "tokens": [
          "那",
          "你",
          "呢"
        ]
      }
    ]
  },
  {
    "id": "w97-cause",
    "word": "叫",
    "level": 1,
    "pattern": "叫 + person + action",
    "meaning": "jiào · tell / ask someone to do",
    "explain": "叫 can introduce a person who is asked to do something; it can also mean call or be named.",
    "distractors": [
      "和",
      "也"
    ],
    "contrast": "Which word fits this function: tell / ask someone to do?",
    "examples": [
      {
        "zh": "妈妈叫我吃饭。",
        "en": "Mum calls me to eat.",
        "tokens": [
          "妈妈",
          "叫",
          "我",
          "吃",
          "饭"
        ]
      },
      {
        "zh": "老师叫他写字。",
        "en": "The teacher asks him to write characters.",
        "tokens": [
          "老师",
          "叫",
          "他",
          "写",
          "字"
        ]
      },
      {
        "zh": "他叫我去。",
        "en": "He tells me to go.",
        "tokens": [
          "他",
          "叫",
          "我",
          "去"
        ]
      }
    ]
  },
  {
    "id": "w303-etc",
    "word": "等",
    "level": 2,
    "pattern": "A、B 等",
    "meaning": "děng · and so on",
    "explain": "等 at the end of a list indicates additional items of the same kind.",
    "distractors": [
      "比",
      "从"
    ],
    "contrast": "Which word fits this function: and so on?",
    "examples": [
      {
        "zh": "我喜欢苹果、水果等。",
        "en": "I like apples, fruit and so on.",
        "tokens": [
          "我",
          "喜欢",
          "苹果",
          "水果",
          "等"
        ]
      },
      {
        "zh": "他买了书、笔等。",
        "en": "He bought books, pens and so on.",
        "tokens": [
          "他",
          "买",
          "了",
          "书",
          "笔",
          "等"
        ]
      },
      {
        "zh": "这里有老师、学生等。",
        "en": "There are teachers, students and others here.",
        "tokens": [
          "这里",
          "有",
          "老师",
          "学生",
          "等"
        ]
      }
    ]
  },
  {
    "id": "w508-emphasis",
    "word": "可",
    "level": 3,
    "pattern": "可 + adjective / predicate",
    "meaning": "kě · emphatic really / certainly",
    "explain": "可 can emphasize a statement in conversation, often contrasting with an expectation.",
    "distractors": [
      "才",
      "从"
    ],
    "contrast": "Which word fits this function: emphatic really / certainly?",
    "examples": [
      {
        "zh": "这可不是小事。",
        "en": "This is certainly no small matter.",
        "tokens": [
          "这",
          "可",
          "不",
          "是",
          "小",
          "事"
        ]
      },
      {
        "zh": "你可不要忘了。",
        "en": "Make sure you do not forget.",
        "tokens": [
          "你",
          "可",
          "不",
          "要",
          "忘",
          "了"
        ]
      },
      {
        "zh": "他可高兴了。",
        "en": "He was really happy.",
        "tokens": [
          "他",
          "可",
          "高兴",
          "了"
        ]
      }
    ]
  },
  {
    "id": "w515-or",
    "word": "或",
    "level": 3,
    "pattern": "A 或 B",
    "meaning": "huò · or",
    "explain": "或 joins alternatives, especially in written language.",
    "distractors": [
      "把",
      "被"
    ],
    "contrast": "Which word fits this function: or?",
    "examples": [
      {
        "zh": "今天或明天都可以。",
        "en": "Today or tomorrow is fine.",
        "tokens": [
          "今天",
          "或",
          "明天",
          "都",
          "可以"
        ]
      },
      {
        "zh": "请写名字或电话。",
        "en": "Please write your name or phone number.",
        "tokens": [
          "请",
          "写",
          "名字",
          "或",
          "电话"
        ]
      },
      {
        "zh": "你可以买书或笔。",
        "en": "You can buy a book or a pen.",
        "tokens": [
          "你",
          "可以",
          "买",
          "书",
          "或",
          "笔"
        ]
      }
    ]
  },
  {
    "id": "w548-only",
    "word": "只是",
    "level": 3,
    "pattern": "只是 + limitation",
    "meaning": "zhǐ shì · only / it is just that",
    "explain": "只是 limits the preceding statement or introduces a qualification.",
    "distractors": [
      "所以",
      "因为"
    ],
    "contrast": "Which word fits this function: only / it is just that?",
    "examples": [
      {
        "zh": "我只是问一下。",
        "en": "I am just asking.",
        "tokens": [
          "我",
          "只是",
          "问",
          "一",
          "下"
        ]
      },
      {
        "zh": "他只是有点儿累。",
        "en": "He is just a little tired.",
        "tokens": [
          "他",
          "只是",
          "有点儿",
          "累"
        ]
      },
      {
        "zh": "我想去，只是没有时间。",
        "en": "I want to go; it is just that I have no time.",
        "tokens": [
          "我",
          "想",
          "去",
          "只是",
          "没有",
          "时间"
        ]
      }
    ]
  },
  {
    "id": "w554-relative",
    "word": "比较",
    "level": 3,
    "pattern": "比较 + adjective",
    "meaning": "bǐ jiào · relatively / rather",
    "explain": "比较 modifies an adjective to express a relative degree, without explicitly naming the comparison.",
    "distractors": [
      "把",
      "被"
    ],
    "contrast": "Which word fits this function: relatively / rather?",
    "examples": [
      {
        "zh": "今天比较冷。",
        "en": "Today is relatively cold.",
        "tokens": [
          "今天",
          "比较",
          "冷"
        ]
      },
      {
        "zh": "这本书比较贵。",
        "en": "This book is rather expensive.",
        "tokens": [
          "这",
          "本",
          "书",
          "比较",
          "贵"
        ]
      },
      {
        "zh": "我比较喜欢茶。",
        "en": "I rather like tea.",
        "tokens": [
          "我",
          "比较",
          "喜欢",
          "茶"
        ]
      }
    ]
  },
  {
    "id": "w986-condition",
    "word": "的话",
    "level": 3,
    "pattern": "A 的话，B",
    "meaning": "de huà · if A, then B",
    "explain": "的话 follows a hypothetical condition, often with 如果.",
    "distractors": [
      "所以",
      "但是"
    ],
    "contrast": "Which word fits this function: if A, then B?",
    "examples": [
      {
        "zh": "你有时间的话，就来我家。",
        "en": "If you have time, come to my home.",
        "tokens": [
          "你",
          "有",
          "时间",
          "的话",
          "就",
          "来",
          "我",
          "家"
        ]
      },
      {
        "zh": "下雨的话，我就不去。",
        "en": "If it rains, I will not go.",
        "tokens": [
          "下雨",
          "的话",
          "我",
          "就",
          "不",
          "去"
        ]
      },
      {
        "zh": "你不知道的话，可以问我。",
        "en": "If you do not know, ask me.",
        "tokens": [
          "你",
          "不",
          "知道",
          "的话",
          "可以",
          "问",
          "我"
        ]
      }
    ]
  },
  {
    "id": "w997-future",
    "word": "将",
    "level": 4,
    "pattern": "将 + verb",
    "meaning": "jiāng · will / shall",
    "explain": "将 marks a future event in formal language.",
    "distractors": [
      "由",
      "与"
    ],
    "contrast": "Which word fits this function: will / shall?",
    "examples": [
      {
        "zh": "比赛将在明天开始。",
        "en": "The competition will start tomorrow.",
        "tokens": [
          "比赛",
          "将",
          "在",
          "明天",
          "开始"
        ]
      },
      {
        "zh": "他将去中国学习。",
        "en": "He will go to China to study.",
        "tokens": [
          "他",
          "将",
          "去",
          "中国",
          "学习"
        ]
      },
      {
        "zh": "学校将举行比赛。",
        "en": "The school will hold a competition.",
        "tokens": [
          "学校",
          "将",
          "举行",
          "比赛"
        ]
      }
    ]
  },
  {
    "id": "w1000-emphasis",
    "word": "就是",
    "level": 4,
    "pattern": "就是 + focused item",
    "meaning": "jiù shì · exactly / precisely",
    "explain": "就是 identifies or emphasizes the particular thing or person meant.",
    "distractors": [
      "由于",
      "否则"
    ],
    "contrast": "Which word fits this function: exactly / precisely?",
    "examples": [
      {
        "zh": "这就是我的书。",
        "en": "This is exactly my book.",
        "tokens": [
          "这",
          "就是",
          "我",
          "的",
          "书"
        ]
      },
      {
        "zh": "他就是我要找的人。",
        "en": "He is the person I am looking for.",
        "tokens": [
          "他",
          "就是",
          "我",
          "要",
          "找",
          "的",
          "人"
        ]
      },
      {
        "zh": "我就是不想去。",
        "en": "I simply do not want to go.",
        "tokens": [
          "我",
          "就是",
          "不",
          "想",
          "去"
        ]
      }
    ]
  },
  {
    "id": "w1021-when",
    "word": "当",
    "level": 4,
    "pattern": "当 A 时，B",
    "meaning": "dāng · when",
    "explain": "当 introduces a time or situation in which the main action happens.",
    "distractors": [
      "由于",
      "否则"
    ],
    "contrast": "Which word fits this function: when?",
    "examples": [
      {
        "zh": "当我到家时，他已经睡了。",
        "en": "When I got home, he was already asleep.",
        "tokens": [
          "当",
          "我",
          "到",
          "家",
          "时",
          "他",
          "已经",
          "睡",
          "了"
        ]
      },
      {
        "zh": "当你遇到问题时，请告诉我。",
        "en": "When you encounter a problem, please tell me.",
        "tokens": [
          "当",
          "你",
          "遇到",
          "问题",
          "时",
          "请",
          "告诉",
          "我"
        ]
      },
      {
        "zh": "当他来时，我正在看书。",
        "en": "When he came, I was reading.",
        "tokens": [
          "当",
          "他",
          "来",
          "时",
          "我",
          "正在",
          "看",
          "书"
        ]
      }
    ]
  },
  {
    "id": "w1023-simultaneous",
    "word": "同时",
    "level": 4,
    "pattern": "A，同时 B",
    "meaning": "tóng shí · at the same time",
    "explain": "同时 adds an action or fact occurring alongside another.",
    "distractors": [
      "由于",
      "否则"
    ],
    "contrast": "Which word fits this function: at the same time?",
    "examples": [
      {
        "zh": "我想学习，同时也想工作。",
        "en": "I want to study and work at the same time.",
        "tokens": [
          "我",
          "想",
          "学习",
          "同时",
          "也",
          "想",
          "工作"
        ]
      },
      {
        "zh": "他工作的同时也在学习。",
        "en": "He studies while working.",
        "tokens": [
          "他",
          "工作",
          "的",
          "同时",
          "也",
          "在",
          "学习"
        ]
      },
      {
        "zh": "我们要注意价格，同时也要注意质量。",
        "en": "We should pay attention to price as well as quality.",
        "tokens": [
          "我们",
          "要",
          "注意",
          "价格",
          "同时",
          "也",
          "要",
          "注意",
          "质量"
        ]
      }
    ]
  },
  {
    "id": "w1036-role",
    "word": "作为",
    "level": 4,
    "pattern": "作为 + role，B",
    "meaning": "zuò wéi · as / in the role of",
    "explain": "作为 introduces the role or capacity in which someone acts.",
    "distractors": [
      "由于",
      "否则"
    ],
    "contrast": "Which word fits this function: as / in the role of?",
    "examples": [
      {
        "zh": "作为老师，他很负责。",
        "en": "As a teacher, he is very responsible.",
        "tokens": [
          "作为",
          "老师",
          "他",
          "很",
          "负责"
        ]
      },
      {
        "zh": "作为学生，我应该努力学习。",
        "en": "As a student, I should study hard.",
        "tokens": [
          "作为",
          "学生",
          "我",
          "应该",
          "努力",
          "学习"
        ]
      },
      {
        "zh": "作为朋友，我想帮助你。",
        "en": "As a friend, I want to help you.",
        "tokens": [
          "作为",
          "朋友",
          "我",
          "想",
          "帮助",
          "你"
        ]
      }
    ]
  },
  {
    "id": "w1040-contrast",
    "word": "不过",
    "level": 4,
    "pattern": "A，不过 B",
    "meaning": "bú guò · however / but",
    "explain": "不过 introduces a qualification or mild contrast.",
    "distractors": [
      "由于",
      "因此"
    ],
    "contrast": "Which word fits this function: however / but?",
    "examples": [
      {
        "zh": "我想去，不过没有时间。",
        "en": "I want to go, but I have no time.",
        "tokens": [
          "我",
          "想",
          "去",
          "不过",
          "没有",
          "时间"
        ]
      },
      {
        "zh": "这本书很好，不过有点儿贵。",
        "en": "This book is good, but a little expensive.",
        "tokens": [
          "这",
          "本",
          "书",
          "很",
          "好",
          "不过",
          "有点儿",
          "贵"
        ]
      },
      {
        "zh": "他很忙，不过还是来了。",
        "en": "He was busy, but came anyway.",
        "tokens": [
          "他",
          "很",
          "忙",
          "不过",
          "还是",
          "来",
          "了"
        ]
      }
    ]
  },
  {
    "id": "w1042-outcome",
    "word": "结果",
    "level": 4,
    "pattern": "A，结果 B",
    "meaning": "jié guǒ · as a result / in the end",
    "explain": "结果 can introduce the actual outcome of an earlier event, often unexpectedly.",
    "distractors": [
      "由于",
      "尽管"
    ],
    "contrast": "Which word fits this function: as a result / in the end?",
    "examples": [
      {
        "zh": "他没有学习，结果考试不好。",
        "en": "He did not study, and did badly in the exam.",
        "tokens": [
          "他",
          "没有",
          "学习",
          "结果",
          "考试",
          "不",
          "好"
        ]
      },
      {
        "zh": "我等了一天，结果他没有来。",
        "en": "I waited a whole day, but he never came.",
        "tokens": [
          "我",
          "等",
          "了",
          "一",
          "天",
          "结果",
          "他",
          "没有",
          "来"
        ]
      },
      {
        "zh": "她走得太快，结果走错了。",
        "en": "She walked too fast and ended up going the wrong way.",
        "tokens": [
          "她",
          "走",
          "得",
          "太",
          "快",
          "结果",
          "走",
          "错",
          "了"
        ]
      }
    ]
  },
  {
    "id": "w1051-from",
    "word": "自",
    "level": 4,
    "pattern": "自 + starting point",
    "meaning": "zì · from / since",
    "explain": "自 is a formal equivalent of 从 when introducing a starting point.",
    "distractors": [
      "由",
      "与"
    ],
    "contrast": "Which word fits this function: from / since?",
    "examples": [
      {
        "zh": "自今天起，我每天学习。",
        "en": "Starting today, I study every day.",
        "tokens": [
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
        "zh": "自去年起，他在这里工作。",
        "en": "He has worked here since last year.",
        "tokens": [
          "自",
          "去年",
          "起",
          "他",
          "在",
          "这里",
          "工作"
        ]
      },
      {
        "zh": "这本书自明天起可以买到。",
        "en": "This book will be available from tomorrow.",
        "tokens": [
          "这",
          "本",
          "书",
          "自",
          "明天",
          "起",
          "可以",
          "买",
          "到"
        ]
      }
    ]
  },
  {
    "id": "w1106-follow",
    "word": "按",
    "level": 4,
    "pattern": "按 + standard + action",
    "meaning": "àn · according to / following",
    "explain": "按 introduces a rule, plan or standard to follow.",
    "distractors": [
      "由",
      "与"
    ],
    "contrast": "Which word fits this function: according to / following?",
    "examples": [
      {
        "zh": "请按计划工作。",
        "en": "Please work according to the plan.",
        "tokens": [
          "请",
          "按",
          "计划",
          "工作"
        ]
      },
      {
        "zh": "请按时间来。",
        "en": "Please come at the scheduled time.",
        "tokens": [
          "请",
          "按",
          "时间",
          "来"
        ]
      },
      {
        "zh": "我们按老师的要求做。",
        "en": "We do as the teacher requires.",
        "tokens": [
          "我们",
          "按",
          "老师",
          "的",
          "要求",
          "做"
        ]
      }
    ]
  },
  {
    "id": "w1152-addition",
    "word": "另外",
    "level": 4,
    "pattern": "A，另外 B",
    "meaning": "lìng wài · in addition",
    "explain": "另外 adds a separate point to the previous statement.",
    "distractors": [
      "由于",
      "否则"
    ],
    "contrast": "Which word fits this function: in addition?",
    "examples": [
      {
        "zh": "我要买书，另外还要买笔。",
        "en": "I need books and also pens.",
        "tokens": [
          "我",
          "要",
          "买",
          "书",
          "另外",
          "还",
          "要",
          "买",
          "笔"
        ]
      },
      {
        "zh": "他会说汉语，另外也会写汉字。",
        "en": "He speaks Chinese and also writes characters.",
        "tokens": [
          "他",
          "会",
          "说",
          "汉语",
          "另外",
          "也",
          "会",
          "写",
          "汉字"
        ]
      },
      {
        "zh": "今天要工作，另外还要学习。",
        "en": "Today I need to work and also study.",
        "tokens": [
          "今天",
          "要",
          "工作",
          "另外",
          "还",
          "要",
          "学习"
        ]
      }
    ]
  },
  {
    "id": "w1258-contrast",
    "word": "然而",
    "level": 4,
    "pattern": "A，然而 B",
    "meaning": "rán ér · however",
    "explain": "然而 marks a contrast, especially in writing.",
    "distractors": [
      "由于",
      "因此"
    ],
    "contrast": "Which word fits this function: however?",
    "examples": [
      {
        "zh": "他很努力，然而没有成功。",
        "en": "He worked hard, but did not succeed.",
        "tokens": [
          "他",
          "很",
          "努力",
          "然而",
          "没有",
          "成功"
        ]
      },
      {
        "zh": "我想去，然而没有时间。",
        "en": "I wanted to go; however, I had no time.",
        "tokens": [
          "我",
          "想",
          "去",
          "然而",
          "没有",
          "时间"
        ]
      },
      {
        "zh": "天气很好，然而他不想出去。",
        "en": "The weather is nice, yet he does not want to go out.",
        "tokens": [
          "天气",
          "很",
          "好",
          "然而",
          "他",
          "不",
          "想",
          "出去"
        ]
      }
    ]
  },
  {
    "id": "w1281-addition",
    "word": "此外",
    "level": 4,
    "pattern": "A，此外 B",
    "meaning": "cǐ wài · in addition / furthermore",
    "explain": "此外 introduces an additional point in formal speech or writing.",
    "distractors": [
      "由于",
      "否则"
    ],
    "contrast": "Which word fits this function: in addition / furthermore?",
    "examples": [
      {
        "zh": "我喜欢茶，此外也喜欢咖啡。",
        "en": "I like tea; in addition I like coffee.",
        "tokens": [
          "我",
          "喜欢",
          "茶",
          "此外",
          "也",
          "喜欢",
          "咖啡"
        ]
      },
      {
        "zh": "这里有学校，此外还有医院。",
        "en": "There is a school here as well as a hospital.",
        "tokens": [
          "这里",
          "有",
          "学校",
          "此外",
          "还",
          "有",
          "医院"
        ]
      },
      {
        "zh": "我们要注意价格，此外还要注意质量。",
        "en": "We should consider price; furthermore, quality.",
        "tokens": [
          "我们",
          "要",
          "注意",
          "价格",
          "此外",
          "还",
          "要",
          "注意",
          "质量"
        ]
      }
    ]
  },
  {
    "id": "w1344-plus",
    "word": "加上",
    "level": 4,
    "pattern": "A，加上 B",
    "meaning": "jiā shàng · plus / in addition to",
    "explain": "加上 adds another factor or item to the preceding one.",
    "distractors": [
      "由于",
      "否则"
    ],
    "contrast": "Which word fits this function: plus / in addition to?",
    "examples": [
      {
        "zh": "一百元加上五十元，一共一百五十元。",
        "en": "One hundred yuan plus fifty yuan is one hundred and fifty yuan.",
        "tokens": [
          "一",
          "百",
          "元",
          "加上",
          "五",
          "十",
          "元",
          "一共",
          "一",
          "百",
          "五",
          "十",
          "元"
        ]
      },
      {
        "zh": "天气冷，加上下雨，我们就不去了。",
        "en": "It was cold, and on top of that it rained, so we did not go.",
        "tokens": [
          "天气",
          "冷",
          "加上",
          "下雨",
          "我们",
          "就",
          "不",
          "去",
          "了"
        ]
      },
      {
        "zh": "他工作忙，加上要学习，时间很少。",
        "en": "He is busy at work and also has to study, so he has little time.",
        "tokens": [
          "他",
          "工作",
          "忙",
          "加上",
          "要",
          "学习",
          "时间",
          "很",
          "少"
        ]
      }
    ]
  },
  {
    "id": "w1573-until",
    "word": "等到",
    "level": 4,
    "pattern": "等到 A，B",
    "meaning": "děng dào · when / wait until",
    "explain": "等到 introduces a point in time after waiting or after a condition is met.",
    "distractors": [
      "由于",
      "否则"
    ],
    "contrast": "Which word fits this function: when / wait until?",
    "examples": [
      {
        "zh": "等到明天，我们再去。",
        "en": "Wait until tomorrow, then we will go.",
        "tokens": [
          "等到",
          "明天",
          "我们",
          "再",
          "去"
        ]
      },
      {
        "zh": "等到他来，我们再开始。",
        "en": "Wait until he comes, then we will start.",
        "tokens": [
          "等到",
          "他",
          "来",
          "我们",
          "再",
          "开始"
        ]
      },
      {
        "zh": "等到天气好了，我们就出去。",
        "en": "When the weather improves, we will go out.",
        "tokens": [
          "等到",
          "天气",
          "好",
          "了",
          "我们",
          "就",
          "出去"
        ]
      }
    ]
  },
  {
    "id": "w1602-free-choice",
    "word": "随便",
    "level": 4,
    "pattern": "随便 + choice",
    "meaning": "suí biàn · whichever / as one wishes",
    "explain": "随便 allows free choice without restriction; it may also describe careless behavior.",
    "distractors": [
      "由于",
      "否则"
    ],
    "contrast": "Which word fits this function: whichever / as one wishes?",
    "examples": [
      {
        "zh": "你随便选一本书。",
        "en": "Choose any book you like.",
        "tokens": [
          "你",
          "随便",
          "选",
          "一",
          "本",
          "书"
        ]
      },
      {
        "zh": "你随便坐。",
        "en": "Sit wherever you like.",
        "tokens": [
          "你",
          "随便",
          "坐"
        ]
      },
      {
        "zh": "我们随便吃点东西吧。",
        "en": "Let's eat whatever is convenient.",
        "tokens": [
          "我们",
          "随便",
          "吃",
          "点",
          "东西",
          "吧"
        ]
      }
    ]
  },
  {
    "id": "w1619-moreover",
    "word": "再说",
    "level": 4,
    "pattern": "A，再说 B",
    "meaning": "zài shuō · besides / moreover",
    "explain": "再说 introduces an additional reason, distinct from the literal meaning say again.",
    "distractors": [
      "由于",
      "否则"
    ],
    "contrast": "Which word fits this function: besides / moreover?",
    "examples": [
      {
        "zh": "我不想去，再说也没有时间。",
        "en": "I don't want to go; besides, I have no time.",
        "tokens": [
          "我",
          "不",
          "想",
          "去",
          "再说",
          "也",
          "没有",
          "时间"
        ]
      },
      {
        "zh": "今天太冷，再说还下雨。",
        "en": "It is too cold today, and besides it is raining.",
        "tokens": [
          "今天",
          "太",
          "冷",
          "再说",
          "还",
          "下雨"
        ]
      },
      {
        "zh": "这本书太贵，再说我已经有了。",
        "en": "This book is too expensive; besides, I already have it.",
        "tokens": [
          "这",
          "本",
          "书",
          "太",
          "贵",
          "再说",
          "我",
          "已经",
          "有",
          "了"
        ]
      }
    ]
  },
  {
    "id": "w1644-regardless",
    "word": "不论",
    "level": 4,
    "pattern": "不论 A，都 B",
    "meaning": "bú lùn · regardless of",
    "explain": "不论 introduces alternatives; the result stays the same.",
    "distractors": [
      "由于",
      "既然"
    ],
    "contrast": "Which word fits this function: regardless of?",
    "examples": [
      {
        "zh": "不论你去哪里，我都跟你去。",
        "en": "Wherever you go, I will go with you.",
        "tokens": [
          "不论",
          "你",
          "去",
          "哪里",
          "我",
          "都",
          "跟",
          "你",
          "去"
        ]
      },
      {
        "zh": "不论多难，我都不放弃。",
        "en": "However difficult it is, I will not give up.",
        "tokens": [
          "不论",
          "多",
          "难",
          "我",
          "都",
          "不",
          "放弃"
        ]
      },
      {
        "zh": "不论谁来，都可以参加。",
        "en": "Whoever comes can participate.",
        "tokens": [
          "不论",
          "谁",
          "来",
          "都",
          "可以",
          "参加"
        ]
      }
    ]
  },
  {
    "id": "w1647-opposite",
    "word": "相反",
    "level": 4,
    "pattern": "A，相反 B",
    "meaning": "xiāng fǎn · on the contrary",
    "explain": "相反 introduces the opposite situation or conclusion.",
    "distractors": [
      "由于",
      "因此"
    ],
    "contrast": "Which word fits this function: on the contrary?",
    "examples": [
      {
        "zh": "他不生气，相反，他很高兴。",
        "en": "He was not angry; on the contrary, he was happy.",
        "tokens": [
          "他",
          "不",
          "生气",
          "相反",
          "他",
          "很",
          "高兴"
        ]
      },
      {
        "zh": "这里不冷，相反，很热。",
        "en": "It is not cold here; on the contrary, it is hot.",
        "tokens": [
          "这",
          "里",
          "不",
          "冷",
          "相反",
          "很",
          "热"
        ]
      },
      {
        "zh": "他没有休息，相反，工作得更多。",
        "en": "He did not rest; on the contrary, he worked more.",
        "tokens": [
          "他",
          "没有",
          "休息",
          "相反",
          "工作",
          "得",
          "更",
          "多"
        ]
      }
    ]
  },
  {
    "id": "w1874-not-only",
    "word": "不光",
    "level": 4,
    "pattern": "不光 A，还 B",
    "meaning": "bù guāng · not only",
    "explain": "不光 introduces the first of two points, often paired with 还.",
    "distractors": [
      "由于",
      "否则"
    ],
    "contrast": "Which word fits this function: not only?",
    "examples": [
      {
        "zh": "他不光会写，还会说。",
        "en": "He can not only write but also speak.",
        "tokens": [
          "他",
          "不光",
          "会",
          "写",
          "还",
          "会",
          "说"
        ]
      },
      {
        "zh": "我不光喜欢茶，还喜欢咖啡。",
        "en": "I like not only tea but also coffee.",
        "tokens": [
          "我",
          "不光",
          "喜欢",
          "茶",
          "还",
          "喜欢",
          "咖啡"
        ]
      },
      {
        "zh": "她不光聪明，还很努力。",
        "en": "She is not only clever but hardworking.",
        "tokens": [
          "她",
          "不光",
          "聪明",
          "还",
          "很",
          "努力"
        ]
      }
    ]
  },
  {
    "id": "w1996-source",
    "word": "据",
    "level": 5,
    "pattern": "据 + source",
    "meaning": "jù · according to",
    "explain": "据 introduces a source of information, often in formal writing.",
    "distractors": [
      "由",
      "与"
    ],
    "contrast": "Which word fits this function: according to?",
    "examples": [
      {
        "zh": "据老师说，明天有考试。",
        "en": "According to the teacher, there is an exam tomorrow.",
        "tokens": [
          "据",
          "老师",
          "说",
          "明天",
          "有",
          "考试"
        ]
      },
      {
        "zh": "据他说，这件事是真的。",
        "en": "According to him, this matter is true.",
        "tokens": [
          "据",
          "他",
          "说",
          "这",
          "件",
          "事",
          "是",
          "真",
          "的"
        ]
      },
      {
        "zh": "据消息，比赛将在明天举行。",
        "en": "According to the news, the match will be held tomorrow.",
        "tokens": [
          "据",
          "消息",
          "比赛",
          "将",
          "在",
          "明天",
          "举行"
        ]
      }
    ]
  },
  {
    "id": "w2003-example",
    "word": "如",
    "level": 5,
    "pattern": "category，如 + example",
    "meaning": "rú · such as",
    "explain": "如 introduces an example of a preceding category.",
    "distractors": [
      "由",
      "与"
    ],
    "contrast": "Which word fits this function: such as?",
    "examples": [
      {
        "zh": "我喜欢水果，如苹果和香蕉。",
        "en": "I like fruit, such as apples and bananas.",
        "tokens": [
          "我",
          "喜欢",
          "水果",
          "如",
          "苹果",
          "和",
          "香蕉"
        ]
      },
      {
        "zh": "这里有很多运动，如足球和篮球。",
        "en": "There are many sports here, such as football and basketball.",
        "tokens": [
          "这里",
          "有",
          "很",
          "多",
          "运动",
          "如",
          "足球",
          "和",
          "篮球"
        ]
      },
      {
        "zh": "他学了很多课程，如数学和汉语。",
        "en": "He studied many subjects, such as maths and Chinese.",
        "tokens": [
          "他",
          "学",
          "了",
          "很",
          "多",
          "课程",
          "如",
          "数学",
          "和",
          "汉语"
        ]
      }
    ]
  },
  {
    "id": "w2004-list",
    "word": "以及",
    "level": 5,
    "pattern": "A 以及 B",
    "meaning": "yǐ jí · as well as",
    "explain": "以及 connects items in formal lists.",
    "distractors": [
      "由",
      "而"
    ],
    "contrast": "Which word fits this function: as well as?",
    "examples": [
      {
        "zh": "请准备书以及笔。",
        "en": "Please prepare books as well as pens.",
        "tokens": [
          "请",
          "准备",
          "书",
          "以及",
          "笔"
        ]
      },
      {
        "zh": "我们讨论价格以及质量。",
        "en": "We discuss price as well as quality.",
        "tokens": [
          "我们",
          "讨论",
          "价格",
          "以及",
          "质量"
        ]
      },
      {
        "zh": "请写姓名以及电话。",
        "en": "Please write your name as well as phone number.",
        "tokens": [
          "请",
          "写",
          "姓名",
          "以及",
          "电话"
        ]
      }
    ]
  },
  {
    "id": "w2006-with",
    "word": "同",
    "level": 5,
    "pattern": "同 + person + action",
    "meaning": "tóng · with",
    "explain": "同 is a formal alternative to 跟 or 和 for a companion.",
    "distractors": [
      "由",
      "而"
    ],
    "contrast": "Which word fits this function: with?",
    "examples": [
      {
        "zh": "我想同你一起工作。",
        "en": "I want to work with you.",
        "tokens": [
          "我",
          "想",
          "同",
          "你",
          "一起",
          "工作"
        ]
      },
      {
        "zh": "他同老师谈了这件事。",
        "en": "He discussed the matter with the teacher.",
        "tokens": [
          "他",
          "同",
          "老师",
          "谈",
          "了",
          "这",
          "件",
          "事"
        ]
      },
      {
        "zh": "她同我一起去了学校。",
        "en": "She went to school with me.",
        "tokens": [
          "她",
          "同",
          "我",
          "一起",
          "去",
          "了",
          "学校"
        ]
      }
    ]
  },
  {
    "id": "w2086-relative",
    "word": "较",
    "level": 5,
    "pattern": "较 + adjective",
    "meaning": "jiào · relatively",
    "explain": "较 modifies an adjective to express relative degree, especially in formal writing.",
    "distractors": [
      "由",
      "与"
    ],
    "contrast": "Which word fits this function: relatively?",
    "examples": [
      {
        "zh": "这里的价格较低。",
        "en": "Prices here are relatively low.",
        "tokens": [
          "这里",
          "的",
          "价格",
          "较",
          "低"
        ]
      },
      {
        "zh": "这个问题较简单。",
        "en": "This question is relatively simple.",
        "tokens": [
          "这个",
          "问题",
          "较",
          "简单"
        ]
      },
      {
        "zh": "今天的温度较高。",
        "en": "Today's temperature is relatively high.",
        "tokens": [
          "今天",
          "的",
          "温度",
          "较",
          "高"
        ]
      }
    ]
  },
  {
    "id": "w2322-toward",
    "word": "朝",
    "level": 5,
    "pattern": "朝 + direction + action",
    "meaning": "cháo · toward",
    "explain": "朝 introduces the direction of movement or orientation.",
    "distractors": [
      "由",
      "与"
    ],
    "contrast": "Which word fits this function: toward?",
    "examples": [
      {
        "zh": "他朝我走来。",
        "en": "He walked toward me.",
        "tokens": [
          "他",
          "朝",
          "我",
          "走",
          "来"
        ]
      },
      {
        "zh": "请朝左走。",
        "en": "Please walk to the left.",
        "tokens": [
          "请",
          "朝",
          "左",
          "走"
        ]
      },
      {
        "zh": "孩子朝妈妈跑去。",
        "en": "The child ran toward Mum.",
        "tokens": [
          "孩子",
          "朝",
          "妈妈",
          "跑",
          "去"
        ]
      }
    ]
  },
  {
    "id": "w2452-along",
    "word": "沿",
    "level": 5,
    "pattern": "沿 + route + action",
    "meaning": "yán · along",
    "explain": "沿 introduces a route or line followed by a movement.",
    "distractors": [
      "由",
      "与"
    ],
    "contrast": "Which word fits this function: along?",
    "examples": [
      {
        "zh": "我们沿这条路走。",
        "en": "We walk along this road.",
        "tokens": [
          "我们",
          "沿",
          "这",
          "条",
          "路",
          "走"
        ]
      },
      {
        "zh": "他沿河走了很久。",
        "en": "He walked along the river for a long time.",
        "tokens": [
          "他",
          "沿",
          "河",
          "走",
          "了",
          "很",
          "久"
        ]
      },
      {
        "zh": "请沿街走。",
        "en": "Please walk along the street.",
        "tokens": [
          "请",
          "沿",
          "街",
          "走"
        ]
      }
    ]
  },
  {
    "id": "w2532-basis",
    "word": "依据",
    "level": 5,
    "pattern": "依据 + standard + action",
    "meaning": "yī jù · according to / based on",
    "explain": "依据 introduces evidence or a standard used as the basis for an action.",
    "distractors": [
      "由",
      "与"
    ],
    "contrast": "Which word fits this function: according to / based on?",
    "examples": [
      {
        "zh": "我们依据数据做决定。",
        "en": "We make decisions based on data.",
        "tokens": [
          "我们",
          "依据",
          "数据",
          "做",
          "决定"
        ]
      },
      {
        "zh": "请依据事实回答。",
        "en": "Please answer based on the facts.",
        "tokens": [
          "请",
          "依据",
          "事实",
          "回答"
        ]
      },
      {
        "zh": "他依据规定工作。",
        "en": "He works according to the regulations.",
        "tokens": [
          "他",
          "依据",
          "规定",
          "工作"
        ]
      }
    ]
  },
  {
    "id": "w2610-no-choice",
    "word": "无奈",
    "level": 5,
    "pattern": "A，无奈 B",
    "meaning": "wú nài · unfortunately / having no choice",
    "explain": "无奈 introduces an unwanted result when there is no acceptable alternative.",
    "distractors": [
      "因此",
      "由于"
    ],
    "contrast": "Which word fits this function: unfortunately / having no choice?",
    "examples": [
      {
        "zh": "我想去，无奈没有时间。",
        "en": "I wanted to go, but unfortunately had no time.",
        "tokens": [
          "我",
          "想",
          "去",
          "无奈",
          "没有",
          "时间"
        ]
      },
      {
        "zh": "他想买，无奈钱不够。",
        "en": "He wanted to buy it but did not have enough money.",
        "tokens": [
          "他",
          "想",
          "买",
          "无奈",
          "钱",
          "不",
          "够"
        ]
      },
      {
        "zh": "我们想继续，无奈天气太差。",
        "en": "We wanted to continue, but unfortunately the weather was too bad.",
        "tokens": [
          "我们",
          "想",
          "继续",
          "无奈",
          "天气",
          "太",
          "差"
        ]
      }
    ]
  },
  {
    "id": "w2614-along",
    "word": "顺",
    "level": 5,
    "pattern": "顺 + route + action",
    "meaning": "shùn · along / following",
    "explain": "顺 can introduce the route or direction followed.",
    "distractors": [
      "由",
      "与"
    ],
    "contrast": "Which word fits this function: along / following?",
    "examples": [
      {
        "zh": "顺这条路走。",
        "en": "Walk along this road.",
        "tokens": [
          "顺",
          "这",
          "条",
          "路",
          "走"
        ]
      },
      {
        "zh": "请顺河走。",
        "en": "Please walk along the river.",
        "tokens": [
          "请",
          "顺",
          "河",
          "走"
        ]
      },
      {
        "zh": "他顺着路走。",
        "en": "He walked along the road.",
        "tokens": [
          "他",
          "顺",
          "着",
          "路",
          "走"
        ]
      }
    ]
  },
  {
    "id": "w2645-result",
    "word": "因而",
    "level": 5,
    "pattern": "A，因而 B",
    "meaning": "yīn ér · therefore",
    "explain": "因而 introduces the consequence of a preceding cause, mainly in writing.",
    "distractors": [
      "由于",
      "尽管"
    ],
    "contrast": "Which word fits this function: therefore?",
    "examples": [
      {
        "zh": "他生病了，因而没有来。",
        "en": "He was ill, therefore he did not come.",
        "tokens": [
          "他",
          "生病",
          "了",
          "因而",
          "没有",
          "来"
        ]
      },
      {
        "zh": "时间不够，因而我们停止了。",
        "en": "There was not enough time, so we stopped.",
        "tokens": [
          "时间",
          "不",
          "够",
          "因而",
          "我们",
          "停止",
          "了"
        ]
      },
      {
        "zh": "价格太高，因而客人很少。",
        "en": "The price was too high, so there were few customers.",
        "tokens": [
          "价格",
          "太",
          "高",
          "因而",
          "客人",
          "很",
          "少"
        ]
      }
    ]
  },
  {
    "id": "w2648-basis",
    "word": "凭",
    "level": 5,
    "pattern": "凭 + basis + action",
    "meaning": "píng · on the strength of / by",
    "explain": "凭 introduces the basis or means used to achieve something.",
    "distractors": [
      "由",
      "与"
    ],
    "contrast": "Which word fits this function: on the strength of / by?",
    "examples": [
      {
        "zh": "他凭自己的努力成功了。",
        "en": "He succeeded through his own efforts.",
        "tokens": [
          "他",
          "凭",
          "自己",
          "的",
          "努力",
          "成功",
          "了"
        ]
      },
      {
        "zh": "请凭票进入。",
        "en": "Please enter with a ticket.",
        "tokens": [
          "请",
          "凭",
          "票",
          "进入"
        ]
      },
      {
        "zh": "我们凭经验做决定。",
        "en": "We make decisions based on experience.",
        "tokens": [
          "我们",
          "凭",
          "经验",
          "做",
          "决定"
        ]
      }
    ]
  },
  {
    "id": "w2703-inference",
    "word": "可见",
    "level": 5,
    "pattern": "A，可见 B",
    "meaning": "kě jiàn · it follows that",
    "explain": "可见 introduces a conclusion inferred from the previous evidence.",
    "distractors": [
      "由于",
      "尽管"
    ],
    "contrast": "Which word fits this function: it follows that?",
    "examples": [
      {
        "zh": "他每天练习，可见他很努力。",
        "en": "He practises every day, which shows he works hard.",
        "tokens": [
          "他",
          "每",
          "天",
          "练习",
          "可见",
          "他",
          "很",
          "努力"
        ]
      },
      {
        "zh": "这里客人很多，可见生意很好。",
        "en": "There are many customers, which shows business is good.",
        "tokens": [
          "这里",
          "客人",
          "很",
          "多",
          "可见",
          "生意",
          "很",
          "好"
        ]
      },
      {
        "zh": "她回答得很好，可见她理解了。",
        "en": "She answered well, showing that she understood.",
        "tokens": [
          "她",
          "回答",
          "得",
          "很",
          "好",
          "可见",
          "她",
          "理解",
          "了"
        ]
      }
    ]
  },
  {
    "id": "w2710-for",
    "word": "替",
    "level": 5,
    "pattern": "替 + person + action",
    "meaning": "tì · on behalf of",
    "explain": "替 introduces a person for whom an action is performed, often in their place.",
    "distractors": [
      "由",
      "与"
    ],
    "contrast": "Which word fits this function: on behalf of?",
    "examples": [
      {
        "zh": "请替我谢谢他。",
        "en": "Please thank him for me.",
        "tokens": [
          "请",
          "替",
          "我",
          "谢谢",
          "他"
        ]
      },
      {
        "zh": "我替他买了书。",
        "en": "I bought books for him.",
        "tokens": [
          "我",
          "替",
          "他",
          "买",
          "了",
          "书"
        ]
      },
      {
        "zh": "她替我回答了问题。",
        "en": "She answered the question on my behalf.",
        "tokens": [
          "她",
          "替",
          "我",
          "回答",
          "了",
          "问题"
        ]
      }
    ]
  },
  {
    "id": "w2816-since",
    "word": "自从",
    "level": 5,
    "pattern": "自从 A 以来，B",
    "meaning": "zì cóng · ever since",
    "explain": "自从 introduces the starting event or time of a continuing situation.",
    "distractors": [
      "由于",
      "尽管"
    ],
    "contrast": "Which word fits this function: ever since?",
    "examples": [
      {
        "zh": "自从去年，我就在这里工作。",
        "en": "I have worked here since last year.",
        "tokens": [
          "自从",
          "去年",
          "我",
          "就",
          "在",
          "这里",
          "工作"
        ]
      },
      {
        "zh": "自从来到中国，他就开始学汉语。",
        "en": "Ever since arriving in China, he began studying Chinese.",
        "tokens": [
          "自从",
          "来",
          "到",
          "中国",
          "他",
          "就",
          "开始",
          "学",
          "汉语"
        ]
      },
      {
        "zh": "自从那天以后，我们常常联系。",
        "en": "Since that day, we have often been in touch.",
        "tokens": [
          "自从",
          "那",
          "天",
          "以后",
          "我们",
          "常常",
          "联系"
        ]
      }
    ]
  },
  {
    "id": "w2823-or",
    "word": "或是",
    "level": 5,
    "pattern": "A 或是 B",
    "meaning": "huò shì · or",
    "explain": "或是 presents alternative possibilities.",
    "distractors": [
      "由",
      "与"
    ],
    "contrast": "Which word fits this function: or?",
    "examples": [
      {
        "zh": "今天或是明天都可以。",
        "en": "Today or tomorrow is fine.",
        "tokens": [
          "今天",
          "或是",
          "明天",
          "都",
          "可以"
        ]
      },
      {
        "zh": "你可以喝茶或是咖啡。",
        "en": "You can drink tea or coffee.",
        "tokens": [
          "你",
          "可以",
          "喝",
          "茶",
          "或是",
          "咖啡"
        ]
      },
      {
        "zh": "我们可以坐车或是走路。",
        "en": "We can take a vehicle or walk.",
        "tokens": [
          "我们",
          "可以",
          "坐",
          "车",
          "或是",
          "走",
          "路"
        ]
      }
    ]
  },
  {
    "id": "w2834-otherwise",
    "word": "不然",
    "level": 5,
    "pattern": "A，不然 B",
    "meaning": "bù rán · otherwise",
    "explain": "不然 introduces what will happen if the preceding condition is not met.",
    "distractors": [
      "由于",
      "因此"
    ],
    "contrast": "Which word fits this function: otherwise?",
    "examples": [
      {
        "zh": "快一点，不然就晚了。",
        "en": "Hurry up, otherwise it will be late.",
        "tokens": [
          "快",
          "一",
          "点",
          "不然",
          "就",
          "晚",
          "了"
        ]
      },
      {
        "zh": "早点睡，不然明天会很累。",
        "en": "Sleep early or you will be tired tomorrow.",
        "tokens": [
          "早",
          "点",
          "睡",
          "不然",
          "明天",
          "会",
          "很",
          "累"
        ]
      },
      {
        "zh": "你要学习，不然考试会有问题。",
        "en": "Study, otherwise you will have problems in the exam.",
        "tokens": [
          "你",
          "要",
          "学习",
          "不然",
          "考试",
          "会",
          "有",
          "问题"
        ]
      }
    ]
  },
  {
    "id": "w2848-like",
    "word": "似的",
    "level": 5,
    "pattern": "A + 似的",
    "meaning": "shì de · as if / like",
    "explain": "似的 follows a comparison, expressing resemblance to something.",
    "distractors": [
      "由",
      "与"
    ],
    "contrast": "Which word fits this function: as if / like?",
    "examples": [
      {
        "zh": "他高兴得像孩子似的。",
        "en": "He is as happy as a child.",
        "tokens": [
          "他",
          "高兴",
          "得",
          "像",
          "孩子",
          "似的"
        ]
      },
      {
        "zh": "她跑得像飞似的。",
        "en": "She runs as if flying.",
        "tokens": [
          "她",
          "跑",
          "得",
          "像",
          "飞",
          "似的"
        ]
      },
      {
        "zh": "这里安静得像家似的。",
        "en": "It is as quiet here as home.",
        "tokens": [
          "这里",
          "安静",
          "得",
          "像",
          "家",
          "似的"
        ]
      }
    ]
  },
  {
    "id": "w3017-summary",
    "word": "总之",
    "level": 5,
    "pattern": "总之，B",
    "meaning": "zǒng zhī · in short",
    "explain": "总之 introduces a summary or overall conclusion.",
    "distractors": [
      "由于",
      "尽管"
    ],
    "contrast": "Which word fits this function: in short?",
    "examples": [
      {
        "zh": "总之，我们要继续努力。",
        "en": "In short, we must keep working hard.",
        "tokens": [
          "总之",
          "我们",
          "要",
          "继续",
          "努力"
        ]
      },
      {
        "zh": "总之，这个方法很好。",
        "en": "In short, this method is good.",
        "tokens": [
          "总之",
          "这个",
          "方法",
          "很",
          "好"
        ]
      },
      {
        "zh": "总之，我同意你的意见。",
        "en": "In short, I agree with you.",
        "tokens": [
          "总之",
          "我",
          "同意",
          "你",
          "的",
          "意见"
        ]
      }
    ]
  },
  {
    "id": "w3100-even-if",
    "word": "哪怕",
    "level": 5,
    "pattern": "哪怕 A，也 B",
    "meaning": "nǎ pà · even if",
    "explain": "哪怕 introduces an extreme hypothetical condition that will not change the result.",
    "distractors": [
      "由于",
      "既然"
    ],
    "contrast": "Which word fits this function: even if?",
    "examples": [
      {
        "zh": "哪怕下雨，我也要去。",
        "en": "Even if it rains, I will go.",
        "tokens": [
          "哪怕",
          "下雨",
          "我",
          "也",
          "要",
          "去"
        ]
      },
      {
        "zh": "哪怕很难，我也不放弃。",
        "en": "Even if it is difficult, I will not give up.",
        "tokens": [
          "哪怕",
          "很",
          "难",
          "我",
          "也",
          "不",
          "放弃"
        ]
      },
      {
        "zh": "哪怕他不来，我们也会开始。",
        "en": "Even if he does not come, we will start.",
        "tokens": [
          "哪怕",
          "他",
          "不",
          "来",
          "我们",
          "也",
          "会",
          "开始"
        ]
      }
    ]
  },
  {
    "id": "w3103-if",
    "word": "假如",
    "level": 5,
    "pattern": "假如 A，就 B",
    "meaning": "jiǎ rú · if / supposing",
    "explain": "假如 introduces a hypothetical situation.",
    "distractors": [
      "由于",
      "因此"
    ],
    "contrast": "Which word fits this function: if / supposing?",
    "examples": [
      {
        "zh": "假如下雨，我就不去。",
        "en": "Supposing it rains, I will not go.",
        "tokens": [
          "假如",
          "下雨",
          "我",
          "就",
          "不",
          "去"
        ]
      },
      {
        "zh": "假如有时间，就来我家。",
        "en": "If you have time, come to my home.",
        "tokens": [
          "假如",
          "有",
          "时间",
          "就",
          "来",
          "我",
          "家"
        ]
      },
      {
        "zh": "假如你不知道，就问我。",
        "en": "If you do not know, ask me.",
        "tokens": [
          "假如",
          "你",
          "不",
          "知道",
          "就",
          "问",
          "我"
        ]
      }
    ]
  },
  {
    "id": "w3391-counterfactual",
    "word": "要不是",
    "level": 5,
    "pattern": "要不是 A，B",
    "meaning": "yào bú shì · if it were not for",
    "explain": "要不是 introduces a counterfactual cause; the result would have been different without it.",
    "distractors": [
      "由于",
      "因此"
    ],
    "contrast": "Which word fits this function: if it were not for?",
    "examples": [
      {
        "zh": "要不是你帮我，我就不会成功。",
        "en": "If it were not for your help, I would not have succeeded.",
        "tokens": [
          "要不是",
          "你",
          "帮",
          "我",
          "我",
          "就",
          "不",
          "会",
          "成功"
        ]
      },
      {
        "zh": "要不是下雨，我们就去了。",
        "en": "If it had not rained, we would have gone.",
        "tokens": [
          "要不是",
          "下雨",
          "我们",
          "就",
          "去",
          "了"
        ]
      },
      {
        "zh": "要不是他告诉我，我就不知道。",
        "en": "If he had not told me, I would not know.",
        "tokens": [
          "要不是",
          "他",
          "告诉",
          "我",
          "我",
          "就",
          "不",
          "知道"
        ]
      }
    ]
  },
  {
    "id": "w3572-contingency",
    "word": "万一",
    "level": 5,
    "pattern": "万一 A，B",
    "meaning": "wàn yī · in case / if by chance",
    "explain": "万一 introduces an unlikely but possible contingency.",
    "distractors": [
      "由于",
      "既然"
    ],
    "contrast": "Which word fits this function: in case / if by chance?",
    "examples": [
      {
        "zh": "万一下雨，我们怎么办？",
        "en": "What shall we do if it happens to rain?",
        "tokens": [
          "万一",
          "下雨",
          "我们",
          "怎么办"
        ]
      },
      {
        "zh": "万一发生问题，请告诉我。",
        "en": "If a problem occurs, please tell me.",
        "tokens": [
          "万一",
          "发生",
          "问题",
          "请",
          "告诉",
          "我"
        ]
      },
      {
        "zh": "带上手机，万一有事可以联系。",
        "en": "Take your phone in case you need to contact someone.",
        "tokens": [
          "带",
          "上",
          "手机",
          "万一",
          "有",
          "事",
          "可以",
          "联系"
        ]
      }
    ]
  }
];
