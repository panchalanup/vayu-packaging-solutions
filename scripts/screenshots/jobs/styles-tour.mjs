const ALL = ['rsc','hsc','fol','sleeve','telescope','mailer','pizza','tray','carry','produce','produce-tray','tuck-end','crash-lock','one-two-three','window-mailer','cake-box','clamshell','shelf-tray','slide-box','book-box'];
export default async ({ d, page, Q, log, sleep, step }) => {
  const list = process.env.STYLES ? process.env.STYLES.split(',') : ALL;
  for (const id of list) {
    step(`style ${id}`);
    log('== ' + id);
    await d.open({ url: `/box-designer?style=${id}` });
    await d.patch(Q.faceLabelPatch());
    await d.stopSpin();
    const stops = await Q.stops();
    log('stops: ' + JSON.stringify(stops));
    const tiles = [];
    tiles.push({ ...(await Q.stage()), label: `${id} default` });
    await d.angle('Back 3/4');
    await d.tab('edit');
    tiles.push({ ...(await Q.stage()), label: 'back 3/4' });
    await d.angle('3/4 hero');
    await d.tab('edit');
    await d.fold(stops[0]);
    tiles.push({ ...(await Q.stage()), label: stops[0] });
    await d.fold(50);
    tiles.push({ ...(await Q.stage()), label: 'fold 50' });
    if (stops.length > 2) {
      await d.fold(stops[1]);
      tiles.push({ ...(await Q.stage()), label: stops[1] });
    }
    await d.fold(stops[stops.length - 1]);
    await page.click({ sel: 'button', label: 'Cut-away view' });
    await page.settle(1800);
    tiles.push({ ...(await Q.stage()), label: 'cut-away' });
    log(await Q.sheet(`tour-${id}`, tiles, 3));
  }
};
