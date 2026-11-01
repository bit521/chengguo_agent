/* 辰光 Agent 平台 · RBAC 原型运行层
   身份、菜单过滤、路由守卫、按钮级权限、标注模式 */

(function () {
  "use strict";

  var ID_KEY = "cg_rbac_identity";
  var ANNOTATE_KEY = "cg_rbac_annotate";
  var qs = new URLSearchParams(location.search);

  /* ---------- 图标 ---------- */
  var ICONS = {
    sun: '<path d="M3 17.5h18"/><circle cx="12" cy="11.5" r="5"/><path d="M12 2.5v2M4.6 5.2l1.4 1.4M19.4 5.2L18 6.6"/>',
    bot: '<rect x="4" y="8" width="16" height="11" rx="2"/><path d="M12 8V4M8.5 4h7"/><circle cx="9" cy="13" r=".9"/><circle cx="15" cy="13" r=".9"/><path d="M9 16.5h6"/>',
    cube: '<path d="M12 3l8 4.5v9L12 21l-8-4.5v-9L12 3z"/><path d="M4 7.5l8 4.5 8-4.5M12 12v9"/>',
    doc: '<path d="M6 3h8l4 4v14H6z"/><path d="M14 3v4h4M9 12h6M9 16h6"/>',
    book: '<path d="M4 5.5A2.5 2.5 0 016.5 3H20v15H6.5A2.5 2.5 0 004 20.5V5.5z"/><path d="M4 20.5A2.5 2.5 0 016.5 18H20"/>',
    tool: '<path d="M9 4a2 2 0 114 0v1h3a1 1 0 011 1v3h1a2 2 0 110 4h-1v3a1 1 0 01-1 1h-3v-1a2 2 0 10-4 0v1H6a1 1 0 01-1-1v-3H4a2 2 0 110-4h1V6a1 1 0 011-1h3V4z"/>',
    chat: '<path d="M4 5h16v11H9l-5 4V5z"/><path d="M8 9h8M8 12.5h5"/>',
    chart: '<path d="M4 20V10M10 20V4M16 20v-7"/><path d="M3 20h18"/>',
    users: '<circle cx="9" cy="8" r="3"/><path d="M3 20c0-3.3 2.7-5 6-5s6 1.7 6 5"/><path d="M16 5.5a3 3 0 010 5.8M17.5 15c2.2.5 3.5 2.1 3.5 5"/>',
    shield: '<path d="M12 3l7 3v6c0 4.2-2.9 7.6-7 9-4.1-1.4-7-4.8-7-9V6l7-3z"/><path d="M9 12l2 2 4-4"/>',
    key: '<path d="M14 10l7-7M17 3h4v4"/><circle cx="9" cy="15" r="5"/>',
    audit: '<path d="M6 3h9l4 4v14H6z"/><path d="M14 3v4h4"/><path d="M9 12l1.5 1.5L14 10M9 17h6"/>',
    alert: '<path d="M12 3l9 16H3L12 3z"/><path d="M12 9v4M12 16.5v.1"/>',
    gear: '<circle cx="12" cy="12" r="3"/><path d="M19.4 13.5a7.6 7.6 0 000-3l1.8-1.3-2-3.4-2.1.9a7.6 7.6 0 00-2.6-1.5L14.2 2h-4l-.3 2.2a7.6 7.6 0 00-2.6 1.5l-2.1-.9-2 3.4 1.8 1.3a7.6 7.6 0 000 3l-1.8 1.3 2 3.4 2.1-.9a7.6 7.6 0 002.6 1.5l.3 2.2h4l.3-2.2a7.6 7.6 0 002.6-1.5l2.1.9 2-3.4-1.8-1.3z"/>',
    bell: '<path d="M6 16V11a6 6 0 1112 0v5l2 2H4l2-2z"/><path d="M10 20a2 2 0 004 0"/>',
    search: '<circle cx="10.5" cy="10.5" r="6.5"/><path d="M15.5 15.5L21 21"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    close: '<path d="M6 6l12 12M18 6L6 18"/>',
    logout: '<path d="M15 4h4v16h-4"/><path d="M10 8l-4 4 4 4M6 12h10"/>',
    menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
    check: '<path d="M5 12l4 4L19 6"/>',
    lock: '<rect x="5" y="10" width="14" height="10" rx="1.5"/><path d="M8 10V7a4 4 0 018 0v3"/>',
    arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
    refresh: '<path d="M20 12a8 8 0 11-2.3-5.7"/><path d="M20 4v4h-4"/>'
  };

  function icon(name, size) {
    var body = ICONS[name] || ICONS.sun;
    var px = size || 16;
    return '<svg viewBox="0 0 24 24" width="' + px + '" height="' + px + '" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + body + "</svg>";
  }

  /* ---------- 身份 ---------- */
  function getIdentityKey() {
    var key = sessionStorage.getItem(ID_KEY);
    return IDENTITIES[key] ? key : "super";
  }

  function identity() {
    return IDENTITIES[getIdentityKey()];
  }

  function setIdentity(key) {
    if (!IDENTITIES[key]) { return; }
    sessionStorage.setItem(ID_KEY, key);
    location.reload();
  }

  function has(perm) {
    if (!perm) { return true; }
    var me = identity();
    if (me.superuser) { return true; }
    if (me.permissions.indexOf("*") !== -1) { return true; }
    if (me.permissions.indexOf(perm) !== -1) { return true; }
    var mod = perm.split(":")[0];
    return me.permissions.indexOf(mod + ":*") !== -1;
  }

  function canSeeNav(item) {
    if (item.superOnly) { return identity().superuser; }
    if (item.perm) { return has(item.perm); }
    return true;
  }

  function permCountLabel() {
    var me = identity();
    if (me.superuser || me.permissions.indexOf("*") !== -1) { return "全部权限"; }
    return me.permissions.length + " 项权限";
  }

  function roleName(code) {
    var role = ROLES.filter(function (r) { return r.code === code; })[0];
    return role ? role.name : "—";
  }

  /* ---------- 状态 ---------- */
  var annotate = qs.get("annotate") === "1" || sessionStorage.getItem(ANNOTATE_KEY) === "1";
  if (qs.get("as") && IDENTITIES[qs.get("as")]) {
    sessionStorage.setItem(ID_KEY, qs.get("as"));
  }
  if (qs.get("annotate") === "1") {
    sessionStorage.setItem(ANNOTATE_KEY, "1");
  }
  // ?as / ?annotate 只在进入时生效，随后从地址栏移除，避免刷新时覆盖身份切换
  if (qs.get("as") || qs.get("annotate")) {
    try {
      var clean = new URL(location.href);
      clean.searchParams.delete("as");
      clean.searchParams.delete("annotate");
      history.replaceState(null, "", clean.pathname + (clean.search || "") + clean.hash);
    } catch (err) { /* file:// 下部分浏览器禁止改写地址，忽略 */ }
  }
  document.body.classList.toggle("annotate", annotate);

  /* ---------- 路由守卫 ---------- */
  function gatePage() {
    var perm = document.body.dataset.perm;
    if (!perm || has(perm)) { return true; }
    var from = location.pathname.split("/").pop() + (location.search || "");
    var title = document.body.dataset.title || "该页面";
    var url = "forbidden.html?from=" + encodeURIComponent(from) +
      "&need=" + encodeURIComponent(perm) +
      "&title=" + encodeURIComponent(title) +
      (annotate ? "&annotate=1" : "");
    location.replace(url);
    return false;
  }

  /* ---------- 渲染：原型控制条 ---------- */
  function renderProto() {
    var mount = document.getElementById("proto-bar");
    if (!mount) { return; }
    var me = identity();
    var buttons = IDENTITY_ORDER.map(function (key) {
      var id = IDENTITIES[key];
      return '<button class="proto__id' + (key === me.key ? " is-active" : "") +
        '" data-identity="' + key + '" title="以「' + id.roleLabel + '」身份查看">' +
        "<b>" + id.name + "</b><em>" + id.roleLabel + "</em></button>";
    }).join("");

    mount.className = "proto";
    mount.innerHTML =
      '<span class="proto__brand">' + "辰光 · RBAC 原型" + " <i>V2.0</i></span>" +
      '<span class="proto__label">查看身份</span>' +
      '<div class="proto__identities" role="group" aria-label="切换查看身份">' + buttons + "</div>" +
      '<label class="proto__toggle"><input type="checkbox" id="annotate-toggle"' +
      (annotate ? " checked" : "") + "> 标注受限操作</label>" +
      '<a class="proto__link" href="index.html">原型说明</a>';

    mount.querySelectorAll("[data-identity]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var key = btn.getAttribute("data-identity");
        if (key !== me.key) { setIdentity(key); }
      });
    });

    var toggle = document.getElementById("annotate-toggle");
    if (toggle) {
      toggle.addEventListener("change", function () {
        sessionStorage.setItem(ANNOTATE_KEY, toggle.checked ? "1" : "0");
        location.reload();
      });
    }
  }

  /* ---------- 渲染：侧边栏 ---------- */
  function renderSidebar() {
    var mount = document.getElementById("sidebar");
    if (!mount) { return; }
    var me = identity();
    var page = document.body.dataset.page || qs.get("page") || "";

    var navHtml = NAV_GROUPS.map(function (group) {
      var items = group.items.filter(function (item) {
        return canSeeNav(item) || annotate;
      });
      if (!items.length) { return ""; }
      var links = items.map(function (item) {
        var visible = canSeeNav(item);
        var active = item.key === page ? " is-active" : "";
        var denied = !visible ? " is-denied" : "";
        var permAttr = item.superOnly ? "superuser" : (item.perm || "");
        return '<a class="nav__item' + active + denied + '" href="' + item.href + '"' +
          (permAttr ? ' data-perm-label="' + permAttr + '"' : "") + ">" +
          '<span class="nav__icon">' + icon(item.icon) + "</span>" +
          "<span>" + item.label + "</span>" +
          (item.meta && /^\d+$/.test(item.meta) ? '<span class="nav__meta">' + item.meta + "</span>" : "") +
          "</a>";
      }).join("");
      return '<div class="nav__group">' + group.title + "</div>" + links;
    }).join("");

    mount.className = "sidebar";
    mount.innerHTML =
      '<a class="brand" href="dashboard.html">' +
      '<span class="brand__mark">' + icon("sun", 20) + "</span>" +
      '<span class="brand__text"><b>辰光</b><i>AGENT 平台</i></span></a>' +
      '<nav class="nav" aria-label="主导航">' + navHtml + "</nav>" +
      '<div class="who">' +
      '<div class="who__avatar">' + me.name.slice(0, 1) + "</div>" +
      '<div class="who__meta"><b>' + me.name + "</b><span>" + me.roleLabel + " · " + permCountLabel() + "</span></div>" +
      '<button class="who__out" id="logout-btn" title="退出登录" aria-label="退出登录">' + icon("logout", 15) + "</button>" +
      "</div>";

    var logout = document.getElementById("logout-btn");
    if (logout) {
      logout.addEventListener("click", function () {
        sessionStorage.removeItem(ID_KEY);
        sessionStorage.removeItem(ANNOTATE_KEY);
        location.href = "login.html";
      });
    }
  }

  /* ---------- 渲染：顶栏 ---------- */
  function renderTopbar() {
    var mount = document.getElementById("topbar");
    if (!mount) { return; }
    var me = identity();
    var title = document.body.dataset.title || "";
    var group = document.body.dataset.group || "";
    var page = document.body.dataset.page || "";

    mount.className = "topbar";
    mount.innerHTML =
      '<button class="topbar__menu" id="menu-btn" aria-label="打开导航">' + icon("menu", 17) + "</button>" +
      '<nav class="crumbs" aria-label="面包屑">' +
      '<a href="dashboard.html">工作台</a>' +
      (group ? '<span class="sep">/</span><span>' + group + "</span>" : "") +
      (title ? '<span class="sep">/</span><span aria-current="page">' + title + "</span>" : "") +
      "</nav>" +
      '<div class="topbar__right">' +
      '<span class="scope"><span class="scope__dot"></span>当前身份 <b>' + me.name + " · " + me.roleLabel + "</b></span>" +
      '<a class="topbar__icon" href="#" title="通知" aria-label="通知">' + icon("bell", 17) + '<span class="dot"></span></a>' +
      "</div>";

    var menu = document.getElementById("menu-btn");
    var sidebar = document.getElementById("sidebar");
    var scrim = document.getElementById("scrim");
    if (menu && sidebar && scrim) {
      menu.addEventListener("click", function () {
        sidebar.classList.add("is-open");
        scrim.hidden = false;
      });
      scrim.addEventListener("click", function () {
        sidebar.classList.remove("is-open");
        scrim.hidden = true;
      });
    }
  }

  /* ---------- 按钮级权限 ---------- */
  function applyGates(root) {
    (root || document).querySelectorAll("[data-perm]").forEach(function (el) {
      var ok = has(el.getAttribute("data-perm"));
      el.classList.toggle("perm-allow", ok);
      if (!ok && el.tagName === "BUTTON") {
        el.setAttribute("aria-hidden", "true");
      } else {
        el.removeAttribute("aria-hidden");
      }
    });
  }

  function annotateNote() {
    if (!annotate) { return; }
    var page = document.querySelector(".content .page");
    if (!page || page.querySelector(".annotate-note")) { return; }
    var div = document.createElement("div");
    div.className = "annotate-note";
    div.innerHTML = "评审标注已开启：虚线元素为当前身份被隐藏的菜单或操作，右侧显示所需权限码。" +
      " <code>" + identity().roleLabel + " · " + permCountLabel() + "</code>";
    page.insertBefore(div, page.firstChild);
  }

  /* ---------- 对话框 / 提示 ---------- */
  var lastFocus = null;

  function openDialog(target) {
    var el = typeof target === "string" ? document.getElementById(target) : target;
    if (!el) { return; }
    lastFocus = document.activeElement;
    el.hidden = false;
    document.body.style.overflow = "hidden";
    var focusable = el.querySelector("input:not([disabled]), select, textarea, button");
    if (focusable) { setTimeout(function () { focusable.focus(); }, 40); }
  }

  function closeDialog(target) {
    var el = typeof target === "string" ? document.getElementById(target) : target;
    if (!el) { return; }
    el.hidden = true;
    document.body.style.overflow = "";
    if (lastFocus && lastFocus.focus) { lastFocus.focus(); }
  }

  function closeAllDialogs() {
    document.querySelectorAll(".dialog-backdrop:not([hidden])").forEach(function (el) {
      closeDialog(el);
    });
  }

  function toast(message, kind) {
    var host = document.getElementById("toasts");
    if (!host) {
      host = document.createElement("div");
      host.id = "toasts";
      host.className = "toasts";
      document.body.appendChild(host);
    }
    var item = document.createElement("div");
    item.className = "toast" + (kind ? " toast--" + kind : "");
    item.setAttribute("role", "status");
    item.textContent = message;
    host.appendChild(item);
    setTimeout(function () {
      item.classList.add("is-out");
      setTimeout(function () { item.remove(); }, 240);
    }, 3200);
  }

  /* ---------- 初始化 ---------- */
  function init() {
    if (!gatePage()) { return; }

    if (!document.getElementById("scrim")) {
      var scrim = document.createElement("div");
      scrim.id = "scrim";
      scrim.className = "scrim";
      scrim.hidden = true;
      document.body.appendChild(scrim);
    }

    renderProto();
    renderSidebar();
    renderTopbar();
    applyGates();
    annotateNote();

    document.addEventListener("click", function (e) {
      var opener = e.target.closest("[data-open-dialog]");
      if (opener) {
        e.preventDefault();
        openDialog(opener.getAttribute("data-open-dialog"));
        return;
      }
      var closer = e.target.closest("[data-close-dialog]");
      if (closer) {
        e.preventDefault();
        closeDialog(closer.closest(".dialog-backdrop"));
        return;
      }
      if (e.target.classList && e.target.classList.contains("dialog-backdrop")) {
        closeDialog(e.target);
        return;
      }
      var t = e.target.closest("[data-toast]");
      if (t) {
        e.preventDefault();
        toast(t.getAttribute("data-toast"), t.getAttribute("data-toast-kind") || "");
      }
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") {
        closeAllDialogs();
        var sidebar = document.getElementById("sidebar");
        var scrim = document.getElementById("scrim");
        if (sidebar && scrim && sidebar.classList.contains("is-open")) {
          sidebar.classList.remove("is-open");
          scrim.hidden = true;
        }
      }
    });
  }

  window.CG = {
    icon: icon,
    openDialog: openDialog,
    closeDialog: closeDialog,
    closeAllDialogs: closeAllDialogs,
    toast: toast,
    applyGates: applyGates,
    has: has,
    identity: identity,
    setIdentity: setIdentity,
    roleName: roleName,
    permCountLabel: permCountLabel,
    annotate: annotate,
    closeDialogs: closeAllDialogs
  };

  init();
})();
