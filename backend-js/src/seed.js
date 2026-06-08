import { DatabaseSync } from 'node:sqlite';
import path from 'path';
import { fileURLToPath } from 'url';
import { hashPassword } from './auth.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_PATH = path.join(__dirname, '..', '..', 'data', 'kaoyan.db');
const db = new DatabaseSync(DB_PATH);

// ... SCHOOLS, MAJORS, NATIONAL_LINES data same as before ...
const SCHOOLS = [
  { name: '清华大学', short_name: '清华', code: '10003', province: '北京', city: '海淀区', tier: '985', category: '综合', is_self_rated: 1, website: 'https://www.tsinghua.edu.cn/' },
  { name: '北京大学', short_name: '北大', code: '10001', province: '北京', city: '海淀区', tier: '985', category: '综合', is_self_rated: 1, website: 'https://www.pku.edu.cn/' },
  { name: '中国人民大学', short_name: '人大', code: '10002', province: '北京', city: '海淀区', tier: '985', category: '综合', is_self_rated: 1, website: 'https://www.ruc.edu.cn/' },
  { name: '北京航空航天大学', short_name: '北航', code: '10006', province: '北京', city: '海淀区', tier: '985', category: '理工', is_self_rated: 1, website: 'https://www.buaa.edu.cn/' },
  { name: '北京理工大学', short_name: '北理工', code: '10007', province: '北京', city: '海淀区', tier: '985', category: '理工', is_self_rated: 1, website: 'https://www.bit.edu.cn/' },
  { name: '中国农业大学', short_name: '中国农大', code: '10019', province: '北京', city: '海淀区', tier: '985', category: '农林', is_self_rated: 1, website: 'https://www.cau.edu.cn/' },
  { name: '北京师范大学', short_name: '北师大', code: '10027', province: '北京', city: '海淀区', tier: '985', category: '师范', is_self_rated: 1, website: 'https://www.bnu.edu.cn/' },
  { name: '中央民族大学', short_name: '中央民大', code: '10052', province: '北京', city: '海淀区', tier: '985', category: '民族', is_self_rated: 0, website: 'https://www.muc.edu.cn/' },
  { name: '复旦大学', short_name: '复旦', code: '10246', province: '上海', city: '杨浦区', tier: '985', category: '综合', is_self_rated: 1, website: 'https://www.fudan.edu.cn/' },
  { name: '上海交通大学', short_name: '上交大', code: '10248', province: '上海', city: '闵行区', tier: '985', category: '综合', is_self_rated: 1, website: 'https://www.sjtu.edu.cn/' },
  { name: '同济大学', short_name: '同济', code: '10247', province: '上海', city: '杨浦区', tier: '985', category: '理工', is_self_rated: 1, website: 'https://www.tongji.edu.cn/' },
  { name: '华东师范大学', short_name: '华东师大', code: '10269', province: '上海', city: '普陀区', tier: '985', category: '师范', is_self_rated: 1, website: 'https://www.ecnu.edu.cn/' },
  { name: '南京大学', short_name: '南大', code: '10284', province: '江苏', city: '南京市', tier: '985', category: '综合', is_self_rated: 1, website: 'https://www.nju.edu.cn/' },
  { name: '东南大学', short_name: '东大', code: '10286', province: '江苏', city: '南京市', tier: '985', category: '理工', is_self_rated: 1, website: 'https://www.seu.edu.cn/' },
  { name: '浙江大学', short_name: '浙大', code: '10335', province: '浙江', city: '杭州市', tier: '985', category: '综合', is_self_rated: 1, website: 'https://www.zju.edu.cn/' },
  { name: '中国科学技术大学', short_name: '中科大', code: '10358', province: '安徽', city: '合肥市', tier: '985', category: '理工', is_self_rated: 1, website: 'https://www.ustc.edu.cn/' },
  { name: '厦门大学', short_name: '厦大', code: '10384', province: '福建', city: '厦门市', tier: '985', category: '综合', is_self_rated: 1, website: 'https://www.xmu.edu.cn/' },
  { name: '山东大学', short_name: '山大', code: '10422', province: '山东', city: '济南市', tier: '985', category: '综合', is_self_rated: 1, website: 'https://www.sdu.edu.cn/' },
  { name: '中国海洋大学', short_name: '中国海大', code: '10423', province: '山东', city: '青岛市', tier: '985', category: '理工', is_self_rated: 1, website: 'https://www.ouc.edu.cn/' },
  { name: '武汉大学', short_name: '武大', code: '10486', province: '湖北', city: '武汉市', tier: '985', category: '综合', is_self_rated: 1, website: 'https://www.whu.edu.cn/' },
  { name: '华中科技大学', short_name: '华科', code: '10487', province: '湖北', city: '武汉市', tier: '985', category: '理工', is_self_rated: 1, website: 'https://www.hust.edu.cn/' },
  { name: '中南大学', short_name: '中南', code: '10533', province: '湖南', city: '长沙市', tier: '985', category: '综合', is_self_rated: 1, website: 'https://www.csu.edu.cn/' },
  { name: '湖南大学', short_name: '湖大', code: '10532', province: '湖南', city: '长沙市', tier: '985', category: '理工', is_self_rated: 1, website: 'https://www.hnu.edu.cn/' },
  { name: '中山大学', short_name: '中大', code: '10558', province: '广东', city: '广州市', tier: '985', category: '综合', is_self_rated: 1, website: 'https://www.sysu.edu.cn/' },
  { name: '华南理工大学', short_name: '华工', code: '10561', province: '广东', city: '广州市', tier: '985', category: '理工', is_self_rated: 1, website: 'https://www.scut.edu.cn/' },
  { name: '四川大学', short_name: '川大', code: '10610', province: '四川', city: '成都市', tier: '985', category: '综合', is_self_rated: 1, website: 'https://www.scu.edu.cn/' },
  { name: '电子科技大学', short_name: '成电', code: '10614', province: '四川', city: '成都市', tier: '985', category: '理工', is_self_rated: 1, website: 'https://www.uestc.edu.cn/' },
  { name: '重庆大学', short_name: '重大', code: '10611', province: '重庆', city: '重庆市', tier: '985', category: '理工', is_self_rated: 1, website: 'https://www.cqu.edu.cn/' },
  { name: '西安交通大学', short_name: '西交大', code: '10698', province: '陕西', city: '西安市', tier: '985', category: '综合', is_self_rated: 1, website: 'https://www.xjtu.edu.cn/' },
  { name: '西北工业大学', short_name: '西工大', code: '10699', province: '陕西', city: '西安市', tier: '985', category: '理工', is_self_rated: 1, website: 'https://www.nwpu.edu.cn/' },
  { name: '兰州大学', short_name: '兰大', code: '10730', province: '甘肃', city: '兰州市', tier: '985', category: '综合', is_self_rated: 1, website: 'https://www.lzu.edu.cn/' },
  { name: '国防科技大学', short_name: '国防科大', code: '90002', province: '湖南', city: '长沙市', tier: '985', category: '军事', is_self_rated: 0, website: 'https://www.nudt.edu.cn/' },
  { name: '南开大学', short_name: '南开', code: '10055', province: '天津', city: '南开区', tier: '985', category: '综合', is_self_rated: 1, website: 'https://www.nankai.edu.cn/' },
  { name: '天津大学', short_name: '天大', code: '10056', province: '天津', city: '南开区', tier: '985', category: '理工', is_self_rated: 1, website: 'https://www.tju.edu.cn/' },
  { name: '大连理工大学', short_name: '大工', code: '10141', province: '辽宁', city: '大连市', tier: '985', category: '理工', is_self_rated: 1, website: 'https://www.dlut.edu.cn/' },
  { name: '东北大学', short_name: '东大', code: '10145', province: '辽宁', city: '沈阳市', tier: '985', category: '理工', is_self_rated: 1, website: 'https://www.neu.edu.cn/' },
  { name: '吉林大学', short_name: '吉大', code: '10183', province: '吉林', city: '长春市', tier: '985', category: '综合', is_self_rated: 1, website: 'https://www.jlu.edu.cn/' },
  { name: '哈尔滨工业大学', short_name: '哈工大', code: '10213', province: '黑龙江', city: '哈尔滨市', tier: '985', category: '理工', is_self_rated: 1, website: 'https://www.hit.edu.cn/' },
  { name: '西北农林科技大学', short_name: '西农', code: '10712', province: '陕西', city: '杨凌示范区', tier: '985', category: '农林', is_self_rated: 0, website: 'https://www.nwsuaf.edu.cn/' },
  { name: '北京交通大学', short_name: '北交大', code: '10004', province: '北京', city: '海淀区', tier: '211', category: '理工', is_self_rated: 0, website: 'https://www.bjtu.edu.cn/' },
  { name: '北京邮电大学', short_name: '北邮', code: '10013', province: '北京', city: '海淀区', tier: '211', category: '理工', is_self_rated: 0, website: 'https://www.bupt.edu.cn/' },
  { name: '中国政法大学', short_name: '法大', code: '10053', province: '北京', city: '昌平区', tier: '211', category: '政法', is_self_rated: 0, website: 'https://www.cupl.edu.cn/' },
  { name: '中央财经大学', short_name: '中央财大', code: '10034', province: '北京', city: '海淀区', tier: '211', category: '财经', is_self_rated: 0, website: 'https://www.cufe.edu.cn/' },
  { name: '对外经济贸易大学', short_name: '贸大', code: '10036', province: '北京', city: '朝阳区', tier: '211', category: '财经', is_self_rated: 0, website: 'https://www.uibe.edu.cn/' },
  { name: '北京外国语大学', short_name: '北外', code: '10030', province: '北京', city: '海淀区', tier: '211', category: '语言', is_self_rated: 0, website: 'https://www.bfsu.edu.cn/' },
  { name: '中国传媒大学', short_name: '中传', code: '10033', province: '北京', city: '朝阳区', tier: '211', category: '语言', is_self_rated: 0, website: 'https://www.cuc.edu.cn/' },
  { name: '上海财经大学', short_name: '上财', code: '10272', province: '上海', city: '杨浦区', tier: '211', category: '财经', is_self_rated: 0, website: 'https://www.sufe.edu.cn/' },
  { name: '上海大学', short_name: '上大', code: '10280', province: '上海', city: '宝山区', tier: '211', category: '综合', is_self_rated: 0, website: 'https://www.shu.edu.cn/' },
  { name: '华东理工大学', short_name: '华理', code: '10251', province: '上海', city: '徐汇区', tier: '211', category: '理工', is_self_rated: 0, website: 'https://www.ecust.edu.cn/' },
  { name: '南京航空航天大学', short_name: '南航', code: '10287', province: '江苏', city: '南京市', tier: '211', category: '理工', is_self_rated: 0, website: 'https://www.nuaa.edu.cn/' },
  { name: '南京理工大学', short_name: '南理工', code: '10288', province: '江苏', city: '南京市', tier: '211', category: '理工', is_self_rated: 0, website: 'https://www.njust.edu.cn/' },
  { name: '苏州大学', short_name: '苏大', code: '10285', province: '江苏', city: '苏州市', tier: '211', category: '综合', is_self_rated: 0, website: 'https://www.suda.edu.cn/' },
  { name: '武汉理工大学', short_name: '武理工', code: '10497', province: '湖北', city: '武汉市', tier: '211', category: '理工', is_self_rated: 0, website: 'https://www.whut.edu.cn/' },
  { name: '中南财经政法大学', short_name: '中南财大', code: '10520', province: '湖北', city: '武汉市', tier: '211', category: '财经', is_self_rated: 0, website: 'https://www.zuel.edu.cn/' },
  { name: '西南财经大学', short_name: '西财', code: '10651', province: '四川', city: '成都市', tier: '211', category: '财经', is_self_rated: 0, website: 'https://www.swufe.edu.cn/' },
  { name: '西南交通大学', short_name: '西南交大', code: '10613', province: '四川', city: '成都市', tier: '211', category: '理工', is_self_rated: 0, website: 'https://www.swjtu.edu.cn/' },
  { name: '西安电子科技大学', short_name: '西电', code: '10701', province: '陕西', city: '西安市', tier: '211', category: '理工', is_self_rated: 0, website: 'https://www.xidian.edu.cn/' },
  { name: '暨南大学', short_name: '暨南', code: '10559', province: '广东', city: '广州市', tier: '211', category: '综合', is_self_rated: 0, website: 'https://www.jnu.edu.cn/' },
  { name: '华南师范大学', short_name: '华南师大', code: '10574', province: '广东', city: '广州市', tier: '211', category: '师范', is_self_rated: 0, website: 'https://www.scnu.edu.cn/' },
  { name: '华北电力大学', short_name: '华电', code: '10054', province: '北京', city: '昌平区', tier: '211', category: '理工', is_self_rated: 0, website: 'https://www.ncepu.edu.cn/' },
  { name: '中国科学院大学', short_name: '国科大', code: '14430', province: '北京', city: '石景山区', tier: '双一流', category: '理工', is_self_rated: 0, website: 'https://www.ucas.ac.cn/' },
  { name: '南方科技大学', short_name: '南科大', code: '14325', province: '广东', city: '深圳市', tier: '双一流', category: '理工', is_self_rated: 0, website: 'https://www.sustech.edu.cn/' },
  { name: '上海科技大学', short_name: '上科大', code: '14423', province: '上海', city: '浦东新区', tier: '双一流', category: '理工', is_self_rated: 0, website: 'https://www.shanghaitech.edu.cn/' },
  { name: '南京邮电大学', short_name: '南邮', code: '10293', province: '江苏', city: '南京市', tier: '双一流', category: '理工', is_self_rated: 0, website: 'https://www.njupt.edu.cn/' },
  { name: '湘潭大学', short_name: '湘大', code: '10530', province: '湖南', city: '湘潭市', tier: '双一流', category: '综合', is_self_rated: 0, website: 'https://www.xtu.edu.cn/' },
  { name: '河南大学', short_name: '河大', code: '10475', province: '河南', city: '开封市', tier: '双一流', category: '综合', is_self_rated: 0, website: 'https://www.henu.edu.cn/' },
  { name: '深圳大学', short_name: '深大', code: '10590', province: '广东', city: '深圳市', tier: '普通一本', category: '综合', is_self_rated: 0, website: 'https://www.szu.edu.cn/' },
  { name: '浙江工业大学', short_name: '浙工大', code: '10337', province: '浙江', city: '杭州市', tier: '普通一本', category: '理工', is_self_rated: 0, website: 'https://www.zjut.edu.cn/' },
  { name: '广东工业大学', short_name: '广工', code: '11845', province: '广东', city: '广州市', tier: '普通一本', category: '理工', is_self_rated: 0, website: 'https://www.gdut.edu.cn/' },
  { name: '杭州电子科技大学', short_name: '杭电', code: '10336', province: '浙江', city: '杭州市', tier: '普通一本', category: '理工', is_self_rated: 0, website: 'https://www.hdu.edu.cn/' },
  { name: '重庆邮电大学', short_name: '重邮', code: '10617', province: '重庆', city: '重庆市', tier: '普通一本', category: '理工', is_self_rated: 0, website: 'https://www.cqupt.edu.cn/' },
  { name: '首都师范大学', short_name: '首师大', code: '10028', province: '北京', city: '海淀区', tier: '普通一本', category: '师范', is_self_rated: 0, website: 'https://www.cnu.edu.cn/' },
  { name: '燕山大学', short_name: '燕大', code: '10216', province: '河北', city: '秦皇岛市', tier: '普通一本', category: '理工', is_self_rated: 0, website: 'https://www.ysu.edu.cn/' },
  { name: '江苏大学', short_name: '江大', code: '10299', province: '江苏', city: '镇江市', tier: '普通一本', category: '综合', is_self_rated: 0, website: 'https://www.ujs.edu.cn/' },
];

const MAJORS = [
  { code: '081200', name: '计算机科学与技术', discipline: '工学', category: '计算机科学与技术', degree_type: '学术型硕士' },
  { code: '083500', name: '软件工程', discipline: '工学', category: '软件工程', degree_type: '学术型硕士' },
  { code: '083900', name: '网络空间安全', discipline: '工学', category: '网络空间安全', degree_type: '学术型硕士' },
  { code: '081000', name: '信息与通信工程', discipline: '工学', category: '信息与通信工程', degree_type: '学术型硕士' },
  { code: '080900', name: '电子科学与技术', discipline: '工学', category: '电子科学与技术', degree_type: '学术型硕士' },
  { code: '081100', name: '控制科学与工程', discipline: '工学', category: '控制科学与工程', degree_type: '学术型硕士' },
  { code: '080200', name: '机械工程', discipline: '工学', category: '机械工程', degree_type: '学术型硕士' },
  { code: '080800', name: '电气工程', discipline: '工学', category: '电气工程', degree_type: '学术型硕士' },
  { code: '081400', name: '土木工程', discipline: '工学', category: '土木工程', degree_type: '学术型硕士' },
  { code: '085400', name: '电子信息', discipline: '工学', category: '电子信息', degree_type: '专业型硕士' },
  { code: '070100', name: '数学', discipline: '理学', category: '数学', degree_type: '学术型硕士' },
  { code: '070200', name: '物理学', discipline: '理学', category: '物理学', degree_type: '学术型硕士' },
  { code: '071000', name: '生物学', discipline: '理学', category: '生物学', degree_type: '学术型硕士' },
  { code: '020200', name: '应用经济学', discipline: '经济学', category: '应用经济学', degree_type: '学术型硕士' },
  { code: '020100', name: '理论经济学', discipline: '经济学', category: '理论经济学', degree_type: '学术型硕士' },
  { code: '025100', name: '金融', discipline: '经济学', category: '金融', degree_type: '专业型硕士' },
  { code: '120100', name: '管理科学与工程', discipline: '管理学', category: '管理科学与工程', degree_type: '学术型硕士' },
  { code: '120200', name: '工商管理', discipline: '管理学', category: '工商管理', degree_type: '学术型硕士' },
  { code: '125100', name: '工商管理(MBA)', discipline: '管理学', category: '工商管理', degree_type: '专业型硕士' },
  { code: '125300', name: '会计', discipline: '管理学', category: '会计', degree_type: '专业型硕士' },
  { code: '030100', name: '法学', discipline: '法学', category: '法学', degree_type: '学术型硕士' },
  { code: '035101', name: '法律(非法学)', discipline: '法学', category: '法律', degree_type: '专业型硕士' },
  { code: '100200', name: '临床医学', discipline: '医学', category: '临床医学', degree_type: '学术型硕士' },
  { code: '105100', name: '临床医学', discipline: '医学', category: '临床医学', degree_type: '专业型硕士' },
  { code: '050100', name: '中国语言文学', discipline: '文学', category: '中国语言文学', degree_type: '学术型硕士' },
  { code: '050300', name: '新闻传播学', discipline: '文学', category: '新闻传播学', degree_type: '学术型硕士' },
  { code: '040100', name: '教育学', discipline: '教育学', category: '教育学', degree_type: '学术型硕士' },
  { code: '040200', name: '心理学', discipline: '教育学', category: '心理学', degree_type: '学术型硕士' },
  { code: '130500', name: '设计学', discipline: '艺术学', category: '设计学', degree_type: '学术型硕士' },
  { code: '090100', name: '作物学', discipline: '农学', category: '作物学', degree_type: '学术型硕士' },
];

const NATIONAL_LINES = [
  [2020, '工学', 264, 37, 37, 254, 34, 34],
  [2021, '工学', 263, 37, 37, 253, 34, 34],
  [2022, '工学', 273, 38, 38, 263, 35, 35],
  [2023, '工学', 273, 38, 38, 263, 35, 35],
  [2024, '工学', 273, 37, 37, 263, 34, 34],
  [2020, '经济学', 343, 48, 48, 333, 45, 45],
  [2021, '经济学', 348, 49, 49, 338, 46, 46],
  [2022, '经济学', 360, 52, 52, 350, 49, 49],
  [2023, '经济学', 346, 48, 48, 336, 45, 45],
  [2024, '经济学', 338, 47, 47, 328, 44, 44],
  [2020, '管理学', 345, 49, 49, 335, 46, 46],
  [2021, '管理学', 341, 48, 48, 331, 45, 45],
  [2022, '管理学', 353, 51, 51, 343, 48, 48],
  [2023, '管理学', 340, 47, 47, 330, 44, 44],
  [2024, '管理学', 347, 49, 49, 337, 46, 46],
  [2020, '法学', 325, 46, 46, 315, 43, 43],
  [2021, '法学', 321, 44, 44, 311, 41, 41],
  [2022, '法学', 335, 46, 46, 325, 43, 43],
  [2023, '法学', 326, 45, 45, 316, 42, 42],
  [2024, '法学', 331, 47, 47, 321, 44, 44],
  [2020, '文学', 355, 52, 52, 345, 49, 49],
  [2021, '文学', 355, 53, 53, 345, 50, 50],
  [2022, '文学', 367, 56, 56, 357, 53, 53],
  [2023, '文学', 363, 54, 54, 353, 51, 51],
  [2024, '文学', 365, 55, 55, 355, 52, 52],
  [2020, '理学', 288, 40, 40, 278, 37, 37],
  [2021, '理学', 280, 37, 37, 270, 34, 34],
  [2022, '理学', 290, 39, 39, 280, 36, 36],
  [2023, '理学', 279, 38, 38, 269, 35, 35],
  [2024, '理学', 288, 41, 41, 278, 38, 38],
  [2020, '教育学', 331, 46, 46, 321, 43, 43],
  [2021, '教育学', 337, 47, 47, 327, 44, 44],
  [2022, '教育学', 351, 51, 51, 341, 48, 48],
  [2023, '教育学', 350, 51, 51, 340, 48, 48],
  [2024, '教育学', 350, 51, 51, 340, 48, 48],
  [2020, '医学', 300, 42, 42, 290, 39, 39],
  [2021, '医学', 299, 41, 41, 289, 38, 38],
  [2022, '医学', 309, 43, 43, 299, 40, 40],
  [2023, '医学', 296, 39, 39, 286, 36, 36],
  [2024, '医学', 304, 42, 42, 294, 39, 39],
  [2020, '农学', 253, 33, 33, 243, 30, 30],
  [2021, '农学', 252, 33, 33, 242, 30, 30],
  [2022, '农学', 252, 33, 33, 242, 30, 30],
  [2023, '农学', 251, 33, 33, 241, 30, 30],
  [2024, '农学', 251, 33, 33, 241, 30, 30],
  [2020, '艺术学', 347, 38, 38, 337, 35, 35],
  [2021, '艺术学', 346, 38, 38, 336, 35, 35],
  [2022, '艺术学', 361, 40, 40, 351, 37, 37],
  [2023, '艺术学', 362, 40, 40, 352, 37, 37],
  [2024, '艺术学', 362, 40, 40, 352, 37, 37],
];

const CS_SCHOOLS = [
  { code: '10003', applicants: [2800, 3200, 3500], admit: [32, 30, 28], exempt: [25, 26, 24], avg: [395, 398, 400], min: [385, 388, 390] },
  { code: '10001', applicants: [2500, 2800, 3000], admit: [30, 28, 26], exempt: [24, 25, 23], avg: [385, 390, 392], min: [375, 380, 382] },
  { code: '10335', applicants: [2200, 2500, 2800], admit: [48, 44, 42], exempt: [30, 32, 33], avg: [375, 378, 380], min: [365, 368, 370] },
  { code: '10248', applicants: [2400, 2600, 2900], admit: [38, 35, 34], exempt: [28, 30, 29], avg: [380, 383, 385], min: [370, 373, 375] },
  { code: '10006', applicants: [2000, 2300, 2600], admit: [52, 50, 46], exempt: [35, 36, 38], avg: [370, 372, 375], min: [360, 362, 365] },
  { code: '10013', applicants: [1800, 2000, 2200], admit: [85, 80, 78], exempt: [40, 42, 45], avg: [355, 358, 360], min: [345, 348, 350] },
  { code: '10336', applicants: [1200, 1400, 1600], admit: [105, 100, 95], exempt: [10, 12, 15], avg: [340, 342, 345], min: [330, 332, 335] },
  { code: '10590', applicants: [1500, 1700, 1900], admit: [65, 62, 58], exempt: [15, 16, 18], avg: [350, 353, 355], min: [340, 343, 345] },
  { code: '10614', applicants: [1600, 1800, 2000], admit: [72, 70, 68], exempt: [30, 32, 33], avg: [365, 368, 370], min: [355, 358, 360] },
  { code: '10701', applicants: [1400, 1550, 1700], admit: [78, 75, 72], exempt: [25, 26, 28], avg: [358, 360, 362], min: [348, 350, 352] },
];

export function runSeed() {
  const existing = db.prepare('SELECT COUNT(*) as c FROM schools').get();
  if (existing.c > 0) {
    console.log('数据库已包含数据，跳过种子导入。');
    return;
  }

  console.log('开始导入种子数据...');

  db.exec('BEGIN');
  try {
    // 1. 院校
    for (const s of SCHOOLS) {
      db.prepare(`INSERT INTO schools (name, short_name, code, province, city, tier, category, is_self_rated, website)
        VALUES (:name, :short_name, :code, :province, :city, :tier, :category, :is_self_rated, :website)`).run(s);
    }
    console.log(`  导入 ${SCHOOLS.length} 所院校`);

    // 2. 专业
    for (const m of MAJORS) {
      db.prepare(`INSERT INTO majors (code, name, discipline, category, degree_type)
        VALUES (:code, :name, :discipline, :category, :degree_type)`).run(m);
    }
    console.log(`  导入 ${MAJORS.length} 个专业`);

    // 3. 院校-专业关联
    const csMajor = db.prepare("SELECT id FROM majors WHERE code = '081200'").get();
    const csSchoolCodes = ['10003', '10001', '10248', '10335', '10284', '10006', '10007', '10614', '10698', '10487',
      '10013', '10287', '10701', '10590', '10336', '10617', '10280', '10285'];
    let linkCount = 0;
    for (const code of csSchoolCodes) {
      const school = db.prepare('SELECT id FROM schools WHERE code = ?').get(code);
      if (school && csMajor) {
        db.prepare(`INSERT INTO school_majors (school_id, major_id, department, research_directions, exam_subjects)
          VALUES (?, ?, ?, ?, ?)`).run(
          school.id, csMajor.id, '计算机学院',
          '["人工智能","大数据","计算机网络","软件工程","计算机体系结构"]',
          '{"政治":"思想政治理论","英语":"英语一","数学":"数学一","专业课":"408计算机学科专业基础"}'
        );
        linkCount++;
      }
    }
    console.log(`  创建 ${linkCount} 个院校-专业关联`);

    // 4. 国家线
    let lineCount = 0;
    for (const [year, discipline, aTotal, aPol, aEng, bTotal, bPol, bEng] of NATIONAL_LINES) {
      const major = db.prepare('SELECT id FROM majors WHERE discipline = ? LIMIT 1').get(discipline);
      if (!major) continue;
      db.prepare(`INSERT INTO score_lines (year, line_type, school_id, major_id, total_score, politics, english)
        VALUES (?, '国家线A区', NULL, ?, ?, ?, ?)`).run(year, major.id, aTotal, aPol, aEng);
      db.prepare(`INSERT INTO score_lines (year, line_type, school_id, major_id, total_score, politics, english)
        VALUES (?, '国家线B区', NULL, ?, ?, ?, ?)`).run(year, major.id, bTotal, bPol, bEng);
      lineCount += 2;
    }
    console.log(`  导入 ${lineCount} 条国家线`);

    // 5. 院校复试线
    if (csMajor) {
      let slCount = 0;
      for (const cs of CS_SCHOOLS) {
        const school = db.prepare('SELECT id FROM schools WHERE code = ?').get(cs.code);
        if (!school) continue;
        for (let y = 0; y < 3; y++) {
          const score = cs.avg[y] - 15;
          db.prepare(`INSERT INTO score_lines (year, line_type, school_id, major_id, total_score, politics, english, math, 专业课)
            VALUES (?, '院校复试线', ?, ?, ?, ?, ?, ?, ?)`)
            .run(2022 + y, school.id, csMajor.id, score, 55, 55, 90, 90);
          slCount++;
        }
      }
      console.log(`  导入 ${slCount} 条院校复试线`);
    }

    // 6. 报录数据
    if (csMajor) {
      let admCount = 0;
      for (const cs of CS_SCHOOLS) {
        const school = db.prepare('SELECT id FROM schools WHERE code = ?').get(cs.code);
        if (!school) continue;
        for (let y = 0; y < 3; y++) {
          db.prepare(`INSERT OR IGNORE INTO admission_data
            (year, school_id, major_id, total_applicants, admit_plan, admit_actual, admit_exempt, avg_admit_score, min_admit_score)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`).run(
            2022 + y, school.id, csMajor.id, cs.applicants[y], cs.admit[y], cs.admit[y],
            cs.exempt[y], cs.avg[y], cs.min[y]
          );
          admCount++;
        }
      }
      console.log(`  导入 ${admCount} 条报录数据`);
    }

    // 7. 默认账户
    db.prepare(`INSERT INTO users (username, password_hash, email, role) VALUES (?, ?, ?, ?)`)
      .run('admin', hashPassword('admin123'), 'admin@kaoyan.com', 'admin');
    db.prepare(`INSERT INTO users (username, password_hash, email, role) VALUES (?, ?, ?, ?)`)
      .run('consultant', hashPassword('consultant123'), 'consultant@kaoyan.com', 'consultant');
    console.log('  创建默认账户: admin/admin123, consultant/consultant123');

    db.exec('COMMIT');
    console.log('种子数据导入完成!');
  } catch (e) {
    db.exec('ROLLBACK');
    console.error('种子数据导入失败:', e);
    throw e;
  }
}
