import { useState } from 'react';
import { adminApi, type AdminAccount } from '@/core/api/client';
import styles from './Admin.module.css';

interface SpeechSwitchProps {
  account: AdminAccount;
  adminKey: string;
  onChange: (next: AdminAccount) => void;
}

/** On/off switch for Google Speech on one account. */
export function SpeechSwitch({ account, adminKey, onChange }: SpeechSwitchProps) {
  const [busy, setBusy] = useState(false);
  const on = !account.speechOff;

  const toggle = async () => {
    setBusy(true);
    try {
      const { speechOff } = await adminApi.setSpeechEnabled(adminKey, account.id, !on);
      onChange({ ...account, speechOff });
    } catch {
      /* the switch simply stays where it was */
    } finally {
      setBusy(false);
    }
  };

  return (
    <button
      type="button"
      className={on ? styles.switchOn : styles.switch}
      role="switch"
      aria-checked={on}
      aria-label={`Google Speech для ${account.email}`}
      disabled={busy}
      onClick={toggle}
    >
      <span />
    </button>
  );
}
