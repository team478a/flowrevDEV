import React from 'react';
import { 
  LayoutDashboard, 
  Users, 
  MonitorPlay, 
  Package, 
  Workflow, 
  GlobeLock, 
  Settings,
  Bell,
  Search,
  Plus,
  ArrowUpRight,
  MoreHorizontal,
  ChevronDown
} from 'lucide-react';

export function DarkPro() {
  return (
    <div className="flex h-screen w-full bg-[#F8F9FA] font-sans overflow-hidden">
      {/* Sidebar - Dark */}
      <aside className="w-64 bg-[#18181B] flex flex-col h-full border-r border-[#27272A] flex-shrink-0 text-[#A1A1AA]">
        {/* Logo Area */}
        <div className="h-16 flex items-center px-6 border-b border-[#27272A]">
          <div className="flex items-center gap-2 text-white">
            <div className="w-8 h-8 rounded bg-blue-600 flex items-center justify-center">
              <span className="font-bold text-lg text-white leading-none">F</span>
            </div>
            <span className="font-semibold text-lg tracking-tight">FlowRev</span>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto py-6 px-3">
          <div className="space-y-1">
            <NavItem icon={<LayoutDashboard size={20} />} label="ダッシュボード" active />
            <NavItem icon={<Users size={20} />} label="顧客管理" />
            <NavItem icon={<MonitorPlay size={20} />} label="LP管理" />
            <NavItem icon={<Package size={20} />} label="商品" />
            <NavItem icon={<Workflow size={20} />} label="シナリオ" />
            <NavItem icon={<GlobeLock size={20} />} label="会員サイト" />
          </div>
          
          <div className="mt-8 mb-2 px-3">
            <p className="text-xs font-semibold text-[#52525B] uppercase tracking-wider">System</p>
          </div>
          <div className="space-y-1">
            <NavItem icon={<Settings size={20} />} label="設定" />
          </div>
        </div>

        {/* User Profile */}
        <div className="p-4 border-t border-[#27272A]">
          <button className="flex items-center gap-3 w-full p-2 rounded-md hover:bg-[#27272A] transition-colors text-left">
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-blue-600 to-emerald-400 flex-shrink-0" />
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-medium text-white truncate">Admin User</p>
              <p className="text-xs text-[#A1A1AA] truncate">admin@flowrev.com</p>
            </div>
            <ChevronDown size={16} className="text-[#A1A1AA]" />
          </button>
        </div>
      </aside>

      {/* Main Content - Light */}
      <main className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Header */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8 flex-shrink-0">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-semibold text-gray-900">ダッシュボード</h1>
            <span className="px-2.5 py-1 rounded-full bg-gray-100 text-xs font-medium text-gray-600">
              {new Date().toLocaleDateString('ja-JP', { month: 'short', day: 'numeric', weekday: 'short' })}
            </span>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input 
                type="text" 
                placeholder="検索..." 
                className="pl-9 pr-4 py-2 bg-gray-100 border-transparent focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 rounded-lg text-sm w-64 transition-all outline-none"
              />
            </div>
            <button className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-600 transition-colors relative">
              <Bell size={20} />
              <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors shadow-sm">
              <Plus size={16} />
              新規作成
            </button>
          </div>
        </header>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-8">
          <div className="max-w-7xl mx-auto space-y-8">
            
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <KpiCard 
                title="売上合計" 
                value="¥1,248,000" 
                trend="+15.3%" 
                trendUp={true}
              />
              <KpiCard 
                title="顧客数" 
                value="342名" 
                trend="+4.1%" 
                trendUp={true}
              />
              <KpiCard 
                title="コンバージョン率" 
                value="12.4%" 
                trend="-1.2%" 
                trendUp={false}
              />
              <KpiCard 
                title="会員登録者" 
                value="189名" 
                trend="+22.5%" 
                trendUp={true}
              />
            </div>

            {/* Table Section */}
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
              <div className="px-6 py-5 border-b border-gray-200 flex justify-between items-center">
                <h2 className="text-lg font-semibold text-gray-900">最近の顧客</h2>
                <button className="text-sm font-medium text-blue-600 hover:text-blue-800 flex items-center gap-1">
                  すべて表示 <ArrowUpRight size={16} />
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200 text-xs uppercase tracking-wider text-gray-500 font-semibold">
                      <th className="px-6 py-4">名前</th>
                      <th className="px-6 py-4">メールアドレス</th>
                      <th className="px-6 py-4">登録LP</th>
                      <th className="px-6 py-4">登録日</th>
                      <th className="px-6 py-4">ステータス</th>
                      <th className="px-6 py-4 text-right">アクション</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    <TableRow 
                      name="山田 太郎" 
                      email="yamada@example.com" 
                      lp="秋の特別キャンペーン" 
                      date="2023-10-24" 
                      status="アクティブ" 
                      statusColor="green"
                    />
                    <TableRow 
                      name="佐藤 花子" 
                      email="sato@example.com" 
                      lp="無料ウェビナー登録" 
                      date="2023-10-23" 
                      status="アクティブ" 
                      statusColor="green"
                    />
                    <TableRow 
                      name="鈴木 一郎" 
                      email="suzuki@example.com" 
                      lp="ベーシックコース" 
                      date="2023-10-22" 
                      status="保留中" 
                      statusColor="orange"
                    />
                    <TableRow 
                      name="高橋 メアリー" 
                      email="takahashi@example.com" 
                      lp="秋の特別キャンペーン" 
                      date="2023-10-21" 
                      status="アクティブ" 
                      statusColor="green"
                    />
                    <TableRow 
                      name="伊藤 健太" 
                      email="ito@example.com" 
                      lp="無料ウェビナー登録" 
                      date="2023-10-20" 
                      status="解約" 
                      statusColor="gray"
                    />
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

function NavItem({ icon, label, active = false }: { icon: React.ReactNode, label: string, active?: boolean }) {
  return (
    <a 
      href="#" 
      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
        active 
          ? 'bg-blue-600/10 text-blue-500' 
          : 'text-[#A1A1AA] hover:bg-[#27272A] hover:text-white'
      }`}
    >
      <div className={active ? 'text-blue-500' : 'text-[#71717A]'}>
        {icon}
      </div>
      {label}
    </a>
  );
}

function KpiCard({ title, value, trend, trendUp }: { title: string, value: string, trend: string, trendUp: boolean }) {
  return (
    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
      <h3 className="text-sm font-medium text-gray-500 mb-1">{title}</h3>
      <div className="flex items-baseline gap-3">
        <p className="text-3xl font-bold text-gray-900 tracking-tight">{value}</p>
        <span className={`text-sm font-medium ${trendUp ? 'text-emerald-600' : 'text-red-500'}`}>
          {trend}
        </span>
      </div>
    </div>
  );
}

function TableRow({ name, email, lp, date, status, statusColor }: { name: string, email: string, lp: string, date: string, status: string, statusColor: 'green' | 'orange' | 'gray' }) {
  const colors = {
    green: 'bg-emerald-100 text-emerald-700',
    orange: 'bg-orange-100 text-orange-700',
    gray: 'bg-gray-100 text-gray-700'
  };

  return (
    <tr className="hover:bg-gray-50 transition-colors group">
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="font-medium text-gray-900">{name}</div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-gray-500 text-sm">{email}</div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-gray-600 text-sm">{lp}</div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-gray-500 text-sm">{date}</div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span className={`px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${colors[statusColor]}`}>
          {status}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
        <button className="text-gray-400 hover:text-gray-600 p-1 rounded transition-colors opacity-0 group-hover:opacity-100">
          <MoreHorizontal size={18} />
        </button>
      </td>
    </tr>
  );
}
