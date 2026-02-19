async function applyBionicToTab(tabId, enabled) {
  try {
    await chrome.scripting.executeScript({
      target: { tabId },
      func: (mode) => {
        window.__BR_MODE__ = mode;
      },
      args: [enabled ? 'apply' : 'revert']
    });
    await chrome.scripting.executeScript({
      target: { tabId },
      files: ['content/bionic.js']
    });
  } catch (e) {
    console.error('Focused Reader: Cannot inject into this page', e);
  }
}

document.addEventListener('DOMContentLoaded', async () => {
  const toggle = document.getElementById('boldToggle');

  const { bionicEnabled } = await chrome.storage.local.get({ bionicEnabled: false });
  toggle.checked = bionicEnabled;

  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (tab?.id) {
    await applyBionicToTab(tab.id, bionicEnabled);
  }

  toggle.addEventListener('change', async () => {
    const enabled = toggle.checked;
    await chrome.storage.local.set({ bionicEnabled: enabled });

    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab?.id) {
      await applyBionicToTab(tab.id, enabled);
    }
  });
});
