import { ipcMain } from 'electron';
import { ensureSettings, prisma } from '@agent-battery/db';
import { channels, thresholdSettingsSchema } from '@agent-battery/shared';

export function registerSettingsHandlers() {
  ipcMain.handle(channels.settings.get, async () => {
    await ensureSettings();
    const settings = await prisma.appSetting.findUnique({ where: { id: 'singleton' } });

    return {
      ok: true,
      data: settings
    };
  });

  ipcMain.handle(channels.settings.set, async (_event, payload) => {
    await ensureSettings();
    const parsed = thresholdSettingsSchema.safeParse(payload);
    if (!parsed.success) return { ok: false, error: parsed.error.message };

    const settings = await prisma.appSetting.update({
      where: { id: 'singleton' },
      data: parsed.data
    });

    process.env.AGENT_BATTERY_DEBUG = settings.debugLogging ? '1' : '0';

    return {
      ok: true,
      data: settings
    };
  });
}
