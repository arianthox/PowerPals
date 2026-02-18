import { useState } from 'react';
import { useSettings } from '@/hooks/useApi';

export function SettingsPage() {
  const settings = useSettings();
  const [saving, setSaving] = useState(false);

  if (settings.isLoading) return <p>Loading settings…</p>;

  const data = settings.data;

  const onSave = async (formData: FormData) => {
    setSaving(true);
    const payload = {
      lowBatteryPercent: Number(formData.get('lowBatteryPercent')),
      syncFailureCount: Number(formData.get('syncFailureCount')),
      pollingIntervalSec: Number(formData.get('pollingIntervalSec')),
      debugLogging: formData.get('debugLogging') === 'on'
    };
    await window.agentBattery.settings.set(payload);
    setSaving(false);
  };

  return (
    <section>
      <h2>Settings</h2>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          const formData = new FormData(event.currentTarget);
          void onSave(formData);
        }}
      >
        <label>
          Low battery threshold (%)
          <input type="number" min={1} max={99} name="lowBatteryPercent" defaultValue={data.lowBatteryPercent} />
        </label>
        <label>
          Sync failure alert count
          <input type="number" min={1} max={10} name="syncFailureCount" defaultValue={data.syncFailureCount} />
        </label>
        <label>
          Polling interval (sec)
          <input type="number" min={30} max={3600} name="pollingIntervalSec" defaultValue={data.pollingIntervalSec} />
        </label>
        <label>
          Debug logging
          <input type="checkbox" name="debugLogging" defaultChecked={data.debugLogging} />
        </label>
        <button type="submit" disabled={saving}>
          {saving ? 'Saving…' : 'Save'}
        </button>
      </form>
    </section>
  );
}
