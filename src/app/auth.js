// @ts-check
/* Authentication screens (login / register / recover). */
import { routes } from "./paths.js";
import { brandMarkSvg } from "../shared/components/ui.js";
import { escapeHtml } from "../shared/utils/format.js";
export function authPage(kind) {
  const config = {
    login: { title: "Welcome back", copy: "Sign in to access your projects and decision workspace.", button: "Sign In to Workspace →" },
    register: { title: "Create your account", copy: "Set up access to SYNASE AI.", button: "Create account" },
    forgot: { title: "Recover access", copy: "We’ll send recovery instructions if the account exists.", button: "Send instructions" }
  }[kind];
  return `<div class="auth-layout">
    <section class="auth-art">
      <div style="display:flex; justify-content:space-between; align-items:center; position:relative; z-index:2; margin-bottom:24px;">
        <a class="brand" href="landing.html">
          <span class="brand-mark">${brandMarkSvg()}</span>
          <span class="brand-copy"><strong>SYNASE AI</strong><span>Decision intelligence</span></span>
        </a>
        <a href="landing.html" style="font-size:12px; font-weight:600; color:var(--muted); display:flex; align-items:center; gap:6px;">← Back to Home</a>
      </div>
      <div class="auth-message">
        <div class="eyebrow" style="color:var(--cyan); letter-spacing:0.12em;">ENGINEERING DECISION PLATFORM</div>
        <h1 style="margin: 14px 0 16px;">Clear engineering decisions from idea to <span style="color:var(--muted);">production.</span></h1>
        <p>Connect your repositories, project specs, and team priorities. SYNASE AI audits system architecture, spots deployment risks, and provides verified decisions before you ship.</p>
        
        <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(170px, 1fr)); gap: 12px; margin-top: 28px;" class="auth-how-grid">
          <div style="padding:14px; border:1px solid var(--border); border-radius:0; background:var(--surface); backdrop-filter:blur(8px);">
            <div style="font-size:10px; font-family:monospace; color:var(--muted); font-weight:700; margin-bottom:4px;">01 CONNECT</div>
            <div style="font-size:13px; font-weight:700; margin-bottom:4px;">Code &amp; Specs</div>
            <div style="font-size:11px; color:var(--muted); line-height:1.4;">Securely inspects code repositories, PRDs, and task lists.</div>
            <div style="font-size:10px; font-family:monospace; color:var(--cyan); margin-top:8px; font-weight:600;">● Code Sync: Ready</div>
          </div>
          <div style="padding:14px; border:1px solid var(--border); border-radius:0; background:var(--surface); backdrop-filter:blur(8px);">
            <div style="font-size:10px; font-family:monospace; color:var(--muted); font-weight:700; margin-bottom:4px;">02 ANALYZE</div>
            <div style="font-size:13px; font-weight:700; margin-bottom:4px;">Smart Review</div>
            <div style="font-size:11px; color:var(--muted); line-height:1.4;">Evaluates code architecture, dependencies, and coverage.</div>
            <div style="font-size:10px; font-family:monospace; color:var(--primary); margin-top:8px; font-weight:600;">● Analysis: Active</div>
          </div>
          <div style="padding:14px; border:1px solid var(--border); border-radius:0; background:var(--surface); backdrop-filter:blur(8px);">
            <div style="font-size:10px; font-family:monospace; color:var(--muted); font-weight:700; margin-bottom:4px;">03 DELIVER</div>
            <div style="font-size:13px; font-weight:700; margin-bottom:4px;">Verified Action</div>
            <div style="font-size:11px; color:var(--muted); line-height:1.4;">Recommendations, risk alerts, and ready-to-use rollout plans.</div>
            <div style="font-size:10px; font-family:monospace; color:var(--positive); margin-top:8px; font-weight:600;">● Security: Verified</div>
          </div>
        </div>
      </div>
      <div style="font-size:11px; color:var(--subtle); display:flex; gap:16px; position:relative; z-index:2; margin-top:24px;">
        <span>SOC 2 Type II Certified</span><span>•</span><span>Enterprise Security</span><span>•</span><span>Private &amp; Encrypted</span>
      </div>
    </section>
    <main class="auth-panel"><section class="auth-card">
      <div class="eyebrow" style="color:var(--cyan);">Secure workspace access</div><h2>${config.title}</h2><p class="page-copy">${config.copy}</p>
      <form id="auth-form" data-kind="${kind}">
        ${kind === "register" ? `<div class="field"><label for="auth-name">Full name</label><input id="auth-name" name="name" autocomplete="name" required placeholder="Alex Turner"></div>` : ""}
        <div class="field"><label for="auth-email">Work Email</label><input id="auth-email" name="email" type="email" autocomplete="email" value="${kind === "login" ? "alex.turner@company.com" : ""}" placeholder="name@company.com" required></div>
        ${kind !== "forgot" ? `<div class="field"><label for="auth-password">Password</label><input id="auth-password" name="password" type="password" value="${kind === "login" ? "••••••••••••" : ""}" autocomplete="${kind === "login" ? "current-password" : "new-password"}" minlength="8" required></div>` : ""}
        <div id="auth-message"></div>
        <button class="button primary" type="submit" style="width:100%; margin-top:16px; padding:12px; font-weight:700; font-family:'Outfit',sans-serif;">${config.button}</button>
      </form>
      ${kind === "login" ? `
        <div style="margin: 16px 0; text-align: center; position: relative;">
          <div style="position: absolute; inset: 50% 0 0; border-top: 1px solid var(--border);"></div>
          <span style="position: relative; background: var(--surface); padding: 0 10px; font-size: 10px; font-family: monospace; color: var(--subtle); text-transform: uppercase;">or direct entry</span>
        </div>
        <button type="button" class="button" data-action="demo-login" style="width:100%; justify-content:center; background:var(--accent-tint); border-color:rgba(26,115,232,0.3); color:var(--text); font-weight:600;">Direct Demo Workspace Entry →</button>
      ` : ""}
      <div class="auth-links">
        ${kind !== "login" ? `<a href="?route=/auth/login">Sign in</a>` : `<a href="?route=/auth/register">Create account</a>`}
        ${kind !== "forgot" ? `<a href="?route=/auth/forgot-password">Forgot password?</a>` : ""}
      </div>
      <div style="margin-top:20px; padding-top:16px; border-top:1px solid var(--border); font-size:11px; text-align:center; color:var(--muted);">
        Need an enterprise account? <a href="landing.html#contact" style="color:var(--primary); font-weight:600;">Contact Us</a>
      </div>
    </section></main>
  </div>`;
}
