import React from 'react';
import { 
  LayoutDashboard, 
  Users, 
  FileText, 
  Package, 
  GitMerge, 
  MonitorPlay, 
  Settings,
  Search,
  Bell,
  ChevronDown,
  ArrowUpRight,
  ArrowDownRight,
  DollarSign,
  UserPlus,
  Activity,
  CreditCard,
  Plus,
  MoreHorizontal
} from 'lucide-react';
import './_group.css';

export function CleanPro() {
  const sidebarItems = [
    { icon: LayoutDashboard, label: 'ダッシュボード', active: true },
    { icon: Users, label: '顧客管理' },
    { icon: FileText, label: 'LP管理' },
    { icon: Package, label: '商品' },
    { icon: GitMerge, label: 'シナリオ' },
    { icon: MonitorPlay, label: '会員サイト' },
    { icon: Settings, label: '設定' },
  ];

  const kpiData = [
    { label: '売上合計', value: '¥1,248,000', icon: DollarSign, trend: '+12.5%', isPositive: true },
    { label: '顧客数', value: '342名', icon: Users, trend: '+4.2%', isPositive: true },
    { label: 'コンバージョン率', value: '12.4%', icon: Activity, trend: '-1.1%', isPositive: false },
    { label: '会員登録者', value: '189名', icon: UserPlus, trend: '+8.4%', isPositive: true },
  ];

  const recentCustomers = [
    { name: '山田 太郎', email: 'yamada@example.com', lp: '春の特別キャンペーン', date: '2023/10/24', status: 'アクティブ' },
    { name: '佐藤 花子', email: 'sato.h@example.com', lp: '無料ウェビナー登録', date: '2023/10/23', status: 'アクティブ' },
    { name: '鈴木 一郎', email: 'suzuki.i@example.com', lp: 'ベーシックコース', date: '2023/10/23', status: '待機中' },
    { name: '田中 美咲', email: 'tanaka.m@example.com', lp: '春の特別キャンペーン', date: '2023/10/22', status: 'アクティブ' },
    { name: '高橋 健太', email: 'takahashi.k@example.com', lp: '無料ウェビナー登録', date: '2023/10/21', status: '解約済' },
  ];

  return (
    <div className="clean-pro-theme min-h-screen flex bg-slate-50 text-slate-800">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col hidden md:flex">
        <div className="h-16 flex items-center px-6 border-b border-slate-100">
          <div className="flex items-center gap-2 text-indigo-600 font-bold text-xl tracking-tight">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
              <div className="w-4 h-4 bg-white rounded-sm"></div>
            </div>
            FlowRev
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto py-6 px-3 space-y-1">
          {sidebarItems.map((item, idx) => (
            <button
              key={idx}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                item.active 
                  ? 'bg-indigo-50 text-indigo-700 relative after:absolute after:left-0 after:top-0 after:bottom-0 after:w-1 after:bg-indigo-600 after:rounded-r-full' 
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <item.icon size={18} className={item.active ? 'text-indigo-600' : 'text-slate-400'} />
              {item.label}
            </button>
          ))}
        </div>

        <div className="p-4 border-t border-slate-100">
          <button className="w-full flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-slate-50 transition-colors">
            <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-medium text-sm">
              ED
            </div>
            <div className="flex-1 text-left">
              <div className="text-sm font-medium text-slate-900">EduCorp Inc.</div>
              <div className="text-xs text-slate-500">管理者</div>
            </div>
            <ChevronDown size={16} className="text-slate-400" />
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 shrink-0">
          <div className="flex flex-col">
            <h1 className="text-lg font-semibold text-slate-900 leading-tight">ダッシュボード</h1>
            <span className="text-xs text-slate-500">2023年10月24日 (火)</span>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="relative hidden lg:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input 
                type="text" 
                placeholder="検索..." 
                className="pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all w-64"
              />
            </div>
            <button className="relative p-2 text-slate-400 hover:bg-slate-50 rounded-full transition-colors">
              <Bell size={20} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
            <button className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm">
              <Plus size={16} />
              新規作成
            </button>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="flex-1 overflow-auto p-8">
          <div className="max-w-6xl mx-auto space-y-8">
            
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {kpiData.map((kpi, idx) => (
                <div key={idx} className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm flex flex-col gap-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-slate-500">{kpi.label}</span>
                    <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center">
                      <kpi.icon size={20} className="text-indigo-600" />
                    </div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-slate-900">{kpi.value}</div>
                    <div className="flex items-center gap-1.5 mt-1">
                      <span className={`flex items-center text-xs font-medium ${kpi.isPositive ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {kpi.isPositive ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                        {kpi.trend}
                      </span>
                      <span className="text-xs text-slate-500">前月比</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Tables Section */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
                <h2 className="text-base font-semibold text-slate-900">最近の顧客</h2>
                <button className="text-sm font-medium text-indigo-600 hover:text-indigo-700">すべて見る</button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-slate-50 text-slate-500 font-medium">
                    <tr>
                      <th className="px-6 py-3 font-medium">名前</th>
                      <th className="px-6 py-3 font-medium">登録LP</th>
                      <th className="px-6 py-3 font-medium">登録日</th>
                      <th className="px-6 py-3 font-medium">ステータス</th>
                      <th className="px-6 py-3 font-medium text-right">アクション</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {recentCustomers.map((customer, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="font-medium text-slate-900">{customer.name}</div>
                          <div className="text-slate-500 text-xs mt-0.5">{customer.email}</div>
                        </td>
                        <td className="px-6 py-4 text-slate-600">{customer.lp}</td>
                        <td className="px-6 py-4 text-slate-600">{customer.date}</td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            customer.status === 'アクティブ' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                            customer.status === '待機中' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                            'bg-slate-100 text-slate-700 border border-slate-200'
                          }`}>
                            {customer.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button className="text-slate-400 hover:text-slate-600 p-1 rounded transition-colors">
                            <MoreHorizontal size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}
