import { useState } from 'react'

function Tabs({ tabs, defaultTab = 0 }) {
  const [activeTab, setActiveTab] = useState(defaultTab)

  return (
    <div className="bg-slate-800 rounded-lg shadow-lg border border-slate-700">
      {/* Tab Headers */}
      <div className="border-b border-slate-700">
        <div className="flex overflow-x-auto">
          {tabs.map((tab, index) => (
            <button
              key={index}
              onClick={() => setActiveTab(index)}
              className={`px-6 py-4 font-semibold text-sm whitespace-nowrap transition-colors border-b-2 ${
                activeTab === index
                  ? 'border-blue-500 text-blue-400 bg-slate-900/50'
                  : 'border-transparent text-slate-400 hover:text-slate-300 hover:bg-slate-700/30'
              }`}
            >
              <span className="flex items-center gap-2">
                {tab.icon && <span>{tab.icon}</span>}
                <span>{tab.label}</span>
                {tab.badge && (
                  <span className="px-2 py-0.5 bg-blue-600 text-white text-xs rounded-full">
                    {tab.badge}
                  </span>
                )}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="p-6">
        {tabs[activeTab]?.content}
      </div>
    </div>
  )
}

export default Tabs
