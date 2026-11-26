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
  }
];
