/* 관리자 구글 로그인 — 환급 계좌(refundAccounts)는 이 계정으로 로그인해야만 읽힙니다.
   Firestore 규칙에서도 같은 이메일만 읽기를 허용합니다. firebase-auth-compat 다음에 불러오세요. */
(function(){
  const ADMIN_EMAIL = 'jinlee8381@gmail.com';
  const isAdmin = u => !!u && u.email === ADMIN_EMAIL;
  window.AdminAuth = {
    email: ADMIN_EMAIL,
    onChange(cb){ firebase.auth().onAuthStateChanged(u => cb(isAdmin(u) ? u : null, u)); },
    signIn(){ return firebase.auth().signInWithPopup(new firebase.auth.GoogleAuthProvider()); },
    signOut(){ return firebase.auth().signOut(); },
    // 최신 입력만 남겨 { key: 계좌문서 } 로 돌려줍니다 (key = keyOf(doc))
    async loadAccounts(db, field, value, keyOf){
      const snap = await db.collection('refundAccounts').where(field, '==', value).get();
      const map = {};
      snap.forEach(d => {
        const a = d.data(), k = keyOf(a), t = a.savedAt && a.savedAt.toMillis ? a.savedAt.toMillis() : 0;
        if (!map[k] || t >= map[k]._t) map[k] = { ...a, _t: t, _count: (map[k] ? map[k]._count : 0) + 1 };
        else map[k]._count++;
      });
      return map;
    },
    // 환급이 끝난 계좌 삭제: pairs = [[필드, 값], ...]. 지운 개수를 돌려줍니다
    async deleteAccounts(db, pairs){
      let q = db.collection('refundAccounts');
      pairs.forEach(([f, v]) => { q = q.where(f, '==', v); });
      const snap = await q.get();
      await Promise.all(snap.docs.map(d => d.ref.delete()));
      return snap.size;
    },
    // 로그인 안내줄: <div id="..."> 에 그려 넣습니다
    bar(el, user, rawUser){
      if (!el) return;
      if (user) {
        el.innerHTML = '<span>🔓 환급 계좌 보기 · ' + user.email + '</span> <button type="button" data-admin-signout style="text-decoration:underline">로그아웃</button>';
      } else {
        el.innerHTML = '<span>🔒 관리자 구글 로그인 · 보안 규칙을 잠근 뒤에는 로그인해야 계좌가 보여요' + (rawUser ? ' (' + rawUser.email + ' 은 관리자 계정이 아니에요)' : '') + '</span> <button type="button" data-admin-signin style="font-weight:700;text-decoration:underline">구글로 로그인</button>';
      }
      el.onclick = e => {
        if (e.target.closest('[data-admin-signin]')) AdminAuth.signIn().catch(err => alert('로그인하지 못했어요: ' + (err && err.message || err)));
        if (e.target.closest('[data-admin-signout]')) AdminAuth.signOut();
      };
    }
  };
})();
