(function () {
  const XT = {
    KEY: "vball2025",
    TEAMS: [
      ["12team", "12 Team"],
      ["13teal", "13 Teal"], ["13black", "13 Black"],
      ["14teal", "14 Teal"], ["14black", "14 Black"],
      ["15teal", "15 Teal"], ["15black", "15 Black"],
      ["16teal", "16 Teal"], ["16black", "16 Black"]
    ],
    COLORS: { teal: "#00b3b3", purple: "#5b4bff" },
  };

  // Inject base HTML structure
  const container = document.getElementById("xt-tryouts");
  if (!container) return;
  container.innerHTML = `
  <style>
    :root {--xt-teal:${XT.COLORS.teal};--xt-purple:${XT.COLORS.purple};}
    .xt-card{margin:0 30px 30px;padding:25px 20px;border-radius:18px;background:#fafafa;
             border:1px solid #eee;box-shadow:0 2px 6px rgba(0,0,0,.05);}
    .xt-card h3{margin:0;color:var(--xt-teal);font-size:22px;font-weight:700;}
    .xt-badge{background:linear-gradient(90deg,var(--xt-teal),var(--xt-purple));color:#fff;
              font-size:12px;font-weight:700;padding:6px 14px;border-radius:999px;text-transform:uppercase;}
    .xt-roster{display:flex;flex-wrap:wrap;gap:10px;background:#fff;border-radius:10px;
               border:1px solid #ddd;padding:10px 15px;}
    .xt-num{background:#eee;border-radius:6px;padding:6px 10px;cursor:pointer;
            user-select:none;transition:.2s;}
    .xt-num.accepted{background:linear-gradient(90deg,var(--xt-teal),var(--xt-purple));
                     color:#fff;font-weight:700;}
    .xt-admin-banner{display:none;margin:16px auto 0;max-width:950px;border-radius:14px;
                     padding:12px 16px;color:#fff;font-weight:700;text-align:center;
                     background:linear-gradient(90deg,var(--xt-teal),var(--xt-purple));
                     box-shadow:0 4px 12px rgba(0,0,0,.15);}
    .xt-move-wrap{display:inline-flex;align-items:center;gap:6px;margin-left:8px;}
    .xt-move-select{padding:4px 8px;border:1px solid #ddd;border-radius:8px;font-size:13px;}
    .xt-move-btn{padding:6px 10px;border:none;border-radius:999px;cursor:pointer;color:#fff;
                 font-weight:700;background:linear-gradient(90deg,var(--xt-teal),var(--xt-purple));}
    .xt-move-btn[disabled]{opacity:.55;cursor:not-allowed;}
  </style>
  <div id="xt-admin-banner" class="xt-admin-banner">
    ADMIN CONTROLS ACTIVE <small style="display:block;font-weight:500;opacity:.9;">
    Numbers clickable and Move controls enabled.</small>
  </div>
  <div id="editMode" style="display:none;">false</div>
  <div style="max-width:950px;margin:40px auto;background:#fff;border-radius:22px;
              box-shadow:0 6px 18px rgba(0,0,0,.1);overflow:hidden;">
    <div style="background:linear-gradient(90deg,var(--xt-teal),var(--xt-purple));
                color:#fff;padding:25px;font-size:28px;font-weight:700;text-align:center;">
      🏐 Ohio Xtreme Volleyball Tryout Results 2025
    </div>
    <div style="text-align:center;color:#444;margin:20px 30px 40px;font-size:16px;">
      Click a player number after they accept their spot — accepted = teal ✔.<br>
      Use “Move to Team” in the Waitlist section to fill open spots.<br>
      (Editable only when <strong>edit mode</strong> is on.)
    </div>
    <div id="xt-teams"></div>
    <div id="xt-waitlist"></div>
    <div style="background:linear-gradient(90deg,var(--xt-teal),var(--xt-purple));
                color:#fff;padding:25px;border-radius:0 0 22px 22px;text-align:center;">
      <h4 style="margin:0;font-size:20px;">Next Steps</h4>
      <p>Offers must be accepted by <strong>[Insert Date]</strong>.<br>
         Contact <strong>jamie@ohioxtreme.com</strong> for questions.</p>
    </div>
  </div>`;

  const editFlag = container.querySelector("#editMode");
  const isEdit = () => editFlag.textContent.trim().toLowerCase() === "true";
  const save = s => localStorage.setItem(XT.KEY, JSON.stringify(s));
  const load = () => JSON.parse(localStorage.getItem(XT.KEY) || '{"accepted":{},"moved":{}}');

  const state = load();

  // Build Teams
  const teamsHTML = XT.TEAMS.map(([id, label]) => `
    <div class="xt-card">
      <div style="display:flex;align-items:center;gap:12px;margin-bottom:10px;">
        <div class="xt-badge">${label.split(" ")[0]}</div><h3>${label.split(" ")[1]}</h3>
      </div>
      <div id="roster-${id}" class="xt-roster">
        ${Array.from({ length: 10 }, (_, i) => {
          const num = String(i + 1).padStart(2, "0");
          const key = `${id}|${num}`;
          return `<span class="xt-num${state.accepted[key] ? " accepted" : ""}" data-key="${key}">${num}</span>`;
        }).join("")}
      </div>
    </div>`).join("");
  container.querySelector("#xt-teams").innerHTML = teamsHTML;

  // Build Waitlist
  const waitHTML = `
    <div class="xt-card" style="background:#f0f0f0;border-color:#ddd;">
      <div style="display:flex;align-items:center;gap:12px;margin-bottom:10px;">
        <div class="xt-badge" style="background:gray;">Wait</div>
        <h3 style="color:#333;">Players on Waitlist</h3>
      </div>
      <div id="roster-waitlist" style="display:flex;flex-direction:column;gap:8px;">
        ${Array.from({ length: 10 }, (_, i) => {
          const n = String(i + 1).padStart(2, "0");
          const move = state.moved[`wait|${n}`];
          return `<div>
            <span class="xt-num" data-key="wait|${n}" style="opacity:${move ? 0.5 : 1}">${n}</span>
            <div class="xt-move-wrap">
              <select class="xt-move-select" id="sel-wait${n}">
                <option value="">Select Team</option>
                ${XT.TEAMS.map(([tid, lbl]) => `<option value="${tid}">${lbl}</option>`).join("")}
              </select>
              <button class="xt-move-btn" onclick="window.XTmove('wait|${n}','sel-wait${n}','${n}')">Move to Team</button>
            </div>
          </div>`;
        }).join("")}
      </div>
    </div>`;
  container.querySelector("#xt-waitlist").innerHTML = waitHTML;

  // Define globals for button actions
  window.XTtoggle = function (key) {
    if (!isEdit()) return;
    const el = document.querySelector(`[data-key="${key}"]`);
    if (!el) return;
    const s = load();
    s.accepted[key] = !s.accepted[key];
    el.classList.toggle("accepted", s.accepted[key]);
    save(s);
  };

  window.XTmove = function (waitKey, selId, num) {
    if (!isEdit()) return;
    const teamId = document.getElementById(selId).value;
    if (!teamId) return;
    const roster = document.getElementById("roster-" + teamId);
    if (!roster) return;
    if (document.querySelector(`[data-key="${teamId}|${num}"]`)) return;
    const span = document.createElement("span");
    span.className = "xt-num";
    span.dataset.key = `${teamId}|${num}`;
    span.textContent = num;
    span.onclick = () => XTtoggle(`${teamId}|${num}`);
    roster.appendChild(span);
    const w = document.querySelector(`[data-key="${waitKey}"]`);
    if (w) w.style.opacity = 0.5;
    const s = load();
    s.moved[waitKey] = { teamId, number: num };
    save(s);
  };

  window.XTreset = function () {
    if (!isEdit()) return;
    if (confirm("Clear all saved roster data?")) {
      localStorage.removeItem(XT.KEY);
      location.reload();
    }
  };

  // Add onclicks for roster numbers
  container.querySelectorAll(".xt-num").forEach(el => {
    const k = el.dataset.key;
    if (!k.startsWith("wait|")) el.onclick = () => XTtoggle(k);
  });

  // Show/hide admin tools
  const banner = container.querySelector("#xt-admin-banner");
  const moveWraps = container.querySelectorAll(".xt-move-wrap");
  banner.style.display = isEdit() ? "block" : "none";
  moveWraps.forEach(w => w.style.display = isEdit() ? "inline-flex" : "none");

  // Add Reset button
  if (isEdit()) {
    const btn = document.createElement("button");
    btn.textContent = "Reset All Data";
    btn.style.cssText = "margin:20px auto;display:block;background:linear-gradient(90deg,var(--xt-teal),var(--xt-purple));color:#fff;font-weight:700;border:none;padding:10px 18px;border-radius:999px;cursor:pointer;box-shadow:0 4px 10px rgba(0,0,0,0.15);";
    btn.onclick = window.XTreset;
    container.prepend(btn);
  }
})();
