const BASE = 'http://127.0.0.1:3002/api';
function store() { return { cookie: '' }; }
async function call(method, path, body, s) {
  const res = await fetch(BASE + path, {
    method,
    headers: { 'Content-Type': 'application/json', ...(s.cookie ? { Cookie: s.cookie } : {}) },
    body: body ? JSON.stringify(body) : undefined,
  });
  const sc = res.headers.get('set-cookie');
  if (sc) s.cookie = sc.split(';')[0];
  let data = null; try { data = await res.json(); } catch {}
  return { status: res.status, data };
}
function log(label, r, extra) {
  console.log('\n--- ' + label + ' [' + r.status + ']');
  console.log(JSON.stringify(r.data));
  if (extra) console.log('  >>', extra);
}

const admin = store();
const user = store();
const pending = store();

const a1 = await call('POST', '/auth/register', { name: 'Admin A', email: 'admin@test.dev', password: 'secret123', role: 'admin' }, admin);
log('register admin', a1, 'role=' + a1.data?.user?.role);

const u1 = await call('POST', '/auth/register', { name: 'User U', email: 'user@test.dev', password: 'secret123', role: 'user' }, user);
log('register user', u1, 'role=' + u1.data?.user?.role);

const p = await call('POST', '/projects', { name: 'Cadence MVP', description: 'x' }, admin);
log('admin create project', p);
const pid = p.data?.project?.id;

const u2 = await call('POST', '/projects', { name: 'Nope' }, user);
log('user create project (expect 403)', u2);

const inv = await call('POST', '/projects/' + pid + '/invites', {}, admin);
log('admin create invite link', inv);
const token = inv.data?.invite?.token;
console.log('  >> link =', inv.data?.invite?.link);

const t1 = await call('POST', '/projects/' + pid + '/tasks', { title: 'Blocked' }, user);
log('user task before join (expect 403)', t1);

const acc = await call('POST', '/projects/invites/' + token + '/accept', {}, user);
log('user accept invite', acc, 'projectId=' + acc.data?.projectId);

const t2 = await call('POST', '/projects/' + pid + '/tasks', { title: 'Now allowed', priority: 'high' }, user);
log('user task after join (expect 201)', t2);

const list = await call('GET', '/projects/' + pid + '/invites', null, admin);
log('admin list invites', list);

const m1 = await call('POST', '/projects/' + pid + '/members', { email: 'someone@test.dev' }, user);
log('user add member (expect 403)', m1);

const invE = await call('POST', '/projects/' + pid + '/invites', { email: 'pending@test.dev' }, admin);
log('admin invite by email (pending)', invE);

const pend = await call('POST', '/auth/register', { name: 'Pending P', email: 'pending@test.dev', password: 'secret123', role: 'user' }, pending);
log('pending user registers (auto-join expected)', pend, 'role=' + pend.data?.user?.role);

const pendProj = await call('GET', '/projects/' + pid, null, pending);
log('pending user GET project (member now)', pendProj, 'is_owner=' + pendProj.data?.project?.is_owner);

const del = await call('DELETE', '/projects/' + pid, null, admin);
log('admin delete project', del);
