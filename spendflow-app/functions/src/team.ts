import * as admin from 'firebase-admin';
import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { Team, TeamMember, TeamInvitation, SharedExpense } from '../../src/types/team';

const db = admin.firestore();

// Create a new team
export const createTeam = onCall(
  {
    region: 'us-central1',
  },
  async (request) => {
    if (!request.auth) {
      throw new HttpsError('unauthenticated', 'User must be authenticated');
    }

    const { name, description } = request.data;

    if (!name || typeof name !== 'string' || name.trim().length < 2) {
      throw new HttpsError('invalid-argument', 'Team name must be at least 2 characters');
    }

    try {
      // Check if user already owns a team
      const existingTeam = await db
        .collection('teams')
        .where('ownerId', '==', request.auth.uid)
        .where('isActive', '==', true)
        .limit(1)
        .get();

      if (!existingTeam.empty) {
        throw new HttpsError('already-exists', 'You already own a team');
      }

      const teamData: Omit<Team, 'id'> = {
        name: name.trim(),
        description: description?.trim() || '',
        ownerId: request.auth.uid,
        ownerName: request.auth.token.name || request.auth.token.email || 'Unknown',
        createdAt: admin.firestore.FieldValue.serverTimestamp() as any,
        updatedAt: admin.firestore.FieldValue.serverTimestamp() as any,
        memberCount: 1,
        isActive: true,
      };

      const teamRef = await db.collection('teams').add(teamData);

      // Add owner as first team member
      const memberData: Omit<TeamMember, 'id'> = {
        teamId: teamRef.id,
        userId: request.auth.uid,
        email: request.auth.token.email || '',
        displayName: request.auth.token.name || request.auth.token.email || 'Unknown',
        role: 'owner',
        joinedAt: admin.firestore.FieldValue.serverTimestamp() as any,
        isActive: true,
        invitedBy: request.auth.uid,
        invitationAcceptedAt: admin.firestore.FieldValue.serverTimestamp() as any,
      };

      await db.collection('teamMembers').add(memberData);

      return {
        success: true,
        teamId: teamRef.id,
        message: 'Team created successfully'
      };
    } catch (error) {
      console.error('Error creating team:', error);
      if (error instanceof HttpsError) throw error;
      throw new HttpsError('internal', 'Error creating team');
    }
  }
);

// Get user's team
export const getUserTeam = onCall(
  {
    region: 'us-central1',
  },
  async (request) => {
    if (!request.auth) {
      throw new HttpsError('unauthenticated', 'User must be authenticated');
    }

    try {
      // Check if user is a team member
      const memberDoc = await db
        .collection('teamMembers')
        .where('userId', '==', request.auth.uid)
        .where('isActive', '==', true)
        .limit(1)
        .get();

      if (memberDoc.empty) {
        return { success: true, team: null, role: null };
      }

      const memberData = memberDoc.docs[0].data() as TeamMember;

      // Get team details
      const teamDoc = await db.collection('teams').doc(memberData.teamId).get();

      if (!teamDoc.exists) {
        return { success: true, team: null, role: null };
      }

      const teamData = teamDoc.data() as Team;

      return {
        success: true,
        team: {
          id: teamDoc.id,
          ...teamData,
          createdAt: (teamData.createdAt as any)?.toDate?.() || teamData.createdAt,
          updatedAt: (teamData.updatedAt as any)?.toDate?.() || teamData.updatedAt,
        },
        role: memberData.role,
        memberSince: (memberData.joinedAt as any)?.toDate?.() || memberData.joinedAt,
      };
    } catch (error) {
      console.error('Error getting user team:', error);
      throw new HttpsError('internal', 'Error retrieving team information');
    }
  }
);

// Get team members for user's team
export const getTeamMembers = onCall(
  {
    region: 'us-central1',
  },
  async (request) => {
    if (!request.auth) {
      throw new HttpsError('unauthenticated', 'User must be authenticated');
    }

    try {
      // Get user's team membership
      const memberDoc = await db
        .collection('teamMembers')
        .where('userId', '==', request.auth.uid)
        .where('isActive', '==', true)
        .limit(1)
        .get();

      if (memberDoc.empty) {
        throw new HttpsError('not-found', 'User is not a member of any team');
      }

      const memberData = memberDoc.docs[0].data() as TeamMember;
      const teamId = memberData.teamId;
      const userRole = memberData.role;

      // Get all team members
      const teamMembersSnapshot = await db
        .collection('teamMembers')
        .where('teamId', '==', teamId)
        .where('isActive', '==', true)
        .orderBy('joinedAt', 'asc')
        .get();

      const members = teamMembersSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        joinedAt: (doc.data().joinedAt as any)?.toDate?.() || doc.data().joinedAt,
        invitationAcceptedAt: doc.data().invitationAcceptedAt ? ((doc.data().invitationAcceptedAt as any)?.toDate?.() || doc.data().invitationAcceptedAt) : undefined,
      })) as TeamMember[];

      return {
        success: true,
        members,
        userRole,
      };
    } catch (error) {
      console.error('Error getting team members:', error);
      if (error instanceof HttpsError) throw error;
      throw new HttpsError('internal', 'Error retrieving team members');
    }
  }
);

// Invite member to team
export const inviteTeamMember = onCall(
  {
    region: 'us-central1',
  },
  async (request) => {
    if (!request.auth) {
      throw new HttpsError('unauthenticated', 'User must be authenticated');
    }

    const { email } = request.data;

    if (!email || typeof email !== 'string' || !email.includes('@')) {
      throw new HttpsError('invalid-argument', 'Valid email address is required');
    }

    try {
      // Get user's team membership and role
      const memberDoc = await db
        .collection('teamMembers')
        .where('userId', '==', request.auth.uid)
        .where('isActive', '==', true)
        .limit(1)
        .get();

      if (memberDoc.empty) {
        throw new HttpsError('not-found', 'User is not a member of any team');
      }

      const memberData = memberDoc.docs[0].data() as TeamMember;

      // Check if user has permission to invite (owner or admin)
      if (!['owner', 'admin'].includes(memberData.role)) {
        throw new HttpsError('permission-denied', 'Only team owners and admins can invite members');
      }

      const teamId = memberData.teamId;

      // Check if user is already invited or a member
      const existingInvitation = await db
        .collection('teamInvitations')
        .where('teamId', '==', teamId)
        .where('invitedEmail', '==', email.toLowerCase())
        .where('status', '==', 'pending')
        .limit(1)
        .get();

      if (!existingInvitation.empty) {
        throw new HttpsError('already-exists', 'User has already been invited to this team');
      }

      const existingMember = await db
        .collection('teamMembers')
        .where('teamId', '==', teamId)
        .where('email', '==', email.toLowerCase())
        .where('isActive', '==', true)
        .limit(1)
        .get();

      if (!existingMember.empty) {
        throw new HttpsError('already-exists', 'User is already a member of this team');
      }

      // Get team details
      const teamDoc = await db.collection('teams').doc(teamId).get();
      if (!teamDoc.exists) {
        throw new HttpsError('not-found', 'Team not found');
      }

      const teamData = teamDoc.data() as Team;

      // Create invitation
      const invitationData: Omit<TeamInvitation, 'id'> = {
        teamId,
        teamName: teamData.name,
        invitedEmail: email.toLowerCase(),
        invitedBy: request.auth.uid,
        invitedByName: request.auth.token.name || request.auth.token.email || 'Unknown',
        status: 'pending',
        createdAt: admin.firestore.FieldValue.serverTimestamp() as any,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        token: Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15),
      };

      await db.collection('teamInvitations').add(invitationData);

      // TODO: Send invitation email
      console.log(`Invitation created for ${email} to join team ${teamData.name}`);

      return {
        success: true,
        message: `Invitation sent to ${email}`,
      };
    } catch (error) {
      console.error('Error inviting team member:', error);
      if (error instanceof HttpsError) throw error;
      throw new HttpsError('internal', 'Error sending invitation');
    }
  }
);

// Create shared expense
export const createSharedExpense = onCall(
  {
    region: 'us-central1',
  },
  async (request) => {
    if (!request.auth) {
      throw new HttpsError('unauthenticated', 'User must be authenticated');
    }

    const { title, amount, category, splitBetween, date, description } = request.data;

    if (!title || !amount || !splitBetween || splitBetween.length === 0) {
      throw new HttpsError('invalid-argument', 'Missing required fields');
    }

    try {
      // Get user's team membership
      const memberDoc = await db
        .collection('teamMembers')
        .where('userId', '==', request.auth.uid)
        .where('isActive', '==', true)
        .limit(1)
        .get();

      if (memberDoc.empty) {
        throw new HttpsError('not-found', 'User is not a member of any team');
      }

      const memberData = memberDoc.docs[0].data() as TeamMember;
      const teamId = memberData.teamId;

      // Verify all splitBetween users are team members
      const teamMembersSnapshot = await db
        .collection('teamMembers')
        .where('teamId', '==', teamId)
        .where('isActive', '==', true)
        .get();

      const teamMemberIds = teamMembersSnapshot.docs.map(doc => doc.data().userId);
      const invalidUsers = splitBetween.filter((userId: string) => !teamMemberIds.includes(userId));

      if (invalidUsers.length > 0) {
        throw new HttpsError('invalid-argument', 'Some users are not members of this team');
      }

      // Get payer's name
      const payerMember = teamMembersSnapshot.docs.find(doc => doc.data().userId === request.auth!.uid);
      const paidByName = payerMember?.data().displayName || 'Unknown';

      const expenseData: Omit<SharedExpense, 'id'> = {
        teamId,
        title: title.trim(),
        amount: parseFloat(amount),
        currency: 'USD', // TODO: Make configurable
        category,
        paidBy: request.auth.uid,
        paidByName,
        splitBetween,
        date: new Date(date),
        description: description?.trim() || '',
        createdAt: admin.firestore.FieldValue.serverTimestamp() as any,
        updatedAt: admin.firestore.FieldValue.serverTimestamp() as any,
        createdBy: request.auth.uid,
        isActive: true,
      };

      const expenseRef = await db.collection('sharedExpenses').add(expenseData);

      return {
        success: true,
        expenseId: expenseRef.id,
        message: 'Shared expense created successfully',
      };
    } catch (error) {
      console.error('Error creating shared expense:', error);
      if (error instanceof HttpsError) throw error;
      throw new HttpsError('internal', 'Error creating shared expense');
    }
  }
);

// Get shared expenses for user's team
export const getSharedExpenses = onCall(
  {
    region: 'us-central1',
  },
  async (request) => {
    if (!request.auth) {
      throw new HttpsError('unauthenticated', 'User must be authenticated');
    }

    try {
      // Get user's team membership
      const memberDoc = await db
        .collection('teamMembers')
        .where('userId', '==', request.auth.uid)
        .where('isActive', '==', true)
        .limit(1)
        .get();

      if (memberDoc.empty) {
        return { success: true, expenses: [] };
      }

      const memberData = memberDoc.docs[0].data() as TeamMember;
      const teamId = memberData.teamId;

      // Get shared expenses for the team
      const expensesSnapshot = await db
        .collection('sharedExpenses')
        .where('teamId', '==', teamId)
        .where('isActive', '==', true)
        .orderBy('date', 'desc')
        .orderBy('createdAt', 'desc')
        .get();

      const expenses = expensesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        date: doc.data().date.toDate(),
        createdAt: doc.data().createdAt.toDate(),
        updatedAt: doc.data().updatedAt.toDate(),
      })) as SharedExpense[];

      return {
        success: true,
        expenses,
      };
    } catch (error) {
      console.error('Error getting shared expenses:', error);
      throw new HttpsError('internal', 'Error retrieving shared expenses');
    }
  }
);
