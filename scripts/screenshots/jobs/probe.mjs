export default async ({ d, page, grab, Q, log }) => {
  await d.open({ url: '/box-designer?style=carry' });
  await d.stopSpin();
  await grab('probe-carry');
  log(JSON.stringify(await Q.stops()));
  await grab('probe-carry-dock');
  log(JSON.stringify(await Q.texts('button')).slice(0, 3000));
};
