// ════════════════════════════════════════════════════
//  관리자 페이지 잠금 (admin-guard.js)
// ════════════════════════════════════════════════════
//  쓰는 법: 관리자 페이지 <head> 안에 아래 한 줄 추가
//    <script src="admin-guard.js"></script>
//    (trial/admin.html 처럼 하위 폴더면  src="../admin-guard.js")
//
//  비밀번호를 바꾸려면:
//    터미널에서  printf '새비번' | shasum -a 256
//    나온 값을 아래 PASS_HASH 에 붙여넣기
//
//  ⚠️ 저장소가 공개라 작정하고 파고들면 우회할 수 있습니다.
//     학생이 실수로/호기심에 들어오는 것을 막는 용도입니다.
// ════════════════════════════════════════════════════

(function () {
  var PASS_HASH = 'b3bad974ed019487d06cc3f788e898c78b8430883a6819b4fa5b01aeb4096cea';
  var KEY       = 'lj_admin_unlocked';

  // 이미 이 기기에서 잠금을 푼 적이 있으면 통과
  if (localStorage.getItem(KEY) === PASS_HASH) return;

  // ── 내용이 잠깐이라도 비치지 않도록 즉시 가림 ──
  var style = document.createElement('style');
  style.textContent =
    'html.lj-locked body > *:not(#lj-gate){display:none !important}' +
    '#lj-gate{position:fixed;inset:0;z-index:2147483647;display:flex;align-items:center;' +
    'justify-content:center;padding:24px;background:#F8FAFC;' +
    'font-family:-apple-system,BlinkMacSystemFont,"Apple SD Gothic Neo","Noto Sans KR",sans-serif}' +
    '#lj-gate .b{width:100%;max-width:320px;text-align:center}' +
    '#lj-gate .i{font-size:40px;margin-bottom:14px}' +
    '#lj-gate h1{font-size:1rem;font-weight:800;color:#334155;margin:0 0 6px}' +
    '#lj-gate p{font-size:.8rem;color:#94A3B8;margin:0 0 20px}' +
    '#lj-gate input{width:100%;padding:14px 16px;font-size:1.1rem;text-align:center;letter-spacing:.3em;' +
    'border:1px solid #E2E8F0;border-radius:12px;outline:none;background:#fff;color:#334155}' +
    '#lj-gate input:focus{border-color:#2563EB}' +
    '#lj-gate button{width:100%;margin-top:10px;padding:14px;font-size:.9rem;font-weight:700;color:#fff;' +
    'background:#2563EB;border:0;border-radius:12px;cursor:pointer}' +
    '#lj-gate button:hover{background:#1D4ED8}' +
    '#lj-gate .e{margin-top:12px;font-size:.8rem;font-weight:600;color:#DC2626;min-height:1.2em}';
  document.documentElement.classList.add('lj-locked');
  (document.head || document.documentElement).appendChild(style);

  async function sha256(text) {
    var buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
    return Array.from(new Uint8Array(buf))
      .map(function (b) { return b.toString(16).padStart(2, '0'); }).join('');
  }

  function build() {
    var gate = document.createElement('div');
    gate.id = 'lj-gate';
    gate.innerHTML =
      '<div class="b">' +
        '<div class="i">🔒</div>' +
        '<h1>관리자 전용</h1>' +
        '<p>비밀번호를 입력해 주세요</p>' +
        '<input id="lj-pw" type="password" inputmode="numeric" autocomplete="off" placeholder="••••">' +
        '<button id="lj-go" type="button">들어가기</button>' +
        '<div class="e" id="lj-err"></div>' +
      '</div>';
    document.body.appendChild(gate);

    var input = gate.querySelector('#lj-pw');
    var err   = gate.querySelector('#lj-err');
    input.focus();

    async function submit() {
      var h = await sha256(input.value);
      if (h === PASS_HASH) {
        localStorage.setItem(KEY, PASS_HASH);
        document.documentElement.classList.remove('lj-locked');
        gate.remove();
      } else {
        err.textContent = '비밀번호가 맞지 않아요';
        input.value = '';
        input.focus();
      }
    }

    gate.querySelector('#lj-go').addEventListener('click', submit);
    input.addEventListener('keydown', function (e) { if (e.key === 'Enter') submit(); });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', build);
  } else {
    build();
  }
})();
