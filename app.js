"use strict";
const i18n=window.KinI18n;
const profiles=["kc868-a6-coprocessor","kc868-a6","kc868-a6-base","kc868-a4","kc868-a8","kc868-a8s","kc868-a16","kc868-a32","kc868-a64","kc868-a128"];
const $=id=>document.getElementById(id), profile=$("profile"), version=$("version"), installer=$("installer"), start=$("start");
profiles.forEach(p=>profile.add(new Option(p,p)));const params=new URLSearchParams(location.search);if(profiles.includes(params.get("profile")))profile.value=params.get("profile");
let catalog;
function refresh(){const release=catalog?.releases.find(r=>r.tag===version.value),entry=release?.profiles[profile.value];$("alias").hidden=!(!["kc868-a6","kc868-a6-coprocessor","kc868-a6-base"].includes(profile.value));installer.removeAttribute("manifest");start.disabled=true;
if(!entry){$("info").textContent=i18n.t("unavailable");return}
$("info").textContent=`${release.tag} · ${profile.value} · app ${(entry.firmwareBytes/1024).toFixed(1)} KiB · ${i18n.t("remaining")} ${(entry.otaRemainingBytes/1024).toFixed(1)} KiB · commit ${entry.commit.slice(0,10)}`;
$("download").href="https://github.com/RobertRupa/KinConductor/releases/tag/"+encodeURIComponent(release.tag);
installer.setAttribute("manifest",new URL(entry.manifest,location.href).href);start.disabled=!$("confirm").checked||!("serial" in navigator)}
[profile,version,$("confirm")].forEach(e=>e.addEventListener("change",refresh));
fetch("./catalog.json",{cache:"no-store"}).then(r=>{if(!r.ok)throw Error("HTTP "+r.status);return r.json()}).then(c=>{catalog=c;c.releases.forEach((r,i)=>version.add(new Option(r.tag+(i===0?` (${i18n.t("latest")})`:""),r.tag)));if(c.releases.some(r=>r.tag===params.get("version")))version.value=params.get("version");refresh()}).catch(e=>{$("info").textContent=i18n.t("fetchError")+e.message});
i18n.onChange(()=>{ if(catalog){Array.from(version.options).forEach((opt,i)=>{opt.textContent=opt.value+(i===0?` (${i18n.t("latest")})`:"")});refresh();}else if(!version.options.length){$("info").textContent=i18n.t("loading");}});
