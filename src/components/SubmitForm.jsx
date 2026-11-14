'use client';

import Uploader from './Uploader.jsx';
import { taskXp, revisionDelta } from '@/lib/xp.js';
import { useT } from '@/i18n/client.jsx';

export default function SubmitForm({ taskId, points, revisionCount, hasSubmission }) {
  const { t } = useT();
  const next = revisionCount + 1;
  const loss = -revisionDelta(points, next);
  return (
    <div>
      {hasSubmission && (
        <div className={`alert ${loss > 0 ? 'alert-error' : 'alert-ok'}`}>
          {t('⚠️ Mengunggah ulang dihitung')}{' '}<b>{t('revisi ke-{n}', { n: next })}</b>.{' '}
          {loss > 0
            ? t('XP tugas ini berkurang {loss} (dari {from} menjadi {to} XP).', { loss, from: taskXp(points, revisionCount), to: taskXp(points, next) })
            : t('XP tugas ini sudah di batas minimum ({n} XP), tidak berkurang lagi.', { n: taskXp(points, revisionCount) })}
        </div>
      )}
      <Uploader
        action={`/api/tasks/${taskId}/submit`}
        label={hasSubmission ? t('Kirim Revisi ke-{n}', { n: next }) : t('Kumpulkan Tugas')}
        warn={hasSubmission && loss > 0 ? t('Revisi akan mengurangi XP tugas ini sebesar {loss}. Lanjutkan?', { loss }) : undefined}
      />
    </div>
  );
}
