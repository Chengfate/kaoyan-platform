import { useState, useMemo, useEffect } from 'react';

interface QA {
  q: string;
  a: string;
}

const SECTIONS: { title: string; icon: string; items: QA[] }[] = [
  {
    title: '报考基础',
    icon: '📝',
    items: [
      {
        q: '考研的报考条件是什么？',
        a: '（1）国家承认学历的应届本科毕业生（含普通高校、成人高校、普通高校举办的成人高等学历教育等应届本科毕业生）及自学考试和网络教育届时可毕业本科生，录取当年入学前须取得国家承认的本科毕业证书。\n（2）具有国家承认的大学本科毕业学历的人员。\n（3）获得国家承认的高职高专毕业学历后满2年或2年以上的人员，以及国家承认学历的本科结业生，按本科毕业同等学力身份报考。\n（4）已获硕士、博士学位的人员。',
      },
      {
        q: '全日制和非全日制研究生有什么区别？',
        a: '全日制研究生：全脱产在校学习，学制一般为2-3年，毕业发放全日制学历证书。奖学金覆盖面大。\n非全日制研究生：采取多种方式和灵活时间安排学习，毕业发放"非全日制"标注的学历证书。一般不享受奖学金，学费较高。\n两者考试招生依据国家统一要求，执行相同的政策和标准，考试难度和分数线完全一致。',
      },
      {
        q: '学术型硕士（学硕）和专业型硕士（专硕）的区别？',
        a: '学硕：以学术研究为导向，偏重理论和研究，培养大学教师和科研机构研究人员。学制一般3年。\n专硕：以专业实践为导向，偏重应用和实践，培养特定职业领域的高层次人才。学制一般2-3年。\n常见区别：学硕考英语一（较难），专硕多考英语二；学硕可以直博，专硕一般需要考博；学硕学费较低，专硕学费较高。\n近年来专硕招生规模持续扩大，2025年专硕招生占比已超60%。',
      },
      {
        q: '考研每年什么时候报名？什么时候考试？',
        a: '预报名：每年9月24日-27日（仅限应届生）\n正式报名：每年10月10日-31日\n现场/网上确认：每年11月上旬\n初试：每年12月倒数第二个周末\n初试成绩公布：次年2月中旬\n国家线公布：次年3月中旬\n复试/调剂：次年3月-4月\n录取结果：次年5月-6月',
      },
      {
        q: '什么是推免（保研）？对统考生有什么影响？',
        a: '推免即推荐优秀应届本科毕业生免试攻读硕士学位研究生，俗称"保研"。具有推免资格的高校（全国约367所）可以在每年9-10月推荐优秀本科生免初试直接参加复试。\n对统考生的影响：各高校的推免比例逐年上升，尤其是985/211名校的热门专业，推免占比可达50%-80%，使得统考招生名额减少，竞争更加激烈。在择校时一定要关注目标院校的推免比例。',
      },
      {
        q: '专升本、自考本科可以考研吗？',
        a: '可以。专升本和自考本科属于国家承认的本科学历，可以直接以本科生身份报考。\n需要注意几点：\n（1）需在录取当年入学前取得本科毕业证书\n（2）部分院校/专业可能有附加要求（如英语四级、发表论文等），需查看目标院校的招生简章\n（3）复试时部分导师可能更关注本科背景，建议在初试中争取更高分数以增加竞争力\n（4）成人教育应届本科生按同等学力报考，复试时通常需要加试两门专业课',
      },
      {
        q: '考研可以同时报考多个学校吗？',
        a: '不可以。考研报名时只能填报一个招生单位的一个专业。\n- 初试结束后，如果成绩达到国家线但未被第一志愿录取，可以通过"调剂"系统申请其他院校\n- 调剂时最多可同时填报3个平行志愿\n- 建议在报名前充分调研，选定一个最匹配的目标，避免把希望都寄托在调剂上',
      },
    ],
  },
  {
    title: '分数线解读',
    icon: '📊',
    items: [
      {
        q: '什么是国家线？A区和B区是什么意思？',
        a: '国家线是教育部统一划定的进入复试的基本分数要求，是考研的"及格线"。\nA区（一区）：北京、天津、上海、江苏、浙江、广东等21个省份，教育资源丰富，分数线较高。\nB区（二区）：内蒙古、广西、海南、贵州、云南、西藏、甘肃、青海、宁夏、新疆共10个省份，教育资源相对薄弱，分数线比A区低3-10分。\n国家线分为总分线和单科线，两者必须同时过线才有复试资格。',
      },
      {
        q: '什么是院校复试线？和自主划线有什么关系？',
        a: '院校复试线：各招生单位在国家线基础上，结合本校招生计划和报考情况确定的进入复试的具体分数线。通常高于或等于国家线。\n自主划线：经教育部批准的34所高校（全部为985）可以自主确定进入复试的分数线，不受国家线限制。这些学校的复试线通常公布更早（2月底-3月初），且分数线一般高于国家线。\n自主划线高校包括：北大、清华、人大、复旦、上交、浙大、南大、中科大、哈工大、西交等34所。',
      },
      {
        q: '总分线和单科线有什么区别？',
        a: '总分线：初试所有科目成绩总和的最低要求，满分500分（管理类联考为300分）。\n单科线：每个科目单独的最低分数要求。一般分为：\n- 政治/英语线（满分100分科目）：通常在35-55分之间\n- 数学/专业课线（满分150分科目）：通常在55-90分之间\n考生必须同时满足总分线和所有单科线，任一科目未过线均不能进入复试。每年都有大量考生因单科差1-2分而遗憾落榜。',
      },
      {
        q: '国家线近几年的变化趋势如何？',
        a: '2020-2024年国家线整体呈上升趋势：\n- 教育学：2020年331分 → 2024年350分（+19分，涨幅最大）\n- 文学：2020年355分 → 2024年365分（+10分）\n- 经济学：2020年343分 → 2024年346分（小幅波动）\n- 工学：2020年264分 → 2024年273分（+9分）\n- 管理学：2020年345分 → 2024年347分（小幅波动）\n报考人数虽有所下降（2024年438万→2025年388万），但热门专业竞争依然激烈。',
      },
      {
        q: '过了国家线就一定能参加复试吗？',
        a: '不一定。过国家线只是获得了复试和调剂的基本资格。\n是否进入复试取决于：\n（1）是否达到报考院校的院校复试线（通常高于国家线）\n（2）在报考专业中的排名是否在复试名额范围内（复试比例通常1:1.2~1:1.5）\n例如：某985计算机专业招10人，复试比例1:1.5，国家线273分，但院校复试线可能是350分，且只有排名前15的考生能进入复试。',
      },
      {
        q: '什么是"专项计划"？有哪些专项计划分数线？',
        a: '专项计划是国家面向特定群体的招生倾斜政策，通常有单独的分数线（一般低于普通国家线）：\n1. 少数民族骨干计划：面向少数民族考生，需回定向地区就业\n2. 退役大学生士兵计划：面向退伍大学生，专项专用\n3. 强军计划：面向军队在职干部\n4. 援藏计划：面向西藏地区考生\n5. 农村专项计划：面向农村和贫困地区考生\n每种计划有独立的报考条件和录取名额，需在报名时选择对应类别。',
      },
    ],
  },
  {
    title: '考试科目',
    icon: '📚',
    items: [
      {
        q: '考研初试都考哪些科目？',
        a: '考研初试分为公共课和专业课两部分：\n公共课（由教育部统一命题）：\n- 思想政治理论（100分）：所有考生必考\n- 外国语（100分）：绝大多数为英语，部分专业可选俄语、日语等\n- 数学（150分）：理工科、经济类等专业考数学一/二/三\n专业课（150分）：分为统考和自命题两种\n- 统考专业课：计算机408、教育学311、心理学312、法律硕士等\n- 自命题专业课：大多数高校自主命题',
      },
      {
        q: '数学一、数学二、数学三有什么区别？',
        a: '数学一（最难）：考试内容最多，含高等数学56%、线性代数22%、概率论与数理统计22%。适用于力学、机械、电气、计算机等工学专业。\n数学二（中等）：不含概率论，高等数学78%、线性代数22%。适用于纺织、食品、轻工等工学专业。\n数学三（相对简单）：含微积分60%、线性代数20%、概率论与数理统计20%，偏重经济应用。适用于经济学、管理学等。\n不考数学的专业：哲学、法学、教育学、文学、历史学、艺术学、部分管理学等。',
      },
      {
        q: '英语一和英语二的区别？',
        a: '英语一（较难）：\n- 完形填空10分，阅读理解60分（含新题型），翻译10分（英译中5句），写作20分\n- 词汇要求约5500词，超纲词约3%\n- 阅读文章多选自外刊，长难句多\n英语二（相对简单）：\n- 完形填空10分，阅读理解50分，翻译15分（段落翻译），写作25分\n- 词汇要求约5500词，超纲词较少\n- 阅读文章题材较实用\n学硕一般考英语一，专硕一般考英语二（部分名校专硕也要求英语一，需以招生简章为准）。',
      },
      {
        q: '什么是统考专业课？有哪些常见的统考科目？',
        a: '统考专业课是由教育部统一命题的专业课，全国使用同一套试卷，评分标准统一。常见统考科目：\n- 408 计算机学科专业基础综合（难度最大，四门课综合）\n- 311 教育学专业基础综合\n- 312 心理学专业基础综合\n- 313 历史学专业基础综合\n- 306 临床医学综合能力（西医）\n- 397/398/497/498 法律硕士联考\n- 396 经济类综合能力\n非统考专业课由各招生单位自行命题，考试范围和难度因校而异，需针对性复习。',
      },
      {
        q: '考研总分是多少？各科分数怎么分配？',
        a: '绝大多数专业满分500分：\n- 思想政治理论：100分（第一天上午 8:30-11:30）\n- 外国语：100分（第一天下午 14:00-17:00）\n- 业务课一（数学或专业课）：150分（第二天上午 8:30-11:30）\n- 业务课二（专业课）：150分（第二天下午 14:00-17:00）\n特殊专业：\n- 管理类联考（MBA/MPA等）满分300分：管理类综合200分 + 英语二100分\n- 超过3小时的考试科目在第三天进行（如建筑设计等）',
      },
    ],
  },
  {
    title: '复试与调剂',
    icon: '🔄',
    items: [
      {
        q: '复试一般考什么？流程是怎样的？',
        a: '复试一般包括以下环节：\n1. 专业课笔试（100分）：考试范围通常比初试更聚焦\n2. 综合面试（100-150分）：自我介绍、专业问题、科研规划等\n3. 英语听力与口语（50-100分）：英文自我介绍、简单对话、文献翻译\n4. 部分专业有实验操作或机试（如计算机专业的上机编程）\n复试比例一般为1:1.2~1:1.5（即复试人数：录取人数），部分热门专业可达1:2甚至更高。\n总成绩 = 初试成绩×权重 + 复试成绩×权重（常见初试60%+复试40%，或初试70%+复试30%）。',
      },
      {
        q: '什么是调剂？什么情况下可以调剂？',
        a: '调剂是指在第一志愿未被录取的情况下，考生可以申请转入其他院校或专业的复试。\n调剂基本条件：\n- 初试成绩过国家线（总分线和单科线都要过）\n- 调入专业与第一志愿专业相同或相近（同属一个学科门类）\n- 初试科目与调入专业初试科目相同或相近\n- 学硕可以调剂到专硕，专硕一般不可以调剂到学硕\n- A区考生可以调剂到B区，B区考生只能在B区内调剂\n调剂一般在每年3月下旬-4月底通过研招网调剂系统进行，整个调剂过程竞争非常激烈，建议尽早准备备选方案。',
      },
      {
        q: '复试面试中面试官最看重什么？',
        a: '1. 专业基础（30%）：对本学科核心知识的掌握程度\n2. 科研潜力（25%）：科研经历、学术论文、学科竞赛\n3. 思维逻辑（15%）：分析问题、解决问题的能力\n4. 学习态度（10%）：是否踏实、有上进心\n5. 英语能力（10%）：英文文献阅读和口头表达能力\n6. 综合素养（10%）：沟通能力、团队合作、心理素质\n面试过程中保持自信、诚实，不懂的问题可以直接说明并表达学习的意愿，切忌不懂装懂。',
      },
      {
        q: '34所自主划线高校的复试有什么特点？',
        a: '1. 复试线公布更早（通常在2月底-3月初），早于国家线\n2. 复试线一般高于国家线，热门专业可高出30-80分\n3. 复试比例较高，部分专业可达1:2以上\n4. 复试内容更多样，除笔试面试外可能还有实验操作、机试等\n5. 复试权重更大，部分学校初试60%+复试40%\n6. 推免占比较高，统考竞争激烈\n7. 面试更注重科研能力和学术潜力，而非仅看初试分数',
      },
      {
        q: '复试前需要联系导师吗？怎么联系？',
        a: '建议在初试成绩公布后、复试前联系意向导师，但要注意方式方法：\n（1）时机：初试成绩出来后，确认自己能进入复试再联系\n（2）方式：首选邮件，简洁正式，附上个人简历和成绩单\n（3）内容：简单自我介绍 → 表达对导师研究方向的兴趣 → 简述相关经历 → 询问是否有招生名额\n（4）切忌：同时群发多个导师（同一学院老师会互相沟通）、频繁骚扰、送礼\n不联系导师也不影响复试结果，联系只是加分项而非必须项。',
      },
      {
        q: '调剂系统的操作流程是怎样的？',
        a: 'Step 1：研招网调剂系统开放后（一般3月下旬），登录查询缺额信息\nStep 2：填报调剂志愿（最多同时3个，每个有锁定期12-36小时）\nStep 3：等待招生单位查看并发送复试通知\nStep 4：在系统中确认接受复试通知，按时参加复试\nStep 5：复试通过后，在系统中确认"待录取"通知（只能确认1个）\n关键提示：\n- 调剂名额先到先得，建议系统一开放就填报\n- 已被一志愿录取的考生不能再参加调剂\n- 确认待录取后，调剂流程结束，不可再参加其他复试',
      },
    ],
  },
  {
    title: '择校策略',
    icon: '🎯',
    items: [
      {
        q: '考研择校应该考虑哪些因素？',
        a: '建议从以下六个维度综合考量：\n1. 院校层次（985/211/双一流）和专业实力（学科评估等级）\n2. 地理位置：直接影响就业、实习资源和生活成本\n3. 报录比和分数线：衡量竞争激烈程度的核心指标\n4. 个人实力：GPA、本科院校、科研竞赛经历\n5. 就业前景：目标专业的行业认可度、校友网络\n6. 推免比例：影响统考招生名额的多少\n一般建议选择比自己本科高一档的院校（如普通一本→211、211→985），即"跳一跳够得着"的目标。',
      },
      {
        q: '什么是"大小年"？如何利用这个规律择校？',
        a: '"大小年"指同一院校专业在不同年份分数线波动的现象。\n大年：某年前一年的分数线较低，导致大量考生扎堆报考，分数线大幅上涨\n小年：某年前一年的分数线过高劝退考生，导致报考人数减少，分数线回落\n利用策略：\n- 查看目标院校近5年的分数线变化，寻找波动规律\n- 避免扎堆报考去年分数线较低的院校\n- 关注新开设的专业/方向，第一年通常分数线较低\n- 不要过度依赖大小年规律，综合性评估更重要',
      },
      {
        q: '报录比多少算正常？报录比多少算难考？',
        a: '报录比 = 报考人数 ÷ 录取人数（不含推免），是衡量竞争激烈程度的核心指标：\n- 3:1 以下：相对容易，认真备考上岸概率大\n- 3:1 ~ 8:1：正常难度，需要系统复习\n- 8:1 ~ 15:1：较难，竞争激烈，需要充分准备\n- 15:1 ~ 30:1：很难，热门院校热门专业\n- 30:1 以上：地狱难度，如北大光华、清华计算机等顶级专业\n注意：全国平均报录比约3.5:1，即每3.5个考生中录取1人。名校热门专业（如CS、金融）报录比常超20:1。',
      },
      {
        q: '跨专业考研需要注意什么？',
        a: '1. 了解目标专业的报考限制：部分专业（如临床医学、法律硕士（法学））有本科专业限制\n2. 评估自身基础：跨考幅度越大（如文科跨工科），难度越大，需要更多时间准备\n3. 专业课是关键：跨考生最大的短板在专业课，建议提前1-1.5年开始准备\n4. 复试中可能面临更多质疑：需要充分展示跨专业的学习动机和能力\n5. 建议选择跨度适中的专业：如数学跨计算机、英语跨翻译、经济跨金融等\n6. 关注院校是否有针对跨考生的加试要求',
      },
      {
        q: '本科院校不好（双非）会影响考研吗？',
        a: '客观来说，部分985/211院校在复试中确实存在"本科歧视"现象，但不是普遍情况。\n如何降低影响：\n- 初试分数尽量考高，高分可以很大程度上弥补本科劣势\n- 选择相对公平的院校（如中科院系统、部分985高校明确表示不歧视双非）\n- 科研竞赛、论文发表等硬成果比本科出身更有说服力\n- 复试面试中展现出扎实的专业基础和清晰的科研规划\n实际上每年都有大量双非学生考上985/211研究生，关键在于充分的准备。',
      },
      {
        q: '应该选好学校的冷门专业还是一般学校的热门专业？',
        a: '这取决于你的职业规划：\n选好学校冷门专业适合：\n- 看重学校牌子（考公、选调、部分国企）\n- 想跨行业就业，专业对口要求不高\n- 计划读博，看重学术平台和导师资源\n选一般学校热门专业适合：\n- 专业壁垒强，就业高度依赖专业技能（如医学、法学）\n- 已有明确行业方向，需要对口学历\n- 热门专业在一般学校可能也有不错的校企合作\n折中策略：选择学科评估等级高但整体排名一般的学校（即"专业强校"），兼顾专业实力和上岸概率。',
      },
    ],
  },
  {
    title: '数据与术语',
    icon: '📖',
    items: [
      {
        q: '考研常用术语对照表',
        a: '报录比：报考人数÷录取人数（不含推免），衡量竞争程度\n推免/保研：推荐优秀应届本科毕业生免试攻读研究生\n国家线：教育部统一划定的进入复试最低要求\n院校线/复试线：各招生单位在国家线基础上确定的复试分数线\n自主划线：34所985高校自行划定的复试分数线\n调剂：未被第一志愿录取时申请转入其他院校专业\n同等学力：非本科毕业生以同等能力水平报考的条件\n学硕/专硕：学术型硕士/专业型硕士\n全日制/非全：全脱产学习/在职方式学习\n差额复试：复试人数多于录取人数，比例通常1:1.2~1:1.5\n初试/复试：全国统一笔试/院校组织的面试+笔试\n学科评估：教育部对各学科综合实力的评估等级（A+/A/A-/B+/B/B-/C+/C/C-）',
      },
      {
        q: '考研数据要去哪里查？',
        a: '推荐渠道：\n1. 研招网（yz.chsi.com.cn）：官方报名平台，查询院校专业目录、国家线、调剂信息\n2. 各院校研究生院官网：最权威的招生简章、复试线、录取名单\n3. 中国教育在线（kaoyan.eol.cn）：历年分数线、报录比汇总\n4. 学科评估结果（中国学位与研究生教育信息网）：查询各专业学科排名\n5. 考研论坛/社群：获取在读研究生一手经验，但需甄别信息真伪',
      },
      {
        q: '初试成绩怎么计算？',
        a: '满分500分：\n- 思想政治理论：100分\n- 外国语（英语/俄语/日语等）：100分\n- 业务课一（数学或专业课）：150分\n- 业务课二（专业课）：150分\n部分专业考2门业务课（各150分），不考数学。\n管理类联考满分300分：管理类综合能力200分+英语二100分。',
      },
      {
        q: '考研的几个关键时间节点有哪些？',
        a: '以下为典型时间线（以2025年12月初试为例）：\n- 3-5月：确定目标院校和专业，开始一轮复习\n- 7-9月：各院校发布招生简章和专业目录，确认考试科目是否有变动\n- 9月24-27日：应届生预报名\n- 10月10-31日：正式报名（所有考生）\n- 11月上旬：网上/现场确认\n- 12月倒数第二个周末：初试\n- 次年2月中旬：初试成绩公布\n- 3月中旬：国家线公布\n- 3月下旬-4月：复试 + 调剂系统开放\n- 5-6月：录取结果公布，调档\n- 9月：研究生入学',
      },
    ],
  },
  {
    title: '备考规划',
    icon: '📅',
    items: [
      {
        q: '考研复习应该如何规划时间？',
        a: '常规备考周期为8-12个月，分为四个阶段：\n第一阶段（3-6月）基础期：\n- 英语：背单词（每天100+）、学习长难句、开始做早年阅读真题\n- 数学：过完高数、线代、概率论的基础教材，做课后习题\n- 专业课：通读参考书目1-2遍，建立知识框架\n第二阶段（7-8月）强化期（暑假黄金期）：\n- 英语：刷真题阅读（每天2篇+精析）\n- 政治：开始系统学习，配合1000题\n- 数学：强化讲义+大量刷题\n- 专业课：整理笔记，做院校真题\n第三阶段（9-10月）提升期：\n- 全面刷真题，开始模拟考试\n- 政治主攻选择题，开始背分析题素材\n第四阶段（11-12月）冲刺期：\n- 全真模拟考试（严格计时）\n- 背诵政治分析题、英语作文模板\n- 查漏补缺，回顾错题',
      },
      {
        q: '各科目推荐什么复习资料？',
        a: '政治：\n- 教材：肖秀荣《精讲精练》+《1000题》\n- 冲刺：肖秀荣《8套卷》《4套卷》（分析题押题必背）\n英语：\n- 单词：红宝书 或 墨墨背单词APP\n- 真题：张剑《黄皮书》（历年真题+详解）\n- 作文：王江涛《高分写作》\n数学：\n- 教材：同济版高数+线代，浙大版概率论\n- 辅导：李永乐《复习全书》+《线性代数辅导讲义》\n- 真题：张宇《真题大全解》或李林《880题》\n计算机408：\n- 王道《考研复习指导》四本（数据结构/计组/OS/计网）',
      },
      {
        q: '考研政治什么时候开始复习比较好？',
        a: '政治不宜过早开始，建议7-8月开始：\n- 7-8月：看视频课+教材，配合刷《1000题》（第一遍）\n- 9-10月：二刷《1000题》错题，开始做真题选择题\n- 11月：做《肖八》选择题，开始背诵分析题素材\n- 12月：背《肖四》分析题（重中之重！），回顾所有错题\n注意：\n- 选择题是政治拉分的关键（占50分），主观题大家背同样的资料分数差距不大\n- 政治目标是过线+不拖后腿，不需要投入过多时间\n- 北京、上海等"旱区"主观题压分较严重，更需选择题拿高分',
      },
      {
        q: '考研英语怎么复习最高效？',
        a: '英语复习的核心是"单词+真题"，其他都是辅助：\n1. 单词（贯穿全程）：每天坚持背单词，至少要过3遍，重点记忆真题高频词\n2. 阅读理解（最重要，占40分）：\n   - 每篇真题阅读做完后精析：逐句翻译→分析长难句→总结题型\n   - 先做早年真题（2000-2010），再做近年真题（2011-2024）\n   - 留最近3年真题做考前模拟\n3. 作文（占25-30分）：\n   - 10月开始准备，整理自己的模板而非死背范文\n   - 大作文+小作文各准备3-5个万能框架\n4. 完形填空+新题型+翻译：10月后集中练习即可，不需要花太多时间',
      },
    ],
  },
];

export default function KnowledgePage() {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [search, setSearch] = useState('');
  const [activeSection, setActiveSection] = useState(0);

  const toggle = (key: string) => {
    setExpanded(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const expandAll = () => {
    const all: Record<string, boolean> = {};
    SECTIONS.forEach((sec, si) => {
      sec.items.forEach((_, qi) => { all[`${si}-${qi}`] = true; });
    });
    setExpanded(all);
  };

  const collapseAll = () => {
    setExpanded({});
  };

  // Search filtering
  const filteredSections = useMemo(() => {
    if (!search.trim()) return SECTIONS;
    const kw = search.trim().toLowerCase();
    return SECTIONS.map(sec => ({
      ...sec,
      items: sec.items.filter(
        item => item.q.toLowerCase().includes(kw) || item.a.toLowerCase().includes(kw)
      ),
    })).filter(sec => sec.items.length > 0);
  }, [search]);

  // Auto-expand all when searching, collapse when clearing
  const hasSearch = search.trim().length > 0;

  // Highlight search keyword in text
  const highlightText = (text: string) => {
    if (!search.trim()) return text;
    const kw = search.trim();
    const escaped = kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const parts = text.split(new RegExp(`(${escaped})`, 'gi'));
    return parts.map((part, i) =>
      part.toLowerCase() === kw.toLowerCase()
        ? `<mark class="bg-yellow-200 rounded px-0.5">${part}</mark>`
        : part
    ).join('');
  };

  // Track which section is visible for quick nav
  useEffect(() => {
    if (hasSearch) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const idx = parseInt(entry.target.getAttribute('data-section-index') || '0');
            setActiveSection(idx);
          }
        });
      },
      { rootMargin: '-100px 0px -60% 0px' }
    );

    const elements = document.querySelectorAll('[data-section-index]');
    elements.forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, [hasSearch, filteredSections]);

  const scrollToSection = (index: number) => {
    const el = document.querySelector(`[data-section-index="${index}"]`);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const expandedCount = Object.values(expanded).filter(Boolean).length;
  const totalCount = SECTIONS.reduce((sum, s) => sum + s.items.length, 0);

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-xl p-8 text-white">
        <h1 className="text-2xl font-bold">考研常识问题解析</h1>
        <p className="mt-2 text-emerald-100 text-sm">全面了解考研基础知识，从报考到录取全流程解读</p>
        {/* Header Search */}
        <div className="mt-5 max-w-lg">
          <div className="relative">
            <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-emerald-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="搜索问题或答案关键词..."
              className="w-full pl-10 pr-10 py-3 rounded-xl text-gray-800 text-sm outline-none border-0 shadow-lg"
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                ✕
              </button>
            )}
          </div>
          {search && (
            <p className="text-emerald-200 text-xs mt-2">
              找到 {filteredSections.reduce((s, sec) => s + sec.items.length, 0)} 个匹配结果
              （共 {totalCount} 个问题）
            </p>
          )}
        </div>
      </div>

      <div className="flex gap-6">
        {/* Quick Navigation Sidebar */}
        <aside className="hidden lg:block w-48 shrink-0">
          <div className="sticky top-6 space-y-1">
            <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">快速导航</div>
            {SECTIONS.map((section, si) => (
              <button
                key={si}
                onClick={() => scrollToSection(si)}
                className={`w-full text-left px-3 py-1.5 rounded-lg text-sm transition-colors ${
                  activeSection === si && !hasSearch
                    ? 'bg-emerald-50 text-emerald-700 font-medium'
                    : 'text-gray-500 hover:bg-gray-50'
                }`}
              >
                <span className="mr-2">{section.icon}</span>
                {section.title}
                {search && (
                  <span className="ml-1 text-xs text-emerald-500">
                    ({filteredSections.find(fs => fs.title === section.title)?.items.length || 0})
                  </span>
                )}
              </button>
            ))}
            <div className="pt-3 mt-3 border-t border-gray-100">
              <button
                onClick={expandAll}
                className="w-full text-left px-3 py-1.5 rounded-lg text-sm text-gray-500 hover:bg-gray-50 transition-colors"
              >
                📖 展开全部
              </button>
              <button
                onClick={collapseAll}
                className="w-full text-left px-3 py-1.5 rounded-lg text-sm text-gray-500 hover:bg-gray-50 transition-colors"
              >
                📕 收起全部
              </button>
            </div>
            <div className="text-xs text-gray-400 px-3 pt-2">
              已展开 {expandedCount}/{totalCount}
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex-1 min-w-0 space-y-4">
          {/* Mobile: expand/collapse buttons */}
          <div className="lg:hidden flex gap-2 mb-2">
            <button onClick={expandAll}
              className="flex-1 py-2 text-sm text-center text-emerald-600 border border-emerald-200 hover:bg-emerald-50 rounded-lg transition-colors">
              展开全部 ({totalCount})
            </button>
            <button onClick={collapseAll}
              className="flex-1 py-2 text-sm text-center text-gray-500 border border-gray-200 hover:bg-gray-50 rounded-lg transition-colors">
              收起全部
            </button>
          </div>

          {/* Quick-jump pills (mobile) */}
          <div className="lg:hidden flex gap-1.5 overflow-x-auto pb-2 scrollbar-hide">
            {SECTIONS.map((section, si) => (
              <button
                key={si}
                onClick={() => scrollToSection(si)}
                className={`shrink-0 px-2.5 py-1 rounded-full text-xs transition-colors ${
                  activeSection === si && !hasSearch
                    ? 'bg-emerald-100 text-emerald-700 font-medium'
                    : 'bg-gray-100 text-gray-500'
                }`}
              >
                {section.icon} {section.title}
              </button>
            ))}
          </div>

          {filteredSections.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-200 p-16 text-center text-gray-400">
              <div className="text-4xl mb-4">🔍</div>
              <p className="font-medium text-gray-500">未找到相关问题</p>
              <p className="text-sm mt-1">尝试使用其他关键词搜索</p>
              <button onClick={() => setSearch('')} className="mt-4 text-blue-500 hover:text-blue-600 text-sm">
                清除搜索
              </button>
            </div>
          ) : (
            filteredSections.map((section, si) => (
              <div
                key={si}
                data-section-index={si}
                className="bg-white rounded-xl border border-gray-200 overflow-hidden"
              >
                <div className="px-6 py-4 bg-gray-50 border-b border-gray-100 flex items-center gap-3">
                  <span className="text-xl">{section.icon}</span>
                  <h2 className="font-bold text-gray-800">{section.title}</h2>
                  <span className="text-xs text-gray-400 ml-auto">{section.items.length} 个问题</span>
                </div>
                <div className="divide-y divide-gray-100">
                  {section.items.map((item, qi) => {
                    const key = `${si}-${qi}`;
                    const isOpen = hasSearch || expanded[key];
                    return (
                      <div key={key}>
                        <button
                          onClick={() => toggle(key)}
                          className="w-full px-6 py-4 text-left flex items-start gap-3 hover:bg-gray-50/50 transition-colors group"
                        >
                          <span className={`mt-1 text-xs transition-transform text-gray-400 group-hover:text-gray-600 ${isOpen ? 'rotate-90' : ''}`}>
                            ▶
                          </span>
                          <span className={`flex-1 text-sm font-medium transition-colors ${isOpen ? 'text-blue-600' : 'text-gray-700'}`}
                            dangerouslySetInnerHTML={{ __html: highlightText(item.q) }}
                          />
                          {!hasSearch && !isOpen && (
                            <span className="text-xs text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity">展开</span>
                          )}
                        </button>
                        {isOpen && (
                          <div className="px-6 pb-4 pl-12">
                            <div
                              className="bg-blue-50/50 border border-blue-100 rounded-lg p-4 text-sm text-gray-700 leading-relaxed whitespace-pre-line"
                              dangerouslySetInnerHTML={{ __html: highlightText(item.a) }}
                            />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
