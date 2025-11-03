'use client';

import { useState, useEffect } from 'react';
import { Users, Plus, Share, UserPlus } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { useCurrency } from '@/contexts/CurrencyContext';
import toast from 'react-hot-toast';
import { teamService } from '@/lib/services/teamService';
import { Team, TeamMember, SharedExpense } from '@/types/team';

export function TeamCollaboration() {
  const { user } = useAuth();
  const { canAccessFeature } = useSubscription();
  const { formatAmount } = useCurrency();
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [sharedExpenses, setSharedExpenses] = useState<SharedExpense[]>([]);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showNewExpense, setShowNewExpense] = useState(false);
  const [loading, setLoading] = useState(true);

  const canAccessTeams = canAccessFeature('analytics'); // Using analytics as proxy for enterprise features

  useEffect(() => {
    if (user && canAccessTeams) {
      loadTeamData();
    } else if (!canAccessTeams) {
      setLoading(false);
    }
  }, [user, canAccessTeams]);

  const loadTeamData = async () => {
    try {
      setLoading(true);

      // Load team members and expenses in parallel
      const [membersResult, expensesResult] = await Promise.allSettled([
        teamService.getTeamMembers(),
        teamService.getSharedExpenses(),
      ]);

      if (membersResult.status === 'fulfilled') {
        setTeamMembers(membersResult.value.members);
      } else {
        console.error('Failed to load team members:', membersResult.reason);
        toast.error('Failed to load team members');
      }

      if (expensesResult.status === 'fulfilled') {
        setSharedExpenses(expensesResult.value);
      } else {
        console.error('Failed to load shared expenses:', expensesResult.reason);
        toast.error('Failed to load shared expenses');
      }
    } catch (error) {
      console.error('Error loading team data:', error);
      toast.error('Failed to load team data');
    } finally {
      setLoading(false);
    }
  };

  const handleInviteMember = async (email: string) => {
    try {
      const result = await teamService.inviteTeamMember(email);
      toast.success(result.message);
      setShowInviteModal(false);
    } catch (error) {
      console.error('Error inviting member:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to send invitation');
    }
  };

  const handleCreateSharedExpense = async (expense: Omit<SharedExpense, 'id' | 'paidBy' | 'paidByName' | 'createdAt' | 'updatedAt' | 'isActive' | 'createdBy' | 'teamId'>) => {
    try {
      const result = await teamService.createSharedExpense(expense);
      toast.success(result.message);
      setShowNewExpense(false);

      // Refresh expenses
      const expensesResult = await teamService.getSharedExpenses();
      setSharedExpenses(expensesResult);
    } catch (error) {
      console.error('Error creating shared expense:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to create shared expense');
    }
  };

  if (!canAccessTeams) {
    return (
      <div className="bg-slate-900/50 border border-slate-800 backdrop-blur-sm p-6 rounded-lg">
        <div className="text-center">
          <Users className="h-12 w-12 text-slate-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-400 mb-2">Team Collaboration</h3>
          <p className="text-slate-500 mb-4">Share expenses and collaborate with your team members.</p>
          <div className="bg-amber-900/20 border border-amber-700/50 rounded-md p-4">
            <p className="text-amber-300 text-sm">
              👥 Team collaboration features are available with Enterprise plans.
              <a href="/subscription" className="text-amber-400 hover:text-amber-300 underline ml-1">
                Upgrade now
              </a>
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-900/50 border border-slate-800 backdrop-blur-sm p-6 rounded-lg">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Users className="h-6 w-6 text-amber-400" />
          <h3 className="text-lg font-semibold text-slate-100">Team Collaboration</h3>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowInviteModal(true)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-md transition-colors flex items-center gap-2"
          >
            <UserPlus className="h-4 w-4" />
            Invite Member
          </button>
          <button
            onClick={() => setShowNewExpense(true)}
            className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-sm font-medium rounded-md transition-colors flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Shared Expense
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-amber-400 border-t-transparent"></div>
          <span className="ml-3 text-slate-400">Loading team data...</span>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Team Members */}
          <div>
            <h4 className="text-slate-200 font-semibold mb-4">Team Members ({teamMembers.length})</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {teamMembers.map((member) => (
                <div key={member.id} className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h5 className="font-semibold text-slate-200">{member.displayName}</h5>
                      <p className="text-slate-400 text-sm">{member.email}</p>
                    </div>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      member.role === 'owner' ? 'bg-amber-600 text-slate-900' :
                      member.role === 'admin' ? 'bg-blue-600 text-white' :
                      'bg-slate-600 text-slate-200'
                    }`}>
                      {member.role}
                    </span>
                  </div>
                  <div className="text-slate-500 text-xs">
                    Joined {member.joinedAt.toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Shared Expenses */}
          <div>
            <h4 className="text-slate-200 font-semibold mb-4">Shared Expenses</h4>
            {sharedExpenses.length === 0 ? (
              <div className="text-center py-8 bg-slate-800/50 rounded-lg">
                <Share className="h-12 w-12 text-slate-600 mx-auto mb-4" />
                <h5 className="text-slate-400 font-semibold mb-2">No Shared Expenses</h5>
                <p className="text-slate-500 text-sm mb-4">Create your first shared expense to get started.</p>
                <button
                  onClick={() => setShowNewExpense(true)}
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-sm font-medium rounded-md transition-colors"
                >
                  Create Shared Expense
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {sharedExpenses.map((expense) => (
                  <div key={expense.id} className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h5 className="font-semibold text-slate-200 mb-1">{expense.title}</h5>
                        <p className="text-slate-400 text-sm mb-2">{expense.description}</p>
                        <div className="flex items-center gap-4 text-sm text-slate-500">
                          <span>{expense.category}</span>
                          <span>{expense.date.toLocaleDateString()}</span>
                          <span>Paid by {expense.paidByName}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xl font-bold text-slate-100">{formatAmount(expense.amount)}</div>
                        <div className="text-slate-500 text-sm">
                          Split {expense.splitBetween.length} ways
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Invite Member Modal */}
      {showInviteModal && (
        <InviteMemberModal
          onClose={() => setShowInviteModal(false)}
          onInvite={handleInviteMember}
        />
      )}

      {/* New Shared Expense Modal */}
      {showNewExpense && (
        <NewSharedExpenseModal
          onClose={() => setShowNewExpense(false)}
          onCreate={handleCreateSharedExpense}
          teamMembers={teamMembers}
        />
      )}
    </div>
  );
}

function InviteMemberModal({ onClose, onInvite }: {
  onClose: () => void;
  onInvite: (email: string) => void;
}) {
  const [email, setEmail] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      onInvite(email.trim());
      setEmail('');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-40">
      <div className="bg-slate-950 border border-amber-700/30 rounded-lg shadow-2xl max-w-md w-full p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-serif text-slate-100">Invite Team Member</h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 transition-colors"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-md px-4 py-2 text-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500"
              placeholder="colleague@company.com"
              required
            />
          </div>

          <div className="bg-blue-900/20 border border-blue-700/50 rounded-md p-4">
            <p className="text-blue-300 text-sm">
              📧 An invitation will be sent to this email address. They can join your team and start collaborating on shared expenses.
            </p>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-300 hover:text-slate-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-medium rounded-md transition-colors"
            >
              Send Invitation
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function NewSharedExpenseModal({ onClose, onCreate, teamMembers }: {
  onClose: () => void;
  onCreate: (expense: Omit<SharedExpense, 'id' | 'paidBy' | 'paidByName'>) => void;
  teamMembers: TeamMember[];
}) {
  const [formData, setFormData] = useState({
    title: '',
    amount: '',
    category: 'Food',
    splitBetween: [] as string[],
    date: new Date().toISOString().split('T')[0],
    description: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.amount || formData.splitBetween.length === 0) return;

    onCreate({
      title: formData.title.trim(),
      amount: parseFloat(formData.amount),
      category: formData.category,
      splitBetween: formData.splitBetween,
      date: new Date(formData.date),
      description: formData.description.trim() || undefined
    });
  };

  const toggleMember = (memberId: string) => {
    setFormData(prev => ({
      ...prev,
      splitBetween: prev.splitBetween.includes(memberId)
        ? prev.splitBetween.filter(id => id !== memberId)
        : [...prev.splitBetween, memberId]
    }));
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-40">
      <div className="bg-slate-950 border border-amber-700/30 rounded-lg shadow-2xl max-w-2xl w-full p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-serif text-slate-100">Create Shared Expense</h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 transition-colors"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Title
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                className="w-full bg-slate-800 border border-slate-700 rounded-md px-4 py-2 text-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500"
                placeholder="Team lunch"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Amount
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.amount}
                onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                className="w-full bg-slate-800 border border-slate-700 rounded-md px-4 py-2 text-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500"
                placeholder="45.50"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Category
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                className="w-full bg-slate-800 border border-slate-700 rounded-md px-4 py-2 text-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                <option value="Food">Food</option>
                <option value="Transportation">Transportation</option>
                <option value="Entertainment">Entertainment</option>
                <option value="Office">Office</option>
                <option value="Travel">Travel</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Date
              </label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                className="w-full bg-slate-800 border border-slate-700 rounded-md px-4 py-2 text-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Description (Optional)
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={2}
              className="w-full bg-slate-800 border border-slate-700 rounded-md px-4 py-2 text-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500"
              placeholder="Additional details about this expense..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-3">
              Split Between (Select team members)
            </label>
            <div className="grid grid-cols-2 gap-2">
              {teamMembers.map((member) => (
                <label key={member.id} className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-md hover:bg-slate-700/50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.splitBetween.includes(member.userId)}
                    onChange={() => toggleMember(member.userId)}
                    className="text-amber-400 focus:ring-amber-500"
                  />
                  <div>
                    <div className="text-slate-200 font-medium">{member.displayName}</div>
                    <div className="text-slate-400 text-sm">{member.email}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-300 hover:text-slate-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-medium rounded-md transition-colors"
            >
              Create Shared Expense
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
