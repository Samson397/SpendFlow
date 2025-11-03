import { httpsCallable } from 'firebase/functions';
import { getFunctions } from 'firebase/functions';
import { getApp } from 'firebase/app';
import { Team, TeamMember, SharedExpense } from '@/types/team';

class TeamService {
  private static instance: TeamService;
  private functions = getFunctions(getApp());

  private constructor() {}

  static getInstance(): TeamService {
    if (!TeamService.instance) {
      TeamService.instance = new TeamService();
    }
    return TeamService.instance;
  }

  // ========== TEAM MANAGEMENT ==========

  /**
   * Create a new team
   */
  async createTeam(teamName: string, description?: string): Promise<{ teamId: string; message: string }> {
    try {
      const createTeamFn = httpsCallable(this.functions, 'createTeam');
      const result = await createTeamFn({ name: teamName, description });

      if (!result.data || typeof result.data !== 'object') {
        throw new Error('Invalid response from server');
      }

      const data = result.data as { success: boolean; teamId?: string; message?: string };

      if (!data.success) {
        throw new Error(data.message || 'Failed to create team');
      }

      return {
        teamId: data.teamId!,
        message: data.message || 'Team created successfully'
      };
    } catch (error) {
      console.error('Error creating team:', error);
      throw error;
    }
  }

  /**
   * Get user's current team information
   */
  async getUserTeam(): Promise<{
    team: Team | null;
    role: 'owner' | 'admin' | 'member' | null;
    memberSince: Date | null;
  } | null> {
    try {
      const getUserTeamFn = httpsCallable(this.functions, 'getUserTeam');
      const result = await getUserTeamFn();

      if (!result.data || typeof result.data !== 'object') {
        return null;
      }

      const data = result.data as {
        success: boolean;
        team?: any;
        role?: string;
        memberSince?: any;
      };

      if (!data.success) {
        return null;
      }

      return {
        team: data.team ? {
          ...data.team,
          createdAt: new Date(data.team.createdAt),
          updatedAt: new Date(data.team.updatedAt),
        } : null,
        role: data.role as 'owner' | 'admin' | 'member' || null,
        memberSince: data.memberSince ? new Date(data.memberSince) : null,
      };
    } catch (error) {
      console.error('Error getting user team:', error);
      throw error;
    }
  }

  /**
   * Get all members of the user's team
   */
  async getTeamMembers(): Promise<{
    members: TeamMember[];
    userRole: 'owner' | 'admin' | 'member';
  }> {
    try {
      const getTeamMembersFn = httpsCallable(this.functions, 'getTeamMembers');
      const result = await getTeamMembersFn();

      if (!result.data || typeof result.data !== 'object') {
        throw new Error('Invalid response from server');
      }

      const data = result.data as {
        success: boolean;
        members?: any[];
        userRole?: string;
      };

      if (!data.success) {
        throw new Error('Failed to get team members');
      }

      return {
        members: (data.members || []).map(member => ({
          ...member,
          joinedAt: new Date(member.joinedAt),
          invitationAcceptedAt: member.invitationAcceptedAt ? new Date(member.invitationAcceptedAt) : undefined,
        })),
        userRole: data.userRole as 'owner' | 'admin' | 'member',
      };
    } catch (error) {
      console.error('Error getting team members:', error);
      throw error;
    }
  }

  /**
   * Invite a new member to the team
   */
  async inviteTeamMember(email: string): Promise<{ message: string }> {
    try {
      const inviteTeamMemberFn = httpsCallable(this.functions, 'inviteTeamMember');
      const result = await inviteTeamMemberFn({ email });

      if (!result.data || typeof result.data !== 'object') {
        throw new Error('Invalid response from server');
      }

      const data = result.data as { success: boolean; message?: string };

      if (!data.success) {
        throw new Error(data.message || 'Failed to send invitation');
      }

      return {
        message: data.message || 'Invitation sent successfully',
      };
    } catch (error) {
      console.error('Error inviting team member:', error);
      throw error;
    }
  }

  // ========== SHARED EXPENSES ==========

  /**
   * Create a new shared expense
   */
  async createSharedExpense(expenseData: {
    title: string;
    amount: number;
    category: string;
    splitBetween: string[];
    date: Date;
    description?: string;
  }): Promise<{ expenseId: string; message: string }> {
    try {
      const createSharedExpenseFn = httpsCallable(this.functions, 'createSharedExpense');
      const result = await createSharedExpenseFn({
        ...expenseData,
        date: expenseData.date.toISOString(),
      });

      if (!result.data || typeof result.data !== 'object') {
        throw new Error('Invalid response from server');
      }

      const data = result.data as {
        success: boolean;
        expenseId?: string;
        message?: string;
      };

      if (!data.success) {
        throw new Error(data.message || 'Failed to create shared expense');
      }

      return {
        expenseId: data.expenseId!,
        message: data.message || 'Shared expense created successfully',
      };
    } catch (error) {
      console.error('Error creating shared expense:', error);
      throw error;
    }
  }

  /**
   * Get all shared expenses for the user's team
   */
  async getSharedExpenses(): Promise<SharedExpense[]> {
    try {
      const getSharedExpensesFn = httpsCallable(this.functions, 'getSharedExpenses');
      const result = await getSharedExpensesFn();

      if (!result.data || typeof result.data !== 'object') {
        throw new Error('Invalid response from server');
      }

      const data = result.data as { success: boolean; expenses?: any[] };

      if (!data.success) {
        throw new Error('Failed to get shared expenses');
      }

      return (data.expenses || []).map(expense => ({
        ...expense,
        date: new Date(expense.date),
        createdAt: new Date(expense.createdAt),
        updatedAt: new Date(expense.updatedAt),
      }));
    } catch (error) {
      console.error('Error getting shared expenses:', error);
      throw error;
    }
  }

  // ========== UTILITY METHODS ==========

  /**
   * Calculate how much each person owes for an expense
   */
  calculateExpenseSplit(amount: number, splitBetween: string[]): { [userId: string]: number } {
    if (splitBetween.length === 0) return {};

    const splitAmount = amount / splitBetween.length;
    const result: { [userId: string]: number } = {};

    splitBetween.forEach(userId => {
      result[userId] = splitAmount;
    });

    return result;
  }

  /**
   * Get user's balance summary (what they owe vs what they're owed)
   */
  async getBalanceSummary(userId: string): Promise<{
    owes: { [userId: string]: number };
    owed: { [userId: string]: number };
    netBalance: number;
  }> {
    try {
      const expenses = await this.getSharedExpenses();

      const owes: { [userId: string]: number } = {};
      const owed: { [userId: string]: number } = {};
      let netBalance = 0;

      expenses.forEach(expense => {
        if (expense.splitBetween.includes(userId)) {
          const splitAmount = expense.amount / expense.splitBetween.length;

          if (expense.paidBy === userId) {
            // User paid - they're owed money by others
            expense.splitBetween.forEach(memberId => {
              if (memberId !== userId) {
                owed[memberId] = (owed[memberId] || 0) + splitAmount;
                netBalance += splitAmount;
              }
            });
          } else {
            // Someone else paid - user owes money
            owes[expense.paidBy] = (owes[expense.paidBy] || 0) + splitAmount;
            netBalance -= splitAmount;
          }
        }
      });

      return { owes, owed, netBalance };
    } catch (error) {
      console.error('Error calculating balance summary:', error);
      throw error;
    }
  }
}

export const teamService = TeamService.getInstance();
