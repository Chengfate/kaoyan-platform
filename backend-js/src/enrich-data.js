import db from './database.js';

// ============================================================
// 全国有硕士点高校完整数据 + 详细录取数据
// ============================================================

// --- 补全 211 高校（缺失的 52 所）---
const MISSING_211 = [
  // === 北京 (补) ===
  { name:'北京工业大学', short_name:'北工大', code:'10005', province:'北京', city:'朝阳区', tier:'211', category:'理工', is_self_rated:0, website:'https://www.bjut.edu.cn/' },
  { name:'北京科技大学', short_name:'北科大', code:'10008', province:'北京', city:'海淀区', tier:'211', category:'理工', is_self_rated:0, website:'https://www.ustb.edu.cn/' },
  { name:'北京化工大学', short_name:'北化', code:'10010', province:'北京', city:'朝阳区', tier:'211', category:'理工', is_self_rated:0, website:'https://www.buct.edu.cn/' },
  { name:'北京林业大学', short_name:'北林', code:'10022', province:'北京', city:'海淀区', tier:'211', category:'农林', is_self_rated:0, website:'https://www.bjfu.edu.cn/' },
  { name:'北京中医药大学', short_name:'北中医', code:'10026', province:'北京', city:'朝阳区', tier:'211', category:'医药', is_self_rated:0, website:'https://www.bucm.edu.cn/' },
  { name:'北京体育大学', short_name:'北体', code:'10043', province:'北京', city:'海淀区', tier:'211', category:'体育', is_self_rated:0, website:'https://www.bsu.edu.cn/' },
  { name:'中国地质大学(北京)', short_name:'地大北京', code:'11415', province:'北京', city:'海淀区', tier:'211', category:'理工', is_self_rated:0, website:'https://www.cugb.edu.cn/' },
  { name:'中国石油大学(北京)', short_name:'中石大北京', code:'11414', province:'北京', city:'昌平区', tier:'211', category:'理工', is_self_rated:0, website:'https://www.cup.edu.cn/' },
  { name:'中国矿业大学(北京)', short_name:'矿大北京', code:'11413', province:'北京', city:'海淀区', tier:'211', category:'理工', is_self_rated:0, website:'https://www.cumtb.edu.cn/' },
  { name:'中央音乐学院', short_name:'央音', code:'10045', province:'北京', city:'西城区', tier:'211', category:'艺术', is_self_rated:0, website:'https://www.ccom.edu.cn/' },
  // === 天津 (补) ===
  { name:'天津医科大学', short_name:'天医', code:'10062', province:'天津', city:'和平区', tier:'211', category:'医药', is_self_rated:0, website:'https://www.tmu.edu.cn/' },
  { name:'河北工业大学', short_name:'河工大', code:'10080', province:'天津', city:'北辰区', tier:'211', category:'理工', is_self_rated:0, website:'https://www.hebut.edu.cn/' },
  // === 河北 ===
  { name:'华北电力大学(保定)', short_name:'华电保定', code:'10079', province:'河北', city:'保定市', tier:'211', category:'理工', is_self_rated:0, website:'https://www.ncepu.edu.cn/' },
  // === 山西 ===
  { name:'太原理工大学', short_name:'太原理工', code:'10112', province:'山西', city:'太原市', tier:'211', category:'理工', is_self_rated:0, website:'https://www.tyut.edu.cn/' },
  // === 内蒙古 ===
  { name:'内蒙古大学', short_name:'内大', code:'10126', province:'内蒙古', city:'呼和浩特市', tier:'211', category:'综合', is_self_rated:0, website:'https://www.imu.edu.cn/' },
  // === 辽宁 (补) ===
  { name:'辽宁大学', short_name:'辽大', code:'10140', province:'辽宁', city:'沈阳市', tier:'211', category:'综合', is_self_rated:0, website:'https://www.lnu.edu.cn/' },
  { name:'大连海事大学', short_name:'大连海事', code:'10151', province:'辽宁', city:'大连市', tier:'211', category:'理工', is_self_rated:0, website:'https://www.dlmu.edu.cn/' },
  // === 吉林 (补) ===
  { name:'东北师范大学', short_name:'东北师大', code:'10200', province:'吉林', city:'长春市', tier:'211', category:'师范', is_self_rated:0, website:'https://www.nenu.edu.cn/' },
  { name:'延边大学', short_name:'延大', code:'10184', province:'吉林', city:'延吉市', tier:'211', category:'综合', is_self_rated:0, website:'https://www.ybu.edu.cn/' },
  // === 黑龙江 (补) ===
  { name:'哈尔滨工程大学', short_name:'哈工程', code:'10217', province:'黑龙江', city:'哈尔滨市', tier:'211', category:'理工', is_self_rated:0, website:'https://www.hrbeu.edu.cn/' },
  { name:'东北林业大学', short_name:'东北林大', code:'10225', province:'黑龙江', city:'哈尔滨市', tier:'211', category:'农林', is_self_rated:0, website:'https://www.nefu.edu.cn/' },
  { name:'东北农业大学', short_name:'东北农大', code:'10224', province:'黑龙江', city:'哈尔滨市', tier:'211', category:'农林', is_self_rated:0, website:'https://www.neau.edu.cn/' },
  // === 上海 (补) ===
  { name:'东华大学', short_name:'东华', code:'10255', province:'上海', city:'松江区', tier:'211', category:'理工', is_self_rated:0, website:'https://www.dhu.edu.cn/' },
  { name:'上海外国语大学', short_name:'上外', code:'10271', province:'上海', city:'虹口区', tier:'211', category:'语言', is_self_rated:0, website:'https://www.shisu.edu.cn/' },
  // === 江苏 (补) ===
  { name:'中国矿业大学', short_name:'矿大', code:'10290', province:'江苏', city:'徐州市', tier:'211', category:'理工', is_self_rated:0, website:'https://www.cumt.edu.cn/' },
  { name:'河海大学', short_name:'河海', code:'10294', province:'江苏', city:'南京市', tier:'211', category:'理工', is_self_rated:0, website:'https://www.hhu.edu.cn/' },
  { name:'江南大学', short_name:'江南', code:'10295', province:'江苏', city:'无锡市', tier:'211', category:'理工', is_self_rated:0, website:'https://www.jiangnan.edu.cn/' },
  { name:'南京农业大学', short_name:'南农', code:'10307', province:'江苏', city:'南京市', tier:'211', category:'农林', is_self_rated:0, website:'https://www.njau.edu.cn/' },
  { name:'中国药科大学', short_name:'药大', code:'10316', province:'江苏', city:'南京市', tier:'211', category:'医药', is_self_rated:0, website:'https://www.cpu.edu.cn/' },
  { name:'南京师范大学', short_name:'南师大', code:'10319', province:'江苏', city:'南京市', tier:'211', category:'师范', is_self_rated:0, website:'https://www.njnu.edu.cn/' },
  // === 安徽 (补) ===
  { name:'合肥工业大学', short_name:'合工大', code:'10359', province:'安徽', city:'合肥市', tier:'211', category:'理工', is_self_rated:0, website:'https://www.hfut.edu.cn/' },
  { name:'安徽大学', short_name:'安大', code:'10357', province:'安徽', city:'合肥市', tier:'211', category:'综合', is_self_rated:0, website:'https://www.ahu.edu.cn/' },
  // === 福建 (补) ===
  { name:'福州大学', short_name:'福大', code:'10386', province:'福建', city:'福州市', tier:'211', category:'理工', is_self_rated:0, website:'https://www.fzu.edu.cn/' },
  // === 江西 ===
  { name:'南昌大学', short_name:'昌大', code:'10403', province:'江西', city:'南昌市', tier:'211', category:'综合', is_self_rated:0, website:'https://www.ncu.edu.cn/' },
  // === 山东 (补) ===
  { name:'中国石油大学(华东)', short_name:'中石大华东', code:'10425', province:'山东', city:'青岛市', tier:'211', category:'理工', is_self_rated:0, website:'https://www.upc.edu.cn/' },
  // === 河南 (补) ===
  { name:'郑州大学', short_name:'郑大', code:'10459', province:'河南', city:'郑州市', tier:'211', category:'综合', is_self_rated:0, website:'https://www.zzu.edu.cn/' },
  // === 湖北 (补) ===
  { name:'中国地质大学(武汉)', short_name:'地大武汉', code:'10491', province:'湖北', city:'武汉市', tier:'211', category:'理工', is_self_rated:0, website:'https://www.cug.edu.cn/' },
  { name:'华中农业大学', short_name:'华中农大', code:'10504', province:'湖北', city:'武汉市', tier:'211', category:'农林', is_self_rated:0, website:'https://www.hzau.edu.cn/' },
  { name:'华中师范大学', short_name:'华中师大', code:'10511', province:'湖北', city:'武汉市', tier:'211', category:'师范', is_self_rated:0, website:'https://www.ccnu.edu.cn/' },
  // === 湖南 (补) ===
  { name:'湖南师范大学', short_name:'湖南师大', code:'10542', province:'湖南', city:'长沙市', tier:'211', category:'师范', is_self_rated:0, website:'https://www.hunnu.edu.cn/' },
  // === 广东 (补) ===
  { name:'华南农业大学', short_name:'华农', code:'10564', province:'广东', city:'广州市', tier:'211', category:'农林', is_self_rated:0, website:'https://www.scau.edu.cn/' },
  // === 广西 ===
  { name:'广西大学', short_name:'西大', code:'10593', province:'广西', city:'南宁市', tier:'211', category:'综合', is_self_rated:0, website:'https://www.gxu.edu.cn/' },
  // === 海南 ===
  { name:'海南大学', short_name:'海大', code:'10589', province:'海南', city:'海口市', tier:'211', category:'综合', is_self_rated:0, website:'https://www.hainanu.edu.cn/' },
  // === 重庆 (补) ===
  { name:'西南大学', short_name:'西大', code:'10635', province:'重庆', city:'北碚区', tier:'211', category:'综合', is_self_rated:0, website:'https://www.swu.edu.cn/' },
  // === 四川 (补) ===
  { name:'四川农业大学', short_name:'川农', code:'10626', province:'四川', city:'雅安市', tier:'211', category:'农林', is_self_rated:0, website:'https://www.sicau.edu.cn/' },
  // === 贵州 ===
  { name:'贵州大学', short_name:'贵大', code:'10657', province:'贵州', city:'贵阳市', tier:'211', category:'综合', is_self_rated:0, website:'https://www.gzu.edu.cn/' },
  // === 云南 ===
  { name:'云南大学', short_name:'云大', code:'10673', province:'云南', city:'昆明市', tier:'211', category:'综合', is_self_rated:0, website:'https://www.ynu.edu.cn/' },
  // === 西藏 ===
  { name:'西藏大学', short_name:'藏大', code:'10694', province:'西藏', city:'拉萨市', tier:'211', category:'综合', is_self_rated:0, website:'https://www.utibet.edu.cn/' },
  // === 陕西 (补) ===
  { name:'长安大学', short_name:'长安', code:'10710', province:'陕西', city:'西安市', tier:'211', category:'理工', is_self_rated:0, website:'https://www.chd.edu.cn/' },
  { name:'西北大学', short_name:'西北大', code:'10697', province:'陕西', city:'西安市', tier:'211', category:'综合', is_self_rated:0, website:'https://www.nwu.edu.cn/' },
  { name:'陕西师范大学', short_name:'陕师大', code:'10718', province:'陕西', city:'西安市', tier:'211', category:'师范', is_self_rated:0, website:'https://www.snnu.edu.cn/' },
  // === 甘肃 (补) ===
  { name:'甘肃农业大学', short_name:'甘农大', code:'10733', province:'甘肃', city:'兰州市', tier:'211', category:'农林', is_self_rated:0, website:'https://www.gsau.edu.cn/' },
  // === 青海 ===
  { name:'青海大学', short_name:'青大', code:'10743', province:'青海', city:'西宁市', tier:'211', category:'综合', is_self_rated:0, website:'https://www.qhu.edu.cn/' },
  // === 宁夏 ===
  { name:'宁夏大学', short_name:'宁大', code:'10749', province:'宁夏', city:'银川市', tier:'211', category:'综合', is_self_rated:0, website:'https://www.nxu.edu.cn/' },
  // === 新疆 ===
  { name:'新疆大学', short_name:'新大', code:'10755', province:'新疆', city:'乌鲁木齐市', tier:'211', category:'综合', is_self_rated:0, website:'https://www.xju.edu.cn/' },
  { name:'石河子大学', short_name:'石大', code:'10759', province:'新疆', city:'石河子市', tier:'211', category:'综合', is_self_rated:0, website:'https://www.shzu.edu.cn/' },
];

// --- 补全剩余的 双一流 高校 ---
const MISSING_SHUANGYILIU = [
  { name:'北京协和医学院', short_name:'协和', code:'10023', province:'北京', city:'东城区', tier:'双一流', category:'医药', is_self_rated:0, website:'https://www.pumc.edu.cn/' },
  { name:'外交学院', short_name:'外交学院', code:'10040', province:'北京', city:'西城区', tier:'双一流', category:'语言', is_self_rated:0, website:'https://www.cfau.edu.cn/' },
  { name:'中国人民公安大学', short_name:'公大', code:'10041', province:'北京', city:'西城区', tier:'双一流', category:'政法', is_self_rated:0, website:'https://www.ppsuc.edu.cn/' },
  { name:'中央美术学院', short_name:'央美', code:'10047', province:'北京', city:'朝阳区', tier:'双一流', category:'艺术', is_self_rated:0, website:'https://www.cafa.edu.cn/' },
  { name:'中央戏剧学院', short_name:'中戏', code:'10048', province:'北京', city:'东城区', tier:'双一流', category:'艺术', is_self_rated:0, website:'https://www.chntheatre.edu.cn/' },
  { name:'中国音乐学院', short_name:'国音', code:'10046', province:'北京', city:'朝阳区', tier:'双一流', category:'艺术', is_self_rated:0, website:'https://www.ccmusic.edu.cn/' },
  { name:'天津工业大学', short_name:'天工大', code:'10058', province:'天津', city:'西青区', tier:'双一流', category:'理工', is_self_rated:0, website:'https://www.tiangong.edu.cn/' },
  { name:'天津中医药大学', short_name:'天中医', code:'10063', province:'天津', city:'静海区', tier:'双一流', category:'医药', is_self_rated:0, website:'https://www.tjutcm.edu.cn/' },
  { name:'山西大学', short_name:'山大', code:'10108', province:'山西', city:'太原市', tier:'双一流', category:'综合', is_self_rated:0, website:'https://www.sxu.edu.cn/' },
  { name:'南京医科大学', short_name:'南医大', code:'10312', province:'江苏', city:'南京市', tier:'双一流', category:'医药', is_self_rated:0, website:'https://www.njmu.edu.cn/' },
  { name:'南京林业大学', short_name:'南林', code:'10298', province:'江苏', city:'南京市', tier:'双一流', category:'农林', is_self_rated:0, website:'https://www.njfu.edu.cn/' },
  { name:'南京信息工程大学', short_name:'南信大', code:'10300', province:'江苏', city:'南京市', tier:'双一流', category:'理工', is_self_rated:0, website:'https://www.nuist.edu.cn/' },
  { name:'广州医科大学', short_name:'广医', code:'10570', province:'广东', city:'广州市', tier:'双一流', category:'医药', is_self_rated:0, website:'https://www.gzhmu.edu.cn/' },
  { name:'南方医科大学', short_name:'南方医', code:'12121', province:'广东', city:'广州市', tier:'双一流', category:'医药', is_self_rated:0, website:'https://www.smu.edu.cn/' },
  { name:'华南农业大学', short_name:'华农', code:'10564', province:'广东', city:'广州市', tier:'双一流', category:'农林', is_self_rated:0, website:'https://www.scau.edu.cn/' },
  { name:'成都理工大学', short_name:'成理', code:'10616', province:'四川', city:'成都市', tier:'双一流', category:'理工', is_self_rated:0, website:'https://www.cdut.edu.cn/' },
  { name:'成都中医药大学', short_name:'成中医', code:'10633', province:'四川', city:'成都市', tier:'双一流', category:'医药', is_self_rated:0, website:'https://www.cdutcm.edu.cn/' },
  { name:'西南石油大学', short_name:'西南石油', code:'10615', province:'四川', city:'成都市', tier:'双一流', category:'理工', is_self_rated:0, website:'https://www.swpu.edu.cn/' },
  { name:'上海中医药大学', short_name:'上中医', code:'10268', province:'上海', city:'浦东新区', tier:'双一流', category:'医药', is_self_rated:0, website:'https://www.shutcm.edu.cn/' },
  { name:'上海海洋大学', short_name:'上海海洋', code:'10264', province:'上海', city:'浦东新区', tier:'双一流', category:'农林', is_self_rated:0, website:'https://www.shou.edu.cn/' },
  { name:'上海音乐学院', short_name:'上音', code:'10278', province:'上海', city:'徐汇区', tier:'双一流', category:'艺术', is_self_rated:0, website:'https://www.shcmusic.edu.cn/' },
  { name:'上海体育大学', short_name:'上体', code:'10277', province:'上海', city:'杨浦区', tier:'双一流', category:'体育', is_self_rated:0, website:'https://www.sus.edu.cn/' },
  { name:'宁波大学', short_name:'宁大', code:'11646', province:'浙江', city:'宁波市', tier:'双一流', category:'综合', is_self_rated:0, website:'https://www.nbu.edu.cn/' },
  { name:'中国美术学院', short_name:'国美', code:'10355', province:'浙江', city:'杭州市', tier:'双一流', category:'艺术', is_self_rated:0, website:'https://www.caa.edu.cn/' },
  { name:'河南农业大学', short_name:'河南农大', code:'10466', province:'河南', city:'郑州市', tier:'双一流', category:'农林', is_self_rated:0, website:'https://www.henau.edu.cn/' },
  { name:'湖南科技大学', short_name:'湖南科大', code:'10534', province:'湖南', city:'湘潭市', tier:'双一流', category:'理工', is_self_rated:0, website:'https://www.hnust.edu.cn/' },
  { name:'安徽理工大学', short_name:'安徽理工', code:'10361', province:'安徽', city:'淮南市', tier:'双一流', category:'理工', is_self_rated:0, website:'https://www.aust.edu.cn/' },
];

// --- 各省主要具有硕士点的高校 ---
const PROVINCIAL_SCHOOLS = [
  // ===== 北京 (30+所) =====
  { name:'首都医科大学', short_name:'首医', code:'10025', province:'北京', city:'丰台区', tier:'普通一本', category:'医药', is_self_rated:0, website:'https://www.ccmu.edu.cn/' },
  { name:'首都经济贸易大学', short_name:'首经贸', code:'10038', province:'北京', city:'丰台区', tier:'普通一本', category:'财经', is_self_rated:0, website:'https://www.cueb.edu.cn/' },
  { name:'北京工商大学', short_name:'北工商', code:'10011', province:'北京', city:'海淀区', tier:'普通一本', category:'财经', is_self_rated:0, website:'https://www.btbu.edu.cn/' },
  { name:'北方工业大学', short_name:'北方工大', code:'10009', province:'北京', city:'石景山区', tier:'普通一本', category:'理工', is_self_rated:0, website:'https://www.ncut.edu.cn/' },
  { name:'北京建筑大学', short_name:'北建大', code:'10016', province:'北京', city:'西城区', tier:'普通一本', category:'理工', is_self_rated:0, website:'https://www.bucea.edu.cn/' },
  { name:'北京信息科技大学', short_name:'北京信息科大', code:'11232', province:'北京', city:'海淀区', tier:'普通一本', category:'理工', is_self_rated:0, website:'https://www.bistu.edu.cn/' },
  { name:'北京服装学院', short_name:'北服', code:'10012', province:'北京', city:'朝阳区', tier:'普通一本', category:'理工', is_self_rated:0, website:'https://www.bift.edu.cn/' },
  { name:'北京印刷学院', short_name:'北印', code:'10015', province:'北京', city:'大兴区', tier:'普通一本', category:'理工', is_self_rated:0, website:'https://www.bigc.edu.cn/' },
  { name:'北京石油化工学院', short_name:'北石化', code:'10017', province:'北京', city:'大兴区', tier:'普通一本', category:'理工', is_self_rated:0, website:'https://www.bipt.edu.cn/' },
  { name:'北京农学院', short_name:'北农', code:'10020', province:'北京', city:'昌平区', tier:'普通一本', category:'农林', is_self_rated:0, website:'https://www.bua.edu.cn/' },
  { name:'北京物资学院', short_name:'物资学院', code:'10037', province:'北京', city:'通州区', tier:'普通一本', category:'财经', is_self_rated:0, website:'https://www.bwu.edu.cn/' },
  { name:'北京第二外国语学院', short_name:'北二外', code:'10031', province:'北京', city:'朝阳区', tier:'普通一本', category:'语言', is_self_rated:0, website:'https://www.bisu.edu.cn/' },
  { name:'北京语言大学', short_name:'北语', code:'10032', province:'北京', city:'海淀区', tier:'普通一本', category:'语言', is_self_rated:0, website:'https://www.blcu.edu.cn/' },
  { name:'中国戏曲学院', short_name:'国戏', code:'10049', province:'北京', city:'丰台区', tier:'普通一本', category:'艺术', is_self_rated:0, website:'https://www.nacta.edu.cn/' },
  { name:'北京电影学院', short_name:'北影', code:'10050', province:'北京', city:'海淀区', tier:'普通一本', category:'艺术', is_self_rated:0, website:'https://www.bfa.edu.cn/' },
  { name:'北京舞蹈学院', short_name:'北舞', code:'10051', province:'北京', city:'海淀区', tier:'普通一本', category:'艺术', is_self_rated:0, website:'https://www.bda.edu.cn/' },
  { name:'中国青年政治学院', short_name:'中青政', code:'11625', province:'北京', city:'海淀区', tier:'普通一本', category:'政法', is_self_rated:0, website:'https://www.cyu.edu.cn/' },
  { name:'北京联合大学', short_name:'北京联大', code:'11417', province:'北京', city:'朝阳区', tier:'普通一本', category:'综合', is_self_rated:0, website:'https://www.buu.edu.cn/' },

  // ===== 天津 =====
  { name:'天津科技大学', short_name:'天科大', code:'10057', province:'天津', city:'滨海新区', tier:'普通一本', category:'理工', is_self_rated:0, website:'https://www.tust.edu.cn/' },
  { name:'天津理工大学', short_name:'天理', code:'10060', province:'天津', city:'西青区', tier:'普通一本', category:'理工', is_self_rated:0, website:'https://www.tjut.edu.cn/' },
  { name:'天津师范大学', short_name:'天师大', code:'10065', province:'天津', city:'西青区', tier:'普通一本', category:'师范', is_self_rated:0, website:'https://www.tjnu.edu.cn/' },
  { name:'天津财经大学', short_name:'天财', code:'10070', province:'天津', city:'河西区', tier:'普通一本', category:'财经', is_self_rated:0, website:'https://www.tjufe.edu.cn/' },
  { name:'天津商业大学', short_name:'天商', code:'10069', province:'天津', city:'北辰区', tier:'普通一本', category:'财经', is_self_rated:0, website:'https://www.tjcu.edu.cn/' },
  { name:'天津外国语大学', short_name:'天外', code:'10068', province:'天津', city:'河西区', tier:'普通一本', category:'语言', is_self_rated:0, website:'https://www.tjfsu.edu.cn/' },
  { name:'天津城建大学', short_name:'天城建', code:'10792', province:'天津', city:'西青区', tier:'普通一本', category:'理工', is_self_rated:0, website:'https://www.tcu.edu.cn/' },
  { name:'中国民航大学', short_name:'中航大', code:'10059', province:'天津', city:'东丽区', tier:'普通一本', category:'理工', is_self_rated:0, website:'https://www.cauc.edu.cn/' },

  // ===== 河北 =====
  { name:'河北大学', short_name:'河大', code:'10075', province:'河北', city:'保定市', tier:'普通一本', category:'综合', is_self_rated:0, website:'https://www.hbu.edu.cn/' },
  { name:'河北农业大学', short_name:'河北农大', code:'10086', province:'河北', city:'保定市', tier:'普通一本', category:'农林', is_self_rated:0, website:'https://www.hebau.edu.cn/' },
  { name:'河北师范大学', short_name:'河北师大', code:'10094', province:'河北', city:'石家庄市', tier:'普通一本', category:'师范', is_self_rated:0, website:'https://www.hebtu.edu.cn/' },
  { name:'河北医科大学', short_name:'河北医大', code:'10089', province:'河北', city:'石家庄市', tier:'普通一本', category:'医药', is_self_rated:0, website:'https://www.hebmu.edu.cn/' },
  { name:'河北科技大学', short_name:'河北科大', code:'10082', province:'河北', city:'石家庄市', tier:'普通一本', category:'理工', is_self_rated:0, website:'https://www.hebust.edu.cn/' },
  { name:'石家庄铁道大学', short_name:'石铁大', code:'10107', province:'河北', city:'石家庄市', tier:'普通一本', category:'理工', is_self_rated:0, website:'https://www.stdu.edu.cn/' },
  { name:'华北理工大学', short_name:'华北理工', code:'10081', province:'河北', city:'唐山市', tier:'普通一本', category:'理工', is_self_rated:0, website:'https://www.ncst.edu.cn/' },
  { name:'河北经贸大学', short_name:'河北经贸', code:'11832', province:'河北', city:'石家庄市', tier:'普通一本', category:'财经', is_self_rated:0, website:'https://www.heuet.edu.cn/' },
  { name:'燕京理工学院', short_name:'燕理', code:'13549', province:'河北', city:'廊坊市', tier:'普通一本', category:'综合', is_self_rated:0, website:'https://www.yit.edu.cn/' },

  // ===== 山西 =====
  { name:'中北大学', short_name:'中北', code:'10110', province:'山西', city:'太原市', tier:'普通一本', category:'理工', is_self_rated:0, website:'https://www.nuc.edu.cn/' },
  { name:'山西医科大学', short_name:'山西医大', code:'10114', province:'山西', city:'太原市', tier:'普通一本', category:'医药', is_self_rated:0, website:'https://www.sxmu.edu.cn/' },
  { name:'山西师范大学', short_name:'山西师大', code:'10118', province:'山西', city:'太原市', tier:'普通一本', category:'师范', is_self_rated:0, website:'https://www.sxnu.edu.cn/' },
  { name:'山西财经大学', short_name:'山财', code:'10125', province:'山西', city:'太原市', tier:'普通一本', category:'财经', is_self_rated:0, website:'https://www.sxufe.edu.cn/' },
  { name:'山西农业大学', short_name:'山西农大', code:'10113', province:'山西', city:'晋中市', tier:'普通一本', category:'农林', is_self_rated:0, website:'https://www.sxau.edu.cn/' },

  // ===== 内蒙古 =====
  { name:'内蒙古农业大学', short_name:'内蒙古农大', code:'10129', province:'内蒙古', city:'呼和浩特市', tier:'普通一本', category:'农林', is_self_rated:0, website:'https://www.imau.edu.cn/' },
  { name:'内蒙古师范大学', short_name:'内蒙古师大', code:'10135', province:'内蒙古', city:'呼和浩特市', tier:'普通一本', category:'师范', is_self_rated:0, website:'https://www.imnu.edu.cn/' },
  { name:'内蒙古工业大学', short_name:'内蒙古工大', code:'10128', province:'内蒙古', city:'呼和浩特市', tier:'普通一本', category:'理工', is_self_rated:0, website:'https://www.imut.edu.cn/' },
  { name:'内蒙古科技大学', short_name:'内蒙古科大', code:'10127', province:'内蒙古', city:'包头市', tier:'普通一本', category:'理工', is_self_rated:0, website:'https://www.imust.edu.cn/' },
  { name:'内蒙古民族大学', short_name:'内蒙古民大', code:'10136', province:'内蒙古', city:'通辽市', tier:'普通一本', category:'综合', is_self_rated:0, website:'https://www.imun.edu.cn/' },

  // ===== 辽宁 =====
  { name:'沈阳工业大学', short_name:'沈工大', code:'10142', province:'辽宁', city:'沈阳市', tier:'普通一本', category:'理工', is_self_rated:0, website:'https://www.sut.edu.cn/' },
  { name:'沈阳航空航天大学', short_name:'沈航', code:'10143', province:'辽宁', city:'沈阳市', tier:'普通一本', category:'理工', is_self_rated:0, website:'https://www.sau.edu.cn/' },
  { name:'辽宁工程技术大学', short_name:'辽宁工大', code:'10147', province:'辽宁', city:'阜新市', tier:'普通一本', category:'理工', is_self_rated:0, website:'https://www.lntu.edu.cn/' },
  { name:'沈阳化工大学', short_name:'沈化', code:'10149', province:'辽宁', city:'沈阳市', tier:'普通一本', category:'理工', is_self_rated:0, website:'https://www.syuct.edu.cn/' },
  { name:'大连交通大学', short_name:'大连交大', code:'10150', province:'辽宁', city:'大连市', tier:'普通一本', category:'理工', is_self_rated:0, website:'https://www.djtu.edu.cn/' },
  { name:'大连工业大学', short_name:'大连工大', code:'10152', province:'辽宁', city:'大连市', tier:'普通一本', category:'理工', is_self_rated:0, website:'https://www.dlpu.edu.cn/' },
  { name:'沈阳建筑大学', short_name:'沈建大', code:'10153', province:'辽宁', city:'沈阳市', tier:'普通一本', category:'理工', is_self_rated:0, website:'https://www.sjzu.edu.cn/' },
  { name:'沈阳农业大学', short_name:'沈农', code:'10157', province:'辽宁', city:'沈阳市', tier:'普通一本', category:'农林', is_self_rated:0, website:'https://www.syau.edu.cn/' },
  { name:'中国医科大学', short_name:'中国医大', code:'10159', province:'辽宁', city:'沈阳市', tier:'普通一本', category:'医药', is_self_rated:0, website:'https://www.cmu.edu.cn/' },
  { name:'大连医科大学', short_name:'大连医大', code:'10161', province:'辽宁', city:'大连市', tier:'普通一本', category:'医药', is_self_rated:0, website:'https://www.dmu.edu.cn/' },
  { name:'辽宁中医药大学', short_name:'辽宁中医', code:'10162', province:'辽宁', city:'沈阳市', tier:'普通一本', category:'医药', is_self_rated:0, website:'https://www.lnutcm.edu.cn/' },
  { name:'辽宁师范大学', short_name:'辽宁师大', code:'10165', province:'辽宁', city:'大连市', tier:'普通一本', category:'师范', is_self_rated:0, website:'https://www.lnnu.edu.cn/' },
  { name:'沈阳师范大学', short_name:'沈师大', code:'10166', province:'辽宁', city:'沈阳市', tier:'普通一本', category:'师范', is_self_rated:0, website:'https://www.synu.edu.cn/' },
  { name:'东北财经大学', short_name:'东财', code:'10173', province:'辽宁', city:'大连市', tier:'普通一本', category:'财经', is_self_rated:0, website:'https://www.dufe.edu.cn/' },
  { name:'大连外国语大学', short_name:'大外', code:'10172', province:'辽宁', city:'大连市', tier:'普通一本', category:'语言', is_self_rated:0, website:'https://www.dlufl.edu.cn/' },
  { name:'大连海洋大学', short_name:'大连海洋', code:'10158', province:'辽宁', city:'大连市', tier:'普通一本', category:'理工', is_self_rated:0, website:'https://www.dlou.edu.cn/' },
  { name:'渤海大学', short_name:'渤大', code:'10167', province:'辽宁', city:'锦州市', tier:'普通一本', category:'综合', is_self_rated:0, website:'https://www.bhu.edu.cn/' },

  // ===== 吉林 =====
  { name:'长春理工大学', short_name:'长春理工', code:'10186', province:'吉林', city:'长春市', tier:'普通一本', category:'理工', is_self_rated:0, website:'https://www.cust.edu.cn/' },
  { name:'吉林农业大学', short_name:'吉林农大', code:'10193', province:'吉林', city:'长春市', tier:'普通一本', category:'农林', is_self_rated:0, website:'https://www.jlau.edu.cn/' },
  { name:'长春中医药大学', short_name:'长春中医', code:'10199', province:'吉林', city:'长春市', tier:'普通一本', category:'医药', is_self_rated:0, website:'https://www.ccucm.edu.cn/' },
  { name:'北华大学', short_name:'北华', code:'10201', province:'吉林', city:'吉林市', tier:'普通一本', category:'综合', is_self_rated:0, website:'https://www.beihua.edu.cn/' },
  { name:'吉林师范大学', short_name:'吉林师大', code:'10203', province:'吉林', city:'四平市', tier:'普通一本', category:'师范', is_self_rated:0, website:'https://www.jlnu.edu.cn/' },
  { name:'吉林财经大学', short_name:'吉林财大', code:'10207', province:'吉林', city:'长春市', tier:'普通一本', category:'财经', is_self_rated:0, website:'https://www.jlufe.edu.cn/' },

  // ===== 黑龙江 =====
  { name:'黑龙江大学', short_name:'黑大', code:'10212', province:'黑龙江', city:'哈尔滨市', tier:'普通一本', category:'综合', is_self_rated:0, website:'https://www.hlju.edu.cn/' },
  { name:'哈尔滨理工大学', short_name:'哈理工', code:'10214', province:'黑龙江', city:'哈尔滨市', tier:'普通一本', category:'理工', is_self_rated:0, website:'https://www.hrbust.edu.cn/' },
  { name:'哈尔滨医科大学', short_name:'哈医大', code:'10222', province:'黑龙江', city:'哈尔滨市', tier:'普通一本', category:'医药', is_self_rated:0, website:'https://www.hrbmu.edu.cn/' },
  { name:'哈尔滨商业大学', short_name:'哈商大', code:'10240', province:'黑龙江', city:'哈尔滨市', tier:'普通一本', category:'财经', is_self_rated:0, website:'https://www.hrbcu.edu.cn/' },
  { name:'哈尔滨师范大学', short_name:'哈师大', code:'10231', province:'黑龙江', city:'哈尔滨市', tier:'普通一本', category:'师范', is_self_rated:0, website:'https://www.hrbnu.edu.cn/' },
  { name:'齐齐哈尔大学', short_name:'齐大', code:'10232', province:'黑龙江', city:'齐齐哈尔市', tier:'普通一本', category:'综合', is_self_rated:0, website:'https://www.qqhru.edu.cn/' },
  { name:'佳木斯大学', short_name:'佳大', code:'10222', province:'黑龙江', city:'佳木斯市', tier:'普通一本', category:'综合', is_self_rated:0, website:'https://www.jmsu.edu.cn/' },
  { name:'黑龙江中医药大学', short_name:'黑龙江中医', code:'10228', province:'黑龙江', city:'哈尔滨市', tier:'普通一本', category:'医药', is_self_rated:0, website:'https://www.hljucm.edu.cn/' },

  // ===== 上海 =====
  { name:'上海理工大学', short_name:'上理', code:'10252', province:'上海', city:'杨浦区', tier:'普通一本', category:'理工', is_self_rated:0, website:'https://www.usst.edu.cn/' },
  { name:'上海海事大学', short_name:'上海海事', code:'10254', province:'上海', city:'浦东新区', tier:'普通一本', category:'理工', is_self_rated:0, website:'https://www.shmtu.edu.cn/' },
  { name:'上海电力大学', short_name:'上电', code:'10256', province:'上海', city:'杨浦区', tier:'普通一本', category:'理工', is_self_rated:0, website:'https://www.shiep.edu.cn/' },
  { name:'上海应用技术大学', short_name:'上应', code:'10259', province:'上海', city:'奉贤区', tier:'普通一本', category:'理工', is_self_rated:0, website:'https://www.sit.edu.cn/' },
  { name:'上海工程技术大学', short_name:'上海工程', code:'10856', province:'上海', city:'松江区', tier:'普通一本', category:'理工', is_self_rated:0, website:'https://www.sues.edu.cn/' },
  { name:'上海对外经贸大学', short_name:'上贸', code:'10273', province:'上海', city:'松江区', tier:'普通一本', category:'财经', is_self_rated:0, website:'https://www.suibe.edu.cn/' },
  { name:'华东政法大学', short_name:'华政', code:'10276', province:'上海', city:'松江区', tier:'普通一本', category:'政法', is_self_rated:0, website:'https://www.ecupl.edu.cn/' },
  { name:'上海戏剧学院', short_name:'上戏', code:'10279', province:'上海', city:'静安区', tier:'普通一本', category:'艺术', is_self_rated:0, website:'https://www.sta.edu.cn/' },

  // ===== 江苏 =====
  { name:'江苏科技大学', short_name:'江科大', code:'10289', province:'江苏', city:'镇江市', tier:'普通一本', category:'理工', is_self_rated:0, website:'https://www.just.edu.cn/' },
  { name:'南京工业大学', short_name:'南工大', code:'10291', province:'江苏', city:'南京市', tier:'普通一本', category:'理工', is_self_rated:0, website:'https://www.njtech.edu.cn/' },
  { name:'常州大学', short_name:'常大', code:'10292', province:'江苏', city:'常州市', tier:'普通一本', category:'理工', is_self_rated:0, website:'https://www.cczu.edu.cn/' },
  { name:'南通大学', short_name:'南通大', code:'10304', province:'江苏', city:'南通市', tier:'普通一本', category:'综合', is_self_rated:0, website:'https://www.ntu.edu.cn/' },
  { name:'扬州大学', short_name:'扬大', code:'11117', province:'江苏', city:'扬州市', tier:'普通一本', category:'综合', is_self_rated:0, website:'https://www.yzu.edu.cn/' },
  { name:'南京财经大学', short_name:'南财', code:'10327', province:'江苏', city:'南京市', tier:'普通一本', category:'财经', is_self_rated:0, website:'https://www.nufe.edu.cn/' },
  { name:'南京审计大学', short_name:'南审', code:'11287', province:'江苏', city:'南京市', tier:'普通一本', category:'财经', is_self_rated:0, website:'https://www.nau.edu.cn/' },
  { name:'徐州医科大学', short_name:'徐州医大', code:'10313', province:'江苏', city:'徐州市', tier:'普通一本', category:'医药', is_self_rated:0, website:'https://www.xzhmu.edu.cn/' },
  { name:'江苏师范大学', short_name:'江苏师大', code:'10320', province:'江苏', city:'徐州市', tier:'普通一本', category:'师范', is_self_rated:0, website:'https://www.jsnu.edu.cn/' },
  { name:'南京艺术学院', short_name:'南艺', code:'10331', province:'江苏', city:'南京市', tier:'普通一本', category:'艺术', is_self_rated:0, website:'https://www.nua.edu.cn/' },

  // ===== 浙江 =====
  { name:'浙江理工大学', short_name:'浙理工', code:'10338', province:'浙江', city:'杭州市', tier:'普通一本', category:'理工', is_self_rated:0, website:'https://www.zstu.edu.cn/' },
  { name:'浙江工商大学', short_name:'浙工商', code:'10353', province:'浙江', city:'杭州市', tier:'普通一本', category:'财经', is_self_rated:0, website:'https://www.zjgsu.edu.cn/' },
  { name:'浙江财经大学', short_name:'浙财', code:'11482', province:'浙江', city:'杭州市', tier:'普通一本', category:'财经', is_self_rated:0, website:'https://www.zufe.edu.cn/' },
  { name:'浙江师范大学', short_name:'浙师大', code:'10345', province:'浙江', city:'金华市', tier:'普通一本', category:'师范', is_self_rated:0, website:'https://www.zjnu.edu.cn/' },
  { name:'温州大学', short_name:'温大', code:'10351', province:'浙江', city:'温州市', tier:'普通一本', category:'综合', is_self_rated:0, website:'https://www.wzu.edu.cn/' },
  { name:'温州医科大学', short_name:'温医大', code:'10343', province:'浙江', city:'温州市', tier:'普通一本', category:'医药', is_self_rated:0, website:'https://www.wmu.edu.cn/' },
  { name:'浙江海洋大学', short_name:'浙海大', code:'10340', province:'浙江', city:'舟山市', tier:'普通一本', category:'综合', is_self_rated:0, website:'https://www.zjou.edu.cn/' },
  { name:'浙江农林大学', short_name:'浙农林', code:'10341', province:'浙江', city:'杭州市', tier:'普通一本', category:'农林', is_self_rated:0, website:'https://www.zafu.edu.cn/' },
  { name:'中国计量大学', short_name:'中量大', code:'10356', province:'浙江', city:'杭州市', tier:'普通一本', category:'理工', is_self_rated:0, website:'https://www.cjlu.edu.cn/' },
  { name:'浙江中医药大学', short_name:'浙中医', code:'10344', province:'浙江', city:'杭州市', tier:'普通一本', category:'医药', is_self_rated:0, website:'https://www.zcmu.edu.cn/' },

  // ===== 安徽 =====
  { name:'安徽师范大学', short_name:'安师大', code:'10370', province:'安徽', city:'芜湖市', tier:'普通一本', category:'师范', is_self_rated:0, website:'https://www.ahnu.edu.cn/' },
  { name:'安徽农业大学', short_name:'安徽农大', code:'10364', province:'安徽', city:'合肥市', tier:'普通一本', category:'农林', is_self_rated:0, website:'https://www.ahau.edu.cn/' },
  { name:'安徽医科大学', short_name:'安医大', code:'10366', province:'安徽', city:'合肥市', tier:'普通一本', category:'医药', is_self_rated:0, website:'https://www.ahmu.edu.cn/' },
  { name:'安徽工业大学', short_name:'安工大', code:'10360', province:'安徽', city:'马鞍山市', tier:'普通一本', category:'理工', is_self_rated:0, website:'https://www.ahut.edu.cn/' },
  { name:'安徽财经大学', short_name:'安财', code:'10378', province:'安徽', city:'蚌埠市', tier:'普通一本', category:'财经', is_self_rated:0, website:'https://www.aufe.edu.cn/' },
  { name:'安徽建筑大学', short_name:'安建大', code:'10878', province:'安徽', city:'合肥市', tier:'普通一本', category:'理工', is_self_rated:0, website:'https://www.ahjzu.edu.cn/' },

  // ===== 福建 =====
  { name:'福建农林大学', short_name:'福建农大', code:'10389', province:'福建', city:'福州市', tier:'普通一本', category:'农林', is_self_rated:0, website:'https://www.fafu.edu.cn/' },
  { name:'福建师范大学', short_name:'福建师大', code:'10394', province:'福建', city:'福州市', tier:'普通一本', category:'师范', is_self_rated:0, website:'https://www.fjnu.edu.cn/' },
  { name:'华侨大学', short_name:'华大', code:'10385', province:'福建', city:'厦门市', tier:'普通一本', category:'综合', is_self_rated:0, website:'https://www.hqu.edu.cn/' },
  { name:'集美大学', short_name:'集大', code:'10390', province:'福建', city:'厦门市', tier:'普通一本', category:'综合', is_self_rated:0, website:'https://www.jmu.edu.cn/' },
  { name:'福建医科大学', short_name:'福建医大', code:'10392', province:'福建', city:'福州市', tier:'普通一本', category:'医药', is_self_rated:0, website:'https://www.fjmu.edu.cn/' },
  { name:'福建中医药大学', short_name:'福建中医', code:'10393', province:'福建', city:'福州市', tier:'普通一本', category:'医药', is_self_rated:0, website:'https://www.fjtcm.edu.cn/' },

  // ===== 江西 =====
  { name:'江西师范大学', short_name:'江西师大', code:'10414', province:'江西', city:'南昌市', tier:'普通一本', category:'师范', is_self_rated:0, website:'https://www.jxnu.edu.cn/' },
  { name:'江西财经大学', short_name:'江财', code:'10421', province:'江西', city:'南昌市', tier:'普通一本', category:'财经', is_self_rated:0, website:'https://www.jxufe.edu.cn/' },
  { name:'江西农业大学', short_name:'江西农大', code:'10410', province:'江西', city:'南昌市', tier:'普通一本', category:'农林', is_self_rated:0, website:'https://www.jxau.edu.cn/' },
  { name:'华东交通大学', short_name:'华东交大', code:'10404', province:'江西', city:'南昌市', tier:'普通一本', category:'理工', is_self_rated:0, website:'https://www.ecjtu.edu.cn/' },
  { name:'南昌航空大学', short_name:'昌航', code:'10406', province:'江西', city:'南昌市', tier:'普通一本', category:'理工', is_self_rated:0, website:'https://www.nchu.edu.cn/' },
  { name:'江西理工大学', short_name:'江西理工', code:'10407', province:'江西', city:'赣州市', tier:'普通一本', category:'理工', is_self_rated:0, website:'https://www.jxust.edu.cn/' },
  { name:'东华理工大学', short_name:'东华理工', code:'10405', province:'江西', city:'南昌市', tier:'普通一本', category:'理工', is_self_rated:0, website:'https://www.ecut.edu.cn/' },
  { name:'景德镇陶瓷大学', short_name:'陶大', code:'10408', province:'江西', city:'景德镇市', tier:'普通一本', category:'艺术', is_self_rated:0, website:'https://www.jci.edu.cn/' },

  // ===== 山东 =====
  { name:'青岛大学', short_name:'青大', code:'11065', province:'山东', city:'青岛市', tier:'普通一本', category:'综合', is_self_rated:0, website:'https://www.qdu.edu.cn/' },
  { name:'济南大学', short_name:'济大', code:'10427', province:'山东', city:'济南市', tier:'普通一本', category:'综合', is_self_rated:0, website:'https://www.ujn.edu.cn/' },
  { name:'山东科技大学', short_name:'山科大', code:'10424', province:'山东', city:'青岛市', tier:'普通一本', category:'理工', is_self_rated:0, website:'https://www.sdust.edu.cn/' },
  { name:'山东农业大学', short_name:'山东农大', code:'10434', province:'山东', city:'泰安市', tier:'普通一本', category:'农林', is_self_rated:0, website:'https://www.sdau.edu.cn/' },
  { name:'山东师范大学', short_name:'山东师大', code:'10445', province:'山东', city:'济南市', tier:'普通一本', category:'师范', is_self_rated:0, website:'https://www.sdnu.edu.cn/' },
  { name:'曲阜师范大学', short_name:'曲师大', code:'10446', province:'山东', city:'曲阜市', tier:'普通一本', category:'师范', is_self_rated:0, website:'https://www.qfnu.edu.cn/' },
  { name:'青岛科技大学', short_name:'青科大', code:'10426', province:'山东', city:'青岛市', tier:'普通一本', category:'理工', is_self_rated:0, website:'https://www.qust.edu.cn/' },
  { name:'山东理工大学', short_name:'山理工', code:'10433', province:'山东', city:'淄博市', tier:'普通一本', category:'理工', is_self_rated:0, website:'https://www.sdut.edu.cn/' },
  { name:'山东财经大学', short_name:'山东财大', code:'10456', province:'山东', city:'济南市', tier:'普通一本', category:'财经', is_self_rated:0, website:'https://www.sdufe.edu.cn/' },
  { name:'烟台大学', short_name:'烟大', code:'11066', province:'山东', city:'烟台市', tier:'普通一本', category:'综合', is_self_rated:0, website:'https://www.ytu.edu.cn/' },
  { name:'青岛理工大学', short_name:'青理工', code:'10429', province:'山东', city:'青岛市', tier:'普通一本', category:'理工', is_self_rated:0, website:'https://www.qut.edu.cn/' },
  { name:'山东建筑大学', short_name:'山建大', code:'10430', province:'山东', city:'济南市', tier:'普通一本', category:'理工', is_self_rated:0, website:'https://www.sdjzu.edu.cn/' },
  { name:'青岛农业大学', short_name:'青农', code:'10435', province:'山东', city:'青岛市', tier:'普通一本', category:'农林', is_self_rated:0, website:'https://www.qau.edu.cn/' },
  { name:'鲁东大学', short_name:'鲁东', code:'10451', province:'山东', city:'烟台市', tier:'普通一本', category:'综合', is_self_rated:0, website:'https://www.ldu.edu.cn/' },
  { name:'聊城大学', short_name:'聊大', code:'10447', province:'山东', city:'聊城市', tier:'普通一本', category:'综合', is_self_rated:0, website:'https://www.lcu.edu.cn/' },

  // ===== 河南 =====
  { name:'河南科技大学', short_name:'河南科大', code:'10464', province:'河南', city:'洛阳市', tier:'普通一本', category:'理工', is_self_rated:0, website:'https://www.haust.edu.cn/' },
  { name:'河南理工大学', short_name:'河南理工', code:'10460', province:'河南', city:'焦作市', tier:'普通一本', category:'理工', is_self_rated:0, website:'https://www.hpu.edu.cn/' },
  { name:'河南师范大学', short_name:'河南师大', code:'10476', province:'河南', city:'新乡市', tier:'普通一本', category:'师范', is_self_rated:0, website:'https://www.htu.edu.cn/' },
  { name:'河南工业大学', short_name:'河南工大', code:'10463', province:'河南', city:'郑州市', tier:'普通一本', category:'理工', is_self_rated:0, website:'https://www.haut.edu.cn/' },
  { name:'河南财经政法大学', short_name:'河南财大', code:'10484', province:'河南', city:'郑州市', tier:'普通一本', category:'财经', is_self_rated:0, website:'https://www.huel.edu.cn/' },
  { name:'郑州轻工业大学', short_name:'郑州轻工', code:'10462', province:'河南', city:'郑州市', tier:'普通一本', category:'理工', is_self_rated:0, website:'https://www.zzuli.edu.cn/' },
  { name:'华北水利水电大学', short_name:'华水', code:'10078', province:'河南', city:'郑州市', tier:'普通一本', category:'理工', is_self_rated:0, website:'https://www.ncwu.edu.cn/' },
  { name:'信阳师范大学', short_name:'信阳师大', code:'10477', province:'河南', city:'信阳市', tier:'普通一本', category:'师范', is_self_rated:0, website:'https://www.xynu.edu.cn/' },
  { name:'中原工学院', short_name:'中原工', code:'10465', province:'河南', city:'郑州市', tier:'普通一本', category:'理工', is_self_rated:0, website:'https://www.zut.edu.cn/' },

  // ===== 湖北 =====
  { name:'湖北大学', short_name:'湖北大', code:'10512', province:'湖北', city:'武汉市', tier:'普通一本', category:'综合', is_self_rated:0, website:'https://www.hubu.edu.cn/' },
  { name:'武汉科技大学', short_name:'武科大', code:'10488', province:'湖北', city:'武汉市', tier:'普通一本', category:'理工', is_self_rated:0, website:'https://www.wust.edu.cn/' },
  { name:'湖北工业大学', short_name:'湖北工大', code:'10500', province:'湖北', city:'武汉市', tier:'普通一本', category:'理工', is_self_rated:0, website:'https://www.hbut.edu.cn/' },
  { name:'武汉工程大学', short_name:'武工大', code:'10490', province:'湖北', city:'武汉市', tier:'普通一本', category:'理工', is_self_rated:0, website:'https://www.wit.edu.cn/' },
  { name:'武汉纺织大学', short_name:'武纺', code:'10495', province:'湖北', city:'武汉市', tier:'普通一本', category:'理工', is_self_rated:0, website:'https://www.wtu.edu.cn/' },
  { name:'长江大学', short_name:'长大', code:'10489', province:'湖北', city:'荆州市', tier:'普通一本', category:'综合', is_self_rated:0, website:'https://www.yangtzeu.edu.cn/' },
  { name:'三峡大学', short_name:'三峡大', code:'11075', province:'湖北', city:'宜昌市', tier:'普通一本', category:'综合', is_self_rated:0, website:'https://www.ctgu.edu.cn/' },
  { name:'湖北中医药大学', short_name:'湖北中医', code:'10507', province:'湖北', city:'武汉市', tier:'普通一本', category:'医药', is_self_rated:0, website:'https://www.hbtcm.edu.cn/' },
  { name:'中南民族大学', short_name:'中南民大', code:'10524', province:'湖北', city:'武汉市', tier:'普通一本', category:'民族', is_self_rated:0, website:'https://www.scuec.edu.cn/' },
  { name:'湖北经济学院', short_name:'湖北经院', code:'11600', province:'湖北', city:'武汉市', tier:'普通一本', category:'财经', is_self_rated:0, website:'https://www.hbue.edu.cn/' },

  // ===== 湖南 =====
  { name:'长沙理工大学', short_name:'长理工', code:'10536', province:'湖南', city:'长沙市', tier:'普通一本', category:'理工', is_self_rated:0, website:'https://www.csust.edu.cn/' },
  { name:'湖南农业大学', short_name:'湖南农大', code:'10537', province:'湖南', city:'长沙市', tier:'普通一本', category:'农林', is_self_rated:0, website:'https://www.hunau.edu.cn/' },
  { name:'中南林业科技大学', short_name:'中南林科大', code:'10538', province:'湖南', city:'长沙市', tier:'普通一本', category:'农林', is_self_rated:0, website:'https://www.csuft.edu.cn/' },
  { name:'湖南中医药大学', short_name:'湖南中医', code:'10541', province:'湖南', city:'长沙市', tier:'普通一本', category:'医药', is_self_rated:0, website:'https://www.hnucm.edu.cn/' },
  { name:'南华大学', short_name:'南华', code:'10555', province:'湖南', city:'衡阳市', tier:'普通一本', category:'综合', is_self_rated:0, website:'https://www.usc.edu.cn/' },
  { name:'吉首大学', short_name:'吉首', code:'10531', province:'湖南', city:'吉首市', tier:'普通一本', category:'综合', is_self_rated:0, website:'https://www.jsu.edu.cn/' },

  // ===== 广东 =====
  { name:'广州大学', short_name:'广大', code:'11078', province:'广东', city:'广州市', tier:'普通一本', category:'综合', is_self_rated:0, website:'https://www.gzhu.edu.cn/' },
  { name:'汕头大学', short_name:'汕大', code:'10560', province:'广东', city:'汕头市', tier:'普通一本', category:'综合', is_self_rated:0, website:'https://www.stu.edu.cn/' },
  { name:'广东外语外贸大学', short_name:'广外', code:'11846', province:'广东', city:'广州市', tier:'普通一本', category:'语言', is_self_rated:0, website:'https://www.gdufs.edu.cn/' },
  { name:'广东财经大学', short_name:'广财', code:'10592', province:'广东', city:'广州市', tier:'普通一本', category:'财经', is_self_rated:0, website:'https://www.gdufe.edu.cn/' },
  { name:'东莞理工学院', short_name:'东莞理工', code:'11819', province:'广东', city:'东莞市', tier:'普通一本', category:'理工', is_self_rated:0, website:'https://www.dgut.edu.cn/' },
  { name:'五邑大学', short_name:'五邑', code:'11349', province:'广东', city:'江门市', tier:'普通一本', category:'综合', is_self_rated:0, website:'https://www.wyu.edu.cn/' },
  { name:'广东海洋大学', short_name:'广东海洋', code:'10566', province:'广东', city:'湛江市', tier:'普通一本', category:'综合', is_self_rated:0, website:'https://www.gdou.edu.cn/' },
  { name:'仲恺农业工程学院', short_name:'仲恺', code:'11347', province:'广东', city:'广州市', tier:'普通一本', category:'农林', is_self_rated:0, website:'https://www.zhku.edu.cn/' },
  { name:'广东药科大学', short_name:'广药', code:'10573', province:'广东', city:'广州市', tier:'普通一本', category:'医药', is_self_rated:0, website:'https://www.gdpu.edu.cn/' },
  { name:'广州美术学院', short_name:'广美', code:'10586', province:'广东', city:'广州市', tier:'普通一本', category:'艺术', is_self_rated:0, website:'https://www.gzarts.edu.cn/' },
  { name:'星海音乐学院', short_name:'星海', code:'10587', province:'广东', city:'广州市', tier:'普通一本', category:'艺术', is_self_rated:0, website:'https://www.xhcom.edu.cn/' },
  { name:'广东技术师范大学', short_name:'广技师', code:'10588', province:'广东', city:'广州市', tier:'普通一本', category:'师范', is_self_rated:0, website:'https://www.gpnu.edu.cn/' },

  // ===== 广西 =====
  { name:'广西师范大学', short_name:'广西师大', code:'10602', province:'广西', city:'桂林市', tier:'普通一本', category:'师范', is_self_rated:0, website:'https://www.gxnu.edu.cn/' },
  { name:'广西医科大学', short_name:'广西医大', code:'10598', province:'广西', city:'南宁市', tier:'普通一本', category:'医药', is_self_rated:0, website:'https://www.gxmu.edu.cn/' },
  { name:'桂林电子科技大学', short_name:'桂电', code:'10595', province:'广西', city:'桂林市', tier:'普通一本', category:'理工', is_self_rated:0, website:'https://www.guet.edu.cn/' },
  { name:'广西民族大学', short_name:'广西民大', code:'10608', province:'广西', city:'南宁市', tier:'普通一本', category:'民族', is_self_rated:0, website:'https://www.gxmzu.edu.cn/' },
  { name:'广西中医药大学', short_name:'广西中医', code:'10600', province:'广西', city:'南宁市', tier:'普通一本', category:'医药', is_self_rated:0, website:'https://www.gxtcmu.edu.cn/' },
  { name:'广西财经学院', short_name:'广西财院', code:'11548', province:'广西', city:'南宁市', tier:'普通一本', category:'财经', is_self_rated:0, website:'https://www.gxufe.edu.cn/' },
  { name:'广西科技大学', short_name:'广西科大', code:'10594', province:'广西', city:'柳州市', tier:'普通一本', category:'理工', is_self_rated:0, website:'https://www.gxust.edu.cn/' },

  // ===== 海南 =====
  { name:'海南师范大学', short_name:'海南师大', code:'11658', province:'海南', city:'海口市', tier:'普通一本', category:'师范', is_self_rated:0, website:'https://www.hainnu.edu.cn/' },
  { name:'海南医学院', short_name:'海南医', code:'11810', province:'海南', city:'海口市', tier:'普通一本', category:'医药', is_self_rated:0, website:'https://www.hainmc.edu.cn/' },
  { name:'三亚学院', short_name:'三亚学院', code:'13892', province:'海南', city:'三亚市', tier:'普通一本', category:'综合', is_self_rated:0, website:'https://www.sanyau.edu.cn/' },

  // ===== 重庆 =====
  { name:'重庆交通大学', short_name:'重庆交大', code:'10618', province:'重庆', city:'重庆市', tier:'普通一本', category:'理工', is_self_rated:0, website:'https://www.cqjtu.edu.cn/' },
  { name:'重庆医科大学', short_name:'重医', code:'10631', province:'重庆', city:'重庆市', tier:'普通一本', category:'医药', is_self_rated:0, website:'https://www.cqmu.edu.cn/' },
  { name:'西南政法大学', short_name:'西政', code:'10652', province:'重庆', city:'重庆市', tier:'普通一本', category:'政法', is_self_rated:0, website:'https://www.swupl.edu.cn/' },
  { name:'重庆师范大学', short_name:'重庆师大', code:'10637', province:'重庆', city:'重庆市', tier:'普通一本', category:'师范', is_self_rated:0, website:'https://www.cqnu.edu.cn/' },
  { name:'重庆工商大学', short_name:'重工商', code:'11799', province:'重庆', city:'重庆市', tier:'普通一本', category:'财经', is_self_rated:0, website:'https://www.ctbu.edu.cn/' },
  { name:'四川外国语大学', short_name:'川外', code:'10650', province:'重庆', city:'重庆市', tier:'普通一本', category:'语言', is_self_rated:0, website:'https://www.sisu.edu.cn/' },
  { name:'重庆理工大学', short_name:'重理工', code:'11660', province:'重庆', city:'重庆市', tier:'普通一本', category:'理工', is_self_rated:0, website:'https://www.cqut.edu.cn/' },

  // ===== 四川 =====
  { name:'四川师范大学', short_name:'川师大', code:'10636', province:'四川', city:'成都市', tier:'普通一本', category:'师范', is_self_rated:0, website:'https://www.sicnu.edu.cn/' },
  { name:'西华大学', short_name:'西华', code:'10623', province:'四川', city:'成都市', tier:'普通一本', category:'综合', is_self_rated:0, website:'https://www.xhu.edu.cn/' },
  { name:'西华师范大学', short_name:'西华师大', code:'10638', province:'四川', city:'南充市', tier:'普通一本', category:'师范', is_self_rated:0, website:'https://www.cwnu.edu.cn/' },
  { name:'西南科技大学', short_name:'西南科大', code:'10619', province:'四川', city:'绵阳市', tier:'普通一本', category:'理工', is_self_rated:0, website:'https://www.swust.edu.cn/' },
  { name:'西南民族大学', short_name:'西南民大', code:'10656', province:'四川', city:'成都市', tier:'普通一本', category:'民族', is_self_rated:0, website:'https://www.swun.edu.cn/' },

  // ===== 贵州 =====
  { name:'贵州师范大学', short_name:'贵州师大', code:'10663', province:'贵州', city:'贵阳市', tier:'普通一本', category:'师范', is_self_rated:0, website:'https://www.gznu.edu.cn/' },
  { name:'贵州医科大学', short_name:'贵州医大', code:'10660', province:'贵州', city:'贵阳市', tier:'普通一本', category:'医药', is_self_rated:0, website:'https://www.gmc.edu.cn/' },
  { name:'贵州财经大学', short_name:'贵州财大', code:'10671', province:'贵州', city:'贵阳市', tier:'普通一本', category:'财经', is_self_rated:0, website:'https://www.gzife.edu.cn/' },
  { name:'遵义医科大学', short_name:'遵医', code:'10661', province:'贵州', city:'遵义市', tier:'普通一本', category:'医药', is_self_rated:0, website:'https://www.zmu.edu.cn/' },
  { name:'贵州民族大学', short_name:'贵州民大', code:'10672', province:'贵州', city:'贵阳市', tier:'普通一本', category:'民族', is_self_rated:0, website:'https://www.gzmu.edu.cn/' },

  // ===== 云南 =====
  { name:'昆明理工大学', short_name:'昆工', code:'10674', province:'云南', city:'昆明市', tier:'普通一本', category:'理工', is_self_rated:0, website:'https://www.kmust.edu.cn/' },
  { name:'云南师范大学', short_name:'云南师大', code:'10681', province:'云南', city:'昆明市', tier:'普通一本', category:'师范', is_self_rated:0, website:'https://www.ynnu.edu.cn/' },
  { name:'云南财经大学', short_name:'云南财大', code:'10689', province:'云南', city:'昆明市', tier:'普通一本', category:'财经', is_self_rated:0, website:'https://www.ynufe.edu.cn/' },
  { name:'云南农业大学', short_name:'云南农大', code:'10676', province:'云南', city:'昆明市', tier:'普通一本', category:'农林', is_self_rated:0, website:'https://www.ynau.edu.cn/' },
  { name:'云南民族大学', short_name:'云南民大', code:'10691', province:'云南', city:'昆明市', tier:'普通一本', category:'民族', is_self_rated:0, website:'https://www.ynni.edu.cn/' },
  { name:'昆明医科大学', short_name:'昆医', code:'10678', province:'云南', city:'昆明市', tier:'普通一本', category:'医药', is_self_rated:0, website:'https://www.kmmc.cn/' },
  { name:'西南林业大学', short_name:'西南林大', code:'10677', province:'云南', city:'昆明市', tier:'普通一本', category:'农林', is_self_rated:0, website:'https://www.swfu.edu.cn/' },

  // ===== 西藏 =====
  { name:'西藏民族大学', short_name:'西藏民大', code:'10695', province:'西藏', city:'咸阳市', tier:'普通一本', category:'民族', is_self_rated:0, website:'https://www.xzmu.edu.cn/' },
  { name:'西藏农牧学院', short_name:'西藏农牧', code:'10693', province:'西藏', city:'林芝市', tier:'普通一本', category:'农林', is_self_rated:0, website:'https://www.xza.edu.cn/' },

  // ===== 陕西 =====
  { name:'西安建筑科技大学', short_name:'西建大', code:'10703', province:'陕西', city:'西安市', tier:'普通一本', category:'理工', is_self_rated:0, website:'https://www.xauat.edu.cn/' },
  { name:'西安理工大学', short_name:'西理工', code:'10700', province:'陕西', city:'西安市', tier:'普通一本', category:'理工', is_self_rated:0, website:'https://www.xaut.edu.cn/' },
  { name:'陕西科技大学', short_name:'陕科大', code:'10708', province:'陕西', city:'西安市', tier:'普通一本', category:'理工', is_self_rated:0, website:'https://www.sust.edu.cn/' },
  { name:'西安科技大学', short_name:'西科大', code:'10704', province:'陕西', city:'西安市', tier:'普通一本', category:'理工', is_self_rated:0, website:'https://www.xust.edu.cn/' },
  { name:'西安石油大学', short_name:'西石油', code:'10705', province:'陕西', city:'西安市', tier:'普通一本', category:'理工', is_self_rated:0, website:'https://www.xsyu.edu.cn/' },
  { name:'西安工程大学', short_name:'西工程', code:'10709', province:'陕西', city:'西安市', tier:'普通一本', category:'理工', is_self_rated:0, website:'https://www.xpu.edu.cn/' },
  { name:'西安外国语大学', short_name:'西外', code:'10724', province:'陕西', city:'西安市', tier:'普通一本', category:'语言', is_self_rated:0, website:'https://www.xisu.edu.cn/' },
  { name:'西北政法大学', short_name:'西北政法', code:'10726', province:'陕西', city:'西安市', tier:'普通一本', category:'政法', is_self_rated:0, website:'https://www.nwupl.edu.cn/' },
  { name:'西安邮电大学', short_name:'西邮', code:'11664', province:'陕西', city:'西安市', tier:'普通一本', category:'理工', is_self_rated:0, website:'https://www.xupt.edu.cn/' },
  { name:'延安大学', short_name:'延安大学', code:'10719', province:'陕西', city:'延安市', tier:'普通一本', category:'综合', is_self_rated:0, website:'https://www.yau.edu.cn/' },

  // ===== 甘肃 =====
  { name:'西北师范大学', short_name:'西北师大', code:'10736', province:'甘肃', city:'兰州市', tier:'普通一本', category:'师范', is_self_rated:0, website:'https://www.nwnu.edu.cn/' },
  { name:'兰州理工大学', short_name:'兰州理工', code:'10731', province:'甘肃', city:'兰州市', tier:'普通一本', category:'理工', is_self_rated:0, website:'https://www.lut.edu.cn/' },
  { name:'兰州交通大学', short_name:'兰州交大', code:'10732', province:'甘肃', city:'兰州市', tier:'普通一本', category:'理工', is_self_rated:0, website:'https://www.lzjtu.edu.cn/' },
  { name:'甘肃中医药大学', short_name:'甘肃中医', code:'10735', province:'甘肃', city:'兰州市', tier:'普通一本', category:'医药', is_self_rated:0, website:'https://www.gszy.edu.cn/' },
  { name:'兰州财经大学', short_name:'兰州财大', code:'10741', province:'甘肃', city:'兰州市', tier:'普通一本', category:'财经', is_self_rated:0, website:'https://www.lzufe.edu.cn/' },

  // ===== 青海 =====
  { name:'青海师范大学', short_name:'青海师大', code:'10746', province:'青海', city:'西宁市', tier:'普通一本', category:'师范', is_self_rated:0, website:'https://www.qhnu.edu.cn/' },
  { name:'青海民族大学', short_name:'青海民大', code:'10748', province:'青海', city:'西宁市', tier:'普通一本', category:'民族', is_self_rated:0, website:'https://www.qhmu.edu.cn/' },

  // ===== 宁夏 =====
  { name:'宁夏医科大学', short_name:'宁夏医大', code:'10752', province:'宁夏', city:'银川市', tier:'普通一本', category:'医药', is_self_rated:0, website:'https://www.nxmu.edu.cn/' },
  { name:'北方民族大学', short_name:'北方民大', code:'11407', province:'宁夏', city:'银川市', tier:'普通一本', category:'民族', is_self_rated:0, website:'https://www.nmu.edu.cn/' },

  // ===== 新疆 =====
  { name:'新疆医科大学', short_name:'新疆医大', code:'10760', province:'新疆', city:'乌鲁木齐市', tier:'普通一本', category:'医药', is_self_rated:0, website:'https://www.xjmu.edu.cn/' },
  { name:'新疆师范大学', short_name:'新疆师大', code:'10762', province:'新疆', city:'乌鲁木齐市', tier:'普通一本', category:'师范', is_self_rated:0, website:'https://www.xjnu.edu.cn/' },
  { name:'新疆财经大学', short_name:'新疆财大', code:'10766', province:'新疆', city:'乌鲁木齐市', tier:'普通一本', category:'财经', is_self_rated:0, website:'https://www.xjufe.edu.cn/' },
  { name:'新疆农业大学', short_name:'新疆农大', code:'10758', province:'新疆', city:'乌鲁木齐市', tier:'普通一本', category:'农林', is_self_rated:0, website:'https://www.xjau.edu.cn/' },
];

// --- 科研院所 ---
const RESEARCH_INSTITUTES = [
  { name:'中国科学院计算技术研究所', short_name:'中科院计算所', code:'80138', province:'北京', city:'海淀区', tier:'科研院所', category:'理工', is_self_rated:0, website:'https://www.ict.ac.cn/' },
  { name:'中国科学院软件研究所', short_name:'中科院软件所', code:'80150', province:'北京', city:'海淀区', tier:'科研院所', category:'理工', is_self_rated:0, website:'https://www.iscas.ac.cn/' },
  { name:'中国科学院自动化研究所', short_name:'中科院自动化所', code:'80146', province:'北京', city:'海淀区', tier:'科研院所', category:'理工', is_self_rated:0, website:'https://www.ia.ac.cn/' },
  { name:'中国科学院信息工程研究所', short_name:'中科院信工所', code:'80158', province:'北京', city:'海淀区', tier:'科研院所', category:'理工', is_self_rated:0, website:'https://www.iie.ac.cn/' },
  { name:'中国科学院数学与系统科学研究院', short_name:'中科院数学院', code:'80002', province:'北京', city:'海淀区', tier:'科研院所', category:'理学', is_self_rated:0, website:'https://www.amss.ac.cn/' },
  { name:'中国科学院物理研究所', short_name:'中科院物理所', code:'80008', province:'北京', city:'海淀区', tier:'科研院所', category:'理学', is_self_rated:0, website:'https://www.iop.cas.cn/' },
  { name:'中国科学院半导体研究所', short_name:'中科院半导体所', code:'80136', province:'北京', city:'海淀区', tier:'科研院所', category:'理工', is_self_rated:0, website:'https://www.semi.ac.cn/' },
  { name:'中国科学院微电子研究所', short_name:'中科院微电子所', code:'80140', province:'北京', city:'朝阳区', tier:'科研院所', category:'理工', is_self_rated:0, website:'https://www.ime.ac.cn/' },
  { name:'中国科学院上海微系统与信息技术研究所', short_name:'中科院上海微系统所', code:'80138', province:'上海', city:'长宁区', tier:'科研院所', category:'理工', is_self_rated:0, website:'https://www.sim.ac.cn/' },
  { name:'中国科学院深圳先进技术研究院', short_name:'中科院深圳先进院', code:'80176', province:'广东', city:'深圳市', tier:'科研院所', category:'理工', is_self_rated:0, website:'https://www.siat.ac.cn/' },
  { name:'中国社会科学院', short_name:'社科院', code:'80201', province:'北京', city:'东城区', tier:'科研院所', category:'综合', is_self_rated:0, website:'https://www.cass.org.cn/' },
  { name:'中国财政科学研究院', short_name:'财科院', code:'81601', province:'北京', city:'海淀区', tier:'科研院所', category:'财经', is_self_rated:0, website:'https://www.chineseafs.org/' },
  { name:'中国艺术研究院', short_name:'中国艺研院', code:'84201', province:'北京', city:'朝阳区', tier:'科研院所', category:'艺术', is_self_rated:0, website:'https://www.zgysyjy.org.cn/' },
  { name:'中国农业科学院', short_name:'农科院', code:'82101', province:'北京', city:'海淀区', tier:'科研院所', category:'农林', is_self_rated:0, website:'https://www.caas.cn/' },
  { name:'中国中医科学院', short_name:'中医科学院', code:'84501', province:'北京', city:'东城区', tier:'科研院所', category:'医药', is_self_rated:0, website:'https://www.catcm.ac.cn/' },
];

// --- 扩展专业目录 (50个主要专业) ---
const COMPREHENSIVE_MAJORS = [
  // ==================== 哲学 (01) ====================
  { code:'010100', name:'哲学', discipline:'哲学', category:'哲学', degree_type:'学术型硕士' },
  { code:'010101', name:'马克思主义哲学', discipline:'哲学', category:'哲学', degree_type:'学术型硕士' },
  { code:'010102', name:'中国哲学', discipline:'哲学', category:'哲学', degree_type:'学术型硕士' },
  { code:'010103', name:'外国哲学', discipline:'哲学', category:'哲学', degree_type:'学术型硕士' },
  { code:'010104', name:'逻辑学', discipline:'哲学', category:'哲学', degree_type:'学术型硕士' },
  { code:'010105', name:'伦理学', discipline:'哲学', category:'哲学', degree_type:'学术型硕士' },
  { code:'010106', name:'美学', discipline:'哲学', category:'哲学', degree_type:'学术型硕士' },
  { code:'010107', name:'宗教学', discipline:'哲学', category:'哲学', degree_type:'学术型硕士' },
  { code:'010108', name:'科学技术哲学', discipline:'哲学', category:'哲学', degree_type:'学术型硕士' },
  // ==================== 经济学 (02) ====================
  { code:'020100', name:'理论经济学', discipline:'经济学', category:'理论经济学', degree_type:'学术型硕士' },
  { code:'020101', name:'政治经济学', discipline:'经济学', category:'理论经济学', degree_type:'学术型硕士' },
  { code:'020104', name:'西方经济学', discipline:'经济学', category:'理论经济学', degree_type:'学术型硕士' },
  { code:'020105', name:'世界经济', discipline:'经济学', category:'理论经济学', degree_type:'学术型硕士' },
  { code:'020106', name:'人口资源与环境经济学', discipline:'经济学', category:'理论经济学', degree_type:'学术型硕士' },
  { code:'020204', name:'金融学', discipline:'经济学', category:'应用经济学', degree_type:'学术型硕士' },
  { code:'020205', name:'产业经济学', discipline:'经济学', category:'应用经济学', degree_type:'学术型硕士' },
  { code:'020206', name:'国际贸易学', discipline:'经济学', category:'应用经济学', degree_type:'学术型硕士' },
  { code:'020207', name:'劳动经济学', discipline:'经济学', category:'应用经济学', degree_type:'学术型硕士' },
  { code:'020208', name:'统计学(经济学)', discipline:'经济学', category:'应用经济学', degree_type:'学术型硕士' },
  { code:'020209', name:'数量经济学', discipline:'经济学', category:'应用经济学', degree_type:'学术型硕士' },
  { code:'025100', name:'金融', discipline:'经济学', category:'金融', degree_type:'专业型硕士' },
  { code:'025300', name:'税务', discipline:'经济学', category:'税务', degree_type:'专业型硕士' },
  { code:'025500', name:'保险', discipline:'经济学', category:'保险', degree_type:'专业型硕士' },
  // ==================== 法学 (03) ====================
  { code:'030101', name:'法学理论', discipline:'法学', category:'法学', degree_type:'学术型硕士' },
  { code:'030102', name:'法律史', discipline:'法学', category:'法学', degree_type:'学术型硕士' },
  { code:'030103', name:'宪法学与行政法学', discipline:'法学', category:'法学', degree_type:'学术型硕士' },
  { code:'030104', name:'刑法学', discipline:'法学', category:'法学', degree_type:'学术型硕士' },
  { code:'030105', name:'民商法学', discipline:'法学', category:'法学', degree_type:'学术型硕士' },
  { code:'030106', name:'诉讼法学', discipline:'法学', category:'法学', degree_type:'学术型硕士' },
  { code:'030107', name:'经济法学', discipline:'法学', category:'法学', degree_type:'学术型硕士' },
  { code:'030108', name:'环境与资源保护法学', discipline:'法学', category:'法学', degree_type:'学术型硕士' },
  { code:'030109', name:'国际法学', discipline:'法学', category:'法学', degree_type:'学术型硕士' },
  { code:'030201', name:'政治学理论', discipline:'法学', category:'政治学', degree_type:'学术型硕士' },
  { code:'030204', name:'中共党史', discipline:'法学', category:'政治学', degree_type:'学术型硕士' },
  { code:'030206', name:'国际政治', discipline:'法学', category:'政治学', degree_type:'学术型硕士' },
  { code:'030207', name:'国际关系', discipline:'法学', category:'政治学', degree_type:'学术型硕士' },
  { code:'030301', name:'社会学', discipline:'法学', category:'社会学', degree_type:'学术型硕士' },
  { code:'030302', name:'人口学', discipline:'法学', category:'社会学', degree_type:'学术型硕士' },
  { code:'030303', name:'人类学', discipline:'法学', category:'社会学', degree_type:'学术型硕士' },
  { code:'030304', name:'民俗学', discipline:'法学', category:'社会学', degree_type:'学术型硕士' },
  { code:'030501', name:'马克思主义基本原理', discipline:'法学', category:'马克思主义理论', degree_type:'学术型硕士' },
  { code:'030503', name:'马克思主义中国化研究', discipline:'法学', category:'马克思主义理论', degree_type:'学术型硕士' },
  { code:'030505', name:'思想政治教育', discipline:'法学', category:'马克思主义理论', degree_type:'学术型硕士' },
  { code:'035101', name:'法律(非法学)', discipline:'法学', category:'法律', degree_type:'专业型硕士' },
  { code:'035200', name:'社会工作', discipline:'法学', category:'社会工作', degree_type:'专业型硕士' },
  // ==================== 教育学 (04) ====================
  { code:'040100', name:'教育学', discipline:'教育学', category:'教育学', degree_type:'学术型硕士' },
  { code:'040101', name:'教育学原理', discipline:'教育学', category:'教育学', degree_type:'学术型硕士' },
  { code:'040102', name:'课程与教学论', discipline:'教育学', category:'教育学', degree_type:'学术型硕士' },
  { code:'040103', name:'教育史', discipline:'教育学', category:'教育学', degree_type:'学术型硕士' },
  { code:'040104', name:'比较教育学', discipline:'教育学', category:'教育学', degree_type:'学术型硕士' },
  { code:'040105', name:'学前教育学', discipline:'教育学', category:'教育学', degree_type:'学术型硕士' },
  { code:'040106', name:'高等教育学', discipline:'教育学', category:'教育学', degree_type:'学术型硕士' },
  { code:'040108', name:'职业技术教育学', discipline:'教育学', category:'教育学', degree_type:'学术型硕士' },
  { code:'040110', name:'教育技术学', discipline:'教育学', category:'教育学', degree_type:'学术型硕士' },
  { code:'040200', name:'心理学', discipline:'教育学', category:'心理学', degree_type:'学术型硕士' },
  { code:'040201', name:'基础心理学', discipline:'教育学', category:'心理学', degree_type:'学术型硕士' },
  { code:'040202', name:'发展与教育心理学', discipline:'教育学', category:'心理学', degree_type:'学术型硕士' },
  { code:'040203', name:'应用心理学', discipline:'教育学', category:'心理学', degree_type:'学术型硕士' },
  { code:'045100', name:'教育', discipline:'教育学', category:'教育', degree_type:'专业型硕士' },
  { code:'045115', name:'小学教育', discipline:'教育学', category:'教育', degree_type:'专业型硕士' },
  { code:'045116', name:'心理健康教育', discipline:'教育学', category:'教育', degree_type:'专业型硕士' },
  { code:'045118', name:'学前教育', discipline:'教育学', category:'教育', degree_type:'专业型硕士' },
  { code:'045300', name:'汉语国际教育', discipline:'教育学', category:'汉语国际教育', degree_type:'专业型硕士' },
  { code:'045400', name:'应用心理', discipline:'教育学', category:'应用心理', degree_type:'专业型硕士' },
  // ==================== 文学 (05) ====================
  { code:'050101', name:'文艺学', discipline:'文学', category:'中国语言文学', degree_type:'学术型硕士' },
  { code:'050102', name:'语言学及应用语言学', discipline:'文学', category:'中国语言文学', degree_type:'学术型硕士' },
  { code:'050103', name:'汉语言文字学', discipline:'文学', category:'中国语言文学', degree_type:'学术型硕士' },
  { code:'050104', name:'中国古典文献学', discipline:'文学', category:'中国语言文学', degree_type:'学术型硕士' },
  { code:'050105', name:'中国古代文学', discipline:'文学', category:'中国语言文学', degree_type:'学术型硕士' },
  { code:'050106', name:'中国现当代文学', discipline:'文学', category:'中国语言文学', degree_type:'学术型硕士' },
  { code:'050108', name:'比较文学与世界文学', discipline:'文学', category:'中国语言文学', degree_type:'学术型硕士' },
  { code:'050201', name:'英语语言文学', discipline:'文学', category:'外国语言文学', degree_type:'学术型硕士' },
  { code:'050202', name:'俄语语言文学', discipline:'文学', category:'外国语言文学', degree_type:'学术型硕士' },
  { code:'050205', name:'日语语言文学', discipline:'文学', category:'外国语言文学', degree_type:'学术型硕士' },
  { code:'050211', name:'外国语言学及应用语言学', discipline:'文学', category:'外国语言文学', degree_type:'学术型硕士' },
  { code:'050301', name:'新闻学', discipline:'文学', category:'新闻传播学', degree_type:'学术型硕士' },
  { code:'050302', name:'传播学', discipline:'文学', category:'新闻传播学', degree_type:'学术型硕士' },
  { code:'055101', name:'英语笔译', discipline:'文学', category:'翻译', degree_type:'专业型硕士' },
  { code:'055102', name:'英语口译', discipline:'文学', category:'翻译', degree_type:'专业型硕士' },
  { code:'055200', name:'新闻与传播', discipline:'文学', category:'新闻与传播', degree_type:'专业型硕士' },
  // ==================== 历史学 (06) ====================
  { code:'060100', name:'考古学', discipline:'历史学', category:'考古学', degree_type:'学术型硕士' },
  { code:'060201', name:'史学理论及史学史', discipline:'历史学', category:'中国史', degree_type:'学术型硕士' },
  { code:'060202', name:'历史地理学', discipline:'历史学', category:'中国史', degree_type:'学术型硕士' },
  { code:'060203', name:'历史文献学', discipline:'历史学', category:'中国史', degree_type:'学术型硕士' },
  { code:'060204', name:'专门史', discipline:'历史学', category:'中国史', degree_type:'学术型硕士' },
  { code:'060205', name:'中国古代史', discipline:'历史学', category:'中国史', degree_type:'学术型硕士' },
  { code:'060206', name:'中国近现代史', discipline:'历史学', category:'中国史', degree_type:'学术型硕士' },
  { code:'060300', name:'世界史', discipline:'历史学', category:'世界史', degree_type:'学术型硕士' },
  { code:'065100', name:'文物与博物馆', discipline:'历史学', category:'文物与博物馆', degree_type:'专业型硕士' },
  // ==================== 理学 (07) ====================
  { code:'070101', name:'基础数学', discipline:'理学', category:'数学', degree_type:'学术型硕士' },
  { code:'070102', name:'计算数学', discipline:'理学', category:'数学', degree_type:'学术型硕士' },
  { code:'070103', name:'概率论与数理统计', discipline:'理学', category:'数学', degree_type:'学术型硕士' },
  { code:'070104', name:'应用数学', discipline:'理学', category:'数学', degree_type:'学术型硕士' },
  { code:'070105', name:'运筹学与控制论', discipline:'理学', category:'数学', degree_type:'学术型硕士' },
  { code:'070201', name:'理论物理', discipline:'理学', category:'物理学', degree_type:'学术型硕士' },
  { code:'070202', name:'粒子物理与原子核物理', discipline:'理学', category:'物理学', degree_type:'学术型硕士' },
  { code:'070203', name:'原子与分子物理', discipline:'理学', category:'物理学', degree_type:'学术型硕士' },
  { code:'070205', name:'凝聚态物理', discipline:'理学', category:'物理学', degree_type:'学术型硕士' },
  { code:'070207', name:'光学', discipline:'理学', category:'物理学', degree_type:'学术型硕士' },
  { code:'070301', name:'无机化学', discipline:'理学', category:'化学', degree_type:'学术型硕士' },
  { code:'070302', name:'分析化学', discipline:'理学', category:'化学', degree_type:'学术型硕士' },
  { code:'070303', name:'有机化学', discipline:'理学', category:'化学', degree_type:'学术型硕士' },
  { code:'070304', name:'物理化学', discipline:'理学', category:'化学', degree_type:'学术型硕士' },
  { code:'070305', name:'高分子化学与物理', discipline:'理学', category:'化学', degree_type:'学术型硕士' },
  { code:'071001', name:'植物学', discipline:'理学', category:'生物学', degree_type:'学术型硕士' },
  { code:'071002', name:'动物学', discipline:'理学', category:'生物学', degree_type:'学术型硕士' },
  { code:'071005', name:'微生物学', discipline:'理学', category:'生物学', degree_type:'学术型硕士' },
  { code:'071006', name:'神经生物学', discipline:'理学', category:'生物学', degree_type:'学术型硕士' },
  { code:'071007', name:'遗传学', discipline:'理学', category:'生物学', degree_type:'学术型硕士' },
  { code:'071009', name:'细胞生物学', discipline:'理学', category:'生物学', degree_type:'学术型硕士' },
  { code:'071010', name:'生物化学与分子生物学', discipline:'理学', category:'生物学', degree_type:'学术型硕士' },
  { code:'071300', name:'生态学', discipline:'理学', category:'生态学', degree_type:'学术型硕士' },
  { code:'071401', name:'统计学(理学)', discipline:'理学', category:'统计学', degree_type:'学术型硕士' },
  { code:'077500', name:'计算机科学与技术(理学)', discipline:'理学', category:'计算机科学与技术', degree_type:'学术型硕士' },
  // ==================== 工学 (08) - 补充 ====================
  { code:'080100', name:'力学', discipline:'工学', category:'力学', degree_type:'学术型硕士' },
  { code:'080201', name:'机械制造及其自动化', discipline:'工学', category:'机械工程', degree_type:'学术型硕士' },
  { code:'080202', name:'机械电子工程', discipline:'工学', category:'机械工程', degree_type:'学术型硕士' },
  { code:'080203', name:'机械设计及理论', discipline:'工学', category:'机械工程', degree_type:'学术型硕士' },
  { code:'080204', name:'车辆工程', discipline:'工学', category:'机械工程', degree_type:'学术型硕士' },
  { code:'080300', name:'光学工程', discipline:'工学', category:'光学工程', degree_type:'学术型硕士' },
  { code:'080401', name:'精密仪器及机械', discipline:'工学', category:'仪器科学与技术', degree_type:'学术型硕士' },
  { code:'080402', name:'测试计量技术及仪器', discipline:'工学', category:'仪器科学与技术', degree_type:'学术型硕士' },
  { code:'080501', name:'材料物理与化学', discipline:'工学', category:'材料科学与工程', degree_type:'学术型硕士' },
  { code:'080502', name:'材料学', discipline:'工学', category:'材料科学与工程', degree_type:'学术型硕士' },
  { code:'080503', name:'材料加工工程', discipline:'工学', category:'材料科学与工程', degree_type:'学术型硕士' },
  { code:'080701', name:'工程热物理', discipline:'工学', category:'动力工程及工程热物理', degree_type:'学术型硕士' },
  { code:'080702', name:'热能工程', discipline:'工学', category:'动力工程及工程热物理', degree_type:'学术型硕士' },
  { code:'080703', name:'动力机械及工程', discipline:'工学', category:'动力工程及工程热物理', degree_type:'学术型硕士' },
  { code:'080801', name:'电机与电器', discipline:'工学', category:'电气工程', degree_type:'学术型硕士' },
  { code:'080802', name:'电力系统及其自动化', discipline:'工学', category:'电气工程', degree_type:'学术型硕士' },
  { code:'080803', name:'高电压与绝缘技术', discipline:'工学', category:'电气工程', degree_type:'学术型硕士' },
  { code:'080804', name:'电力电子与电力传动', discipline:'工学', category:'电气工程', degree_type:'学术型硕士' },
  { code:'080805', name:'电工理论与新技术', discipline:'工学', category:'电气工程', degree_type:'学术型硕士' },
  { code:'081001', name:'通信与信息系统', discipline:'工学', category:'信息与通信工程', degree_type:'学术型硕士' },
  { code:'081002', name:'信号与信息处理', discipline:'工学', category:'信息与通信工程', degree_type:'学术型硕士' },
  { code:'081101', name:'控制理论与控制工程', discipline:'工学', category:'控制科学与工程', degree_type:'学术型硕士' },
  { code:'081102', name:'检测技术与自动化装置', discipline:'工学', category:'控制科学与工程', degree_type:'学术型硕士' },
  { code:'081103', name:'系统工程', discipline:'工学', category:'控制科学与工程', degree_type:'学术型硕士' },
  { code:'081104', name:'模式识别与智能系统', discipline:'工学', category:'控制科学与工程', degree_type:'学术型硕士' },
  { code:'081105', name:'导航制导与控制', discipline:'工学', category:'控制科学与工程', degree_type:'学术型硕士' },
  { code:'081401', name:'岩土工程', discipline:'工学', category:'土木工程', degree_type:'学术型硕士' },
  { code:'081402', name:'结构工程', discipline:'工学', category:'土木工程', degree_type:'学术型硕士' },
  { code:'081403', name:'市政工程', discipline:'工学', category:'土木工程', degree_type:'学术型硕士' },
  { code:'081404', name:'供热供燃气通风及空调工程', discipline:'工学', category:'土木工程', degree_type:'学术型硕士' },
  { code:'081405', name:'防灾减灾工程及防护工程', discipline:'工学', category:'土木工程', degree_type:'学术型硕士' },
  { code:'081406', name:'桥梁与隧道工程', discipline:'工学', category:'土木工程', degree_type:'学术型硕士' },
  { code:'081501', name:'水文学及水资源', discipline:'工学', category:'水利工程', degree_type:'学术型硕士' },
  { code:'081502', name:'水力学及河流动力学', discipline:'工学', category:'水利工程', degree_type:'学术型硕士' },
  { code:'081503', name:'水工结构工程', discipline:'工学', category:'水利工程', degree_type:'学术型硕士' },
  { code:'081504', name:'水利水电工程', discipline:'工学', category:'水利工程', degree_type:'学术型硕士' },
  { code:'081701', name:'化学工程', discipline:'工学', category:'化学工程与技术', degree_type:'学术型硕士' },
  { code:'081702', name:'化学工艺', discipline:'工学', category:'化学工程与技术', degree_type:'学术型硕士' },
  { code:'081704', name:'应用化学', discipline:'工学', category:'化学工程与技术', degree_type:'学术型硕士' },
  { code:'081801', name:'矿产普查与勘探', discipline:'工学', category:'地质资源与地质工程', degree_type:'学术型硕士' },
  { code:'082301', name:'道路与铁道工程', discipline:'工学', category:'交通运输工程', degree_type:'学术型硕士' },
  { code:'082302', name:'交通信息工程及控制', discipline:'工学', category:'交通运输工程', degree_type:'学术型硕士' },
  { code:'082303', name:'交通运输规划与管理', discipline:'工学', category:'交通运输工程', degree_type:'学术型硕士' },
  { code:'082501', name:'飞行器设计', discipline:'工学', category:'航空宇航科学与技术', degree_type:'学术型硕士' },
  { code:'083001', name:'环境科学', discipline:'工学', category:'环境科学与工程', degree_type:'学术型硕士' },
  { code:'083002', name:'环境工程', discipline:'工学', category:'环境科学与工程', degree_type:'学术型硕士' },
  { code:'083500', name:'软件工程', discipline:'工学', category:'软件工程', degree_type:'学术型硕士' },
  { code:'083900', name:'网络空间安全', discipline:'工学', category:'网络空间安全', degree_type:'学术型硕士' },
  { code:'085405', name:'软件工程(专硕)', discipline:'工学', category:'电子信息', degree_type:'专业型硕士' },
  { code:'085410', name:'人工智能(专硕)', discipline:'工学', category:'电子信息', degree_type:'专业型硕士' },
  { code:'085412', name:'网络与信息安全(专硕)', discipline:'工学', category:'电子信息', degree_type:'专业型硕士' },
  { code:'085500', name:'机械(专硕)', discipline:'工学', category:'机械', degree_type:'专业型硕士' },
  { code:'085600', name:'材料与化工(专硕)', discipline:'工学', category:'材料与化工', degree_type:'专业型硕士' },
  { code:'085800', name:'能源动力(专硕)', discipline:'工学', category:'能源动力', degree_type:'专业型硕士' },
  { code:'085900', name:'土木水利(专硕)', discipline:'工学', category:'土木水利', degree_type:'专业型硕士' },
  { code:'086100', name:'交通运输(专硕)', discipline:'工学', category:'交通运输', degree_type:'专业型硕士' },
  // ==================== 农学 (09) ====================
  { code:'090101', name:'作物栽培学与耕作学', discipline:'农学', category:'作物学', degree_type:'学术型硕士' },
  { code:'090102', name:'作物遗传育种', discipline:'农学', category:'作物学', degree_type:'学术型硕士' },
  { code:'090201', name:'果树学', discipline:'农学', category:'园艺学', degree_type:'学术型硕士' },
  { code:'090202', name:'蔬菜学', discipline:'农学', category:'园艺学', degree_type:'学术型硕士' },
  { code:'090301', name:'土壤学', discipline:'农学', category:'农业资源与环境', degree_type:'学术型硕士' },
  { code:'090302', name:'植物营养学', discipline:'农学', category:'农业资源与环境', degree_type:'学术型硕士' },
  { code:'090401', name:'植物病理学', discipline:'农学', category:'植物保护', degree_type:'学术型硕士' },
  { code:'090402', name:'农业昆虫与害虫防治', discipline:'农学', category:'植物保护', degree_type:'学术型硕士' },
  { code:'090501', name:'动物遗传育种与繁殖', discipline:'农学', category:'畜牧学', degree_type:'学术型硕士' },
  { code:'090502', name:'动物营养与饲料科学', discipline:'农学', category:'畜牧学', degree_type:'学术型硕士' },
  { code:'090601', name:'基础兽医学', discipline:'农学', category:'兽医学', degree_type:'学术型硕士' },
  { code:'090602', name:'预防兽医学', discipline:'农学', category:'兽医学', degree_type:'学术型硕士' },
  { code:'090603', name:'临床兽医学', discipline:'农学', category:'兽医学', degree_type:'学术型硕士' },
  { code:'090701', name:'林木遗传育种', discipline:'农学', category:'林学', degree_type:'学术型硕士' },
  { code:'090702', name:'森林培育', discipline:'农学', category:'林学', degree_type:'学术型硕士' },
  { code:'090801', name:'水产养殖', discipline:'农学', category:'水产', degree_type:'学术型硕士' },
  { code:'095138', name:'农村发展', discipline:'农学', category:'农业', degree_type:'专业型硕士' },
  { code:'095200', name:'兽医(专硕)', discipline:'农学', category:'兽医', degree_type:'专业型硕士' },
  // ==================== 医学 (10) ====================
  { code:'100101', name:'人体解剖与组织胚胎学', discipline:'医学', category:'基础医学', degree_type:'学术型硕士' },
  { code:'100102', name:'免疫学', discipline:'医学', category:'基础医学', degree_type:'学术型硕士' },
  { code:'100103', name:'病原生物学', discipline:'医学', category:'基础医学', degree_type:'学术型硕士' },
  { code:'100104', name:'病理学与病理生理学', discipline:'医学', category:'基础医学', degree_type:'学术型硕士' },
  { code:'100201', name:'内科学', discipline:'医学', category:'临床医学', degree_type:'学术型硕士' },
  { code:'100202', name:'儿科学', discipline:'医学', category:'临床医学', degree_type:'学术型硕士' },
  { code:'100203', name:'老年医学', discipline:'医学', category:'临床医学', degree_type:'学术型硕士' },
  { code:'100204', name:'神经病学', discipline:'医学', category:'临床医学', degree_type:'学术型硕士' },
  { code:'100207', name:'影像医学与核医学', discipline:'医学', category:'临床医学', degree_type:'学术型硕士' },
  { code:'100210', name:'外科学', discipline:'医学', category:'临床医学', degree_type:'学术型硕士' },
  { code:'100211', name:'妇产科学', discipline:'医学', category:'临床医学', degree_type:'学术型硕士' },
  { code:'100212', name:'眼科学', discipline:'医学', category:'临床医学', degree_type:'学术型硕士' },
  { code:'100214', name:'肿瘤学', discipline:'医学', category:'临床医学', degree_type:'学术型硕士' },
  { code:'100218', name:'急诊医学', discipline:'医学', category:'临床医学', degree_type:'学术型硕士' },
  { code:'100301', name:'口腔基础医学', discipline:'医学', category:'口腔医学', degree_type:'学术型硕士' },
  { code:'100302', name:'口腔临床医学', discipline:'医学', category:'口腔医学', degree_type:'学术型硕士' },
  { code:'100401', name:'流行病与卫生统计学', discipline:'医学', category:'公共卫生与预防医学', degree_type:'学术型硕士' },
  { code:'100402', name:'劳动卫生与环境卫生学', discipline:'医学', category:'公共卫生与预防医学', degree_type:'学术型硕士' },
  { code:'100403', name:'营养与食品卫生学', discipline:'医学', category:'公共卫生与预防医学', degree_type:'学术型硕士' },
  { code:'100501', name:'中医基础理论', discipline:'医学', category:'中医学', degree_type:'学术型硕士' },
  { code:'100502', name:'中医临床基础', discipline:'医学', category:'中医学', degree_type:'学术型硕士' },
  { code:'100506', name:'中医内科学', discipline:'医学', category:'中医学', degree_type:'学术型硕士' },
  { code:'100601', name:'中西医结合基础', discipline:'医学', category:'中西医结合', degree_type:'学术型硕士' },
  { code:'100602', name:'中西医结合临床', discipline:'医学', category:'中西医结合', degree_type:'学术型硕士' },
  { code:'100701', name:'药物化学', discipline:'医学', category:'药学', degree_type:'学术型硕士' },
  { code:'100702', name:'药剂学', discipline:'医学', category:'药学', degree_type:'学术型硕士' },
  { code:'100703', name:'生药学', discipline:'医学', category:'药学', degree_type:'学术型硕士' },
  { code:'100704', name:'药物分析学', discipline:'医学', category:'药学', degree_type:'学术型硕士' },
  { code:'100706', name:'药理学', discipline:'医学', category:'药学', degree_type:'学术型硕士' },
  { code:'101101', name:'护理学', discipline:'医学', category:'护理学', degree_type:'学术型硕士' },
  { code:'105101', name:'内科学(专硕)', discipline:'医学', category:'临床医学', degree_type:'专业型硕士' },
  { code:'105109', name:'外科学(专硕)', discipline:'医学', category:'临床医学', degree_type:'专业型硕士' },
  { code:'105400', name:'护理(专硕)', discipline:'医学', category:'护理', degree_type:'专业型硕士' },
  { code:'105500', name:'药学(专硕)', discipline:'医学', category:'药学', degree_type:'专业型硕士' },
  { code:'105700', name:'中医(专硕)', discipline:'医学', category:'中医', degree_type:'专业型硕士' },
  // ==================== 管理学 (12) ====================
  { code:'120100', name:'管理科学与工程', discipline:'管理学', category:'管理科学与工程', degree_type:'学术型硕士' },
  { code:'120201', name:'会计学', discipline:'管理学', category:'工商管理', degree_type:'学术型硕士' },
  { code:'120202', name:'企业管理', discipline:'管理学', category:'工商管理', degree_type:'学术型硕士' },
  { code:'120203', name:'旅游管理', discipline:'管理学', category:'工商管理', degree_type:'学术型硕士' },
  { code:'120204', name:'技术经济及管理', discipline:'管理学', category:'工商管理', degree_type:'学术型硕士' },
  { code:'120401', name:'行政管理', discipline:'管理学', category:'公共管理', degree_type:'学术型硕士' },
  { code:'120402', name:'社会医学与卫生事业管理', discipline:'管理学', category:'公共管理', degree_type:'学术型硕士' },
  { code:'120403', name:'教育经济与管理', discipline:'管理学', category:'公共管理', degree_type:'学术型硕士' },
  { code:'120404', name:'社会保障', discipline:'管理学', category:'公共管理', degree_type:'学术型硕士' },
  { code:'120405', name:'土地资源管理', discipline:'管理学', category:'公共管理', degree_type:'学术型硕士' },
  { code:'120501', name:'图书馆学', discipline:'管理学', category:'图书情报与档案管理', degree_type:'学术型硕士' },
  { code:'120502', name:'情报学', discipline:'管理学', category:'图书情报与档案管理', degree_type:'学术型硕士' },
  { code:'120503', name:'档案学', discipline:'管理学', category:'图书情报与档案管理', degree_type:'学术型硕士' },
  { code:'125100', name:'工商管理(MBA)', discipline:'管理学', category:'工商管理', degree_type:'专业型硕士' },
  { code:'125200', name:'公共管理(MPA)', discipline:'管理学', category:'公共管理', degree_type:'专业型硕士' },
  { code:'125300', name:'会计(MPAcc)', discipline:'管理学', category:'会计', degree_type:'专业型硕士' },
  { code:'125400', name:'旅游管理(MTA)', discipline:'管理学', category:'旅游管理', degree_type:'专业型硕士' },
  { code:'125500', name:'图书情报(MLIS)', discipline:'管理学', category:'图书情报', degree_type:'专业型硕士' },
  // ==================== 艺术学 (13) ====================
  { code:'130100', name:'艺术学理论', discipline:'艺术学', category:'艺术学理论', degree_type:'学术型硕士' },
  { code:'130101', name:'艺术学', discipline:'艺术学', category:'艺术学', degree_type:'学术型硕士' },
  { code:'130200', name:'音乐与舞蹈学', discipline:'艺术学', category:'音乐与舞蹈学', degree_type:'学术型硕士' },
  { code:'130201', name:'音乐学', discipline:'艺术学', category:'音乐与舞蹈学', degree_type:'学术型硕士' },
  { code:'130300', name:'戏剧与影视学', discipline:'艺术学', category:'戏剧与影视学', degree_type:'学术型硕士' },
  { code:'130301', name:'戏剧戏曲学', discipline:'艺术学', category:'戏剧与影视学', degree_type:'学术型硕士' },
  { code:'130302', name:'电影学', discipline:'艺术学', category:'戏剧与影视学', degree_type:'学术型硕士' },
  { code:'130400', name:'美术学', discipline:'艺术学', category:'美术学', degree_type:'学术型硕士' },
  { code:'130401', name:'美术学(绘画)', discipline:'艺术学', category:'美术学', degree_type:'学术型硕士' },
  { code:'130402', name:'雕塑', discipline:'艺术学', category:'美术学', degree_type:'学术型硕士' },
  { code:'130500', name:'设计学', discipline:'艺术学', category:'设计学', degree_type:'学术型硕士' },
  { code:'130501', name:'设计艺术学', discipline:'艺术学', category:'设计学', degree_type:'学术型硕士' },
  { code:'135101', name:'音乐(专硕)', discipline:'艺术学', category:'音乐', degree_type:'专业型硕士' },
  { code:'135105', name:'广播电视(专硕)', discipline:'艺术学', category:'广播电视', degree_type:'专业型硕士' },
  { code:'135107', name:'美术(专硕)', discipline:'艺术学', category:'美术', degree_type:'专业型硕士' },
  { code:'135108', name:'艺术设计(专硕)', discipline:'艺术学', category:'艺术设计', degree_type:'专业型硕士' },
];

// --- 计算 tier 权重 ---
function tierWeight(tier) {
  const map = { '985': 0.95, '211': 0.85, '双一流': 0.75, '科研院所': 0.80, '普通一本': 0.55, '普通': 0.35 };
  return map[tier] || 0.50;
}

// --- 生成录取数据 ---
function generateAdmission(schoolId, majorId, tier, year) {
  const baseW = tierWeight(tier);
  const applicants = Math.floor((800 + Math.random() * 5000) * baseW);
  const admitPlan = Math.max(5, Math.floor((10 + Math.random() * 80) * (1 - baseW * 0.3)));
  const admitExempt = Math.floor(admitPlan * Math.min(0.7, baseW * 0.6 + Math.random() * 0.2));
  const admitActual = admitPlan + Math.floor((Math.random() - 0.3) * 3);
  const avgScore = Math.floor(280 + (420 - 280) * baseW + Math.random() * 30);
  const minScore = avgScore - Math.floor(10 + Math.random() * 25);
  const retestLine = minScore - Math.floor(5 + Math.random() * 15);
  const retestRatio = +(1.2 + Math.random() * 0.8).toFixed(1);

  return {
    year, school_id: schoolId, major_id: majorId,
    total_applicants: applicants, admit_plan: admitPlan,
    admit_actual: Math.max(admitPlan - 1, admitActual), admit_exempt: admitExempt,
    retest_line: retestLine, retest_ratio: retestRatio,
    avg_admit_score: avgScore, min_admit_score: minScore,
    source: '算法估算'
  };
}

// --- 生成院校复试线 ---
function generateSchoolScoreLine(schoolId, majorId, year, tier) {
  const baseW = tierWeight(tier);
  const totalScore = Math.floor(260 + (400 - 260) * baseW + Math.random() * 20);
  const politics = Math.floor(38 + (60 - 38) * baseW);
  const english = Math.floor(38 + (60 - 38) * baseW);
  const math = Math.floor(57 + (100 - 57) * baseW);
  const zyk = Math.floor(57 + (100 - 57) * baseW);
  return { year, line_type: '院校复试线', school_id: schoolId, major_id: majorId, total_score: totalScore, politics, english, math, '专业课': zyk };
}

// ============================================================
// 主函数
// ============================================================
export function enrichData() {
  // 快速检查：如果录取数据已经充足，跳过耗时检查
  const admCount = db.prepare('SELECT COUNT(*) as c FROM admission_data').get().c;
  if (admCount > 10000 && db.prepare('SELECT COUNT(*) as c FROM majors').get().c > 150) {
    console.log('数据已补全，跳过 (录取数据已达 ' + admCount + ' 条，专业已齐全)。');
    const stats = {
      schools: db.prepare('SELECT COUNT(*) as c FROM schools').get().c,
      majors: db.prepare('SELECT COUNT(*) as c FROM majors').get().c,
      admission_data: admCount,
      score_lines: db.prepare('SELECT COUNT(*) as c FROM score_lines').get().c,
    };
    console.log(`院校: ${stats.schools} | 专业: ${stats.majors} | 录取数据: ${stats.admission_data} | 分数线: ${stats.score_lines}`);
    return;
  }

  console.log('开始数据补全...\n');

  // 1. 插入补全的211高校
  console.log('=== 补全 211/双一流 高校 ===');
  let added211 = 0, addedSYL = 0, skipped211 = 0;
  for (const s of MISSING_211) {
    const exist = db.prepare('SELECT id FROM schools WHERE code = ?').get(s.code);
    if (!exist) {
      db.prepare(`INSERT INTO schools (name, short_name, code, province, city, tier, category, is_self_rated, website)
        VALUES (:name, :short_name, :code, :province, :city, :tier, :category, :is_self_rated, :website)`).run(s);
      added211++;
    } else { skipped211++; }
  }
  console.log(`  211高校: 新增 ${added211}, 已存在 ${skipped211}`);

  for (const s of MISSING_SHUANGYILIU) {
    const exist = db.prepare('SELECT id FROM schools WHERE code = ?').get(s.code);
    if (!exist) {
      db.prepare(`INSERT INTO schools (name, short_name, code, province, city, tier, category, is_self_rated, website)
        VALUES (:name, :short_name, :code, :province, :city, :tier, :category, :is_self_rated, :website)`).run(s);
      addedSYL++;
    } else { skipped211++; }
  }
  console.log(`  双一流高校: 新增 ${addedSYL}`);

  // 2. 插入各省高校
  console.log('\n=== 补全各省具有硕士点的高校 ===');
  let addedProv = 0, skippedProv = 0;
  for (const s of PROVINCIAL_SCHOOLS) {
    const exist = db.prepare('SELECT id FROM schools WHERE code = ?').get(s.code);
    if (!exist) {
      db.prepare(`INSERT INTO schools (name, short_name, code, province, city, tier, category, is_self_rated, website)
        VALUES (:name, :short_name, :code, :province, :city, :tier, :category, :is_self_rated, :website)`).run(s);
      addedProv++;
    } else { skippedProv++; }
  }
  console.log(`  省属高校: 新增 ${addedProv}, 已存在 ${skippedProv}`);

  // 3. 插入科研院所
  console.log('\n=== 补全科研院所 ===');
  let addedRI = 0;
  for (const s of RESEARCH_INSTITUTES) {
    const exist = db.prepare('SELECT id FROM schools WHERE code = ?').get(s.code);
    if (!exist) {
      db.prepare(`INSERT INTO schools (name, short_name, code, province, city, tier, category, is_self_rated, website)
        VALUES (:name, :short_name, :code, :province, :city, :tier, :category, :is_self_rated, :website)`).run(s);
      addedRI++;
    }
  }
  console.log(`  科研院所: 新增 ${addedRI}`);

  // 4. 插入扩展专业
  console.log('\n=== 扩展专业目录 ===');
  let addedMajor = 0;
  for (const m of COMPREHENSIVE_MAJORS) {
    const exist = db.prepare('SELECT id FROM majors WHERE code = ?').get(m.code);
    if (!exist) {
      db.prepare(`INSERT INTO majors (code, name, discipline, category, degree_type)
        VALUES (:code, :name, :discipline, :category, :degree_type)`).run(m);
      addedMajor++;
    }
  }
  console.log(`  新增 ${addedMajor} 个专业`);

  // 5. 院系名称模板 — 根据学校类别分配真实院系
  const DEPT_BY_CATEGORY = {
    '综合': [
      { dept:'数学与统计学院', majors:['07'] },
      { dept:'物理科学与技术学院', majors:['0702'] },
      { dept:'化学化工学院', majors:['0703','0817'] },
      { dept:'生命科学学院', majors:['0710'] },
      { dept:'计算机与信息学院', majors:['0812','0835','0839','0854','0775'] },
      { dept:'电子信息工程学院', majors:['0809','0810'] },
      { dept:'经济学院', majors:['02'] },
      { dept:'管理学院', majors:['12'] },
      { dept:'法学院', majors:['0301','0351'] },
      { dept:'文学院', majors:['0501'] },
      { dept:'外国语学院', majors:['0502','0551'] },
      { dept:'新闻与传播学院', majors:['0503','0552'] },
      { dept:'教育学院', majors:['04'] },
      { dept:'历史文化学院', majors:['06'] },
      { dept:'哲学与社会发展学院', majors:['01','0302','0303'] },
      { dept:'马克思主义学院', majors:['0305'] },
      { dept:'艺术学院', majors:['13'] },
    ],
    '理工': [
      { dept:'计算机科学与技术学院', majors:['0812','0835','0775'] },
      { dept:'人工智能与自动化学院', majors:['0811','0854'] },
      { dept:'电子信息与通信学院', majors:['0809','0810'] },
      { dept:'机械科学与工程学院', majors:['0802','0855'] },
      { dept:'电气与电子工程学院', majors:['0808','0858'] },
      { dept:'材料科学与工程学院', majors:['0805','0856'] },
      { dept:'土木与交通学院', majors:['0814','0823','0859','0861'] },
      { dept:'能源与动力工程学院', majors:['0807'] },
      { dept:'建筑与城市规划学院', majors:['0813'] },
      { dept:'环境科学与工程学院', majors:['0830'] },
      { dept:'力学与航空航天学院', majors:['0801','0825'] },
      { dept:'数学学院', majors:['0701'] },
      { dept:'物理学院', majors:['0702'] },
      { dept:'化学与分子工程学院', majors:['0703'] },
      { dept:'经济管理学院', majors:['02','12'] },
      { dept:'网络空间安全学院', majors:['0839'] },
    ],
    '师范': [
      { dept:'教育学院', majors:['04'] },
      { dept:'心理学院', majors:['0402'] },
      { dept:'文学院', majors:['0501'] },
      { dept:'历史文化学院', majors:['06'] },
      { dept:'外国语学院', majors:['0502','0551'] },
      { dept:'马克思主义学院', majors:['0305'] },
      { dept:'数学与统计学院', majors:['0701'] },
      { dept:'物理与电子科学学院', majors:['0702','0809'] },
      { dept:'化学学院', majors:['0703'] },
      { dept:'生命科学学院', majors:['0710'] },
      { dept:'地理科学学院', majors:['0705'] },
      { dept:'计算机学院', majors:['0812','0835','0854'] },
      { dept:'体育学院', majors:['0403'] },
      { dept:'音乐学院', majors:['1302','1351'] },
      { dept:'美术学院', majors:['1304','1305','1351'] },
    ],
    '医药': [
      { dept:'基础医学院', majors:['1001'] },
      { dept:'临床医学院', majors:['1002','1051'] },
      { dept:'口腔医学院', majors:['1003'] },
      { dept:'公共卫生学院', majors:['1004'] },
      { dept:'药学院', majors:['1007','1055'] },
      { dept:'护理学院', majors:['1011','1054'] },
      { dept:'中医学院', majors:['1005','1057'] },
      { dept:'中西医结合学院', majors:['1006'] },
    ],
    '财经': [
      { dept:'经济学院', majors:['0201','0202'] },
      { dept:'金融学院', majors:['0251'] },
      { dept:'财政税务学院', majors:['0253'] },
      { dept:'国际经济与贸易学院', majors:['0202','0254'] },
      { dept:'会计学院', majors:['1202','1253'] },
      { dept:'工商管理学院', majors:['1202','1251'] },
      { dept:'公共管理学院', majors:['1204','1252'] },
      { dept:'统计与数据科学学院', majors:['0714','0252'] },
      { dept:'法学院', majors:['0301','0351'] },
      { dept:'外国语学院', majors:['0502','0551'] },
    ],
    '政法': [
      { dept:'法学院', majors:['0301','0351'] },
      { dept:'刑事司法学院', majors:['0301'] },
      { dept:'国际法学院', majors:['0301'] },
      { dept:'政治与公共管理学院', majors:['0302','1204'] },
      { dept:'马克思主义学院', majors:['0305'] },
      { dept:'社会学与心理学院', majors:['0303','0402'] },
      { dept:'新闻与传播学院', majors:['0503','0552'] },
      { dept:'商学院', majors:['1202','1251'] },
    ],
    '农林': [
      { dept:'农学院', majors:['0901'] },
      { dept:'园艺学院', majors:['0902'] },
      { dept:'植物保护学院', majors:['0904'] },
      { dept:'资源与环境学院', majors:['0903'] },
      { dept:'动物科技学院', majors:['0905'] },
      { dept:'动物医学院', majors:['0906','0952'] },
      { dept:'林学院', majors:['0907'] },
      { dept:'食品科学与工程学院', majors:['0832'] },
      { dept:'生命科学学院', majors:['0710'] },
      { dept:'经济管理学院', majors:['02','12'] },
    ],
    '语言': [
      { dept:'英语学院', majors:['0502'] },
      { dept:'高级翻译学院', majors:['0551'] },
      { dept:'亚非语学院', majors:['0502'] },
      { dept:'俄语学院', majors:['0502'] },
      { dept:'中国语言文学学院', majors:['0501'] },
      { dept:'国际新闻与传播学院', majors:['0503','0552'] },
      { dept:'国际商学院', majors:['1202','02'] },
      { dept:'法学院', majors:['0301'] },
    ],
    '艺术': [
      { dept:'美术学院', majors:['1304','1351'] },
      { dept:'设计学院', majors:['1305','1351'] },
      { dept:'音乐学院', majors:['1302','1351'] },
      { dept:'戏剧影视学院', majors:['1303','1351'] },
      { dept:'舞蹈学院', majors:['1302'] },
      { dept:'艺术学理论系', majors:['1301'] },
    ],
    '体育': [
      { dept:'体育教育学院', majors:['0403'] },
      { dept:'运动训练学院', majors:['0403'] },
      { dept:'运动人体科学学院', majors:['0403'] },
      { dept:'体育经济与管理学院', majors:['1202'] },
    ],
    '民族': [
      { dept:'民族学与社会学学院', majors:['0303','0304'] },
      { dept:'中国少数民族语言文学学院', majors:['0501'] },
      { dept:'马克思主义学院', majors:['0305'] },
      { dept:'法学院', majors:['0301','0351'] },
      { dept:'经济学院', majors:['02'] },
      { dept:'管理学院', majors:['12'] },
      { dept:'教育学院', majors:['04'] },
      { dept:'文学院', majors:['0501'] },
    ],
    '科研院所': [
      { dept:'研究生院', majors:['07','08'] },
    ],
  };

  function getDeptForMajor(schoolCategory, majorCode) {
    const depts = DEPT_BY_CATEGORY[schoolCategory] || DEPT_BY_CATEGORY['综合'];
    for (const d of depts) {
      for (const prefix of d.majors) {
        if (majorCode.startsWith(prefix)) return d.dept;
      }
    }
    return null; // 不属于该学校类别的主打专业
  }

  // 研究方向模板 — 按专业大类
  function getDirections(majorCode) {
    const map = {
      '0812': ['人工智能','大数据智能','计算机网络与分布式系统','软件工程与方法','计算机体系结构与嵌入式系统','信息安全与密码学'],
      '0835': ['软件工程理论与方法','软件服务工程','智能软件工程','大数据与知识工程','软件测试与验证'],
      '0839': ['网络空间安全基础理论','密码学与应用','系统安全','网络安全','应用安全'],
      '0854': ['智能系统与应用','大数据技术与工程','网络与信息安全工程','嵌入式系统设计'],
      '0802': ['先进制造技术','机电系统控制','机器人技术','精密加工与测量','车辆系统动力学'],
      '0808': ['电力系统分析与控制','高电压与绝缘技术','电力电子变换技术','新能源发电技术'],
      '0810': ['无线通信与网络','信号与信息智能处理','多媒体通信','雷达信号处理','光纤通信'],
      '0811': ['智能控制理论与应用','机器人感知与控制','流程工业自动化','导航与制导技术','模式识别'],
      '0814': ['结构工程与防灾','岩土与地下工程','桥梁与隧道工程','智能建造与管理'],
      '0805': ['先进金属材料','无机非金属材料','高分子材料','复合材料','材料计算与模拟'],
      '0202': ['金融市场与投资','产业经济理论与政策','国际贸易理论与实务','区域经济发展'],
      '0251': ['金融市场与机构','公司金融','投资管理','风险管理','金融科技'],
      '0301': ['法理学与法律方法','宪法与行政法','刑法学','民商法学','经济法学','国际法学'],
      '0351': ['法律实务','企业法务','司法与律师实务','知识产权法务'],
      '12': ['战略管理与组织理论','市场营销与消费者行为','会计与财务管理','人力资源管理','技术创新管理'],
      '1251': ['企业战略管理','市场营销','人力资源管理','财务管理','运营与供应链管理'],
      '1253': ['财务会计与审计','管理会计与成本控制','税务筹划','财务分析与决策'],
      '04': ['课程与教学论','教育管理与政策','比较教育','教师教育','教育技术'],
      '0402': ['认知心理学','发展与教育心理','社会与管理心理','临床与咨询心理'],
      '05': ['语言学理论','文学批评与理论','比较文学','翻译理论与实践','跨文化交际'],
      '06': ['中国古代史','中国近现代史','专门史','世界史','考古学理论与方法'],
      '07': ['基础数学理论','应用数学与计算','概率统计','运筹优化','理论物理前沿','凝聚态物理','量子信息','分子反应动力学'],
      '1001': ['人体解剖学','免疫学','病原生物学','病理生理学','医学遗传学'],
      '1002': ['心血管内科','呼吸内科','消化内科','神经内科','骨科','普通外科','泌尿外科','妇产科','儿科'],
      '1005': ['中医经典理论','中医内科学','针灸推拿学','中医方剂学'],
      '1007': ['药物设计与合成','药物制剂新技术','天然药物化学','药物分析新技术','分子药理学'],
      '0901': ['作物遗传育种','作物栽培生理','种子科学与技术'],
      '09': ['植物保护技术','土壤与植物营养','动物遗传育种','兽医学','林学与森林培育','水产养殖技术'],
      '13': ['艺术理论与批评','美术创作与理论研究','设计艺术理论与实践','音乐表演与教学','影视理论与创作'],
      '0305': ['马克思主义基本原理','马克思主义中国化','思想政治教育理论与实践','中国近现代史基本问题'],
      '0552': ['新闻实务','传播理论','新媒体研究','国际传播','广告与品牌传播'],
    };
    for (const [prefix, dirs] of Object.entries(map)) {
      if (majorCode.startsWith(prefix)) return JSON.stringify(dirs);
    }
    return JSON.stringify(['研究方向一','研究方向二','研究方向三']);
  }

  // 6. 获取所有学校和所有专业
  const allMajors = db.prepare('SELECT id, code, name, discipline, degree_type FROM majors ORDER BY id').all();
  const allSchools = db.prepare('SELECT id, name, code, tier, category, province, city FROM schools ORDER BY id').all();

  console.log(`\n=== 为 ${allSchools.length} 所院校 × ${allMajors.length} 个专业生成全学科数据 ===`);

  let linkAdded2 = 0, admAdded2 = 0, scoreAdded2 = 0, skippedDept = 0;

  // 按学校分批提交，避免单事务过大
  const insertLink = db.prepare('INSERT INTO school_majors (school_id, major_id, department, research_directions, exam_subjects) VALUES (?, ?, ?, ?, ?)');
  const insertAdm = db.prepare(`INSERT INTO admission_data
    (year, school_id, major_id, total_applicants, admit_plan, admit_actual, admit_exempt, retest_line, retest_ratio, avg_admit_score, min_admit_score, source)
    VALUES (:year, :school_id, :major_id, :total_applicants, :admit_plan, :admit_actual, :admit_exempt, :retest_line, :retest_ratio, :avg_admit_score, :min_admit_score, :source)`);
  const insertSL = db.prepare(`INSERT INTO score_lines (year, line_type, school_id, major_id, total_score, politics, english, math, 专业课)
    VALUES (:year, :line_type, :school_id, :major_id, :total_score, :politics, :english, :math, :专业课)`);

  for (let si = 0; si < allSchools.length; si++) {
    const school = allSchools[si];
    db.exec('BEGIN');
    try {
      for (const major of allMajors) {
        const dept = getDeptForMajor(school.category, major.code);
        if (!dept) { skippedDept++; continue; }

        const directions = getDirections(major.code);
        const existLink = db.prepare('SELECT id FROM school_majors WHERE school_id = ? AND major_id = ?').get(school.id, major.id);
        if (!existLink) {
          const examSubjects = major.degree_type === '专业型硕士'
            ? '{"政治":"思想政治理论","英语":"英语二","数学":"数学二","专业课":"业务课"}'
            : '{"政治":"思想政治理论","英语":"英语一","数学":"数学一","专业课":"业务课"}';
          insertLink.run(school.id, major.id, dept, directions, examSubjects);
          linkAdded2++;
        }

        for (let y = 0; y < 3; y++) {
          const year = 2022 + y;
          const existAdm = db.prepare('SELECT id FROM admission_data WHERE school_id = ? AND major_id = ? AND year = ?').get(school.id, major.id, year);
          if (!existAdm) {
            insertAdm.run(generateAdmission(school.id, major.id, school.tier, year));
            admAdded2++;
          }

          const existSL = db.prepare("SELECT id FROM score_lines WHERE school_id = ? AND major_id = ? AND year = ? AND line_type = '院校复试线'").get(school.id, major.id, year);
          if (!existSL) {
            insertSL.run(generateSchoolScoreLine(school.id, major.id, year, school.tier));
            scoreAdded2++;
          }
        }
      }
      db.exec('COMMIT');
    } catch (e) {
      db.exec('ROLLBACK');
      console.error(`  ${school.name} 数据插入失败:`, e.message);
    }
    if ((si + 1) % 50 === 0 || si === allSchools.length - 1) {
      console.log(`  进度: ${si + 1}/${allSchools.length} 院校 (关联:${linkAdded2} 录取:${admAdded2} 分数线:${scoreAdded2})`);
    }
  }

  console.log(`  院校-专业关联: 新增 ${linkAdded2} (跳过不匹配: ${skippedDept})`);
  console.log(`  录取数据: 新增 ${admAdded2} 条`);
  console.log(`  院校复试线: 新增 ${scoreAdded2} 条`);

  // 打印总结
  console.log('\n========== 数据补全完成 ==========');
  const stats = {
    schools: db.prepare('SELECT COUNT(*) as c FROM schools').get().c,
    majors: db.prepare('SELECT COUNT(*) as c FROM majors').get().c,
    school_majors: db.prepare('SELECT COUNT(*) as c FROM school_majors').get().c,
    admission_data: db.prepare('SELECT COUNT(*) as c FROM admission_data').get().c,
    score_lines: db.prepare('SELECT COUNT(*) as c FROM score_lines').get().c,
  };
  console.log(`院校总数: ${stats.schools}`);
  console.log(`专业总数: ${stats.majors}`);
  console.log(`院校-专业关联: ${stats.school_majors}`);
  console.log(`录取数据条数: ${stats.admission_data}`);
  console.log(`分数线条数: ${stats.score_lines}`);

  // 按省份统计
  const provStats = db.prepare('SELECT province, COUNT(*) as c FROM schools GROUP BY province ORDER BY c DESC').all();
  console.log('\n各省院校分布:');
  for (const p of provStats) {
    console.log(`  ${p.province}: ${p.c} 所`);
  }
  console.log(`\n共覆盖 ${provStats.length} 个省级行政区`);
}
