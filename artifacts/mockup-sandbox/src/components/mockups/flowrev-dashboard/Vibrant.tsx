import React from 'react';
import { 
  BarChart3, 
  Users, 
  LayoutTemplate, 
  Package, 
  Share2, 
  MonitorPlay, 
  Settings, 
  Search, 
  Bell, 
  Plus,
  ArrowUpRight,
  CreditCard,
  UserCheck,
  Activity
} from 'lucide-react';

export function Vibrant() {
  return (
    <div className="flex h-screen w-full bg-[#F5F3FF] overflow-hidden font-sans text-slate-800">
      {/* Sidebar */}
      <aside className="w-64 bg-gradient-to-b from-[#7C3AED] to-[#4F46E5] text-white flex flex-col justify-between shadow-xl z-20">
        <div>
          <div className="h-16 flex items-center px-6 font-bold text-2xl tracking-tight border-b border-white/10">
            <span className="bg-white text-[#7C3AED] rounded-md p-1 mr-2 shadow-sm">
              <Activity size={20} strokeWidth={3} />
            </span>
            FlowRev
          </div>
          <div className="px-4 py-6">
            <div className="text-xs uppercase tracking-wider font-semibold text-indigo-200 mb-4 px-2">Menu</div>
            <nav className="space-y-1">
              <a href="#" className="flex items-center gap-3 px-3 py-2.5 bg-white/10 rounded-lg text-white font-medium transition-colors border border-white/5">
                <BarChart3 size={18} />
                ダッシュボード
              </a>
              <a href="#" className="flex items-center gap-3 px-3 py-2.5 text-indigo-100 hover:bg-white/5 rounded-lg transition-colors">
                <Users size={18} />
                顧客管理
              </a>
              <a href="#" className="flex items-center gap-3 px-3 py-2.5 text-indigo-100 hover:bg-white/5 rounded-lg transition-colors">
                <LayoutTemplate size={18} />
                LP管理
              </a>
              <a href="#" className="flex items-center gap-3 px-3 py-2.5 text-indigo-100 hover:bg-white/5 rounded-lg transition-colors">
                <Package size={18} />
                商品
              </a>
              <a href="#" className="flex items-center gap-3 px-3 py-2.5 text-indigo-100 hover:bg-white/5 rounded-lg transition-colors">
                <Share2 size={18} />
                シナリオ
              </a>
              <a href="#" className="flex items-center gap-3 px-3 py-2.5 text-indigo-100 hover:bg-white/5 rounded-lg transition-colors">
                <MonitorPlay size={18} />
                会員サイト
              </a>
            </nav>
          </div>
          <div className="px-4 py-2">
            <div className="text-xs uppercase tracking-wider font-semibold text-indigo-200 mb-4 px-2">System</div>
            <nav className="space-y-1">
              <a href="#" className="flex items-center gap-3 px-3 py-2.5 text-indigo-100 hover:bg-white/5 rounded-lg transition-colors">
                <Settings size={18} />
                設定
              </a>
            </nav>
          </div>
        </div>
        
        <div className="p-4 border-t border-white/10 bg-black/5">
          <div className="flex items-center gap-3 px-3 py-2 hover:bg-white/5 rounded-lg cursor-pointer transition-colors">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-300 to-purple-300 flex items-center justify-center text-indigo-900 font-bold overflow-hidden ring-2 ring-white/20 shadow-sm">
              <span className="text-xs">ED</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium truncate">EduCorp Inc.</div>
              <div className="text-xs text-indigo-200 truncate">admin@educorp.jp</div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Header */}
        <header className="h-16 bg-white/70 backdrop-blur-md border-b border-indigo-100/50 flex items-center justify-between px-8 sticky top-0 z-10">
          <div>
            <h1 className="text-xl font-extrabold text-slate-800 tracking-tight">ダッシュボード</h1>
            <p className="text-xs text-slate-500 font-medium">{new Date().toLocaleDateString('ja-JP', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'short' })}</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input 
                type="text" 
                placeholder="検索..." 
                className="pl-9 pr-4 py-1.5 bg-white border border-indigo-100 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-[#7C3AED] focus:border-transparent w-64 shadow-sm transition-shadow"
              />
            </div>
            <button className="w-9 h-9 rounded-full bg-white border border-indigo-100 flex items-center justify-center text-slate-600 hover:text-[#7C3AED] hover:bg-indigo-50 transition-colors relative shadow-sm">
              <Bell size={18} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-pink-500 rounded-full ring-2 ring-white"></span>
            </button>
            <button className="bg-gradient-to-r from-[#7C3AED] to-[#4F46E5] text-white px-4 py-2 rounded-full text-sm font-bold shadow-md shadow-indigo-200 hover:shadow-lg hover:-translate-y-0.5 transition-all flex items-center gap-1.5">
              <Plus size={16} strokeWidth={2.5} />
              新規作成
            </button>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="p-8 space-y-8 max-w-7xl mx-auto w-full">
          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Revenue */}
            <div className="bg-gradient-to-br from-violet-500 to-purple-600 rounded-2xl p-6 text-white shadow-lg shadow-purple-200/50 relative overflow-hidden group">
              <div className="absolute right-0 top-0 w-32 h-32 bg-white/10 rounded-full -mr-10 -mt-10 blur-2xl group-hover:bg-white/20 transition-all"></div>
              <div className="flex justify-between items-start mb-4 relative">
                <div className="bg-white/20 p-2.5 rounded-xl backdrop-blur-sm border border-white/10">
                  <CreditCard size={24} />
                </div>
                <div className="flex items-center gap-1 text-emerald-300 bg-black/20 px-2 py-1 rounded-full text-xs font-bold backdrop-blur-sm">
                  <ArrowUpRight size={14} strokeWidth={3} />
                  <span>+18.2%</span>
                </div>
              </div>
              <div className="relative">
                <p className="text-purple-100 text-sm font-medium mb-1">売上合計</p>
                <h3 className="text-3xl font-extrabold tracking-tight drop-shadow-sm">¥1,248,000</h3>
              </div>
            </div>

            {/* Customers */}
            <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl p-6 text-white shadow-lg shadow-blue-200/50 relative overflow-hidden group">
              <div className="absolute right-0 top-0 w-32 h-32 bg-white/10 rounded-full -mr-10 -mt-10 blur-2xl group-hover:bg-white/20 transition-all"></div>
              <div className="flex justify-between items-start mb-4 relative">
                <div className="bg-white/20 p-2.5 rounded-xl backdrop-blur-sm border border-white/10">
                  <Users size={24} />
                </div>
                <div className="flex items-center gap-1 text-emerald-300 bg-black/20 px-2 py-1 rounded-full text-xs font-bold backdrop-blur-sm">
                  <ArrowUpRight size={14} strokeWidth={3} />
                  <span>+5.4%</span>
                </div>
              </div>
              <div className="relative">
                <p className="text-blue-100 text-sm font-medium mb-1">顧客数</p>
                <div className="flex items-baseline gap-1">
                  <h3 className="text-3xl font-extrabold tracking-tight drop-shadow-sm">342</h3>
                  <span className="text-lg font-bold text-blue-100">名</span>
                </div>
              </div>
            </div>

            {/* Conversion */}
            <div className="bg-gradient-to-br from-orange-400 to-amber-600 rounded-2xl p-6 text-white shadow-lg shadow-orange-200/50 relative overflow-hidden group">
              <div className="absolute right-0 top-0 w-32 h-32 bg-white/10 rounded-full -mr-10 -mt-10 blur-2xl group-hover:bg-white/20 transition-all"></div>
              <div className="flex justify-between items-start mb-4 relative">
                <div className="bg-white/20 p-2.5 rounded-xl backdrop-blur-sm border border-white/10">
                  <Activity size={24} />
                </div>
                <div className="flex items-center gap-1 text-red-200 bg-black/20 px-2 py-1 rounded-full text-xs font-bold backdrop-blur-sm">
                  <ArrowUpRight size={14} className="rotate-90" strokeWidth={3} />
                  <span>-1.2%</span>
                </div>
              </div>
              <div className="relative">
                <p className="text-orange-100 text-sm font-medium mb-1">コンバージョン率</p>
                <div className="flex items-baseline gap-1">
                  <h3 className="text-3xl font-extrabold tracking-tight drop-shadow-sm">12.4</h3>
                  <span className="text-lg font-bold text-orange-100">%</span>
                </div>
              </div>
            </div>

            {/* Members */}
            <div className="bg-gradient-to-br from-emerald-400 to-teal-600 rounded-2xl p-6 text-white shadow-lg shadow-emerald-200/50 relative overflow-hidden group">
              <div className="absolute right-0 top-0 w-32 h-32 bg-white/10 rounded-full -mr-10 -mt-10 blur-2xl group-hover:bg-white/20 transition-all"></div>
              <div className="flex justify-between items-start mb-4 relative">
                <div className="bg-white/20 p-2.5 rounded-xl backdrop-blur-sm border border-white/10">
                  <UserCheck size={24} />
                </div>
                <div className="flex items-center gap-1 text-emerald-200 bg-black/20 px-2 py-1 rounded-full text-xs font-bold backdrop-blur-sm">
                  <ArrowUpRight size={14} strokeWidth={3} />
                  <span>+12.5%</span>
                </div>
              </div>
              <div className="relative">
                <p className="text-emerald-100 text-sm font-medium mb-1">会員登録者</p>
                <div className="flex items-baseline gap-1">
                  <h3 className="text-3xl font-extrabold tracking-tight drop-shadow-sm">189</h3>
                  <span className="text-lg font-bold text-emerald-100">名</span>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Chart Section */}
            <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-indigo-50/50 p-6">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-lg font-extrabold text-slate-800">売上推移</h3>
                  <p className="text-sm text-slate-500 font-medium mt-1">過去30日間のパフォーマンス</p>
                </div>
                <select className="bg-slate-50 border border-slate-200 text-sm font-medium rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-[#7C3AED]">
                  <option>今月</option>
                  <option>先月</option>
                  <option>今年</option>
                </select>
              </div>
              <div className="h-64 flex items-end justify-between gap-2 pb-4 pt-8 border-b border-slate-100 relative">
                {/* Y-axis lines */}
                <div className="absolute inset-0 flex flex-col justify-between pb-4 text-xs text-slate-400">
                  <div className="border-t border-slate-100 border-dashed w-full"></div>
                  <div className="border-t border-slate-100 border-dashed w-full"></div>
                  <div className="border-t border-slate-100 border-dashed w-full"></div>
                  <div className="border-t border-slate-100 border-dashed w-full"></div>
                  <div className="w-full"></div>
                </div>
                
                {/* Bars */}
                {[40, 65, 45, 80, 55, 90, 75, 100, 85, 120, 95, 110, 80, 105, 90].map((h, i) => (
                  <div key={i} className="w-full flex flex-col justify-end items-center gap-2 group relative z-10 h-full">
                    {/* Tooltip */}
                    <div className="opacity-0 group-hover:opacity-100 absolute -top-8 bg-slate-800 text-white font-bold text-xs py-1.5 px-2.5 rounded-lg transition-opacity whitespace-nowrap pointer-events-none shadow-lg">
                      ¥{(h * 10000).toLocaleString()}
                    </div>
                    {/* Bar */}
                    <div 
                      className="w-full max-w-[16px] bg-indigo-50 group-hover:bg-indigo-100 rounded-t-md transition-all relative overflow-hidden cursor-pointer" 
                      style={{ height: `${(h/120)*100}%` }}
                    >
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-[#7C3AED] to-[#4F46E5] opacity-80 group-hover:opacity-100 h-full transition-opacity"></div>
                    </div>
                    {/* X-axis labels (sparse) */}
                    {i % 3 === 0 && <span className="text-[10px] font-bold text-slate-400">{i + 1}日</span>}
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions / Stats */}
            <div className="bg-white rounded-2xl shadow-sm border border-indigo-50/50 p-6 flex flex-col">
              <h3 className="text-lg font-extrabold text-slate-800 mb-6">流入チャネル</h3>
              <div className="space-y-6 flex-1">
                {[
                  { name: 'オーガニック検索', value: 45, color: 'bg-purple-500' },
                  { name: 'SNS広告', value: 30, color: 'bg-blue-500' },
                  { name: 'メールマガジン', value: 15, color: 'bg-emerald-500' },
                  { name: 'リファラル', value: 10, color: 'bg-orange-500' },
                ].map((item, i) => (
                  <div key={i}>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="font-bold text-slate-700">{item.name}</span>
                      <span className="font-extrabold text-slate-900">{item.value}%</span>
                    </div>
                    <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div className={`h-full ${item.color} rounded-full relative overflow-hidden`} style={{ width: `${item.value}%` }}>
                        <div className="absolute inset-0 bg-white/20 w-full h-full transform -skew-x-12 translate-x-full group-hover:translate-x-0 transition-transform"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <button className="w-full mt-6 py-2.5 bg-indigo-50/50 border border-indigo-100 text-indigo-700 rounded-xl text-sm font-bold hover:bg-indigo-100 hover:border-indigo-200 transition-colors">
                詳細レポートを見る
              </button>
            </div>
          </div>

          {/* Recent Customers */}
          <div className="bg-white rounded-2xl shadow-sm border border-indigo-50/50 overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-white">
              <h3 className="text-lg font-extrabold text-slate-800">最近の顧客</h3>
              <a href="#" className="text-sm font-bold text-indigo-600 hover:text-indigo-800 bg-indigo-50 px-3 py-1.5 rounded-lg transition-colors">すべて見る</a>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50 text-slate-500 text-xs uppercase tracking-wider">
                    <th className="px-6 py-4 font-bold">名前</th>
                    <th className="px-6 py-4 font-bold">メールアドレス</th>
                    <th className="px-6 py-4 font-bold">登録LP</th>
                    <th className="px-6 py-4 font-bold">登録日</th>
                    <th className="px-6 py-4 font-bold">ステータス</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {[
                    { name: '田中 太郎', email: 'tanaka.t@example.com', lp: '春の特別キャンペーン', date: '2023/10/24', status: 'アクティブ', statusColor: 'bg-emerald-100 text-emerald-800' },
                    { name: '佐藤 花子', email: 'hanako.s@example.com', lp: '無料ウェビナー登録', date: '2023/10/24', status: 'アクティブ', statusColor: 'bg-emerald-100 text-emerald-800' },
                    { name: '鈴木 一郎', email: 'ichiro.s@example.com', lp: 'ベーシックコース案内', date: '2023/10/23', status: '検討中', statusColor: 'bg-amber-100 text-amber-800' },
                    { name: '高橋 美咲', email: 'misaki.t@example.com', lp: '春の特別キャンペーン', date: '2023/10/22', status: '購入済み', statusColor: 'bg-blue-100 text-blue-800' },
                    { name: '伊藤 健太', email: 'kenta.i@example.com', lp: '無料メール講座', date: '2023/10/21', status: '非アクティブ', statusColor: 'bg-slate-100 text-slate-700' },
                  ].map((customer, i) => (
                    <tr key={i} className="hover:bg-slate-50 transition-colors cursor-pointer group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center text-indigo-700 font-bold text-sm ring-2 ring-white shadow-sm group-hover:scale-105 transition-transform">
                            {customer.name.charAt(0)}
                          </div>
                          <span className="font-bold text-slate-800">{customer.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-500 font-medium">{customer.email}</td>
                      <td className="px-6 py-4 text-slate-700 font-bold">{customer.lp}</td>
                      <td className="px-6 py-4 text-slate-500 font-medium">{customer.date}</td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${customer.statusColor}`}>
                          {customer.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
