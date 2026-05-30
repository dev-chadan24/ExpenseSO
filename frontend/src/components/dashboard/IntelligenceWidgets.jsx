import React, { useState, useEffect, useCallback } from 'react';
import { 
  TrendingUp, Shield, Car, Home, Plane, Calendar, Sparkles, 
  CheckCircle2, Clock, Coins, Plus, Trash2, Edit2, CheckSquare, 
  Square, AlertCircle, ArrowUpRight, ArrowDownRight
} from 'lucide-react';
import { useCurrency } from '../../context/CurrencyContext';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Modal from '../ui/Modal';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

// ---------------------------------------------------------
// Helper for logging audit activities
// ---------------------------------------------------------
export const logActivity = (action) => {
  try {
    const logs = JSON.parse(localStorage.getItem('expenseso_activity_log') || '[]');
    const newLog = {
      id: Date.now(),
      action,
      timestamp: new Date().toISOString()
    };
    localStorage.setItem('expenseso_activity_log', JSON.stringify([newLog, ...logs].slice(0, 30)));
    // Dispatch custom event to notify widgets
    window.dispatchEvent(new Event('expenseso-activity-updated'));
  } catch (err) {
    console.error('Failed to write audit activity log', err);
  }
};

// ---------------------------------------------------------
// 1. Net Worth Tracker Widget
// ---------------------------------------------------------
export function NetWorthTracker() {
  const { formatCurrency } = useCurrency();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [netWorthData, setNetWorthData] = useState(() => {
    const saved = localStorage.getItem('expenseso_net_worth');
    if (saved) return JSON.parse(saved);
    return {
      savings: 450000,
      investments: 820000,
      cash: 50000,
      loans: 200000,
      ccDebt: 30000,
      otherLiabilities: 40000
    };
  });

  const [formValues, setFormValues] = useState({ ...netWorthData });

  const handleSave = (e) => {
    e.preventDefault();
    const updated = {
      savings: parseFloat(formValues.savings) || 0,
      investments: parseFloat(formValues.investments) || 0,
      cash: parseFloat(formValues.cash) || 0,
      loans: parseFloat(formValues.loans) || 0,
      ccDebt: parseFloat(formValues.ccDebt) || 0,
      otherLiabilities: parseFloat(formValues.otherLiabilities) || 0
    };
    setNetWorthData(updated);
    localStorage.setItem('expenseso_net_worth', JSON.stringify(updated));
    logActivity('Updated wealth assets and liability parameters');
    toast.success('Net Worth variables synchronized!');
    setIsModalOpen(false);
  };

  const totalAssets = netWorthData.savings + netWorthData.investments + netWorthData.cash;
  const totalLiabilities = netWorthData.loans + netWorthData.ccDebt + netWorthData.otherLiabilities;
  const netWorth = totalAssets - totalLiabilities;
  
  const assetRatio = totalAssets > 0 ? (totalAssets / (totalAssets + totalLiabilities)) * 100 : 100;

  return (
    <Card className="p-6 border border-dark-border/60 hover:border-dark-subtle/80 transition-all duration-300">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="section-title text-sm flex items-center gap-2">
            <Coins className="w-4 h-4 text-accent-green" />
            Net Worth Tracker
          </h3>
          <p className="text-xs text-slate-400 mt-1 font-sans">Synthesized personal balance sheet</p>
        </div>
        <button 
          onClick={() => {
            setFormValues({ ...netWorthData });
            setIsModalOpen(true);
          }}
          className="text-[10px] font-bold text-primary-400 hover:text-primary-300 transition-colors uppercase tracking-wider"
        >
          Configure
        </button>
      </div>

      <div className="my-6 text-center">
        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Calculated Net Value</p>
        <h2 className="text-3xl font-extrabold text-white mt-1 leading-none font-display">
          {formatCurrency(netWorth)}
        </h2>
      </div>

      <div className="space-y-4">
        {/* Assets vs Liabilities bar */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider">
            <span className="text-accent-green">Assets ({formatCurrency(totalAssets)})</span>
            <span className="text-accent-red">Debt ({formatCurrency(totalLiabilities)})</span>
          </div>
          <div className="h-2 w-full bg-accent-red/20 rounded-full overflow-hidden flex">
            <div 
              className="h-full bg-gradient-to-r from-accent-green to-emerald-400"
              style={{ width: `${assetRatio}%` }}
            />
          </div>
        </div>

        {/* Detailed Breakdown */}
        <div className="grid grid-cols-2 gap-4 pt-3 border-t border-dark-border/40 text-xs">
          <div className="space-y-2 border-r border-dark-border/40 pr-2">
            <div className="flex justify-between">
              <span className="text-slate-400">Liquid Savings:</span>
              <span className="font-semibold text-slate-200 font-mono">{formatCurrency(netWorthData.savings)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Investments:</span>
              <span className="font-semibold text-slate-200 font-mono">{formatCurrency(netWorthData.investments)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Physical Cash:</span>
              <span className="font-semibold text-slate-200 font-mono">{formatCurrency(netWorthData.cash)}</span>
            </div>
          </div>
          <div className="space-y-2 pl-2">
            <div className="flex justify-between">
              <span className="text-slate-400">Loans/EMI:</span>
              <span className="font-semibold text-slate-200 font-mono">{formatCurrency(netWorthData.loans)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Credit Cards:</span>
              <span className="font-semibold text-slate-200 font-mono">{formatCurrency(netWorthData.ccDebt)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Liabilities:</span>
              <span className="font-semibold text-slate-200 font-mono">{formatCurrency(netWorthData.otherLiabilities)}</span>
            </div>
          </div>
        </div>
      </div>

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        title="Asset & Liability Configurations"
      >
        <form onSubmit={handleSave} className="space-y-4">
          <h4 className="text-xs font-bold text-accent-green uppercase tracking-wider">Asset Accounts</h4>
          <div className="grid grid-cols-3 gap-3">
            <Input 
              label="Liquid Savings" 
              type="number" 
              value={formValues.savings} 
              onChange={e => setFormValues({ ...formValues, savings: e.target.value })}
            />
            <Input 
              label="Investments" 
              type="number" 
              value={formValues.investments} 
              onChange={e => setFormValues({ ...formValues, investments: e.target.value })}
            />
            <Input 
              label="Physical Cash" 
              type="number" 
              value={formValues.cash} 
              onChange={e => setFormValues({ ...formValues, cash: e.target.value })}
            />
          </div>

          <h4 className="text-xs font-bold text-accent-red uppercase tracking-wider pt-2 border-t border-dark-border">Liabilities</h4>
          <div className="grid grid-cols-3 gap-3">
            <Input 
              label="Loans / Mortgages" 
              type="number" 
              value={formValues.loans} 
              onChange={e => setFormValues({ ...formValues, loans: e.target.value })}
            />
            <Input 
              label="Credit Card Debt" 
              type="number" 
              value={formValues.ccDebt} 
              onChange={e => setFormValues({ ...formValues, ccDebt: e.target.value })}
            />
            <Input 
              label="Other Debts" 
              type="number" 
              value={formValues.otherLiabilities} 
              onChange={e => setFormValues({ ...formValues, otherLiabilities: e.target.value })}
            />
          </div>

          <div className="flex gap-3 justify-end pt-4 border-t border-dark-border">
            <Button variant="ghost" type="button" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button type="submit" variant="primary">Synchronize Wealth</Button>
          </div>
        </form>
      </Modal>
    </Card>
  );
}

// ---------------------------------------------------------
// 2. Goal Management Widget
// ---------------------------------------------------------
const GOAL_ICONS = {
  Emergency: Shield,
  Car: Car,
  Home: Home,
  Vacation: Plane,
  Retirement: Coins
};

export function GoalManagement() {
  const { formatCurrency } = useCurrency();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [goals, setGoals] = useState(() => {
    const saved = localStorage.getItem('expenseso_financial_goals');
    if (saved) return JSON.parse(saved);
    return [
      { id: 1, name: 'Emergency Fund', category: 'Emergency', target: 150000, saved: 90000, targetYear: 2027 },
      { id: 2, name: 'Tata Harrier Car', category: 'Car', target: 800000, saved: 240000, targetYear: 2028 },
      { id: 3, name: 'Apartment Downpayment', category: 'Home', target: 1500000, saved: 450000, targetYear: 2029 },
      { id: 4, name: 'European Vacation', category: 'Vacation', target: 300000, saved: 150000, targetYear: 2026 },
      { id: 5, name: 'Retirement Wealth SIP', category: 'Retirement', target: 5000000, saved: 1250000, targetYear: 2035 }
    ];
  });

  const [formData, setFormData] = useState({ name: '', category: 'Emergency', target: '', saved: '', targetYear: new Date().getFullYear() + 2 });

  const saveGoals = (newGoals) => {
    setGoals(newGoals);
    localStorage.setItem('expenseso_financial_goals', JSON.stringify(newGoals));
  };

  const handleAddGoal = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.target || !formData.saved) {
      toast.error('Fill in all goal fields');
      return;
    }
    const newGoal = {
      id: Date.now(),
      name: formData.name,
      category: formData.category,
      target: parseFloat(formData.target) || 0,
      saved: parseFloat(formData.saved) || 0,
      targetYear: parseInt(formData.targetYear) || (new Date().getFullYear() + 2)
    };
    const updated = [...goals, newGoal];
    saveGoals(updated);
    logActivity(`Added wealth goal: ${newGoal.name}`);
    toast.success('Wealth milestone registered!');
    setIsModalOpen(false);
    setFormData({ name: '', category: 'Emergency', target: '', saved: '', targetYear: new Date().getFullYear() + 2 });
  };

  const handleDelete = (id, name) => {
    if (window.confirm(`Are you sure you want to delete "${name}" goal?`)) {
      const updated = goals.filter(g => g.id !== id);
      saveGoals(updated);
      logActivity(`Deleted goal: ${name}`);
      toast.success('Goal milestone deleted');
    }
  };

  return (
    <Card className="p-6 border border-dark-border/60 hover:border-dark-subtle/80 transition-all duration-300 flex flex-col justify-between h-full">
      <div>
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="section-title text-sm flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-primary-400" />
              Wealth & Savings Goals
            </h3>
            <p className="text-xs text-slate-400 mt-1 font-sans">Strategic target progression</p>
          </div>
          <Button 
            variant="primary" 
            size="sm"
            icon={Plus}
            onClick={() => setIsModalOpen(true)}
            className="py-1.5 px-3 text-[10px]"
          >
            Create Goal
          </Button>
        </div>

        <div className="space-y-5">
          {goals.map((g) => {
            const Icon = GOAL_ICONS[g.category] || Coins;
            const percentage = Math.min(100, Math.round((g.saved / g.target) * 100));
            return (
              <div key={g.id} className="group relative space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <div className="flex items-center gap-2.5">
                    <div className="p-1.5 rounded-lg bg-dark-elevated text-slate-300 group-hover:text-white transition-colors">
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <span className="font-bold text-white block leading-tight">{g.name}</span>
                      <span className="text-[10px] text-slate-500 font-semibold font-sans">Est. completion: {g.targetYear}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-slate-300 font-bold font-sans">
                      {formatCurrency(g.saved)} <span className="text-slate-500 font-semibold">/ {formatCurrency(g.target)}</span>
                    </span>
                    <button 
                      onClick={() => handleDelete(g.id, g.name)}
                      className="p-1 rounded bg-accent-red/10 text-accent-red opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Remove Goal"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                <div className="relative w-full h-2 bg-dark-elevated rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-primary-500 to-accent-cyan rounded-full transition-all duration-500"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <div className="flex justify-between items-center text-[9px] font-bold text-slate-500 uppercase tracking-widest font-mono">
                  <span>{percentage}% ACCUMULATED</span>
                  <span>{formatCurrency(g.target - g.saved)} REMAINING</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Define Wealth Milestone">
        <form onSubmit={handleAddGoal} className="space-y-4">
          <Input 
            label="Goal Name" 
            placeholder="e.g. Vacation, Car Fund" 
            value={formData.name} 
            onChange={e => setFormData({ ...formData, name: e.target.value })} 
            required
          />

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="input-label">Category / Icon</label>
              <select 
                value={formData.category} 
                onChange={e => setFormData({ ...formData, category: e.target.value })}
                className="input-field cursor-pointer appearance-none"
              >
                <option value="Emergency">Emergency (Shield)</option>
                <option value="Car">Car (Car)</option>
                <option value="Home">Home (Home)</option>
                <option value="Vacation">Vacation (Plane)</option>
                <option value="Retirement">Retirement (Coins)</option>
              </select>
            </div>
            <Input 
              label="Estimated Finish Year" 
              type="number" 
              value={formData.targetYear} 
              onChange={e => setFormData({ ...formData, targetYear: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input 
              label="Target Goal Sum" 
              type="number" 
              placeholder="0" 
              value={formData.target} 
              onChange={e => setFormData({ ...formData, target: e.target.value })}
              required
            />
            <Input 
              label="Already Accumulated" 
              type="number" 
              placeholder="0" 
              value={formData.saved} 
              onChange={e => setFormData({ ...formData, saved: e.target.value })}
              required
            />
          </div>

          <div className="flex gap-3 justify-end pt-4 border-t border-dark-border">
            <Button variant="ghost" type="button" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button type="submit" variant="primary">Lock In Goal</Button>
          </div>
        </form>
      </Modal>
    </Card>
  );
}

// ---------------------------------------------------------
// 3. Financial Calendar Widget
// ---------------------------------------------------------
export function FinancialCalendar() {
  const { formatCurrency } = useCurrency();
  const [calendarEvents, setCalendarEvents] = useState(() => {
    const saved = localStorage.getItem('expenseso_financial_events');
    if (saved) return JSON.parse(saved);
    return [
      { id: 1, day: 5, description: 'HDFC Home Loan EMI Due', amount: 24500, type: 'liability', completed: false },
      { id: 2, day: 10, description: 'SIP Mutual Funds Transfer', amount: 10000, type: 'investment', completed: false },
      { id: 3, day: 15, description: 'Tata Power Electricity Bill', amount: 4200, type: 'expense', completed: false },
      { id: 4, day: 20, description: 'HDFC Credit Card Payment', amount: 15600, type: 'liability', completed: false },
      { id: 5, day: 28, description: 'Airtel Fiber Broadband Wifi', amount: 1499, type: 'expense', completed: false }
    ];
  });

  const toggleComplete = (id, description, completed) => {
    const updated = calendarEvents.map(e => e.id === id ? { ...e, completed: !e.completed } : e);
    setCalendarEvents(updated);
    localStorage.setItem('expenseso_financial_events', JSON.stringify(updated));
    logActivity(`${completed ? 'Unmarked' : 'Cleared'} billing schedule: ${description}`);
    toast.success(completed ? 'Item marked unpaid.' : 'Invoice schedule marked as cleared!');
  };

  return (
    <Card className="p-6 border border-dark-border/60 hover:border-dark-subtle/80 transition-all duration-300 h-full flex flex-col justify-between">
      <div>
        <h3 className="section-title text-sm flex items-center gap-2 mb-1">
          <Calendar className="w-4 h-4 text-accent-amber" />
          Financial Calendar
        </h3>
        <p className="text-xs text-slate-400 mb-6 font-sans">Upcoming schedules & recurring debits</p>

        <div className="space-y-3.5">
          {calendarEvents.map((evt) => (
            <div 
              key={evt.id} 
              className={`flex items-center justify-between p-3 rounded-2xl border transition-all duration-200 ${
                evt.completed 
                  ? 'bg-dark-muted/20 border-dark-border/40 opacity-55' 
                  : 'bg-dark-elevated border-dark-border hover:border-dark-subtle'
              }`}
            >
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => toggleComplete(evt.id, evt.description, evt.completed)}
                  className="text-slate-500 hover:text-white transition-colors"
                  aria-label="Toggle payment completion"
                >
                  {evt.completed ? (
                    <CheckSquare className="w-4 h-4 text-accent-green" />
                  ) : (
                    <Square className="w-4 h-4" />
                  )}
                </button>
                <div>
                  <span className={`text-xs font-bold block ${evt.completed ? 'line-through text-slate-500' : 'text-white'}`}>
                    {evt.description}
                  </span>
                  <span className="text-[10px] text-slate-500 font-semibold font-sans">
                    Due Date: {evt.day}th of month · <span className="capitalize">{evt.type}</span>
                  </span>
                </div>
              </div>
              <div className="text-right">
                <span className={`text-xs font-mono font-bold ${
                  evt.completed ? 'text-slate-500' : 'text-slate-200'
                }`}>
                  {formatCurrency(evt.amount)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-dark-border/40 flex justify-between items-center text-[10px] text-slate-500 font-bold uppercase tracking-wider">
        <span>Active schedules: {calendarEvents.filter(e => !e.completed).length}</span>
        <span>Cleared: {calendarEvents.filter(e => e.completed).length}</span>
      </div>
    </Card>
  );
}

// ---------------------------------------------------------
// 4. AI Spending Insights Widget
// ---------------------------------------------------------
export function AISpendingInsights() {
  const [insights, setInsights] = useState([
    {
      id: 1,
      type: 'warning',
      title: 'Food & Dining Incline',
      message: 'Your Food & Dining expenditures are up 12% compared to last month. Swiggy deliveries on weekends account for 65% of this increase.',
      action: 'Consider weekly grocery budgets to offset dining expenses.'
    },
    {
      id: 2,
      type: 'success',
      title: 'Investment Recommendation',
      message: 'Great job! You\'ve maintained a 52% savings rate. We recommend transferring an extra ₹10,000 to your Retirement SIP to accelerate your target by 4 months.',
      action: 'Tap "Tuning" in Budgets to increase allocations.'
    },
    {
      id: 3,
      type: 'info',
      title: 'EMI Buffer Alert',
      message: 'Your upcoming HDFC Home Loan EMI of ₹24,500 is due in 5 days. Ensure your HDFC account balance has sufficient funds to avoid late fees.',
      action: 'Mark complete in the Calendar when payment is initiated.'
    }
  ]);

  const removeInsight = (id) => {
    setInsights(insights.filter(ins => ins.id !== id));
  };

  return (
    <Card className="p-6 border border-dark-border/60 hover:border-dark-subtle/80 transition-all duration-300 h-full flex flex-col justify-between">
      <div>
        <h3 className="section-title text-sm flex items-center gap-2 mb-1">
          <Sparkles className="w-4 h-4 text-primary-400" />
          AI Financial Insights
        </h3>
        <p className="text-xs text-slate-400 mb-6 font-sans">Automated analysis & wealth tips</p>

        {insights.length === 0 ? (
          <div className="text-center py-8">
            <CheckCircle2 className="w-10 h-10 text-accent-green mx-auto mb-3 opacity-60" />
            <p className="text-xs text-slate-400 font-bold">All clear!</p>
            <p className="text-[10px] text-slate-500 mt-1 font-sans">AI engine will supply updates based on cashflow fluctuations.</p>
          </div>
        ) : (
          <div className="space-y-4">
            <AnimatePresence>
              {insights.map((ins) => (
                <motion.div 
                  key={ins.id}
                  initial={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0, marginBottom: 0, overflow: 'hidden' }}
                  transition={{ duration: 0.25 }}
                  className={`p-3.5 rounded-2xl border text-xs relative group ${
                    ins.type === 'warning' 
                      ? 'bg-accent-red/5 border-accent-red/20 text-accent-red' 
                      : ins.type === 'success'
                        ? 'bg-accent-green/5 border-accent-green/20 text-accent-green'
                        : 'bg-primary-50/5 border-primary-500/20 text-primary-300'
                  }`}
                >
                  <button 
                    onClick={() => removeInsight(ins.id)}
                    className="absolute top-3 right-3 text-slate-500 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity"
                    aria-label="Dismiss insight"
                  >
                    ×
                  </button>
                  <h4 className="font-bold mb-1.5 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    {ins.title}
                  </h4>
                  <p className="text-slate-300 font-sans leading-relaxed mb-2">
                    {ins.message}
                  </p>
                  <p className="text-[10px] font-semibold text-slate-400 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3 flex-shrink-0" />
                    <span>Action: {ins.action}</span>
                  </p>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      <div className="mt-4 text-[9px] font-semibold text-slate-500 uppercase tracking-widest text-right">
        Analysis updated: Just now
      </div>
    </Card>
  );
}

// ---------------------------------------------------------
// 5. Audit Activity Log Widget
// ---------------------------------------------------------
export function AuditActivityLog() {
  const [logs, setLogs] = useState([]);

  const loadLogs = useCallback(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('expenseso_activity_log') || '[]');
      // Fallback seed if logs are empty
      if (saved.length === 0) {
        const seedLogs = [
          { id: 1, action: 'Initial system login from bypass mode', timestamp: new Date(Date.now() - 3600000).toISOString() },
          { id: 2, action: 'Profile settings updated', timestamp: new Date(Date.now() - 7200000).toISOString() },
          { id: 3, action: 'Currency preference synchronized to INR', timestamp: new Date(Date.now() - 10800000).toISOString() }
        ];
        localStorage.setItem('expenseso_activity_log', JSON.stringify(seedLogs));
        setLogs(seedLogs);
      } else {
        setLogs(saved.slice(0, 5));
      }
    } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    loadLogs();
    window.addEventListener('expenseso-activity-updated', loadLogs);
    return () => window.removeEventListener('expenseso-activity-updated', loadLogs);
  }, [loadLogs]);

  const clearLogs = () => {
    if (window.confirm('Wipe system logs?')) {
      localStorage.setItem('expenseso_activity_log', '[]');
      setLogs([]);
      toast.success('Audit trail wiped!');
    }
  };

  const formatDistanceToNow = (dateStr) => {
    try {
      const diffMs = Date.now() - new Date(dateStr).getTime();
      const diffMins = Math.floor(diffMs / 60000);
      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins}m ago`;
      const diffHours = Math.floor(diffMins / 60);
      if (diffHours < 24) return `${diffHours}h ago`;
      return new Date(dateStr).toLocaleDateString();
    } catch {
      return 'Recent';
    }
  };

  return (
    <Card className="p-6 border border-dark-border/60 hover:border-dark-subtle/80 transition-all duration-300 h-full flex flex-col justify-between">
      <div>
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="section-title text-sm flex items-center gap-2">
              <Clock className="w-4 h-4 text-slate-400" />
              Audit Activity Log
            </h3>
            <p className="text-xs text-slate-400 mt-1 font-sans">Real-time local actions trail</p>
          </div>
          {logs.length > 0 && (
            <button 
              onClick={clearLogs}
              className="text-[10px] font-bold text-accent-red hover:text-red-400 transition-colors uppercase tracking-wider"
            >
              Wipe Logs
            </button>
          )}
        </div>

        {logs.length === 0 ? (
          <div className="text-center py-8">
            <Clock className="w-8 h-8 text-slate-600 mx-auto mb-2 opacity-50" />
            <p className="text-xs text-slate-400 font-bold">Audit trail is empty</p>
          </div>
        ) : (
          <div className="space-y-4">
            {logs.map((log, idx) => (
              <div key={log.id} className="flex gap-3 text-xs items-start group">
                <div className="relative flex flex-col items-center">
                  <div className="w-2 h-2 rounded-full bg-slate-500 mt-1 flex-shrink-0" />
                  {idx !== logs.length - 1 && (
                    <div className="w-0.5 h-10 bg-dark-border flex-shrink-0" />
                  )}
                </div>
                <div>
                  <p className="text-slate-300 font-sans leading-snug">{log.action}</p>
                  <span className="text-[10px] text-slate-500 font-semibold font-mono mt-0.5 block">
                    {formatDistanceToNow(log.timestamp)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mt-4 text-[9px] font-semibold text-slate-500 uppercase tracking-widest text-right">
        SYSTEM SECURED
      </div>
    </Card>
  );
}
