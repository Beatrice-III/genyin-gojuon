// ============================================================================
// 《源音·五十音》—— 汉字书源与五十音习得系统
// 核心数据库 Part 1：清音46假名（平假名草书溯源 · 片假名楷书偏旁 · 汉日语音考辨 · 同源词汇）
// ============================================================================

window.KANA_DATA = [
  // ======================== あ行 (元音行) ========================
  {
    id: 'a', row: 'a', col: 'a', romaji: 'a', aliases: ['a'],
    hiragana: 'あ', katakana: 'ア',
    hiraOrigin: {
      kanji: '安', pinyin: 'ān',
      stages: ['安', '安', 'あ'],
      evolution: '平假名「あ」源于汉字「安」的草书。上部宝盖头简化为一横，下部「女」字连笔写为一竖贯穿并回环成圈。唐代草书名家怀素、孙过庭笔下的「安」字结体，与今日之「あ」如出一辙。',
      mnemonic: '「安」(ān) 略去鼻音韵尾 -n 即得元音 a；字形亦保留了「安」字上横下女的草法骨架。'
    },
    kataOrigin: {
      kanji: '阿', pinyin: 'ā',
      radicalPart: '阝（左耳旁）',
      evolution: '片假名「ア」取自汉字「阿」左侧的偏旁「阝」（阜部）。古写左耳旁上为横折、下为竖撇，省去末笔弯折后定型为「ア」。',
      mnemonic: '取「阿」(ā) 字左侧偏旁，读音与「阿」一致。'
    },
    pronunciation: {
      ipa: '[ä]',
      chineseApprox: '近似普通话「阿」(ā)，但口腔张开度较普通话略小（约七成），舌位居中且肌肉自然放松。',
      pitfall: '发音宜短促平稳，避免口腔过度张大或拖长尾音。',
      isHardForChinese: false
    },
    writingTip: {
      hiraStrokes: 3, hiraGuide: '第一笔横略向右上倾斜；第二笔竖画微弧向下；第三笔自右上穿下回环收笔，还原「安」字下方的「女」部。',
      kataStrokes: 2, kataGuide: '第一笔横折；第二笔自折处内侧起笔向左下撇出。'
    },
    confusableWith: ['o', 'me', 'nu', 'ma'],
    words: [
      { kana: 'あい', kanji: '愛', romaji: 'ai', meaning: '爱（汉日同源音读词）', tag: '同源词' },
      { kana: 'あんぜん', kanji: '安全', romaji: 'anzen', meaning: '安全（安=あん，保留中古汉语 -n 尾）', tag: '同源词' },
      { kana: 'あさ', kanji: '朝', romaji: 'asa', meaning: '早晨、清晨', tag: '常用词' }
    ]
  },
  {
    id: 'i', row: 'a', col: 'i', romaji: 'i', aliases: ['i', 'yi'],
    hiragana: 'い', katakana: 'イ',
    hiraOrigin: {
      kanji: '以', pinyin: 'yǐ',
      stages: ['以', '以', 'い'],
      evolution: '平假名「い」源于汉字「以」的草书。左侧竖提与点画连写为带钩弧竖，右侧「人」部简化为短弧笔，整体仍保持汉字「以」左右顾盼的笔势。',
      mnemonic: '字形即行草体的「以」(yǐ)，读音亦同「以」(i)。'
    },
    kataOrigin: {
      kanji: '伊', pinyin: 'yī',
      radicalPart: '亻（单人旁）',
      evolution: '片假名「イ」直接截取汉字「伊」左侧的单人旁「亻」，笔画与楷书单人旁完全相同。',
      mnemonic: '取「伊」(yī) 字左侧单人旁「亻」，音形皆通。'
    },
    pronunciation: {
      ipa: '[i]',
      chineseApprox: '与普通话「衣 / 以」(yī) 读音相近，舌面前部抬高，嘴角向两侧自然舒展。',
      pitfall: '保持一拍的短促时长，末尾不要发生口型滑动。',
      isHardForChinese: false
    },
    writingTip: {
      hiraStrokes: 2, hiraGuide: '左笔略长，底部向右上微挑以呼应右笔；右笔略短呈微弧，两笔呈环抱之势。',
      kataStrokes: 2, kataGuide: '第一笔短撇；第二笔自撇画中部向下写垂露竖，同楷书「亻」。'
    },
    confusableWith: ['ri', 'ko', 'ni', 'te'],
    words: [
      { kana: 'いみ', kanji: '意味', romaji: 'imi', meaning: '意思、含义', tag: '同源词' },
      { kana: 'いちご', kanji: '一期一会', romaji: 'ichigo', meaning: '一生一次的相会 / 草莓', tag: '同源词' },
      { kana: 'いのち', kanji: '命', romaji: 'inochi', meaning: '生命', tag: '常用词' }
    ]
  },
  {
    id: 'u', row: 'a', col: 'u', romaji: 'u', aliases: ['u', 'wu'],
    hiragana: 'う', katakana: 'ウ',
    hiraOrigin: {
      kanji: '宇', pinyin: 'yǔ',
      stages: ['宇', '宇', 'う'],
      evolution: '平假名「う」源于汉字「宇」的草书。宝盖头首点保留为上方斜点，下部「于」字连笔弯折向内收拢。',
      mnemonic: '「宇」(yǔ) 字草书，顶部一点如屋脊，下方弧钩似屋檐。'
    },
    kataOrigin: {
      kanji: '宇', pinyin: 'yǔ',
      radicalPart: '宀（宝盖头）',
      evolution: '片假名「ウ」同样源于汉字「宇」（平片同源），取其上方宝盖头「宀」并将右侧横钩拉长为长撇。',
      mnemonic: '平片假名皆出于「宇」字；「ウ」即拉长右侧撇画的宝盖头「宀」。'
    },
    pronunciation: {
      ipa: '[ɯ]',
      chineseApprox: '不圆唇高后元音（扁唇 u）。不同于普通话撅嘴的「乌」(u)，发音时双唇须保持平展放松（近似发「思」si 时的唇形），再将舌根后缩发 u。',
      pitfall: '母语者易受普通话「乌」影响而双唇前突圆拢。练习时需注意嘴唇放平不前撅，这一口型同样适用于整个「う段」（く、す、つ、ぬ、ふ、む、ゆ、る）。',
      isHardForChinese: true
    },
    writingTip: {
      hiraStrokes: 2, hiraGuide: '第一笔上方斜点；第二笔由左向右上微拱后再圆转撇下。',
      kataStrokes: 3, kataGuide: '第一笔顶部短竖；第二笔左侧短竖；第三笔横折长撇（注意与「ワ」区分：ウ顶部有短竖）。'
    },
    confusableWith: ['wa', 'ra', 'fu', 'ku'],
    words: [
      { kana: 'うちゅう', kanji: '宇宙', romaji: 'uchuu', meaning: '宇宙（宇=う，本字直接对应）', tag: '同源词' },
      { kana: 'うんめい', kanji: '運命', romaji: 'unmei', meaning: '命运（运=うん）', tag: '同源词' },
      { kana: 'うみ', kanji: '海', romaji: 'umi', meaning: '大海', tag: '常用词' }
    ]
  },
  {
    id: 'e', row: 'a', col: 'e', romaji: 'e', aliases: ['e'],
    hiragana: 'え', katakana: 'エ',
    hiraOrigin: {
      kanji: '衣', pinyin: 'yī',
      stages: ['衣', '衣', 'え'],
      evolution: '平假名「え」源于汉字「衣」的草书。顶部点画保留，下部横撇与竖提、捺画一笔连写，结体与行草「衣」字一脉相承。',
      mnemonic: '「衣」字草书连写，形似行书之「元」，读作前元音 e。'
    },
    kataOrigin: {
      kanji: '江', pinyin: 'jiāng',
      radicalPart: '工（右侧偏旁）',
      evolution: '片假名「エ」取自汉字「江」（古音含 e 韵）右侧的「工」部，字形与楷书「工」字相同。',
      mnemonic: '取「江」字右侧之「工」，作片假名时读作 e。'
    },
    pronunciation: {
      ipa: '[e]',
      chineseApprox: '半高前不圆唇元音，近似普通话「耶」(yē) 去掉声母 y 后的韵母部分，或单发叹词「欸」(ê)。',
      pitfall: '切勿读作普通话的央元音「鹅」(é)，亦不可滑动成双元音 ei，口型应始终保持固定。',
      isHardForChinese: true
    },
    writingTip: {
      hiraStrokes: 2, hiraGuide: '第一笔顶部斜点；第二笔横折左撇后原路折回，向右下弯曲平收。',
      kataStrokes: 3, kataGuide: '与汉字「工」笔顺相同：上横、中竖、下横。'
    },
    confusableWith: ['n', 'so', 're'],
    words: [
      { kana: 'えいえん', kanji: '永遠', romaji: 'eien', meaning: '永远（永=えい）', tag: '同源词' },
      { kana: 'えき', kanji: '駅', romaji: 'eki', meaning: '车站（汉字「驿」之日本新字体）', tag: '同源词' },
      { kana: 'えがお', kanji: '笑顔', romaji: 'egao', meaning: '笑脸、容颜', tag: '常用词' }
    ]
  },
  {
    id: 'o', row: 'a', col: 'o', romaji: 'o', aliases: ['o'],
    hiragana: 'お', katakana: 'オ',
    hiraOrigin: {
      kanji: '於', pinyin: 'yú / wū',
      stages: ['於', '於', 'お'],
      evolution: '平假名「お」源于汉字「於」（古音 o）的草书。左侧「方」部连笔绕圈，右侧上方的点画保留在右上角。右上角这一点正是区分「お(於)」与「あ(安)」的书源特征。',
      mnemonic: '「於」字草书，右上方保留一点，读作单元音 o。'
    },
    kataOrigin: {
      kanji: '於', pinyin: 'yú / wū',
      radicalPart: '方（左侧偏旁省变）',
      evolution: '片假名「オ」同样源于汉字「於」左侧「方」字旁的草化省写，定型后与汉字「才」同形。',
      mnemonic: '平片同源于「於」；片假名「オ」与汉字「才」同形。'
    },
    pronunciation: {
      ipa: '[o]',
      chineseApprox: '半高后圆唇单元音，近似普通话「喔」(ō) 的起始口型，双唇略圆但全程保持静止。',
      pitfall: '普通话发「欧」(ōu) 或「喔」(uō) 时唇形有明显滑动；日语「お」是纯粹的单元音，发音过程中唇舌位置不可移动。',
      isHardForChinese: true
    },
    writingTip: {
      hiraStrokes: 3, hiraGuide: '第一笔短横；第二笔竖画直下后向左打结再大弧绕向右下；第三笔在右上角点一笔。',
      kataStrokes: 3, kataGuide: '与汉字「才」笔顺相同：横、竖钩、撇。'
    },
    confusableWith: ['a', 'su', 'mu', 'ho'],
    words: [
      { kana: 'おんがく', kanji: '音楽', romaji: 'ongaku', meaning: '音乐（音=おん）', tag: '同源词' },
      { kana: 'おうこく', kanji: '王国', romaji: 'oukoku', meaning: '王国（王=おう）', tag: '同源词' },
      { kana: 'おちゃ', kanji: 'お茶', romaji: 'ocha', meaning: '茶水', tag: '常用词' }
    ]
  },

  // ======================== か行 (清塞音 k) ========================
  {
    id: 'ka', row: 'ka', col: 'a', romaji: 'ka', aliases: ['ka'],
    hiragana: 'か', katakana: 'カ',
    hiraOrigin: {
      kanji: '加', pinyin: 'jiā',
      stages: ['加', '加', 'か'],
      evolution: '平假名「か」源于汉字「加」（上古及中古音 ka）的草书。左侧保留「力」部，右侧「口」部在草书中简化为右侧一点。',
      mnemonic: '汉字「加」左「力」右「口」（化为一点），保留古音 ka。'
    },
    kataOrigin: {
      kanji: '加', pinyin: 'jiā',
      radicalPart: '力（左侧偏旁）',
      evolution: '片假名「カ」同样源于汉字「加」，直接截取其左半边的「力」部，折角挺拔。',
      mnemonic: '平片同源于「加」；平假名「か」保留右侧一点，片假名「カ」仅取左侧「力」字。'
    },
    pronunciation: {
      ipa: '[kä]',
      chineseApprox: '清软腭塞音 k 加元音 a，近似普通话「咖」(kā)，送气力度较普通话轻柔。',
      pitfall: '「か」位于词首时轻微送气（近中文 k），位于词中时多不送气（听感接近中文不送气的 g），属正常语音现象。',
      isHardForChinese: false
    },
    writingTip: {
      hiraStrokes: 3, hiraGuide: '第一笔横折钩（转折圆润）；第二笔撇；第三笔右侧斜点（对应「加」字右部的「口」）。',
      kataStrokes: 2, kataGuide: '同汉字「力」，折角分明。'
    },
    confusableWith: ['ya', 'se'],
    words: [
      { kana: 'かぞく', kanji: '家族', romaji: 'kazoku', meaning: '家人、家族（家=か，存古音 ka）', tag: '同源词' },
      { kana: 'かがく', kanji: '科学', romaji: 'kagaku', meaning: '科学（科=か）', tag: '同源词' },
      { kana: 'かさ', kanji: '傘', romaji: 'kasa', meaning: '雨伞', tag: '常用词' }
    ]
  },
  {
    id: 'ki', row: 'ka', col: 'i', romaji: 'ki', aliases: ['ki'],
    hiragana: 'き', katakana: 'キ',
    hiraOrigin: {
      kanji: '幾', pinyin: 'jī / jǐ',
      stages: ['幾', '幾', 'き'],
      evolution: '平假名「き」源于繁体汉字「幾」（中古音 ki）的草书。上部两个「幺」简化为两道短横，斜戈一笔贯穿，下部撇画化为左下圆弧。',
      mnemonic: '「幾」字草书简化，保留上部两横与斜戈，读古音 ki。'
    },
    kataOrigin: {
      kanji: '幾', pinyin: 'jī / jǐ',
      radicalPart: '幾（上半部提取）',
      evolution: '片假名「キ」同样源于「幾」字草书的上半部分（两横加一斜竖），省去了平假名底部的弧线。',
      mnemonic: '平片同源于「幾」；「き」省去底部弯弧即为「キ」。'
    },
    pronunciation: {
      ipa: '[kʲi]',
      chineseApprox: '声母 k 拼韵母 i（类似英语 key）。中古汉语的 ki 音节在现代普通话中已颚化为 qi（欺），日语则保留了舌根音 k 与 i 的相拼。',
      pitfall: '发音部位在舌根与软腭，切勿读成普通话的舌面音「欺」(qī)。',
      isHardForChinese: false
    },
    writingTip: {
      hiraStrokes: 4, hiraGuide: '一、二笔写两道平行短横；第三笔斜竖微带笔锋；第四笔于左下方写圆弧（手写体中第三、四笔断开书写更为规范清晰）。',
      kataStrokes: 3, kataGuide: '两道向右上微斜的平行横画，加一道斜竖贯穿。'
    },
    confusableWith: ['sa', 'chi', 'mo'],
    words: [
      { kana: 'きぼう', kanji: '希望', romaji: 'kibou', meaning: '希望（希=き，存古音）', tag: '同源词' },
      { kana: 'きおく', kanji: '記憶', romaji: 'kioku', meaning: '记忆（记=き）', tag: '同源词' },
      { kana: 'きせつ', kanji: '季節', romaji: 'kisetsu', meaning: '季节（季=き）', tag: '同源词' }
    ]
  },
  {
    id: 'ku', row: 'ka', col: 'u', romaji: 'ku', aliases: ['ku'],
    hiragana: 'く', katakana: 'ク',
    hiraOrigin: {
      kanji: '久', pinyin: 'jiǔ',
      stages: ['久', '久', 'く'],
      evolution: '平假名「く」源于汉字「久」（中古音 ku）的草书。全字一笔连写，简化为向左折转的折角形态。',
      mnemonic: '「久」字一笔行草，保留首撇与折势，读古音 ku。'
    },
    kataOrigin: {
      kanji: '久', pinyin: 'jiǔ',
      radicalPart: '久（左上两笔）',
      evolution: '片假名「ク」同样源于汉字「久」，截取其前两笔（短撇、横撇），省去末笔长捺。',
      mnemonic: '平片同源于「久」；「久」字省去末捺即成「ク」。'
    },
    pronunciation: {
      ipa: '[kɯ]',
      chineseApprox: '声母 k 拼扁唇元音 u。近似普通话「哭」(kū)，但双唇保持平展不前撅。',
      pitfall: '遵循「う」段的扁唇发音规律，避免像普通话发「哭」那样将双唇撮圆。',
      isHardForChinese: true
    },
    writingTip: {
      hiraStrokes: 1, hiraGuide: '一笔写成：自右上向左下撇出，于折角处圆转再向右下收笔。',
      kataStrokes: 2, kataGuide: '第一笔短撇；第二笔横撇（即汉字「久」省去末捺，注意与中间带点的「タ」区分）。'
    },
    confusableWith: ['he', 'ke', 'ta', 'wa'],
    words: [
      { kana: 'くうき', kanji: '空気', romaji: 'kuuki', meaning: '空气、氛围（空=くう）', tag: '同源词' },
      { kana: 'くに', kanji: '国', romaji: 'kuni', meaning: '国家、故乡', tag: '常用词' },
      { kana: 'くるま', kanji: '車', romaji: 'kuruma', meaning: '车辆', tag: '常用词' }
    ]
  },
  {
    id: 'ke', row: 'ka', col: 'e', romaji: 'ke', aliases: ['ke'],
    hiragana: 'け', katakana: 'ケ',
    hiraOrigin: {
      kanji: '計', pinyin: 'jì',
      stages: ['計', '計', 'け'],
      evolution: '平假名「け」源于繁体汉字「計」（中古音 kei）的草书。左侧言字旁「讠」简化为一道带钩弧竖，右侧「十」字完整保留。',
      mnemonic: '繁体「計」字草化：左为言字旁竖笔，右为「十」字，读音承古音 ke。'
    },
    kataOrigin: {
      kanji: '介', pinyin: 'jiè',
      radicalPart: '介（上部撇画与竖撇）',
      evolution: '片假名「ケ」源于汉字「介」（古音 kai/ke）的省笔楷化，由左撇、横画与中竖撇组合而成。',
      mnemonic: '源于「介」字，横画右端出头且中竖撇下，可与「ク」区分。'
    },
    pronunciation: {
      ipa: '[ke]',
      chineseApprox: '声母 k 拼前元音 e，近似粤语「茄」(ke) 或英语 kept 的起始音。',
      pitfall: '切勿读作普通话的央元音「科」(kē)，舌位需靠前。',
      isHardForChinese: true
    },
    writingTip: {
      hiraStrokes: 3, hiraGuide: '第一笔左侧弧竖微带小钩；第二笔右侧短横；第三笔自横画中部写竖撇。',
      kataStrokes: 3, kataGuide: '第一笔短撇；第二笔自撇中部起笔写横（右端出头）；第三笔自横画中部向下写竖撇。'
    },
    confusableWith: ['ha', 'ni', 'ku', 'ta'],
    words: [
      { kana: 'けいかく', kanji: '計画', romaji: 'keikaku', meaning: '计划（计=けい，本字对应）', tag: '同源词' },
      { kana: 'けいざい', kanji: '経済', romaji: 'keizai', meaning: '经济（经=けい）', tag: '同源词' },
      { kana: 'けしき', kanji: '景色', romaji: 'keshiki', meaning: '景色、风光', tag: '同源词' }
    ]
  },
  {
    id: 'ko', row: 'ka', col: 'o', romaji: 'ko', aliases: ['ko'],
    hiragana: 'こ', katakana: 'コ',
    hiraOrigin: {
      kanji: '己', pinyin: 'jǐ',
      stages: ['己', '己', 'こ'],
      evolution: '平假名「こ」源于汉字「己」（古音 ko）的草书。省去了中间竖折的连笔，仅留上下两条遥相呼应的横弧笔。',
      mnemonic: '平片同源于「己」；草书省去折竖留上下两笔为「こ」。'
    },
    kataOrigin: {
      kanji: '己', pinyin: 'jǐ',
      radicalPart: '己（上半部折框）',
      evolution: '片假名「コ」同样源于汉字「己」，取「己」字上半部分的横折与中横，构成朝左开口的方框。',
      mnemonic: '取「己」字上半框为「コ」，与平假名「こ」同源对照。'
    },
    pronunciation: {
      ipa: '[ko]',
      chineseApprox: '声母 k 拼单元音 o，近似普通话「阔」(kuò) 省去介音 u 后的直拼。',
      pitfall: '保持后圆唇单元音 o 口型固定，不要滑向双元音 ou（如中文「抠」）。',
      isHardForChinese: false
    },
    writingTip: {
      hiraStrokes: 2, hiraGuide: '第一笔上横末端微向下挑（笔断意连）；第二笔下横自左微弧向右平收。',
      kataStrokes: 2, kataGuide: '第一笔横折；第二笔底横（右端不超出竖画，可与底横出头的「ユ」区分）。'
    },
    confusableWith: ['ni', 'ta', 'yu', 'yo'],
    words: [
      { kana: 'こころ', kanji: '心', romaji: 'kokoro', meaning: '心、心意', tag: '常用词' },
      { kana: 'こじん', kanji: '個人', romaji: 'kojin', meaning: '个人（个/己=こ）', tag: '同源词' },
      { kana: 'ことば', kanji: '言葉', romaji: 'kotoba', meaning: '言语、语汇', tag: '常用词' }
    ]
  },

  // ======================== さ行 (清擦音 s) ========================
  {
    id: 'sa', row: 'sa', col: 'a', romaji: 'sa', aliases: ['sa'],
    hiragana: 'さ', katakana: 'サ',
    hiraOrigin: {
      kanji: '左', pinyin: 'zuǒ',
      stages: ['左', '左', 'さ'],
      evolution: '平假名「さ」源于汉字「左」（古音 sa）的草书。上部一横一撇交叉，下部「工」字草化为一道左向圆弧。因「左」字上部仅有一横，故「さ」顶部为一横（可与顶部两横的「き(幾)」区分）。',
      mnemonic: '「左」字草书，上部一横，下部「工」字化弧，读作 sa。'
    },
    kataOrigin: {
      kanji: '散', pinyin: 'sàn',
      radicalPart: '艹（左上草字头）',
      evolution: '片假名「サ」截取自汉字「散」(sàn) 左上角的草字头「艹」，右侧一竖拉长撇出。',
      mnemonic: '取「散」(sàn) 字上部的草字头「艹」，略去鼻音韵尾即读 sa。'
    },
    pronunciation: {
      ipa: '[sä]',
      chineseApprox: '与普通话平舌音「撒」(sā) 发音一致。',
      pitfall: '舌尖平伸靠近齿背，发音自然轻巧。',
      isHardForChinese: false
    },
    writingTip: {
      hiraStrokes: 3, hiraGuide: '第一笔短横略向右上；第二笔斜竖微带笔锋；第三笔于左下方写圆弧（顶部仅一横）。',
      kataStrokes: 3, kataGuide: '第一笔长横；第二笔左短竖；第三笔右长竖撇（同汉字草字头笔势）。'
    },
    confusableWith: ['ki', 'chi', 'se'],
    words: [
      { kana: 'さくら', kanji: '桜', romaji: 'sakura', meaning: '樱花', tag: '常用词' },
      { kana: 'さんぽ', kanji: '散歩', romaji: 'sanpo', meaning: '散步（散=さん，本字对应）', tag: '同源词' },
      { kana: 'さいご', kanji: '最後', romaji: 'saigo', meaning: '最后（最=さい）', tag: '同源词' }
    ]
  },
  {
    id: 'shi', row: 'sa', col: 'i', romaji: 'shi', aliases: ['shi', 'si'],
    hiragana: 'し', katakana: 'シ',
    hiraOrigin: {
      kanji: '之', pinyin: 'zhī',
      stages: ['之', '之', 'し'],
      evolution: '平假名「し」源于汉字「之」的极简草书。晋唐草书（如王羲之尺牍）中，「之」字常一笔连写为竖弯钩，与平假名「し」形态完全吻合。',
      mnemonic: '「之」字一笔草书，化作竖弯钩，读作 shi (近中文「西」)。'
    },
    kataOrigin: {
      kanji: '之', pinyin: 'zhī',
      radicalPart: '之（三点草化，同 氵）',
      evolution: '片假名「シ」同样源于汉字「之」的三点行草写法，结构等同于汉字的三点水「氵」：左侧两点呈横向排列，末笔自左下向右上提挑。',
      mnemonic: '平片同源于「之」；「シ」结构同汉字三点水「氵」，左两点平列，末笔由下向上提挑。'
    },
    pronunciation: {
      ipa: '[ɕi]',
      chineseApprox: '清龈腭擦音，发音接近普通话的舌面音「西」(xī)。',
      pitfall: '罗马音虽记作 shi，但日语中并无普通话的翘舌音（卷舌音），切勿按汉语拼音读作「诗」(shī)，而应发舌面音「西」。',
      isHardForChinese: false
    },
    writingTip: {
      hiraStrokes: 1, hiraGuide: '一笔写成：自上竖下，于底部圆转后向右上挑出。',
      kataStrokes: 3, kataGuide: '笔顺同汉字三点水「氵」：先写左侧上下两个偏平的点，第三笔自左下向右上长提。'
    },
    confusableWith: ['tsu', 'so', 'n', 'mo'],
    words: [
      { kana: 'しぜん', kanji: '自然', romaji: 'shizen', meaning: '自然', tag: '同源词' },
      { kana: 'しんらい', kanji: '信頼', romaji: 'shinrai', meaning: '信赖（信=しん）', tag: '同源词' },
      { kana: 'しあわせ', kanji: '幸せ', romaji: 'shiawase', meaning: '幸福', tag: '常用词' }
    ]
  },
  {
    id: 'su', row: 'sa', col: 'u', romaji: 'su', aliases: ['su'],
    hiragana: 'す', katakana: 'ス',
    hiraOrigin: {
      kanji: '寸', pinyin: 'cùn',
      stages: ['寸', '寸', 'す'],
      evolution: '平假名「す」源于汉字「寸」（古音 sun/su）的草书。上部横画保留，下部竖钩与点画连笔绕成一个小圆圈后向下撇出。',
      mnemonic: '「寸」字草书，竖画将中间一点连笔绕圈，读作 su。'
    },
    kataOrigin: {
      kanji: '須', pinyin: 'xū',
      radicalPart: '須（右下撇点部件）',
      evolution: '片假名「ス」源于繁体汉字「須」（须，xū）草书的右下角部件，由横撇与右下长点构成。',
      mnemonic: '取「須」(xū) 字下部折撇，读音亦近「须/思」(su)。'
    },
    pronunciation: {
      ipa: '[sɯ]',
      chineseApprox: '音色介于普通话「思」(sī) 与「苏」(sū) 之间：保持发「思」(si) 时的平展唇形（不撅嘴），同时舌根后缩发 u。',
      pitfall: '母语者若将双唇圆拢读作纯正的中文「苏」(sū)，听感会略显生硬；保持平唇发出的 su 会带有轻微的 si 共鸣。',
      isHardForChinese: true
    },
    writingTip: {
      hiraStrokes: 2, hiraGuide: '第一笔长横；第二笔竖画自横画中右部穿过，向下绕出一小圆圈后顺势向左下撇收。',
      kataStrokes: 2, kataGuide: '第一笔横撇；第二笔自撇画中段向右下斜顿拉出长点。'
    },
    confusableWith: ['o', 'mu', 'ma', 'nu'],
    words: [
      { kana: 'すし', kanji: '寿司', romaji: 'sushi', meaning: '寿司（寿=す，司=し）', tag: '同源词' },
      { kana: 'すいようび', kanji: '水曜日', romaji: 'suiyoubi', meaning: '星期三（水=すい）', tag: '同源词' },
      { kana: 'すき', kanji: '好き', romaji: 'suki', meaning: '喜爱、中意', tag: '常用词' }
    ]
  },
  {
    id: 'se', row: 'sa', col: 'e', romaji: 'se', aliases: ['se'],
    hiragana: 'せ', katakana: 'セ',
    hiraOrigin: {
      kanji: '世', pinyin: 'shì',
      stages: ['世', '世', 'せ'],
      evolution: '平假名「せ」源于汉字「世」（古音 sei/se）的草书。省去「世」字正中的一竖，保留长横、右侧短竖与左侧竖折。',
      mnemonic: '平片同源于「世」；将「世」字中间一竖省去，即成平假名「せ」。'
    },
    kataOrigin: {
      kanji: '世', pinyin: 'shì',
      radicalPart: '世（省笔楷化）',
      evolution: '片假名「セ」同样源于汉字「世」，在「せ」的基础上将横与右竖连写为横折，下部保留竖折横。',
      mnemonic: '由「世」字进一步简化：平假名「せ」连折右上角即得片假名「セ」。'
    },
    pronunciation: {
      ipa: '[se]',
      chineseApprox: '声母 s 拼前元音 e，近似英语 set 省去尾辅音 t，或普通话「塞」(sāi) 的起始音。',
      pitfall: '切勿读成普通话的央元音「色」(sè)，需保持前元音舌位。',
      isHardForChinese: true
    },
    writingTip: {
      hiraStrokes: 3, hiraGuide: '第一笔长横；第二笔右侧短竖（末端微挑）；第三笔左侧竖折横（还原「世」字外框）。',
      kataStrokes: 2, kataGuide: '第一笔横折钩/横折撇；第二笔竖折横。'
    },
    confusableWith: ['sa', 'hi', 'ya'],
    words: [
      { kana: 'せかい', kanji: '世界', romaji: 'sekai', meaning: '世界（世=せ，本字直接对应）', tag: '同源词' },
      { kana: 'せんせい', kanji: '先生', romaji: 'sensei', meaning: '老师、先生（先=せん，生=せい）', tag: '同源词' },
      { kana: 'せいかつ', kanji: '生活', romaji: 'seikatsu', meaning: '生活（生=せい）', tag: '同源词' }
    ]
  },
  {
    id: 'so', row: 'sa', col: 'o', romaji: 'so', aliases: ['so'],
    hiragana: 'そ', katakana: 'ソ',
    hiraOrigin: {
      kanji: '曽', pinyin: 'céng / zēng',
      stages: ['曾', '曾', 'そ'],
      evolution: '平假名「そ」源于汉字「曾」（古音 so）的草书。上部八字点与横画连写为「Z」形折笔，下部「日」字连写为「C」形弯弧，一笔贯通。',
      mnemonic: '「曾」字一笔草书，上呈折线、下呈弧肚，读古音 so。'
    },
    kataOrigin: {
      kanji: '曽', pinyin: 'céng / zēng',
      radicalPart: '丷（曾字顶部八字点）',
      evolution: '片假名「ソ」同样源于汉字「曾」，直接截取「曾」字顶部的八字点「丷」。因源于字头八字点，故首笔为左竖点，次笔自右上向左下撇出。',
      mnemonic: '平片同源于「曾」；「ソ」即「曾」字顶部的八字点「丷」，由上向下撇出。'
    },
    pronunciation: {
      ipa: '[so]',
      chineseApprox: '声母 s 拼单元音 o，近似普通话「缩」(suō) 省去介音 u 后的直拼。',
      pitfall: '保持后元音 o 口型稳定，不要滑向双元音 ou（如中文「搜」）。',
      isHardForChinese: false
    },
    writingTip: {
      hiraStrokes: 1, hiraGuide: '一笔写成：先写上部的 Z 形横折撇，随即向右拉平并向下弯出 C 形弧底收笔。',
      kataStrokes: 2, kataGuide: '源自「曾」字顶部两点：第一笔左上短竖点；第二笔自右上向左下长撇（两笔起笔高度相近，由上往下书写）。'
    },
    confusableWith: ['n', 'shi', 'tsu', 'ro'],
    words: [
      { kana: 'そら', kanji: '空', romaji: 'sora', meaning: '天空、苍穹', tag: '常用词' },
      { kana: 'そんざい', kanji: '存在', romaji: 'sonzai', meaning: '存在（存=そん）', tag: '同源词' },
      { kana: 'やくそく', kanji: '約束', romaji: 'yakusoku', meaning: '约定、诺言（束=そく）', tag: '同源词' }
    ]
  },

  // ======================== た行 (清塞音 t) ========================
  {
    id: 'ta', row: 'ta', col: 'a', romaji: 'ta', aliases: ['ta'],
    hiragana: 'た', katakana: 'タ',
    hiraOrigin: {
      kanji: '太', pinyin: 'tài',
      stages: ['太', '太', 'た'],
      evolution: '平假名「た」源于汉字「太」（tài）的草书。左上部横与撇构成十字，右下部的捺与底点在草书中演化为右侧的两条短弧（形同小号的「こ」）。',
      mnemonic: '「太」(tài) 字草书，左为十字、右为捺点化成的两横弧，读作 ta。'
    },
    kataOrigin: {
      kanji: '多', pinyin: 'duō',
      radicalPart: '夕（多字上半部）',
      evolution: '片假名「タ」截取自汉字「多」（古音 ta）上半部分的「夕」字，与楷书「夕」完全同形。',
      mnemonic: '取「多」（古音 ta）上半部之「夕」，中间有一点（可与无点的「ク」区分）。'
    },
    pronunciation: {
      ipa: '[tä]',
      chineseApprox: '清齿龈塞音 t 加元音 a，近似普通话「他」(tā)；位于词中不送气时听感接近「搭」(da)。',
      pitfall: '词中（如 わたし watashi）发不送气清音 t，注意声带不发生浊化振动。',
      isHardForChinese: false
    },
    writingTip: {
      hiraStrokes: 4, hiraGuide: '第一笔短横；第二笔斜撇穿下；第三、四笔于右下角写两条上下呼应的短弧。',
      kataStrokes: 3, kataGuide: '同汉字「夕」：短撇、横撇、内部斜点。'
    },
    confusableWith: ['ni', 'ko', 'na', 'ku'],
    words: [
      { kana: 'たいよう', kanji: '太陽', romaji: 'taiyou', meaning: '太阳（太=たい，本字直接对应）', tag: '同源词' },
      { kana: 'たいせつ', kanji: '大切', romaji: 'taisetsu', meaning: '重要、珍视', tag: '常用词' },
      { kana: 'たべもの', kanji: '食べ物', romaji: 'tabemono', meaning: '食物', tag: '常用词' }
    ]
  },
  {
    id: 'chi', row: 'ta', col: 'i', romaji: 'chi', aliases: ['chi', 'ti'],
    hiragana: 'ち', katakana: 'チ',
    hiraOrigin: {
      kanji: '知', pinyin: 'zhī',
      stages: ['知', '知', 'ち'],
      evolution: '平假名「ち」源于汉字「知」（古音 ti/chi）的草书。左侧「矢」部连笔向下后向右绕出大圆弧，结体形似数字「5」，与弧肚朝左的「さ(左)」呈镜像对称。',
      mnemonic: '「知」字草书，上部一横，下部弧肚朝右鼓起，读作 chi（近中文「七」）。'
    },
    kataOrigin: {
      kanji: '千', pinyin: 'qiān',
      radicalPart: '千（末竖微撇）',
      evolution: '片假名「チ」源于汉字「千」（训读 chi），字形即楷书「千」字将末笔直竖写为竖撇。',
      mnemonic: '源于汉字「千」，首撇、中横、末笔竖撇，声母与「七」(chi) 相通。'
    },
    pronunciation: {
      ipa: '[tɕi]',
      chineseApprox: '清龈腭塞擦音，发音接近普通话的舌面音「七 / 妻」(qī)。',
      pitfall: '虽罗马音记作 chi，但切勿读成普通话的翘舌音「吃」(chī)，舌尖应抵下齿背发舌面音「七」。',
      isHardForChinese: false
    },
    writingTip: {
      hiraStrokes: 2, hiraGuide: '第一笔短横；第二笔自横画中部偏左斜竖向下，再向右上大回环绕弧收笔。',
      kataStrokes: 3, kataGuide: '第一笔顶部平撇；第二笔长横；第三笔自中部向下写竖撇（同「千」字）。'
    },
    confusableWith: ['sa', 'ki', 'ra', 'te'],
    words: [
      { kana: 'ちしき', kanji: '知識', romaji: 'chishiki', meaning: '知识（知=ち，本字直接对应）', tag: '同源词' },
      { kana: 'ちきゅう', kanji: '地球', romaji: 'chikyuu', meaning: '地球（地=ち）', tag: '同源词' },
      { kana: 'ちから', kanji: '力', romaji: 'chikara', meaning: '力量、能力', tag: '常用词' }
    ]
  },
  {
    id: 'tsu', row: 'ta', col: 'u', romaji: 'tsu', aliases: ['tsu', 'tu'],
    hiragana: 'つ', katakana: 'ツ',
    hiraOrigin: {
      kanji: '川', pinyin: 'chuān',
      stages: ['川', '川', 'つ'],
      evolution: '平假名「つ」源于汉字「川」（或「州」）的草书。三道竖笔在草书中一笔连写为横空弯转的圆弧。',
      mnemonic: '平片同源于「川」；三竖草化一笔成弧为「つ」，读作 tsu。'
    },
    kataOrigin: {
      kanji: '川', pinyin: 'chuān',
      radicalPart: '川（三竖化为两点一撇）',
      evolution: '片假名「ツ」同样源于汉字「川」的三道竖画：前两竖化为顶部并排的两个竖点，末竖化为右侧由上往下的长撇。对比「シ(之=氵)」与「ツ(川)」：三点水「シ」横排上挑，川字竖「ツ」竖排下撇。',
      mnemonic: '源于汉字「川」的三竖：顶部两竖点并列，末笔自右上向左下长撇。'
    },
    pronunciation: {
      ipa: '[tsɯ]',
      chineseApprox: '声母同普通话「次 / 刺」(cì) 的平舌塞擦音 ts，韵母为扁唇元音 u（双唇放平不撅嘴）。',
      pitfall: '切勿读作撅嘴的普通话「粗」(cū)，亦不可读作翘舌的「出」(chū)；保持发「次」(ci) 的平唇状态并带出扁唇 u 的共鸣。',
      isHardForChinese: true
    },
    writingTip: {
      hiraStrokes: 1, hiraGuide: '一笔写成：自左向右上微扬，随即大圆弧折向左下方收笔。',
      kataStrokes: 3, kataGuide: '源自「川」字三竖：一、二笔在顶部并排写两个由上往下的竖点；第三笔自右上向左下长撇。'
    },
    confusableWith: ['shi', 'so', 'n', 'u'],
    words: [
      { kana: 'つき', kanji: '月', romaji: 'tsuki', meaning: '月亮', tag: '常用词' },
      { kana: 'つうしん', kanji: '通信', romaji: 'tsuushin', meaning: '通信、通讯（通=つう）', tag: '同源词' },
      { kana: 'つよい', kanji: '強い', romaji: 'tsuyoi', meaning: '坚强、有力', tag: '常用词' }
    ]
  },
  {
    id: 'te', row: 'ta', col: 'e', romaji: 'te', aliases: ['te'],
    hiragana: 'て', katakana: 'テ',
    hiraOrigin: {
      kanji: '天', pinyin: 'tiān',
      stages: ['天', '天', 'て'],
      evolution: '平假名「て」源于汉字「天」（古音 ten/te）的草书。将「天」字上部横画与下部撇捺一笔连写，化为上横下弧的流畅结体。',
      mnemonic: '平片同源于「天」(tiān)；一笔连写为「て」，读音取其声母与主元音 te。'
    },
    kataOrigin: {
      kanji: '天', pinyin: 'tiān',
      radicalPart: '天（省去末笔捺画）',
      evolution: '片假名「テ」同样源于汉字「天」，省去「天」字右下角的末笔长捺，仅保留上短横、下长横与中竖撇。',
      mnemonic: '汉字「天」省去末笔长捺即成「テ」(te)。'
    },
    pronunciation: {
      ipa: '[te]',
      chineseApprox: '声母 t 拼前元音 e，近似英语 ten 省去鼻音尾 n，或「帖」(tiē) 省去介音 i。',
      pitfall: '切勿读成普通话的央元音「特」(tè)，舌位应靠前。',
      isHardForChinese: true
    },
    writingTip: {
      hiraStrokes: 1, hiraGuide: '一笔写成：横画向右，折向中部后向下弯出 C 形弧肚收笔。',
      kataStrokes: 3, kataGuide: '第一笔上短横；第二笔下长横；第三笔自下横中部向下写竖撇。'
    },
    confusableWith: ['to', 'chi', 'ra'],
    words: [
      { kana: 'てんき', kanji: '天気', romaji: 'tenki', meaning: '天气（天=てん，本字直接对应）', tag: '同源词' },
      { kana: 'てがみ', kanji: '手紙', romaji: 'tegami', meaning: '书信、信件（古汉语中亦称书信为手纸）', tag: '常用词' },
      { kana: 'てつどう', kanji: '鉄道', romaji: 'tetsudou', meaning: '铁道、铁路（铁=てつ）', tag: '同源词' }
    ]
  },
  {
    id: 'to', row: 'ta', col: 'o', romaji: 'to', aliases: ['to'],
    hiragana: 'と', katakana: 'ト',
    hiraOrigin: {
      kanji: '止', pinyin: 'zhǐ',
      stages: ['止', '止', 'と'],
      evolution: '平假名「と」源于汉字「止」（训读 to-maru）的草书。上部竖笔化为左上斜竖，下部横折连写为圆弧底座。',
      mnemonic: '平片同源于「止」；草书连写为「と」，上部取「卜」即为「ト」。'
    },
    kataOrigin: {
      kanji: '止', pinyin: 'zhǐ',
      radicalPart: '⺊（止字上半部）',
      evolution: '片假名「ト」直接截取汉字「止」上半部分的「⺊」，字形与汉字「卜」完全一致。',
      mnemonic: '取「止」字上半部之「卜」(ト)，读作 to。'
    },
    pronunciation: {
      ipa: '[to]',
      chineseApprox: '声母 t 拼单元音 o，近似普通话「托」(tuō) 省去介音 u 后的直拼。',
      pitfall: '保持后元音 o 口型固定，不要滑成双元音「偷」(tōu)。',
      isHardForChinese: false
    },
    writingTip: {
      hiraStrokes: 2, hiraGuide: '第一笔自左上向右下写短斜竖；第二笔自右上方撇入，至底部圆转平收。',
      kataStrokes: 2, kataGuide: '同汉字「卜」：第一笔垂露竖，第二笔右侧中段长点。'
    },
    confusableWith: ['te', 'ko', 'i'],
    words: [
      { kana: 'とうきょう', kanji: '東京', romaji: 'toukyou', meaning: '东京（东=とう）', tag: '同源词' },
      { kana: 'ともだち', kanji: '友達', romaji: 'tomodachi', meaning: '朋友、友人', tag: '常用词' },
      { kana: 'とけい', kanji: '時計', romaji: 'tokei', meaning: '钟表、时计', tag: '同源词' }
    ]
  },

  // ======================== な行 (鼻音 n) ========================
  {
    id: 'na', row: 'na', col: 'a', romaji: 'na', aliases: ['na'],
    hiragana: 'な', katakana: 'ナ',
    hiraOrigin: {
      kanji: '奈', pinyin: 'nài',
      stages: ['奈', '奈', 'な'],
      evolution: '平假名「な」源于汉字「奈」（nài）的草书。上部「大」字简化为左上角的十字，下部「示」字草化为右侧一点加底部的绕圈打结。',
      mnemonic: '平片同源于「奈」(nài)；左上为「大」部十字，右下为「示」部连笔打结，读音即 na。'
    },
    kataOrigin: {
      kanji: '奈', pinyin: 'nài',
      radicalPart: '大（奈字左上两笔）',
      evolution: '片假名「ナ」同样源于汉字「奈」，仅取其左上角的前两笔（短横与竖撇），即平假名「な」左上角的十字部件。',
      mnemonic: '将平假名「な」左上角的十字部件单独提取，即为片假名「ナ」。'
    },
    pronunciation: {
      ipa: '[nä]',
      chineseApprox: '与普通话鼻音「那 / 拿」(nā) 发音一致。',
      pitfall: '舌尖抵上齿龈使气流从鼻腔通出，注意与边音 l（ら行）区分。',
      isHardForChinese: false
    },
    writingTip: {
      hiraStrokes: 4, hiraGuide: '第一笔短横；第二笔斜撇（构成左上十字）；第三笔右上斜点；第四笔竖画直下后向左绕圈打结收笔。',
      kataStrokes: 2, kataGuide: '第一笔横画；第二笔自横画中部向下写竖撇。'
    },
    confusableWith: ['ta', 'ha', 'ho', 'me'],
    words: [
      { kana: 'なつ', kanji: '夏', romaji: 'natsu', meaning: '夏天、夏季', tag: '常用词' },
      { kana: 'なまえ', kanji: '名前', romaji: 'namae', meaning: '名字、姓名', tag: '常用词' },
      { kana: 'なみだ', kanji: '涙', romaji: 'namida', meaning: '眼泪', tag: '常用词' }
    ]
  },
  {
    id: 'ni', row: 'na', col: 'i', romaji: 'ni', aliases: ['ni'],
    hiragana: 'に', katakana: 'ニ',
    hiraOrigin: {
      kanji: '仁', pinyin: 'rén',
      stages: ['仁', '仁', 'に'],
      evolution: '平假名「に」源于汉字「仁」（古音 ni，今日语吴音仍读 に）的草书。左侧单人旁「亻」化为一道弧竖，右侧「二」字完整保留。',
      mnemonic: '平片同源于「仁」；左竖为单人旁，右部为「二」，读作 ni。'
    },
    kataOrigin: {
      kanji: '仁', pinyin: 'rén',
      radicalPart: '二（仁字右侧部件）',
      evolution: '片假名「ニ」同样源于汉字「仁」右侧的「二」（亦通数字「二」本身），写法与汉字「二」完全一致。',
      mnemonic: '平假名「に」省去左侧单人旁即为片假名「ニ」（汉字「二」），日语数字「二」亦读作 ni。'
    },
    pronunciation: {
      ipa: '[ɲi]',
      chineseApprox: '与普通话「你 / 尼」(ní) 发音相同。',
      pitfall: '发音清晰自然，无特殊难点。',
      isHardForChinese: false
    },
    writingTip: {
      hiraStrokes: 3, hiraGuide: '第一笔左侧弧竖微带笔锋；第二、三笔于右侧写上下呼应的两条短横弧（同「こ」）。',
      kataStrokes: 2, kataGuide: '同汉字「二」：上短横、下长横。'
    },
    confusableWith: ['ko', 'ta', 'ke', 'ha'],
    words: [
      { kana: 'にほん', kanji: '日本', romaji: 'nihon', meaning: '日本（日=に）', tag: '同源词' },
      { kana: 'にんげん', kanji: '人間', romaji: 'ningen', meaning: '人类、世间（人/仁=にん）', tag: '同源词' },
      { kana: 'にじ', kanji: '虹', romaji: 'niji', meaning: '彩虹', tag: '常用词' }
    ]
  },
  {
    id: 'nu', row: 'na', col: 'u', romaji: 'nu', aliases: ['nu'],
    hiragana: 'ぬ', katakana: 'ヌ',
    hiraOrigin: {
      kanji: '奴', pinyin: 'nú',
      stages: ['奴', '奴', 'ぬ'],
      evolution: '平假名「ぬ」源于汉字「奴」（nú）的草书。左侧「女」部草化为交叉大回环，右侧「又」部化为末尾的小圆圈打结。与「め(女)」对比：「め」源于独体「女」字故末尾不打结；「ぬ」源于「奴」（女+又），故末尾多绕一圈以对应右部的「又」。',
      mnemonic: '平片同源于「奴」(nú)；因「奴」比「女」(め) 右侧多一「又」字，故「ぬ」尾部多绕一圈，读音亦同「奴」(nu)。'
    },
    kataOrigin: {
      kanji: '奴', pinyin: 'nú',
      radicalPart: '又（奴字右侧偏旁）',
      evolution: '片假名「ヌ」同样源于汉字「奴」，直接截取其右半边的「又」字（末笔捺画写为长点）。',
      mnemonic: '取「奴」(nú) 字右侧的「又」部即为「ヌ」(nu)。'
    },
    pronunciation: {
      ipa: '[nɯ]',
      chineseApprox: '声母 n 拼扁唇元音 u，近似普通话「奴」(nú)，双唇放平不前突。',
      pitfall: '保持「う」段扁唇口型。',
      isHardForChinese: false
    },
    writingTip: {
      hiraStrokes: 2, hiraGuide: '第一笔左斜弧竖；第二笔自右上方撇下，向右上大回环后于右下角绕一小圈收笔（对应「奴」字右侧的「又」）。',
      kataStrokes: 2, kataGuide: '第一笔横撇；第二笔交叉长点（同汉字「又」）。'
    },
    confusableWith: ['me', 'a', 'o', 'su', 'fu'],
    words: [
      { kana: 'いぬ', kanji: '犬', romaji: 'inu', meaning: '犬、狗', tag: '常用词' },
      { kana: 'ぬの', kanji: '布', romaji: 'nuno', meaning: '布匹、织物', tag: '常用词' },
      { kana: 'ぬくもり', kanji: '温もり', romaji: 'nukumori', meaning: '温暖、余温', tag: '常用词' }
    ]
  },
  {
    id: 'ne', row: 'na', col: 'e', romaji: 'ne', aliases: ['ne'],
    hiragana: 'ね', katakana: 'ネ',
    hiraOrigin: {
      kanji: '祢', pinyin: 'mí / nǐ',
      stages: ['祢', '祢', 'ね'],
      evolution: '平假名「ね」源于汉字「祢」（古同「禰」，音 nǐ/ne）的草书。左侧示字旁「礻」化为左竖加折笔，右侧「尔」部化为右下角的绕圈打结。与「れ(礼)」「わ(和)」对比：三者左侧近似，唯独「ね(祢)」在右下角收尾打结。',
      mnemonic: '平片同源于「祢」；平假名「ね」右下角绕圈打结，片假名「ネ」即左侧示字旁「礻」。'
    },
    kataOrigin: {
      kanji: '祢', pinyin: 'mí / nǐ',
      radicalPart: '礻（左侧示字旁）',
      evolution: '片假名「ネ」同样源于汉字「祢」，直接截取其左侧的示字旁「礻」，笔画与楷书示字旁一致。',
      mnemonic: '取「祢」字左侧示字旁「礻」，读作 ne。'
    },
    pronunciation: {
      ipa: '[ne]',
      chineseApprox: '声母 n 拼前元音 e，常见于日语口语助词「ね」。',
      pitfall: '不可读作普通话轻声的央元音「呢」(ne)，需发出饱满的前元音 e。',
      isHardForChinese: false
    },
    writingTip: {
      hiraStrokes: 2, hiraGuide: '第一笔左侧直竖；第二笔横折撇后向右上拱起再竖下，于末尾绕圈打结（以此区分不打结的「れ」与「わ」）。',
      kataStrokes: 4, kataGuide: '同汉字示字旁「礻」：顶部斜点、横撇、垂露竖、右侧长点。'
    },
    confusableWith: ['re', 'wa', 'nu', 'ho'],
    words: [
      { kana: 'ねこ', kanji: '猫', romaji: 'neko', meaning: '猫', tag: '常用词' },
      { kana: 'ねつ', kanji: '熱', romaji: 'netsu', meaning: '热度、热情（热=ねつ）', tag: '同源词' },
      { kana: 'ねがい', kanji: '願い', romaji: 'negai', meaning: '心愿、祈愿', tag: '常用词' }
    ]
  },
  {
    id: 'no', row: 'na', col: 'o', romaji: 'no', aliases: ['no'],
    hiragana: 'の', katakana: 'ノ',
    hiraOrigin: {
      kanji: '乃', pinyin: 'nǎi',
      stages: ['乃', '乃', 'の'],
      evolution: '平假名「の」源于汉字「乃」（nǎi）的草书。将「乃」字的首撇与横折钩一笔连写，形成圆润回环的「の」。',
      mnemonic: '平片同源于「乃」；全字草书连笔为「の」，单取首笔长撇为「ノ」。'
    },
    kataOrigin: {
      kanji: '乃', pinyin: 'nǎi',
      radicalPart: '丿（乃字首笔撇）',
      evolution: '片假名「ノ」同样源于汉字「乃」，仅取「乃」字的第一笔长撇「丿」（即平假名「の」的起笔左撇）。',
      mnemonic: '取「乃」字首笔长撇「丿」，读作 no。'
    },
    pronunciation: {
      ipa: '[no]',
      chineseApprox: '声母 n 拼单元音 o，近似普通话「诺」(nuò) 省去介音 u 后的直拼。',
      pitfall: '保持单元音 o 口型不变，切勿读成英语双元音 No [nəʊ]。',
      isHardForChinese: false
    },
    writingTip: {
      hiraStrokes: 1, hiraGuide: '一笔写成：自上方中点向左下斜撇到底，再向右上大圆弧绕回右下收笔。',
      kataStrokes: 1, kataGuide: '一笔写成：自右上向左下舒展撇出。'
    },
    confusableWith: ['me', 'nu', 'a', 'so'],
    words: [
      { kana: 'のうりょく', kanji: '能力', romaji: 'nouryoku', meaning: '能力（能=のう）', tag: '同源词' },
      { kana: 'きのう', kanji: '昨日', romaji: 'kinou', meaning: '昨日、昨天', tag: '常用词' },
      { kana: 'たのしい', kanji: '楽しい', romaji: 'tanoshii', meaning: '愉快的、欣喜的', tag: '常用词' }
    ]
  },

  // ======================== は行 (清擦音 h / ɸ) ========================
  {
    id: 'ha', row: 'ha', col: 'a', romaji: 'ha', aliases: ['ha'],
    hiragana: 'は', katakana: 'ハ',
    hiraOrigin: {
      kanji: '波', pinyin: 'bō',
      stages: ['波', '波', 'は'],
      evolution: '平假名「は」源于汉字「波」（上古音 pa → fa → ha）的草书。左侧三点水连写为一道弧竖，右侧「皮」部草化为一横加竖画底部打结。',
      mnemonic: '「波」字草书，左为水旁一竖，右为「皮」部一横加竖打结，读作 ha。'
    },
    kataOrigin: {
      kanji: '八', pinyin: 'bā',
      radicalPart: '八（汉字全字）',
      evolution: '片假名「ハ」直接借用汉字「八」（上古音 pa → ha，汉语音韵学所谓「古无轻唇音」），写法与汉字「八」相同。',
      mnemonic: '借汉字「八」为片假名「ハ」，读作 ha。'
    },
    pronunciation: {
      ipa: '[hä]',
      chineseApprox: '清声门擦音 h 加 a，近似普通话「哈」(hā)，但喉部摩擦较普通话轻微，仅以自然气流呼出。',
      pitfall: '语法规则提示：当「は」作为提示助词（如「私は…」）使用时，读音改读为 wa；在普通词汇中仍读 ha。',
      isHardForChinese: false
    },
    writingTip: {
      hiraStrokes: 3, hiraGuide: '第一笔左侧弧竖；第二笔右侧短横；第三笔竖画穿过短横（顶端出头）直下，于底部向左绕圈打结。',
      kataStrokes: 2, kataGuide: '同汉字「八」：左短撇、右长点捺。'
    },
    confusableWith: ['ho', 'ma', 'ke', 'ni'],
    words: [
      { kana: 'はな', kanji: '花', romaji: 'hana', meaning: '花朵', tag: '常用词' },
      { kana: 'はは', kanji: '母', romaji: 'haha', meaning: '母亲', tag: '常用词' },
      { kana: 'はんたい', kanji: '反対', romaji: 'hantai', meaning: '反对（反=はん）', tag: '同源词' }
    ]
  },
  {
    id: 'hi', row: 'ha', col: 'i', romaji: 'hi', aliases: ['hi'],
    hiragana: 'ひ', katakana: 'ヒ',
    hiraOrigin: {
      kanji: '比', pinyin: 'bǐ',
      stages: ['比', '比', 'ひ'],
      evolution: '平假名「ひ」源于汉字「比」（古音 pi → hi）的草书。将「比」字左右两部分一笔连写为圆润的马蹄囊状。',
      mnemonic: '平片同源于「比」；全字草书连写为「ひ」，截取右侧偏旁为「ヒ」。'
    },
    kataOrigin: {
      kanji: '比', pinyin: 'bǐ',
      radicalPart: '匕（比字右侧偏旁）',
      evolution: '片假名「ヒ」同样源于汉字「比」，直接截取其右半边的「匕」部，与楷书「匕」同形。',
      mnemonic: '取「比」字右半部之「匕」(ヒ)，读作 hi。'
    },
    pronunciation: {
      ipa: '[çi]',
      chineseApprox: '硬腭清擦音，舌面抬高靠近硬腭送气，音色介于普通话「希」(xī) 与英语 he 之间。',
      pitfall: '发音位置在硬腭前部，避免用喉咙深处用力摩擦。',
      isHardForChinese: false
    },
    writingTip: {
      hiraStrokes: 1, hiraGuide: '一笔写成：短横向右后向下兜出 U 形圆弧，再向右上提并往右下短顿收笔。',
      kataStrokes: 2, kataGuide: '同汉字「匕」：第一笔短横（向右），第二笔竖弯横。'
    },
    confusableWith: ['te', 'se', 'to'],
    words: [
      { kana: 'ひみつ', kanji: '秘密', romaji: 'himitsu', meaning: '秘密（秘=ひ）', tag: '同源词' },
      { kana: 'ひかり', kanji: '光', romaji: 'hikari', meaning: '光、光芒', tag: '常用词' },
      { kana: 'ひかく', kanji: '比較', romaji: 'hikaku', meaning: '比较（比=ひ，本字直接对应）', tag: '同源词' }
    ]
  },
  {
    id: 'fu', row: 'ha', col: 'u', romaji: 'fu', aliases: ['fu', 'hu'],
    hiragana: 'ふ', katakana: 'フ',
    hiraOrigin: {
      kanji: '不', pinyin: 'bù / fǒu',
      stages: ['不', '不', 'ふ'],
      evolution: '平假名「ふ」源于汉字「不」（古音 pu → fu）的草书。顶部横撇化为上点，中竖化为弯钩，左右撇点保留为两侧的对称点画。',
      mnemonic: '平片同源于「不」；草书全字化为「ふ」，截取左上两笔横撇化为「フ」。'
    },
    kataOrigin: {
      kanji: '不', pinyin: 'bù / fǒu',
      radicalPart: '不（左上横撇提取）',
      evolution: '片假名「フ」同样源于汉字「不」，截取「不」字起笔的横与撇，连写为一笔横撇「フ」。',
      mnemonic: '取「不」字左上角横撇为「フ」(fu)。'
    },
    pronunciation: {
      ipa: '[ɸɯ]',
      chineseApprox: '清双唇擦音加扁唇 u。既非普通话上齿咬下唇的唇齿音「夫」(fu)，亦非纯喉音「呼」(hu)：发音时上齿不可触碰下唇，而是双唇微拢留出细缝，如吹灭烛火般轻柔送气。',
      pitfall: '母语者需特别注意上牙不碰下嘴唇，仅靠上下双唇间的缝隙摩擦出气。',
      isHardForChinese: true
    },
    writingTip: {
      hiraStrokes: 4, hiraGuide: '第一笔顶部斜点；第二笔中部写弯弧竖钩；第三笔左侧斜点；第四笔右侧斜点。',
      kataStrokes: 1, kataGuide: '一笔写成：横撇（顶部无点、左侧无竖，可与「ウ」「ワ」区分）。'
    },
    confusableWith: ['wa', 'u', 'ra', 'nu'],
    words: [
      { kana: 'ふじさん', kanji: '富士山', romaji: 'fujisan', meaning: '富士山（富=ふ）', tag: '同源词' },
      { kana: 'ふつう', kanji: '普通', romaji: 'futsuu', meaning: '普通、寻常（普=ふ）', tag: '同源词' },
      { kana: 'ふゆ', kanji: '冬', romaji: 'fuyu', meaning: '冬季', tag: '常用词' }
    ]
  },
  {
    id: 'he', row: 'ha', col: 'e', romaji: 'he', aliases: ['he'],
    hiragana: 'へ', katakana: 'ヘ',
    hiraOrigin: {
      kanji: '部', pinyin: 'bù',
      stages: ['部', '部', 'へ'],
      evolution: '平假名「へ」源于汉字「部」右侧偏旁「阝」的极简草书，一笔写为左短右长的山峰折线。',
      mnemonic: '平片同源于「部」字右旁，且平假名「へ」与片假名「ヘ」字形完全一致。'
    },
    kataOrigin: {
      kanji: '部', pinyin: 'bù',
      radicalPart: '阝（部字右侧偏旁）',
      evolution: '片假名「ヘ」与平假名同源于汉字「部」的右侧偏旁，写法亦完全相同。',
      mnemonic: '平片合一，形如缓坡折线，读作 he。'
    },
    pronunciation: {
      ipa: '[he]',
      chineseApprox: '声母 h 拼前元音 e，近似普通话「黑」(hēi) 的起始音（省去尾音 i）。',
      pitfall: '不可读作央元音「喝」(hē)。语法规则提示：当「へ」作为方向助词（表「往、向」）使用时，读音改读为 e。',
      isHardForChinese: false
    },
    writingTip: {
      hiraStrokes: 1, hiraGuide: '一笔写成：左短右长，自左下向右上斜升，于顶点圆转后向右下长伸收笔。',
      kataStrokes: 1, kataGuide: '与平假名笔顺相同，折角处可略微挺拔。'
    },
    confusableWith: ['ku'],
    words: [
      { kana: 'へいわ', kanji: '平和', romaji: 'heiwa', meaning: '和平（平=へい，和=わ）', tag: '同源词' },
      { kana: 'へんか', kanji: '変化', romaji: 'henka', meaning: '变化（变=へん）', tag: '同源词' },
      { kana: 'へや', kanji: '部屋', romaji: 'heya', meaning: '房间（部=へ，本字直接对应）', tag: '同源词' }
    ]
  },
  {
    id: 'ho', row: 'ha', col: 'o', romaji: 'ho', aliases: ['ho'],
    hiragana: 'ほ', katakana: 'ホ',
    hiraOrigin: {
      kanji: '保', pinyin: 'bǎo',
      stages: ['保', '保', 'ほ'],
      evolution: '平假名「ほ」源于汉字「保」（古音 po → ho）的草书。左侧单人旁化为一竖，右侧上部「口」化为第一横，下部「木」化为第二横加竖画打结。与「は(波)」对比：因「保」右部为「口+木」两层，故「ほ」右侧有两横且竖笔顶端不出头。',
      mnemonic: '平片同源于「保」；平假名「ほ」右侧两横，片假名「ホ」即「保」字右下角的「木」。'
    },
    kataOrigin: {
      kanji: '保', pinyin: 'bǎo',
      radicalPart: '木（保字右下部件）',
      evolution: '片假名「ホ」同样源于汉字「保」，直接截取其右下角的「木」字（左右撇捺简化为两点）。',
      mnemonic: '取「保」字右下角之「木」即为片假名「ホ」(ho)。'
    },
    pronunciation: {
      ipa: '[ho]',
      chineseApprox: '声母 h 拼单元音 o，口型固定不滑动。',
      pitfall: '保持后元音 o 的稳定唇形。',
      isHardForChinese: false
    },
    writingTip: {
      hiraStrokes: 4, hiraGuide: '第一笔左侧弧竖；第二笔右上短横；第三笔右中短横；第四笔自第一横正中起笔（顶端不出头）竖下并于底部向左打结。',
      kataStrokes: 4, kataGuide: '同汉字「木」之省体：横、竖钩、左点、右点。'
    },
    confusableWith: ['ha', 'ma', 'o', 'ne'],
    words: [
      { kana: 'ほし', kanji: '星', romaji: 'hoshi', meaning: '星辰', tag: '常用词' },
      { kana: 'ほしょう', kanji: '保証', romaji: 'hoshou', meaning: '保证、保障（保=ほ，本字直接对应）', tag: '同源词' },
      { kana: 'ほんとう', kanji: '本当', romaji: 'hontou', meaning: '真实、的确', tag: '常用词' }
    ]
  },

  // ======================== ま行 (双唇鼻音 m) ========================
  {
    id: 'ma', row: 'ma', col: 'a', romaji: 'ma', aliases: ['ma'],
    hiragana: 'ま', katakana: 'マ',
    hiraOrigin: {
      kanji: '末', pinyin: 'mò',
      stages: ['末', '末', 'ま'],
      evolution: '平假名「ま」源于汉字「末」（古音 ma/mat）的草书。上部两横保留（上长下短），中竖与下部撇捺连笔于底部绕圈打结。',
      mnemonic: '平片同源于「末」；「ま」保留了「末」字的两横一竖骨架，读古音 ma。'
    },
    kataOrigin: {
      kanji: '末', pinyin: 'mò',
      radicalPart: '末（上部折笔加点）',
      evolution: '片假名「マ」同样源于汉字「末」草书的上部简化，写为横折撇加底部斜点。与「ア(阿)」对比：「ア」第二笔为向下延伸的竖撇，「マ」第二笔为托在底部的短点。',
      mnemonic: '源于「末」字上部，横折加底点，读作 ma。'
    },
    pronunciation: {
      ipa: '[mä]',
      chineseApprox: '与普通话「妈」(mā) 发音一致。',
      pitfall: '双唇自然闭合后张开发音，无难点。',
      isHardForChinese: false
    },
    writingTip: {
      hiraStrokes: 3, hiraGuide: '第一笔上横（略长）；第二笔下横（略短）；第三笔中竖自上横上方穿过，于底部向左绕圈打结。',
      kataStrokes: 2, kataGuide: '第一笔横折撇；第二笔底部斜点。'
    },
    confusableWith: ['ha', 'ho', 'a', 'mu'],
    words: [
      { kana: 'まほう', kanji: '魔法', romaji: 'mahou', meaning: '魔法（魔=ま）', tag: '同源词' },
      { kana: 'まんが', kanji: '漫画', romaji: 'manga', meaning: '漫画（漫=まん）', tag: '同源词' },
      { kana: 'まち', kanji: '町 / 街', romaji: 'machi', meaning: '街市、城镇', tag: '常用词' }
    ]
  },
  {
    id: 'mi', row: 'ma', col: 'i', romaji: 'mi', aliases: ['mi'],
    hiragana: 'み', katakana: 'ミ',
    hiraOrigin: {
      kanji: '美', pinyin: 'měi',
      stages: ['美', '美', 'み'],
      evolution: '平假名「み」源于汉字「美」（古音 mi）的草书。上部「羊」简化为横折绕圈，下部「大」的右撇从右侧穿出。',
      mnemonic: '「美」字草书，横折绕圈后右侧穿出一撇，读古音 mi。'
    },
    kataOrigin: {
      kanji: '三', pinyin: 'sān',
      radicalPart: '三（三横微斜）',
      evolution: '片假名「ミ」源于汉字「三」（日语训读 mi / mittsu），将「三」字的三横略微向右下倾斜书写而成。',
      mnemonic: '汉字「三」斜写三笔即为「ミ」，对应日语「三」之训读 mi。'
    },
    pronunciation: {
      ipa: '[mʲi]',
      chineseApprox: '与普通话「咪 / 迷」(mī) 发音一致。',
      pitfall: '发音轻巧自然，无特殊难点。',
      isHardForChinese: false
    },
    writingTip: {
      hiraStrokes: 2, hiraGuide: '第一笔短横折向左下，于左下角绕圈后向右下平伸；第二笔自右侧偏上穿出一道短撇。',
      kataStrokes: 3, kataGuide: '由上至下写三道向右下微斜的平行短横点。'
    },
    confusableWith: ['su', 'ra'],
    words: [
      { kana: 'みらい', kanji: '未来', romaji: 'mirai', meaning: '未来（未=み）', tag: '同源词' },
      { kana: 'みりょく', kanji: '魅力', romaji: 'miryoku', meaning: '魅力（魅=み）', tag: '同源词' },
      { kana: 'みず', kanji: '水', romaji: 'mizu', meaning: '水', tag: '常用词' }
    ]
  },
  {
    id: 'mu', row: 'ma', col: 'u', romaji: 'mu', aliases: ['mu'],
    hiragana: 'む', katakana: 'ム',
    hiraOrigin: {
      kanji: '武', pinyin: 'wǔ',
      stages: ['武', '武', 'む'],
      evolution: '平假名「む」源于汉字「武」（中古吴音 mu）的草书。左部化为十字绕圈，右部戈钩化为底部折挑，右上角的一点完整保留。',
      mnemonic: '「武」字草书，底部绕圈右挑且保留右上角一点，读吴音 mu。'
    },
    kataOrigin: {
      kanji: '牟', pinyin: 'móu / mù',
      radicalPart: '厶（牟字上部私字头）',
      evolution: '片假名「ム」截取自汉字「牟」（mù）上半部分的「厶」部，写法与汉字偏旁「厶」完全相同。',
      mnemonic: '取「牟」(mù) 字顶部之「厶」，读作 mu。'
    },
    pronunciation: {
      ipa: '[mɯ]',
      chineseApprox: '声母 m 拼扁唇元音 u，近似普通话「母」(mǔ)，双唇放松不前撅。',
      pitfall: '保持扁唇 u 的口型。',
      isHardForChinese: false
    },
    writingTip: {
      hiraStrokes: 3, hiraGuide: '第一笔短横；第二笔竖画直下后向左绕小圈，随即向右平拉并向上挑钩；第三笔于右上角写斜点。',
      kataStrokes: 2, kataGuide: '同汉字偏旁「厶」：第一笔撇折横，第二笔右下长点。'
    },
    confusableWith: ['su', 'o', 'ma'],
    words: [
      { kana: 'むりょう', kanji: '無料', romaji: 'muryou', meaning: '免费（无=む，存吴音）', tag: '同源词' },
      { kana: 'むすめ', kanji: '娘', romaji: 'musume', meaning: '女儿、少女', tag: '常用词' },
      { kana: 'むね', kanji: '胸', romaji: 'mune', meaning: '胸怀、内心', tag: '常用词' }
    ]
  },
  {
    id: 'me', row: 'ma', col: 'e', romaji: 'me', aliases: ['me'],
    hiragana: 'め', katakana: 'メ',
    hiraOrigin: {
      kanji: '女', pinyin: 'nǚ',
      stages: ['女', '女', 'め'],
      evolution: '平假名「め」源于汉字「女」（古训读 me，见于「乙女」おとめ）的草书。将「女」字三笔简化为两笔交叉回环。因「女」字右侧无「又」旁，故末尾自然撇收而不打结（以此区分源于「奴」的「ぬ」）。',
      mnemonic: '平片同源于「女」；全字草化回环为「め」（尾部不打圈），截取交叉两笔为「メ」。'
    },
    kataOrigin: {
      kanji: '女', pinyin: 'nǚ',
      radicalPart: '女（下部交叉两笔）',
      evolution: '片假名「メ」同样源于汉字「女」下部交叉的撇与点，构成简洁的交叉两笔。',
      mnemonic: '取「女」（或「め」中心）交叉之撇点，即为片假名「メ」(me)。'
    },
    pronunciation: {
      ipa: '[me]',
      chineseApprox: '声母 m 拼前元音 e，近似普通话「妹」(mèi) 的起始音（省去尾音 i）。',
      pitfall: '不可读作轻声央元音「么」(me)，需发清晰的前元音 e。',
      isHardForChinese: false
    },
    writingTip: {
      hiraStrokes: 2, hiraGuide: '第一笔左斜弧竖；第二笔自右上方撇下，向右上大回环后顺势向右下撇收（末尾不绕圈）。',
      kataStrokes: 2, kataGuide: '第一笔长撇；第二笔于撇画中部交叉写长点（注意与首笔为横的「ナ」区分）。'
    },
    confusableWith: ['nu', 'a', 'no', 'na'],
    words: [
      { kana: 'めいれい', kanji: '命令', romaji: 'meirei', meaning: '命令（命=めい）', tag: '同源词' },
      { kana: 'おとめ', kanji: '乙女', romaji: 'otome', meaning: '少女（女=め，本字对应）', tag: '同源词' },
      { kana: 'あめ', kanji: '雨 / 飴', romaji: 'ame', meaning: '雨（①型音） / 饴糖（⓪型音）', tag: '常用词' }
    ]
  },
  {
    id: 'mo', row: 'ma', col: 'o', romaji: 'mo', aliases: ['mo'],
    hiragana: 'も', katakana: 'モ',
    hiraOrigin: {
      kanji: '毛', pinyin: 'máo',
      stages: ['毛', '毛', 'も'],
      evolution: '平假名「も」源于汉字「毛」（古音 mo）的草书。省去「毛」字顶部的首笔平撇，仅留中间两横与竖弯钩。',
      mnemonic: '平片同源于「毛」；省去顶撇后，草书圆转者为「も」，楷化方折者为「モ」。'
    },
    kataOrigin: {
      kanji: '毛', pinyin: 'máo',
      radicalPart: '毛（省去顶撇与尾钩）',
      evolution: '片假名「モ」同样源于汉字「毛」，省去顶部首撇并将竖弯钩写得平直方正。',
      mnemonic: '「毛」字省去首撇：圆笔为「も」，方笔为「モ」，皆读 mo。'
    },
    pronunciation: {
      ipa: '[mo]',
      chineseApprox: '声母 m 拼单元音 o，近似普通话「摸」(mō)，保持唇形固定。',
      pitfall: '无特殊难点。',
      isHardForChinese: false
    },
    writingTip: {
      hiraStrokes: 3, hiraGuide: '注意笔顺：第一笔先写竖弯钩（形似「し」）；第二、三笔再于竖笔上穿过写两道短横。',
      kataStrokes: 3, kataGuide: '第一笔上短横；第二笔中长横；第三笔自上横中部起笔写竖折横。'
    },
    confusableWith: ['shi', 'ki', 'ma'],
    words: [
      { kana: 'もくてき', kanji: '目的', romaji: 'mokuteki', meaning: '目的（目=もく）', tag: '同源词' },
      { kana: 'もんだい', kanji: '問題', romaji: 'mondai', meaning: '问题（问=もん）', tag: '同源词' },
      { kana: 'もも', kanji: '桃', romaji: 'momo', meaning: '桃子', tag: '常用词' }
    ]
  },

  // ======================== や行 (半元音 j) ========================
  {
    id: 'ya', row: 'ya', col: 'a', romaji: 'ya', aliases: ['ya'],
    hiragana: 'や', katakana: 'ヤ',
    hiraOrigin: {
      kanji: '也', pinyin: 'yě',
      stages: ['也', '也', 'や'],
      evolution: '平假名「や」源于汉字「也」（上古音 ya，古与「耶」通用）的草书。横折钩保留，中竖化为右上短点，左竖弯钩化为斜竖穿下。',
      mnemonic: '平片同源于「也」；草书全字为「や」，省去右上短点即为片假名「ヤ」。'
    },
    kataOrigin: {
      kanji: '也', pinyin: 'yě',
      radicalPart: '也（省去中竖点）',
      evolution: '片假名「ヤ」同样源于汉字「也」，在「や」的基础上省去右上角那一点，线条转为劲直。',
      mnemonic: '「也」字简省：平假名「や」去掉右上一点即为「ヤ」(ya)。'
    },
    pronunciation: {
      ipa: '[jä]',
      chineseApprox: '与普通话「呀 / 雅」(yā) 发音一致。',
      pitfall: '无特殊难点。',
      isHardForChinese: false
    },
    writingTip: {
      hiraStrokes: 3, hiraGuide: '第一笔横折圆钩；第二笔右上短点（原「也」字中竖）；第三笔自左上方斜竖穿下。',
      kataStrokes: 2, kataGuide: '第一笔横折撇；第二笔自左上方斜竖穿下。'
    },
    confusableWith: ['ka', 'se'],
    words: [
      { kana: 'やくそく', kanji: '約束', romaji: 'yakusoku', meaning: '约定、诺言（约=やく）', tag: '同源词' },
      { kana: 'やさしい', kanji: '優しい', romaji: 'yasashii', meaning: '温和、亲切', tag: '常用词' },
      { kana: 'やま', kanji: '山', romaji: 'yama', meaning: '山峦', tag: '常用词' }
    ]
  },
  {
    id: 'yu', row: 'ya', col: 'u', romaji: 'yu', aliases: ['yu'],
    hiragana: 'ゆ', katakana: 'ユ',
    hiraOrigin: {
      kanji: '由', pinyin: 'yóu',
      stages: ['由', '由', 'ゆ'],
      evolution: '平假名「ゆ」源于汉字「由」（yóu/yu）的草书。左侧竖画与外框连笔绕成圆弧，正中出头的一竖最后从中央一笔贯穿。',
      mnemonic: '平片同源于「由」；草书保留外框与中竖贯穿之势，读作 yu。'
    },
    kataOrigin: {
      kanji: '由', pinyin: 'yóu',
      radicalPart: '由（局部省变）',
      evolution: '片假名「ユ」同样源于汉字「由」草书的局部楷化，由横折与底部长横构成（底横右端明显出头，可与不出头的「コ」区分）。',
      mnemonic: '源于「由」字，横折加长底座，读作 yu。'
    },
    pronunciation: {
      ipa: '[jɯ]',
      chineseApprox: '半元音 y 拼扁唇元音 u，近似英语 you 但双唇保持平展不撅圆。',
      pitfall: '普通话读「优」(yōu) 时中间带有过渡音 o (i-o-u)；日语「ゆ」中间无 o，直接由 i 滑向扁唇 u。',
      isHardForChinese: true
    },
    writingTip: {
      hiraStrokes: 2, hiraGuide: '第一笔左侧竖下后即刻沿原路向右上大圆弧绕回；第二笔自正中偏右写微弧竖画贯穿底部。',
      kataStrokes: 2, kataGuide: '第一笔横折（略向左下斜）；第二笔底部长横（右端明显长出折笔之外）。'
    },
    confusableWith: ['ko', 'yo', 'wa'],
    words: [
      { kana: 'じゆう', kanji: '自由', romaji: 'jiyuu', meaning: '自由（由=ゆう，本字直接对应）', tag: '同源词' },
      { kana: 'ゆめ', kanji: '夢', romaji: 'yume', meaning: '梦、理想', tag: '常用词' },
      { kana: 'ゆき', kanji: '雪', romaji: 'yuki', meaning: '雪', tag: '常用词' }
    ]
  },
  {
    id: 'yo', row: 'ya', col: 'o', romaji: 'yo', aliases: ['yo'],
    hiragana: 'よ', katakana: 'ヨ',
    hiraOrigin: {
      kanji: '与', pinyin: 'yǔ',
      stages: ['与', '与', 'よ'],
      evolution: '平假名「よ」源于汉字「与」（古同「與」，yǔ/yo）的草书。上部短横保留于右侧，竖折与底横连写为竖画底部打结。',
      mnemonic: '平片同源于「与」；草书打结为「よ」，楷化三横折框为「ヨ」。'
    },
    kataOrigin: {
      kanji: '与', pinyin: 'yǔ',
      radicalPart: '与（三横折框部件）',
      evolution: '片假名「ヨ」同样源于汉字「与」的部件简化，形成朝左开口的三横一竖结构（比「コ」中间多一横）。',
      mnemonic: '源于「与」字，形如反向的字母 E，读作 yo。'
    },
    pronunciation: {
      ipa: '[jo]',
      chineseApprox: '半元音 y 拼单元音 o，近似普通话叹词「哟」(yō)。',
      pitfall: '切勿读作带 u 尾的普通话「有 / 友」(yǒu)，而是纯粹的 y + o。',
      isHardForChinese: false
    },
    writingTip: {
      hiraStrokes: 2, hiraGuide: '注意笔顺：第一笔先写右侧短横；第二笔再自上方起笔竖下，于底部向左绕圈打结收笔。',
      kataStrokes: 3, kataGuide: '第一笔横折；第二笔中短横；第三笔底横封口。'
    },
    confusableWith: ['ko', 'yu', 'ma', 'ho'],
    words: [
      { kana: 'よやく', kanji: '予約', romaji: 'yoyaku', meaning: '预约（予=よ）', tag: '同源词' },
      { kana: 'よる', kanji: '夜', romaji: 'yoru', meaning: '夜晚', tag: '常用词' },
      { kana: 'ようこそ', kanji: 'ようこそ', romaji: 'youkoso', meaning: '欢迎莅临', tag: '常用词' }
    ]
  },

  // ======================== ら行 (齿龈闪音 ɾ) ========================
  {
    id: 'ra', row: 'ra', col: 'a', romaji: 'ra', aliases: ['ra', 'la'],
    hiragana: 'ら', katakana: 'ラ',
    hiraOrigin: {
      kanji: '良', pinyin: 'liáng',
      stages: ['良', '良', 'ら'],
      evolution: '平假名「ら」源于汉字「良」（古音 ra/ryou）的草书。顶部点画完整保留，下部「艮」字草化为左竖加圆弧弯肚。',
      mnemonic: '平片同源于「良」；顶部一点保留，下部连笔成弧为「ら」，上部点横加横撇为「ラ」。'
    },
    kataOrigin: {
      kanji: '良', pinyin: 'liáng',
      radicalPart: '良（上部点横与横撇）',
      evolution: '片假名「ラ」同样源于汉字「良」的上半部分：顶部点画拉平为短横，下部写为横撇（即「フ」顶部加一短横）。',
      mnemonic: '取「良」字上部，「フ」顶加一短横即为「ラ」(ra)。'
    },
    pronunciation: {
      ipa: '[ɾä]',
      chineseApprox: '齿龈闪音。罗马音虽记作 r，但绝非普通话卷舌音 r（如「日」），亦非英语卷舌音，而是舌尖在上齿龈轻轻一弹即刻松开，听感非常接近普通话轻读的边音 l「啦」(lā)。',
      pitfall: '切勿卷舌。直接以普通话发「拉、里、鲁、勒、罗」时的舌尖轻弹动作发音即可自然地道。',
      isHardForChinese: true
    },
    writingTip: {
      hiraStrokes: 2, hiraGuide: '第一笔顶部斜点；第二笔左侧竖下后向右上大圆弧绕肚收笔（顶部为点，可与顶部为横的「ち」区分）。',
      kataStrokes: 2, kataGuide: '第一笔顶部短横；第二笔于下方写横撇「フ」。'
    },
    confusableWith: ['chi', 'u', 'fu', 'wa'],
    words: [
      { kana: 'らいねん', kanji: '来年', romaji: 'rainen', meaning: '明年、来年（来=らい）', tag: '同源词' },
      { kana: 'りょうしん', kanji: '良心 / 両親', romaji: 'ryoushin', meaning: '良心（良=りょう，本字对应） / 双亲', tag: '同源词' },
      { kana: 'らく', kanji: '楽', romaji: 'raku', meaning: '安乐、轻松（乐=らく）', tag: '同源词' }
    ]
  },
  {
    id: 'ri', row: 'ra', col: 'i', romaji: 'ri', aliases: ['ri', 'li'],
    hiragana: 'り', katakana: 'リ',
    hiraOrigin: {
      kanji: '利', pinyin: 'lì',
      stages: ['利', '利', 'り'],
      evolution: '平假名「り」源于汉字「利」（lì）右侧的立刀旁「刂」行草体：左为短竖带小钩，右为长竖弧撇。平片假名完全同源且结体高度一致。',
      mnemonic: '平片同源于「利」(lì) 字右侧的立刀旁「刂」，音形俱同。'
    },
    kataOrigin: {
      kanji: '利', pinyin: 'lì',
      radicalPart: '刂（右侧立刀旁）',
      evolution: '片假名「リ」直接截取汉字「利」右侧的立刀旁「刂」（将平假名左竖末端的挑钩省去即可）。',
      mnemonic: '即汉字「利」(lì) 右侧的立刀旁「刂」，读作 ri (li)。'
    },
    pronunciation: {
      ipa: '[ɾʲi]',
      chineseApprox: '舌尖轻弹上齿龈，近似普通话「利 / 里」(lǐ)。',
      pitfall: '切勿按罗马音 r 读成普通话的「日」(rì)，应读如「利」(li)。',
      isHardForChinese: false
    },
    writingTip: {
      hiraStrokes: 2, hiraGuide: '第一笔左短竖末端微向右上挑（呼应右笔）；第二笔右长竖微弧撇下（分两笔书写最为端正）。',
      kataStrokes: 2, kataGuide: '第一笔左短直竖（不挑钩）；第二笔右长竖撇，同立刀旁「刂」。'
    },
    confusableWith: ['i', 'so', 'n'],
    words: [
      { kana: 'りゆう', kanji: '理由', romaji: 'riyuu', meaning: '理由（理=り，由=ゆう）', tag: '同源词' },
      { kana: 'りよう', kanji: '利用', romaji: 'riyou', meaning: '利用（利=り，本字直接对应）', tag: '同源词' },
      { kana: 'りんご', kanji: '林檎', romaji: 'ringo', meaning: '苹果（古汉语称苹果为林檎）', tag: '同源词' }
    ]
  },
  {
    id: 'ru', row: 'ra', col: 'u', romaji: 'ru', aliases: ['ru', 'lu'],
    hiragana: 'る', katakana: 'ル',
    hiraOrigin: {
      kanji: '留', pinyin: 'liú',
      stages: ['留', '留', 'る'],
      evolution: '平假名「る」源于汉字「留」（古音 ru/ryuu）的草书。上部化为横折撇，下部实心的「田」部草化为大圆弧并在末尾向内绕成一小圈。与「ろ(吕)」对比：「留」下部为实心之「田」，故「る」末尾绕圈；「吕」下部为空心之「口」，故「ろ」末尾不绕圈。',
      mnemonic: '源于「留」字草书，因下部为「田」，故弧肚末端向内留有一圈。'
    },
    kataOrigin: {
      kanji: '流', pinyin: 'liú',
      radicalPart: '流（右下两竖笔）',
      evolution: '片假名「ル」截取自汉字「流」（liú）右下角的两笔（竖撇与竖提），结体形似汉字「儿」的变体。',
      mnemonic: '取「流」(liú) 字右下角两笔，读作 ru (lu)。'
    },
    pronunciation: {
      ipa: '[ɾɯ]',
      chineseApprox: '舌尖轻弹 l 拼扁唇元音 u，近似普通话「路 / 鲁」(lǔ) 而双唇保持平展。',
      pitfall: '不卷舌（勿读作「入」），双唇亦不大幅度前突。',
      isHardForChinese: false
    },
    writingTip: {
      hiraStrokes: 1, hiraGuide: '一笔写成：横折撇至中左部，再向右大圆弧绕肚，于收尾处向内绕出一小圈收笔。',
      kataStrokes: 2, kataGuide: '第一笔左侧竖撇；第二笔右侧直竖向下后向右上提挑。'
    },
    confusableWith: ['ro', 'so', 'wa', 're'],
    words: [
      { kana: 'るす', kanji: '留守', romaji: 'rusu', meaning: '看家、外出不在（留=る，本字直接对应）', tag: '同源词' },
      { kana: 'はる', kanji: '春', romaji: 'haru', meaning: '春天、春季', tag: '常用词' },
      { kana: 'ひる', kanji: '昼', romaji: 'hiru', meaning: '白昼、正午', tag: '常用词' }
    ]
  },
  {
    id: 're', row: 'ra', col: 'e', romaji: 're', aliases: ['re', 'le'],
    hiragana: 'れ', katakana: 'レ',
    hiraOrigin: {
      kanji: '礼', pinyin: 'lǐ',
      stages: ['礼', '礼', 'れ'],
      evolution: '平假名「れ」源于汉字「礼」（繁体「禮」，古音 rei/re）的草书。左侧示字旁化为左竖加折笔，右侧竖弯钩化为向右上外翘之笔。与「ね(祢)」「わ(和)」对比：汉字「礼」右部本就是向外挑出的竖弯钩，故「れ」尾部亦直接向外翘起。',
      mnemonic: '平片同源于「礼」；平假名「れ」右尾随「礼」字右笔向外挑出，片假名「レ」即单取「礼」字右部。'
    },
    kataOrigin: {
      kanji: '礼', pinyin: 'lǐ',
      radicalPart: '乚（礼字右侧偏旁）',
      evolution: '片假名「レ」直接截取汉字「礼」右半边的竖提一笔（亦即「ル」的右半部分）。',
      mnemonic: '取「礼」字右侧一笔即为片假名「レ」(re)。'
    },
    pronunciation: {
      ipa: '[ɾe]',
      chineseApprox: '舌尖轻弹 l 拼前元音 e，近似普通话「累」(lèi) 的起始音（省去尾音 i）。',
      pitfall: '切勿读作央元音「乐」(lè)，需保持前元音舌位。',
      isHardForChinese: true
    },
    writingTip: {
      hiraStrokes: 2, hiraGuide: '第一笔左侧直竖；第二笔横折撇后向右上拱起再竖下，至底部直接向右上方挑出（还原「礼」字右笔）。',
      kataStrokes: 1, kataGuide: '一笔写成：直竖向下后向右上劲健提挑。'
    },
    confusableWith: ['ne', 'wa', 'ru'],
    words: [
      { kana: 'れきし', kanji: '歴史', romaji: 'rekishi', meaning: '历史（历=れき）', tag: '同源词' },
      { kana: 'れいぎ', kanji: '礼儀', romaji: 'reigi', meaning: '礼仪、礼节（礼=れい，本字直接对应）', tag: '同源词' },
      { kana: 'れんあい', kanji: '恋愛', romaji: 'renai', meaning: '恋爱（恋=れん）', tag: '同源词' }
    ]
  },
  {
    id: 'ro', row: 'ra', col: 'o', romaji: 'ro', aliases: ['ro', 'lo'],
    hiragana: 'ろ', katakana: 'ロ',
    hiraOrigin: {
      kanji: '呂', pinyin: 'lǚ',
      stages: ['吕', '吕', 'ろ'],
      evolution: '平假名「ろ」源于汉字「吕」（古音 ro）的草书。上下两个「口」一笔连写为折弧形态，因下部为空心之「口」，故末尾干净收笔而不绕圈。',
      mnemonic: '平片同源于「吕」；双口草书连笔为「ろ」（末尾不绕圈），单取一「口」即为片假名「ロ」。'
    },
    kataOrigin: {
      kanji: '呂', pinyin: 'lǚ',
      radicalPart: '口（吕字取一「口」）',
      evolution: '片假名「ロ」同样源于汉字「吕」，直接截取「吕」字上下双口中的一个「口」，与楷书「口」字完全同形。',
      mnemonic: '取「吕」字之一「口」即为片假名「ロ」(ro)。'
    },
    pronunciation: {
      ipa: '[ɾo]',
      chineseApprox: '舌尖轻弹 l 拼单元音 o，近似普通话「罗」(luó) 省去介音 u 后的直拼。',
      pitfall: '保持单元音 o 口型稳定。',
      isHardForChinese: false
    },
    writingTip: {
      hiraStrokes: 1, hiraGuide: '一笔写成：横折撇至中左部，再向右大圆弧绕肚向左下直接收笔（末尾不绕圈，可与「る」区分）。',
      kataStrokes: 3, kataGuide: '同汉字「口」：左竖、横折、底横封口。'
    },
    confusableWith: ['ru', 'so', 'ko', 'yo'],
    words: [
      { kana: 'ろく', kanji: '六', romaji: 'roku', meaning: '数字六（六=ろく）', tag: '同源词' },
      { kana: 'こころ', kanji: '心', romaji: 'kokoro', meaning: '心、心绪', tag: '常用词' },
      { kana: 'いろ', kanji: '色', romaji: 'iro', meaning: '色彩、颜色', tag: '常用词' }
    ]
  },

  // ======================== わ行 + 拨音 ========================
  {
    id: 'wa', row: 'wa', col: 'a', romaji: 'wa', aliases: ['wa'],
    hiragana: 'わ', katakana: 'ワ',
    hiraOrigin: {
      kanji: '和', pinyin: 'hé / huó',
      stages: ['和', '和', 'わ'],
      evolution: '平假名「わ」源于汉字「和」（训读 wa，如「大和」「和食」）的草书。左侧禾木旁化为左竖加折笔，右侧「口」部化为向内圆润收拢的大弧肚。与「ね(祢)」「れ(礼)」对比：「和」字右侧为圆整之「口」，故「わ」右侧為大圆弧向内收笔。',
      mnemonic: '平片同源于「和」(wa)；右侧对应「和」字的「口」部，故大弧向内收拢。'
    },
    kataOrigin: {
      kanji: '和', pinyin: 'hé / huó',
      radicalPart: '口（和字右侧偏旁省变）',
      evolution: '片假名「ワ」源于汉字「和」右侧「口」部的省笔楷化，由左短竖与横折长撇构成（顶部无点，可与宝盖头的「ウ(宇)」区分）。',
      mnemonic: '源于「和」字右部，较「ウ」省去顶部竖点，读作 wa。'
    },
    pronunciation: {
      ipa: '[ɰä]',
      chineseApprox: '近似普通话「哇 / 蛙」(wā)，但起始时双唇不刻意用力撮圆，而是自然过渡至元音 a。',
      pitfall: '双唇动作轻柔自然。',
      isHardForChinese: false
    },
    writingTip: {
      hiraStrokes: 2, hiraGuide: '第一笔左侧直竖；第二笔横折撇后向右上大圆弧绕肚，向内侧左下方收笔（既不打结亦不外翘）。',
      kataStrokes: 2, kataGuide: '第一笔左侧短竖；第二笔横折长撇（顶部无点）。'
    },
    confusableWith: ['ne', 're', 'u', 'fu', 'ku'],
    words: [
      { kana: 'わたし', kanji: '私', romaji: 'watashi', meaning: '我', tag: '常用词' },
      { kana: 'へいわ', kanji: '平和', romaji: 'heiwa', meaning: '和平（和=わ，本字直接对应）', tag: '同源词' },
      { kana: 'わしょく', kanji: '和食', romaji: 'washoku', meaning: '日本料理（和=わ）', tag: '同源词' }
    ]
  },
  {
    id: 'wo', row: 'wa', col: 'o', romaji: 'wo', aliases: ['wo', 'o'],
    hiragana: 'を', katakana: 'ヲ',
    hiraOrigin: {
      kanji: '遠', pinyin: 'yuǎn',
      stages: ['遠', '遠', 'を'],
      evolution: '平假名「を」源于繁体汉字「遠」（古音 won/wo）的草书。上部「土」化为一横加中折钩，下部走之底化为托在底部的 C 形弧线。',
      mnemonic: '繁体「遠」字草书，下托走之底弧线，现代专作宾格助词。'
    },
    kataOrigin: {
      kanji: '乎', pinyin: 'hū',
      radicalPart: '乎（上部两横与撇）',
      evolution: '片假名「ヲ」源于文言助词汉字「乎」（古音 wo）的上半部分，简化为两横加一长撇（即「フ」内部多加一短横）。',
      mnemonic: '源于文言助词「乎」，与宾格助词功能相合。'
    },
    pronunciation: {
      ipa: '[o]',
      chineseApprox: '现代标准日语中，「を」的实际发音与元音「お」(o) 完全相同，皆读作单元音 [o]；仅在罗马字键盘输入时键入 wo 以示区分。',
      pitfall: '在现代日语中仅作为「宾格助词」（置于宾语之后，如「本を読む」读书），日常词汇中不出现此假名。',
      isHardForChinese: false
    },
    writingTip: {
      hiraStrokes: 3, hiraGuide: '第一笔短横；第二笔自横画中部撇折向下钩住；第三笔自右向左穿入写 C 形底座。',
      kataStrokes: 3, kataGuide: '第一笔上横；第二笔中短横；第三笔自上横右端折下写长撇。'
    },
    confusableWith: ['o', 'a', 'te', 'fu'],
    words: [
      { kana: 'おちゃをのむ', kanji: 'お茶を飲む', romaji: 'ocha wo nomu', meaning: '饮茶（を提示动作宾语「茶」）', tag: '语法助词' },
      { kana: 'ほんをよむ', kanji: '本を読む', romaji: 'hon wo yomu', meaning: '读书（本=书籍）', tag: '语法助词' },
      { kana: 'ゆめをみる', kanji: '夢を見る', romaji: 'yume wo miru', meaning: '做梦', tag: '语法助词' }
    ]
  },
  {
    id: 'n', row: 'n', col: 'a', romaji: 'n', aliases: ['n', 'nn'],
    hiragana: 'ん', katakana: 'ン',
    hiraOrigin: {
      kanji: '无', pinyin: 'wú',
      stages: ['无', '无', 'ん'],
      evolution: '平假名「ん」源于汉字「无」（古同「無」，鼻音尾省变）的草书。一笔写为斜撇折回向右上挑出，形似连写的拉丁字母 n。',
      mnemonic: '「无」字一笔草书，形似字母 n，对应汉语鼻音韵尾。'
    },
    kataOrigin: {
      kanji: '爾', pinyin: 'ěr',
      radicalPart: '尔（左上点与提笔）',
      evolution: '片假名「ン」源于汉字「爾」（尔，古音 ni/n）草书的起笔，结构等同于汉字两点水「冫」：首笔为左上平点，次笔自左下向右上提挑（与源于「曾」头八字点、由上往下撇的「ソ」方向截然相反）。',
      mnemonic: '结构同汉字两点水「冫」：首点平置，次笔由左下向右上提挑（方向同三点水「シ」）。'
    },
    pronunciation: {
      ipa: '[ɴ / m / n / ŋ]',
      chineseApprox: '独立鼻音拍（拨音），对应中古汉语阳声韵尾（-m / -n / -ng）在日语中的遗存。凡普通话带前鼻音 -n 的汉字，日语汉音/吴音几乎皆带拨音「ん」（如：安=あん、信=しん、本=ほん）。',
      pitfall: '「ん」独占完整的一拍时长，且随其后紧邻的辅音发生逆向同化：在 b/p/m 前双唇闭合读 [m]（如 新聞 しんぶん）；在 t/d/n/r/z 前读舌尖前鼻音 [n]（如 安全 あんぜん）；在 k/g 前读舌根后鼻音 [ŋ]（如 漫画 まんが）。',
      isHardForChinese: false
    },
    writingTip: {
      hiraStrokes: 1, hiraGuide: '一笔写成：自右上向左下斜撇，折回中部微拱后再向右下弯转挑起收笔。',
      kataStrokes: 2, kataGuide: '笔顺同汉字两点水「冫」：第一笔左上平点；第二笔自左下向右上长提。'
    },
    confusableWith: ['so', 'shi', 'tsu', 'e', 'ri'],
    words: [
      { kana: 'にほん', kanji: '日本', romaji: 'nihon', meaning: '日本（本=ほん，保留汉语 -n 韵尾）', tag: '同源词' },
      { kana: 'かんじ', kanji: '漢字', romaji: 'kanji', meaning: '汉字（汉 hàn = かん kan）', tag: '同源词' },
      { kana: 'しんぶん', kanji: '新聞', romaji: 'shinbun', meaning: '报纸（新=しん，闻=ぶん）', tag: '同源词' }
    ]
  }
];

// 标准五十音图 5×11 矩阵结构
window.GOJUON_GRID = [
  { rowId: 'a',  rowName: 'あ行', phoneticDesc: '元音行 · 五母音基准',   cells: ['a', 'i', 'u', 'e', 'o'] },
  { rowId: 'ka', rowName: 'か行', phoneticDesc: '清软腭塞音 k + 元音',   cells: ['ka', 'ki', 'ku', 'ke', 'ko'] },
  { rowId: 'sa', rowName: 'さ行', phoneticDesc: '清擦音 s / ɕ + 元音',   cells: ['sa', 'shi', 'su', 'se', 'so'] },
  { rowId: 'ta', rowName: 'た行', phoneticDesc: '清塞/塞擦音 t / tɕ / ts', cells: ['ta', 'chi', 'tsu', 'te', 'to'] },
  { rowId: 'na', rowName: 'な行', phoneticDesc: '齿龈鼻音 n + 元音',     cells: ['na', 'ni', 'nu', 'ne', 'no'] },
  { rowId: 'ha', rowName: 'は行', phoneticDesc: '清擦音 h / ç / ɸ',     cells: ['ha', 'hi', 'fu', 'he', 'ho'] },
  { rowId: 'ma', rowName: 'ま行', phoneticDesc: '双唇鼻音 m + 元音',     cells: ['ma', 'mi', 'mu', 'me', 'mo'] },
  { rowId: 'ya', rowName: 'や行', phoneticDesc: '硬腭近音 j + 元音',     cells: ['ya', null, 'yu', null, 'yo'] },
  { rowId: 'ra', rowName: 'ら行', phoneticDesc: '齿龈闪音 ɾ（近中文 l）', cells: ['ra', 'ri', 'ru', 're', 'ro'] },
  { rowId: 'wa', rowName: 'わ行', phoneticDesc: '软腭近音 ɰ 与宾格助词',  cells: ['wa', null, null, null, 'wo'] },
  { rowId: 'n',  rowName: '拨音', phoneticDesc: '独立鼻音拍（古汉语 -n）', cells: ['n', null, null, null, null] }
];
