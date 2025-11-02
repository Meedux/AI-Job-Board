import { NextResponse } from 'next/server';
import { getUserFromRequest } from '@/utils/auth';
import { prisma } from '@/utils/db';
import { createNotification } from '@/utils/notificationService';
import emailItService from '@/utils/emailItService';

export async function PUT(request, { params }) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    if (user.role !== 'super_admin') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const id = params.id;
    if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

    const payload = await request.json();
    const { status, reviewerNotes } = payload;

    if (!['pending', 'verified', 'rejected'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    const updated = await prisma.verificationDocument.update({
      where: { id },
      data: {
        status,
        reviewerNotes: reviewerNotes || null,
        reviewedBy: user.id,
        reviewedAt: new Date()
      }
    });

    // If document was verified, mark the owning user as verified as well
    if (status === 'verified' && updated.userId) {
      try {
        await prisma.user.update({
          where: { id: updated.userId },
          data: { isVerified: true, verifiedAt: new Date() }
        });
        // Notify the user (in-app + email)
        try {
          const targetUser = await prisma.user.findUnique({ where: { id: updated.userId } });
          if (targetUser) {
            await createNotification({
              type: 'verification_approved',
              title: 'Account Verified',
              message: 'Your account has been verified by an administrator.',
              category: 'user',
              priority: 'medium',
              userId: targetUser.id,
              userEmail: targetUser.email,
              metadata: { documentId: updated.id }
            });

            // send email (best-effort)
            const html = `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2>Account Verified</h2>
                <p>Hello ${targetUser.fullName || targetUser.email},</p>
                <p>Your verification documents have been reviewed and your account is now verified. You can now post placement jobs and access verified-only features.</p>
                <p>Regards,<br/>GetGetHired Team</p>
              </div>
            `;

            emailItService.sendEmail(targetUser.email, 'Your account has been verified', html, 'user_notification')
              .then(r => console.log('Verification email sent:', r))
              .catch(e => console.warn('Failed to send verification email:', e));
          }
        } catch (notifyErr) {
          console.warn('Failed to notify user after verification:', notifyErr.message || notifyErr);
        }
      } catch (e) {
        console.warn('Failed to mark user verified:', e.message);
      }
    }

    // If the document was rejected, notify the user and ensure isVerified is false
    if (status === 'rejected' && updated.userId) {
      try {
        const targetUser = await prisma.user.findUnique({ where: { id: updated.userId } });
        if (targetUser) {
          // Ensure user is not marked verified
          try {
            await prisma.user.update({ where: { id: targetUser.id }, data: { isVerified: false } });
          } catch (e) {
            console.warn('Failed to clear user verified flag on rejection:', e.message);
          }

          await createNotification({
            type: 'verification_rejected',
            title: 'Verification Documents Rejected',
            message: 'Your verification documents were reviewed and rejected. Please review the notes and re-upload the required documents.',
            category: 'user',
            priority: 'medium',
            userId: targetUser.id,
            userEmail: targetUser.email,
            metadata: { documentId: updated.id, reviewerNotes: updated.reviewerNotes }
          });

          const html = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2>Verification Documents Rejected</h2>
              <p>Hello ${targetUser.fullName || targetUser.email},</p>
              <p>We're sorry — your verification documents were reviewed and rejected by an administrator.</p>
              <p><strong>Notes from reviewer:</strong></p>
              <div style="background:#f3f4f6;padding:10px;border-radius:6px;">${updated.reviewerNotes || 'No notes provided.'}</div>
              <p>Please review the notes and upload the corrected documents in your profile.</p>
              <p>Regards,<br/>GetGetHired Team</p>
            </div>
          `;

          emailItService.sendEmail(targetUser.email, 'Verification documents rejected', html, 'user_notification')
            .then(r => console.log('Rejection email sent:', r))
            .catch(e => console.warn('Failed to send rejection email:', e));
        }
      } catch (notifyErr) {
        console.warn('Failed to notify user after rejection:', notifyErr.message || notifyErr);
      }
    }

    return NextResponse.json({ success: true, document: updated });
  } catch (error) {
    console.error('Error updating verification document:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
