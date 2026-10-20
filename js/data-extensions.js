// ============================================================================
// 《源音·五十音》—— 核心数据库 Part 2：
// 万叶假名历史考略、浊音/半浊音、拗音、特殊音拍（入声促音/长音/拨音/高低声调）、
// 十二组形近假名考辨、十阶修习体系、同源词汇题库
// ============================================================================

// 1. 万叶假名与草书/楷书偏旁溯源考略
window.ORIGIN_HISTORY = {
  title: '汉字书源与汉日音韵：母语者的天然习得路径',
  subtitle: '假名并非凭空造出的陌生符号，而是隋唐汉字在东传过程中的草书连写与楷书省笔。循汉字字源与古音脉络，可事半功倍。',
  timeline: [
    {
      era: '五至八世纪 · 奈良时代',
      title: '万叶假名：借汉字之音，记日语之言',
      desc: '上古日本无固有文字。汉字传入后，先民借用汉字读音逐音节记录日语。因日本最古歌集《万叶集》广泛采用此法，学界称之为「万叶假名」。如借「安」表 a，借「以」表 i，借「加」表 ka。'
    },
    {
      era: '九世纪 · 平安时代初期',
      title: '平假名：万叶本字之【草书】化（女手）',
      desc: '以完整楷书书写长篇和歌颇为繁复，平安朝廷贵族与文人遂取晋唐草书笔法（尤受王羲之、孙过庭、怀素书风影响）连笔快写万叶假名。「安」草化为「あ」，「以」草化为「い」，「之」草化为「し」，渐次定型为圆润婉转的平假名。'
    },
    {
      era: '九世纪 · 平安时代初期',
      title: '片假名：万叶本字之【楷书偏旁】省取',
      desc: '同期，学问僧在训读汉文佛典时，需于字里行间的狭窄空白处迅速标注读音，遂截取万叶假名楷书的局部偏旁或数笔：「阿」取左耳旁为「ア」，「伊」取单人旁为「イ」，「加」取力字旁为「カ」，由此形成骨力端方的片假名。'
    },
    {
      era: '1900年 · 明治三十三年',
      title: '字形划一：一音一字与二十九组平片同源',
      desc: '明治政府颁布《小学校令施行规则》，废止一音多字的异体假名（变体假名），确立现代46个基础清音假名。其中有整整29个音节的平假名与片假名源自同一个汉字（如：宇→う/ウ、加→か/カ、幾→き/キ、久→く/ク、己→こ/コ、之→し/シ、世→せ/セ、曾→そ/ソ、天→て/テ、止→と/ト、奈→な/ナ、仁→に/ニ、奴→ぬ/ヌ、祢→ね/ネ、乃→の/ノ、比→ひ/ヒ、不→ふ/フ、部→へ/ヘ、保→ほ/ホ、末→ま/マ、女→め/メ、毛→も/モ、也→や/ヤ、由→ゆ/ユ、与→よ/ヨ、良→ら/ラ、利→り/リ、礼→れ/レ、吕→ろ/ロ、和→わ/ワ）。'
    }
  ],
  chineseAdvantages: [
    {
      badge: '其一 · 字形溯源',
      title: '草书连笔识平假，楷书偏旁识片假',
      content: '在非汉字文化圈学习者眼中，假名仅是抽象线条；而中文母语者一旦明了「あ」即草书之「安」、「い」即草书之「以」、「イ」即「伊」之单人旁、「ロ」即「吕」之一口，即可直接调用既有的汉字结构认知。'
    },
    {
      badge: '其二 · 声韵对应',
      title: '隋唐古音遗存：声母与韵母的系统映射',
      content: '万叶假名的读音承袭自中国六朝吴音与隋唐长安汉音。如「安(ān)→a」「以(yǐ)→i」「加(jiā，古音ka)→ka」「太(tài)→ta」「奈(nài)→na」「美(měi)→mi」「利(lì)→ri」，由汉字本音即可自然推导假名读音。'
    },
    {
      badge: '其三 · 韵尾演变',
      title: '前鼻音尾化拨音，后鼻音尾化长音，古入声化促音',
      content: '普通话带前鼻音 -n 的汉字，日语汉音多对应拨音「ん」（安=あん、信=しん）；带后鼻音 -ng 的汉字，多对应长音「う/い」（東=とう、生=せい）；而古汉语短促的入声字（一、六、八、百、学），在复合词中则规律性地转化为促音「っ」。'
    }
  ]
};

// 2. 浊音（20音）与半浊音（5音）完整数据
window.DAKUON_DATA = [
  {
    rowId: 'ga', rowName: 'が行（浊音）', baseRow: 'か行 (k → g)',
    rule: '于「か行」假名右上角加两点浊音符「゛」，声带振动，清塞音 k 变为浊塞音 g；位于词中或助词时常发柔和的软腭鼻浊音 [ŋ]。',
    items: [
      { id: 'ga', hira: 'が', kata: 'ガ', romaji: 'ga', aliases: ['ga'], base: 'か', word: 'がっこう (学校)', wordMeaning: '学校' },
      { id: 'gi', hira: 'ぎ', kata: 'ギ', romaji: 'gi', aliases: ['gi'], base: 'き', word: 'ぎんこう (銀行)', wordMeaning: '银行' },
      { id: 'gu', hira: 'ぐ', kata: 'グ', romaji: 'gu', aliases: ['gu'], base: 'く', word: 'ぐんたい (軍隊)', wordMeaning: '军队' },
      { id: 'ge', hira: 'げ', kata: 'ゲ', romaji: 'ge', aliases: ['ge'], base: 'け', word: 'げんき (元気)', wordMeaning: '精神、朝气' },
      { id: 'go', hira: 'ご', kata: 'ゴ', romaji: 'go', aliases: ['go'], base: 'こ', word: 'にほんご (日本語)', wordMeaning: '日语（语=ご）' }
    ]
  },
  {
    rowId: 'za', rowName: 'ざ行（浊音）', baseRow: 'さ行 (s → dz / z)',
    rule: '于「さ行」假名右上角加浊音符「゛」，清擦音 s 变为浊塞擦音或浊擦音。其中「じ」(ji) 为龈腭浊音，接近普通话「机」(jī) 并伴随声带振动。',
    items: [
      { id: 'za', hira: 'ざ', kata: 'ザ', romaji: 'za', aliases: ['za'], base: 'さ', word: 'ざっし (雑誌)', wordMeaning: '杂志' },
      { id: 'ji', hira: 'じ', kata: 'ジ', romaji: 'ji', aliases: ['ji', 'zi'], base: 'し', word: 'じかん (時間)', wordMeaning: '时间' },
      { id: 'zu', hira: 'ず', kata: 'ズ', romaji: 'zu', aliases: ['zu'], base: 'す', word: 'ちず (地図)', wordMeaning: '地图' },
      { id: 'ze', hira: 'ぜ', kata: 'ゼ', romaji: 'ze', aliases: ['ze'], base: 'せ', word: 'ぜんぶ (全部)', wordMeaning: '全部' },
      { id: 'zo', hira: 'ぞ', kata: 'ゾ', romaji: 'zo', aliases: ['zo'], base: 'そ', word: 'かぞく (家族)', wordMeaning: '家人、家族' }
    ]
  },
  {
    rowId: 'da', rowName: 'だ行（浊音）', baseRow: 'た行 (t → d)',
    rule: '于「た行」假名右上角加浊音符「゛」，清塞音 t 变为浊塞音 d。现代日语中，「ぢ」与「じ」读音完全相同（皆读 ji），「づ」与「ず」读音完全相同（皆读 zu）。一般词汇书写均用「じ/ず」，仅在同音叠字连浊（如 つづく 続く）或复合词连浊（如 はなぢ 鼻血）时书写为「ぢ/づ」。',
    items: [
      { id: 'da', hira: 'だ', kata: 'ダ', romaji: 'da', aliases: ['da'], base: 'た', word: 'だいがく (大学)', wordMeaning: '大学' },
      { id: 'dji', hira: 'ぢ', kata: 'ヂ', romaji: 'ji', aliases: ['di', 'ji'], base: 'ち', word: 'はなぢ (鼻血)', wordMeaning: '鼻血（复合词连浊）' },
      { id: 'dzu', hira: 'づ', kata: 'ヅ', romaji: 'zu', aliases: ['du', 'zu'], base: 'つ', word: 'つづく (続く)', wordMeaning: '延续、继续（同音连浊）' },
      { id: 'de', hira: 'で', kata: 'デ', romaji: 'de', aliases: ['de'], base: 'て', word: 'でんわ (電話)', wordMeaning: '电话' },
      { id: 'do', hira: 'ど', kata: 'ド', romaji: 'do', aliases: ['do'], base: 'と', word: 'どりょく (努力)', wordMeaning: '努力' }
    ]
  },
  {
    rowId: 'ba', rowName: 'ば行（浊音）', baseRow: 'は行 (h → b)',
    rule: '于「は行」假名右上角加浊音符「゛」，变为双唇浊塞音 b。为何喉擦音 h 浊化后会变为双唇音 b？这与清代学者钱大昕提出的汉语音韵学定律「古无轻唇音」同源：日语「は行」在上古原本读作双唇音 [pa/pi/pu/pe/po]（其本字「波、比、不、部、保」在古汉语中亦皆为双唇音），故清音 p 浊化即为 b。',
    items: [
      { id: 'ba', hira: 'ば', kata: 'バ', romaji: 'ba', aliases: ['ba'], base: 'は', word: 'ばしょ (場所)', wordMeaning: '场所、处所' },
      { id: 'bi', hira: 'び', kata: 'ビ', romaji: 'bi', aliases: ['bi'], base: 'ひ', word: 'びじゅつ (美術)', wordMeaning: '美术' },
      { id: 'bu', hira: 'ぶ', kata: 'ブ', romaji: 'bu', aliases: ['bu'], base: 'ふ', word: 'ぶんか (文化)', wordMeaning: '文化' },
      { id: 'be', hira: 'べ', kata: 'ベ', romaji: 'be', aliases: ['be'], base: 'へ', word: 'べんきょう (勉強)', wordMeaning: '学习、用功' },
      { id: 'bo', hira: 'ぼ', kata: 'ボ', romaji: 'bo', aliases: ['bo'], base: 'ほ', word: 'きぼう (希望)', wordMeaning: '希望' }
    ]
  },
  {
    rowId: 'pa', rowName: 'ぱ行（半浊音）', baseRow: 'は行 (h → p)',
    rule: '于「は行」假名右上角加小圆圈半浊音符「゜」，即还原上古日语的双唇清塞音 p。多见于拟声拟态词、外来语，以及促音或拨音后的音变（如 にっぽん 日本、さんぽ 散歩）。',
    items: [
      { id: 'pa', hira: 'ぱ', kata: 'パ', romaji: 'pa', aliases: ['pa'], base: 'は', word: 'パン', wordMeaning: '面包（外来语）' },
      { id: 'pi', hira: 'ぴ', kata: 'ピ', romaji: 'pi', aliases: ['pi'], base: 'ひ', word: 'えんぴつ (鉛筆)', wordMeaning: '铅笔' },
      { id: 'pu', hira: 'ぷ', kata: 'プ', romaji: 'pu', aliases: ['pu'], base: 'ふ', word: 'てんぷら (天ぷら)', wordMeaning: '天妇罗' },
      { id: 'pe', hira: 'ぺ', kata: 'ペ', romaji: 'pe', aliases: ['pe'], base: 'へ', word: 'ページ', wordMeaning: '页码 (Page)' },
      { id: 'po', hira: 'ぽ', kata: 'ポ', romaji: 'po', aliases: ['po'], base: 'ほ', word: 'さんぽ (散歩)', wordMeaning: '散步' }
    ]
  }
];

// 3. 拗音（33音组合：い段假名 + 小写 ゃ/ゅ/ょ）
window.YOON_DATA = {
  intro: '拗音由「い段假名（き、し、ち、に、ひ、み、り、ぎ、じ、び、ぴ）」与右下角缩小的半元音「ゃ(ya)、ゅ(yu)、ょ(yo)」相拼而成。其构音原理与汉语拼音中的「i 介音拼读」（如 q-i-a → qia 恰，x-i-u → xiu 休，l-i-u → liu 流）完全一致。书写时须注意右下角的 ゃ/ゅ/ょ 仅占四分之一格大小，且整个拗音合为一拍。',
  rows: [
    {
      rowName: 'きゃ行 (kya)', base: 'き (ki) + ゃ/ゅ/ょ',
      items: [
        { hira: 'きゃ', kata: 'キャ', romaji: 'kya', aliases: ['kya'], word: 'きゃく (客)', meaning: '宾客（客=きゃく）' },
        { hira: 'きゅ', kata: 'キュ', romaji: 'kyu', aliases: ['kyu'], word: 'きゅう (九 / 急)', meaning: '数字九 / 急迫' },
        { hira: 'きょ', kata: 'キョ', romaji: 'kyo', aliases: ['kyo'], word: 'きょう (今日)', meaning: '今日、今天' }
      ]
    },
    {
      rowName: 'しゃ行 (sha)', base: 'し (shi) → 近汉语拼音 xia / xiu / xiao',
      items: [
        { hira: 'しゃ', kata: 'シャ', romaji: 'sha', aliases: ['sha', 'sya'], word: 'しゃしん (写真)', meaning: '照片、摄影' },
        { hira: 'しゅ', kata: 'シュ', romaji: 'shu', aliases: ['shu', 'syu'], word: 'しゅみ (趣味)', meaning: '爱好、雅兴' },
        { hira: 'しょ', kata: 'ショ', romaji: 'sho', aliases: ['sho', 'syo'], word: 'しょくじ (食事)', meaning: '用餐、饮食' }
      ]
    },
    {
      rowName: 'ちゃ行 (cha)', base: 'ち (chi) → 近汉语拼音 qia / qiu / qiao',
      items: [
        { hira: 'ちゃ', kata: 'チャ', romaji: 'cha', aliases: ['cha', 'tya'], word: 'おちゃ (お茶)', meaning: '茶水（茶=ちゃ）' },
        { hira: 'ちゅ', kata: 'チュ', romaji: 'chu', aliases: ['chu', 'tyu'], word: 'ちゅうごく (中国)', meaning: '中国（中=ちゅう）' },
        { hira: 'ちょ', kata: 'チョ', romaji: 'cho', aliases: ['cho', 'tyo'], word: 'ちょうせん (挑戦)', meaning: '挑战（挑=ちょう）' }
      ]
    },
    {
      rowName: 'にゃ行 (nya)', base: 'に (ni) → 近汉语拼音 nia / niu / niao',
      items: [
        { hira: 'にゃ', kata: 'ニャ', romaji: 'nya', aliases: ['nya'], word: 'にゃんこ', meaning: '猫咪（昵称）' },
        { hira: 'にゅ', kata: 'ニュ', romaji: 'nyu', aliases: ['nyu'], word: 'ぎゅうにゅう (牛乳)', meaning: '牛奶（乳=にゅう）' },
        { hira: 'にょ', kata: 'ニョ', romaji: 'nyo', aliases: ['nyo'], word: 'にょうぼう (女房)', meaning: '妻子' }
      ]
    },
    {
      rowName: 'ひゃ行 (hya)', base: 'ひ (hi) + ゃ/ゅ/ょ',
      items: [
        { hira: 'ひゃ', kata: 'ヒャ', romaji: 'hya', aliases: ['hya'], word: 'ひゃく (百)', meaning: '一百（百=ひゃく）' },
        { hira: 'ひゅ', kata: 'ヒュ', romaji: 'hyu', aliases: ['hyu'], word: 'ひゅうが (日向)', meaning: '日向（地名）' },
        { hira: 'ひょ', kata: 'ヒョ', romaji: 'hyo', aliases: ['hyo'], word: 'ひょうげん (表現)', meaning: '表现、表达（表=ひょう）' }
      ]
    },
    {
      rowName: 'みゃ行 (mya)', base: 'み (mi) + ゃ/ゅ/ょ',
      items: [
        { hira: 'みゃ', kata: 'ミャ', romaji: 'mya', aliases: ['mya'], word: 'みゃく (脈)', meaning: '脉搏、山脉（脉=みゃく）' },
        { hira: 'みゅ', kata: 'ミュ', romaji: 'myu', aliases: ['myu'], word: 'ミュージック', meaning: '音乐 (Music)' },
        { hira: 'みょ', kata: 'ミョ', romaji: 'myo', aliases: ['myo'], word: 'みょうじ (名字)', meaning: '姓氏' }
      ]
    },
    {
      rowName: 'りゃ行 (rya)', base: 'り (ri) → 近汉语拼音 lia / liu / liao',
      items: [
        { hira: 'りゃ', kata: 'リャ', romaji: 'rya', aliases: ['rya', 'lya'], word: 'りゃくご (略語)', meaning: '缩略语（略=りゃく）' },
        { hira: 'りゅ', kata: 'リュ', romaji: 'ryu', aliases: ['ryu', 'lyu'], word: 'りゅう (龍)', meaning: '龙（龙=りゅう）' },
        { hira: 'りょ', kata: 'リョ', romaji: 'ryo', aliases: ['ryo', 'lyo'], word: 'りょこう (旅行)', meaning: '旅行（旅=りょ）' }
      ]
    },
    {
      rowName: 'ぎゃ行 (gya)', base: 'ぎ (gi) + ゃ/ゅ/ょ',
      items: [
        { hira: 'ぎゃ', kata: 'ギャ', romaji: 'gya', aliases: ['gya'], word: 'ぎゃく (逆)', meaning: '逆向、相反（逆=ぎゃく）' },
        { hira: 'ぎゅ', kata: 'ギュ', romaji: 'gyu', aliases: ['gyu'], word: 'ぎゅうにく (牛肉)', meaning: '牛肉（牛=ぎゅう）' },
        { hira: 'ぎょ', kata: 'ギョ', romaji: 'gyo', aliases: ['gyo'], word: 'きんぎょ (金魚)', meaning: '金鱼（鱼=ぎょ）' }
      ]
    },
    {
      rowName: 'じゃ行 (ja)', base: 'じ (ji) → 近汉语拼音 jia / jiu / jiao（声带振动）',
      items: [
        { hira: 'じゃ', kata: 'ジャ', romaji: 'ja', aliases: ['ja', 'jya', 'zya'], word: 'じゃま (邪魔)', meaning: '打扰、妨碍' },
        { hira: 'じゅ', kata: 'ジュ', romaji: 'ju', aliases: ['ju', 'jyu', 'zyu'], word: 'じゅう (十)', meaning: '数字十（じゅう）' },
        { hira: 'じょ', kata: 'ジョ', romaji: 'jo', aliases: ['jo', 'jyo', 'zyo'], word: 'じょせい (女性)', meaning: '女性（女=じょ）' }
      ]
    },
    {
      rowName: 'びゃ行 (bya)', base: 'び (bi) + ゃ/ゅ/ょ',
      items: [
        { hira: 'びゃ', kata: 'ビャ', romaji: 'bya', aliases: ['bya'], word: 'さんびゃく (三百)', meaning: '三百（百连浊为びゃく）' },
        { hira: 'びゅ', kata: 'ビュ', romaji: 'byu', aliases: ['byu'], word: 'ごびゅう (誤謬)', meaning: '谬误（谬=びゅう）' },
        { hira: 'びょ', kata: 'ビョ', romaji: 'byo', aliases: ['byo'], word: 'びょういん (病院)', meaning: '医院（病=びょう）' }
      ]
    },
    {
      rowName: 'ぴゃ行 (pya)', base: 'ぴ (pi) + ゃ/ゅ/ょ',
      items: [
        { hira: 'ぴゃ', kata: 'ピャ', romaji: 'pya', aliases: ['pya'], word: 'ろっぴゃく (六百)', meaning: '六百（促音半浊化）' },
        { hira: 'ぴゅ', kata: 'ピュ', romaji: 'pyu', aliases: ['pyu'], word: 'コンピュータ', meaning: '计算机 (Computer)' },
        { hira: 'ぴょ', kata: 'ピョ', romaji: 'pyo', aliases: ['pyo'], word: 'はっぴょう (発表)', meaning: '发表（发+表促音化）' }
      ]
    }
  ]
};

// 4. 特殊音拍（促音、长音、拨音）与高低声调考辨
window.SPECIAL_SOUNDS_DATA = [
  {
    id: 'sokuon',
    name: '促音（っ / ッ）',
    badge: '中古汉语入声塞音尾遗存',
    symbol: '小写之「っ」（平假名）或「ッ」（片假名），置于右下角占四分之一格',
    coreRule: '发音要领：促音本身不发出声音，而是预先摆好后一音节辅音的发音口型，屏住气流停顿完整的一拍，再于下一拍瞬间除阻爆破。其顿挫感类似粤语、闽南语或吴语中的短促入声。',
    chineseSecret: '汉日音韵规律：为何日语中诸多汉字音读以「く/き(k)」「つ/ち(t)」收尾（如：学がく、一いち、発はつ）？因这类字在隋唐中古汉语中皆属带 -k、-t、-p 塞音韵尾的「入声字」。当入声字后接以清音 k、s、t、p 起首的汉字组成复合词时，前字的塞音尾便同化为促音「っ」。\n例如：学(gaku) + 校(kou) → 学校(がっこう gakkou)；一(ichi) + 回(kai) → 一回(いっかい ikkai)；発(hatsu) + 表(hyou) → 発表(はっぴょう happyou)。明晰此理，可推知大量汉字复合词的促音位置。',
    inputTip: '罗马字输入法：双写后一假名的起首辅音字母即可（如输入 gakkou 得「がっこう」，输入 zasshi 得「ざっし」）。',
    examples: [
      { kana: 'がっこう', kanji: '学校', romaji: 'gakkou', meaning: '学校（学 gaku + 校 kou 促音化）', contrast: '对比：がこう (画稿)' },
      { kana: 'きって', kanji: '切手', romaji: 'kitte', meaning: '邮票（共三拍：ki - [停顿] - te）', contrast: '对比：きて (来て，二拍)' },
      { kana: 'ざっし', kanji: '雑誌', romaji: 'zasshi', meaning: '杂志（杂 zatsu + 志 shi 促音化）', contrast: '双写 s 输入' },
      { kana: 'にっぽん', kanji: '日本', romaji: 'nippon', meaning: '日本（日 nichi + 本 hon 促音半浊化）', contrast: '庄重读法' }
    ]
  },
  {
    id: 'chouon',
    name: '长音（ー / 母音延展）',
    badge: '汉语复合韵母与后鼻音对应规律',
    symbol: '平假名后接「あ/い/う/え/お」；片假名统一加长音符「ー」',
    coreRule: '发音要领：将前一假名的元音保持口型不变、均匀延长一拍（共占两拍时长）。\n五段长音通则：\n一、あ段假名后加「あ」（如 おかあさん 母亲）\n二、い段假名后加「い」（如 おにいさん 兄长）\n三、う段假名后加「う」（如 くうき 空気）\n四、え段假名后加「い」（汉字音读词通则，如 せんせい 先生；少数和语词加「え」，如 おねえさん 姐姐）\n五、お段假名后加「う」（汉字音读词通则，如 とうきょう 東京；少数和语词加「お」，如 おおきい 大的）\n六、片假名长音一律书写为「ー」（如 コーヒー 咖啡）。',
    chineseSecret: '汉日音韵规律：在现代日语标准发音中，「え段 + い」（如 先生 せんせい）与「お段 + う」（如 東京 とうきょう）一般不读作双元音，而是直接将前接元音 e 或 o 延长一拍，分别读作 [senseː] 与 [toːkʲoː]。此外，普通话中以 -ng（后鼻音：ang、eng、ing、ong）收尾的汉字，在日语汉音中几乎尽数转化为「う」或「い」长音（如：東 dōng → とう tou，京 jīng → きょう kyou，生 shēng → せい sei，永 yǒng → えい ei）。',
    inputTip: '罗马字输入法：平假名按字面逐一键入（如「先生」输 sensei，「東京」输 toukyou）；片假名长音符「ー」直接按键盘减号键「-」。',
    examples: [
      { kana: 'せんせい', kanji: '先生', romaji: 'sensei', meaning: '老师、先生（え段后接い，将 se 延展一拍）', contrast: '尾音 い 轻化为长音' },
      { kana: 'とうきょう', kanji: '東京', romaji: 'toukyou', meaning: '东京（お段后接う，汉音对应后鼻音 -ng）', contrast: '共四拍：to-u-kyo-u' },
      { kana: 'おばあさん', kanji: 'お婆さん', romaji: 'obaasan', meaning: '祖母、老妇人（长音 baa，四拍）', contrast: '对比：おばさん (伯母/阿姨，短音三拍)' },
      { kana: 'コーヒー', kanji: '珈琲', romaji: 'koohii', meaning: '咖啡（片假名统一以「ー」表长音）', contrast: '键入减号 -' }
    ]
  },
  {
    id: 'hatsuon',
    name: '拨音（ん / ン）',
    badge: '汉语前鼻音 -n 与后鼻音 -ng 分流法则',
    symbol: '平假名「ん」 / 片假名「ン」（不置于词首，独立占一拍）',
    coreRule: '发音要领：拨音「ん」并非依附于前字尾端的短促鼻音，而是独立占满一拍的鼻音节。其具体成阻部位受后接辅音逆向同化：\n一、在双唇音 m、b、p（ま行、ば行、ぱ行）前，双唇闭合发 [m]（如 新聞 しんぶん 读如 shim-bun）；\n二、在齿龈音 n、t、d、r、z（な、た、だ、ら、ざ行）前，舌尖抵上齿龈发 [n]（如 安全 あんぜん）；\n三、在软腭音 k、g（か行、が行）前，舌根抬起发后鼻音 [ŋ]（如 漫画 まんが、日本語 にほんご）。',
    chineseSecret: '汉日音韵规律：将普通话的前鼻音（-n）与后鼻音（-ng）置于日语汉字音读中对比，可见一条极为严整的分流规律：\n一、普通话的前鼻音（-an、-en、-in、-un，古阳声韵 -m/-n）→ 对应日语拨音「ん」（如：安=あん、信=しん、人=にん、本=ほん、天=てん）；\n二、普通话的后鼻音（-ang、-eng、-ing、-ong，古阳声韵 -ng）→ 对应日语长音「う/い」（如：王=おう、東=とう、生=せい、明=めい）。\n掌握这一分流法则，即可准确判别数千汉字词中有无拨音「ん」。',
    inputTip: '罗马字输入法：后接辅音时键入单个 n 即可；若位于词尾或后接元音（あ行、や行、な行），须双写键入「nn」以免与 na/ni/nu/ne/no 相混。',
    examples: [
      { kana: 'あんぜん', kanji: '安全', romaji: 'anzen', meaning: '安全（在 z 前发舌尖鼻音 [n]）', contrast: '对应汉语前鼻音 -n' },
      { kana: 'しんぶん', kanji: '新聞', romaji: 'shinbun', meaning: '报纸（首ん在 b 前双唇闭合发 [m]）', contrast: '双唇逆向同化' },
      { kana: 'まんが', kanji: '漫画', romaji: 'manga', meaning: '漫画（在 g 前发舌根鼻音 [ŋ]）', contrast: '软腭逆向同化' },
      { kana: 'れんあい', kanji: '恋愛', romaji: 'ren\'ai', meaning: '恋爱（输入时需键入 rennai）', contrast: '元音前双写 nn' }
    ]
  },
  {
    id: 'pitch',
    name: '高低声调（Pitch Accent）',
    badge: '音高节律：双层阶梯与汉语四声之别',
    symbol: '⓪型（平板型） · ①型（头高型） · ②③型（中高型） · 尾高型',
    coreRule: '声调特征：汉语普通话属「曲调型声调」（阴平、阳平、上声、去声，单字内部音高存在滑动转折）；日语则属「高低型声调」（Pitch Accent），单拍内部音高平稳不拐弯，仅在拍与拍之间呈现【高(H)】与【低(L)】两层阶梯。\n两条基本通则：\n通则一：单词的第一拍与第二拍音高必定相反（首拍低则次拍必高；首拍高则次拍必低）。\n通则二：一个词内音高一旦由高降为低，其后各拍便不再回升。',
    chineseSecret: '母语听感参照：\n一、⓪型（平板型：低-高-高-高，如 さくら 桜）：首拍低，自第二拍升至高音后保持平直，后接助词亦不下降（听感近普通话阴平第一声持续延伸）。\n二、①型（头高型：高-低-低，如 いのち 命）：首拍高，第二拍即刻降至低音（听感近普通话去声第四声后接轻声）。\n三、②型、③型（中高型：低-高-低，如 こころ 心）：首拍低，第二拍升至高音，标号数字代表在第几拍之后开始下降。',
    inputTip: '声调辨义：如「あめ」读 ①型（高-低）为「雨」，读 ⓪型（低-高）则为「飴（饴糖）」。',
    examples: [
      { kana: 'さくら ⓪', kanji: '桜 [低-高-高]', romaji: 'sa-ku-ra (L-H-H)', meaning: '樱花（平板型：首拍低，后两拍保持高平）', contrast: '后接助词音高不降' },
      { kana: 'あめ ① / ⓪', kanji: '雨(高-低) / 飴(低-高)', romaji: 'a-me', meaning: '①型头高为「雨」；⓪型平板为「饴糖」', contrast: '声调区别词义' },
      { kana: 'はし ① / ②', kanji: '箸(高-低) / 橋(低-高)', romaji: 'ha-shi', meaning: '①型头高为「筷子(箸)」；②型尾高为「桥(橋)」', contrast: '经典同音异调词' },
      { kana: 'こころ ②', kanji: '心 [低-高-低]', romaji: 'ko-ko-ro (L-H-L)', meaning: '心（第二拍高，第三拍下降）', contrast: '中高型代表词' }
    ]
  }
];

// 5. 十二组形近假名书源考辨（以汉字本字结构辨析形近字）
window.CONFUSABLE_GROUPS = [
  {
    id: 'katakana-big4',
    title: '片假名点撇四字考辨：ソ · ン · シ · ツ',
    level: '核心辨微',
    summary: '此四字由点画与撇、提构成，初学极易混淆。若还原其万叶汉字本源，则点位排列与运笔方向一目了然。',
    secretFormula: '【书源辨析要旨】\n● 「シ (shi)」源于【之】字草书，结构同汉字三点水「氵」：左侧两点呈横向平列，末笔自左下向右上提挑（↗）。\n● 「ツ (tsu)」源于【川】字三竖，结构同汉字「川」：顶部两点呈纵向并排，末笔自右上向左下撇出（↙）。\n● 「ソ (so)」源于【曾】字顶部的八字点「丷」：首点竖立，次笔自右上向左下撇出（↙，运笔方向同ツ）。\n● 「ン (n)」源于【爾】字起笔，结构同汉字两点水「冫」：首点平置，次笔自左下向右上提挑（↗，运笔方向同シ）。',
    members: [
      { kanaId: 'shi', char: 'シ', romaji: 'shi', origin: '之（同三点水 氵）', keyFeature: '横点平列 · 由下向上提 ↗' },
      { kanaId: 'tsu', char: 'ツ', romaji: 'tsu', origin: '川（川字三竖）', keyFeature: '竖点并排 · 由上向下撇 ↙' },
      { kanaId: 'so',  char: 'ソ', romaji: 'so',  origin: '曾（顶部八字点 丷）', keyFeature: '单竖点 · 由上向下撇 ↙' },
      { kanaId: 'n',   char: 'ン', romaji: 'n',   origin: '爾（同两点水 冫）', keyFeature: '单平点 · 由下向上提 ↗' }
    ]
  },
  {
    id: 'ne-re-wa',
    title: '平假名左竖三字考辨：ね · れ · わ',
    level: '高频辨微',
    summary: '三字左侧皆由示字旁或禾木旁草化为一竖加折笔，辨析关键尽在右侧收笔形态。',
    secretFormula: '【书源辨析要旨】\n● 「ね (ne)」源于【祢】：右侧「尔」部草化，于右下角收尾处【绕圈打结】。\n● 「れ (re)」源于【礼】：汉字「礼」右部本为向外挑出的竖弯钩，故「れ」尾部亦【直接向外翘起】。\n● 「わ (wa)」源于【和】：汉字「和」右部为圆整之「口」，故「わ」右侧呈大圆弧【向内收拢】。',
    members: [
      { kanaId: 'ne', char: 'ね', romaji: 'ne', origin: '祢 (nǐ/ne)', keyFeature: '尾部绕圈打结' },
      { kanaId: 're', char: 'れ', romaji: 're', origin: '礼 (lǐ/re)', keyFeature: '尾部向外挑起（同礼字右笔）' },
      { kanaId: 'wa', char: 'わ', romaji: 'wa', origin: '和 (hé/wa)', keyFeature: '大圆弧向内收拢（对应口部）' }
    ]
  },
  {
    id: 'nu-me',
    title: '平假名回环二字考辨：ぬ · め',
    level: '高频辨微',
    summary: '两字前半部笔势完全一致，区别仅在于右下角收尾处是否绕圈。',
    secretFormula: '【书源辨析要旨】\n● 「め (me)」源于独体汉字【女】：右侧无其他偏旁，故回环后直接向右下撇收，【尾部不绕圈】。\n● 「ぬ (nu)」源于合体汉字【奴】（女 + 又）：因比「女」字右侧多出一「又」部，故于右下角【多绕一小圈】以表「又」字，读音亦即「奴」(nu)。',
    members: [
      { kanaId: 'me', char: 'め', romaji: 'me', origin: '女（独体无右旁）', keyFeature: '尾部直接撇收，不绕圈' },
      { kanaId: 'nu', char: 'ぬ', romaji: 'nu', origin: '奴（女 + 又）', keyFeature: '尾部多绕一圈（对应右部「又」）' }
    ]
  },
  {
    id: 'ru-ro',
    title: '平假名折弧二字考辨：る · ろ',
    level: '高频辨微',
    summary: '两字外廓皆呈折弧状（形近数字 3），同样依据汉字下部的虚实区分尾圈。',
    secretFormula: '【书源辨析要旨】\n● 「る (ru)」源于【留】：「留」字下部为实心之「田」，故弧肚末端【向内绕出一小圈】。\n● 「ろ (ro)」源于【吕】：「吕」字下部为空心之「口」，故弧肚末端【直接收笔无圈】。',
    members: [
      { kanaId: 'ru', char: 'る', romaji: 'ru', origin: '留（下部实心「田」）', keyFeature: '弧内末端绕出一小圈' },
      { kanaId: 'ro', char: 'ろ', romaji: 'ro', origin: '吕（下部空心「口」）', keyFeature: '弧内末端干净无圈' }
    ]
  },
  {
    id: 'a-o',
    title: '元音回环二字考辨：あ · お',
    level: '基础辨微',
    summary: '同属あ行元音且下部皆有回环，初学者易混用。',
    secretFormula: '【书源辨析要旨】\n● 「あ (a)」源于【安】：上部为宝盖头一横，下部为「女」字交叉回环，右上角【无点】。\n● 「お (o)」源于【於】：左侧「方」部竖画直下打结回环，右上角【保留一点】（源于「於」字右部点画）。',
    members: [
      { kanaId: 'a', char: 'あ', romaji: 'a', origin: '安 (ān)', keyFeature: '下部女字交叉回环 · 右上无点' },
      { kanaId: 'o', char: 'お', romaji: 'o', origin: '於 (wū/o)', keyFeature: '一笔连绕 · 右上角有一点' }
    ]
  },
  {
    id: 'sa-ki-chi',
    title: '横画带弧三字考辨：さ · き · ち',
    level: '高频辨微',
    summary: '皆由上部横画、斜竖与底部圆弧构成，需审视横画数量与圆弧朝向。',
    secretFormula: '【书源辨析要旨】\n● 「さ (sa)」源于【左】：汉字「左」上部仅【一横】，底部圆弧开口朝【左】。\n● 「き (ki)」源于【幾】：繁体「幾」上部有两个幺，故顶部有【两横】，底部圆弧开口朝【左】。\n● 「ち (chi)」源于【知】：顶部【一横】，但底部圆弧向右鼓起（开口朝右下方，形近数字 5，与「さ」镜像相反）。',
    members: [
      { kanaId: 'sa',  char: 'さ', romaji: 'sa',  origin: '左（上部一横）', keyFeature: '顶部 1 横 · 弧肚朝左开口' },
      { kanaId: 'ki',  char: 'き', romaji: 'ki',  origin: '幾（上部两横）', keyFeature: '顶部 2 横 · 弧肚朝左开口' },
      { kanaId: 'chi', char: 'ち', romaji: 'chi', origin: '知（形近数字5）', keyFeature: '顶部 1 横 · 弧肚反向鼓起' }
    ]
  },
  {
    id: 'ha-ho-ma',
    title: '平假名底结三字考辨：は · ほ · ま',
    level: '高频辨微',
    summary: '三字底部皆为竖画向左绕圈打结，依左侧有无竖笔及横画数目区分。',
    secretFormula: '【书源辨析要旨】\n● 「は (ha)」源于【波】：左有弧竖，右部仅【一横】，且竖笔顶端向上出头。\n● 「ほ (ho)」源于【保】：左有弧竖，因「保」右部为「口+木」两层，故右部有【两横】，且竖笔顶端不出头。\n● 「ま (ma)」源于【末】：独体结构，左侧【无竖笔】，直接由两横与中竖打结组成。',
    members: [
      { kanaId: 'ha', char: 'は', romaji: 'ha', origin: '波', keyFeature: '左有竖 · 右 1 横（竖出头）' },
      { kanaId: 'ho', char: 'ほ', romaji: 'ho', origin: '保（右为口+木）', keyFeature: '左有竖 · 右 2 横（竖不出头）' },
      { kanaId: 'ma', char: 'ま', romaji: 'ma', origin: '末', keyFeature: '左无竖 · 居中 2 横 + 中竖打结' }
    ]
  },
  {
    id: 'u-wa-fu-ra',
    title: '片假名横撇四字考辨：ウ · ワ · フ · ラ',
    level: '片假名辨微',
    summary: '四字主体皆含横撇「フ」，全凭顶部与左侧的笔画部件加以区分。',
    secretFormula: '【书源辨析要旨】\n● 「ウ (u)」源于【宇】之宝盖头「宀」：顶部有短竖点，左侧有短竖。\n● 「ワ (wa)」源于【和】之口部省变：顶部无点，仅保留左侧短竖与横撇。\n● 「フ (fu)」源于【不】之左上角：顶部无点、左侧无竖，仅一笔横撇。\n● 「ラ (ra)」源于【良】之上部：左侧无竖，顶部有一道短横。',
    members: [
      { kanaId: 'u',  char: 'ウ', romaji: 'u',  origin: '宇（宝盖头 宀）', keyFeature: '顶有竖点 + 左有短竖' },
      { kanaId: 'wa', char: 'ワ', romaji: 'wa', origin: '和', keyFeature: '顶无点 + 左有短竖' },
      { kanaId: 'fu', char: 'フ', romaji: 'fu', origin: '不', keyFeature: '单笔横撇（无点无左竖）' },
      { kanaId: 'ra', char: 'ラ', romaji: 'ra', origin: '良', keyFeature: '顶有一短横 + 下方横撇' }
    ]
  },
  {
    id: 'ku-ke-ta',
    title: '片假名左撇三字考辨：ク · タ · ケ',
    level: '片假名辨微',
    summary: '左上角皆以短撇起笔，分别源于「久、多、介」三字。',
    secretFormula: '【书源辨析要旨】\n● 「ク (ku)」源于【久】字省去末捺：内部空白无点，横画右端不出头。\n● 「タ (ta)」源于【多】字上半部之「夕」：与汉字「夕」同形，内部多一点。\n● 「ケ (ke)」源于【介】字省变：横画右端明显出头，竖撇自横画正中向下撇出。',
    members: [
      { kanaId: 'ku', char: 'ク', romaji: 'ku', origin: '久（省末捺）', keyFeature: '内部无点 · 横不右出' },
      { kanaId: 'ta', char: 'タ', romaji: 'ta', origin: '多（上部「夕」）', keyFeature: '同汉字「夕」 · 内部有一点' },
      { kanaId: 'ke', char: 'ケ', romaji: 'ke', origin: '介', keyFeature: '横画向右出头 · 中竖撇下' }
    ]
  },
  {
    id: 'a-ma-mu',
    title: '片假名折角三字考辨：ア · マ · ム',
    level: '片假名辨微',
    summary: '皆含锐角折笔，需留意首笔走向与次笔形态。',
    secretFormula: '【书源辨析要旨】\n● 「ア (a)」源于【阿】之左耳旁「阝」：上为横折，下为向下舒展的【竖撇】。\n● 「マ (ma)」源于【末】之上部：上为横折撇，下为托在底部的【短斜点】。\n● 「ム (mu)」源于【牟】之私字头「厶」：首笔自上向左下撇折横，次笔为右下点（同偏旁「厶」）。',
    members: [
      { kanaId: 'a',  char: 'ア', romaji: 'a',  origin: '阿（左耳旁 阝）', keyFeature: '次笔为向下延伸的竖撇' },
      { kanaId: 'ma', char: 'マ', romaji: 'ma', origin: '末', keyFeature: '次笔为托在底部的短点' },
      { kanaId: 'mu', char: 'ム', romaji: 'mu', origin: '牟（私字头 厶）', keyFeature: '同汉字偏旁「厶」' }
    ]
  },
  {
    id: 'ko-yu-yo',
    title: '片假名折框三字考辨：コ · ユ · ヨ',
    level: '片假名辨微',
    summary: '皆含横折方框结构，分别源于「己、由、与」三字。',
    secretFormula: '【书源辨析要旨】\n● 「コ (ko)」源于【己】字上半框：朝左开口的两笔方框，底横右端【不出头】。\n● 「ユ (yu)」源于【由】字省变：横折略向左斜，底横右端【明显长出】。\n● 「ヨ (yo)」源于【与】字省变：在「コ」的中间多加一横，呈三横一竖结构。',
    members: [
      { kanaId: 'ko', char: 'コ', romaji: 'ko', origin: '己（上半框）', keyFeature: '两笔方框 · 底横右端不出头' },
      { kanaId: 'yu', char: 'ユ', romaji: 'yu', origin: '由', keyFeature: '折笔微斜 · 底横右端长出' },
      { kanaId: 'yo', char: 'ヨ', romaji: 'yo', origin: '与', keyFeature: '三横一竖 · 形同反向字母 E' }
    ]
  },
  {
    id: 'i-ri-ko-ni',
    title: '平假名对称笔势四字考辨：い · り · こ · に',
    level: '基础辨微',
    summary: '由简洁对称弧线构成的四个基础平假名，依其汉字本字即可明辨方位。',
    secretFormula: '【书源辨析要旨】\n● 「い (i)」源于【以】：左长右短，呈左右环抱之势。\n● 「り (ri)」源于【利】之立刀旁「刂」：左短竖、右长竖撇，同立刀旁结构。\n● 「こ (ko)」源于【己】：呈上下平列的两条横弧线。\n● 「に (ni)」源于【仁】（亻+ 二）：左为单人旁一竖，右为上下两条横弧。',
    members: [
      { kanaId: 'i',  char: 'い', romaji: 'i',  origin: '以', keyFeature: '左长钩 · 右短弧（左右环抱）' },
      { kanaId: 'ri', char: 'り', romaji: 'ri', origin: '利（立刀旁 刂）', keyFeature: '左短竖 · 右长竖撇（立刀旁）' },
      { kanaId: 'ko', char: 'こ', romaji: 'ko', origin: '己', keyFeature: '上下两条平列横弧' },
      { kanaId: 'ni', char: 'に', romaji: 'ni', origin: '仁（亻+ 二）', keyFeature: '左一弧竖 + 右二横弧' }
    ]
  }
];

// 6. 十阶修习体系（量化训练标准，循序渐进掌握全部假名）
window.CURRICULUM_STAGES = [
  {
    stage: 1,
    title: '第一阶 · 元音筑基与清塞起航（あ行 · か行）',
    subtitle: '习得日语五个基准元音与扁唇 u，掌握前10组（20个平片假名）及其万叶书源',
    kanaIds: ['a', 'i', 'u', 'e', 'o', 'ka', 'ki', 'ku', 'ke', 'ko'],
    targetCount: 30,
    passAccuracy: 90,
    focusDesc: '辨析「あ(安) 与 お(於)」、「き(幾)」、「こ(己)」及「う」段扁唇发音'
  },
  {
    stage: 2,
    title: '第二阶 · 齿龈清音进阶（さ行 · た行）',
    subtitle: '掌握「し(shi)、ち(chi)、つ(tsu)」特殊罗马字拼法与20个平片假名',
    kanaIds: ['sa', 'shi', 'su', 'se', 'so', 'ta', 'chi', 'tsu', 'te', 'to'],
    targetCount: 35,
    passAccuracy: 90,
    focusDesc: '辨析「さ(左) 与 ち(知)」，初探片假名「シ(之)、ツ(川)、ソ(曾)」点撇走向'
  },
  {
    stage: 3,
    title: '第三阶 · 前四行温故合考（あ〜た行 40字综测）',
    subtitle: '前20组（40个平片假名）多题型交叉演练，巩固前期记忆',
    kanaIds: ['a', 'i', 'u', 'e', 'o', 'ka', 'ki', 'ku', 'ke', 'ko', 'sa', 'shi', 'su', 'se', 'so', 'ta', 'chi', 'tsu', 'te', 'to'],
    targetCount: 45,
    passAccuracy: 90,
    focusDesc: '平假名、片假名、万叶字源、听音与键盘输入五维混测'
  },
  {
    stage: 4,
    title: '第四阶 · 鼻音与古唇音演变（な行 · は行）',
    subtitle: '理解「古无轻唇音」与双唇擦音「ふ(fu)」，掌握「な、は、ほ」底结字形（20字）',
    kanaIds: ['na', 'ni', 'nu', 'ne', 'no', 'ha', 'hi', 'fu', 'he', 'ho'],
    targetCount: 35,
    passAccuracy: 90,
    focusDesc: '辨析「は(波) 与 ほ(保)」、「ぬ(奴)」、「ね(祢)」'
  },
  {
    stage: 5,
    title: '第五阶 · 双唇鼻音与近音（ま行 · や行）',
    subtitle: '掌握「ま、み、む、め、も」与「や、ゆ、よ」（16字），明辨「ぬ(奴) 与 め(女)」',
    kanaIds: ['ma', 'mi', 'mu', 'me', 'mo', 'ya', 'yu', 'yo'],
    targetCount: 32,
    passAccuracy: 90,
    focusDesc: '辨析「ぬ 与 め」、「は · ほ · ま」、「コ · ユ · ヨ」'
  },
  {
    stage: 6,
    title: '第六阶 · 闪音收官与拨音（ら行 · わ行 · ん）',
    subtitle: '掌握最后8组（16字），融会贯通「ね·れ·わ」、「る·ろ」及片假名点撇四字',
    kanaIds: ['ra', 'ri', 'ru', 're', 'ro', 'wa', 'wo', 'n'],
    targetCount: 35,
    passAccuracy: 90,
    focusDesc: '辨析「ね(祢) · れ(礼) · わ(和)」、「る(留) · ろ(吕)」、「ソ·ン·シ·ツ」'
  },
  {
    stage: 7,
    title: '第七阶 · 十二组形近假名专项考辨',
    subtitle: '集中抽取全部12组形近平片假名，在同源干扰项中精准辨识字形细节',
    kanaIds: ['a', 'o', 'nu', 'me', 'ne', 're', 'wa', 'ru', 'ro', 'sa', 'ki', 'chi', 'ha', 'ho', 'ma', 'shi', 'tsu', 'so', 'n', 'u', 'fu', 'ra', 'ku', 'ke', 'ta', 'ko', 'yu', 'yo'],
    targetCount: 45,
    passAccuracy: 92,
    focusDesc: '所有选项均由形近假名构成，检验书源结体认知的扎实程度'
  },
  {
    stage: 8,
    title: '第八阶 · 片假名四十六字专修',
    subtitle: '针对片假名熟悉度偏低的普遍现象，开展全片假名认读、听辨与偏旁溯源考核',
    kanaIds: window.KANA_DATA.map(k => k.id),
    onlyKatakana: true,
    targetCount: 50,
    passAccuracy: 90,
    focusDesc: '纯片假名认读、听音、平片互转与楷书偏旁溯源'
  },
  {
    stage: 9,
    title: '第九阶 · 浊音 · 拗音 · 特殊音拍与真词拼读',
    subtitle: '综合检验浊音25音、拗音33音、促音长音拨音及汉日同源词拼读',
    kanaIds: window.KANA_DATA.map(k => k.id),
    includeVocabAndExtensions: true,
    targetCount: 45,
    passAccuracy: 90,
    focusDesc: '同源词汇拼写、浊音拗音听辨、片假名外来语解码'
  },
  {
    stage: 10,
    title: '第十阶 · 五十音九十二字终极总考',
    subtitle: '覆盖全部92个平片假名与拓展音的60题综合演练，完成五十音完整修习',
    kanaIds: window.KANA_DATA.map(k => k.id),
    includeVocabAndExtensions: true,
    targetCount: 60,
    passAccuracy: 93,
    focusDesc: '认读、听写、书源、盲打、词汇全维度综合考核'
  }
];

// 7. 实战真词综合题库（涵盖：汉字同源音读词、含促音/长音/拗音词汇、片假名外来语）
window.VOCAB_QUIZ_BANK = [
  { kana: 'あんぜん', display: '安全', romaji: 'anzen', meaning: '安全（安=あん，全=ぜん）', category: '汉字同源词', note: '汉语前鼻音 -n 对应拨音 ん' },
  { kana: 'うちゅう', display: '宇宙', romaji: 'uchuu', meaning: '宇宙（宇=う，宙=ちゅう）', category: '汉字同源词', note: '「宇」即假名 う/ウ 之本字' },
  { kana: 'えいえん', display: '永遠', romaji: 'eien', meaning: '永远（永=えい，远=えん）', category: '汉字同源词', note: 'え段后接 い 构成长音' },
  { kana: 'おんがく', display: '音楽', romaji: 'ongaku', meaning: '音乐（音=おん，乐=がく）', category: '汉字同源词', note: '乐(gaku)保留古入声 -k 尾' },
  { kana: 'かぞく', display: '家族', romaji: 'kazoku', meaning: '家人、家族（家=か，族=ぞく）', category: '汉字同源词', note: '家字保留古音 ka' },
  { kana: 'きぼう', display: '希望', romaji: 'kibou', meaning: '希望（希=き，望=ぼう）', category: '汉字同源词', note: 'お段后接 う 构成长音' },
  { kana: 'けいかく', display: '計画', romaji: 'keikaku', meaning: '计划（计=けい，画=かく）', category: '汉字同源词', note: '「計」即假名 け 之本字' },
  { kana: 'せかい', display: '世界', romaji: 'sekai', meaning: '世界（世=せ，界=かい）', category: '汉字同源词', note: '「世」即假名 せ/セ 之本字' },
  { kana: 'せんせい', display: '先生', romaji: 'sensei', meaning: '老师、先生（先=せん，生=せい）', category: '汉字同源词', note: '前鼻音先(sen) + 后鼻音生(sei)' },
  { kana: 'たいよう', display: '太陽', romaji: 'taiyou', meaning: '太阳（太=たい，阳=よう）', category: '汉字同源词', note: '「太」即假名 た 之本字' },
  { kana: 'ちしき', display: '知識', romaji: 'chishiki', meaning: '知识（知=ち，识=しき）', category: '汉字同源词', note: '「知」即假名 ち 之本字' },
  { kana: 'てんき', display: '天気', romaji: 'tenki', meaning: '天气（天=てん，气=き）', category: '汉字同源词', note: '「天」即假名 て/テ 之本字' },
  { kana: 'とうきょう', display: '東京', romaji: 'toukyou', meaning: '东京（东=とう，京=きょう）', category: '汉字同源词', note: '长音与拗音长音组合' },
  { kana: 'にほん', display: '日本', romaji: 'nihon', meaning: '日本（日=に，本=ほん）', category: '汉字同源词', note: '基础常用国名' },
  { kana: 'ひみつ', display: '秘密', romaji: 'himitsu', meaning: '秘密（秘=ひ，密=みつ）', category: '汉字同源词', note: '密(mitsu)保留古入声 -t 尾' },
  { kana: 'へいわ', display: '平和', romaji: 'heiwa', meaning: '和平（平=へい，和=わ）', category: '汉字同源词', note: '「和」即假名 わ/ワ 之本字' },
  { kana: 'まほう', display: '魔法', romaji: 'mahou', meaning: '魔法（魔=ま，法=ほう）', category: '汉字同源词', note: 'お段后接 う 构成长音' },
  { kana: 'みらい', display: '未来', romaji: 'mirai', meaning: '未来（未=み，来=らい）', category: '汉字同源词', note: '常用汉日同源词' },
  { kana: 'やくそく', display: '約束', romaji: 'yakusoku', meaning: '约定、诺言（约=やく，束=そく）', category: '汉字同源词', note: '双入声字复合词' },
  { kana: 'りゆう', display: '理由', romaji: 'riyuu', meaning: '理由（理=り，由=ゆう）', category: '汉字同源词', note: '「由」即假名 ゆ/ユ 之本字' },
  { kana: 'れきし', display: '歴史', romaji: 'rekishi', meaning: '历史（历=れき，史=し）', category: '汉字同源词', note: '常用汉日同源词' },
  { kana: 'がっこう', display: '学校', romaji: 'gakkou', meaning: '学校（含浊音、促音与长音）', category: '促音与拗音', note: '学(gaku) + 校(kou) → がっこう' },
  { kana: 'ざっし', display: '雑誌', romaji: 'zasshi', meaning: '杂志（含浊音与促音）', category: '促音与拗音', note: '双写 s 键入促音' },
  { kana: 'しゃしん', display: '写真', romaji: 'shashin', meaning: '照片（含拗音しゃ与拨音ん）', category: '促音与拗音', note: 'し + ゃ = しゃ (sha)' },
  { kana: 'ちゅうごく', display: '中国', romaji: 'chuugoku', meaning: '中国（含拗音长音与浊音）', category: '促音与拗音', note: 'ちゅ + う = ちゅう (chuu)' },
  { kana: 'りょこう', display: '旅行', romaji: 'ryokou', meaning: '旅行（含拗音りょ与长音）', category: '促音与拗音', note: 'り + ょ = りょ (ryo)' },
  { kana: 'びょういん', display: '病院', romaji: 'byouin', meaning: '医院（含浊拗音びょ、长音与拨音）', category: '促音与拗音', note: '浊拗音与长音综合词' },
  { kana: 'はっぴょう', display: '発表', romaji: 'happyou', meaning: '发表（含促音、半浊拗音与长音）', category: '促音与拗音', note: '発(hatsu) + 表(hyou) → はっぴょう' },
  { kana: 'コーヒー', display: 'コーヒー (Coffee)', romaji: 'koohii', meaning: '咖啡', category: '片假名外来语', note: 'コ(ko) + ー + ヒ(hi) + ー' },
  { kana: 'テレビ', display: 'テレビ (TV)', romaji: 'terebi', meaning: '电视', category: '片假名外来语', note: 'テ(te) + レ(re) + ビ(bi)' },
  { kana: 'スマホ', display: 'スマホ (Smartphone)', romaji: 'sumaho', meaning: '智能手机', category: '片假名外来语', note: 'ス(su) + マ(ma) + ホ(ho)' },
  { kana: 'アニメ', display: 'アニメ (Anime)', romaji: 'anime', meaning: '动画', category: '片假名外来语', note: 'ア(a) + ニ(ni) + メ(me)' },
  { kana: 'ホテル', display: 'ホテル (Hotel)', romaji: 'hoteru', meaning: '旅馆、酒店', category: '片假名外来语', note: 'ホ(ho) + テ(te) + ル(ru)' },
  { kana: 'コンビニ', display: 'コンビニ', romaji: 'konbini', meaning: '便利店 (Convenience store)', category: '片假名外来语', note: '留意区分 ン(n) 与 ソ(so)' },
  { kana: 'タクシー', display: 'タクシー (Taxi)', romaji: 'takushii', meaning: '出租车', category: '片假名外来语', note: '留意区分 タ(ta)、ク(ku) 与 シ(shi)' },
  { kana: 'アイスクリーム', display: 'アイスクリーム', romaji: 'aisukuriimu', meaning: '冰淇淋 (Ice cream)', category: '片假名外来语', note: '多音节外来语拼读' }
];
