import express from 'express';
import prisma from '../../lib/prisma.js';
import { validateSession } from '../../lib/auth.js';

const router = express.Router();

/**
 * Approve or reject pass request (manager/admin only)
 * PATCH /api/passes/:id/approve
 * Body: { action: 'APPROVE' | 'REJECT', status: 'ACTIVE' | 'INACTIVE' }
 */
router.patch('/:id/approve', async (req, res) => {
  try {
    const { user } = await validateSession(req);

    if (
      user.assignedRole?.name !== 'MANAGER' &&
      user.assignedRole?.name !== 'ADMIN' &&
      user.loginType !== 'ADMIN'
    ) {
      return res.status(403).json({
        success: false,
        error: 'Unauthorized to approve passes',
      });
    }

    const { id } = req.params;
    const { action, status } = req.body;

    const pass = await prisma.pass.findUnique({
      where: { id: parseInt(id) },
      include: { user: { include: { profile: true } } },
    });

    if (!pass) {
      return res.status(404).json({
        success: false,
        error: 'Pass not found',
      });
    }

    let newStatus;
    if (action === 'APPROVE') {
      newStatus = status === 'INACTIVE' ? 'INACTIVE' : 'ACTIVE';
    } else if (action === 'REJECT') {
      newStatus = 'DISABLED';
    } else {
      return res.status(400).json({
        success: false,
        error: 'Invalid action. Use APPROVE or REJECT',
      });
    }

    const updatedPass = await prisma.pass.update({
      where: { id: parseInt(id) },
      data: { status: newStatus },
    });

    // Create notification for user
    await prisma.notification.create({
      data: {
        userId: pass.userId,
        title: `Pass ${action === 'APPROVE' ? 'Approved' : 'Rejected'}`,
        message: `Your ${pass.type} pass request has been ${action === 'APPROVE' ? 'approved' : 'rejected'}.`,
        type: action === 'APPROVE' ? 'SUCCESS' : 'WARNING',
      },
    });

    return res.json({
      success: true,
      pass: {
        id: updatedPass.id,
        userId: updatedPass.userId,
        type: updatedPass.type,
        status: updatedPass.status,
        startDate: updatedPass.startDate,
        endDate: updatedPass.endDate,
      },
    });
  } catch (err) {
    console.error('Error approving pass:', err);
    return res.status(err.status || 500).json({
      success: false,
      error: err.message || 'Failed to approve pass',
    });
  }
});

/**
 * List pending pass requests (manager/admin only)
 * GET /api/passes/pending
 */
router.get('/pending', async (req, res) => {
  try {
    const { user } = await validateSession(req);

    if (
      user.assignedRole?.name !== 'MANAGER' &&
      user.assignedRole?.name !== 'ADMIN' &&
      user.loginType !== 'ADMIN'
    ) {
      return res.status(403).json({
        success: false,
        error: 'Unauthorized',
      });
    }

    const passes = await prisma.pass.findMany({
      where: { status: 'PENDING' },
      include: {
        user: {
          include: {
            profile: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return res.json({
      success: true,
      passes: passes.map((pass) => ({
        id: pass.id,
        userId: pass.userId,
        userName: pass.user.profile?.fullName || pass.user.username,
        type: pass.type,
        status: pass.status,
        startDate: pass.startDate,
        endDate: pass.endDate,
        createdAt: pass.createdAt,
      })),
    });
  } catch (err) {
    console.error('Error listing pending passes:', err);
    return res.status(err.status || 500).json({
      success: false,
      error: err.message || 'Failed to list pending passes',
    });
  }
});

export default router;
