// ═══════════════════════════════════════════════════════
// constants.js  —  Dữ liệu cố định của toàn bộ app
// ═══════════════════════════════════════════════════════

export const PARISHES = ['Âm Sa', 'Đài Môn', 'Thuần Hậu']

export const ALL_CLASSES = [
  { id: 'KT',   name: 'Khai Tâm',  khoi: 'Khai Tâm' },
  { id: 'C1-1', name: 'Cấp I-1',   khoi: 'Cấp I'    },
  { id: 'C1-2', name: 'Cấp I-2',   khoi: 'Cấp I'    },
  { id: 'C1-3', name: 'Cấp I-3',   khoi: 'Cấp I'    },
  { id: 'C2-1', name: 'Cấp II-1',  khoi: 'Cấp II'   },
  { id: 'C2-2', name: 'Cấp II-2',  khoi: 'Cấp II'   },
  { id: 'C2-3', name: 'Cấp II-3',  khoi: 'Cấp II'   },
  { id: 'C3-1', name: 'Cấp III-1', khoi: 'Cấp III'  },
  { id: 'C3-2', name: 'Cấp III-2', khoi: 'Cấp III'  },
  { id: 'BD',   name: 'Bao Đồng',  khoi: 'Bao Đồng' },
]

// Cấu trúc kỳ thi: 2 học kỳ, mỗi kỳ có Giữa kỳ + Cuối kỳ
export const HOC_KY = [
  {
    label: 'Học kỳ I',
    ky: ['Giữa kỳ I', 'Cuối kỳ I'],
  },
  {
    label: 'Học kỳ II',
    ky: ['Giữa kỳ II', 'Cuối kỳ II'],
  },
]

// Tất cả các kỳ thi (flat list — dùng chỗ cần)
export const KY_THI = ['Giữa kỳ I', 'Cuối kỳ I', 'Giữa kỳ II', 'Cuối kỳ II']

export const TRANG_THAI = ['Có mặt', 'Vắng', 'Phép']

export const MOCK_USERS = [
  {
    email: 'admin@bgl.com',
    password: '123456',
    role: 'admin',
    name: 'Admin Tổng',
    classId: null,
  },
  {
    email: 'gly@bgl.com',
    password: '123456',
    role: 'gly',
    name: 'GLV Khai Tâm',
    classId: 'KT',
  },
]

export const SAMPLE_STUDENTS = [
  { id:'s1', tenThanh:'Maria',     hoVaTen:'Nguyễn Thị An',   ngaySinh:'2015-03-15', giaoXu:'Âm Sa',     lopId:'KT',   phuHuynh:'Nguyễn Văn Bình', sdt:'0901234567' },
  { id:'s2', tenThanh:'Vinh Sơn',  hoVaTen:'Trần Văn Bình',   ngaySinh:'2014-07-20', giaoXu:'Đài Môn',   lopId:'C1-1', phuHuynh:'Trần Thị Cúc',    sdt:'0912345678' },
  { id:'s3', tenThanh:'Anna',      hoVaTen:'Lê Thị Cẩm',      ngaySinh:'2013-11-05', giaoXu:'Thuần Hậu', lopId:'C1-1', phuHuynh:'Lê Văn Dũng',     sdt:'0923456789' },
  { id:'s4', tenThanh:'Phêrô',     hoVaTen:'Phạm Văn Duy',    ngaySinh:'2012-04-18', giaoXu:'Âm Sa',     lopId:'C2-1', phuHuynh:'Phạm Thị Em',     sdt:'0934567890' },
  { id:'s5', tenThanh:'Têrêsa',    hoVaTen:'Hoàng Thị Giang', ngaySinh:'2011-08-25', giaoXu:'Đài Môn',   lopId:'C3-1', phuHuynh:'Hoàng Văn Hải',   sdt:'0945678901' },
]

export const getClass = (id) => ALL_CLASSES.find(c => c.id === id)