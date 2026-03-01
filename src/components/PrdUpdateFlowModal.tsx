'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { fastApiService } from '@/lib/api/services/fastApiService';
import type { AiDecision, WorkflowPrdUpdateResponse } from '@/lib/api/services/fastApiService';
import { useModalWindowStore } from '@/store/modalWindowsStore';
import { showToast } from '@/lib/utils/toast';

type Step = 'form' | 'rejected' | 'success' | 'pending_approval' | 'approved';

function errorToMessage(err: any): string {
  const detail = err?.response?.data?.detail;
  if (typeof detail === 'string') return detail;
  if (Array.isArray(detail) && detail.length > 0) {
    const first = detail[0];
    if (first && typeof first.msg === 'string') return first.msg;
  }
  if (detail && typeof detail === 'object' && typeof detail.msg === 'string') return detail.msg;
  return err?.message || 'Request failed.';
}

interface PendingState {
  session_id: string;
  ai_decision: AiDecision;
  originalRequest: string;
}

const PRD_UPDATE_STORAGE_KEY = 'prd_update_flow_pending';

function getStoredPending(prdId: string): { step: Step; pending?: PendingState; changeBatchId?: string; resultMessage?: string } | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = sessionStorage.getItem(`${PRD_UPDATE_STORAGE_KEY}_${prdId}`);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { step: Step; pending?: PendingState; changeBatchId?: string; resultMessage?: string };
    if (parsed.step === 'rejected' || parsed.step === 'pending_approval') return parsed;
    return null;
  } catch {
    return null;
  }
}

function setStoredPending(prdId: string, data: { step: Step; pending?: PendingState; changeBatchId?: string; resultMessage?: string } | null) {
  if (typeof window === 'undefined') return;
  try {
    if (data) sessionStorage.setItem(`${PRD_UPDATE_STORAGE_KEY}_${prdId}`, JSON.stringify(data));
    else sessionStorage.removeItem(`${PRD_UPDATE_STORAGE_KEY}_${prdId}`);
  } catch {
    // ignore
  }
}

export default function PrdUpdateFlowModal() {
  const { prdUpdateFlowOpen, prdUpdateFlowContext, setPrdUpdateFlowOpen, setPrdUpdateFlowContext } = useModalWindowStore();
  const [prdId, setPrdId] = useState<string | null>(null);
  const [step, setStep] = useState<Step>('form');
  const [changeRequest, setChangeRequest] = useState('');
  const [changeReason, setChangeReason] = useState('');
  const [pending, setPending] = useState<PendingState | null>(null);
  const [changeBatchId, setChangeBatchId] = useState<string | null>(null);
  const [resultMessage, setResultMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const productId = prdUpdateFlowContext?.productId;
  const changedBy = prdUpdateFlowContext?.changedBy ?? (typeof window !== 'undefined' ? parseInt(localStorage.getItem('user_id') || '0', 10) : 0);
  const initialRequest = prdUpdateFlowContext?.initialRequest;

  // When modal closes, reset form state (keep sessionStorage so reopening restores pending)
  useEffect(() => {
    if (!prdUpdateFlowOpen) {
      setStep('form');
      setPending(null);
      setChangeBatchId(null);
      setResultMessage('');
      setError(null);
      setChangeRequest(initialRequest || '');
      setChangeReason('');
      return;
    }
    if (initialRequest) setChangeRequest(initialRequest);
  }, [prdUpdateFlowOpen, initialRequest]);

  // When modal opens and we have prdId, restore pending step from sessionStorage so user can see/complete it
  useEffect(() => {
    if (!prdUpdateFlowOpen || !prdId) return;
    const stored = getStoredPending(prdId);
    if (!stored) return;
    setStep(stored.step);
    if (stored.pending) setPending(stored.pending);
    if (stored.changeBatchId) setChangeBatchId(stored.changeBatchId);
    if (stored.resultMessage) setResultMessage(stored.resultMessage);
  }, [prdUpdateFlowOpen, prdId]);

  // When we're on form with "pending" error and we have stored state, auto-switch to Rejected/Pending approval step
  useEffect(() => {
    if (step !== 'form' || !error || !error.includes('pending') || !prdId) return;
    const stored = getStoredPending(prdId);
    if (!stored) return;
    setStep(stored.step);
    if (stored.pending) setPending(stored.pending);
    if (stored.changeBatchId) setChangeBatchId(stored.changeBatchId);
    if (stored.resultMessage) setResultMessage(stored.resultMessage);
    setError(null);
  }, [step, error, prdId]);

  useEffect(() => {
    if (!prdUpdateFlowOpen || !productId) return;
    const ctxPrdId = prdUpdateFlowContext?.prdId;
    if (ctxPrdId) {
      setPrdId(ctxPrdId);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const result = await fastApiService.getPrdByProduct(productId);
        const id = result?.prd_id ?? result?.id;
        if (cancelled) return;
        if (id) setPrdId(String(id));
        else setError('No PRD linked to this product.');
      } catch {
        if (!cancelled) setError('Failed to load PRD.');
      }
    })();
    return () => { cancelled = true; };
  }, [prdUpdateFlowOpen, productId, prdUpdateFlowContext?.prdId]);

  const handleClose = useCallback(() => {
    setPrdUpdateFlowOpen(false);
    setPrdUpdateFlowContext(null);
    setPrdId(null);
  }, [setPrdUpdateFlowOpen, setPrdUpdateFlowContext]);

  const handleSubmit = useCallback(async () => {
    if (!prdId || !changeRequest.trim() || changedBy <= 0) {
      setError('PRD, change request, and user are required.');
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const res: WorkflowPrdUpdateResponse = await fastApiService.workflowPrdUpdate({
        prd_id: prdId,
        change_request: changeRequest.trim(),
        changed_by: changedBy,
        ...(changeReason.trim() && { change_reason: changeReason.trim() }),
      });
      if (res.status === 'PENDING' && res.ai_decision?.outcome === 'suggest_alternatives' && res.session_id) {
        const pendingState: PendingState = {
          session_id: res.session_id,
          ai_decision: res.ai_decision,
          originalRequest: changeRequest.trim(),
        };
        setPending(pendingState);
        setStep('rejected');
        setStoredPending(prdId, { step: 'rejected', pending: pendingState });
      } else if (res.status === 'pending' && res.change_batch_id) {
        setChangeBatchId(res.change_batch_id);
        const msg = 'Change plans created. Pending approval.';
        setResultMessage(msg);
        setStep('pending_approval');
        setStoredPending(prdId, { step: 'pending_approval', changeBatchId: res.change_batch_id, resultMessage: msg });
        showToast.success('PRD update submitted for approval.');
      } else {
        const msg = res.message || 'Update submitted.';
        setResultMessage(msg);
        setStep('success');
        setStoredPending(prdId, null);
        showToast.success(msg);
      }
    } catch (err: any) {
      const msg = errorToMessage(err);
      const data = err?.response?.data;
      // Backend returns session_id (and optionally ai_decision, original_request) when rejecting due to existing PENDING session (per API doc)
      const sessionId = typeof data?.session_id === 'string' ? data.session_id : null;
      const hasPendingError = msg.toLowerCase().includes('pending');
      if (hasPendingError && sessionId && prdId) {
        const aiDecision: AiDecision = data?.ai_decision && typeof data.ai_decision === 'object'
          ? {
              outcome: data.ai_decision.outcome === 'suggest_alternatives' ? 'suggest_alternatives' : 'approved',
              reason: typeof data.ai_decision.reason === 'string' ? data.ai_decision.reason : 'You have a pending decision. Accept AI suggestions or insist on your original request.',
              alternatives: Array.isArray(data.ai_decision.alternatives) ? data.ai_decision.alternatives : [],
            }
          : { outcome: 'suggest_alternatives', reason: 'You have a pending decision. Accept or insist to continue.', alternatives: [] };
        const originalRequest = typeof data?.original_request === 'string' ? data.original_request : changeRequest.trim();
        const pendingState: PendingState = { session_id: sessionId, ai_decision: aiDecision, originalRequest };
        setPending(pendingState);
        setStep('rejected');
        setStoredPending(prdId, { step: 'rejected', pending: pendingState });
        setError(null);
        showToast.success('Pending update restored. Choose Accept or Insist.');
      } else {
        setError(msg);
        showToast.error('PRD update request failed.');
      }
    } finally {
      setLoading(false);
    }
  }, [prdId, changeRequest, changeReason, changedBy]);

  const handleAccept = useCallback(async () => {
    if (!prdId || !pending || changedBy <= 0) return;
    setLoading(true);
    setError(null);
    try {
      const res: WorkflowPrdUpdateResponse = await fastApiService.workflowPrdUpdate({
        prd_id: prdId,
        change_request: 'Accept your suggestions',
        changed_by: changedBy,
        session_id: pending.session_id,
      });
      if (res.status === 'accepted_alternatives') {
        setResultMessage('Alternatives accepted.');
        setStep('success');
        setStoredPending(prdId, null);
        showToast.success('Alternatives accepted.');
      } else {
        setError(res.message || 'Unexpected response.');
      }
    } catch (err: any) {
      setError(errorToMessage(err));
    } finally {
      setLoading(false);
    }
  }, [prdId, pending, changedBy]);

  const handleInsist = useCallback(async () => {
    if (!prdId || !pending || changedBy <= 0) return;
    setLoading(true);
    setError(null);
    try {
      const res: WorkflowPrdUpdateResponse = await fastApiService.workflowPrdUpdate({
        prd_id: prdId,
        change_request: pending.originalRequest,
        changed_by: changedBy,
        session_id: pending.session_id,
        insist_original: true,
      });
      if (res.status === 'pending' && res.change_batch_id) {
        setChangeBatchId(res.change_batch_id);
        const msg = 'Change plans created. Pending approval.';
        setResultMessage(msg);
        setStep('pending_approval');
        setStoredPending(prdId, { step: 'pending_approval', changeBatchId: res.change_batch_id, resultMessage: msg });
        showToast.success('PRD update submitted for approval.');
      } else {
        setResultMessage(res.message || 'Update submitted.');
        setStep('success');
        setStoredPending(prdId, null);
      }
    } catch (err: any) {
      setError(errorToMessage(err));
    } finally {
      setLoading(false);
    }
  }, [prdId, pending, changedBy]);

  const handleApprove = useCallback(async () => {
    if (!prdId || !changeBatchId) return;
    setLoading(true);
    setError(null);
    try {
      await fastApiService.workflowPrdUpdateApprove({
        prd_id: prdId,
        change_batch_id: changeBatchId,
        approved: true,
      });
      setResultMessage('PRD changes approved successfully.');
      setStep('approved');
      setStoredPending(prdId, null);
      showToast.success('PRD update approved.');
    } catch (err: any) {
      setError(errorToMessage(err));
      showToast.error('Approval failed.');
    } finally {
      setLoading(false);
    }
  }, [prdId, changeBatchId]);

  return (
    <AnimatePresence>
      {prdUpdateFlowOpen && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/20 font-inter"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={handleClose}
        >
          <motion.div
            className="bg-white rounded-2xl shadow-2xl max-w-[520px] w-full mx-4 max-h-[90vh] overflow-y-auto relative"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className="absolute top-4 right-4 text-[#757575] hover:text-[#4A4A4A] text-xl leading-none cursor-pointer z-10"
              onClick={handleClose}
              aria-label="Close"
            >
              ✕
            </button>
            <div className="p-6 pt-10">
              {step === 'form' && (
                <>
                  <h2 className="text-base font-semibold text-[#181818] mb-4">PRD Update Request</h2>
                  {error && (
                    <div className="mb-4 p-3 rounded-xl border border-[#D7333F]/30 bg-red-50/50">
                      <p className="text-sm text-[#4A4A4A] leading-relaxed">{error}</p>
                      {error.includes('pending') && (
                        <>
                          <p className="text-xs text-[#757575] mt-2">
                            Complete the current flow: use <strong>Accept</strong> or <strong>Insist</strong> in the Rejected step, or <strong>Approve</strong> in Pending approval.
                          </p>
                          <button
                            type="button"
                            onClick={() => {
                              if (!prdId) return;
                              const stored = getStoredPending(prdId);
                              if (stored) {
                                setStep(stored.step);
                                if (stored.pending) setPending(stored.pending);
                                if (stored.changeBatchId) setChangeBatchId(stored.changeBatchId);
                                if (stored.resultMessage) setResultMessage(stored.resultMessage);
                                setError(null);
                              } else {
                                showToast.info('Pending state not found in this session. Open Update PRD from the same tab where you saw Rejected or Pending approval, or try again after sending once to create a new flow.');
                              }
                            }}
                            className="mt-3 px-3 py-1.5 text-sm font-medium text-[#627899] bg-white border border-[#627899] rounded-lg hover:bg-[#F0F2F5]"
                          >
                            Show pending update
                          </button>
                        </>
                      )}
                    </div>
                  )}
                  {!prdId && !error && productId && <p className="text-[#757575] text-sm mb-3">Loading PRD...</p>}
                  <label className="block text-sm font-medium text-[#4A4A4A] mb-1">Change request</label>
                  <textarea
                    value={changeRequest}
                    onChange={(e) => setChangeRequest(e.target.value)}
                    placeholder="Describe what should change in the PRD..."
                    className="w-full h-24 px-3 py-2 border border-[#CCCCCC] rounded-xl text-sm text-[#4A4A4A] resize-none mb-4 outline-none focus:border-[#7B8FFF]"
                    disabled={loading}
                  />
                  <label className="block text-sm font-medium text-[#4A4A4A] mb-1">Reason (optional)</label>
                  <input
                    type="text"
                    value={changeReason}
                    onChange={(e) => setChangeReason(e.target.value)}
                    placeholder="e.g. Team has more expertise in Flutter"
                    className="w-full px-3 py-2 border border-[#CCCCCC] rounded-xl text-sm text-[#4A4A4A] mb-4 outline-none focus:border-[#7B8FFF]"
                    disabled={loading}
                  />
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={handleClose}
                      className="px-4 py-2 text-sm font-medium text-[#535354] bg-[#EAEDF2] hover:bg-[#D9DCE3] rounded-xl"
                      style={{ boxShadow: '-2px -2px 2px 0 #FFF, 2px 2px 2px 0 rgba(167, 177, 196, 0.60)' }}
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleSubmit}
                      disabled={loading || !changeRequest.trim() || !prdId}
                      className="px-4 py-2 text-sm font-semibold text-white bg-[#627899] hover:bg-[#536682] rounded-xl disabled:opacity-50"
                      style={{ boxShadow: '-2px -2px 2px 0 #FFF, 2px 2px 2px 0 rgba(167, 177, 196, 0.60)' }}
                    >
                      {loading ? 'Submitting...' : 'Send'}
                    </button>
                  </div>
                </>
              )}

              {step === 'rejected' && pending && (
                <>
                  <div className="bg-[#D7333F] text-white text-sm font-bold uppercase tracking-wide px-3 py-2 rounded-xl mb-4 inline-block">
                    Rejected
                  </div>
                  <p className="text-sm text-[#4A4A4A] leading-normal mb-4">{pending.ai_decision.reason}</p>
                  {pending.ai_decision.alternatives && pending.ai_decision.alternatives.length > 0 && (
                    <>
                      <p className="text-sm font-bold text-[#4A4A4A] mb-2">Alternatives</p>
                      <ul className="list-disc list-inside text-sm text-[#4A4A4A] space-y-1.5 mb-4">
                        {pending.ai_decision.alternatives.map((alt, i) => (
                          <li key={i}>{alt}</li>
                        ))}
                      </ul>
                    </>
                  )}
                  <div className="flex flex-wrap gap-6 mb-4">
                    <div className="flex flex-col items-start">
                      <button
                        type="button"
                        onClick={handleAccept}
                        disabled={loading}
                        className="px-4 py-2 text-sm font-semibold text-white bg-[#627899] hover:bg-[#536682] rounded-xl disabled:opacity-50"
                        style={{ boxShadow: '-2px -2px 2px 0 #FFF, 2px 2px 2px 0 rgba(167, 177, 196, 0.60)' }}
                      >
                        {loading ? 'Sending...' : 'Accept'}
                      </button>
                      <span className="text-xs text-[#757575] mt-1">Accept AI Judge&apos;s alternatives.</span>
                    </div>
                    <div className="flex flex-col items-start">
                      <button
                        type="button"
                        onClick={handleInsist}
                        disabled={loading}
                        className="px-4 py-2 text-sm font-semibold text-[#535354] bg-[#EAEDF2] hover:bg-[#D9DCE3] rounded-xl disabled:opacity-50"
                        style={{ boxShadow: '-2px -2px 2px 0 #FFF, 2px 2px 2px 0 rgba(167, 177, 196, 0.60)' }}
                      >
                        {loading ? 'Sending...' : 'Insist'}
                      </button>
                      <span className="text-xs text-[#757575] mt-1">Insist PM&apos;s request.</span>
                    </div>
                  </div>
                  {error && <p className="text-[#D7333F] text-sm mb-2">{error}</p>}
                  <div className="pt-4 border-t border-[#CCCCCC]">
                    <p className="text-xs text-[#757575] mb-1">Original request</p>
                    <div className="flex gap-2 items-center">
                      <input
                        type="text"
                        readOnly
                        value={pending.originalRequest}
                        className="flex-1 px-3 py-2 border border-[#CCCCCC] rounded-xl text-sm text-[#4A4A4A] bg-white"
                      />
                      <button
                        type="button"
                        onClick={handleInsist}
                        disabled={loading}
                        className="px-4 py-2 text-xs font-semibold text-[#535354] bg-[#EAEDF2] hover:bg-[#D9DCE3] rounded-xl shrink-0 disabled:opacity-50"
                        style={{ boxShadow: '-2px -2px 2px 0 #FFF, 2px 2px 2px 0 rgba(167, 177, 196, 0.60)' }}
                      >
                        SEND
                      </button>
                    </div>
                  </div>
                </>
              )}

              {step === 'pending_approval' && (
                <>
                  <h2 className="text-base font-semibold text-[#181818] mb-2">Pending approval</h2>
                  <p className="text-sm text-[#4A4A4A] mb-4">{resultMessage}</p>
                  {error && <p className="text-[#D7333F] text-sm mb-2">{error}</p>}
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={handleApprove}
                      disabled={loading || !changeBatchId}
                      className="px-4 py-2 text-sm font-semibold text-white bg-[#627899] hover:bg-[#536682] rounded-xl disabled:opacity-50"
                      style={{ boxShadow: '-2px -2px 2px 0 #FFF, 2px 2px 2px 0 rgba(167, 177, 196, 0.60)' }}
                    >
                      {loading ? 'Approving...' : 'Approve'}
                    </button>
                    <button
                      type="button"
                      onClick={handleClose}
                      className="px-4 py-2 text-sm font-medium text-[#535354] bg-[#EAEDF2] hover:bg-[#D9DCE3] rounded-xl"
                      style={{ boxShadow: '-2px -2px 2px 0 #FFF, 2px 2px 2px 0 rgba(167, 177, 196, 0.60)' }}
                    >
                      Close
                    </button>
                  </div>
                </>
              )}

              {(step === 'success' || step === 'approved') && (
                <>
                  <h2 className="text-base font-semibold text-[#181818] mb-2">{step === 'approved' ? 'Approved' : 'Done'}</h2>
                  <p className="text-sm text-[#4A4A4A] mb-4">{resultMessage}</p>
                  <button
                    type="button"
                    onClick={handleClose}
                    className="px-4 py-2 text-sm font-semibold text-white bg-[#627899] hover:bg-[#536682] rounded-xl"
                    style={{ boxShadow: '-2px -2px 2px 0 #FFF, 2px 2px 2px 0 rgba(167, 177, 196, 0.60)' }}
                  >
                    Close
                  </button>
                </>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
