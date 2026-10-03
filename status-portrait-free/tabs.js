document.querySelectorAll('[data-panel-group]').forEach(group => {
  const groupTabs = [...group.querySelectorAll('[role="tab"]')];
  const select = (tab, focus = false) => {
    groupTabs.forEach(item => {
      const active = item === tab;
      item.setAttribute('aria-selected', String(active));
      item.tabIndex = active ? 0 : -1;
      document.getElementById(item.getAttribute('aria-controls')).hidden = !active;
    });
    if (focus) tab.focus();
    fitFrame();
  };
  groupTabs.forEach((tab, index) => {
    tab.addEventListener('click', () => select(tab));
    tab.addEventListener('keydown', event => {
      const target = event.key === 'ArrowRight' ? (index + 1) % groupTabs.length
        : event.key === 'ArrowLeft' ? (index + groupTabs.length - 1) % groupTabs.length
        : event.key === 'Home' ? 0 : event.key === 'End' ? groupTabs.length - 1 : undefined;
      if (target === undefined) return;
      event.preventDefault();
      select(groupTabs[target], true);
    });
  });
});
