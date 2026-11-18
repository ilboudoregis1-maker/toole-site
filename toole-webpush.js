/* TÕÕLé - notifications web (navigateur uniquement, pas dans l'app Android) */
(function () {
  "use strict";
  try {
    if (window.__twp) return; window.__twp = 1;
    if (window.Capacitor && window.Capacitor.isNativePlatform && window.Capacitor.isNativePlatform()) return;
    if (!("serviceWorker" in navigator) || !("PushManager" in window) || !("Notification" in window)) return;
    var CFG = {
      apiKey: "AIzaSyACBlzm8wpGusqHW6Lfwq09Hdj93IEt8xk",
      authDomain: "tooole-13097.firebaseapp.com",
      projectId: "tooole-13097",
      storageBucket: "tooole-13097.firebasestorage.app",
      messagingSenderId: "891378189179",
      appId: "1:891378189179:web:79944484857328f8ee33de"
    };
    var VAPID = "BNgFBUVcuQ-FpcqYMadjf_Rren8k4rjS4J4Z7rtk_mdtDmfPCQ1S6-fmP1JE5YwjGVIk7sdru-VQrpBRtyIQLeI";
    var FB = "https://www.gstatic.com/firebasejs/10.12.2/";
    var msg = null, swr = null, btn = null, done = "";
    function U() { try { return me(); } catch (e) { return null; } }
    function ok(x) { return x && x !== "null" && x !== "undefined"; }
    function load(src) {
      return new Promise(function (res, rej) {
        var s = document.createElement("script"); s.src = src; s.onload = res; s.onerror = rej;
        document.head.appendChild(s);
      });
    }
    function init() {
      if (msg) return Promise.resolve(msg);
      return load(FB + "firebase-app-compat.js")
        .then(function () { return load(FB + "firebase-messaging-compat.js"); })
        .then(function () {
          if (!firebase.apps.length) firebase.initializeApp(CFG);
          msg = firebase.messaging();
          return navigator.serviceWorker.register("toole-sw.js");
        })
        .then(function () { return navigator.serviceWorker.ready; })
        .then(function (r) { swr = r; return msg; });
    }
    function save(t) {
      var u = U(); if (!u) return;
      api("/rest/v1/rpc/register_push_token", { method: "POST", body: JSON.stringify({ p_token: t, p_platform: "web" }) })
        .catch(function () {
          return api("/rest/v1/push_tokens?on_conflict=token", {
            method: "POST",
            headers: { Prefer: "resolution=merge-duplicates,return=minimal" },
            body: JSON.stringify({ token: t, user_id: u, platform: "web" })
          });
        })
        .catch(function () { });
    }
    function enable() {
      return init()
        .then(function (m) { return m.getToken({ vapidKey: VAPID, serviceWorkerRegistration: swr }); })
        .then(function (t) { if (t) save(t); })
        .catch(function () { });
    }
    function hide() { if (btn) { btn.remove(); btn = null; } }
    function show() {
      if (btn || Notification.permission !== "default") return;
      btn = document.createElement("button");
      btn.textContent = "\uD83D\uDD14 Activer les notifications";
      btn.style.cssText = "position:fixed;top:calc(env(safe-area-inset-top,0px) + 8px);right:8px;z-index:99999;padding:8px 12px;border:0;border-radius:18px;background:#1740B8;color:#fff;font:600 13px system-ui,sans-serif;box-shadow:0 2px 8px rgba(0,0,0,.3)";
      btn.onclick = function () {
        Notification.requestPermission().then(function (p) {
          hide(); done = U() || "";
          if (p === "granted") enable();
        });
      };
      document.body.appendChild(btn);
    }
    function wait(fn) {
      var k = 0, i = setInterval(function () {
        var r = false; try { r = U() && fn(); } catch (e) { }
        if (r || ++k > 80) clearInterval(i);
      }, 250);
    }
    function openFrom(d) {
      d = d || {}; var tt = d.title || "\u2026";
      if (d.type === "post") { wait(function () { if (typeof window.openDecouvrir !== "function") return false; window.openDecouvrir(); return true; }); return; }
      if (ok(d.group)) wait(function () { if (typeof openGroup !== "function") return false; openGroup({ id: d.group, name: d.gname || tt }); return true; });
      else if (ok(d.peer)) wait(function () { if (typeof openChat !== "function") return false; openChat(d.peer, tt); return true; });
    }
    navigator.serviceWorker.addEventListener("message", function (e) {
      var m = e.data; if (m && m.toole === "open") openFrom(m.d);
    });
    var q = new URLSearchParams(location.search).get("np");
    if (q) { try { var d0 = JSON.parse(q); history.replaceState(null, "", location.pathname); openFrom(d0); } catch (e) { } }
    setInterval(function () {
      var u = U();
      if (!u) { done = ""; hide(); return; }
      if (done === u) return;
      if (Notification.permission === "granted") { done = u; enable(); }
      else if (Notification.permission === "default") show();
      else { done = u; }
    }, 3000);
  } catch (e) { }
})();
